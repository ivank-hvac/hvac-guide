const cardEl = document.getElementById("card");
const breadcrumbEl = document.getElementById("breadcrumb");
const backBtn = document.getElementById("backBtn");
const restartBtn = document.getElementById("restartBtn");
const langButtons = document.querySelectorAll(".lang-btn");
const disclaimerEl = document.getElementById("disclaimer");

const I18N = {
  ru: {
    back: "← Назад",
    restart: "⟲ Начать сначала",
    badge: { info: "Инфо", warning: "Внимание", critical: "Критично" },
    aiLabel: "AI-анализ",
    aiLoading: "Анализирую checklist...",
    aiErrorPrefix: "Ошибка: ",
    aiRequestError: "Ошибка запроса",
    aiSendBtn: "🤖 Отправить AI-ассистенту",
    aiAskRecommended: "🤖 Уточнить у AI-ассистента (рекомендуется)",
    aiAsk: "🤖 Спросить AI-ассистента",
    freeformPlaceholder: "Опишите наблюдения, показания приборов, модель оборудования...",
    disclaimer: "Этот инструмент даёт вспомогательные диагностические предположения на основе ИИ и не заменяет суждение квалифицированного специалиста. Перед любыми работами с электричеством, хладагентом или под давлением всегда соблюдайте LOTO и применимые нормы безопасности (OSHA/CSA/местные). Используется на свой риск.",
    nextBtn: "Далее",
    numericRangeLabel: "Диапазон:",
  },
  en: {
    back: "← Back",
    restart: "⟲ Start Over",
    badge: { info: "Info", warning: "Warning", critical: "Critical" },
    aiLabel: "AI Analysis",
    aiLoading: "Analyzing checklist...",
    aiErrorPrefix: "Error: ",
    aiRequestError: "Request error",
    aiSendBtn: "🤖 Send to AI Assistant",
    aiAskRecommended: "🤖 Ask AI Assistant (recommended)",
    aiAsk: "🤖 Ask AI Assistant",
    freeformPlaceholder: "Describe your observations, gauge readings, equipment model...",
    disclaimer: "This tool provides AI-assisted diagnostic suggestions only — it doesn't replace the judgment of a qualified technician. Always follow LOTO and applicable safety codes (OSHA/CSA/local) before working on live electrical, refrigerant, or pressurized components. Use at your own risk.",
    nextBtn: "Next",
    numericRangeLabel: "Range:",
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
const VACUUM_RE = /(?<![\d(.])(-?\d+(?:\.\d+)?)\s?(microns|inHg|mmHg)\b(?!\s*\()/gi;

function annotateUnits(text) {
  if (!text) return text;
  let out = text.replace(PRESSURE_RE, (match, num, unit) => {
    const conv = convertPressure(parseFloat(num), unit.toLowerCase());
    return `${match} (${formatNum(conv.value)} ${conv.unit})`;
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
// "everything above the last threshold".
function resolveThresholdNext(node, value) {
  for (const th of node.thresholds) {
    if (th.max == null || value <= th.max) return th.next;
  }
  return node.thresholds[node.thresholds.length - 1]?.next;
}

// Answers can come from a question node (an option was picked) or a
// numeric_input node (a value was typed) — this resolves either shape to
// the text shown in the breadcrumb and sent to the AI assistant.
function answerLabel(entry) {
  const node = GRAPH.nodes[entry.nodeId];
  if (!node) return "";
  if (entry.optionIndex != null) {
    const opt = node.options?.[entry.optionIndex];
    return opt ? t(opt.label) : "";
  }
  if (entry.value != null) {
    return formatNumericValue(entry.value, node.unit);
  }
  return "";
}

let GRAPH = null;
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
  answers: [],   // [{nodeId, optionIndex}] for question nodes, [{nodeId, value}] for numeric_input
  sessionId: generateSessionId(),
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
  const res = await fetch("./graph.json");
  GRAPH = await res.json();
  goTo(GRAPH.start, { pushHistory: false });
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
  // remove the last answer we recorded (assumes 1 answer per question step)
  state.answers.pop();
  const prev = state.history.pop();
  state.currentId = prev;
  render();
}

function restart() {
  state = { currentId: GRAPH.start, history: [], answers: [], sessionId: generateSessionId() };
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
  langButtons.forEach((b) => b.classList.toggle("active", b.dataset.lang === LANG));
}

function renderBreadcrumb() {
  breadcrumbEl.innerHTML = "";
  state.answers.forEach((entry) => {
    const label = answerLabel(entry);
    if (!label) return;
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.textContent = label;
    breadcrumbEl.appendChild(chip);
  });
  backBtn.style.display = state.history.length ? "inline-block" : "none";
}

function render() {
  renderBreadcrumb();
  const node = GRAPH.nodes[state.currentId];
  cardEl.innerHTML = "";

  if (node.type === "question") {
    renderQuestion(node);
  } else if (node.type === "result") {
    renderResult(node);
  } else if (node.type === "ai_prompt") {
    renderAiPrompt(node);
  } else if (node.type === "numeric_input") {
    renderNumericInput(node);
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
      goTo(opt.next, { prevId: state.currentId });
    };
    opts.appendChild(b);
  });
  cardEl.appendChild(opts);
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
  nextBtn.className = "btn ai";
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
    const node = GRAPH.nodes[entry.nodeId];
    return { question: t(node.text), answer: answerLabel(entry) };
  });
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
        answers: currentAnswers(),
        context,
        free_text: freeText,
        lang: LANG,
      }),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.detail || strings.aiRequestError);
    resp.className = "ai-response";
    renderAiText(resp, data.analysis);
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
