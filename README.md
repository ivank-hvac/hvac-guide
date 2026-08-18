# HVAC Troubleshooting Guide

*English | [Русский](README.ru.md)*

Interactive checklist troubleshooter for HVAC/R equipment (RTU, split, VRF/VRV,
chillers, refrigeration equipment, furnaces). Questions follow a decision graph
based on equipment type and symptom. At result nodes and in complex cases, an
AI assistant (Anthropic API) is available — it analyzes the whole checklist
path taken so far and gives a more precise diagnosis.

The interface is bilingual (RU/EN, switcher in the header) — all checklist
text is pre-translated, no on-the-fly machine translation. The English version
uses North American HVAC/R terminology and units (furnace, breaker,
disconnect, °F, psig, etc.), not a literal translation from Russian.

See also: [ROADMAP.md](ROADMAP.md) — future feature direction;
[DEPLOY.md](DEPLOY.md) — deploy by phase, updating, rollback;
[commands.md](commands.md) — cheat sheet of every prod command without
explanations; [SECRETS.md](SECRETS.md) — optional: keeping the API key out
of `.env` entirely via Bitwarden Secrets Manager (works on the free tier);
[CONTRIBUTING.md](CONTRIBUTING.md) — what kind of help is most useful (field
corrections beat refactors); [SECURITY.md](SECURITY.md) — reporting security
issues privately; [LICENSE](LICENSE) — AGPL-3.0;
[CHANGELOG.md](CHANGELOG.md) — change history by date
(kept in Russian, by choice — its only real audience is the author).

## License

[AGPL-3.0](LICENSE). Use it, change it, run it — but if you run a modified
version as a network service, the people using it are entitled to that
modified source. Chosen over a permissive licence for exactly that reason.

## Disclaimer

This is an independent personal project, built and maintained in my free
time — not affiliated with any HVAC/R manufacturer, refrigerant supplier, or
standards body. It's provided as-is, with no warranty of any kind, and I'm
not liable for outcomes from using it. It doesn't replace manufacturer
documentation, local codes, or the judgment of a qualified, licensed
technician. (This is separate from the narrower AI-specific safety
disclaimer shown as a banner in the app and appended to every AI response —
that one is about the AI's answers specifically; this one is about using the
tool at all.)

**Safety.** Diagnosing live equipment means live electrical circuits,
refrigerant under pressure, and — on heating equipment — combustion and
carbon monoxide. Nothing here overrides lock-out/tag-out, your local codes,
or your own training. If a step in the checklist would be unsafe on the
machine in front of you, don't take it.

**Scope.** The content targets ordinary commercial and light-commercial
air conditioning and refrigeration: RTUs, splits, VRF/VRV, chillers,
walk-in/reach-in refrigeration and forced-air furnaces. It does **not**
cover ultra-low-temperature refrigeration (roughly below -30 °C / -22 °F),
which has its own failure modes and its own safety rules. RTU content is the
most thoroughly reviewed; other equipment classes are being brought up to
the same standard, so treat their advice with extra scepticism and check
that any component mentioned actually exists on your machine.

**Terminology and units** follow North American field practice. Codes,
recovery requirements and licensing differ by jurisdiction — yours governs.

## Quick start

```bash
cp .env.example .env
# fill in your ANTHROPIC_API_KEY in .env

docker compose up --build -d
```

Open: http://localhost:8080

Without a key the app still works as a plain checklist (the question graph
and recommendations are available), but the "Ask AI" buttons will return an
error — that's the only part that requires an API key.

## Architecture

```
hvac-guide/
├── docker-compose.yml       # local/dev: no Caddy, no TLS/auth, port 8080
├── docker-compose.prod.yml # prod: adds the Caddy reverse-proxy service + SQLite volume
├── Caddyfile                # reverse proxy: basic auth (Phase 1), upstream via CADDY_UPSTREAM
├── Dockerfile
├── requirements.txt
├── .env.example
├── .githooks/               # post-commit/post-checkout/post-merge — keep GIT_COMMIT in .env current
├── tools/
│   └── visualize_graph.py  # dev-only: renders graph.json as a Mermaid flowchart, excluded from the image
├── README.md / README.ru.md, ROADMAP.md, DEPLOY.md, commands.md, CHANGELOG.md
└── app/
    ├── main.py            # FastAPI: /api/ai-assist (proxy to the Anthropic API),
    │                      # /api/log-session (checklist history), /api/version + serves static files
    └── static/
        ├── index.html
        ├── style.css
        ├── app.js                # graph logic, unit conversion, AI calls, P-T calculator math
        ├── graph.json            # the decision graph itself (editable without rebuilding the container)
        ├── manufacturers.json    # manufacturer list for the step after equipment-type selection
        ├── refrigerants.json     # manifest of refrigerants for the P-T calculator (id/name/file)
        └── refrigerants/*.json   # per-refrigerant P-T tables, one file per refrigerant
```

