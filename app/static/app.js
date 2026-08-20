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
    relatedChecksTitle: "Также стоит проверить",
    safetyBannerText: "⚠️ Перед вскрытием панелей или работой с контуром под давлением — LOTO/дисконнектор выполнен?",
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
    sourceLink: "исходный код",
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
    refrigerantStepHint: "Если не знаете хладагент — расчёт по P-T таблице (перегрев/переохлаждение или сравнение с давлением насыщения) будет недоступен, но вы сможете продолжить по качественным показаниям манометров.",
    superheatLabel: "Перегрев (superheat)",
    subcoolingLabel: "Переохлаждение (subcooling)",
    ptCalcLoading: "Расчёт...",
    ptCalcUnavailable: "Хладагент не указан или данных недостаточно — количественный расчёт по P-T таблице недоступен. Ориентируйтесь на качественные показания манометров и P-T таблицу производителя.",
    ptCalcTypicalRange: "Типичный целевой диапазон: перегрев ~8–12°F, переохлаждение ~10–15°F — уточняйте по паспорту конкретного оборудования.",
    ptCalcAlertText: "Расчётное значение существенно выходит за типичный рабочий диапазон. Это не диагноз, а сигнал присмотреться внимательнее: проверьте показания манометров, места установки датчиков температуры и рассмотрите альтернативные причины.",
    ptCalcAlertFlag: "ВНИМАНИЕ: SH/SC вне типичного диапазона",
    ptCalcOutOfRangeText: "Введённое давление или температура находятся за пределами нормального рабочего диапазона P-T таблицы для этого хладагента. Это НЕ погрешность интерполяции — вероятная причина: серьёзная неисправность (утечка, неправильный/перепутанный хладагент, катастрофический отказ компонента). Прекратите обычную количественную диагностику: проверьте системы безопасности, соблюдайте LOTO и рассмотрите немедленную остановку оборудования до выяснения причины.",
    ptCalcOutOfRangeFlag: "ВНИМАНИЕ: давление вне рабочего диапазона — возможен серьёзный отказ",
    ptCalcOutOfRangeValue: "Давление/температура вне табличного диапазона хладагента — расчёт не выполнен",
    ptCalcResultQuestion: "Перегрев/переохлаждение (расчёт по P-T таблице)",
    noncondExpectedLabel: "Ожидаемое давление насыщения при этой температуре",
    noncondMeasuredLabel: "Измеренное (стабилизировавшееся) давление",
    noncondLikelyText: "Измеренное давление заметно выше ожидаемого для чистого хладагента при этой температуре — похоже на неконденсируемые газы (воздух/азот) в контуре. Recovery, вакуумирование и полная перезаправка по массе — обычное решение.",
    noncondLikelyShort: "выше ожидаемого — похоже на non-condensables",
    noncondNormalText: "Давление соответствует ожидаемому для чистого хладагента при этой температуре — non-condensables маловероятны, ищите другую причину высокого давления.",
    noncondNormalShort: "в норме",
    resumeTitle: "У вас есть незавершённая сессия",
    resumeEquipmentLabel: "Оборудование",
    resumeContinue: "Продолжить",
    resumeStartOver: "Начать заново",
    checklistProgress: "Выполнено: {done} из {total}",
    finishBtn: "✓ Завершить сессию",
    finishCompletedMsg: "Сессия завершена. Спасибо!",
    reportIntakeProgressTitle: "Чек-лист оборудования",
    reportPhaseDone: "всё проверено",
    reportPhaseRemaining: "осталось проверить: {n}",
    intakePhaseProgress: "Этап {n} из {total}",
    intakeSkipLabel: "N/A",
    intakeYesLabel: "Да",
    intakeNoLabel: "Нет",
    intakeNotSureLabel: "Не уверен",
    intakeLockedHint: "Заблокировано — уже выбрано: {item}",
    intakeGateHint: "Отметьте каждый пункт как сделано либо N/A, чтобы перейти дальше",
    intakeNextPhaseBtn: "Следующий этап →",
    intakeFinishBtn: "Готово — вернуться к результату",
    intakeStartBtn: "🔍 Углублённая диагностика (полный чек-лист)",
    intakeReviewBtn: "✓ Чек-лист пройден (посмотреть)",
    componentCheckStartBtn: "▶ Начать проверку",
    componentCheckReviewBtn: "↺ Посмотреть/изменить",
    graphLaunchStartBtn: "▶ Выполнить расчёт",
    graphLaunchReviewBtn: "↺ Посмотреть результат",
    componentCheckSaveBtn: "✓ Сохранить и вернуться к чек-листу",
    componentCheckDescPlaceholder: "Дополнительное описание (опционально)",
    charsLeft: "Осталось символов: {n}",
    quotaRemaining: "Обращений к ассистенту сегодня осталось: {n}",
  },
  en: {
    back: "← Back",
    restart: "⟲ Start Over",
    badge: { info: "Info", warning: "Warning", critical: "Critical" },
    relatedChecksTitle: "Also worth checking",
    safetyBannerText: "⚠️ Before opening panels or working on a pressurized circuit — is LOTO/disconnect done?",
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
    sourceLink: "source code",
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
    refrigerantStepHint: "If you don't know the refrigerant, the P-T-based calculation (superheat/subcooling, or comparing against saturation pressure) won't be available, but you can still continue using qualitative gauge readings.",
    superheatLabel: "Superheat",
    subcoolingLabel: "Subcooling",
    ptCalcLoading: "Calculating...",
    ptCalcUnavailable: "No refrigerant specified, or not enough data — quantitative P-T-based calculation isn't available. Rely on qualitative gauge readings and the equipment's P-T chart.",
    ptCalcTypicalRange: "Typical target range: superheat ~8-12°F, subcooling ~10-15°F — verify against the specific equipment's nameplate/spec.",
    ptCalcAlertText: "The calculated value is well outside the typical operating range. This isn't a diagnosis by itself — it's a flag to look closer: double-check gauge readings, sensor placement, and consider other possible causes.",
    ptCalcAlertFlag: "WARNING: SH/SC outside typical range",
    ptCalcOutOfRangeText: "The entered pressure or temperature is outside the normal operating range of this refrigerant's P-T table. This is NOT an interpolation-precision issue — the likely cause is a serious fault (a leak, the wrong/mixed refrigerant, or a catastrophic component failure). Stop routine quantitative diagnosis: check the system's safety devices, follow LOTO, and consider shutting the equipment down immediately until the cause is identified.",
    ptCalcOutOfRangeFlag: "WARNING: pressure outside operating range — possible serious fault",
    ptCalcOutOfRangeValue: "Pressure/temperature outside the refrigerant's table range — calculation not performed",
    ptCalcResultQuestion: "Superheat/Subcooling (calculated from P-T chart)",
    noncondExpectedLabel: "Expected saturation pressure at this temperature",
    noncondMeasuredLabel: "Measured (stabilized) pressure",
    noncondLikelyText: "The measured pressure is well above what pure refrigerant would show at this temperature — consistent with non-condensable gases (air/nitrogen) in the circuit. Recovery, evacuation, and a full recharge by weight is the usual fix.",
    noncondLikelyShort: "above expected — consistent with non-condensables",
    noncondNormalText: "Pressure is consistent with pure refrigerant at this temperature — non-condensables are unlikely, look elsewhere for the high-pressure cause.",
    noncondNormalShort: "normal",
    resumeTitle: "You have an unfinished session",
    resumeEquipmentLabel: "Equipment",
    resumeContinue: "Continue",
    resumeStartOver: "Start Over",
    checklistProgress: "Completed: {done} of {total}",
    finishBtn: "✓ Finish session",
    finishCompletedMsg: "Session completed. Thank you!",
    reportIntakeProgressTitle: "Equipment checklist",
    reportPhaseDone: "all checked",
    reportPhaseRemaining: "{n} left to check",
    intakePhaseProgress: "Phase {n} of {total}",
    intakeSkipLabel: "N/A",
    intakeYesLabel: "Yes",
    intakeNoLabel: "No",
    intakeNotSureLabel: "Not sure",
    intakeLockedHint: "Locked — already selected: {item}",
    intakeGateHint: "Mark every item as done or N/A to move on",
    intakeNextPhaseBtn: "Next phase →",
    intakeFinishBtn: "Done — back to results",
    intakeStartBtn: "🔍 Deeper diagnosis (full checklist)",
    intakeReviewBtn: "✓ Checklist completed (review)",
    componentCheckStartBtn: "▶ Start check",
    componentCheckReviewBtn: "↺ View/change",
    graphLaunchStartBtn: "▶ Run calculation",
    graphLaunchReviewBtn: "↺ View result",
    componentCheckSaveBtn: "✓ Save & return to checklist",
    componentCheckDescPlaceholder: "Additional description (optional)",
    charsLeft: "Characters left: {n}",
    quotaRemaining: "Assistant requests left today: {n}",
  },
};
const SUPPORTED_LANGS = Object.keys(I18N);
const DEFAULT_LANG = "ru";

