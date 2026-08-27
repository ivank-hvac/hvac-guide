# RTU / Packaged Rooftop Unit — complexity profile

RTUs serve roughly half of US commercial floor space, and the range within
that category is enormous — a 3-ton single-stage box on a small retail
store and a 50-ton multi-circuit VFD unit on a hospital are both "an RTU."

## Tier 1 — Basic / entry-level

The current graph's implicit assumption, and the right default.

- 1 compressor, fixed-speed scroll
- 1 refrigerant circuit
- Single-stage cooling (on/off)
- Metering: TXV or fixed orifice/piston (EEV rare at this tier)
- Condenser fan(s): single-speed, on/off with the compressor
- Heat: single-stage gas (standing pilot or hot-surface ignition) or
  single-stage electric heat strips
- Supply fan: belt-drive or direct-drive, single speed (PSC motor)
- Economizer: none, or basic dry-bulb changeover (optional, not universal)
- Safeties Cooling: factory-set, non-adjustable LP/HP switches; no field calibration
- Safeties heating: Flame sensing rod, flue gases inducer air proving switch
- No BAS/BACnet integration — stand-alone thermostat or basic controller

## Tier 2 — Mid-complexity (adds to Tier 1)

- 2 compressors — either tandem on one circuit (2-stage capacity on a
  single circuit) **or** 2 independent circuits, each single-compressor
  (mechanically distinct: check which before assuming shared
  suction/discharge)
- 2-stage cooling as a result of the above
- 2-stage gas heat, or 2-stage electric heat staging
- Digital scroll (PWM) compressor for finer capacity modulation without a
  second compressor
- Condenser fans: 2-speed or cycling staged fans (not all fans run at
  once)
- Modulating (not just on/off) economizer damper
- Demand-control ventilation (CO2 sensor gating outside-air damper)

## Tier 3 — Advanced / complex (adds to Tier 2)

- Variable-speed (VFD-driven) compressor(s) — true capacity modulation,
  not staged
- Multiple tandem compressors across multiple circuits (e.g. 4 compressors
  / 2 circuits, or more on large-tonnage units)
- 3-4+ independent refrigerant circuits on one rooftop unit
- Variable-speed supply fan (VFD or ECM) with airflow reset by
  static-pressure or CO2/DCV signal
- Fully modulating gas heat (not just staged — a modulating valve, 40-100%
  firing rate)
- Enthalpy-based (not just dry-bulb) economizer control
- Hot-gas reheat circuit for active dehumidification (common on
  high-latent-load or 100%-outside-air units)
- Factory BAS/BACnet gateway, remote monitoring/alarming

## Notes for graph design

- A unit with 2+ circuits means "check suction/head pressure" is
  ambiguous without first asking *which circuit* — the current graph's
  numeric_input/measurement nodes implicitly assume one circuit.
- Tandem-on-one-circuit vs independent-circuits changes what a stuck/failed
  compressor actually looks like in symptoms (partial capacity loss vs
  half the unit going dead) — worth a future gate question if this tier
  ever gets built into the checklist.
- Economizer complexity (dry-bulb → enthalpy → DCV) is a common real gap
  between a basic troubleshooting pass and what a commissioning tech
  actually has to verify — could matter more for the future
  Commissioning & Startup mode (see ROADMAP.md) than for break/fix
  troubleshooting.