One container, port 8000 inside / 8080 outside in dev (`docker-compose.yml`);
behind Caddy in prod (`docker-compose.prod.yml`, see [DEPLOY.md](DEPLOY.md)).
The API key never reaches the frontend — every request to Anthropic goes
through the backend `/api/ai-assist`. Completed checklist history is stored in
SQLite on a mounted volume `hvac_data:/app/data` — see "Checklist history"
below.

## Editing the question graph

`app/static/graph.json` is plain JSON, no image rebuild needed (you can mount
`./app/static:/app/static` in compose for live edits, or just rebuild the
container after changes).

Node format (text and option labels are a `{ru, en}` object, not a plain
string):

```json
"node_id": {
  "type": "question",
  "text": {"ru": "Текст вопроса", "en": "Question text"},
  "options": [
    {"label": {"ru": "Вариант ответа", "en": "Answer option"}, "next": "next_node_id"}
  ]
}
```

When adding a new node, fill in both languages — if `en` is missing, the
frontend falls back to `ru`, but don't rely on that; translate right away,
sticking to North American HVAC/R terminology (furnace, breaker, disconnect,
imperial units) for `en`.

### Units (pressure / temperature / vacuum)

If a node's text includes a specific pressure, temperature, or vacuum value,
write it in **one unit only** — the other one is added automatically on the
frontend (`app.js`, the `annotateUnits` function), regardless of the selected
interface language:

| Quantity    | You write in graph.json | You get on screen        |
|-------------|--------------------------|----------------------------|
| Pressure    | `115 psig` or `793 kPa` | `115 psig (793 kPa)`   |
| Temperature | `40°F` or `4°C`     | `40°F (4°C)`               |
| Vacuum      | `500 microns`, `0.5 mmHg`, or `29.9 inHg` | `500 microns (0.5 mmHg)` |

Don't hand-add the second unit — conversion goes through the reusable
`convertPressure` / `convertTemperature` / `convertVacuum` functions in
`app.js`, the single source of truth for the conversion formulas.

Five node types:
- `question` — a question with answer options (`options[].next` points to the
  next node).
- `result` — the final recommendation. Fields `severity` (`info` / `warning` /
  `critical`) and `ai` (`true` highlights the AI button as recommended). An
  optional `checklist` array adds an interactive follow-through list under
  the recommendation — see "Checklist persistence" below.
- `ai_prompt` — a node with no answer options: shows a free-text field for
  describing the situation and sends it straight to the AI assistant (for
  "Other / complex case" or ambiguous fault codes).
- `numeric_input` — instead of buttons, the user enters a number and the
  graph branches by value range (`thresholds`), see below.
- `measurement` — also numeric input, but with no branching: pure data
  collection (optionally compared against a nameplate reference, with an
  alert), see below.

### Numeric input (`numeric_input`)

For cases where a qualitative question ("pressure above normal? yes/no") can
be replaced by an exact measurement, there's a node type with an input field
and routing by value range:

```json
"node_id": {
  "type": "numeric_input",
  "text": {"ru": "Введите измеренный ток компрессора", "en": "Enter the measured compressor current"},
  "unit": "A",
  "min": 0,
  "max": 100,
  "thresholds": [
    {"max": 20, "next": "node_id_if_20_or_less"},
    {"next": "node_id_if_over_20"}
  ]
}
```

- `unit` — the unit of measure, shown next to the input field. If it's
  `psig`/`kPa`, `°F`/`°C`, or `microns`/`inHg`/`mmHg` — the conversion to the
  other unit shows up right under the field (same system as regular node
  text, see above); for units with no pair (`A`, `V`, `Hz`, etc.) the
  conversion simply isn't shown.
