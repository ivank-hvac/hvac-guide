# Chiller — complexity profile

Covers both air-cooled and water-cooled chillers.

**Restructured 28 Aug 2026 per Ivan's direct request** ("нужно срочно
разобраться с чиллерами по типу компрессора") — the tier boundary is now
explicitly **compressor-type-driven**, not just component-count-driven:
Tier 1 is scroll compressors only; screw and centrifugal are marked **TBC
(to be continued)** below rather than folded into Tier 2/3 with the same
confidence as before — they need their own dedicated pass later, not a
few bullets under "advanced." **Both air-to-water and water-to-water
media configurations are Tier 1** — water-cooled is not "added
complexity" the way the previous draft of this file implied (it had
water-cooled listed only as a Tier 3 addition, which Ivan corrected).
Reciprocating compressors are noted but not tiered — per Ivan, "сейчас
используются очень редко" (very rarely used now in chillers), essentially
legacy at this point.

## Compressor types — quick reference (added 28 Aug 2026, web-grounded)

Sourced from general industry references (Specifying Engineer, chiller
manufacturer/technical pages), not an audited standard — see Sources at
the end of the CLAUDE.md entry this revision came from for the actual
links. Capacity ranges below are typical/nominal, not hard cutoffs —
real-world overlap between adjacent types is common, especially at the
boundary tonnages.

| Compressor    | Typical capacity        | Common heat exchangers                                  | Media configs               |
|---------------|--------------------------|-----------------------------------------------------------|------------------------------|
| Reciprocating | small, legacy            | brazed-plate (small) or shell-and-tube                    | both, largely obsolete new-build |
| Scroll        | ~10–300 tons (staged/tandem above ~20–40 tons per module) | brazed-plate below ~150 kW (~40 tons); shell-and-tube as tandem count grows | both — air-to-water and water-to-water equally common |
| Screw         | ~30–800 tons (most common 70–600) | shell-and-tube, continuous 20–100% capacity modulation | both, water-cooled more common as size grows |
| Centrifugal   | ~100–4,000+ tons          | shell-and-tube, flooded evaporator                          | traditionally water-cooled/water-to-water; modern oil-free/magnetic-bearing (Turbocor-style) compressors have made **air-cooled centrifugal** a real, growing category too, not just a theoretical one — worth not assuming "centrifugal implies water-cooled" going forward |

Rough real-world pattern from the same sources: water-cooled chillers up
to ~200 tons often use multiple scroll compressors, 200–500 tons commonly
use screw, above ~500 tons mostly centrifugal — but this is a
generalization, not a rule (see the note above about capacity-range
overlap, and Ivan's own point that RTU/split-adjacent condenser units
sometimes carry hot-gas-bypass "правильнее сказать — модели большой
мощности," i.e. actual field configuration tracks capacity more than any
clean type boundary).

## Tier 1 — Basic / entry-level (scroll compressors only)

- 1 scroll compressor, 1 refrigerant circuit
- **Both media configurations are Tier 1, equally** (revised 28 Aug —
  previously this file only listed air-cooled here and pushed
  water-cooled to Tier 3, which was wrong):
  - **Air-to-water**: air-cooled condenser (finned-tube coil) + a
    water-side evaporator (brazed-plate at this capacity, most common at
    this size range)
  - **Water-to-water**: water-cooled condenser (shell-and-tube or
    brazed-plate) + water-side evaporator, condenser water loop feeding a
    cooling tower or other heat-rejection source. Adds a second water
    circuit to think about diagnostically (condenser-water flow/fouling
    alongside the refrigerant side) but the compressor/refrigerant-circuit
    complexity itself is unchanged from air-to-water — that's why this
    stays Tier 1, not Tier 3.
- Fixed-speed condenser fans (air-to-water) or condenser water pump
  (water-to-water), on/off with the compressor (or simple fan cycling for
  head-pressure control in cold weather, air-to-water only)
- Metering: TXV (EEV less common at this tier, but present on some modern
  small units)
- No economizer/subcooler circuit
- Basic mechanical or electronic controller, local display only

## Tier 2 — Mid-complexity (adds to Tier 1, still scroll)

