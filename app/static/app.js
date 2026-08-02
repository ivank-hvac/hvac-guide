const cardEl = document.getElementById("card");
const breadcrumbEl = document.getElementById("breadcrumb");
const backBtn = document.getElementById("backBtn");
const restartBtn = document.getElementById("restartBtn");
const langButtons = document.querySelectorAll(".lang-btn");
const disclaimerEl = document.getElementById("disclaimer");
const footerDisclaimerEl = document.getElementById("footerDisclaimer");
const versionInfoEl = document.getElementById("versionInfo");

const I18N = {
  ru: {
    back: "← Назад",
    restart: "⟲ Начать сначала",
    badge: { info: "Инфо", warning: "Внимание", critical: "Критично" },
    aiLabel: "AI-анализ",
    aiLoading: "Анализирую checklist...",
    aiErrorPrefix: "Ошибка: ",
    aiRequestError: "Ошибка запроса",
    aiTruncatedWarning: "Ответ был обрезан из-за ограничения длины. Попробуйте уточнить вопрос или разбить его на части.",
    aiSendBtn: "🤖 Отправить AI-ассистенту",
    aiAskRecommended: "🤖 Уточнить у AI-ассистента (рекомендуется)",
    aiAsk: "🤖 Спросить AI-ассистента",
    freeformPlaceholder: "Опишите наблюдения, показания приборов, модель оборудования...",
    disclaimer: "Этот инструмент даёт вспомогательные диагностические предположения на основе ИИ и не заменяет суждение квалифицированного специалиста. Перед любыми работами с электричеством, хладагентом или под давлением всегда соблюдайте LOTO и применимые нормы безопасности (OSHA/CSA/местные). Используется на свой риск.",
    footerDisclaimer: "Независимый личный проект, предоставляется как есть, без гарантий. Не заменяет документацию производителя, местные нормы или суждение квалифицированного специалиста.",
    nextBtn: "Далее",
    numericRangeLabel: "Диапазон:",
    measuredLabel: "Измеренное значение",
    measurementAlertText: "Измеренное значение превышает заводской RLA/FLA. Это требует внимания, но не обязательно означает немедленную замену — оцените общее состояние оборудования (возраст, история отказов, вибрация, шум).",
    measurementAlertFlag: "ВНИМАНИЕ: превышает заводской референс",
    measurementRefFlaSf: "FLA×SF",
    manufacturerStepTitle: "Производитель оборудования (опционально)",
    manufacturerLabel: "Производитель",
    manufacturerNotSpecified: "— не указано —",
    manufacturerOther: "Другой / Other",
    manufacturerOtherPlaceholder: "Введите название производителя",
    modelLabel: "Модель оборудования (опционально)",
    manufacturerModelQuestion: "Модель оборудования",
    modelPlaceholder: "Например, 48TC-A12...",
    mfgDocLink: "Смотрите также: официальная техническая документация {name}",
    refrigerantNotSpecified: "— выберите хладагент —",
    refrigerantUnknown: "Не знаю / не могу определить",
    refrigerantLabel: "Хладагент",
    refrigerantStepHint: "Если не знаете хладагент — расчёт перегрева/переохлаждения по P-T таблице будет недоступен, но вы сможете продолжить по качественным показаниям манометров.",
    superheatLabel: "Перегрев (superheat)",
    subcoolingLabel: "Переохлаждение (subcooling)",
    ptCalcLoading: "Расчёт...",
    ptCalcUnavailable: "Хладагент не указан или данных недостаточно — количественный расчёт перегрева/переохлаждения недоступен. Ориентируйтесь на качественные показания манометров и P-T таблицу производителя.",
    ptCalcTypicalRange: "Типичный целевой диапазон: перегрев ~8–12°F, переохлаждение ~10–15°F — уточняйте по паспорту конкретного оборудования.",
    ptCalcAlertText: "Расчётное значение существенно выходит за типичный рабочий диапазон. Это не диагноз, а сигнал присмотреться внимательнее: проверьте показания манометров, места установки датчиков температуры и рассмотрите альтернативные причины.",
    ptCalcAlertFlag: "ВНИМАНИЕ: SH/SC вне типичного диапазона",
    ptCalcOutOfRangeText: "Введённое давление находится за пределами нормального рабочего диапазона P-T таблицы для этого хладагента. Это НЕ погрешность интерполяции — вероятная причина: серьёзная неисправность (утечка, неправильный/перепутанный хладагент, катастрофический отказ компонента). Прекратите обычную диагностику по SH/SC: проверьте системы безопасности, соблюдайте LOTO и рассмотрите немедленную остановку оборудования до выяснения причины.",
    ptCalcOutOfRangeFlag: "ВНИМАНИЕ: давление вне рабочего диапазона — возможен серьёзный отказ",
    ptCalcOutOfRangeValue: "Давление вне табличного диапазона хладагента — SH/SC не рассчитаны",
    ptCalcResultQuestion: "Перегрев/переохлаждение (расчёт по P-T таблице)",
    resumeTitle: "У вас есть незавершённая сессия",
    resumeEquipmentLabel: "Оборудование",
    resumeContinue: "Продолжить",
    resumeStartOver: "Начать заново",
    checklistProgress: "Выполнено: {done} из {total}",
    finishBtn: "✓ Завершить чек-лист",
    finishSummaryTitle: "Итоги сессии",
    finishCompleteBtn: "Завершить",
    finishCompletedMsg: "Сессия завершена. Спасибо!",
    intakePhaseProgress: "Этап {n} из {total}",
    intakeSkipLabel: "N/A",
    intakeGateHint: "Отметьте каждый пункт как сделано либо N/A, чтобы перейти дальше",
    intakeNextPhaseBtn: "Следующий этап →",
    intakeFinishBtn: "Готово — вернуться к результату",
    intakeStartBtn: "🔍 Углублённая диагностика (полный чек-лист)",
    intakeReviewBtn: "✓ Чек-лист пройден (посмотреть)",
  },
  en: {
    back: "← Back",
    restart: "⟲ Start Over",
    badge: { info: "Info", warning: "Warning", critical: "Critical" },
    aiLabel: "AI Analysis",
    aiLoading: "Analyzing checklist...",
    aiErrorPrefix: "Error: ",
    aiRequestError: "Request error",
    aiTruncatedWarning: "The response was cut off due to a length limit. Try refining your question or splitting it into parts.",
    aiSendBtn: "🤖 Send to AI Assistant",
    aiAskRecommended: "🤖 Ask AI Assistant (recommended)",
    aiAsk: "🤖 Ask AI Assistant",
    freeformPlaceholder: "Describe your observations, gauge readings, equipment model...",
    disclaimer: "This tool provides AI-assisted diagnostic suggestions only — it doesn't replace the judgment of a qualified technician. Always follow LOTO and applicable safety codes (OSHA/CSA/local) before working on live electrical, refrigerant, or pressurized components. Use at your own risk.",
    footerDisclaimer: "Independent personal project, provided as-is, with no warranty. Doesn't replace manufacturer documentation, local codes, or the judgment of a qualified technician.",
    nextBtn: "Next",
    numericRangeLabel: "Range:",
    measuredLabel: "Measured value",
    measurementAlertText: "The measured value exceeds the nameplate RLA/FLA. This needs attention, but doesn't necessarily mean immediate replacement — weigh the equipment's overall condition (age, failure history, vibration, noise).",
    measurementAlertFlag: "WARNING: exceeds nameplate rating",
    measurementRefFlaSf: "FLA×SF",
    manufacturerStepTitle: "Equipment manufacturer (optional)",
    manufacturerLabel: "Manufacturer",
    manufacturerNotSpecified: "— not specified —",
    manufacturerOther: "Other",
    manufacturerOtherPlaceholder: "Enter manufacturer name",
    modelLabel: "Equipment model (optional)",
    manufacturerModelQuestion: "Equipment model",
    modelPlaceholder: "e.g. 48TC-A12...",
    mfgDocLink: "See also: official {name} technical documentation",
    refrigerantNotSpecified: "— select refrigerant —",
    refrigerantUnknown: "Don't know / can't tell",
    refrigerantLabel: "Refrigerant",
    refrigerantStepHint: "If you don't know the refrigerant, the P-T-based superheat/subcooling calculation won't be available, but you can still continue using qualitative gauge readings.",
    superheatLabel: "Superheat",
    subcoolingLabel: "Subcooling",
    ptCalcLoading: "Calculating...",
    ptCalcUnavailable: "No refrigerant specified, or not enough data — quantitative superheat/subcooling calculation isn't available. Rely on qualitative gauge readings and the equipment's P-T chart.",
    ptCalcTypicalRange: "Typical target range: superheat ~8-12°F, subcooling ~10-15°F — verify against the specific equipment's nameplate/spec.",
    ptCalcAlertText: "The calculated value is well outside the typical operating range. This isn't a diagnosis by itself — it's a flag to look closer: double-check gauge readings, sensor placement, and consider other possible causes.",
    ptCalcAlertFlag: "WARNING: SH/SC outside typical range",
    ptCalcOutOfRangeText: "The entered pressure is outside the normal operating range of this refrigerant's P-T table. This is NOT an interpolation-precision issue — the likely cause is a serious fault (a leak, the wrong/mixed refrigerant, or a catastrophic component failure). Stop routine SH/SC diagnosis: check the system's safety devices, follow LOTO, and consider shutting the equipment down immediately until the cause is identified.",
    ptCalcOutOfRangeFlag: "WARNING: pressure outside operating range — possible serious fault",
    ptCalcOutOfRangeValue: "Pressure outside the refrigerant's table range — SH/SC not calculated",
    ptCalcResultQuestion: "Superheat/Subcooling (calculated from P-T chart)",
    resumeTitle: "You have an unfinished session",
    resumeEquipmentLabel: "Equipment",
    resumeContinue: "Continue",
    resumeStartOver: "Start Over",
    checklistProgress: "Completed: {done} of {total}",
    finishBtn: "✓ Finish checklist",
    finishSummaryTitle: "Session summary",
    finishCompleteBtn: "Complete",
    finishCompletedMsg: "Session completed. Thank you!",
    intakePhaseProgress: "Phase {n} of {total}",
    intakeSkipLabel: "N/A",
    intakeGateHint: "Mark every item as done or N/A to move on",
    intakeNextPhaseBtn: "Next phase →",
    intakeFinishBtn: "Done — back to results",
    intakeStartBtn: "🔍 Deeper diagnosis (full checklist)",
    intakeReviewBtn: "✓ Checklist completed (review)",
  },
};
const SUPPORTED_LANGS = Object.keys(I18N);
const DEFAULT_LANG = "ru";