- `min`/`max` — the valid value range. While the entered number is out of
  range (or isn't a number), the field highlights red and the "Next" button
  is disabled. Letters and junk can't even be typed into the field — filtered
  live.
- `thresholds` — a list of conditions shaped `{"max": N, "next": "..."}`,
  checked in order: the first entry where the entered value is `<= max` wins.
  A trailing entry with no `max` is the catch-all for "everything above the
  previous thresholds." A simple two-way rule ("if greater than X go here, if
  less go there") becomes a single-boundary `thresholds`, and more complex
  range-based routing is just adding more entries.

The entered value shows up in the breadcrumb history and in the AI
assistant's context the same way a regular question's answer does — with the
specific figure (and its unit conversion, if the unit supports it), not just
the visited node's name.

### Measurement collection (`measurement`)

For cases where the point is just to record a reading (with no automatic
graph branching — the judgment call is left to the human/AI), there's
`measurement`. Unlike `numeric_input`, it has no `thresholds`: always a
single, unconditional `next`.

Without a nameplate reference (just a number + unit):

```json
"node_id": {
  "type": "measurement",
  "text": {"ru": "Введите измеренное давление всасывания", "en": "Enter the measured suction pressure"},
  "unit": "psig",
  "min": 0,
  "max": 500,
  "next": "next_node_id"
}
```

With a nameplate reference — a single value (e.g. compressor RLA):

```json
"node_id": {
  "type": "measurement",
  "text": {"ru": "...", "en": "..."},
  "unit": "A",
  "min": 0,
  "max": 300,
  "reference": {
    "mode": "single",
    "label": {"ru": "RLA (с шильдика компрессора)", "en": "Nameplate RLA (compressor data plate)"}
  },
  "measuredLabel": {"ru": "Измеренный ток", "en": "Measured current"},
  "next": "next_node_id"
}
```

Or a reference as the product of two nameplate values (FLA × SF — typical
for fan motors):

```json
"reference": {
  "mode": "fla_sf",
  "flaLabel": {"ru": "FLA (с шильдика вентилятора)", "en": "Nameplate FLA (fan motor)"},
  "sfLabel": {"ru": "Service Factor (SF, с шильдика)", "en": "Service Factor (SF, from nameplate)"}
}
```

When `reference` is set, the node shows both fields (or three, for
`fla_sf`) plus the `measuredLabel` field. If the measured value exceeds the
reference, a prominent alert box appears right under the fields (not a badge
— a distinct, insistent style with a ⚠️ icon), non-blocking for the "Next"
button and requiring no dismissal. The flag stays in the breadcrumb (a
red-bordered chip) and in the text sent to `/api/ai-assist` — that node's
answer gets a `WARNING: exceeds nameplate rating` /
`ВНИМАНИЕ: превышает заводской референс` suffix, so the model doesn't skip
past it during analysis (see also the instruction in the system prompt in
`app/main.py`).

For motors with electronically-controlled current (ECM/VFD), comparing
against FLA/RLA isn't meaningful in the first place — they get a separate
informational branch in the graph (`fan_ecm_info`), not a `measurement` node.

Since the P-T calculator was added (see below), `numeric_input` no longer
requires `thresholds` — without them it's just a plain sequential input step
with a single unconditional `next` (like `measurement`), which is what the
chain of pressure/temperature readings for the superheat/subcooling
calculation uses.

You can check graph integrity (that every `next` — from `options`,
`thresholds`, `measurement`, `refrigerant_select`, and `pt_calc` — points to
an existing node) like this:

```bash
python3 -c "
import json
d = json.load(open('app/static/graph.json'))
ids = set(d['nodes'])
missing = []
for k, n in d['nodes'].items():
    if n['type'] == 'question':
        missing += [(k, o['next']) for o in n['options'] if o['next'] not in ids]
    if n['type'] == 'numeric_input':
        if n.get('thresholds'):
            missing += [(k, th['next']) for th in n['thresholds'] if th['next'] not in ids]
        elif n.get('next') not in ids:
            missing.append((k, n.get('next')))
    if n['type'] in ('measurement', 'refrigerant_select', 'pt_calc'):
        if n['next'] not in ids:
            missing.append((k, n['next']))
print('missing:', missing)
"
```

### Superheat/subcooling P-T calculator (`refrigerant_select` + `pt_calc`)

A separate, reusable calculation module (not tied to any one branch of the
graph): pick a refrigerant + a fixed sequence of gauge/thermometer readings +
a calculation against real tabular P-T data.

**Refrigerant reference data** — `app/static/refrigerants/*.json`, one file
per refrigerant, plus a manifest `app/static/refrigerants.json` (same format
as `manufacturers.json`):

```json
[
  {"id": "r410a", "name": "R-410A", "file": "refrigerants/r410a.json"},
  ...
]
```

Each `refrigerants/<id>.json` is an array of points, sorted ascending by
temperature:

```json
[
  {"temp_f": -40, "bubble_psig": 10.8, "dew_psig": 10.7},
  {"temp_f": -35, "bubble_psig": 14.1, "dew_psig": 14.0},
  ...
]
```

`bubble_psig` (liquid boiling point) and `dew_psig` (vapor saturation point)
are different curves for blends with real glide (R407C, R448A, R449A, R452A,
R513A); for pure fluids and azeotropes/near-azeotropes (R22, R32, R134a,
R404A, R507A, R500, R502, R454B, R1234yf) both columns match. `app.js`
interpolates linearly between neighboring table points — no
formula/equation-of-state, only real tabulated values. All tables were taken
from published P-T charts from refrigerant manufacturers/distributors (iGas
Technologies, Hudson Technologies) — see `saturationTemp()` in `app.js`.
Adding a new refrigerant = add a `.json` with points + a manifest entry, no
code changes.

Pressure outside the table's range (typically -40°F to 150°F, the exact
range depends on the refrigerant) is **not extrapolated** — that's a
deliberate choice. For a standard refrigeration/AC cycle, a suction or head
pressure outside the P-T table's operating range isn't an
interpolation-precision issue, it's a sign the system itself isn't in a
normal operating state (a leak, the wrong/mixed refrigerant, a catastrophic
component failure). Extrapolating would create false precision where the
number itself is meaningless. Instead of computing SH/SC in that case,
`pt_calc` shows an insistent critical alert ("WARNING: pressure outside
operating range — possible serious fault") and a recommendation to stop
routine diagnosis — see below.

Some tables are deliberately truncated at the low end: in some sources, the
low-temperature region is shown in inches of mercury vacuum mixed with psig
with no clear label in the extracted data — rather than guess at the
conversion, the table simply starts at the first unambiguously positive psig
point (R407C from -30°F, R513A/R1234yf from -20°F). For these refrigerants'
typical operating ranges (air conditioning / medium-temp commercial
refrigeration) this isn't a real limitation.

**Refrigerant-selection node** — a regular graph node (not a sentinel, unlike
the manufacturer step), because in different branches it needs to lead
somewhere different:

```json
"nc_refrigerant": {
  "type": "refrigerant_select",
  "text": {"ru": "Какой хладагент в системе?", "en": "What refrigerant is in the system?"},
  "next": "nc_start"
}
```

The refrigerant dropdown is built dynamically from `refrigerants.json`, plus
there's always a "Don't know" option — in that case the subsequent gauge
readings are still collected (a separate sequence, independent of whether the
refrigerant is known), but the final calculation just reports that a
quantitative estimate isn't available.

**Reading sequence** — regular `numeric_input` nodes with no `thresholds`,
tagged with a `role` field (this is how `pt_calc` finds the right answers in
history, regardless of where in the graph it's placed):

```json
"pt_suction_pressure": {
  "type": "numeric_input",
  "role": "suction_pressure",
  "text": {"ru": "Давление всасывания (манометр)", "en": "Suction pressure (gauge reading)"},
  "unit": "psig",
  "min": -10, "max": 500,
  "next": "pt_suction_temp"
}
```

Roles: `suction_pressure`, `suction_temp`, `head_pressure`, `liquid_temp`
(pressures in `psig`, temperatures in `°F`).

**Result** — `pt_calc`, always a single unconditional `next` (same
philosophy as `measurement`: the calculation doesn't branch the graph, the
judgment call stays with the AI/human):

```json
"pt_calc_result": {
  "type": "pt_calc",
  "text": {"ru": "Результат расчёта", "en": "Calculation result"},
  "next": "nc_pressures_ok"
}
```

Superheat and subcooling are shown explicitly in the UI (not just in the AI's
context). The typical target range (~8-12°F SH, ~10-15°F SC) is shown as
reference text; if the computed value is well outside the operating range
(SH outside 3-20°F, SC outside 5-20°F — see `PT_SH_ALERT`/`PT_SC_ALERT` in
`app.js`), a non-blocking alert box with ⚠️ appears — the same one
`measurement` uses for exceeding a nameplate reference — doesn't block
"Next," stays in the breadcrumb (a red-bordered chip), and goes out to
`/api/ai-assist` with a `WARNING: SH/SC outside typical range` /
`ВНИМАНИЕ: SH/SC вне типичного диапазона` suffix (the system prompt in
`app/main.py` instructs the model to explicitly address it).

If the entered pressure itself (suction or head) falls outside the
refrigerant's table range — that's a separate, more serious case (see the
extrapolation note above): SH/SC aren't calculated at all, and instead of a
result a critical badge + an insistent alert appears with text about a
likely serious fault and a recommendation to stop routine diagnosis. In the
breadcrumb and `/api/ai-assist` this goes out with its own, more alarming
`WARNING: pressure outside operating range — possible serious fault` /
`ВНИМАНИЕ: давление вне рабочего диапазона — возможен серьёзный отказ`
suffix — the system prompt in `app/main.py` instructs the model to put this
flag at the top of its response, ahead of the rest of the analysis.

The module is wired in once — as an extra option on the `nc_fans_ok` node —
but since every "no cooling"/"insufficient cooling" branch (RTU, split, VRF,
chiller, refrigeration) converges on that node, it's reachable from all of
them with no duplication.

## "Equipment manufacturer" step

Right after equipment-type selection on the graph's start node (and only
once per session), a separate step appears: a manufacturer dropdown +
optional model text field. This is **not a graph.json node** — it's inserted
at the `app.js` level (a `MANUFACTURER_STEP_ID` sentinel) between the start
node and whatever node the chosen option would otherwise have led to, so the
decision graph itself didn't need touching.

The manufacturer list — `app/static/manufacturers.json`, a plain array,
loaded by the frontend separately from `graph.json`:

```json
[
  {"id": "carrier", "name": "Carrier", "url": "https://www.carrier.com/"},
  ...
]
```

Rules:
- Nothing is hardcoded in `app.js` — the whole list is built dynamically from
  the file. Adding a manufacturer = adding a line to the JSON, no code
  changes.
- The dropdown always has an "Other / Другой" entry with a free-text field —
  that entry has no `url` and never shows a documentation link (see below).
- **Verify any new link by hand before adding it** (WebFetch/search), don't
  rely on the model's memory, and double-check the site is actually useful as
  a quick support resource (doesn't require a login, etc.). Current Canadian
  manufacturers: Engineered Air, ICE Western (`icewestern.com`), and ICE
  Northern (`icesales.ca`) — two separate, independent brands with similar
  naming ("ICE"), both valid and both listed separately, with no priority
  given to either. Delhi Industries was previously listed but removed: the
  `delhi-industries.com` domain redirects to Canarm, and Canarm's site
  requires a user login, which is useless for quick support access from this
  screen.

Both fields (manufacturer, model) are optional — leaving them blank and
clicking "Next" adds nothing to the history. If something is entered, it
shows up in the breadcrumb and in the `answers` sent to
`/api/ai-assist`/`/api/log-session` as regular question/answer pairs
("Manufacturer" → "Carrier", "Equipment model" → "48TC-A12").

On every terminal node (`result` or `ai_prompt`) — if a manufacturer was
picked from the list (not "Other") — "See also: official {name} technical
documentation" is shown below the rest of the content, linking straight from
`manufacturers.json`. For "Other"/custom input, the link never shows — `url`
is `null` in that case, and `app.js` never generates or guesses links on its
own.

## AI assistant

`POST /api/ai-assist` accepts:

```json
{
  "answers": [{"question": "...", "answer": "..."}],
  "context": "current result node's text",
  "free_text": "the technician's free-text notes (for ai_prompt nodes)",
  "lang": "ru"
}
```

and returns `{"analysis": "...", "truncated": false}`. The system prompt is
set up as an experienced HVAC/R journeyman assistant (uses
superheat/subcooling/P-T terminology). `lang` (`"ru"` by default, or `"en"`)
sets the model's response language — the frontend passes the currently
selected interface language automatically. For `en`, the prompt additionally
asks the model to use North American units (°F, psig, inches of water
column) and terminology (furnace, breaker, disconnect, etc.). The model is
set via `ANTHROPIC_MODEL` (default `claude-sonnet-5`), the key via
`ANTHROPIC_API_KEY`.

Response length is capped by `AI_ASSIST_MAX_TOKENS` (default 2048,
configurable via env) — this is a ceiling, not a target: the prompt already
asks the model for a no-filler answer, so real responses tend to come in
well under it. The value was picked with headroom for the current format
(ranked root causes + diagnostic steps + safety considerations, sometimes
with an explicit breakdown of a `measurement`/`pt_calc` alert flag) — it used
to be 700, and real responses were cutting off mid-sentence. This is
specifically a ceiling on the cost/size of ONE response, not abuse
protection — `AI_ASSIST_RATE_LIMIT` protects against frequent requests (see
"Protecting the AI endpoint from abuse" below); raising
`AI_ASSIST_MAX_TOKENS` only raises the worst-case cost ceiling of a single
response, not the call frequency.

If Anthropic returned `stop_reason: "max_tokens"` (the response was really
cut off by the length limit, not finished on its own) — the `truncated`
field in the response will be `true`, and the frontend shows a separate,
insistent alert under the response text ("The response was cut off due to a
length limit...") rather than silently displaying incomplete text as if it
were the whole answer.

## Checklist history (for pattern analysis)

Every completed checklist is saved to a local SQLite database
(`data/sessions.db`, path configurable via `SESSIONS_DB_PATH`), so common
failure patterns can be searched for later — for example, which equipment
types/symptoms come up most often, which nodes most often fail to give a
clear answer (`ai_prompt`/"Other"), and how often the AI assistant gets used.

The frontend sends `POST /api/log-session` at two points:
1. As soon as the user reaches a `result` or `ai_prompt` node — the graph
   path (answers to every question) and the final node are written right
   away, even if the AI was never called.
2. If the user then clicks "Ask AI" and gets a response — the same record
   (by `session_id`) is updated with the AI's question/answer.

One `session_id` (generated in the browser via `crypto.randomUUID()`, a new
one on every "Start Over") = one row in the `checklist_sessions` table,
updated as the checklist progresses (upsert), rather than growing forever
with duplicates. The endpoint doesn't require `ANTHROPIC_API_KEY` and never
calls Anthropic — it's a purely local record, only `LOG_SESSION_RATE_LIMIT`
(default 30/min per IP) protects it from spam.

Example query for finding common patterns (top final nodes by equipment
type):

```bash
sqlite3 data/sessions.db "
SELECT equipment_type, final_node_id, COUNT(*) AS n
FROM checklist_sessions
GROUP BY equipment_type, final_node_id
ORDER BY n DESC
LIMIT 20;
"
```

Keep in mind: `free_text`/`ai_analysis` may contain free-text technician
notes (potentially with site-specific details) — this is the same data that
already goes to Anthropic when the AI assistant is called, but now it also
stays local in `data/sessions.db`. The file is in `.gitignore` and never
leaves the machine; for rotation/cleanup as needed, it's just regular SQLite
file work (backup, `DELETE ... WHERE created_at < ...`, etc. — not automated
in this project).

## Checklist persistence (resume across page reloads)

Separate from "Checklist history" above — that's a one-way analytics log of
completed/reached checklists. This is live, resumable in-progress state,
stored in the same `data/sessions.db` but its own `sessions` table, so a
technician can pick up exactly where they left off after closing the tab,
losing signal, or having the browser reload.

**graph.json:** a `result` node's optional `checklist` field is a plain list
of follow-through items shown right under the recommendation:

```json
"nc_sh_high": {
  "type": "result",
  "severity": "warning",
  "checklist": [
    {"id": "airflow_checked", "type": "checkbox", "label": {"ru": "...", "en": "Checked evaporator airflow"}},
    {"id": "subcooling", "type": "field", "unit": "Δ°F", "label": {"ru": "...", "en": "Measured subcooling"}}
  ]
}
```

- `type: "checkbox"` — a plain confirmation toggle.
- `type: "field"` (with an optional `unit`, shown as the input's placeholder)
  — a short free-text/numeric entry, e.g. a measurement taken while acting on
  the recommendation.
- A live "Completed: X of Y" progress line sits above the items — a checkbox
  counts once checked, a field once non-blank.

**Frontend state → backend:** the browser's full in-progress state
(`currentId`, `history`, `answers`, manufacturer/refrigerant picks) and the
checklist's checkbox/field values are two separate JSON blobs the frontend
owns the shape of — the backend just stores and returns them
(`SessionUpsertRequest.node_path` / `.checklist_state` in `main.py`, capped
by serialized size, not shape-validated). Saved via a debounced
`POST /api/session` (800ms after the last change — every answer, every
checklist edit) to the `sessions` table, keyed by the same `session_id`
already used for checklist history above.

**Resuming:** the browser remembers its own `session_id` in
`localStorage`. On load, if that id's session is still `status: "active"`
server-side, the user sees a "Continue? / Start Over?" prompt before the
graph renders. "Continue" restores the exact saved state (including
checklist progress); "Start Over" marks the old session `abandoned` — not
deleted, just no longer offered for resume — and starts a genuinely new one.

**Finishing:** a "Finish checklist" button (shown only when the current
result node has a `checklist`) leads to a summary screen — every question
answered so far plus the same checklist, still editable — ending in a
"Complete" action that sets `status: "completed"` and stamps `completed_at`.
`completed` sessions are never touched by the TTL cleanup below; they're
kept indefinitely as future outcome-tracking data (see ROADMAP.md).

**Abandoned-session cleanup:** an `active` session that hasn't been touched
in `SESSION_ABANDON_TTL_HOURS` (3, not currently an env var) is reclassified
as `abandoned` by a background `asyncio` task in `main.py` (checks every 30
minutes, no cron) — rows are never deleted, just no longer resumable.

**Abuse protection:** `SESSION_RATE_LIMIT` (default 20/min per IP, via
`slowapi`) covers both `POST /api/session` and `GET /api/session/{id}` —
separate from `LOG_SESSION_RATE_LIMIT` since a debounced save fires far more
often than the once-per-checklist history write.

## Build version

Every image is tagged with the commit it was built from, so you can quickly
check what's actually deployed without opening a browser:

1. **OCI label on the image** — `org.opencontainers.image.revision`. Check
   with:

   ```bash
   docker inspect --format='{{index .Config.Labels "org.opencontainers.image.revision"}}' hvac-guide
   ```

2. **UI footer** — a short commit hash + date in small, muted text at the
   bottom of the page (doesn't distract from the main content), fetched from
   `GET /api/version`.

How it works: `docker-compose.yml`/`docker-compose.prod.yml` pass
`GIT_COMMIT`/`GIT_COMMIT_DATE` as build args (`${GIT_COMMIT:-unknown}` — read
from `.env`), the `Dockerfile` puts them into `LABEL
org.opencontainers.image.revision` and into `ENV`, and `main.py` serves the
same values via `/api/version`, which the footer picks up.

To keep `.env` itself current (so `docker compose up -d --build` picks up
the current commit with no manual step) — enable the git hooks in
`.githooks/`:

```bash
git config core.hooksPath .githooks
```

**Important: this is local git config (`core.hooksPath`) — it doesn't come
along with `git clone`/`git pull` on its own. Enable it on EVERY machine
that builds the image, including deploy target(s), not just your dev
machine.** If your usual deploy process is `git pull && docker compose up -d
--build` — you specifically need the `post-merge` hook (already added):
`git pull` triggers neither `post-commit` (that's for local commits) nor
`post-checkout` (that's for `git checkout`/`git switch`) — only
`post-merge`, whether the pull was a fast-forward or a regular merge.

Once enabled, `post-commit`/`post-checkout`/`post-merge` keep
`GIT_COMMIT`/`GIT_COMMIT_DATE` in `.env` up to date on commit, branch switch,
and `git pull` respectively — they quietly no-op if `.env` doesn't exist yet
(do `cp .env.example .env` first, as usual). Without the hooks enabled (or
with a manual `docker build` and no `--build-arg`), the image will just get
`unknown` instead of a hash — it won't break, just won't tell you the
version.

If a machine that's already deployed shows `unknown` in the label (the hooks
weren't enabled until now) — fix it on the spot:

```bash
cd /opt/hvac-guide   # or wherever the repo lives on this machine
git config core.hooksPath .githooks   # once, on this machine
.githooks/update-git-version-env       # run it right now, don't wait for the next pull
docker compose -f docker-compose.prod.yml up -d --build
```

## Deployment

See [DEPLOY.md](DEPLOY.md) — step-by-step deploy by phase (team → public),
updating, rollback, build version, what to do about common issues (like a
looping password prompt in basic auth). Bare commands with no explanations —
[commands.md](commands.md).

## Protecting the AI endpoint from abuse

Built in at the application level (regardless of whether you're in Phase 1
or 2):

- **Per-IP rate limiting** — `/api/ai-assist` is capped by
  `AI_ASSIST_RATE_LIMIT` (default 8/min), `/api/log-session` by
  `LOG_SESSION_RATE_LIMIT` (default 30/min), both via `slowapi`. Exceeding it
  returns 429.
- **Hard size limits** — at most 40 question/answer pairs, up to 400
  characters per field, up to 2000 characters for `free_text`/`context`.
  Exceeding it returns 422 without ever calling the Anthropic API (no money
  spent).
- **The prompt is hardened against injection** — the system prompt
  explicitly frames the checklist/`free_text` content as untrusted data, not
  instructions. The model is explicitly forbidden from changing role,
  answering off-topic (non-HVAC/R) questions, or executing commands
  "hidden" in the user's text.
- **`max_tokens` via `AI_ASSIST_MAX_TOKENS`** (default 2048) — a ceiling on
  the cost of one response, not on request frequency (see "AI assistant"
  above).

Additionally recommended on your end:

- A hard spend limit in the Anthropic console (a safety net in case limits
  get bypassed somehow).
- Caddy/application logs for analyzing anomalous traffic.

## Dev monitoring panel

A hidden, unannounced stats dashboard at `GET /panel?token=...` — not linked
from anywhere in the UI, not part of the product. Read-only visualization,
no admin actions.

**Enabling it:** set `MONITOR_PANEL_TOKEN` in `.env` (blank by default —
generate a real one with `openssl rand -hex 16`). The route stays a plain
404 — indistinguishable from a route that doesn't exist — in every one of
these cases:
- `MONITOR_PANEL_TOKEN` is unset/blank (the default)
- it's still the literal placeholder text shown in `.env.example`
- it contains anything other than letters/digits
- the `?token=` query string doesn't match it

Once enabled, it shows: the session funnel (active/completed/abandoned,
14-day trend, traffic by hour of day in 2-hour buckets, top 10 source IPs), branch
popularity (equipment type, top 10 entry symptoms, top 10 final result
nodes — from `checklist_sessions`), how far technicians get through the "🔍
Deeper diagnosis" intake checklist before dropping off (from
`sessions.node_path`), and AI usage (% of sessions that used it, truncation
rate, average tokens in/out, 429 count — from the `ai_calls` table, written
once per `/api/ai-assist` call, success or rate-limited, independent of
`checklist_sessions`). IPs only show up for sessions saved after the
`sessions.ip` column was added — older rows are excluded, not shown as a
misleading blank/zero. All timestamps on the page are shown in the deploying
author's own local timezone (hardcoded as `LOCAL_TZ` in `main.py`, currently
`America/Winnipeg`), not UTC and not the viewer's browser timezone — change
that constant if you self-host this and want your own local time instead.

**Download statistics** on the page exports the same report as a single
self-contained HTML file (inline CSS, no external requests — opens fully
offline), named `hvac-guide-<short commit hash>-DD-MM-YYYY.html` (same hash
as the footer/OCI label).

## Limitations / possible future improvements

- The graph currently covers the most common scenarios (no cool/no heat,
  won't start, high/low pressure, ice, condensate leak, noise) — it's
  extended just by adding new nodes to `graph.json`, no code changes needed.
- The P-T calculator covers 15 common commercial/industrial refrigerants
  (see `app/static/refrigerants.json`); ammonia (R-717) was deliberately left
  out — the tabular data available during development didn't pass a
  consistency check and wasn't added, rather than risk the calculation's
  accuracy. Psychrometrics/air-side (moist-air enthalpy, etc.) is out of
  scope for this module — refrigerant-side (SH/SC) only.
- Reverse-proxy/TLS is now in place (Caddy, see deploy-by-phase above) — used
  only in `docker-compose.prod.yml`.
