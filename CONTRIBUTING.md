# Contributing

Thanks for looking. This is a personal project by an HVAC/R enthusiast, so
the most valuable contributions are usually not code.

## What helps most

**Field corrections.** If a question in the graph is wrong, misleading, or
sends a technician looking for a part their equipment doesn't have, that is
the highest-value report there is — more than any refactor. Open an issue
saying what equipment you were on, what the tool asked, and what it should
have asked instead.

**Coverage gaps.** Symptoms or failure modes the graph doesn't reach at all.

**Terminology.** The interface is bilingual (English / Russian) and aims at
how technicians actually speak in the field in North America, not at literal
translation. Corrections from people who work in either language are welcome.

## Two principles the content follows

Read these before proposing content changes — they explain why some
seemingly helpful additions get turned down:

1. **The technician draws the conclusion, not the tool.** Nodes ask about
   observable facts and point at where to look next; they deliberately avoid
   handing over a finished diagnosis or a pick-list of failure modes. The
   reason is pedagogical: a tool that names the answer stops technicians from
   building their own judgement.
2. **Advice must match the equipment class.** A receiver, a king valve or a
   field-adjustable pressure switch does not exist on a typical RTU, and
   telling someone to check one destroys trust at the exact moment they are
   relying on the tool. Where advice only applies to some equipment, the
   graph splits it (see `nextByEquipment` in `app/static/graph.json`).

## Working on the graph

Most content lives in `app/static/graph.json`, and no rebuild is needed to
edit it — see the README's "Editing the question graph" section, which
documents the node types. `tools/visualize_graph.py` renders the graph to a
Mermaid diagram, which is the fastest way to see what a change does to the
paths.

## Code changes

Keep pull requests small and focused, and say what you tested. There is no
CI: changes are verified by walking the affected paths in a browser against
a local deployment (`docker compose up -d --build`), and that is what a PR
description should describe.

Note that this repository is a mirror — development happens on a self-hosted
Forgejo instance and is pushed here. Pull requests are welcome and will be
applied by hand upstream, so the merge commit you see may not be the one you
opened.

## Scope

The project covers troubleshooting — finding and confirming the fault. It
deliberately stops short of repair procedures, and of ultra-low-temperature
refrigeration. Proposals that extend it in those directions are a
conversation to have in an issue first.