// ---- Unit conversions ---------------------------------------------------
// graph.json authors write each value in a single "native" unit only
// (e.g. "115 psig", "40°F", "500 microns"). annotateUnits() finds those
// values at render time and appends the other unit system in parentheses,
// regardless of the selected UI language. Do not hand-author the
// parenthetical equivalent — it's added automatically for any new node.

function roundTo(value, decimals) {
  const factor = 10 ** decimals;
  const rounded = Math.round(value * factor) / factor;
  return Object.is(rounded, -0) ? 0 : rounded;
}

function formatNum(value) {
  return Object.is(value, -0) ? "0" : String(value);
}

const PSIG_PER_KPA = 6.89476;

function convertPressure(value, unit) {
  if (unit === "psig") {
    return { value: roundTo(value * PSIG_PER_KPA, 0), unit: "kPa" };
  }
  return { value: roundTo(value / PSIG_PER_KPA, 0), unit: "psig" };
}

function convertTemperature(value, unit) {
  if (unit === "f") {
    return { value: roundTo(((value - 32) * 5) / 9, 0), unit: "°C" };
  }
  return { value: roundTo((value * 9) / 5 + 32, 0), unit: "°F" };
}

// A *difference* between two temperatures (superheat, subcooling) does not
// carry the +32 offset that an absolute reading does — only the 1.8:1
// scale applies (a 1°F swing is a 1/1.8 = 0.56°C swing, not the -17.2°C
// you'd get by feeding "1" through convertTemperature's absolute formula).
// Keeping this as a separate function/unit ("Δ°F"/"Δ°C") is deliberate:
// reusing convertTemperature for a delta is exactly the bug this fixes.
function convertTemperatureDelta(value, unit) {
  if (unit === "f") {
    return { value: roundTo(value / 1.8, 1), unit: "Δ°C" };
  }
  return { value: roundTo(value * 1.8, 1), unit: "Δ°F" };
}

const MICRONS_PER_INHG = 25400;
const MICRONS_PER_MMHG = 1000;

function convertVacuum(value, unit) {
  if (unit === "microns") {
    return { value: roundTo(value / MICRONS_PER_MMHG, 2), unit: "mmHg" };
  }
  if (unit === "inhg") {
    return { value: roundTo(value * MICRONS_PER_INHG, 0), unit: "microns" };
  }
  return { value: roundTo(value * MICRONS_PER_MMHG, 0), unit: "microns" }; // mmHg -> microns
}

