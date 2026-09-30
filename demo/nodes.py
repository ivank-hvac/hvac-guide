"""Hardcoded content for the 5 golden demo paths (Stage 2).

This is NOT a trimmed copy of the real graph engine — it's its own tiny,
explicit state machine, deliberately separate from app/graph_src / app.js /
the real per-node graph-delivery API. See CLAUDE.md "Публичная
демо-витрина" for the full design history and why: exposing the graph
engine itself (even gated) would leak far more of the private graph's
navigation shape than five fixed, curated walkthroughs.

Every node below (other than the shared "invite" stub) is copied
verbatim from the real private graph_src content (nodes.*.text /
related_checks / checklist, all English) — this is real, correct product
content, not paraphrased. The two RTU dual-pressure-reading steps
(nc_fans_ok's "suction" + "head" blocks) are split into two sequential
single-choice screens here instead of the real product's one
two-selector widget — same information, same breadcrumb shape (matches
the two "Below normal" / "Above normal" hops Ivan's screenshots show),
much less code for a demo that only ever takes one exact route through
each screen. The two P-T standing-pressure measurements (hp_standing_temp
/ hp_standing_pressure) are shown as fixed, already-filled readings
(85°F / 340 psig, the exact values from Ivan's real session) rather than
live numeric inputs — this app never computes anything.

INVITE is the sentinel "next" value: any option that isn't part of one of
the 5 golden paths points here. All 7 equipment types are listed on the
start screen (for authenticity — a demo that visibly only offers 2
equipment types isn't a very convincing showcase), but only two go
anywhere real.
"""

INVITE = "invite"
LINKEDIN_URL = "https://www.linkedin.com/in/ivankulikoff"

FOOTER_DISCLAIMER = (
    "Independent personal project, provided as-is, with no warranty. "
    "Doesn't replace manufacturer documentation, local codes, or the "
    "judgment of a qualified technician."
)
RESULT_DISCLAIMER = (
    "This is the tool's diagnostic suggestion, not a final verdict — the "
    "decision remains with a qualified technician."
)
RELATED_CHECKS_TITLE = "Also worth checking"
SAFETY_BANNER_TEXT = (
    "⚠️ Before opening panels or working on a pressurized circuit — is "
    "LOTO/disconnect done?"
)
AI_CANNED_MESSAGE = (
    "This is a demo — the AI assistant is disabled here. Request an "
    "invite to try the real thing on your own equipment."
)
INVITE_STUB_TEXT = (
    "This is a curated demo — only a handful of example paths are wired "
    "up here, to show what a real session looks like without exposing "
    "the full diagnostic graph. The real tool covers every branch you'd "
    "actually need in the field."
)

