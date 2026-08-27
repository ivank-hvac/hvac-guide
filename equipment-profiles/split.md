# Split system — complexity profile

The category Ivan flagged as completely missing from the original audit
scope ("я его совсем упустил"). Spans from a single residential ductless
head to light-commercial multi-split condensing units that start
overlapping with small VRF systems in everything but name.

## Tier 1 — Basic / entry-level

- 1 outdoor condensing unit, 1 indoor unit (single-zone ductless, or a
  conventional ducted split with an air handler)
- 1 compressor — often a fixed-speed reciprocating or scroll compressor on
  older/cheaper ducted splits, or a single-stage inverter on modern
  ductless
- 1 refrigerant circuit
- Metering: capillary tube (small ductless) or TXV (ducted); frequently
  **factory-sealed and not field-serviceable** on small residential-grade
  ductless units — worth flagging distinctly from RTU/chiller, where
  metering devices are normally field-accessible
- Condenser fan: single-speed, on/off with the compressor
- Safeties: factory-set, not field-adjustable; often no accessible LP/HP
  gauge ports at all on the smallest ductless models (Schrader valves only
  under a service cap)
- No field controls beyond a wall/handheld remote — no BAS integration

## Tier 2 — Mid-complexity (adds to Tier 1)

- 1 outdoor unit serving 2-6 indoor units (multi-zone ductless) — still
  **one** inverter compressor, modulating and distributing refrigerant
  across zones via branch/distributor joints
- EEVs at each indoor unit (not just at the outdoor unit) — this is where
  EEV actually becomes common for the split category, earlier than for
  RTU
- Mix of indoor unit types on one outdoor unit: wall-mounted heads,
  ceiling cassettes, ducted concealed units, floor consoles
- Light-commercial condensing units (36-60k BTU class) built for
  continuous duty, still generally 1 circuit

## Tier 3 — Advanced / complex (adds to Tier 2)

- 2 compressors (tandem) on a larger light-commercial condensing unit, or
  2 independent circuits feeding a larger zone count
- Up to 8+ indoor zones off a single outdoor unit
- 2-pipe vs 3-pipe distribution starting to matter (3-pipe = simultaneous
  heat/cool heat-recovery capability) — the point where a "split system"
  is functionally a small VRF system, see `vrf.md`
- BAS/central control integration for zone scheduling across a small
  building
- Larger units may add: crankcase heater, liquid-line solenoid,
  filter-drier, sight glass — components that are essentially absent at
  Tier 1 but become normal as tonnage grows

## Notes for graph design

- **The metering-device sealed/non-serviceable distinction at Tier 1 is
  probably the single most important split-specific gap** — a
  troubleshooting step that assumes a technician can access/adjust a TXV
  is simply wrong for a huge share of small ductless installs, in a way
  that doesn't apply the same way to RTU or chiller.
- The split↔VRF boundary is genuinely fuzzy at Tier 3 — worth deciding
  explicitly (probably by pipe count / heat-recovery capability, not
  BTU size) if this ever becomes a graph-level equipment distinction,
  rather than leaving techs to guess which category their unit falls
  into.
