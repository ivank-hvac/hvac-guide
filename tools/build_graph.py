#!/usr/bin/env python3
"""Rebuild app/static/graph.json from app/graph_src/graph-structure.json +
app/graph_src/content/<lang>.json.

Run this after editing structure or content — graph.json itself is a
generated artifact now (still committed to git, so the Docker build and
Docker Compose default path stay exactly as before; nothing about how the
app is served or deployed changes because of this split).

graph_src/ lives OUTSIDE app/static/ on purpose — see the comment at the
top of tools/split_graph_content.py for why (static/ is an open,
unauthenticated mount; graph.json is deliberately gated separately).

Reconstructs the exact original graph.json shape: every {"$text": "<path>"}
marker in the structure becomes {"ru": content_ru[path], "en": content_en[path]}
again — semantically identical to (verified by deep equality against) the
hand-edited file this was split from, though not byte-identical: plain
json.dumps can't reproduce the original's mixed compact/expanded
formatting, so every regeneration reformats the whole file. Content is
what's guaranteed equal, not whitespace. This is deliberate for this first
step — see CLAUDE.md "Structure/content split" for why the runtime isn't
touched yet.

See also tools/validate_content.py, which checks structure and content stay
in sync WITHOUT rebuilding anything — run that in a pre-push hook; run this
script by hand (or from the same hook) whenever you actually want graph.json
regenerated.
"""
import json
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
GRAPH_PATH = REPO_ROOT / "app" / "static" / "graph.json"
STRUCTURE_PATH = REPO_ROOT / "app" / "graph_src" / "graph-structure.json"
CONTENT_DIR = REPO_ROOT / "app" / "graph_src" / "content"


def rebuild(obj, content):
    if isinstance(obj, dict):
        if set(obj.keys()) == {"$text"}:
            path = obj["$text"]
            try:
                return {"ru": content["ru"][path], "en": content["en"][path]}
            except KeyError as e:
                print(f"missing content for path {path!r} (lang {e})", file=sys.stderr)
                sys.exit(1)
        return {k: rebuild(v, content) for k, v in obj.items()}
    if isinstance(obj, list):
        return [rebuild(v, content) for v in obj]
    return obj


def main():
    structure = json.loads(STRUCTURE_PATH.read_text(encoding="utf-8"))
    content = {
        lang: json.loads((CONTENT_DIR / f"{lang}.json").read_text(encoding="utf-8"))
        for lang in ("ru", "en")
    }
    graph = rebuild(structure, content)
    GRAPH_PATH.write_text(
        json.dumps(graph, ensure_ascii=False, indent=1) + "\n",
        encoding="utf-8",
    )
    print(f"wrote {GRAPH_PATH.relative_to(REPO_ROOT)}")


if __name__ == "__main__":
    main()