# id -> {kind, text, options: [(label, next_id), ...]}  for question nodes
# id -> {kind: "result", severity, ai, text, related_checks, checklist,
#        finished_report: bool}  for result nodes
# id -> {kind: "measurement", text, unit, value, next}
# id -> {kind: "calc", text, comparison, next}
NODES = {
    "start": {
        "kind": "question",
        "text": "What type of equipment?",
        "options": [
            ("RTU / Packaged Unit (rooftop unit)", "rtu_power"),
            ("Split system / Ductless (mini-split)", INVITE),
            ("Furnace / Forced-air furnace", "furnace_power"),
            ("Heat pump (water-to-air, water-to-water)", INVITE),
            ("Chiller", INVITE),
            ("Refrigeration equipment (walk-in / reach-in)", INVITE),
            ("VRF / VRV", INVITE),
        ],
    },
    # --- RTU shared gates ---
    "rtu_power": {
        "kind": "question",
        "text": "Is the unit powered up?",
        "options": [("Yes, powered up", "rtu_calling"), ("No power", INVITE)],
    },
    "rtu_calling": {
        "kind": "question",
        "text": (
            "Is the thermostat/controller calling for heat/cooling "
            "(asking the equipment to run)?"
        ),
        "options": [("Yes, it's calling", "rtu_symptom"), ("No / not sure", INVITE)],
    },
    "rtu_symptom": {
        "kind": "question",
        "text": "What's the main symptom?",
        "options": [
            ("No cooling", "nc_refrigerant"),
            ("No heat", "nh_type_rtu"),
            ("Won't start at all", INVITE),
            ("High-pressure safety trips", "hp_start"),
            ("Low-pressure safety trips", INVITE),
            ("Ice on the evaporator coil", INVITE),
            ("Water / condensate leak", INVITE),
            ("Unusual noise / vibration", INVITE),
            ("Other / complex case", INVITE),
            (
                "Suction pressure hunts while head pressure is stable "
                "(hot gas bypass valve hunting, if this unit has one)",
                INVITE,
            ),
            (
                "Suction pressure and superheat oscillate together in a "
                "cycle, head pressure not involved (TXV hunting)",
                INVITE,
            ),
        ],
    },
    # --- Path 1: RTU / No cooling -> ice, undercharged/airflow ---
    "nc_refrigerant": {
        "kind": "question",
        "text": "What refrigerant is in the system?",
        "options": [
            ("R-410A", "nc_start"),
            ("R-22", INVITE),
            ("R-407C", INVITE),
            ("R-134a", INVITE),
            ("Other / not sure", INVITE),
        ],
    },
    "nc_start": {
        "kind": "question",
        "text": "Does the compressor start and run?",
        "options": [("Yes, it runs", "nc_running"), ("No, it doesn't start", INVITE)],
    },
    "nc_running": {
        "kind": "question",
        "text": "Does the condenser fan run normally while the compressor is running?",
        "options": [
            ("Yes, runs normally", "nc_fans_ok_suction"),
            ("No, not spinning / spinning slowly", INVITE),
        ],
    },
    "nc_fans_ok_suction": {
        "kind": "question",
        "text": "Suction pressure:",
        "options": [
            ("Above normal", INVITE),
            ("Normal", INVITE),
            ("Below normal", "nc_fans_ok_head"),
        ],
    },
    "nc_fans_ok_head": {
        "kind": "question",
        "text": "Discharge (head) pressure:",
        "options": [
            ("Above normal", "nc_suction_low"),
            ("Normal", INVITE),
            ("Below normal", INVITE),
        ],
    },
    "nc_suction_low": {
        "kind": "question",
        "text": "Is there ice on the evaporator or the suction line?",
        "options": [("Yes, there's ice", "ice_start"), ("No ice", INVITE)],
    },
    "ice_start": {
        "kind": "question",
        "text": "With ice present, what's the space/box temperature:",
        "options": [
            ("Below normal (overcooled)", INVITE),
            ("Above normal, despite ice", "ice_undercool"),
        ],
    },
    "ice_undercool": {
        "kind": "result",
        "severity": "critical",
        "ai": True,
        "text": (
            "Ice with insufficient cooling is almost always low airflow "
            "(filter/blower) or an undercharge. For refrigeration "
            "equipment, also check the defrost cycle: the timer, "
            "defrost-termination sensor, defrost heaters, and the "
            "liquid-line solenoid."
        ),
        "related_checks": [
            "Check door/gasket seals on refrigeration equipment "
            "(moist-air infiltration accelerates icing)",
            "Check the evaporator fins for internal buildup, not just "
            "the external filter",
        ],
        "checklist": [
            ("checkbox", "Airflow checked (filter/blower)", None),
            ("checkbox", "Charge checked for undercharge", None),
            (
                "checkbox",
                "Defrost cycle checked (timer/sensor/heaters) — "
                "refrigeration equipment/heat pumps",
                None,
            ),
            (
                "checkbox",
                "Condensate pan/drain heater checked, if fitted — "
                "RTU/AC units with no defrost cycle",
                None,
            ),
            ("checkbox", "Liquid-line solenoid checked", None),
        ],
    },
    # --- Path 2: RTU / No heat, gas, lights but low output ---
    "nh_type_rtu": {
        "kind": "question",
        "text": "What type of heat does this unit have?",
        "options": [("Gas heat", "gas_start"), ("Electric heat strips", INVITE)],
    },
    "gas_start": {
        "kind": "question",
        "text": "Does the burner light?",
        "options": [
            ("Yes, it lights, but little/no heat", "gas_lights_no_heat"),
            ("No ignition", INVITE),
        ],
    },
    "gas_lights_no_heat": {
        "kind": "result",
        "severity": "warning",
        "ai": True,
        "text": (
            "Burner lights but heat output is low: check for cold-air "
            "infiltration in the return duct, the high-limit switch, the "
            "heat exchanger for blockage/cracks (important for CO "
            "safety!), manifold gas pressure, and the gas valve setting."
        ),
        "related_checks": [],
        "checklist": [],
    },
    # --- Path 3: RTU / High-pressure trips -> non-condensables ---
    "hp_start": {
        "kind": "question",
        "text": "Is the condenser coil (outdoor air-cooled coil) dirty or airflow-restricted?",
        "options": [
            ("Yes, dirty/restricted", INVITE),
            ("No, clean and unrestricted", "hp_cond_clear"),
        ],
    },
    "hp_cond_clear": {
        "kind": "question",
        "text": "Are the condenser fan(s) running at full rated speed?",
        "options": [
            ("Yes, full speed", "hp_fans_ok"),
            ("No, running slow/not turning", INVITE),
        ],
    },
    "hp_fans_ok": {
        "kind": "question",
        "text": "Liquid-line subcooling:",
        "options": [
            ("High subcooling", INVITE),
            ("Normal/low subcooling with high pressure", "hp_noncond_refrigerant"),
        ],
    },
    "hp_noncond_refrigerant": {
        "kind": "question",
        "text": "What refrigerant is in the system?",
        "options": [
            ("R-410A", "hp_standing_temp"),
            ("R-22", INVITE),
            ("R-407C", INVITE),
            ("R-134a", INVITE),
            ("Other / not sure", INVITE),
        ],
    },
    "hp_standing_temp": {
        "kind": "measurement",
        "text": "Equipment/ambient temperature at the point of the standing pressure test",
        "unit": "°F",
        "value": "85",
        "next": "hp_standing_pressure",
    },
    "hp_standing_pressure": {
        "kind": "measurement",
        "text": "Stabilized pressure (standing pressure test)",
        "unit": "psig",
        "value": "340",
        "next": "hp_standing_calc",
    },
    "hp_standing_calc": {
        "kind": "calc",
        "text": "Calculation: comparison against expected saturation pressure",
        "comparison": (
            "Measured (stabilized) pressure 340 psig (2344 kPa) / "
            "Expected saturation pressure at this temperature "
            "255.4 psig (1761 kPa) — above expected — consistent with "
            "non-condensables"
        ),
        "next": "hp_noncondensables",
    },
    "hp_noncondensables": {
        "kind": "result",
        "severity": "warning",
        "ai": True,
        "text": (
            "Non-condensable gases (air/nitrogen) in the circuit raise "
            "pressure above what the refrigerant alone would show at "
            "rest at that temperature. If the standing pressure test "
            "came back elevated — recovery, evacuation, and a full "
            "recharge by weight resolve it; if the pressure was normal, "
            "look elsewhere for the high-pressure cause (dirty "
            "condenser, restricted filter, overcharge, etc.)."
        ),
        "related_checks": [
            "Check the evacuation history from the last time the "
            "circuit was serviced (depth/duration)",
            "If a sight glass is installed, check for bubbles/moisture",
        ],
        "checklist": [],
    },
    # --- Furnace shared gates ---
    "furnace_power": {
        "kind": "question",
        "text": "Is the unit powered up?",
        "options": [("Yes, powered up", "furnace_calling"), ("No power", INVITE)],
    },
    "furnace_calling": {
        "kind": "question",
        "text": (
            "Is the thermostat/controller calling for heat/cooling "
            "(asking the equipment to run)?"
        ),
        "options": [("Yes, it's calling", "furnace_config"), ("No / not sure", INVITE)],
    },
    "furnace_config": {
        "kind": "question",
        "text": (
            "What's the overall heating/cooling configuration? Go by "
            "the actual equipment in front of you, not just the "
            "furnace's own nameplate — an A-coil and outdoor condenser "
            "are often added separately later."
        ),
        "options": [
            ("Heat only — no cooling", "furnace_symptom"),
            (
                "Heat + cool — separate A/C (A-coil and outdoor "
                "condenser, no heat pump)",
                INVITE,
            ),
            (
                "Heat + cool — heat pump add-on (dual-fuel, or the heat "
                "pump provides both)",
                INVITE,
            ),
        ],
    },
    "furnace_symptom": {
        "kind": "question",
        "text": "What's the main symptom?",
        "options": [
            ("No heat at all", INVITE),
            ("Won't ignite / lockout", INVITE),
            ("Short cycling", "gas_short"),
            ("Weak / no airflow", INVITE),
            ("Noise", "noise_start"),
            ("Other / complex case", INVITE),
        ],
    },
    # --- Path 4: Furnace / Short cycling -> flame sensor ---
    "gas_short": {
        "kind": "question",
        "text": "What happens right before it shuts down?",
        "options": [
            ("Overheats (high-limit switch trips)", INVITE),
            ("Flame fault a few seconds after ignition", "gas_flame_sensor"),
            ("Thermostat satisfies too quickly", INVITE),
        ],
    },
    "gas_flame_sensor": {
        "kind": "result",
        "severity": "warning",
        "ai": True,
        "text": (
            "Classic case — a dirty/worn flame sensor (ionization rod), "
            "or poor burner grounding. Also check line-voltage polarity "
            "(hot/neutral) — reversed polarity can interfere with the "
            "ionization signal — and inlet gas pressure."
        ),
        "related_checks": [
            "Measure the actual ionization signal with a microammeter, "
            "not just a visual inspection of the sensor",
            "Check the heat exchanger near the sensor for soot/cracks "
            "— can distort the signal",
        ],
        "checklist": [
            ("checkbox", "Flame sensor cleaned/inspected", None),
            ("checkbox", "Burner grounding checked", None),
            ("checkbox", "Line-voltage polarity checked (hot/neutral)", None),
            ("field", "Inlet gas pressure", "in. w.c."),
        ],
    },
    # --- Path 5: Furnace / Noise -> fan, ends in a finished session ---
    "noise_start": {
        "kind": "question",
        "text": "Where's the noise coming from?",
        "options": [
            ("Compressor", INVITE),
            ("Fan (outdoor/indoor)", "noise_fan"),
            ("General vibration/cabinet rattle", INVITE),
        ],
    },
    "noise_fan": {
        "kind": "result",
        "severity": "info",
        "ai": False,
        "text": (
            "Check fan-blade balance (bent blades), motor bearings "
            "(shaft play), the blade's mounting on the shaft, and "
            "contact with the fan shroud."
        ),
        "related_checks": [],
        "checklist": [],
        "finished_report": True,
    },
}

# Static "Session completed" report shown only on noise_fan (path 5) — the
# exact phase names/counts from Ivan's real screenshot. Not a live
# intake-checklist system; this demo has no session state to track.
FINISHED_REPORT_PHASES = [
    ("Visual inspection / inventory", 12),
    ("Electrical / power", 3),
    ("Controls / safety", 3),
    ("Refrigeration circuit (follow-up)", 2),
]