// Mirrors of the request-size caps in app/main.py (MAX_ANSWER_FIELD_LEN /
// MAX_FREE_TEXT_LEN) — the server stays authoritative, these only stop the
// tech from typing past it and losing the text to a bare 422. Must be
// changed together with main.py.
const MAX_ANSWER_FIELD_LEN = 400;
const MAX_FREE_TEXT_LEN = 2000;
// Numeric readings need far less room than a text field: six digits, a
// decimal separator and a sign cover every pressure, temperature, current or
// micron value this tool asks for. Capping them keeps a measurement field
// from ever approaching the server's 400-char answer limit once the unit
// suffix is appended to the stored value.
const MAX_NUMERIC_FIELD_LEN = 10;

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
  // Capped here as well as via maxLength: this runs on every input event, so
  // it also covers paths maxLength does not, such as a programmatic paste.
  if (s.length > MAX_NUMERIC_FIELD_LEN) s = s.slice(0, MAX_NUMERIC_FIELD_LEN);
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

// Inverse of saturationTemp: given a temperature, interpolates the
// saturation pressure along one curve. Same no-extrapolation policy — a
// temperature outside the table's range returns null rather than a
// guessed number, for the same reason saturationTemp does.
function saturationPressure(points, tempF, curve) {
  const key = curve === "bubble" ? "bubble_psig" : "dew_psig";
  const n = points.length;
  if (n === 0) return null;
  if (tempF < points[0].temp_f || tempF > points[n - 1].temp_f) return null;
  if (n === 1) return points[0][key];
  for (let i = 0; i < n - 1; i++) {
    if (tempF >= points[i].temp_f && tempF <= points[i + 1].temp_f) {
      const t0 = points[i].temp_f;
      const t1 = points[i + 1].temp_f;
      const p0 = points[i][key];
      const p1 = points[i + 1][key];
      if (t1 === t0) return p0;
      return p0 + ((tempF - t0) / (t1 - t0)) * (p1 - p0);
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

// Standing pressure test: unlike SH/SC (read while the system is running),
// this reads one stabilized pressure + the ambient/equipment temperature
// with the system at rest — pure refrigerant alone would sit at its
// saturation pressure for that temperature, so a stabilized reading
// meaningfully ABOVE that (beyond gauge-reading tolerance) indicates
// non-condensables (air/nitrogen) trapped in the system, which add their
// own partial pressure on top. Reuses the same P-T tables/no-extrapolation
// policy as computePtResult, just the inverse lookup direction
// (saturationPressure, not saturationTemp) and a single reading instead of
// four.
const NONCONDENSABLES_TOLERANCE_PSIG = 3;

async function computeNoncondensablesResult() {
  const temp = findAnswerByRole("standing_temp");
  const pressure = findAnswerByRole("standing_pressure");
  const refrigerant = state.refrigerant;

  if (!refrigerant || refrigerant.id === "unknown" || temp == null || pressure == null) {
    return { status: "unavailable" };
  }
  const points = await loadRefrigerantTable(refrigerant.id);
  if (!points) return { status: "unavailable" };

  const expectedBubble = saturationPressure(points, temp, "bubble");
  const expectedDew = saturationPressure(points, temp, "dew");
  if (expectedBubble == null || expectedDew == null) {
    return { status: "out_of_range" };
  }
  const expectedMin = Math.min(expectedBubble, expectedDew);
  const expectedMax = Math.max(expectedBubble, expectedDew);
  return {
    status: "ok",
    temp,
    pressure,
    expectedMin,
    expectedMax,
    nonCondensablesLikely: pressure - expectedMax > NONCONDENSABLES_TOLERANCE_PSIG,
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
  if (entry.field === "noncond_result") {
    // Unlike pt_result, the verdict (elevated/normal) is already baked
    // into entry.value itself — appending measurementAlertFlag here would
    // be the wrong flag (that one's worded for a nameplate-rating
    // exceedance, not a non-condensables finding).
    return entry.value;
  }
  if (entry.field === "dual_block") {
    // entry.value is already the chosen option's translated label (e.g.
    // "Above normal") — same convention as a plain question's breadcrumb
    // chip, which never repeats the question text either.
    return entry.value;
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

// Sentinel currentId for a "component check" mini-subtree, embedded inside
// a `component_check`-type intake item (currently piloted only for the
// metering device — see graph.json's `component_checks`). Walks its own
// tiny question/result subtree (same node shape as the main graph, reusing
// renderQuestion-style option buttons — see renderComponentCheck), but
// deliberately does NOT touch state.answers/state.history: unlike the main
// graph, "answering" here means recording one finding into the intake
// item, not extending the top-level symptom-diagnosis trail. Not a real
// graph.json node — same reasoning as MANUFACTURER_STEP_ID.
const COMPONENT_CHECK_STEP_ID = "__component_check__";

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
  // randomUUID is secure-context-only, so it is simply absent when the app is
  // served over plain HTTP (any self-host following the README's Quick start,
  // for instance). getRandomValues has no such restriction — use it to build
  // the same UUIDv4 rather than falling back to Date.now()+Math.random(),
  // which is predictable enough to enumerate other people's session ids.
  if (window.crypto && typeof window.crypto.getRandomValues === "function") {
    const b = new Uint8Array(16);
    window.crypto.getRandomValues(b);
    b[6] = (b[6] & 0x0f) | 0x40; // version 4
    b[8] = (b[8] & 0x3f) | 0x80; // variant 10x
    const hex = Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }
  // No Web Crypto at all: pre-2017 browsers only. Kept so the app still runs
  // rather than throwing, but such a session id must be treated as guessable.
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
  componentCheck: null,     // {phaseId, itemId, checkId, currentId, history, description} while a
                            // component-check subtree is active (see COMPONENT_CHECK_STEP_ID), else null
  graphLaunchReturn: null,  // {phaseId, itemId} while a `graph_launch` intake item's target flow
                            // (e.g. the precise SH/SC calc chain) is running in the MAIN graph —
                            // unlike componentCheck, this reuses normal goTo/state.answers
                            // navigation as-is (the launched nodes are ordinary graph.json nodes,
                            // not an isolated island), it just needs to know where to deposit the
                            // finding and return to once the chain's terminal node says
                            // `"next": "__intake_return__"` (see renderPtCalc).
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

// Caps a free-text field at the server's limit and returns a live counter
// element to place under it. The counter keeps its height whether or not it
// is highlighted (see .char-counter) — this is read on a phone, in the
// field, and a line that grows/shrinks while typing would nudge every tap
// target below it.
function attachCharCounter(el, limit) {
  el.maxLength = limit;
  const counter = document.createElement("div");
  counter.className = "char-counter";
  // Only the last 10% is worth pulling the tech's eye off the equipment.
  const warnAt = Math.ceil(limit / 10);
  const update = () => {
    const left = limit - el.value.length;
    counter.textContent = ui().charsLeft.replace("{n}", left);
    counter.classList.toggle("near-limit", left <= warnAt);
  };
  el.addEventListener("input", update);
  update();
  return counter;
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
// AGPL-3.0 section 13: anyone interacting with this over a network must be
// offered the corresponding source. The commit hash next to it is what makes
// the offer meaningful — it says which revision this deployment is actually
// running, so the source you fetch is the source you're talking to.
const SOURCE_URL = "https://github.com/ivank-hvac/hvac-guide";

function renderFooterInfo() {
  const parts = ["IvanK"];
  if (versionData) parts.push(`${versionData.commit} · ${versionData.commit_date}`);
  if (state.sessionId) parts.push(`session: ${state.sessionId.slice(0, 8)}`);
  versionInfoEl.textContent = parts.join(" · ");

  const link = document.createElement("a");
  link.href = SOURCE_URL;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = ui().sourceLink;
  versionInfoEl.append(" · ", link);
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
    componentCheck: state.componentCheck,
    graphLaunchReturn: state.graphLaunchReturn,
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

// Stable key for the chosen equipment type ("rtu", "chiller", ...), taken
// from the `equipment` field on the start node's options rather than from
// the option's index — the option order in graph.json is content, and
// content gets reordered.
function equipmentKey() {
  const first = state.answers[0];
  if (!first || first.nodeId !== GRAPH.start || first.optionIndex == null) return null;
  const startNode = GRAPH.nodes[GRAPH.start];
  const opt = startNode && startNode.options && startNode.options[first.optionIndex];
  return (opt && opt.equipment) || null;
}

// Where an answered option leads. Two graph.json conventions on top of a
// plain `next`:
//   "__pending__"    - resume wherever the equipment-type choice was headed
//                      (see the universal power/thermostat gate questions)
//   nextByEquipment  - route by equipment class, with a `default`. Exists so
//                      advice that only applies to some equipment doesn't get
//                      handed to a tech whose machine physically can't have
//                      the part in question (the case that prompted it:
//                      king/queen valve advice on an RTU, which has no
//                      receiver — see lp_stable_check).
function resolveOptionNext(opt) {
  if (opt.nextByEquipment) {
    const key = equipmentKey();
    const byEquipment = opt.nextByEquipment;
    if (key && byEquipment[key]) return byEquipment[key];
    return byEquipment.default;
  }
  return opt.next === "__pending__" ? state.pendingNodeId : opt.next;
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
    componentCheck: np.componentCheck || null,
    graphLaunchReturn: np.graphLaunchReturn || null,
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
  return type === "field" || type === "select" || type === "component_check" || type === "graph_launch"
    ? !!(value && String(value).trim())
    : !!value;
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
    // Hung under the row rather than inside it — .checklist-item is a flex
    // row, so a counter placed in it would land beside the field.
    let counter = null;

    if (item.type === "field") {
      const labelEl = document.createElement("span");
      labelEl.textContent = t(item.label);
      row.appendChild(labelEl);
      const input = document.createElement("input");
      input.type = "text";
      input.className = "checklist-field-input" + (item.unit ? " numeric" : "");
      input.value = values[item.id] || "";
      // A field with a unit is a few digits (see .checklist-field-input.numeric)
      // — worth capping against a paste, but a counter there is just noise.
      if (item.unit) input.maxLength = MAX_ANSWER_FIELD_LEN;
      else counter = attachCharCounter(input, MAX_ANSWER_FIELD_LEN);
      input.addEventListener("input", () => {
        values[item.id] = input.value;
        updateProgress();
        scheduleSessionSave();
      });
      row.appendChild(input);
      // A placeholder alone disappears the moment a value is typed, so a
      // reading like "256" with no unit in sight is ambiguous — a
      // persistent label next to the field (same as numeric_input's
      // .numeric-unit) keeps the unit visible regardless of input state.
      if (item.unit) {
        const unitEl = document.createElement("span");
        unitEl.className = "numeric-unit";
        unitEl.textContent = item.unit;
        row.appendChild(unitEl);
      }
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
    if (counter) wrap.appendChild(counter);
  });

  updateProgress();
  container.appendChild(wrap);
}

// Per-phase {label, done, total} counts for the universal intake checklist
// (see intake_checklist below), regardless of whether the tech reached it
// via the "Deeper diagnosis" button or is seeing it summarized here for the
// first time — same state.intake, just read differently. Reuses
// intakeShowIfMet/intakeItemResolved so "done" means the same thing here as
// it does on the gated phase screen itself.
function intakePhaseProgress() {
  const phases = GRAPH.intake_checklist || [];
  return phases.map((phase) => {
    const values = state.intake[phase.id] || {};
    const visibleItems = phase.items.filter((item) => intakeShowIfMet(item.showIf));
    const done = visibleItems.filter((item) => intakeItemResolved(values[item.id], item.type)).length;
    return { label: t(phase.label), done, total: visibleItems.length };
  });
}

// The session's closing action, rendered in place at the bottom of the
// result screen (see renderResult) — no separate screen/navigation. Used to
// be a dedicated "Finish checklist" -> "Session summary" -> "Complete" flow
// on its own step (FINISH_STEP_ID); folded together because that flow's
// actual payoff (the diagnosis) was already one screen back and never
// re-shown here, so completing a session felt like a dead end. Now:
// clicking the button marks status=completed right away and expands this
// same report in place — the diagnosis/related_checks/AI answer above never
// leave view.
function renderReportSection(resultNodeId, container) {
  const strings = ui();

  if (state.finishNodeId !== resultNodeId) {
    const btn = document.createElement("button");
    btn.className = "btn input-action";
    btn.textContent = strings.finishBtn;
    btn.onclick = () => {
      if (sessionSaveTimer) {
        clearTimeout(sessionSaveTimer);
        sessionSaveTimer = null;
      }
      state.finishNodeId = resultNodeId;
      saveSession("completed");
      render();
    };
    container.appendChild(btn);
    return;
  }

  const wrap = document.createElement("div");
  wrap.className = "report-section";

  const doneMsg = document.createElement("div");
  doneMsg.className = "numeric-hint";
  doneMsg.textContent = strings.finishCompletedMsg;
  wrap.appendChild(doneMsg);

  const phases = intakePhaseProgress();
  if (phases.length) {
    const title = document.createElement("div");
    title.className = "related-checks-title";
    title.textContent = strings.reportIntakeProgressTitle;
    wrap.appendChild(title);
    phases.forEach((p, phaseIndex) => {
      const allDone = p.total === 0 || p.done === p.total;
      const row = document.createElement("button");
      row.type = "button";
      row.className = "report-intake-row" + (allDone ? " done" : " pending");
      const icon = document.createElement("span");
      icon.className = "report-intake-icon";
      icon.textContent = allDone ? "✓" : "○";
      const text = document.createElement("span");
      text.textContent = allDone
        ? `${p.label} — ${strings.reportPhaseDone}`
        : `${p.label} — ${strings.reportPhaseRemaining.replace("{n}", p.total - p.done)}`;
      row.appendChild(icon);
      row.appendChild(text);
      row.onclick = () => startIntakeChecklist(resultNodeId, phaseIndex);
      wrap.appendChild(row);
    });
  }

  container.appendChild(wrap);
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
  // "Not sure" (entry.skipped) can't satisfy either branch of a showIf —
  // only a definite Yes/No does, since we don't actually know the answer.
  if (!entry || entry.skipped) return false;
  return entry.value === (showIf.equals ? "Yes" : "No");
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

// Items sharing an `exclusiveGroup` (e.g. metering_txv/metering_captube/
// metering_other — a system has exactly one metering device type, not
// several) are mutually exclusive: once one is answered "Yes" (or, for a
// field, filled in), the others lock — a tech shouldn't have to separately
// answer "No" on every alternative once they've already said which one it
// actually is. Returns the OTHER item currently "chosen" in the group, or
// null if none is.
function exclusiveGroupWinner(phase, item, values) {
  if (!item.exclusiveGroup) return null;
  return (
    phase.items.find((other) => {
      if (other.id === item.id || other.exclusiveGroup !== item.exclusiveGroup) return false;
      const otherEntry = values[other.id];
      if (!otherEntry) return false;
      return other.type === "field"
        ? !!(otherEntry.value && String(otherEntry.value).trim())
        : otherEntry.value === "Yes";
    }) || null
  );
}

// Entry point for the "Deeper diagnosis" button on a result/ai_prompt
// screen (see buildAiBox usage in renderResult/renderAiPrompt) — always
// restarts at phase 0 so re-reviewing an already-completed checklist walks
// through every phase again rather than landing on just the last one
// (earlier phases' answers are still there, already resolved, so a review
// pass is just clicking "Next phase" through them unless something needs
// changing).
function startIntakeChecklist(returnNodeId, phaseIndex = 0) {
  state.pendingNodeId = returnNodeId;
  state.intakePhaseIndex = phaseIndex;
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
      // "" means unanswered for every type now, including checkbox — see
      // the checkbox branch below for why it's a "Yes"/"No" string tri-
      // state (plus skipped for "Not sure"), not a boolean.
      values[item.id] = { value: "", skipped: false };
    }
    const entry = values[item.id];

    // exclusiveGroup lock: a sibling item already claimed this group (e.g.
    // "TXV present: Yes" locks out "Capillary tube present"/"Other metering
    // device") — force this item back to its "not chosen" state so a stale
    // answer from before the winner was picked doesn't linger while it's
    // disabled.
    const lockedBy = exclusiveGroupWinner(phase, item, values);
    if (lockedBy) {
      if (item.type === "field") {
        entry.value = "";
        entry.skipped = true;
      } else {
        entry.value = "No";
        entry.skipped = false;
      }
      entry.lockedByGroup = true;
    } else if (entry.lockedByGroup) {
      // Was forced by a sibling before, no longer locked (the sibling's
      // answer changed) — clear the forced state instead of leaving a
      // phantom "No"/N-A the tech never actually chose.
      entry.value = "";
      entry.skipped = false;
      entry.lockedByGroup = false;
    }

    const resolved = intakeItemResolved(entry, item.type);
    const isCurrent = !resolved && !firstUnresolvedFound;
    if (isCurrent) firstUnresolvedFound = true;

    const row = document.createElement("div");
    row.className = "intake-item" + (isCurrent ? " current" : "");

    const labelEl = document.createElement("div");
    labelEl.className = "intake-item-label";
    labelEl.textContent = t(item.label);
    row.appendChild(labelEl);

    if (lockedBy) {
      const lockHint = document.createElement("div");
      lockHint.className = "numeric-hint";
      lockHint.textContent = strings.intakeLockedHint.replace("{item}", t(lockedBy.label));
      row.appendChild(lockHint);
    }

    // Every item gets its N/A as a large tappable button, not a small
    // checkbox — glove-friendly (~52-56px min tap height, see CSS) and
    // visually explicit about what's been decided vs. still untouched.
    const naBtn = document.createElement("button");
    naBtn.type = "button";
    naBtn.className = "intake-toggle-btn intake-na-btn" + (entry.skipped ? " active" : "");
    naBtn.textContent = strings.intakeSkipLabel;

    if (item.type === "field") {
      const fieldRow = document.createElement("div");
      fieldRow.className = "intake-item-field-row";
      const input = document.createElement("input");
      input.type = "text";
      input.className = "checklist-field-input" + (item.unit ? " numeric" : "");
      input.id = `intake-field-${item.id}`;
      input.value = entry.value || "";
      input.disabled = entry.skipped || !!lockedBy;
      // Same split as renderChecklist: unit-bearing fields are numeric
      // readings, so they get the cap but not a counter.
      let counter = null;
      if (item.unit) input.maxLength = MAX_ANSWER_FIELD_LEN;
      else counter = attachCharCounter(input, MAX_ANSWER_FIELD_LEN);
      // Only updates the gate (button/hint), never a full re-render — a
      // full render() on every keystroke would reset focus/cursor position
      // mid-typing. Safe here because showIf conditions in this graph only
      // ever depend on checkbox items, never on a field's value — EXCEPT
      // exclusiveGroup, which does need siblings to grey out live as you
      // type (not just on the next unrelated render), so that one case
      // re-renders and restores focus/cursor position manually.
      input.addEventListener("input", () => {
        entry.value = input.value;
        scheduleSessionSave();
        if (item.exclusiveGroup) {
          const selStart = input.selectionStart;
          const selEnd = input.selectionEnd;
          render();
          const restored = document.getElementById(`intake-field-${item.id}`);
          if (restored) {
            restored.focus();
            restored.setSelectionRange(selStart, selEnd);
          }
        } else {
          updateGateState();
        }
      });
      naBtn.disabled = !!lockedBy;
      naBtn.onclick = () => {
        entry.skipped = !entry.skipped;
        scheduleSessionSave();
        render();
      };
      fieldRow.appendChild(input);
      // Persistent unit label (see renderChecklist's field branch for the
      // same fix) — a placeholder alone disappears once a value is typed.
      if (item.unit) {
        const unitEl = document.createElement("span");
        unitEl.className = "numeric-unit";
        unitEl.textContent = item.unit;
        fieldRow.appendChild(unitEl);
      }
      fieldRow.appendChild(naBtn);
      row.appendChild(fieldRow);
      if (counter) row.appendChild(counter);
    } else if (item.type === "select") {
      const group = document.createElement("div");
      group.className = "intake-toggle-group";
      (item.options || []).forEach((opt) => {
        const btn = document.createElement("button");
        btn.type = "button";
        const isActive = !entry.skipped && entry.value === opt;
        const isNormal = item.normal != null && opt === item.normal;
        btn.className =
          "intake-toggle-btn" + (isActive ? (isNormal ? " active normal" : " active abnormal") : "");
        btn.textContent = opt;
        // Same reasoning as the checkbox branch below: a select answer can
        // gate a later phase's item, so this needs a full render(), not
        // just the gate hint.
        btn.onclick = () => {
          entry.value = opt;
          entry.skipped = false;
          scheduleSessionSave();
          render();
        };
        group.appendChild(btn);
      });
      naBtn.onclick = () => {
        entry.value = "";
        entry.skipped = true;
        scheduleSessionSave();
        render();
      };
      group.appendChild(naBtn);
      row.appendChild(group);

      // Row border communicates at a glance whether the reading is what
      // you'd expect (green), a flag worth a closer look (red/amber), or
      // ruled out (neutral) — see CLAUDE.md UI task for the color rule.
      // Not applied to checkbox (Yes/No) items yet — pending the separate
      // alertValues design (which value(s) count as an alert vs. just
      // off-normal), not because a "No" answer can't matter.
      if (entry.skipped) {
        // neutral — no extra class needed, same look as an untouched row
      } else if (entry.value && item.normal != null) {
        row.classList.add(entry.value === item.normal ? "intake-select-normal" : "intake-select-abnormal");
      }
    } else if (item.type === "graph_launch") {
      // Unlike component_check (an isolated island — see
      // COMPONENT_CHECK_STEP_ID), this launches an ordinary main-graph flow
      // (e.g. the precise SH/SC calc chain starting at pt_suction_pressure)
      // with normal goTo/state.answers navigation — the target nodes
      // already exist and work standalone, no need to duplicate them into
      // a separate namespace. state.graphLaunchReturn just remembers where
      // to deposit the finding and jump back to (see the "__intake_return__"
      // handling in renderPtCalc).
      if (entry.value) {
        const summary = document.createElement("div");
        summary.className = "numeric-hint";
        summary.textContent = entry.value;
        row.appendChild(summary);
      }
      const group = document.createElement("div");
      group.className = "intake-toggle-group";
      const startBtn = document.createElement("button");
      startBtn.type = "button";
      startBtn.className = "intake-toggle-btn" + (!entry.skipped && entry.value ? " active" : "");
      startBtn.textContent = entry.value ? strings.graphLaunchReviewBtn : strings.graphLaunchStartBtn;
      startBtn.onclick = () => {
        state.graphLaunchReturn = { phaseId: phase.id, itemId: item.id };
        // "Deeper diagnosis" is reachable from any result/ai_prompt node,
        // not just branches that already asked for the refrigerant — skip
        // straight to item.root if it's already known (e.g. this session
        // already went through nc_refrigerant earlier), otherwise ask via
        // item.refrigerantRoot first so the chain doesn't waste 4 readings
        // only to discover at the end that it can't compute anything.
        const knowsRefrigerant = state.refrigerant && state.refrigerant.id !== "unknown";
        const root = !knowsRefrigerant && item.refrigerantRoot ? item.refrigerantRoot : item.root;
        goTo(root, { prevId: state.currentId });
      };
      naBtn.onclick = () => {
        entry.value = "";
        entry.skipped = true;
        scheduleSessionSave();
        render();
      };
      group.appendChild(startBtn);
      group.appendChild(naBtn);
      row.appendChild(group);
    } else if (item.type === "component_check") {
      // entry.value holds the finding text once the subtree's been walked
      // (see finishComponentCheck) — shown as a summary so the tech can see
      // the outcome without re-entering the subtree.
      if (entry.value) {
        const summary = document.createElement("div");
        summary.className = "numeric-hint";
        summary.textContent = entry.value;
        row.appendChild(summary);
      }
      const group = document.createElement("div");
      group.className = "intake-toggle-group";
      const startBtn = document.createElement("button");
      startBtn.type = "button";
      startBtn.className = "intake-toggle-btn" + (!entry.skipped && entry.value ? " active" : "");
      startBtn.textContent = entry.value ? strings.componentCheckReviewBtn : strings.componentCheckStartBtn;
      startBtn.onclick = () => startComponentCheck(phase.id, item.id, item.checkId);
      naBtn.onclick = () => {
        entry.value = "";
        entry.skipped = true;
        scheduleSessionSave();
        render();
      };
      group.appendChild(startBtn);
      group.appendChild(naBtn);
      row.appendChild(group);
    } else {
      // checkbox items are actually yes/no assertions ("TXV present?",
      // "breaker in norm?"), not "did I do this task" — so this is a real
      // tri-state (Yes/No/Not sure), not a 2-state done/skip toggle.
      // entry.value is a "Yes"/"No" string (or "" if unanswered), same
      // shape as select — "No" is a genuine, resolved answer, distinct
      // from "Not sure" (entry.skipped), which is what N/A used to
      // conflate it with. No color-coding yet (deliberately neutral,
      // same generic "active" fill as everything else) — that's pending
      // the separate alertValues design (see CLAUDE.md).
      const group = document.createElement("div");
      group.className = "intake-toggle-group";
      const yesBtn = document.createElement("button");
      yesBtn.type = "button";
      yesBtn.className = "intake-toggle-btn" + (!entry.skipped && entry.value === "Yes" ? " active" : "");
      yesBtn.textContent = strings.intakeYesLabel;
      yesBtn.disabled = !!lockedBy;
      // A full render() here (not just updateGateState()) is deliberate: a
      // checkbox can be a showIf trigger for a later phase's item, so
      // toggling one may need to reveal/hide other items, not just flip
      // the gate.
      yesBtn.onclick = () => {
        entry.value = "Yes";
        entry.skipped = false;
        scheduleSessionSave();
        render();
      };
      const noBtn = document.createElement("button");
      noBtn.type = "button";
      noBtn.className = "intake-toggle-btn" + (!entry.skipped && entry.value === "No" ? " active" : "");
      noBtn.textContent = strings.intakeNoLabel;
      noBtn.disabled = !!lockedBy;
      noBtn.onclick = () => {
        entry.value = "No";
        entry.skipped = false;
        scheduleSessionSave();
        render();
      };
      naBtn.textContent = strings.intakeNotSureLabel;
      naBtn.disabled = !!lockedBy;
      naBtn.onclick = () => {
        entry.value = "";
        entry.skipped = true;
        scheduleSessionSave();
        render();
      };
      group.appendChild(yesBtn);
      group.appendChild(noBtn);
      group.appendChild(naBtn);
      row.appendChild(group);
    }

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

// ---- Component check (pilot: metering device only) ----------------------
// A `component_check`-type intake item embeds a tiny question/result
// subtree — same node shape as the main graph (type/text/options/next for
// question, type/text/severity for result), just scoped under its own
// namespace in graph.json (`component_checks`) instead of the shared 42-
// node graph. It's walked with its own local currentId/history rather than
// the main graph's, so navigating it never touches state.answers/
// state.history — "answering" here means recording one finding into the
// intake item, not extending the top-level symptom-diagnosis trail.
// Deliberately piloted on metering device only — see CLAUDE.md's
// "Component sub-tree pattern" task for why the other components
// (moisture indicator, filter-drier, solenoid) wait for this to prove out
// on a live deploy first.

function componentCheckNode() {
  const cc = state.componentCheck;
  return GRAPH.component_checks[cc.checkId].nodes[cc.currentId];
}

function startComponentCheck(phaseId, itemId, checkId) {
  const def = GRAPH.component_checks && GRAPH.component_checks[checkId];
  if (!def) return;
  // entryFrom skips questions the intake checklist already answered (e.g.
  // "Installed?"/"What type?" are redundant once Phase 1 already confirmed
  // "TXV present: Yes") — same {phase, item, equals} shape as showIf, so
  // intakeShowIfMet is reused as-is, not a new rule language. Falls back to
  // def.root when nothing matches (e.g. Phase 1 only has free-text "Other
  // metering device" filled in, which doesn't tell us which of the
  // remaining types it is).
  const matchedEntry = (def.entryFrom || []).find((rule) => intakeShowIfMet(rule));
  state.componentCheck = {
    phaseId,
    itemId,
    checkId,
    currentId: matchedEntry ? matchedEntry.node : def.root,
    history: [],
    description: "",
  };
  state.currentId = COMPONENT_CHECK_STEP_ID;
  render();
}

function componentCheckBack() {
  const cc = state.componentCheck;
  if (cc.history.length) {
    cc.currentId = cc.history.pop();
    render();
  } else {
    // Backed out before reaching a finding — nothing to save, just return
    // to the intake phase this item lives on.
    state.componentCheck = null;
    state.currentId = INTAKE_STEP_ID;
    render();
  }
}

function finishComponentCheck(node) {
  const cc = state.componentCheck;
  if (!state.intake[cc.phaseId]) state.intake[cc.phaseId] = {};
  const finding = t(node.text) + (cc.description.trim() ? ` — ${cc.description.trim()}` : "");
  state.intake[cc.phaseId][cc.itemId] = { value: finding, skipped: false };
  state.componentCheck = null;
  state.currentId = INTAKE_STEP_ID;
  scheduleSessionSave();
  render();
}

function renderComponentCheck() {
  const strings = ui();
  const node = componentCheckNode();
  // Overrides render()'s default backBtn.onclick = goBack (reset on every
  // render) — this screen has its own back stack, separate from the main
  // graph's, so it must not pop state.history.
  backBtn.onclick = componentCheckBack;
  backBtn.style.display = "inline-block";

  if (node.type === "question") {
    const q = document.createElement("div");
    q.className = "q-text";
    q.textContent = t(node.text);
    cardEl.appendChild(q);

    const opts = document.createElement("div");
    opts.className = "options";
    node.options.forEach((opt) => {
      const b = document.createElement("button");
      b.className = "btn";
      b.textContent = t(opt.label);
      b.onclick = () => {
        state.componentCheck.history.push(state.componentCheck.currentId);
        state.componentCheck.currentId = opt.next;
        render();
      };
      opts.appendChild(b);
    });
    cardEl.appendChild(opts);
    return;
  }

  // Terminal node (type: "result") — same content shape as any main-graph
  // result node (text/severity), but with a "save & return" action instead
  // of the checklist/AI machinery: this finding belongs to one intake
  // item, not a standalone diagnostic endpoint.
  const badge = document.createElement("span");
  badge.className = `badge ${node.severity || "info"}`;
  badge.textContent = strings.badge[node.severity || "info"];
  cardEl.appendChild(badge);

  const text = document.createElement("div");
  text.className = "result-text";
  text.textContent = t(node.text);
  cardEl.appendChild(text);

  const descInput = document.createElement("textarea");
  descInput.placeholder = strings.componentCheckDescPlaceholder;
  descInput.value = state.componentCheck.description;
  descInput.addEventListener("input", () => {
    state.componentCheck.description = descInput.value;
  });
  cardEl.appendChild(descInput);
  // The finding is saved as "<result text> — <description>" and travels to
  // the server as ONE answer field (see finishComponentCheck), so what the
  // tech may type is the cap minus the result text already spent on it.
  cardEl.appendChild(
    attachCharCounter(descInput, Math.max(0, MAX_ANSWER_FIELD_LEN - (t(node.text).length + " — ".length)))
  );

  const saveBtn = document.createElement("button");
  saveBtn.className = "btn input-action";
  saveBtn.textContent = strings.componentCheckSaveBtn;
  saveBtn.onclick = () => finishComponentCheck(node);
  cardEl.appendChild(saveBtn);
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
  // The intake checklist screen is pure UI navigation (see INTAKE_STEP_ID) —
  // entering it never added an answer entry, so leaving it must not pop one
  // either. (The old finish screen used to need the same treatment — see
  // renderReportSection — but it's no longer a navigable screen at all, so
  // goBack can never be called while "on" it.)
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
  } else if (!leavingIntakeScreen) {
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
    componentCheck: null,
    graphLaunchReturn: null,
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

// Plain small text in the footer, not styled as buttons — this is a passive
// record of the path taken, not an interactive control (nothing here is
// clickable), so it shouldn't look tappable.
function renderBreadcrumb() {
  breadcrumbEl.innerHTML = "";
  let first = true;
  state.answers.forEach((entry) => {
    const label = answerLabel(entry);
    if (!label) return;
    if (!first) breadcrumbEl.appendChild(document.createTextNode(" → "));
    first = false;
    const span = document.createElement("span");
    if (entry.exceeds) span.className = "breadcrumb-alert";
    span.textContent = label;
    breadcrumbEl.appendChild(span);
  });
  backBtn.style.display = state.history.length ? "inline-block" : "none";
}

function render() {
  renderBreadcrumb();
  renderFooterInfo();
  cardEl.innerHTML = "";
  scheduleSessionSave();
  // renderComponentCheck() overrides this to its own back handler — reset
  // here first so every other screen gets the normal global back behavior
  // regardless of what the previous screen left it as.
  backBtn.onclick = goBack;

  if (state.currentId === MANUFACTURER_STEP_ID) {
    renderManufacturerStep();
    return;
  }
  if (state.currentId === FINISH_STEP_ID) {
    // Back-compat for sessions saved before the separate finish screen was
    // folded into the result screen's own report section (see
    // renderReportSection) — land back on the underlying result node with
    // its report already expanded (finishNodeId is still set from before).
    state.currentId = state.finishNodeId || GRAPH.start;
    render();
    return;
  }
  if (state.currentId === INTAKE_STEP_ID) {
    renderIntakeChecklist();
    return;
  }
  if (state.currentId === COMPONENT_CHECK_STEP_ID) {
    renderComponentCheck();
    return;
  }

  const node = GRAPH.nodes[state.currentId];

  if (node.type === "question") {
    renderQuestion(node);
  } else if (node.type === "dual_pressure_check") {
    renderDualPressureCheck(node);
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
  } else if (node.type === "pt_noncondensable_calc") {
    renderNoncondensableCalc(node);
  }
}

// Opt-in flag (see nc_fans_ok) for qualitative questions that are
// implicitly "vs. this refrigerant's P-T chart" — shows which refrigerant
// that comparison is against right next to the question, not just up in
// the breadcrumb where it's easy to lose track of. Shared by both
// renderQuestion and renderDualPressureCheck.
function buildQuestionHeader(node) {
  const q = document.createElement("div");
  q.className = "q-text";
  if (node.showRefrigerant && state.refrigerant && state.refrigerant.id !== "unknown") {
    q.classList.add("q-text-with-refrigerant");
    const label = document.createElement("span");
    label.textContent = t(node.text);
    const refChip = document.createElement("span");
    refChip.className = "chip q-refrigerant-chip";
    refChip.textContent = state.refrigerant.name;
    q.appendChild(label);
    q.appendChild(refChip);
  } else {
    q.textContent = t(node.text);
  }
  return q;
}

function renderQuestion(node) {
  cardEl.appendChild(buildQuestionHeader(node));

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
      goTo(resolveOptionNext(opt), { prevId: state.currentId });
    };
    opts.appendChild(b);
  });
  cardEl.appendChild(opts);
}

// Two independent qualitative readings captured on one screen (e.g.
// suction AND head pressure vs. the P-T chart — see nc_fans_ok) instead of
// asking about one and leaving the other uncaptured. Only one block
// (`drivesNavigation: true`) actually determines where "Next" goes; the
// rest are recorded as answers (visible in the breadcrumb/AI context) but
// don't branch the graph — deliberately not a full N-dimensional routing
// matrix, just closing the "the other reading never got asked" gap.
function renderDualPressureCheck(node) {
  const nodeId = state.currentId;
  const strings = ui();
  cardEl.appendChild(buildQuestionHeader(node));

  const selections = {};
  const nextBtn = document.createElement("button");
  nextBtn.className = "btn input-action";
  nextBtn.textContent = strings.nextBtn;
  nextBtn.disabled = true;

  function updateNextState() {
    nextBtn.disabled = node.blocks.some((b) => selections[b.id] == null);
  }

  node.blocks.forEach((block) => {
    const wrap = document.createElement("div");
    wrap.className = "measurement-field";
    const label = document.createElement("div");
    label.className = "measurement-field-label";
    label.textContent = t(block.label);
    wrap.appendChild(label);

    const group = document.createElement("div");
    group.className = "intake-toggle-group";
    const buttons = [];
    block.options.forEach((opt, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "intake-toggle-btn";
      btn.textContent = t(opt.label);
      btn.onclick = () => {
        selections[block.id] = opt;
        buttons.forEach((b, i) => b.classList.toggle("active", i === idx));
        updateNextState();
      };
      buttons.push(btn);
      group.appendChild(btn);
    });
    wrap.appendChild(group);
    cardEl.appendChild(wrap);
  });

  cardEl.appendChild(nextBtn);

  nextBtn.onclick = () => {
    node.blocks.forEach((block) => {
      state.answers.push({ nodeId, field: "dual_block", block: block.id, value: t(selections[block.id].label) });
    });
    const primary = node.blocks.find((b) => b.drivesNavigation) || node.blocks[0];
    goTo(selections[primary.id].next, { prevId: nodeId });
  };
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
  const otherCounter = attachCharCounter(otherInput, MAX_ANSWER_FIELD_LEN);
  otherCounter.style.display = "none";
  cardEl.appendChild(otherCounter);

  select.addEventListener("change", () => {
    const show = select.value === "other" ? "block" : "none";
    otherInput.style.display = show;
    otherCounter.style.display = show;
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
  modelWrap.appendChild(attachCharCounter(modelInput, MAX_ANSWER_FIELD_LEN));
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
  input.maxLength = MAX_NUMERIC_FIELD_LEN;
  input.autocomplete = "off";
  input.className = "numeric-input narrow";
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
    input.maxLength = MAX_NUMERIC_FIELD_LEN;
    input.autocomplete = "off";
    input.className = "numeric-input narrow";
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
    if (node.next === "__intake_return__" && state.graphLaunchReturn) {
      const { phaseId, itemId } = state.graphLaunchReturn;
      if (!state.intake[phaseId]) state.intake[phaseId] = {};
      state.intake[phaseId][itemId] = { value: resultEntry ? resultEntry.value : "", skipped: false };
      state.graphLaunchReturn = null;
      scheduleSessionSave();
      goTo(INTAKE_STEP_ID, { prevId: nodeId });
      return;
    }
    goTo(node.next, { prevId: nodeId });
  };
}

// Same "pull the last role-tagged readings out of state.answers, compute,
// show a verdict, advance on Next" shape as renderPtCalc — a standing
// pressure test needs a different calculation (see
// computeNoncondensablesResult) and a different result shape (a single
// elevated/normal verdict, not two Δ°F numbers), so it's its own render
// function rather than a mode branch bolted onto renderPtCalc.
function renderNoncondensableCalc(node) {
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

  computeNoncondensablesResult().then((result) => {
    body.innerHTML = "";
    body.className = "";

    if (result.status === "unavailable") {
      const msg = document.createElement("div");
      msg.className = "numeric-hint";
      msg.textContent = strings.ptCalcUnavailable;
      body.appendChild(msg);
      resultEntry = { nodeId, field: "noncond_result", value: strings.ptCalcUnavailable, exceeds: false };
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
        field: "noncond_result",
        value: strings.ptCalcOutOfRangeValue,
        exceeds: true,
        critical: true,
      };
    } else {
      const badge = document.createElement("span");
      badge.className = `badge ${result.nonCondensablesLikely ? "critical" : "info"}`;
      badge.textContent = result.nonCondensablesLikely ? strings.badge.critical : strings.badge.info;
      body.appendChild(badge);

      const expectedRow = document.createElement("div");
      expectedRow.className = "measurement-field";
      const expectedLabel = document.createElement("div");
      expectedLabel.className = "measurement-field-label";
      expectedLabel.textContent = strings.noncondExpectedLabel;
      const expectedVal = document.createElement("div");
      expectedVal.className = "q-text";
      expectedVal.textContent =
        roundTo(result.expectedMin, 1) === roundTo(result.expectedMax, 1)
          ? formatNumericValue(roundTo(result.expectedMax, 1), "psig")
          : `${formatNumericValue(roundTo(result.expectedMin, 1), "psig")} – ${formatNumericValue(roundTo(result.expectedMax, 1), "psig")}`;
      expectedRow.appendChild(expectedLabel);
      expectedRow.appendChild(expectedVal);
      body.appendChild(expectedRow);

      const measuredRow = document.createElement("div");
      measuredRow.className = "measurement-field";
      const measuredLabel = document.createElement("div");
      measuredLabel.className = "measurement-field-label";
      measuredLabel.textContent = strings.noncondMeasuredLabel;
      const measuredVal = document.createElement("div");
      measuredVal.className = "q-text";
      measuredVal.textContent = formatNumericValue(result.pressure, "psig");
      measuredRow.appendChild(measuredLabel);
      measuredRow.appendChild(measuredVal);
      body.appendChild(measuredRow);

      if (result.nonCondensablesLikely) {
        const alertBox = document.createElement("div");
        alertBox.className = "measurement-alert";
        const alertIcon = document.createElement("span");
        alertIcon.className = "measurement-alert-icon";
        alertIcon.textContent = "⚠️";
        const alertText = document.createElement("span");
        alertText.textContent = strings.noncondLikelyText;
        alertBox.appendChild(alertIcon);
        alertBox.appendChild(alertText);
        body.appendChild(alertBox);
      } else {
        const verdict = document.createElement("div");
        verdict.className = "numeric-hint";
        verdict.textContent = strings.noncondNormalText;
        body.appendChild(verdict);
      }

      const value = `${strings.noncondMeasuredLabel} ${formatNumericValue(result.pressure, "psig")} / ${strings.noncondExpectedLabel} ${formatNumericValue(roundTo(result.expectedMax, 1), "psig")} — ${
        result.nonCondensablesLikely ? strings.noncondLikelyShort : strings.noncondNormalShort
      }`;
      resultEntry = { nodeId, field: "noncond_result", value, exceeds: result.nonCondensablesLikely };
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

  if (node.severity === "critical") {
    const banner = document.createElement("div");
    banner.className = "safety-banner";
    banner.textContent = strings.safetyBannerText;
    cardEl.appendChild(banner);
  }

  const tEl = document.createElement("div");
  tEl.className = "result-text";
  tEl.textContent = t(node.text);
  cardEl.appendChild(tEl);

  if (node.related_checks && node.related_checks.length) {
    const relatedBox = document.createElement("div");
    relatedBox.className = "related-checks";
    const title = document.createElement("div");
    title.className = "related-checks-title";
    title.textContent = strings.relatedChecksTitle;
    relatedBox.appendChild(title);
    const list = document.createElement("ul");
    node.related_checks.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = t(item);
      list.appendChild(li);
    });
    relatedBox.appendChild(list);
    cardEl.appendChild(relatedBox);
  }

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

  // fixing_phase items (recovery/recharge/replacement confirmations) belong to
  // a future repair-tracking phase, not troubleshooting — hidden for now
  // rather than deleted, so they're ready to re-enable once that phase exists.
  const resultNodeId = state.currentId;
  const activeChecklist = (node.checklist || []).filter((item) => !item.fixing_phase);
  if (activeChecklist.length) {
    renderChecklist(resultNodeId, activeChecklist, cardEl);
  }

  renderReportSection(resultNodeId, cardEl);

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
  cardEl.appendChild(attachCharCounter(textarea, MAX_FREE_TEXT_LEN));

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
    if (entry.field === "dual_block") {
      const node = GRAPH.nodes[entry.nodeId];
      const block = node.blocks.find((b) => b.id === entry.block);
      return { question: t(block.label), answer: answerLabel(entry) };
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
      if (item.fixing_phase) return;
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
      // checkbox/select/component_check all store a plain string value
      // now (checkbox is "Yes"/"No" — see the intake render loop) — only
      // "field" needs the unit-suffix special case.
      const answer = entry.skipped
        ? "N/A"
        : item.type === "field"
        ? (item.unit ? `${entry.value} ${item.unit}` : String(entry.value))
        : String(entry.value);
      rows.push({ question: t(item.label), answer });
    });
  });
  return rows;
}

// currentAnswers() alone (graph path only) is what logSession's history
// uses — checklist items are already shown on-screen as their own
// interactive widget, so folding them in here would duplicate them. The AI,
// on the other hand, never sees the checklist at all otherwise — so only
// its payload gets the combined view.
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

// Warn while there is still room to act, rather than refusing without notice
// partway through a diagnosis. Silent below half the allowance, a plain note
// from there, and an unmistakable one for the last tenth.
function renderQuotaNotice(target, remaining, limit) {
  if (typeof remaining !== "number" || typeof limit !== "number" || limit <= 0) return;
  const share = remaining / limit;
  if (share > 0.5) return;
  const strings = ui();
  const notice = document.createElement("div");
  notice.className = share <= 0.1 ? "quota-notice critical" : "quota-notice";
  notice.textContent = strings.quotaRemaining.replace("{n}", remaining);
  target.appendChild(notice);
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
        // Lets the backend spend a higher max_tokens ceiling on this
        // request — see AI_DEEP_DIVE_MAX_TOKENS in main.py — once the
        // technician has actually gone through the intake checklist this
        // session, since that answer set has real extra grounding to
        // reason over, not just the plain symptom-graph path.
        deep_dive: state.intakeAsked,
        // The backend refuses requests that carry no live session: a real
        // technician always has one by this point, an automated caller
        // hitting the endpoint directly does not.
        session_id: state.sessionId,
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
    renderQuotaNotice(target, data.calls_remaining, data.calls_limit);
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
