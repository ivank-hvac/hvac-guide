#!/usr/bin/env python3
"""One-time migration: split app/static/graph.json into a structure file
(no text) plus per-language content files, keyed by JSON path.

Run once to produce app/graph_src/graph-structure.json +
app/graph_src/content/{ru,en}.json from the current hand-edited graph.json.
After this, graph.json becomes a generated artifact — see
tools/build_graph.py, which does the reverse (structure + content ->
graph.json) and is what you actually run after editing content going
forward.

graph_src/ lives OUTSIDE app/static/ deliberately: static/ is served by an
open, unauthenticated StaticFiles mount (see main.py), while graph.json
itself is pulled out of that mount into its own gated route specifically
because it's the product, not UI plumbing. Shipping the split source files
inside static/ would silently defeat that gate — anyone could reconstruct
the full graph from graph-structure.json + content/*.json without ever
hitting the auth-checked /graph.json route.

A "text leaf" is any dict whose keys are exactly a subset of {ru, en} with
both present and non-empty (same convention already used by the CLAUDE.md
RU/EN-completeness check) — e.g. {"ru": "...", "en": "..."}. Everywhere one
of these appears, the structure file gets {"$text": "<json-path>"} in its
place, and each content file gets {"<json-path>": "<string>"}.

The JSON path is the literal walk from the document root, e.g.
"nodes.start.text" or "nodes.start.options[0].label" — stable, readable,
and trivially diffable when content changes without touching structure.
"""
import json
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
GRAPH_PATH = REPO_ROOT / "app" / "static" / "graph.json"
STRUCTURE_PATH = REPO_ROOT / "app" / "graph_src" / "graph-structure.json"
CONTENT_DIR = REPO_ROOT / "app" / "graph_src" / "content"


def is_text_leaf(obj):
    if not isinstance(obj, dict):
        return False
    if not obj.keys() <= {"ru", "en"}:
        return False
    return bool(obj.get("ru")) and bool(obj.get("en"))


def split(obj, path, content):
    """Return the structure-side replacement for obj, writing any text
    leaves found (at or below it) into content[lang][path]."""
    if is_text_leaf(obj):
        for lang in ("ru", "en"):
            content[lang][path] = obj[lang]
        return {"$text": path}
    if isinstance(obj, dict):
        return {k: split(v, f"{path}.{k}" if path else k, content) for k, v in obj.items()}
    if isinstance(obj, list):
        return [split(v, f"{path}[{i}]", content) for i, v in enumerate(obj)]
    return obj


def main():
    if STRUCTURE_PATH.exists():
        print(f"refusing to overwrite existing {STRUCTURE_PATH}", file=sys.stderr)
        print("(this is a one-time migration script — delete the existing "
              "structure/content files first if you really mean to redo it)",
              file=sys.stderr)
        sys.exit(1)

    graph = json.loads(GRAPH_PATH.read_text(encoding="utf-8"))
    content = {"ru": {}, "en": {}}
    structure = split(graph, "", content)

    CONTENT_DIR.mkdir(parents=True, exist_ok=True)
    STRUCTURE_PATH.write_text(
        json.dumps(structure, ensure_ascii=False, indent=1, sort_keys=False) + "\n",
        encoding="utf-8",
    )
    for lang in ("ru", "en"):
        (CONTENT_DIR / f"{lang}.json").write_text(
            json.dumps(content[lang], ensure_ascii=False, indent=1, sort_keys=True) + "\n",
            encoding="utf-8",
        )

    print(f"wrote {STRUCTURE_PATH.relative_to(REPO_ROOT)}")
    for lang in ("ru", "en"):
        print(f"wrote {(CONTENT_DIR / f'{lang}.json').relative_to(REPO_ROOT)} "
              f"({len(content[lang])} strings)")


if __name__ == "__main__":
    main()
