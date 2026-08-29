# Equipment complexity profiles — working reference

Same spirit as `component_inventory.md` at the repo root: a **scratch
research file, not wired into the app**. Compiled 27 Aug 2026 at Ivan's
request, after he flagged that RTU/chiller (and, by his own admission,
split systems — "я его совсем упустил") span a much wider real-world range
than the graph currently assumes: from one-stage/one-compressor units to
multi-circuit, tandem-compressor, VFD-everywhere configurations.

**Why this exists**: before the graph/checklist can safely assume a
"basic" complexity level by default and gate more complex configurations
behind an advanced path, someone has to actually write down what "basic"
and "advanced" mean *per equipment type* — the tiers aren't the same shape
for a furnace as for a chiller. These six files are that reference.

Sourced from general HVAC/R domain knowledge plus a handful of web
searches (manufacturer/technical pages, not manufacturer spec sheets for
any specific model) — treat as a reasonable working approximation, not an
audited industry standard. Re-check specifics against real nameplate data
before this becomes checklist-gating logic.

## Files

- [`rtu.md`](rtu.md) — packaged rooftop units
- [`split.md`](split.md) — ductless mini-split through light-commercial multi-split
- [`vrf.md`](vrf.md) — VRF/VRV
- [`chiller.md`](chiller.md) — air- and water-cooled chillers
- [`refrigeration.md`](refrigeration.md) — walk-in/reach-in commercial refrigeration
- [`furnace.md`](furnace.md) — forced-air furnaces

## Shape of each file

Three tiers per equipment type — **Tier 1 (basic)**, **Tier 2 (mid)**,
**Tier 3 (advanced)** — each tier listing only what it *adds* on top of
the tier below it (Tier 2 assumes everything in Tier 1 is still there,
plus its own additions; same for Tier 3 on top of Tier 2). A component
that only ever shows up at Tier 2+ is exactly the kind of thing the
existing graph/checklist should stop assuming universally present.

## Known gap: heat pumps (flagged by Ivan, 28 Aug 2026)

Heat pumps don't have their own profile file yet, and Ivan flagged this as
a real gap, not a minor omission — "heat pumps у нас незаслужено забыт, а
это очень большой пласт оборудования" (heat pumps are undeservedly
forgotten here, and it's a very large slice of the equipment population).
Not building the file now — recording the taxonomy he gave so it isn't
lost before that profile gets written:

**Media-combination taxonomy for chillers and heat pumps** (source/sink
pairs, not just "air-cooled vs water-cooled" — the two sides can differ):
- **Chillers**: water-to-water, air-to-water (at minimum)
- **Heat pumps**: water-to-water, air-to-water, water-to-air, air-to-air

Ivan's own framing: commercial heat pumps commonly show up as
water-to-water or water-to-air; residential as air-to-air. EEV diagnosis
(see `graph-tiering-concept.md`) comes up often specifically when
diagnosing residential heat pumps, chillers, and VRF/VRV — heat pumps
aren't a fringe case for that content, they're a primary one.

## How this could eventually connect to the app (not decided, not built)

The idea Ivan described: the graph/intake-checklist walks only Tier-1
("top-level") components and gives advice at that level by default —
that's what should stay maximally accessible, matching the project's
existing "basic tier always free" principle (see CLAUDE.md "core/pro
split"). Anything that only exists at Tier 2/3 (a second refrigerant
circuit, tandem compressors, a multiplex rack, a modulating gas valve)
would only surface once the tech's own answers establish that tier applies
— likely via the same kind of equipment-inventory question the intake
checklist's Visual phase already half-does, generalized and made
equipment-aware. **Not designed yet, not scoped as an implementation
task** — this reference is the input to that future design conversation,
not the design itself.
