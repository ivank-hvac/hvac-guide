# VRF / VRV — complexity profile

Even the "smallest" real VRF system is already more complex than a Tier-1
split — the category starts where light-commercial multi-split leaves off
and scales up to systems serving entire buildings.

## Tier 1 — Basic / entry-level

- 1 outdoor unit module, 1 inverter compressor (modern high-capacity
  inverter compressors can cover 14-26 HP alone, replacing what used to
  need 2-3 compressors)
- Modest indoor unit count (roughly 2-8)
- 1 refrigerant circuit
- 2-pipe distribution — cooling-only or heating-only at a time across the
  whole system (no simultaneous heat/cool between zones)
- EEVs at every indoor unit (universal at this category, unlike split)
- Refnet joints / branch distributors between outdoor unit and indoor
  units
- Central controller or simple group remote — not necessarily full BAS

## Tier 2 — Mid-complexity (adds to Tier 1)

- Tandem compressors in the outdoor unit — typically one larger inverter
  compressor plus one or more fixed-speed helper compressors, extending
  the modulation range down as low as ~12.5% of rated capacity (vs
  ~25-100% with a single compressor)
- More indoor units (up to roughly 16 off one outdoor module)
- 3-pipe distribution with heat-recovery (HR) branch controller (BC) boxes
  — enables genuinely simultaneous heating in some zones and cooling in
  others, not just system-wide mode switching
- Multiple refrigerant circuits start to appear even within a
  single-outdoor-unit system on some manufacturers' larger single modules

## Tier 3 — Advanced / complex (adds to Tier 2)

- Multiple outdoor unit **modules** combined (module combination) to reach
  large total tonnage — several physical outdoor units acting as one
  system
- Large indoor unit counts (30-64+ per system, sometimes more)
- Multiple independent refrigerant circuits across the combined modules
- Multiple heat-recovery BC boxes distributed through the building, each
  serving its own zone cluster
- Building-wide centralized control, BACnet/Modbus gateway integration,
  scheduling and demand-response tie-ins
- Water-cooled or hybrid VRF variants adding a condenser-water loop on top
  of the refrigerant side

## Notes for graph design

- Unlike RTU/chiller, **EEV is the default metering device across every
  tier** for VRF, not an advanced-only addition — the graph's existing
  bias toward TXV/piston as the "safe default" assumption is backwards
  specifically for this equipment type.
- 2-pipe vs 3-pipe is the single highest-leverage question for VRF
  troubleshooting complexity — it determines whether "why is one zone
  heating while another cools" is even a valid symptom to ask about.
- Module-combination systems (Tier 3) mean "the outdoor unit" isn't
  necessarily one box — a future equipment-inventory question would need
  to ask about module count separately from compressor count per module.
