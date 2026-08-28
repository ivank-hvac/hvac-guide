# Furnace (forced-air) — complexity profile

The narrowest complexity spread of the six profiles — furnaces don't
accumulate refrigerant-circuit complexity at all (see `component_inventory.md`'s
own note that furnace has no shared refrigeration-circuit components).
Complexity here is almost entirely about heat-output staging and blower
control.

## Tier 1 — Basic / entry-level

- Single-stage gas valve (full-fire or off, no in-between)
- Single-speed blower motor (PSC — permanent split capacitor)
- Hot-surface ignition (most common on modern units) or standing pilot
  (older units still in the field)
- Single heat exchanger
- Basic limit switch, no communicating controls

## Tier 2 — Mid-complexity (adds to Tier 1)

- Two-stage gas valve (low-fire/high-fire, roughly 65%/100%)
- ECM (electronically commutated) variable-speed blower motor — still
  staged/discrete speeds tied to the gas valve's stage, not continuously
  modulating
- Induced-draft (inducer) motor, direct-spark or hot-surface ignition with
  a separate flame sensor as a standard combination
- Condensing furnace variant: secondary heat exchanger extracts
  additional heat from flue gas, requires condensate management (drain,
  trap, sometimes a condensate pump) — a real added failure-mode category
  not present on a non-condensing Tier-1 unit

## Tier 3 — Advanced / complex (adds to Tier 2)

- Fully modulating gas valve — continuous firing-rate modulation
  (typically 40-100%), not just two discrete stages
- Communicating/variable-speed ECM blower that continuously adjusts
  airflow to match the modulating burner, rather than stepping between
  fixed speeds
- Dual inducer motor designs on some high-efficiency condensing models
- Communicating thermostat/control bus (proprietary comms — e.g.
  manufacturer-specific communicating systems) instead of standard 24V
  R/W/Y/G wiring — changes how a tech even reads fault codes or verifies
  a call for heat, since there's no simple multimeter check across
  conventional wiring anymore

## Notes for graph design

- This is the one profile where Tier 3 changes **diagnostic method**, not
  just physical components — a communicating system requires reading
  fault codes off a proprietary interface instead of voltage-checking
  standard thermostat wires, which the current `gas_no_power`/
  `gas_fault_code` nodes don't distinguish between.
- Condensing vs non-condensing (Tier 2 boundary) is probably the single
  most consequential furnace distinction for troubleshooting — it adds an
  entire condensate-handling failure category (clogged trap, frozen drain
  line, condensate pump failure, blocked secondary heat exchanger) that
  doesn't exist at all on a non-condensing Tier-1 furnace.
