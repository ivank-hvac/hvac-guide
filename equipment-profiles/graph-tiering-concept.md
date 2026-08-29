# Graph tiering — concept (not implemented)

Scratch design doc, same spirit as the other files in this directory: not
wired into the app. Written 28 Aug 2026 at Ivan's request ("разметка графа,
можно начинать. сначала концепт, потом деплой") — this is the concept half;
nothing in `graph-structure.json` has been touched yet. Waiting on Ivan's
read of this before doing the actual tagging pass.

## What this is for

CLAUDE.md's core/pro plan ("СЛЕДУЮЩЕЕ — план выхода в паблик", item 3) says
the eventual free/pro split should follow the Tier 1/2/3 complexity boundary
already written up in `equipment-profiles/*.md` — publish Tier 1 (basic) for
free, gate Tier 2/3 (tandem compressors, multiple circuits, VFD, EEVs,
multiplex racks, receivers/king-queen valves, etc.) behind pro. Ivan called
this "в приоритет" on 28 Aug. What's missing is the connecting piece: the
graph itself has no notion of tier at all yet — nothing says which result
node's advice assumes Tier 2/3 equipment. This doc proposes that mechanism
and a first concrete pass at applying it.

**Scope of this pass, explicitly**: mark the data, nothing else. No
enforcement, no paywall, no billing, no UI change, no behavior change for
any user. Purely descriptive metadata that a future gating pass would read.
Same relationship `equipment` tags on `start`'s options had to
`nextByEquipment` before that mechanism existed — the tag can sit there
unused for a while without doing anything.

## Mechanism

