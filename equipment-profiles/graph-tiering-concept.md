# Graph tiering — concept, partially implemented

Scratch design doc, same spirit as the other files in this directory: not
wired into the app (the two small `graph-structure.json` edits described
below are content/structure changes, not app code — the `tier` field
itself is still unread by anything). Written 28 Aug 2026 at Ivan's request
("разметка графа, можно начинать. сначала концепт, потом деплой").

**Revised twice the same day** as Ivan reviewed and answered in detail
("действительно серьезный вопрос" — a genuinely serious question), which
changed the shape of the design and led to two concrete, already-shipped
changes: **HGBP is now tagged `"tier": 2`**, and **the receiver/king-queen
valve question was resolved by retiring equipment-based routing entirely**
(a real `graph-structure.json` edit — a new universal yes/no question
node, not a tag) rather than assigning it a tier number. Both verified
live, both deployed. What's still concept-only: the "Tier-1 fallback /
stub content" idea below (new UX mechanism, not built), and the EEV
question (resolved to "leave untagged," nothing to implement there by
design).

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

**Confirmed explicitly by Ivan on revision**: this holds for the whole
beta, not just this first pass — "во время бета-теста, все должно быть
открыто" (everything stays open during the beta). Even once tags exist in
`graph-structure.json`, nothing gets gated behind them until there's a
separate, later, explicit decision to turn enforcement on — likely well
after billing exists, not alongside this.

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