// Guards make this idempotent: (?<![\d(.]) stops a match from starting
// mid-number or mid-decimal (which would otherwise happen when backtracking
// off a blocked start right after "("), and (?!\s*\() stops a value that
// already has a parenthetical equivalent right after it from being
// annotated a second time.
const PRESSURE_RE = /(?<![\d(.])(-?\d+(?:\.\d+)?)\s?(psig|kPa)\b(?!\s*\()/gi;
const TEMPERATURE_RE = /(?<![\d(.])(-?\d+(?:\.\d+)?)\s?°([FfCc])(?!\s*\()/g;
const DELTA_TEMPERATURE_RE = /(?<![\d(.])(-?\d+(?:\.\d+)?)\s?Δ°([FfCc])(?!\s*\()/g;
const VACUUM_RE = /(?<![\d(.])(-?\d+(?:\.\d+)?)\s?(microns|inHg|mmHg)\b(?!\s*\()/gi;

function annotateUnits(text) {
  if (!text) return text;
  let out = text.replace(PRESSURE_RE, (match, num, unit) => {
    const conv = convertPressure(parseFloat(num), unit.toLowerCase());
    return `${match} (${formatNum(conv.value)} ${conv.unit})`;
  });
  // Must run before TEMPERATURE_RE: "Δ°F" also matches "°F", and only this
  // one applies the delta-safe (no +32 offset) conversion.
  out = out.replace(DELTA_TEMPERATURE_RE, (match, num, unit) => {
    const conv = convertTemperatureDelta(parseFloat(num), unit.toLowerCase());
    return `${match} (${formatNum(conv.value)}${conv.unit})`;
  });
  out = out.replace(TEMPERATURE_RE, (match, num, unit) => {
    const conv = convertTemperature(parseFloat(num), unit.toLowerCase());
    return `${match} (${formatNum(conv.value)}${conv.unit})`;
  });
  out = out.replace(VACUUM_RE, (match, num, unit) => {
    const conv = convertVacuum(parseFloat(num), unit.toLowerCase());
    return `${match} (${formatNum(conv.value)} ${conv.unit})`;
  });
  return out;
}

// ---- numeric_input node helpers -----------------------------------------
// Formats a raw numeric answer with its native unit and, when that unit is
// one annotateUnits() recognizes (psig/kPa, °F/°C, microns/inHg/mmHg), the
// dual-unit equivalent gets appended automatically — same mechanism as any
// other graph text, no separate formatting path.
function rawNumericString(value, unit) {
  if (!unit) return String(value);
  return unit.startsWith("°") ? `${value}${unit}` : `${value} ${unit}`;
}

function formatNumericValue(value, unit) {
  return annotateUnits(rawNumericString(value, unit));
}

// Strips everything that isn't a valid "in-progress" number as the user
// types, so letters/junk simply never appear in the field. Keeps at most
// one leading "-" (only when the node allows negative values) and one ".".
function sanitizeNumericInput(raw, allowNegative) {
  let s = raw.replace(allowNegative ? /[^0-9.\-]/g : /[^0-9.]/g, "");
  if (allowNegative) {
    const negative = s.startsWith("-");
    s = s.replace(/-/g, "");
    if (negative) s = "-" + s;
  }
  const parts = s.split(".");
  if (parts.length > 2) {
    s = parts[0] + "." + parts.slice(1).join("");
  }
  return s;
}

// Thresholds are evaluated in order; the first entry whose `max` the value
// doesn't exceed wins. A trailing entry with no `max` is the catch-all for
// "everything above the last threshold". A numeric_input with no thresholds
// at all is just a plain sequential reading (e.g. one step in a P-T
// superheat/subcooling sequence) — it always advances to `node.next`.
function resolveThresholdNext(node, value) {
  if (!node.thresholds) return node.next;
  for (const th of node.thresholds) {
    if (th.max == null || value <= th.max) return th.next;
  }
  return node.thresholds[node.thresholds.length - 1]?.next;
}

// Short label for whatever nameplate reference a measurement entry was
// checked against — used only for display, not stored (computed from the
// node's own config so there's a single source of truth for the wording).
function referenceLabelText(node) {
  if (!node.reference) return "";
  if (node.reference.mode === "fla_sf") return ui().measurementRefFlaSf;
  return t(node.reference.label);
}

// ---- P-T superheat/subcooling calculator --------------------------------
// A reusable module, not tied to any one branch of the graph: a
// refrigerant_select node records state.refrigerant, a plain sequence of
// numeric_input nodes (tagged with `role`) records suction/head pressure and
// suction/liquid-line temperature wherever they're asked, and a pt_calc node
// (placeable anywhere downstream) pulls all of that back out of
// state.refrigerant/state.answers to compute superheat and subcooling. This
// keeps the calculation logic in one place while letting graph.json wire it
// into as many branches as needed by just adding nodes, no code changes.
const REFRIGERANT_ROLES = ["suction_pressure", "suction_temp", "head_pressure", "liquid_temp"];
const refrigerantTableCache = new Map();

// Field techs read gauges to the nearest 1-2 psi/°F, so a wide "clearly
// abnormal" band avoids false alarms on the normal spread between systems —
// the typical target band shown to the user (~8-12°F SH, ~10-15°F SC) is
// narrower than the alert band on purpose.
const PT_SH_ALERT = { min: 3, max: 20 };
const PT_SC_ALERT = { min: 5, max: 20 };

async function loadRefrigerantTable(id) {
  if (refrigerantTableCache.has(id)) return refrigerantTableCache.get(id);
  const entry = (REFRIGERANTS || []).find((r) => r.id === id);
  if (!entry) return null;
  try {
    const res = await fetch(`./${entry.file}`);
    const points = await res.json();
    refrigerantTableCache.set(id, points);
    return points;
  } catch {
    return null;
  }
}

// Piecewise-linear interpolation of temp_f as a function of pressure along
// one curve (bubble for the liquid/condensing side, dew for the vapor/
// evaporating side — the two differ for a blend with real glide, and
// collapse to the same curve for a pure fluid/near-azeotrope). Points must
// be sorted ascending by temp_f, which is also ascending by pressure.
// Deliberately does NOT extrapolate beyond the table's range (-40F to
// 150F, refrigerant-dependent): a suction/head pressure outside a normal
// refrigeration/AC cycle's range isn't an interpolation-precision problem,
// it's a sign the system itself isn't in a normal operating state (leak,
// wrong refrigerant, a component failure) — returning a computed-looking
// number there would be false precision. Callers must treat null as "can't
// compute, and that's itself the finding" rather than a missing-data case.
function saturationTemp(points, pressurePsig, curve) {
  const key = curve === "bubble" ? "bubble_psig" : "dew_psig";
  const n = points.length;
  if (n === 0) return null;
  if (pressurePsig < points[0][key] || pressurePsig > points[n - 1][key]) return null;
  if (n === 1) return points[0].temp_f;
  for (let i = 0; i < n - 1; i++) {
    if (pressurePsig >= points[i][key] && pressurePsig <= points[i + 1][key]) {
      const p0 = points[i][key];
      const p1 = points[i + 1][key];
      const t0 = points[i].temp_f;
      const t1 = points[i + 1].temp_f;
      if (p1 === p0) return t0;
      return t0 + ((pressurePsig - p0) / (p1 - p0)) * (t1 - t0);
    }
  }
  return null;
}

// Scans backward from the current point in the checklist for the most
// recent numeric_input answer tagged with the given role — this is what
// lets pt_calc sit anywhere downstream of the reading nodes rather than
// needing to know their exact node ids.
function findAnswerByRole(role) {
  for (let i = state.answers.length - 1; i >= 0; i--) {
    const entry = state.answers[i];
    const node = GRAPH.nodes[entry.nodeId];
    if (node && node.role === role && entry.value != null) return entry.value;
  }
  return null;
}

// status is one of:
//   "unavailable"  - no refrigerant picked (or "don't know"), or a reading
//                    is missing - nothing to compute, nothing alarming
//   "out_of_range" - refrigerant known and readings present, but suction or
//                    head pressure falls outside that refrigerant's P-T
//                    table entirely - deliberately NOT computed (see
//                    saturationTemp); this is itself the finding
//   "ok"           - superheat/subcooling computed normally
async function computePtResult() {
  const suctionPressure = findAnswerByRole("suction_pressure");
  const suctionTemp = findAnswerByRole("suction_temp");
  const headPressure = findAnswerByRole("head_pressure");
  const liquidTemp = findAnswerByRole("liquid_temp");
  const refrigerant = state.refrigerant;

  if (
    !refrigerant ||
    refrigerant.id === "unknown" ||
    [suctionPressure, suctionTemp, headPressure, liquidTemp].some((v) => v == null)
  ) {
    return { status: "unavailable" };
  }
  const points = await loadRefrigerantTable(refrigerant.id);
  if (!points) return { status: "unavailable" };

  const satEvapTemp = saturationTemp(points, suctionPressure, "dew");
  const satCondTemp = saturationTemp(points, headPressure, "bubble");
  if (satEvapTemp == null || satCondTemp == null) {
    return { status: "out_of_range" };
  }
  return {
    status: "ok",
    superheat: suctionTemp - satEvapTemp,
    subcooling: satCondTemp - liquidTemp,
  };
}

// Answers can come from a question node (an option was picked), a
// numeric_input node (a value was typed), a measurement node (a value was
// typed, optionally against a nameplate reference), or a one-time field
// captured outside graph.json nodes (entry.field, e.g. manufacturer/model,
// refrigerant, or the pt_calc result) — this resolves any shape to the text
// shown in the breadcrumb and sent to the AI assistant.
function answerLabel(entry) {
  if (entry.field === "manufacturer" || entry.field === "model" || entry.field === "refrigerant") {
    return entry.value;
  }
  if (entry.field === "pt_result") {
    if (!entry.exceeds) return entry.value;
    const flag = entry.critical ? ui().ptCalcOutOfRangeFlag : ui().ptCalcAlertFlag;
    return `${entry.value} — ${flag}`;
  }
  const node = GRAPH.nodes[entry.nodeId];
  if (!node) return "";
  if (entry.optionIndex != null) {
    const opt = node.options?.[entry.optionIndex];
    return opt ? t(opt.label) : "";
  }
  if (entry.value != null) {
    let label = formatNumericValue(entry.value, node.unit);
    if (entry.reference != null) {
      label += ` (${referenceLabelText(node)}: ${formatNumericValue(entry.reference, node.unit)})`;
    }
    if (entry.exceeds) {
      label += ` — ${ui().measurementAlertFlag}`;
    }
    return label;
  }
  return "";
}

// Sentinel currentId for the one-time manufacturer/model step inserted
// right after the equipment-type answer on the graph's start node. It isn't
// a real graph.json node — render() and goBack() special-case it — because
// it always leads to whatever node the chosen equipment type would have
// gone to anyway; there's nothing for it to branch on.
const MANUFACTURER_STEP_ID = "__manufacturer__";

// Sentinel currentId for the final summary/completion screen, reached via a
// button on a result node's checklist (see renderChecklist/renderResult).
// Also not a real graph.json node — same reasoning as MANUFACTURER_STEP_ID.
const FINISH_STEP_ID = "__finish__";

// Sentinel currentId for the phased intake checklist (visual -> electrical
// -> controls/safety -> refrigeration circuit) — "check the simple stuff
// first." Deliberately NOT a mandatory detour before symptom selection:
// the simple qualitative graph + a single AI ask handles most cases fine,
// so this is opt-in, offered as a button on result/ai_prompt screens (see
// startIntakeChecklist) for when a deeper pass is actually warranted.
// Content lives in graph.json's intake_checklist (not this file), same
// editable-without-a-rebuild philosophy as everything else. Not a real
// graph.json node — same reasoning as MANUFACTURER_STEP_ID.
const INTAKE_STEP_ID = "__intake__";

let GRAPH = null;
let MANUFACTURERS = null;
let REFRIGERANTS = null;
let LANG = localStorage.getItem("hvac_lang");
if (!SUPPORTED_LANGS.includes(LANG)) {
  const browserLang = (navigator.language || "").slice(0, 2);
  LANG = SUPPORTED_LANGS.includes(browserLang) ? browserLang : DEFAULT_LANG;
}

function generateSessionId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }
  return `sess-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

let state = {
  currentId: null,
  history: [],   // stack of previous node ids
  answers: [],   // [{nodeId, optionIndex}] for question; [{nodeId, value}] for numeric_input;
                 // [{nodeId, value, reference, exceeds}] for measurement (reference/exceeds may be null/false);
                 // [{nodeId: MANUFACTURER_STEP_ID, field: "manufacturer"|"model", value}] for the mfg step
  sessionId: generateSessionId(),
  manufacturer: null,       // {id, name, url} once picked/typed, else null
  manufacturerAsked: false, // whether the one-time step has already run this session
  pendingNodeId: null,      // where to go once the manufacturer/intake step is submitted
  refrigerant: null,        // {id, name} once picked on a refrigerant_select node, else null
  checklist: {},            // {[resultNodeId]: {[itemId]: boolean|string}} — see renderChecklist
  finishNodeId: null,       // which result node's checklist the finish screen is summarizing
  intake: {},               // {[phaseId]: {[itemId]: {value, skipped}}} — see renderIntakeChecklist
  intakeAsked: false,       // whether the one-time intake checklist has already run this session
  intakePhaseIndex: 0,      // which intake_checklist phase is currently shown
};

function t(dict) {
  if (dict == null) return "";
  if (typeof dict === "string") return annotateUnits(dict);
  const raw = dict[LANG] ?? dict[DEFAULT_LANG] ?? "";
  return annotateUnits(raw);
}

function ui() {
  return I18N[LANG] || I18N[DEFAULT_LANG];
}

async function loadGraph() {
  const [graphRes] = await Promise.all([
    fetch("./graph.json"),
    loadManufacturers(),
    loadRefrigerants(),
  ]);
  GRAPH = await graphRes.json();

  const resumable = await checkResumableSession();
  if (resumable) {
    // Reflect the session actually being offered (not the fresh id `state`
    // was seeded with at module load) so the footer/screenshot is accurate
    // even before the technician picks Continue vs. Start over.
    state.sessionId = resumable.session_id;
    renderResumePrompt(resumable);
  } else {
    goTo(GRAPH.start, { pushHistory: false });
  }
}

async function loadManufacturers() {
  try {
    const res = await fetch("./manufacturers.json");
    MANUFACTURERS = await res.json();
  } catch {
    MANUFACTURERS = [];
  }
}

async function loadRefrigerants() {
  try {
    const res = await fetch("./refrigerants.json");
    REFRIGERANTS = await res.json();
  } catch {
    REFRIGERANTS = [];
  }
}

// Shows exactly what's deployed (short commit hash + commit date), baked
// into the image at build time — see Dockerfile / docker-compose*.yml
// build.args and /api/version. Purely informational, so a failed fetch
// just leaves that part of the footer blank instead of blocking anything else.
let versionData = null;

async function loadVersionInfo() {
  try {
    const res = await fetch("./api/version");
    const data = await res.json();
    if (data.commit && data.commit !== "unknown") {
      versionData = data;
    }
  } catch {
    // leave blank
  }
  renderFooterInfo();
}

// Same footer line as the commit hash/date above, so a technician's
// screenshot of a stuck screen carries the session_id needed to pull
// node_path/checklist_state straight from the DB (see sessions table in
// main.py) instead of a back-and-forth about what was clicked. Short form
// (first 8 chars) is enough to disambiguate visually and by DB prefix
// lookup — the full UUID is still in localStorage/the sessions table.
function renderFooterInfo() {
  const parts = ["IvanK"];
  if (versionData) parts.push(`${versionData.commit} · ${versionData.commit_date}`);
  if (state.sessionId) parts.push(`session: ${state.sessionId.slice(0, 8)}`);
  versionInfoEl.textContent = parts.join(" · ");
}

// ---- Session persistence (resume across page reloads/lost signal) -------
// Everything the checklist needs to pick back up exactly where it left off
// (currentId, history, answers, manufacturer/refrigerant picks, and the
// finish-screen's target node) is serialized as one opaque blob the backend
// just stores and returns — see SessionUpsertRequest.node_path in main.py.
// checklist_state (the per-result-node checkbox/field values) is kept as a
// separate blob since it's conceptually distinct from graph position.
const SESSION_SAVE_DEBOUNCE_MS = 800;
let sessionSaveTimer = null;

function serializeNodePath() {
  return {
    currentId: state.currentId,
    history: state.history,
    answers: state.answers,
    manufacturer: state.manufacturer,
    manufacturerAsked: state.manufacturerAsked,
    pendingNodeId: state.pendingNodeId,
    refrigerant: state.refrigerant,
    finishNodeId: state.finishNodeId,
    intake: state.intake,
    intakeAsked: state.intakeAsked,
    intakePhaseIndex: state.intakePhaseIndex,
  };
}

// The first answer is always the equipment-type choice from the graph's
// start node — same convention as the equipment_type column in
// checklist_sessions (see main.py _save_session).
function equipmentLabel() {
  const first = state.answers[0];
  if (!first || first.nodeId !== GRAPH.start || first.optionIndex == null) return null;
  return answerLabel(first);
}

function saveSession(status = "active") {
  localStorage.setItem("hvac_session_id", state.sessionId);
  fetch("./api/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      session_id: state.sessionId,
      equipment: equipmentLabel(),
      node_path: serializeNodePath(),
      checklist_state: state.checklist,
      status,
    }),
  }).catch(() => {});
}

function scheduleSessionSave() {
  if (sessionSaveTimer) clearTimeout(sessionSaveTimer);
  sessionSaveTimer = setTimeout(() => saveSession(), SESSION_SAVE_DEBOUNCE_MS);
}

// Checked once at boot (see loadGraph). Returns the saved session record
// only if it's still "active" — a completed or already-abandoned session
// (including one the TTL cleanup task in main.py reclassified) is treated
// the same as "nothing to resume", so the user lands on a fresh start
// without an unnecessary prompt.
async function checkResumableSession() {
  const savedId = localStorage.getItem("hvac_session_id");
  if (!savedId) return null;
  try {
    const res = await fetch(`./api/session/${encodeURIComponent(savedId)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.status === "active" ? data : null;
  } catch {
    return null;
  }
}

function renderResumePrompt(data) {
  const strings = ui();
  breadcrumbEl.innerHTML = "";
  backBtn.style.display = "none";
  cardEl.innerHTML = "";
  renderFooterInfo();

  const title = document.createElement("div");
  title.className = "q-text";
  title.textContent = strings.resumeTitle;
  cardEl.appendChild(title);

  if (data.equipment) {
    const hint = document.createElement("div");
    hint.className = "numeric-hint";
    hint.textContent = `${strings.resumeEquipmentLabel}: ${data.equipment}`;
    cardEl.appendChild(hint);
  }

  const opts = document.createElement("div");
  opts.className = "options";

  const continueBtn = document.createElement("button");
  continueBtn.className = "btn input-action";
  continueBtn.textContent = strings.resumeContinue;
  continueBtn.onclick = () => resumeSession(data);
  opts.appendChild(continueBtn);

  const startOverBtn = document.createElement("button");
  startOverBtn.className = "btn ghost";
  startOverBtn.textContent = strings.resumeStartOver;
  startOverBtn.onclick = () => abandonAndRestart(data);
  opts.appendChild(startOverBtn);

  cardEl.appendChild(opts);
}

function resumeSession(data) {
  const np = data.node_path || {};
  state = {
    currentId: np.currentId || GRAPH.start,
    history: np.history || [],
    answers: np.answers || [],
    sessionId: data.session_id,
    manufacturer: np.manufacturer || null,
    manufacturerAsked: !!np.manufacturerAsked,
    pendingNodeId: np.pendingNodeId || null,
    refrigerant: np.refrigerant || null,
    checklist: data.checklist_state || {},
    finishNodeId: np.finishNodeId || null,
    intake: np.intake || {},
    intakeAsked: !!np.intakeAsked,
    intakePhaseIndex: np.intakePhaseIndex || 0,
  };
  render();
}

// The declined session is marked abandoned (not deleted — kept around as
// future outcome-tracking data, same as the TTL cleanup's classification)
// before a brand-new session starts. Reuses the same upsert shape, just
// with the last-known node_path/checklist_state resubmitted as-is.
function abandonAndRestart(data) {
  fetch("./api/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      session_id: data.session_id,
      equipment: data.equipment,
      node_path: data.node_path,
      checklist_state: data.checklist_state,
      status: "abandoned",
    }),
  }).catch(() => {});
  restart();
}

// ---- Checklist (on result nodes) + finish screen -------------------------
// graph.json's optional `checklist` field on a result node is a plain list
// of {id, type: "checkbox"|"field", label, unit?} items — a lightweight
// "confirm you actually did this" follow-through list shown right under the
// recommendation, distinct from the AI box above it. State lives in
// state.checklist[nodeId][itemId], persisted via the same debounced
// session save as everything else.
function isChecklistItemDone(value, type) {
  return type === "field" ? !!(value && String(value).trim()) : !!value;
}

function checklistProgressText(nodeId, items) {
  const values = state.checklist[nodeId] || {};
  const done = items.filter((item) => isChecklistItemDone(values[item.id], item.type)).length;
  return ui()
    .checklistProgress.replace("{done}", done)
    .replace("{total}", items.length);
}

function renderChecklist(nodeId, items, container) {
  if (!items || !items.length) return;
  if (!state.checklist[nodeId]) state.checklist[nodeId] = {};
  const values = state.checklist[nodeId];

  const wrap = document.createElement("div");
  wrap.className = "checklist";

  const progress = document.createElement("div");
  progress.className = "checklist-progress";
  wrap.appendChild(progress);

  function updateProgress() {
    progress.textContent = checklistProgressText(nodeId, items);
  }

  items.forEach((item) => {
    const row = document.createElement("label");
    row.className = "checklist-item";

    if (item.type === "field") {
      const labelEl = document.createElement("span");
      labelEl.textContent = t(item.label);
      row.appendChild(labelEl);
      const input = document.createElement("input");
      input.type = "text";
      input.className = "checklist-field-input";
      if (item.unit) input.placeholder = item.unit;
      input.value = values[item.id] || "";
      input.addEventListener("input", () => {
        values[item.id] = input.value;
        updateProgress();
        scheduleSessionSave();
      });
      row.appendChild(input);
    } else {
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = !!values[item.id];
      checkbox.addEventListener("change", () => {
        values[item.id] = checkbox.checked;
        updateProgress();
        scheduleSessionSave();
      });
      row.appendChild(checkbox);
      const labelEl = document.createElement("span");
      labelEl.textContent = t(item.label);
      row.appendChild(labelEl);
    }
    wrap.appendChild(row);
  });

  updateProgress();
  container.appendChild(wrap);
}

// Reached via the "Finish checklist" button on a result node (see
// renderResult) — a dedicated recap screen (full answer path + the same
// checklist state, still editable) ending in an explicit "Complete" action
// that marks the session status=completed server-side. Pure UI navigation,
// not a graph.json node — see FINISH_STEP_ID and the goBack() special case.
function renderFinishScreen() {
  const strings = ui();
  const nodeId = state.finishNodeId;
  const node = nodeId ? GRAPH.nodes[nodeId] : null;

  const title = document.createElement("div");
  title.className = "q-text";
  title.textContent = strings.finishSummaryTitle;
  cardEl.appendChild(title);

  const summary = document.createElement("div");
  summary.className = "finish-summary";
  currentAnswers().forEach((qa) => {
    if (!qa.answer) return;
    const row = document.createElement("div");
    row.className = "finish-summary-row";
    const q = document.createElement("div");
    q.className = "finish-summary-q";
    q.textContent = qa.question;
    const a = document.createElement("div");
    a.className = "finish-summary-a";
    a.textContent = qa.answer;
    row.appendChild(q);
    row.appendChild(a);
    summary.appendChild(row);
  });
  cardEl.appendChild(summary);

  if (node && node.checklist && node.checklist.length) {
    renderChecklist(nodeId, node.checklist, cardEl);
  }

  // The finish screen has the fullest picture available (graph path +
  // checklist, both now in aiContextAnswers()) — worth an AI box here even
  // though the result screen already has one, since checklist values are
  // often filled in only after that first AI ask.
  if (node) {
    const aiBox = buildAiBox({
      context: t(node.text),
      highlighted: !!node.ai,
      nodeId,
      severity: node.severity || "info",
    });
    cardEl.appendChild(aiBox);
  }

  const completeBtn = document.createElement("button");
  completeBtn.className = "btn input-action";
  completeBtn.textContent = strings.finishCompleteBtn;
  cardEl.appendChild(completeBtn);

  const doneMsg = document.createElement("div");
  doneMsg.className = "numeric-hint";
  cardEl.appendChild(doneMsg);

  completeBtn.onclick = () => {
    if (sessionSaveTimer) {
      clearTimeout(sessionSaveTimer);
      sessionSaveTimer = null;
    }
    saveSession("completed");
    completeBtn.disabled = true;
    doneMsg.textContent = strings.finishCompletedMsg;
  };
}

// ---- Phased intake checklist (visual -> electrical -> controls/safety ->
// refrigeration circuit) -----------------------------------------------
// Content lives in graph.json's intake_checklist (array of phases, each
// {id, label, items: [{id, type, label, unit?, showIf?}]}) — same
// editable-without-a-rebuild philosophy as the rest of the graph. Hard
// gate BETWEEN phases (can't advance until every visible item in the
// current phase is either done or explicitly skipped — see
// intakeItemResolved) because the phase order (visual -> electrical ->
// controls -> refrigeration) is a deliberate procedural rule, not a
// diagnostic judgment call. No gate WITHIN a phase (soft nudge only, via
// the "current" highlight) since item order there is just a suggestion.
// showIf lets a later phase's item depend on an earlier phase's answer
// (e.g. only ask about the TXV bulb if a TXV was actually noted present in
// the visual/inventory phase).

function intakeShowIfMet(showIf) {
  if (!showIf) return true;
  const entry = (state.intake[showIf.phase] || {})[showIf.item];
  return !!(entry && entry.value) === !!showIf.equals;
}

// An item satisfies the phase gate once it's either done (see
// isChecklistItemDone) or explicitly marked skipped/N-A — a bare unchecked
// checkbox does NOT satisfy it, specifically so a tech can't silently
// breeze past an item without at least an explicit "doesn't apply" call.
function intakeItemResolved(entry, type) {
  if (!entry) return false;
  if (entry.skipped) return true;
  return isChecklistItemDone(entry.value, type);
}

// Entry point for the "Deeper diagnosis" button on a result/ai_prompt
// screen (see buildAiBox usage in renderResult/renderAiPrompt) — always
// restarts at phase 0 so re-reviewing an already-completed checklist walks
// through every phase again rather than landing on just the last one
// (earlier phases' answers are still there, already resolved, so a review
// pass is just clicking "Next phase" through them unless something needs
// changing).
function startIntakeChecklist(returnNodeId) {
  state.pendingNodeId = returnNodeId;
  state.intakePhaseIndex = 0;
  goTo(INTAKE_STEP_ID, { prevId: returnNodeId });
}

function finishIntakeChecklist() {
  state.intakeAsked = true;
  const target = state.pendingNodeId;
  state.pendingNodeId = null;
  goTo(target, { prevId: INTAKE_STEP_ID });
}

function renderIntakeChecklist() {
  const strings = ui();
  const phases = GRAPH.intake_checklist || [];
  if (!phases.length) {
    // No intake content defined in this graph.json — skip straight through
    // rather than showing an empty gated screen.
    finishIntakeChecklist();
    return;
  }
  const phaseIndex = Math.min(state.intakePhaseIndex, phases.length - 1);
  const phase = phases[phaseIndex];
  if (!state.intake[phase.id]) state.intake[phase.id] = {};
  const values = state.intake[phase.id];

  const progress = document.createElement("div");
  progress.className = "intake-progress";
  progress.textContent = strings.intakePhaseProgress
    .replace("{n}", phaseIndex + 1)
    .replace("{total}", phases.length);
  cardEl.appendChild(progress);

  const title = document.createElement("div");
  title.className = "q-text";
  title.textContent = t(phase.label);
  cardEl.appendChild(title);

  const visibleItems = phase.items.filter((item) => intakeShowIfMet(item.showIf));
  let firstUnresolvedFound = false;

  const nextBtn = document.createElement("button");
  const hint = document.createElement("div");
  hint.className = "numeric-hint";

  function updateGateState() {
    const allResolved = visibleItems.every((item) => intakeItemResolved(values[item.id], item.type));
    nextBtn.disabled = !allResolved;
    hint.textContent = allResolved ? "" : strings.intakeGateHint;
  }

  visibleItems.forEach((item) => {
    if (!values[item.id]) {
      values[item.id] = { value: item.type === "field" ? "" : false, skipped: false };
    }
    const entry = values[item.id];
    const resolved = intakeItemResolved(entry, item.type);
    const isCurrent = !resolved && !firstUnresolvedFound;
    if (isCurrent) firstUnresolvedFound = true;

    const row = document.createElement("div");
    row.className = "intake-item" + (isCurrent ? " current" : "");

    const main = document.createElement("label");
    main.className = "intake-item-main";

    if (item.type === "field") {
      const labelEl = document.createElement("span");
      labelEl.textContent = t(item.label);
      main.appendChild(labelEl);
      const input = document.createElement("input");
      input.type = "text";
      input.className = "checklist-field-input";
      if (item.unit) input.placeholder = item.unit;
      input.value = entry.value || "";
      input.disabled = entry.skipped;
      // Only updates the gate (button/hint), never a full re-render — a
      // full render() on every keystroke would reset focus/cursor position
      // mid-typing. Safe here because showIf conditions in this graph only
      // ever depend on checkbox items, never on a field's value.
      input.addEventListener("input", () => {
        entry.value = input.value;
        scheduleSessionSave();
        updateGateState();
      });
      main.appendChild(input);
    } else {
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = !!entry.value;
      checkbox.disabled = entry.skipped;
      // A full render() here (not just updateGateState()) is deliberate: a
      // checkbox can be a showIf trigger for a later phase's item, so
      // toggling one may need to reveal/hide other items, not just flip
      // the gate.
      checkbox.addEventListener("change", () => {
        entry.value = checkbox.checked;
        scheduleSessionSave();
        render();
      });
      main.appendChild(checkbox);
      const labelEl = document.createElement("span");
      labelEl.textContent = t(item.label);
      main.appendChild(labelEl);
    }
    row.appendChild(main);

    const skipLabel = document.createElement("label");
    skipLabel.className = "intake-skip";
    const skipCheckbox = document.createElement("input");
    skipCheckbox.type = "checkbox";
    skipCheckbox.checked = !!entry.skipped;
    skipCheckbox.addEventListener("change", () => {
      entry.skipped = skipCheckbox.checked;
      scheduleSessionSave();
      render();
    });
    skipLabel.appendChild(skipCheckbox);
    const skipText = document.createElement("span");
    skipText.textContent = strings.intakeSkipLabel;
    skipLabel.appendChild(skipText);
    row.appendChild(skipLabel);

    cardEl.appendChild(row);
  });

  nextBtn.className = "btn input-action";
  nextBtn.textContent =
    phaseIndex === phases.length - 1 ? strings.intakeFinishBtn : strings.intakeNextPhaseBtn;
  cardEl.appendChild(nextBtn);
  cardEl.appendChild(hint);
  updateGateState();

  nextBtn.onclick = () => {
    if (phaseIndex < phases.length - 1) {
      state.intakePhaseIndex = phaseIndex + 1;
      scheduleSessionSave();
      render();
    } else {
      finishIntakeChecklist();
    }
  };
}

function goTo(nodeId, { pushHistory = true, prevId = null } = {}) {
  if (pushHistory && prevId) {
    state.history.push(prevId);
  }
  state.currentId = nodeId;
  render();
}

function goBack() {
  if (state.history.length === 0) return;
  // The finish screen and the intake checklist screen are both pure UI
  // navigation (see FINISH_STEP_ID/INTAKE_STEP_ID) — entering either never
  // added an answer entry, so leaving them must not pop one either.
  const leavingFinishScreen = state.currentId === FINISH_STEP_ID;
  const leavingIntakeScreen = state.currentId === INTAKE_STEP_ID;
  const prev = state.history.pop();
  if (prev === MANUFACTURER_STEP_ID) {
    // The manufacturer step can add 0, 1, or 2 answer entries (manufacturer
    // and/or model, both optional) instead of the usual one — undo all of
    // them, not just the last one, so re-submitting doesn't leave stragglers.
    while (state.answers.length && state.answers[state.answers.length - 1].nodeId === MANUFACTURER_STEP_ID) {
      state.answers.pop();
    }
  } else if (prev === INTAKE_STEP_ID) {
    // Finishing the intake checklist never added an answer entry either —
    // nothing to undo.
  } else if (!leavingFinishScreen && !leavingIntakeScreen) {
    // assumes 1 answer per question/numeric_input/measurement/refrigerant_select/
    // pt_calc step
    const popped = state.answers.pop();
    if (popped && popped.field === "refrigerant") {
      state.refrigerant = null;
    }
  }
  if (prev === MANUFACTURER_STEP_ID || prev === GRAPH.start) {
    state.manufacturerAsked = false;
  }
  // Deliberately no reset of state.intake/intakeAsked/intakePhaseIndex here:
  // unlike the manufacturer step, the intake checklist is opt-in and
  // repeatable (see startIntakeChecklist), not a one-time gate tied to this
  // navigation — going back into it should just show what's already there,
  // never silently discard a completed checklist.
  state.currentId = prev;
  render();
}

function restart() {
  state = {
    currentId: GRAPH.start,
    history: [],
    answers: [],
    sessionId: generateSessionId(),
    manufacturer: null,
    manufacturerAsked: false,
    pendingNodeId: null,
    refrigerant: null,
    checklist: {},
    finishNodeId: null,
    intake: {},
    intakeAsked: false,
    intakePhaseIndex: 0,
  };
  render();
}

function setLang(lang) {
  if (!SUPPORTED_LANGS.includes(lang) || lang === LANG) return;
  LANG = lang;
  localStorage.setItem("hvac_lang", lang);
  document.documentElement.lang = lang;
  updateStaticUi();
  if (GRAPH) render();
}

function updateStaticUi() {
  const strings = ui();
  backBtn.textContent = strings.back;
  restartBtn.textContent = strings.restart;
  disclaimerEl.textContent = strings.disclaimer;
  footerDisclaimerEl.textContent = strings.footerDisclaimer;
  langButtons.forEach((b) => b.classList.toggle("active", b.dataset.lang === LANG));
}

function renderBreadcrumb() {
  breadcrumbEl.innerHTML = "";
  state.answers.forEach((entry) => {
    const label = answerLabel(entry);
    if (!label) return;
    const chip = document.createElement("span");
    chip.className = entry.exceeds ? "chip chip-alert" : "chip";
    chip.textContent = label;
    breadcrumbEl.appendChild(chip);
  });
  backBtn.style.display = state.history.length ? "inline-block" : "none";
}

function render() {
  renderBreadcrumb();
  renderFooterInfo();
  cardEl.innerHTML = "";
  scheduleSessionSave();

  if (state.currentId === MANUFACTURER_STEP_ID) {
    renderManufacturerStep();
    return;
  }
  if (state.currentId === FINISH_STEP_ID) {
    renderFinishScreen();
    return;
  }
  if (state.currentId === INTAKE_STEP_ID) {
    renderIntakeChecklist();
    return;
  }

  const node = GRAPH.nodes[state.currentId];

  if (node.type === "question") {
    renderQuestion(node);
  } else if (node.type === "result") {
    renderResult(node);
  } else if (node.type === "ai_prompt") {
    renderAiPrompt(node);
  } else if (node.type === "numeric_input") {
    renderNumericInput(node);
  } else if (node.type === "measurement") {
    renderMeasurement(node);
  } else if (node.type === "refrigerant_select") {
    renderRefrigerantSelect(node);
  } else if (node.type === "pt_calc") {
    renderPtCalc(node);
  }
}

function renderQuestion(node) {
  const q = document.createElement("div");
  q.className = "q-text";
  q.textContent = t(node.text);
  cardEl.appendChild(q);

  const opts = document.createElement("div");
  opts.className = "options";
  node.options.forEach((opt, idx) => {
    const b = document.createElement("button");
    b.className = "btn";
    b.textContent = t(opt.label);
    b.onclick = () => {
      state.answers.push({ nodeId: state.currentId, optionIndex: idx });
      // Right after the very first choice (equipment type, on the graph's
      // start node) — and only once per session — detour through the
      // manufacturer/model step before continuing to the chosen branch.
      if (state.currentId === GRAPH.start && !state.manufacturerAsked) {
        state.pendingNodeId = opt.next;
        state.history.push(state.currentId);
        state.currentId = MANUFACTURER_STEP_ID;
        render();
        return;
      }
      // "__pending__" is a graph.json convention (used by thermostat_check's
      // "Yes" option) for "resume wherever the equipment-type choice was
      // originally headed" — lets the universal power/thermostat gate
      // questions live as plain shared nodes instead of being duplicated
      // per equipment type just to know where to route afterward.
      const nextId = opt.next === "__pending__" ? state.pendingNodeId : opt.next;
      goTo(nextId, { prevId: state.currentId });
    };
    opts.appendChild(b);
  });
  cardEl.appendChild(opts);
}

// One-time step (not a graph.json node — see MANUFACTURER_STEP_ID) shown
// once, right after equipment type is picked. Both fields are optional:
// leaving the dropdown unset and the model blank and clicking Next just
// skips straight to state.pendingNodeId without recording anything.
function renderManufacturerStep() {
  const strings = ui();

  const q = document.createElement("div");
  q.className = "q-text";
  q.textContent = strings.manufacturerStepTitle;
  cardEl.appendChild(q);

  const mfgWrap = document.createElement("div");
  mfgWrap.className = "measurement-field";
  const mfgLabel = document.createElement("div");
  mfgLabel.className = "measurement-field-label";
  mfgLabel.textContent = strings.manufacturerLabel;
  mfgWrap.appendChild(mfgLabel);

  const select = document.createElement("select");
  select.className = "numeric-input";
  const blankOpt = document.createElement("option");
  blankOpt.value = "";
  blankOpt.textContent = strings.manufacturerNotSpecified;
  select.appendChild(blankOpt);
  (MANUFACTURERS || []).forEach((m) => {
    const o = document.createElement("option");
    o.value = m.id;
    o.textContent = m.name;
    select.appendChild(o);
  });
  const otherOpt = document.createElement("option");
  otherOpt.value = "other";
  otherOpt.textContent = strings.manufacturerOther;
  select.appendChild(otherOpt);
  mfgWrap.appendChild(select);
  cardEl.appendChild(mfgWrap);

  const otherInput = document.createElement("input");
  otherInput.type = "text";
  otherInput.className = "numeric-input";
  otherInput.placeholder = strings.manufacturerOtherPlaceholder;
  otherInput.style.display = "none";
  cardEl.appendChild(otherInput);

  select.addEventListener("change", () => {
    otherInput.style.display = select.value === "other" ? "block" : "none";
  });

  const modelWrap = document.createElement("div");
  modelWrap.className = "measurement-field";
  const modelLabel = document.createElement("div");
  modelLabel.className = "measurement-field-label";
  modelLabel.textContent = strings.modelLabel;
  modelWrap.appendChild(modelLabel);
  const modelInput = document.createElement("input");
  modelInput.type = "text";
  modelInput.className = "numeric-input";
  modelInput.placeholder = strings.modelPlaceholder;
  modelWrap.appendChild(modelInput);
  cardEl.appendChild(modelWrap);

  const nextBtn = document.createElement("button");
  nextBtn.className = "btn input-action";
  nextBtn.textContent = strings.nextBtn;
  cardEl.appendChild(nextBtn);

  nextBtn.onclick = () => {
    let manufacturer = null;
    if (select.value === "other") {
      const customName = otherInput.value.trim();
      if (customName) manufacturer = { id: "other", name: customName, url: null };
    } else if (select.value) {
      manufacturer = (MANUFACTURERS || []).find((m) => m.id === select.value) || null;
    }
    const model = modelInput.value.trim();

    if (manufacturer) {
      state.answers.push({ nodeId: MANUFACTURER_STEP_ID, field: "manufacturer", value: manufacturer.name });
    }
    if (model) {
      state.answers.push({ nodeId: MANUFACTURER_STEP_ID, field: "model", value: model });
    }
    state.manufacturer = manufacturer;
    state.manufacturerAsked = true;

    // Two universal "check the simple stuff first" gate questions (power,
    // then thermostat/controller call) come next for every equipment type,
    // before symptom-specific branching — regular graph.json question
    // nodes, not a JS sentinel, since they're just plain yes/no content.
    // thermostat_check's "Yes" option resolves the "__pending__" marker
    // (see renderQuestion) back to whatever symptom node this equipment
    // type would have led to — pendingNodeId is deliberately NOT cleared
    // here so that resolution can happen later, once both gates pass.
    if (GRAPH.nodes["power_check"]) {
      goTo("power_check", { prevId: MANUFACTURER_STEP_ID });
    } else {
      const target = state.pendingNodeId;
      state.pendingNodeId = null;
      goTo(target, { prevId: MANUFACTURER_STEP_ID });
    }
  };
}

// If a real (non-"Other") manufacturer was picked, every terminal node
// (result / ai_prompt) offers a link to its official docs — never an
// AI-guessed URL, only what's in manufacturers.json.
function buildMfgDocLink() {
  if (!state.manufacturer || !state.manufacturer.url) return null;
  const box = document.createElement("div");
  box.className = "mfg-doc-link";
  const a = document.createElement("a");
  a.href = state.manufacturer.url;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.textContent = ui().mfgDocLink.replace("{name}", state.manufacturer.name);
  box.appendChild(a);
  return box;
}

// Opt-in entry point into the phased intake checklist (see
// startIntakeChecklist) — shown on result/ai_prompt screens, after the
// simple qualitative graph and a single AI ask, for the cases where that
// wasn't enough and a deeper "check the simple stuff" pass is actually
// warranted. Returns null if this graph.json defines no intake content.
function buildIntakeTriggerButton(returnNodeId) {
  if (!(GRAPH.intake_checklist || []).length) return null;
  const strings = ui();
  const btn = document.createElement("button");
  btn.className = "btn ghost";
  btn.textContent = state.intakeAsked ? strings.intakeReviewBtn : strings.intakeStartBtn;
  btn.onclick = () => startIntakeChecklist(returnNodeId);
  return btn;
}

function renderNumericInput(node) {
  const strings = ui();
  const nodeId = state.currentId;
  const allowNegative = typeof node.min === "number" && node.min < 0;

  const q = document.createElement("div");
  q.className = "q-text";
  q.textContent = t(node.text);
  cardEl.appendChild(q);

  const row = document.createElement("div");
  row.className = "numeric-row";

  const input = document.createElement("input");
  input.type = "text";
  input.inputMode = "decimal";
  input.autocomplete = "off";
  input.className = "numeric-input";
  input.placeholder = "0";
  row.appendChild(input);

  if (node.unit) {
    const unitEl = document.createElement("span");
    unitEl.className = "numeric-unit";
    unitEl.textContent = node.unit;
    row.appendChild(unitEl);
  }
  cardEl.appendChild(row);

  const hint = document.createElement("div");
  hint.className = "numeric-hint";
  cardEl.appendChild(hint);

  const nextBtn = document.createElement("button");
  nextBtn.className = "btn input-action";
  nextBtn.textContent = strings.nextBtn;
  nextBtn.disabled = true;
  cardEl.appendChild(nextBtn);

  function rangeText() {
    const hasMin = typeof node.min === "number";
    const hasMax = typeof node.max === "number";
    const unitSuffix = node.unit ? ` ${node.unit}` : "";
    if (hasMin && hasMax) return `${strings.numericRangeLabel} ${node.min}–${node.max}${unitSuffix}`;
    if (hasMax) return `${strings.numericRangeLabel} ≤ ${node.max}${unitSuffix}`;
    if (hasMin) return `${strings.numericRangeLabel} ≥ ${node.min}${unitSuffix}`;
    return "";
  }

  function parsedValue() {
    if (input.value === "" || input.value === "-" || input.value === ".") return null;
    const v = parseFloat(input.value);
    return Number.isNaN(v) ? null : v;
  }

  function validate() {
    const val = parsedValue();
    let valid = val != null;
    if (valid && typeof node.min === "number" && val < node.min) valid = false;
    if (valid && typeof node.max === "number" && val > node.max) valid = false;
    input.classList.toggle("invalid", input.value !== "" && !valid);
    nextBtn.disabled = !valid;

    let showConverted = "";
    if (val != null && node.unit) {
      const raw = rawNumericString(val, node.unit);
      const annotated = annotateUnits(raw);
      if (annotated !== raw) showConverted = annotated;
    }
    hint.textContent = [rangeText(), showConverted].filter(Boolean).join(" · ");
    return valid ? val : null;
  }

  input.addEventListener("input", () => {
    input.value = sanitizeNumericInput(input.value, allowNegative);
    validate();
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !nextBtn.disabled) nextBtn.click();
  });

  nextBtn.onclick = () => {
    const val = validate();
    if (val == null) return;
    state.answers.push({ nodeId, value: val });
    goTo(resolveThresholdNext(node, val), { prevId: nodeId });
  };

  validate();
  input.focus();
}

// A "measurement" node is pure data collection, never branching: it always
// advances to a single fixed `node.next`, same as the intent behind a plain
// question, so any diagnostic judgment call stays with the human/AI rather
// than a threshold in graph.json. It optionally captures a nameplate
// reference (RLA for a compressor, or FLA×SF for a fan motor) alongside the
// measured value, and flags — visibly and in the AI context — when the
// measured value exceeds it.
function renderMeasurement(node) {
  const strings = ui();
  const nodeId = state.currentId;
  const mode = node.reference?.mode;

  const q = document.createElement("div");
  q.className = "q-text";
  q.textContent = t(node.text);
  cardEl.appendChild(q);

  function makeField(labelText, unit) {
    const wrap = document.createElement("div");
    wrap.className = "measurement-field";
    if (labelText) {
      const lab = document.createElement("div");
      lab.className = "measurement-field-label";
      lab.textContent = labelText;
      wrap.appendChild(lab);
    }
    const row = document.createElement("div");
    row.className = "numeric-row";
    const input = document.createElement("input");
    input.type = "text";
    input.inputMode = "decimal";
    input.autocomplete = "off";
    input.className = "numeric-input";
    input.placeholder = "0";
    row.appendChild(input);
    if (unit) {
      const u = document.createElement("span");
      u.className = "numeric-unit";
      u.textContent = unit;
      row.appendChild(u);
    }
    wrap.appendChild(row);
    cardEl.appendChild(wrap);
    return input;
  }

  let flaInput = null;
  let sfInput = null;
  let refInput = null;
  if (mode === "fla_sf") {
    flaInput = makeField(t(node.reference.flaLabel), node.unit);
    sfInput = makeField(t(node.reference.sfLabel), "");
  } else if (mode === "single") {
    refInput = makeField(t(node.reference.label), node.unit);
  }
  const measuredInput = makeField(
    node.measuredLabel ? t(node.measuredLabel) : strings.measuredLabel,
    node.unit
  );

  const hint = document.createElement("div");
  hint.className = "numeric-hint";
  cardEl.appendChild(hint);

  const alertBox = document.createElement("div");
  alertBox.className = "measurement-alert";
  alertBox.style.display = "none";
  const alertIcon = document.createElement("span");
  alertIcon.className = "measurement-alert-icon";
  alertIcon.textContent = "⚠️";
  const alertText = document.createElement("span");
  alertText.textContent = strings.measurementAlertText;
  alertBox.appendChild(alertIcon);
  alertBox.appendChild(alertText);
  cardEl.appendChild(alertBox);

  const nextBtn = document.createElement("button");
  nextBtn.className = "btn input-action";
  nextBtn.textContent = strings.nextBtn;
  nextBtn.disabled = true;
  cardEl.appendChild(nextBtn);

  function parseField(input) {
    if (!input) return null;
    if (input.value === "" || input.value === "-" || input.value === ".") return null;
    const v = parseFloat(input.value);
    return Number.isNaN(v) ? null : v;
  }

  function computeReference() {
    if (mode === "fla_sf") {
      const fla = parseField(flaInput);
      const sf = parseField(sfInput);
      return fla != null && sf != null ? fla * sf : null;
    }
    if (mode === "single") {
      return parseField(refInput);
    }
    return null;
  }

  const allowNegative = typeof node.min === "number" && node.min < 0;

  function validate() {
    const measured = parseField(measuredInput);
    let measuredValid = measured != null;
    if (measuredValid && typeof node.min === "number" && measured < node.min) measuredValid = false;
    if (measuredValid && typeof node.max === "number" && measured > node.max) measuredValid = false;
    measuredInput.classList.toggle("invalid", measuredInput.value !== "" && !measuredValid);

    const needsReference = mode === "single" || mode === "fla_sf";
    const reference = computeReference();
    const referenceValid = !needsReference || reference != null;
    if (mode === "single") refInput.classList.toggle("invalid", refInput.value !== "" && reference == null);
    if (mode === "fla_sf") {
      flaInput.classList.toggle("invalid", flaInput.value !== "" && parseField(flaInput) == null);
      sfInput.classList.toggle("invalid", sfInput.value !== "" && parseField(sfInput) == null);
    }

    const valid = measuredValid && referenceValid;
    nextBtn.disabled = !valid;

    let showConverted = "";
    if (measured != null && node.unit) {
      const raw = rawNumericString(measured, node.unit);
      const annotated = annotateUnits(raw);
      if (annotated !== raw) showConverted = annotated;
    }
    const range =
      typeof node.min === "number" && typeof node.max === "number"
        ? `${strings.numericRangeLabel} ${node.min}–${node.max}${node.unit ? " " + node.unit : ""}`
        : "";
    hint.textContent = [range, showConverted].filter(Boolean).join(" · ");

    const exceeds = measuredValid && needsReference && reference != null && measured > reference;
    alertBox.style.display = exceeds ? "flex" : "none";

    return valid ? { measured, reference: needsReference ? reference : null, exceeds } : null;
  }

  [flaInput, sfInput, refInput, measuredInput].forEach((input) => {
    if (!input) return;
    input.addEventListener("input", () => {
      input.value = sanitizeNumericInput(input.value, input === measuredInput ? allowNegative : false);
      validate();
    });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !nextBtn.disabled) nextBtn.click();
    });
  });

  nextBtn.onclick = () => {
    const result = validate();
    if (!result) return;
    state.answers.push({
      nodeId,
      value: result.measured,
      reference: result.reference,
      exceeds: result.exceeds,
    });
    goTo(node.next, { prevId: nodeId });
  };

  validate();
  (flaInput || refInput || measuredInput).focus();
}

