#!/usr/bin/env python3
"""Build the trimmed PUBLIC demo graph (RTU + Split + Chiller, Tier 1 only)
from the full private-repo content at app/graph_src/ (a maintainer-only
nested clone — see CLAUDE.md "Приватный репо для полного графа").

This is Stage 3 of the public/private graph split: Stage 2 removed the
full graph from this public repo entirely, which meant a fresh clone had
no app/static/graph.json at all and the README "3 commands" self-host
story was actually broken. This script produces a small, freely
shareable replacement.

Reads:
  app/graph_src/graph-structure.json + content/{ru,en}.json   (full graph)

Writes, all tracked in THIS public repo (not gitignored — this is the
whole point, it's the thing self-hosters get instead of the real graph):
  app/graph_demo_src/graph-structure.json + content/{ru,en}.json
      — the demo's own structure/content split, same shape/convention as
        app/graph_src/, kept human-readable and re-diffable rather than
        shipping only an opaque built graph.demo.json.
  app/static/graph.demo.json
      — the demo's built artifact. Dockerfile falls back to copying this
        to static/graph.json at image-build time when a fresh clone has
        no real graph.json on disk yet (see Dockerfile) — self-host stays
        exactly "docker compose up", no extra manual step.

Run by hand after the private repo's content changes enough to be worth
re-trimming. NOT part of every deploy (unlike tools/sync-graph-content.sh,
which handles the real graph.json prod actually serves) — this only
touches the small public subset.

Trimming logic:
  - start's options are filtered to equipment in DEMO_EQUIPMENT — this is
    the only place `equipment` gates visibility; everywhere else it's
    just session-classification metadata (see app.js equipmentKey()),
    not a routing mechanism.
  - Any node tagged "tier": 2 or 3 is dropped, and the drop cascades: a
    node whose EVERY remaining navigation target is itself dropped
    becomes a dead end and gets dropped too (e.g. hgbp_erratic isn't
    tier-tagged directly, but both its options only ever lead to tier-2
    results, so once those are gone it has nothing left to offer).
  - intake_checklist and component_checks are copied wholesale, no
    equipment/tier scoping — neither is gated by either today (verified:
    no "tier" field appears outside the 3 hgbp_* result nodes), and
    scoping them would be new unbuilt machinery, not a data operation.
  - Fails loudly (non-zero exit) rather than silently shipping a broken
    demo if any surviving question-type node ends up with zero options —
    that would mean a bug in this script, not a valid graph shape.
"""
import copy
import json
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
FULL_STRUCTURE_PATH = REPO_ROOT / "app" / "graph_src" / "graph-structure.json"
FULL_CONTENT_DIR = REPO_ROOT / "app" / "graph_src" / "content"
DEMO_STRUCTURE_PATH = REPO_ROOT / "app" / "graph_demo_src" / "graph-structure.json"
DEMO_CONTENT_DIR = REPO_ROOT / "app" / "graph_demo_src" / "content"
DEMO_GRAPH_PATH = REPO_ROOT / "app" / "static" / "graph.demo.json"

DEMO_EQUIPMENT = {"rtu", "split", "chiller"}
# Non-node navigation markers app.js resolves itself (return-to-intake-
# checklist, redirect-through-start) — never real node ids, never excluded.
SENTINELS = {"__intake_return__", "__pending__"}
LANGS = ("ru", "en")


def raw_targets(node):
    """Every next-target string written on a node, wherever the app looks
    for one: a direct top-level "next" (measurement/pt_calc/... nodes),
    options[].next / options[].nextByEquipment (question nodes), or
    blocks[].options[].next / .nextByEquipment (dual_pressure_check)."""
    out = []
    if isinstance(node.get("next"), str):
        out.append(node["next"])
    for opt in node.get("options", []):
        if "next" in opt:
            out.append(opt["next"])
        if "nextByEquipment" in opt:
            out.extend(opt["nextByEquipment"].values())
    for block in node.get("blocks", []):
        for opt in block.get("options", []):
            if "next" in opt:
                out.append(opt["next"])
            if "nextByEquipment" in opt:
                out.extend(opt["nextByEquipment"].values())
    return out


def compute_tier_excluded(nodes):
    excluded = {nid for nid, n in nodes.items() if (n.get("tier") or 1) > 1}
    changed = True
    while changed:
        changed = False
        for nid, n in nodes.items():
            if nid in excluded:
                continue
            targets = [t for t in raw_targets(n) if t not in SENTINELS]
            if not targets:
                continue  # result/ai_prompt/etc: no navigation, never cascade-excluded
            if all(t in excluded for t in targets):
                excluded.add(nid)
                changed = True
    return excluded