- New optional field `"tier": 2` (or `3`) on **result nodes only**, living
  in `graph-structure.json` (it's a number, not translatable text, so it
  doesn't belong in `content/{ru,en}.json`).
- **Absent = tier 1.** Only the nodes that actually need bumping get
  touched — no mass migration touching all 101 nodes, and anything added to
  the graph later is free-tier by default unless someone deliberately marks
  it otherwise (matches "basic tier always free, no exceptions").
- **Question nodes are never tagged.** This follows directly from the
  already-decided core/pro principle in CLAUDE.md: "механизм/дисциплина
  диагностики ... — всегда бесплатно... Тирится глубокая диагностическая
  экспертиза в result-узлах." A question that offers "tandem compressor"
  as one of several answer options is just the intake process asking the
  right thing — same free discipline as everything else. Only the actual
  **advice/diagnosis text** at a result node is the thing being gated. A
  free-tier user can walk the whole question chain; they'd only hit a
  paywall at the specific result node itself, if it's tagged.
- Implementation once the list below is agreed: hand-edit the `tier` field
  onto the identified nodes in `graph-structure.json`, rerun
  `tools/build_graph.py`, verify semantic equality on everything except the
  new field, deploy. Same low-risk mechanics as the `nc_sc_high` wording fix
  from the 27 Aug audit — a content-only change, no code changes needed for
  *this* pass (the field just sits there unread by anything yet).

## Why this is a much smaller task than it sounds

The 27 Aug graph audit (see CLAUDE.md "0. ✅ АУДИТ ПРОВЕДЁН") already did
the hard part for a different reason (chiller/RTU content leaking into
universal advice) — it built a BFS reachability map per equipment type and
found: 35 result nodes are genuinely universal (reachable from 2+ equipment
types, audited clean of any single-equipment-type assumption), and 9 are
already structurally isolated to one equipment type (6 furnace, 3 chiller
hot-gas-bypass). That separation is *exactly* the input tiering needs — a
node already isolated to "only reachable when equipment = chiller" is a
tiering candidate by construction; a node in the 35-strong universal set is
Tier 1 by construction (equipment-profiles' own Tier 1 lists are "what's
present on basically everything," which is what "reachable from any
equipment type" already means). So this pass is mostly "which of the
already-isolated equipment-specific branches count as Tier 2/3 per the
profile docs," not a fresh read of all 101 nodes.

## First-pass candidate list

Checked each candidate directly against the actual tier headings in the
relevant profile file (`grep -n "^## Tier"` plus reading the surrounding
text) rather than assuming — two of my first guesses turned out to be
unfounded once checked, see below.

**Receiver / king-queen valve — `lp_rapid_trip_result_receiver` (result).**
Reachable only via `lp_stable_check`'s `nextByEquipment` for
`chiller`/`refrigeration`; its RTU sibling, `lp_rapid_trip_result_rtu`,
already stays separate (RTU has no receiver at all — that's the original 9
Aug bugfix this split came from, see CLAUDE.md "Баг-фикс: тупиковый путь в
lp_start"). **Caveat**: `chiller.md` doesn't actually mention receivers or
king/queen valves by name anywhere — I don't have a clean tier citation for
this one from the profile doc itself, only the general "industrial/
receiver-based, not present on RTU" framing from the original bugfix. Best
guess is Tier 2 or 3 by that framing, but this is a judgment call, not
something I can point at a specific line for.

**Hot gas bypass — `hgbp_lowload`, `hgbp_mechanical`, `hgbp_tuning`
(results; `hgbp_start`/`hgbp_erratic` are questions, not tagged).**
Reachable only via `chiller_symptom` — structurally chiller-only already,
so a legitimate tagging candidate on that basis alone. **Caveat, same as
above**: `chiller.md` doesn't mention hot gas bypass at all. Tier 3 lists
"screw compressor(s)... sometimes VFD-driven for true capacity modulation"
as the mechanism that competes with HGBP for exactly this purpose (false-
loading/capacity control at low load), which points toward Tier 2-3, but
I'm not confident enough to assign a number without Ivan's read — this is
squarely his domain knowledge, not something derivable from what's written.

**EEV — NOT proposed for tagging, and here's why this candidate breaks the
whole flat-tier-field idea.** Checked all four metering-device profiles
that mention EEV, expecting a consistent "EEV = advanced" story. It isn't
one:
- `rtu.md`: EEV "rare at this tier" (Tier 1) → implies RTU Tier 2+.
- `split.md`: EEV listed explicitly under **Tier 2**.
- `chiller.md`: EEV "less common at this tier, but present" *at Tier 1* —
  not cleanly gated by tier at all for chillers.
- `vrf.md`: EEV listed under **Tier 1** — "universal at this category,
  unlike split" — i.e. EEV is completely baseline/expected content for
  VRF, not an advanced feature.

  The `eev_*` nodes live inside `component_checks.metering_device`, which
  is **one shared mini-graph reachable from any equipment type** — it has
  no idea whether the tech arrived there via RTU, split, or VRF. A flat
  per-node `tier` field can't express "this content is Tier 2 for a split
  tech but Tier 1/baseline for a VRF tech" — tagging `eev_*` as Tier 2
  would incorrectly paywall completely standard content for every VRF
  user, which directly violates "basic tier always free." Tagging it Tier
  1 would under-gate it for RTU. There's no single correct answer with the
  mechanism this doc proposes. Left untagged (Tier 1 by default) for this
  pass — see open question 2 below.

**Checked and confirmed NOT tagging:**
- Furnace (`gas_*`, 12 nodes) — checked against `furnace.md`'s actual Tier
  2/3 items (multi-stage/modulating gas valve, communicating ignition
  control, communicating thermostat bus). None of the current `gas_*`
  nodes assume any of that — they're single-stage, standing-electronic-
  ignition content throughout, which `furnace.md` places at Tier 1.
  Nothing to tag here **yet**; if multi-stage/modulating furnace content
  gets added to the graph later, that would be a Tier 2 candidate then,
  not now.
- All 35 result nodes the 27 Aug audit found genuinely universal (reachable
  from 2+ equipment types) — Tier 1 by the reasoning above, left untagged.

## Open questions for Ivan (not decided here)

1. **Tier numbers for the two chiller-only candidates above** (hot gas
   bypass, receiver/king-queen valve) — `chiller.md` doesn't cover either
   by name, so I don't have a citation to point at, only a guess. Worth
   either Ivan assigning a number directly, or adding a line to
   `chiller.md` about where HGBP/receivers fall so future tiering has
   something to check against instead of relying on a guess again.
2. **The EEV problem is the one that actually matters most here**: does
   this mean tiering eventually needs to be equipment-aware (a node's
   effective tier depends on which equipment type the session declared,
   not just the node itself) rather than a flat field? That's real added
   design/implementation complexity beyond what this doc scoped. Or is it
   acceptable to just leave EEV diagnosis untiered/free for everyone for
   now, accepting that RTU/split users get a bit of free Tier-2-equivalent
   content, since the alternative (wrongly gating it for VRF users) is
   worse? I'd lean toward the second option for a first pass — simpler,
   and errs toward giving away a little too much rather than incorrectly
   paywalling baseline VRF content — but this is Ivan's call, not mine.
3. **Does choosing VRF/chiller as the equipment type alone imply a tier
   floor**, independent of which specific result node is reached — i.e. is
   a "basic" VRF troubleshoot (single outdoor/indoor pair, no branch
   controller) still Tier 1 in spirit even though VRF as a category is
   inherently more complex hardware than a single-stage RTU? This doc
   assumes **no** — tiering follows node content, not equipment-type
   choice — but that's a judgment call, not a settled fact. (The EEV case
   above is really a special case of this same question.)
4. Is the candidate list above complete, or did this pass miss something
   Ivan would tier that isn't yet isolated to one equipment type at the
   structural level (which would mean the *audit*, not just the tiering,
   needs revisiting first)?

## What happens after this doc is approved

Just the tagging: edit `graph-structure.json`, rebuild, deploy — additive,
invisible to every current user, no code changes. The actual
free/pro *enforcement* (checking a `tier` field before serving a node via
`GET /api/graph/node/<id>`, an upsell screen, account-level pro flag,
billing) is separate, larger, later work — not scoped by this doc and not
started.