// A regular graph.json node (unlike the one-time manufacturer step): each
// "no cooling"/"insufficient cooling" branch routes through its own
// refrigerant_select node, dynamically populated from refrigerants.json,
// with an explicit "don't know" option — picking it just means the later
// pt_calc step can't compute superheat/subcooling and says so.
function renderRefrigerantSelect(node) {
  const strings = ui();
  const nodeId = state.currentId;

  const q = document.createElement("div");
  q.className = "q-text";
  q.textContent = t(node.text);
  cardEl.appendChild(q);

  const wrap = document.createElement("div");
  wrap.className = "measurement-field";
  const label = document.createElement("div");
  label.className = "measurement-field-label";
  label.textContent = strings.refrigerantLabel;
  wrap.appendChild(label);

  const select = document.createElement("select");
  select.className = "numeric-input";
  const blankOpt = document.createElement("option");
  blankOpt.value = "";
  blankOpt.textContent = strings.refrigerantNotSpecified;
  select.appendChild(blankOpt);
  (REFRIGERANTS || []).forEach((r) => {
    const o = document.createElement("option");
    o.value = r.id;
    o.textContent = r.name;
    select.appendChild(o);
  });
  const unknownOpt = document.createElement("option");
  unknownOpt.value = "unknown";
  unknownOpt.textContent = strings.refrigerantUnknown;
  select.appendChild(unknownOpt);
  wrap.appendChild(select);
  cardEl.appendChild(wrap);

  const hint = document.createElement("div");
  hint.className = "numeric-hint";
  hint.textContent = strings.refrigerantStepHint;
  cardEl.appendChild(hint);

  const nextBtn = document.createElement("button");
  nextBtn.className = "btn input-action";
  nextBtn.textContent = strings.nextBtn;
  nextBtn.disabled = true;
  cardEl.appendChild(nextBtn);

  select.addEventListener("change", () => {
    nextBtn.disabled = !select.value;
  });

  nextBtn.onclick = () => {
    if (!select.value) return;
    const refrigerant =
      select.value === "unknown"
        ? { id: "unknown", name: strings.refrigerantUnknown }
        : (REFRIGERANTS || []).find((r) => r.id === select.value) || null;
    if (!refrigerant) return;
    state.refrigerant = refrigerant;
    state.answers.push({ nodeId, field: "refrigerant", value: refrigerant.name });
    goTo(node.next, { prevId: nodeId });
  };
}