def _filter_option_list(nid, opts, tier_excluded, enqueue):
    def target_ok(t):
        return t in SENTINELS or t not in tier_excluded

    for opt in list(opts):
        if nid == "start" and opt.get("equipment") not in DEMO_EQUIPMENT:
            opts.remove(opt)
            continue
        if "next" in opt:
            if not target_ok(opt["next"]):
                opts.remove(opt)
                continue
            enqueue(opt["next"])
        elif "nextByEquipment" in opt:
            kept = {
                k: v
                for k, v in opt["nextByEquipment"].items()
                if (k == "default" or k in DEMO_EQUIPMENT) and target_ok(v)
            }
            if not kept:
                opts.remove(opt)
                continue
            opt["nextByEquipment"] = kept
            for v in kept.values():
                enqueue(v)


def prune_and_enqueue(nid, node, tier_excluded, enqueue):
    if isinstance(node.get("next"), str):
        enqueue(node["next"])
    if "options" in node:
        _filter_option_list(nid, node["options"], tier_excluded, enqueue)
    for block in node.get("blocks", []):
        if "options" in block:
            _filter_option_list(nid, block["options"], tier_excluded, enqueue)


def build_demo_nodes(full_nodes):
    tier_excluded = compute_tier_excluded(full_nodes)
    demo_nodes = {}
    queue = ["start"]
    seen = set()
    while queue:
        nid = queue.pop(0)
        if nid in seen or nid in tier_excluded:
            continue
        seen.add(nid)
        node = copy.deepcopy(full_nodes[nid])
        demo_nodes[nid] = node
        prune_and_enqueue(nid, node, tier_excluded, queue.append)

    for nid, node in demo_nodes.items():
        if node.get("type") == "question" and not node.get("options"):
            sys.exit(
                f"build_demo_graph: {nid!r} has zero options left after "
                "pruning — bug in the trim logic, not a valid graph shape"
            )

    return demo_nodes


def collect_text_paths(obj, paths):
    if isinstance(obj, dict):
        if set(obj.keys()) == {"$text"}:
            paths.add(obj["$text"])
            return
        for v in obj.values():
            collect_text_paths(v, paths)
    elif isinstance(obj, list):
        for v in obj:
            collect_text_paths(v, paths)


def rebuild_with_content(obj, content):
    if isinstance(obj, dict):
        if set(obj.keys()) == {"$text"}:
            path = obj["$text"]
            try:
                return {"ru": content["ru"][path], "en": content["en"][path]}
            except KeyError as e:
                sys.exit(f"missing demo content for path {path!r} (lang {e})")
        return {k: rebuild_with_content(v, content) for k, v in obj.items()}
    if isinstance(obj, list):
        return [rebuild_with_content(v, content) for v in obj]
    return obj


def main():
    full_structure = json.loads(FULL_STRUCTURE_PATH.read_text(encoding="utf-8"))
    full_content = {
        lang: json.loads((FULL_CONTENT_DIR / f"{lang}.json").read_text(encoding="utf-8"))
        for lang in LANGS
    }

    demo_nodes = build_demo_nodes(full_structure["nodes"])
    demo_structure = {
        "start": full_structure["start"],
        "intake_checklist": copy.deepcopy(full_structure["intake_checklist"]),
        "component_checks": copy.deepcopy(full_structure["component_checks"]),
        "nodes": demo_nodes,
    }

    text_paths = set()
    collect_text_paths(demo_structure, text_paths)
    demo_content = {
        lang: {path: full_content[lang][path] for path in text_paths} for lang in LANGS
    }

    DEMO_CONTENT_DIR.mkdir(parents=True, exist_ok=True)
    DEMO_STRUCTURE_PATH.write_text(
        json.dumps(demo_structure, ensure_ascii=False, indent=1, sort_keys=False) + "\n",
        encoding="utf-8",
    )
    for lang in LANGS:
        (DEMO_CONTENT_DIR / f"{lang}.json").write_text(
            json.dumps(demo_content[lang], ensure_ascii=False, indent=1, sort_keys=True) + "\n",
            encoding="utf-8",
        )

    demo_graph = rebuild_with_content(demo_structure, demo_content)
    DEMO_GRAPH_PATH.write_text(
        json.dumps(demo_graph, ensure_ascii=False, indent=1) + "\n",
        encoding="utf-8",
    )

    print(
        f"demo graph: {len(demo_nodes)}/{len(full_structure['nodes'])} nodes kept, "
        f"{len(text_paths)} text paths -> "
        f"{DEMO_STRUCTURE_PATH.relative_to(REPO_ROOT)}, "
        f"{DEMO_CONTENT_DIR.relative_to(REPO_ROOT)}/, "
        f"{DEMO_GRAPH_PATH.relative_to(REPO_ROOT)}"
    )


if __name__ == "__main__":
    main()
