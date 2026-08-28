# Commercial refrigeration (walk-in / reach-in) — complexity profile

The widest architectural jump of any category here: Tier 1 and Tier 3
aren't really the same kind of system at all — a self-contained unit and a
multiplex rack share almost no physical layout in common, even though both
end up cooling a walk-in box.

## Tier 1 — Basic / entry-level

- Self-contained unit: compressor, condenser, and evaporator all in one
  factory-assembled package, mounted on top of or beside the box
- 1 compressor, 1 circuit
- Metering: capillary tube or fixed orifice (simple, cheap, matches the
  self-contained design philosophy)
- Mechanical defrost timer (time-initiated, time-terminated)
- No field-adjustable controls beyond a basic thermostat/mechanical
  control

## Tier 2 — Mid-complexity (adds to Tier 1)

- Remote condensing unit — compressor and condenser moved outside/away
  from the box, evaporator stays inside, connected by a proper refrigerant
  line set (i.e. now an actual split system, not a self-contained
  package)
- Still 1 compressor, 1 circuit, but now with real field-run piping,
  meaning line-set-specific failure modes (line length/charge, trap
  design, oil return on long vertical runs) become relevant
- TXV replaces cap tube/fixed orifice as the metering device at this tier
- Electronic defrost control (time + temperature-terminated, not just
  time-terminated)
- Liquid-line solenoid valve, filter-drier, and moisture/liquid sight
  glass become standard components here — more common on refrigeration at
  this tier than on an equivalent-tier RTU

## Tier 3 — Advanced / complex (adds to Tier 2)

- Multiplex/rack system: multiple compressors on a common rack (parallel
  compressor system), serving multiple fixtures/cases from one
  centralized system
- Parallel capacity control — compressors stage on/off (or modulate, on
  variable-speed racks) independently based on aggregate suction pressure
  across all connected cases, not per-fixture
- Multiple evaporators/circuits off the same rack, each case with its own
  EEV
- Floating head-pressure control (condenser pressure allowed to float
  down with outdoor temperature for efficiency, rather than held
  artificially high)
- Coordinated defrost scheduling across many cases/zones (hot-gas or
  electric, staggered to avoid all cases defrosting — and losing
  temperature — at once)
- Central rack controller (e.g. Danfoss AK2, Emerson E2/E3) managing the
  whole system, with alarming/remote monitoring
- At the extreme end: CO2 transcritical or cascade systems — different
  refrigerant thermodynamics entirely, not covered by this project's
  existing P-T module (see CLAUDE.md P-T module refrigerant list)

## Notes for graph design

- Self-contained (Tier 1) vs remote-condensing (Tier 2) vs rack (Tier 3)
  is a **physical layout distinction**, not just a components-added one —
  more so than the other five profiles here, which mostly stay within one
  layout and add compressors/circuits. Worth treating as its own gate
  question rather than folding into a generic "how many compressors"
  question.
- Rack systems (Tier 3) genuinely don't fit the current graph's
  per-symptom model well — a suction-pressure problem on a rack could be
  the rack's shared header, not any individual case, which the current
  single-circuit-assuming numeric_input/measurement nodes have no way to
  represent. Likely out of scope for the free/basic tier even after any
  future tiering work — this is closer to "needs its own subgraph"
  territory than "needs a gate question."
- CO2/transcritical systems are a hard boundary, not a soft one — the
  existing P-T refrigerant module and superheat/subcooling logic don't
  apply the same way across the transcritical point. Flag as explicitly
  out of scope rather than silently wrong if this project ever extends
  toward Tier-3 refrigeration content.