// Terminal step of the P-T calculator sequence (refrigerant_select + a
// handful of numeric_input readings tagged with `role`, see
// computePtResult): shows superheat/subcooling explicitly rather than only
// passing them to the AI, flags a result well outside the typical range the
// same non-blocking way a measurement node flags an over-nameplate reading,
// and always advances to a single fixed node.next — no threshold branching,
// the judgment call stays with the human/AI.
function renderPtCalc(node) {
  const strings = ui();
  const nodeId = state.currentId;

  const q = document.createElement("div");
  q.className = "q-text";
  q.textContent = t(node.text);
  cardEl.appendChild(q);

  const body = document.createElement("div");
  body.className = "numeric-hint";
  body.textContent = strings.ptCalcLoading;
  cardEl.appendChild(body);

  const nextBtn = document.createElement("button");
  nextBtn.className = "btn input-action";
  nextBtn.textContent = strings.nextBtn;
  nextBtn.disabled = true;
  cardEl.appendChild(nextBtn);

  let resultEntry = null;

  computePtResult().then((result) => {
    body.innerHTML = "";
    body.className = "";

    if (result.status === "unavailable") {
      const msg = document.createElement("div");
      msg.className = "numeric-hint";
      msg.textContent = strings.ptCalcUnavailable;
      body.appendChild(msg);
      resultEntry = { nodeId, field: "pt_result", value: strings.ptCalcUnavailable, exceeds: false };
    } else if (result.status === "out_of_range") {
      const badge = document.createElement("span");
      badge.className = "badge critical";
      badge.textContent = strings.badge.critical;
      body.appendChild(badge);

      const alertBox = document.createElement("div");
      alertBox.className = "measurement-alert";
      const alertIcon = document.createElement("span");
      alertIcon.className = "measurement-alert-icon";
      alertIcon.textContent = "⚠️";
      const alertText = document.createElement("span");
      alertText.textContent = strings.ptCalcOutOfRangeText;
      alertBox.appendChild(alertIcon);
      alertBox.appendChild(alertText);
      body.appendChild(alertBox);

      resultEntry = {
        nodeId,
        field: "pt_result",
        value: strings.ptCalcOutOfRangeValue,
        exceeds: true,
        critical: true,
      };
    } else {
      const superheat = roundTo(result.superheat, 1);
      const subcooling = roundTo(result.subcooling, 1);
      const shExceeds = superheat < PT_SH_ALERT.min || superheat > PT_SH_ALERT.max;
      const scExceeds = subcooling < PT_SC_ALERT.min || subcooling > PT_SC_ALERT.max;
      const exceeds = shExceeds || scExceeds;

      const shRow = document.createElement("div");
      shRow.className = "measurement-field";
      const shLabel = document.createElement("div");
      shLabel.className = "measurement-field-label";
      shLabel.textContent = strings.superheatLabel;
      const shVal = document.createElement("div");
      shVal.className = "q-text";
      shVal.textContent = formatNumericValue(superheat, "Δ°F");
      shRow.appendChild(shLabel);
      shRow.appendChild(shVal);
      body.appendChild(shRow);

      const scRow = document.createElement("div");
      scRow.className = "measurement-field";
      const scLabel = document.createElement("div");
      scLabel.className = "measurement-field-label";
      scLabel.textContent = strings.subcoolingLabel;
      const scVal = document.createElement("div");
      scVal.className = "q-text";
      scVal.textContent = formatNumericValue(subcooling, "Δ°F");
      scRow.appendChild(scLabel);
      scRow.appendChild(scVal);
      body.appendChild(scRow);

      const rangeHint = document.createElement("div");
      rangeHint.className = "numeric-hint";
      rangeHint.textContent = strings.ptCalcTypicalRange;
      body.appendChild(rangeHint);

      if (exceeds) {
        const alertBox = document.createElement("div");
        alertBox.className = "measurement-alert";
        const alertIcon = document.createElement("span");
        alertIcon.className = "measurement-alert-icon";
        alertIcon.textContent = "⚠️";
        const alertText = document.createElement("span");
        alertText.textContent = strings.ptCalcAlertText;
        alertBox.appendChild(alertIcon);
        alertBox.appendChild(alertText);
        body.appendChild(alertBox);
      }

      const value = `${strings.superheatLabel} ${formatNumericValue(superheat, "Δ°F")} / ${strings.subcoolingLabel} ${formatNumericValue(subcooling, "Δ°F")}`;
      resultEntry = { nodeId, field: "pt_result", value, exceeds };
    }
    nextBtn.disabled = false;
  });

  nextBtn.onclick = () => {
    if (resultEntry) state.answers.push(resultEntry);
    goTo(node.next, { prevId: nodeId });
  };
}

