# Chiller — complexity profile

Covers both air-cooled and water-cooled chillers. Compressor technology is
the main axis of complexity here, more than circuit count alone — scroll
for smaller units, screw for larger, centrifugal/magnetic-bearing at the
top end.

## Tier 1 — Basic / entry-level

- 1 scroll compressor, 1 refrigerant circuit
- Air-cooled (most common at this size range)
- Fixed-speed condenser fans, on/off with the compressor (or simple
  cycling for head-pressure control in cold weather)
- Metering: TXV (EEV less common at this tier, but present on some modern
  small units)
- No economizer/subcooler circuit
- Basic mechanical or electronic controller, local display only

## Tier 2 — Mid-complexity (adds to Tier 1)

- 2+ scroll compressors, **tandem on one circuit** — this is explicitly
  common ("it's common to find 1-2 small screw compressors on air-cooled
  chillers," and tandem scrolls are a standard capacity-staging pattern)
  for capacity staging (both compressors sized differently on purpose in
  some designs, so stage 1 and stage 2 aren't equal capacity)
- Alternatively: 2 independent single-compressor circuits instead of
  tandem — mechanically distinct, matters for diagnosis
- Condenser fan staging (multiple fans, cycled in stages rather than
  all-or-nothing)
- Crankcase heaters standard at this tier and up (mentioned explicitly
  by Ivan as effectively always-present on modern scroll chillers — don't
  treat "check the crankcase heater" as an advanced-only step)

## Tier 3 — Advanced / complex (adds to Tier 2)

- Screw compressor(s) — 1-2 is typical even on larger air-cooled chillers,
  sometimes VFD-driven for true capacity modulation instead of
  tandem-staging
- Multiple independent refrigerant circuits (2-4), each with its own
  compressor(s)
- Economizer/subcooler circuit (a secondary refrigerant path that
  subcools liquid before the main expansion device, improving capacity
  and efficiency — adds its own expansion valve, sometimes its own small
  compressor injection port)
- VFD-driven condenser fans for finer head-pressure control
- Free-cooling coil (uses outdoor air directly in cold weather to reduce
  or eliminate mechanical cooling)
- Heat-recovery chillers (reject heat usefully instead of just to ambient)
- Centrifugal or magnetic-bearing (oil-free) compressors on large-tonnage
  units — different failure modes entirely from scroll/screw. **Scope note
  (Ivan, 27 Aug 2026): revisit this tier later, but stay out of
  compressor-internals territory when it happens** — surge control, magnetic-
  bearing levitation/control electronics, internal lubrication systems on
  oil-bearing centrifugals, and similar are compressor-rebuild-shop depth,
  not field troubleshooting depth. Same boundary as the project's existing
  troubleshooting-vs-fixing/repair principle (see CLAUDE.md), just showing
  up earlier here because centrifugal failure modes are inherently more
  internal-to-the-compressor than scroll/screw ones.
- Water-cooled variants add: a condenser-water loop, cooling tower
  interaction, condenser-water pump staging — a whole second system the
  chiller depends on

## Notes for graph design

- Crankcase heater presence should NOT be treated as an "advanced tier"
  flag for chillers the way it might be for a Tier-1 split — it's
  effectively baseline for this equipment type. Worth correcting the
  equipment-profile assumption used elsewhere in the project accordingly
  (this was flagged as a possible graph audit "soft candidate" and
  turned out not to be one, per Ivan's correction).
- Screw vs scroll is a more load-bearing distinction for chillers than
  compressor *count* alone — failure modes, oil management, and unloading
  mechanisms differ by compressor type, not just by how many there are.
- Economizer/subcooler circuits are chiller/large-refrigeration-specific
  in a way that doesn't map to RTU's economizer (a fresh-air damper) at
  all — same word, completely different component. Worth not conflating
  the two if this vocabulary ever reaches shared graph content.