**Receiver / king-queen valve — `lp_rapid_trip_result_receiver` (result).
✅ RESOLVED, and NOT by tagging.** Ivan's answer on this: "оставь во всех
типах оборудования как вопрос есть/нет, king-queen valve и так будут если
есть ресивер" — don't gate this by equipment type at all, ask directly.
**Implemented 28 Aug**: `lp_stable_check`'s equipment-based
`nextByEquipment` routing (chiller/refrigeration → receiver content,
everything else → RTU content) is retired. In its place, a new question
node `lp_receiver_check` ("Does this system have a receiver, with a
king/queen valve?") sits between them — any equipment type can now reach
either result depending on the actual answer, not a pre-baked assumption
based on what was picked on the `start` screen. `lp_rapid_trip_result_rtu`'s
text was reworded to drop the "on an RTU/split" framing (it's reachable
from any equipment type's "no receiver" answer now, so "unlike an RTU"-
style language no longer fits). This was the only `nextByEquipment` usage
in the whole graph — the mechanism itself is untouched in `main.py`/
`app.js` (still supported, just currently unused), no code changes needed.
Verified live via curl: `lp_rapid_trip_result_receiver` is now reachable
with `equipment=rtu`, `lp_rapid_trip_result_rtu` reachable with
`equipment=chiller`, and the old direct equipment-routed edge now
correctly 403s (retired). **No `tier` tag applied to either result node**
— this fix makes the receiver/no-receiver split a genuine, equally-
accessible diagnostic question for everyone, same "universal discipline
stays free" principle as everything else, not something to gate.

**Hot gas bypass — `hgbp_lowload`, `hgbp_mechanical`, `hgbp_tuning`
(results; `hgbp_start`/`hgbp_erratic` are questions, not tagged).
✅ TAGGED (28 Aug 2026).** All three now carry `"tier": 2` in
`graph-structure.json`, rebuilt into `graph.json`, verified live via curl
that the API actually serves the field. HGBP is common on chillers
("часто"), which supports **Tier 2** for the three result nodes above —
but it is genuinely *not* clean chiller-only in the field, which the
current graph structure (`hgbp_start` reachable only from
`chiller_symptom`) doesn't reflect:

> В RTU, некоторые модели, трудно классифицировать в каких конкретно, т.к.
> зависит от производителя и конкретного экземпляра/заказа. В condenser
> unit для сплит систем, чиллеров, холодильных камер, фризеров, но
> правильнее сказать — это модели большой мощности. В простых
> residential/commercial этого обычно нет.

So HGBP also turns up on some RTUs (unpredictably, by manufacturer/order —
not classifiable into "which models" in general), and on higher-capacity
condenser units for split systems, chillers, and refrigeration/freezers.
Simple residential/commercial equipment usually doesn't have it at all.
**Two separate conclusions follow**:
1. **Tagging**: `hgbp_lowload`/`hgbp_mechanical`/`hgbp_tuning` → **Tier 2**
   (not 3 — "часто" in chillers generally, not just top-end screw/
   centrifugal units, matches Tier 2's tandem/staging-scroll chillers as
   much as Tier 3's).
2. **Separate from tiering — a real graph-coverage gap, not proposed to
   fix now**: the graph currently has no path to HGBP content for anyone
   who picked RTU, split, or refrigeration as their equipment type, even
   though HGBP genuinely exists on some higher-capacity units in exactly
   those categories. Worth a future content pass (a gated/optional path
   into the existing `hgbp_*` nodes from those equipment types, framed
   as "if your unit has hot gas bypass" the same way the intake checklist
   already asks about other optional components) — not something this
   tiering doc is scoped to build.

**EEV — still NOT proposed for tagging; Ivan's answer made the case for
leaving it alone stronger, not weaker.** Original finding (VRF=Tier 1
baseline, split=Tier 2, RTU implied Tier 2+, chiller ungated by tier) held
up, and Ivan's revision adds the real-world texture behind it:

> Никогда в дешевых и небольших системах до 5 тонн, часто в более крупных
> и дорогих, 100% в conversion kit для VRF/VRV установок. Достаточно часто
> в heat pump ... EEV диагностика это часто происходит при диагностике
> residential heat pump, chillers, VRF/VRV.

So the real driver is closer to **capacity/price tier than a clean
equipment-type or Tier-1/2/3 line** — absent under 5 tons, common above
that, and unconditionally present the moment a VRF/VRV conversion kit is
involved. It also comes up constantly for **heat pumps specifically** —
which Ivan flagged in the same message as a large, currently-missing
equipment category in this project (see `README.md`'s new "Known gap:
heat pumps" section). That reinforces the original conclusion for a new
reason: gating EEV diagnosis would land hardest on exactly the equipment
category (residential heat pumps) this project is weakest on right now,
which cuts against gating it even harder than the pure VRF-baseline
argument alone did. **Left untagged.** A capacity-based approach (tie the
gate to system tonnage rather than equipment type) is a plausible future
direction if EEV ever does get tiered, but the graph doesn't collect
capacity/tonnage anywhere today — a bigger, separate design question, not
attempted here.

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

## Tier-1 fallback / stub content — new design item from Ivan's revision, NOT built

This answers what was originally "open question 3" (does choosing VRF/
chiller as equipment type alone imply a tier floor), and the answer turned
out to reshape the whole free/pro UX model, not just settle a tagging
detail:

> должны присутствовать, но для Tier 1 должна быть заглушка "Смотри
> Tier 2..." (во время бета-теста, все должно быть открыто, условно
> базовые рекомендации для диагностики как для любой холодильной машины,
> т.е. даже в базовом варианте можно приблизительно продиагностировать)

So the eventual model (again: **not built now**, beta stays fully open
regardless) is not a binary "Tier 1 sees nothing, Tier 2 sees the answer."
It's: **Tier 1 always gets a generic, still-genuinely-useful baseline
answer** — good enough to approximately diagnose "as for any refrigeration
machine" — and Tier 2+ adds the equipment-specific depth on top, with Tier
1 seeing a visible stub/pointer ("See Tier 2...") rather than nothing.
Practically, this means a future Tier-2/3-tagged result node would need
**two content variants authored, not one node hidden**: the generic
fallback (works acceptably for any equipment) and the specific deep
version. That's real future content-authoring work per tagged node, well
beyond what the `tier` field alone can carry — flagging it here so it
isn't lost, not scoping or estimating it.

**VRF/VRV specifically, same conversation**: Ivan wants VRF/VRV kept
selectable as an equipment type (not removed or hidden), but with an
explicit **"To be continued"** placeholder wherever this stub mechanism
would apply to it — an acknowledgment that VRF/VRV-specific content in
this graph isn't fully built out yet, rather than pretending it's
complete. Same non-decision as everything else here: recorded, not
implemented — there's no stub mechanism to attach "To be continued" to
yet.

## Open questions for Ivan (status after 28 Aug, second round)

1. ✅ **Receiver/king-queen valve** — resolved, and resolved differently
   than expected: not a tier number at all, a structural graph fix
   instead (see above). Closed.
2. ✅ **EEV** — resolved: stays untagged/free. The capacity-based-gate
   idea is noted as a possible future direction, not decided.
3. **Tier-1-floor / stub content** — answered in principle, but the
   answer requires new mechanism (generic-fallback + specific-depth
   content pairs, "To be continued" placeholders) that this doc doesn't
   design or build — see the section above. Still open as an
   implementation question, just not as a design question.
4. Is the candidate list complete, or did this pass miss something not yet
   isolated to one equipment type at the structural level (which would
   mean the *audit*, not just the tiering, needs revisiting first)? Still
   open — unaffected by this revision.

**New, related but separate**: the same 28 Aug conversation also produced
a substantial rework of `chiller.md` itself (compressor-type-driven tiers
— scroll = Tier 1/2, screw and centrifugal marked TBC, both air-to-water
and water-to-water made Tier 1) — see that file directly, not duplicated
here since it's equipment-profile content, not a tiering-mechanism
question.

## What happened / what's still ahead

**Done, 28 Aug**:
- `hgbp_lowload`/`hgbp_mechanical`/`hgbp_tuning` tagged `"tier": 2` in
  `graph-structure.json`, rebuilt, verified live via curl that the API
  serves the field.
- `lp_receiver_check` question node added, retiring the equipment-based
  receiver routing entirely (see above) — a structural graph change, not
  a tag, verified live.
- `chiller.md` reworked for compressor type (separate file, see there).

**Still ahead, not started**:
- **The stub-content mechanism** (generic Tier-1 fallback text + "See
  Tier 2..." pointer, "To be continued" for VRF/VRV) — separate, larger,
  needs actual content authored per Tier 2/3 node, not scoped here.
- Deciding whether the same "ask directly instead of gating by equipment
  type" fix that resolved the receiver question should also apply to hot
  gas bypass (`hgbp_start` is currently reachable only from
  `chiller_symptom`, but Ivan's own answer said HGBP also turns up on
  some RTU/split/refrigeration condenser units) — flagged as a graph-
  coverage gap in the HGBP section above, not decided or built.

**Confirmed and unaffected by any of the above**: enforcement stays off
through the whole beta regardless of what's tagged — that's a separate,
later, explicit decision, likely tied to billing existing at all.