function renderResult(node) {
  const strings = ui();
  const badge = document.createElement("span");
  badge.className = `badge ${node.severity || "info"}`;
  badge.textContent = strings.badge[node.severity || "info"];
  cardEl.appendChild(badge);

  const tEl = document.createElement("div");
  tEl.className = "result-text";
  tEl.textContent = t(node.text);
  cardEl.appendChild(tEl);

  const aiBox = buildAiBox({
    context: t(node.text),
    highlighted: !!node.ai,
    nodeId: state.currentId,
    severity: node.severity || "info",
  });
  cardEl.appendChild(aiBox);

  const mfgLink = buildMfgDocLink();
  if (mfgLink) cardEl.appendChild(mfgLink);

  const intakeBtn = buildIntakeTriggerButton(state.currentId);
  if (intakeBtn) cardEl.appendChild(intakeBtn);

  if (node.checklist && node.checklist.length) {
    const resultNodeId = state.currentId;
    renderChecklist(resultNodeId, node.checklist, cardEl);

    const finishBtn = document.createElement("button");
    finishBtn.className = "btn input-action";
    finishBtn.textContent = strings.finishBtn;
    finishBtn.onclick = () => {
      state.finishNodeId = resultNodeId;
      goTo(FINISH_STEP_ID, { prevId: resultNodeId });
    };
    cardEl.appendChild(finishBtn);
  }

  logSession({ finalNodeId: state.currentId, severity: node.severity || "info" });
}

