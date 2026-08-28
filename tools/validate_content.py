#!/usr/bin/env python3
"""Fail if graph-structure.json and content/<lang>.json have drifted apart —
a $text path referenced in structure with no matching content key (or vice
versa) in any language. Meant for a pre-push hook (see .githooks/), same
spirit as the existing RU/EN-completeness guarantee graph.json used to give
for free by keeping {ru, en} pairs inline.

Doesn't touch graph.json itself — see tools/build_graph.py for that.
"""
import json
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
STRUCTURE_PATH = REPO_ROOT / "app" / "graph_src" / "graph-structure.json"
CONTENT_DIR = REPO_ROOT / "app" / "graph_src" / "content"
LANGS = ("ru", "en")


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


def main():
    if not STRUCTURE_PATH.exists():
        print(f"no {STRUCTURE_PATH} — nothing to validate (pre-split project state)")
        return 0

    structure = json.loads(STRUCTURE_PATH.read_text(encoding="utf-8"))
    structure_paths = set()
    collect_text_paths(structure, structure_paths)

    ok = True
    content = {}
    for lang in LANGS:
        p = CONTENT_DIR / f"{lang}.json"
        if not p.exists():
            print(f"MISSING content file: {p}", file=sys.stderr)
            ok = False
            continue
        content[lang] = json.loads(p.read_text(encoding="utf-8"))

        missing = structure_paths - content[lang].keys()
        orphaned = content[lang].keys() - structure_paths

        if missing:
            ok = False
            print(f"[{lang}] {len(missing)} path(s) referenced in structure but missing from content/{lang}.json:", file=sys.stderr)
            for path in sorted(missing)[:20]:
                print(f"  - {path}", file=sys.stderr)
            if len(missing) > 20:
                print(f"  ... and {len(missing) - 20} more", file=sys.stderr)

        if orphaned:
            ok = False
            print(f"[{lang}] {len(orphaned)} path(s) in content/{lang}.json no longer referenced by structure:", file=sys.stderr)
            for path in sorted(orphaned)[:20]:
                print(f"  - {path}", file=sys.stderr)
            if len(orphaned) > 20:
                print(f"  ... and {len(orphaned) - 20} more", file=sys.stderr)

    # Cross-language check: every language should cover the same key set as
    # the first one loaded (redundant with the structure-diff checks above
    # in the common case, but catches ru/en drifting from EACH OTHER without
    # drifting from structure, which shouldn't be possible but is cheap to
    # confirm directly).
    if len(content) == len(LANGS):
        key_sets = {lang: set(c.keys()) for lang, c in content.items()}
        base_lang, base_keys = next(iter(key_sets.items()))
        for lang, keys in key_sets.items():
            if keys != base_keys:
                ok = False
                print(f"content/{lang}.json and content/{base_lang}.json have different key sets", file=sys.stderr)

    if ok:
        print(f"OK: {len(structure_paths)} text paths, all present in {', '.join(f'content/{l}.json' for l in LANGS)}")
        return 0
    return 1


if __name__ == "__main__":
    sys.exit(main())