- 2+ scroll compressors, **tandem on one circuit** — this is explicitly
  common ("it's common to find 1-2 small screw compressors on air-cooled
  chillers," and tandem scrolls are a standard capacity-staging pattern)
  for capacity staging (both compressors sized differently on purpose in
  some designs, so stage 1 and stage 2 aren't equal capacity)
- Alternatively: 2 independent single-compressor circuits instead of
  tandem — mechanically distinct, matters for diagnosis
- Condenser fan staging (multiple fans, cycled in stages rather than
  all-or-nothing) — air-to-water only; water-to-water's equivalent is
  condenser-water pump/tower-fan staging
- Crankcase heaters standard at this tier and up (mentioned explicitly
  by Ivan as effectively always-present on modern scroll chillers — don't
  treat "check the crankcase heater" as an advanced-only step)
- Applies to both media configs from Tier 1 — mid-complexity here is about
  compressor/circuit count, not water vs. air

## Tier 3 — Advanced / complex (adds to Tier 2, still scroll-compressor scope)

- Multiple independent refrigerant circuits (2-4), each with its own
  scroll compressor(s)
- Economizer/subcooler circuit (a secondary refrigerant path that
  subcools liquid before the main expansion device, improving capacity
  and efficiency — adds its own expansion valve, sometimes its own small
  compressor injection port)
- VFD-driven condenser fans (air-to-water) or VFD condenser-water pumps
  (water-to-water) for finer head-pressure control
- Free-cooling coil (uses outdoor air directly in cold weather to reduce
  or eliminate mechanical cooling) — air-to-water specific
- Heat-recovery chillers (reject heat usefully instead of just to
  ambient) — applies to either media config

## Screw compressors — TBC (to be continued, not detailed yet)

Flagged explicitly per Ivan's request rather than folded into Tier 3 with
false confidence. What's known so far (see reference table above): ~70-600
tons typical, shell-and-tube heat exchangers, genuine capacity modulation
20-100% (not just staged on/off like tandem scroll) — makes some of its
failure modes (unloader mechanism, slide valve, VFD-driven variants)
distinct from scroll. Both air-to-water and water-to-water variants exist
in the field, more commonly water-cooled as size grows. **Needs its own
dedicated pass** before this becomes anything more specific than this
paragraph — not attempted here.

## Centrifugal / magnetic-bearing compressors — TBC (to be continued, not detailed yet)

Same status as screw — flagged, not detailed. ~100-4,000+ tons,
shell-and-tube with a flooded evaporator design, dynamic (velocity-based)
compression rather than positive-displacement. Traditionally
water-to-water dominant, but modern oil-free/magnetic-bearing designs
(Turbocor-style) have made air-to-water centrifugal a real modern
category too — don't assume "centrifugal implies water-cooled" when this
section eventually gets built out. **Scope note carried over from the 27
Aug revision, still applies**: when this does get detailed, stay out of
compressor-internals territory (surge control, magnetic-bearing
levitation/control electronics, internal lubrication on oil-bearing
units) — that's compressor-rebuild-shop depth, not field troubleshooting
depth, same boundary as the project's existing troubleshooting-vs-fixing
principle (see CLAUDE.md).

## Reciprocating compressors — legacy, not tiered

Per Ivan (28 Aug 2026): "Reciprocating компрессора в чиллерах сейчас
используются очень редко" — very rarely used in chillers now, essentially
a legacy technology at this point (still findable on older installed
equipment, not something a new chiller would ship with). Not assigned a
tier or built out further — noted here so it isn't silently forgotten,
not because it's expected to come up often in the field.

## Notes for graph design

- **Compressor type, not circuit/component count alone, is now the
  primary tier axis for this equipment type** (revised 28 Aug) — Tier 1/2
  covers scroll only; screw and centrifugal are explicitly incomplete
  (TBC) rather than folded into "Tier 3" as if fully scoped.
- **Media configuration (air-to-water vs water-to-water) is orthogonal to
  compressor type and tier** — both are Tier 1 for scroll, and both exist
  at every compressor type per the reference table above. Don't gate a
  water-cooled chiller behind a higher tier just because it's
  water-cooled.
- Crankcase heater presence should NOT be treated as an "advanced tier"
  flag for chillers the way it might be for a Tier-1 split — it's
  effectively baseline for this equipment type. Worth correcting the
  equipment-profile assumption used elsewhere in the project accordingly
  (this was flagged as a possible graph audit "soft candidate" and
  turned out not to be one, per Ivan's correction).
- Economizer/subcooler circuits are chiller/large-refrigeration-specific
  in a way that doesn't map to RTU's economizer (a fresh-air damper) at
  all — same word, completely different component. Worth not conflating
  the two if this vocabulary ever reaches shared graph content.
- See `graph-tiering-concept.md` for how this connects to the actual
  `graph-structure.json` tagging pass — hot gas bypass content
  (`hgbp_*`) is tagged Tier 2 there per this same 28 Aug conversation;
  the receiver/king-queen valve branch was redesigned as an equipment-
  agnostic yes/no question instead of being tiered by equipment type at
  all (see that file's changelog).