function renderAiPrompt(node) {
  const strings = ui();
  const nodeId = state.currentId;
  const tEl = document.createElement("div");
  tEl.className = "q-text";
  tEl.textContent = t(node.text);
  cardEl.appendChild(tEl);

  const textarea = document.createElement("textarea");
  textarea.placeholder = strings.freeformPlaceholder;
  cardEl.appendChild(textarea);

  const sendBtn = document.createElement("button");
  sendBtn.className = "btn ai";
  sendBtn.textContent = strings.aiSendBtn;
  cardEl.appendChild(sendBtn);

  const responseHolder = document.createElement("div");
  cardEl.appendChild(responseHolder);

  sendBtn.onclick = () => {
    sendBtn.disabled = true;
    runAiAssist({
      context: t(node.text),
      freeText: textarea.value,
      target: responseHolder,
      onDone: () => { sendBtn.disabled = false; },
      nodeId,
      severity: null,
    });
  };

  const mfgLink = buildMfgDocLink();
  if (mfgLink) cardEl.appendChild(mfgLink);

  const intakeBtn = buildIntakeTriggerButton(nodeId);
  if (intakeBtn) cardEl.appendChild(intakeBtn);

  logSession({ finalNodeId: nodeId, severity: null });
}

function buildAiBox({ context, highlighted, nodeId, severity }) {
  const strings = ui();
  const box = document.createElement("div");
  box.className = "ai-box";

  const btn = document.createElement("button");
  btn.className = highlighted ? "btn ai" : "btn ghost";
  btn.textContent = highlighted ? strings.aiAskRecommended : strings.aiAsk;
  box.appendChild(btn);

  const responseHolder = document.createElement("div");
  box.appendChild(responseHolder);

  btn.onclick = () => {
    btn.disabled = true;
    runAiAssist({
      context,
      freeText: "",
      target: responseHolder,
      onDone: () => { btn.disabled = false; },
      nodeId,
      severity,
    });
  };

  return box;
}

