#!/usr/bin/env python3
"""
Визуализация graph.json как Mermaid-флоучарт. Только для личного использования
разработчика — не часть продукта, не попадает в Docker-образ (Dockerfile
копирует только app/, этот файл живёт в tools/ в корне репо).

Использование:
    python3 tools/visualize_graph.py app/static/graph.json > full.mmd
    python3 tools/visualize_graph.py app/static/graph.json --root nc_start > nc_start.mmd

Просмотр:
    1. Открыть https://mermaid.live и вставить содержимое .mmd — самый простой способ.
    2. Либо экспорт в SVG/PNG без установки чего-либо:
       npx -y @mermaid-js/mermaid-cli -i full.mmd -o full.svg

Весь граф (77+ узлов) в одной картинке будет плотным — используйте --root,
чтобы посмотреть конкретную ветку (например nc_start, hp_start, hgbv_start,
ws_start и т.д. — id любого узла из graph.json).
"""
import json
import re
import argparse


def sid(node_id: str) -> str:
    """Mermaid-safe id."""
    return re.sub(r"[^a-zA-Z0-9_]", "_", node_id)


def text_of(value, lang: str = "en") -> str:
    """Продуктовый контент двуязычный ({"ru": ..., "en": ...}) — берём один язык."""
    if isinstance(value, dict):
        return value.get(lang) or value.get("ru") or value.get("en") or ""
    return value or ""


def trunc(text: str, n: int = 40) -> str:
    text = text.replace('"', "'").replace("\n", " ")
    return text if len(text) <= n else text[: n - 1] + "…"


def option_targets(opt: dict) -> list:
    """
    Куда ведёт вариант ответа: [(node_id, суффикс подписи), ...].

    Обычно один переход по `next`, но вариант может ветвиться по типу
    оборудования (`nextByEquipment` — см. app.js resolveOptionNext): тогда
    рёбер несколько, и в подписи указывается, для какого оборудования.
    """
    by_equipment = opt.get("nextByEquipment")
    if by_equipment:
        return [
            (target, "" if key == "default" else f" [{key}]")
            for key, target in by_equipment.items()
        ]
    return [(opt["next"], "")]


def reachable(nodes: dict, root: str) -> set:
    """BFS от root по всем переходам вариантов — для --root фильтра."""
    seen, stack = set(), [root]
    while stack:
        cur = stack.pop()
        if cur in seen or cur not in nodes:
            continue
        seen.add(cur)
        node = nodes[cur]
        if node.get("type") == "question":
            for opt in node.get("options", []):
                stack.extend(target for target, _ in option_targets(opt))
    return seen


SEVERITY_STYLE = {
    "critical": "fill:#3a1616,stroke:#ff5d5d,color:#fff",
    "warning": "fill:#3a2f10,stroke:#f0b429,color:#fff",
    "info": "fill:#16233a,stroke:#4fb3ff,color:#fff",
}


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("graph_path", help="Путь к graph.json")
    ap.add_argument("--root", help="Показать только поддерево, достижимое из этого узла")
    ap.add_argument("--lang", default="en", choices=["en", "ru"], help="Язык подписей (по умолчанию en)")
    args = ap.parse_args()

    with open(args.graph_path, encoding="utf-8") as f:
        data = json.load(f)
    nodes = data["nodes"]

    include = reachable(nodes, args.root) if args.root else set(nodes.keys())

    lines = ["flowchart TD"]

    for node_id in include:
        node = nodes[node_id]
        nid = sid(node_id)
        label = trunc(text_of(node.get("text", node_id), args.lang))
        ntype = node.get("type")

        if ntype == "question":
            lines.append(f'    {nid}["{label}"]')
        elif ntype == "ai_prompt":
            lines.append(f'    {nid}{{{{"{label}"}}}}')
        else:  # result
            lines.append(f'    {nid}(("{label}"))')
            sev = node.get("severity", "info")
            lines.append(f"    style {nid} {SEVERITY_STYLE.get(sev, SEVERITY_STYLE['info'])}")

        if ntype == "question":
            for opt in node.get("options", []):
                for target, suffix in option_targets(opt):
                    if target in include:
                        opt_label = trunc(text_of(opt["label"], args.lang), 30) + suffix
                        lines.append(f'    {nid} -->|"{opt_label}"| {sid(target)}')

    root_id = args.root or data.get("start", "start")
    lines.append(f"    Start((Старт)) --> {sid(root_id)}")

    print("\n".join(lines))


if __name__ == "__main__":
    main()