function currentAnswers() {
  return state.answers.map((entry) => {
    if (entry.field === "manufacturer") {
      return { question: ui().manufacturerLabel, answer: entry.value };
    }
    if (entry.field === "model") {
      return { question: ui().manufacturerModelQuestion, answer: entry.value };
    }
    if (entry.field === "refrigerant") {
      return { question: ui().refrigerantLabel, answer: entry.value };
    }
    if (entry.field === "pt_result") {
      return { question: ui().ptCalcResultQuestion, answer: answerLabel(entry) };
    }
    const node = GRAPH.nodes[entry.nodeId];
    return { question: t(node.text), answer: answerLabel(entry) };
  });
}

// Only completed items (see isChecklistItemDone) — an unchecked/blank item
// means "not yet verified," not "no," so including it as a false-ish answer
// would misrepresent it to the AI.
function checklistAnswers() {
  const rows = [];
  Object.keys(state.checklist).forEach((nodeId) => {
    const node = GRAPH.nodes[nodeId];
    if (!node || !node.checklist) return;
    const values = state.checklist[nodeId];
    node.checklist.forEach((item) => {
      const value = values[item.id];
      if (!isChecklistItemDone(value, item.type)) return;
      const answer = item.type === "field" ? (item.unit ? `${value} ${item.unit}` : String(value)) : "✓";
      rows.push({ question: t(item.label), answer });
    });
  });
  return rows;
}

// Same idea as checklistAnswers() above, for the phased intake checklist —
// an explicit "N/A" is reported for skipped items rather than omitting them,
// since a tech deliberately ruling something out (e.g. "TXV present: N/A"
// on an equipment type with no TXV) is itself useful signal, not silence.
function intakeAnswers() {
  const rows = [];
  (GRAPH.intake_checklist || []).forEach((phase) => {
    const values = state.intake[phase.id] || {};
    phase.items.forEach((item) => {
      const entry = values[item.id];
      if (!intakeItemResolved(entry, item.type)) return;
      const answer = entry.skipped
        ? "N/A"
        : item.type === "field"
        ? (item.unit ? `${entry.value} ${item.unit}` : String(entry.value))
        : "✓";
      rows.push({ question: t(item.label), answer });
    });
  });
  return rows;
}

// currentAnswers() alone (graph path only) is what the finish screen's
// read-only summary and logSession's history both use — checklist items are
// already shown there as their own interactive widget, so folding them into
// that same list would duplicate them on screen. The AI, on the other hand,
// never sees the checklist at all today (that's the bug this fixes) — so
// only its payload gets the combined view.
function aiContextAnswers() {
  return currentAnswers().concat(checklistAnswers()).concat(intakeAnswers());
}

// Fire-and-forget: records the checklist path taken so far (which equipment,
// which branches, where it ended up, and whether/what the AI answered) for
// later pattern analysis. Never blocks or disrupts the checklist UI.
function logSession({ finalNodeId, severity, freeText, aiUsed, aiAnalysis }) {
  fetch("./api/log-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      session_id: state.sessionId,
      lang: LANG,
      answers: currentAnswers(),
      final_node_id: finalNodeId,
      severity: severity || null,
      free_text: freeText || "",
      ai_used: !!aiUsed,
      ai_analysis: aiAnalysis || "",
    }),
  }).catch(() => {});
}

// The AI assistant is instructed to write structured prose and commonly
// reaches for **bold** to mark headers/root causes — but the response is
// otherwise plain text, not full markdown. Escape first (the model's own
// output isn't sanitized upstream), then convert just that one construct;
// line breaks are already preserved by .ai-response's `white-space: pre-wrap`.
function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function renderAiText(el, text) {
  el.innerHTML = escapeHtml(text).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

async function runAiAssist({ context, freeText, target, onDone, nodeId, severity }) {
  const strings = ui();
  target.innerHTML = "";
  const label = document.createElement("div");
  label.className = "ai-label";
  label.textContent = strings.aiLabel;
  target.appendChild(label);

  const resp = document.createElement("div");
  resp.className = "ai-response loading";
  resp.textContent = strings.aiLoading;
  target.appendChild(resp);

  try {
    const r = await fetch("./api/ai-assist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        answers: aiContextAnswers(),
        context,
        free_text: freeText,
        lang: LANG,
      }),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.detail || strings.aiRequestError);
    resp.className = "ai-response";
    renderAiText(resp, data.analysis);
    if (data.truncated) {
      const warning = document.createElement("div");
      warning.className = "measurement-alert";
      const warningIcon = document.createElement("span");
      warningIcon.className = "measurement-alert-icon";
      warningIcon.textContent = "⚠️";
      const warningText = document.createElement("span");
      warningText.textContent = strings.aiTruncatedWarning;
      warning.appendChild(warningIcon);
      warning.appendChild(warningText);
      target.appendChild(warning);
    }
    logSession({ finalNodeId: nodeId, severity, freeText, aiUsed: true, aiAnalysis: data.analysis });
  } catch (err) {
    resp.className = "ai-response error";
    resp.textContent = strings.aiErrorPrefix + err.message;
  } finally {
    onDone && onDone();
  }
}

backBtn.onclick = goBack;
restartBtn.onclick = restart;
langButtons.forEach((b) => {
  b.onclick = () => setLang(b.dataset.lang);
});

document.documentElement.lang = LANG;
updateStaticUi();
loadGraph();
loadVersionInfo();
