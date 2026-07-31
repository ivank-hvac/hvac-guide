const cardEl = document.getElementById("card");
const breadcrumbEl = document.getElementById("breadcrumb");
const backBtn = document.getElementById("backBtn");
const restartBtn = document.getElementById("restartBtn");

let GRAPH = null;
let state = {
  currentId: null,
  history: [],   // stack of {nodeId, answerLabelRemoved}
  answers: [],   // [{question, answer}]
};

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
  state = { currentId: GRAPH.start, history: [], answers: [] };
  render();
}

function renderBreadcrumb() {
  breadcrumbEl.innerHTML = "";
  state.answers.forEach((a) => {
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.textContent = a.answer;
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
  }
}

function renderQuestion(node) {
  const q = document.createElement("div");
  q.className = "q-text";
  q.textContent = node.text;
  cardEl.appendChild(q);

  const opts = document.createElement("div");
  opts.className = "options";
  node.options.forEach((opt) => {
    const b = document.createElement("button");
    b.className = "btn";
    b.textContent = opt.label;
    b.onclick = () => {
      state.answers.push({ question: node.text, answer: opt.label });
      goTo(opt.next, { prevId: state.currentId });
    };
    opts.appendChild(b);
  });
  cardEl.appendChild(opts);
}

function renderResult(node) {
  const badge = document.createElement("span");
  badge.className = `badge ${node.severity || "info"}`;
  badge.textContent = {
    info: "Инфо",
    warning: "Внимание",
    critical: "Критично",
  }[node.severity || "info"];
  cardEl.appendChild(badge);

  const t = document.createElement("div");
  t.className = "result-text";
  t.textContent = node.text;
  cardEl.appendChild(t);

  const aiBox = buildAiBox({ context: node.text, highlighted: !!node.ai });
  cardEl.appendChild(aiBox);
}

function renderAiPrompt(node) {
  const t = document.createElement("div");
  t.className = "q-text";
  t.textContent = node.text;
  cardEl.appendChild(t);

  const textarea = document.createElement("textarea");
  textarea.placeholder = "Опишите наблюдения, показания приборов, модель оборудования...";
  cardEl.appendChild(textarea);

  const sendBtn = document.createElement("button");
  sendBtn.className = "btn ai";
  sendBtn.textContent = "🤖 Отправить AI-ассистенту";
  cardEl.appendChild(sendBtn);

  const responseHolder = document.createElement("div");
  cardEl.appendChild(responseHolder);

  sendBtn.onclick = () => {
    sendBtn.disabled = true;
    runAiAssist({
      context: node.text,
      freeText: textarea.value,
      target: responseHolder,
      onDone: () => { sendBtn.disabled = false; },
    });
  };
}

function buildAiBox({ context, highlighted }) {
  const box = document.createElement("div");
  box.className = "ai-box";

  const btn = document.createElement("button");
  btn.className = highlighted ? "btn ai" : "btn ghost";
  btn.textContent = highlighted
    ? "🤖 Уточнить у AI-ассистента (рекомендуется)"
    : "🤖 Спросить AI-ассистента";
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
    });
  };

  return box;
}

async function runAiAssist({ context, freeText, target, onDone }) {
  target.innerHTML = "";
  const label = document.createElement("div");
  label.className = "ai-label";
  label.textContent = "AI-анализ";
  target.appendChild(label);

  const resp = document.createElement("div");
  resp.className = "ai-response loading";
  resp.textContent = "Анализирую checklist...";
  target.appendChild(resp);

  try {
    const r = await fetch("./api/ai-assist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        answers: state.answers,
        context,
        free_text: freeText,
      }),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.detail || "Ошибка запроса");
    resp.className = "ai-response";
    resp.textContent = data.analysis;
  } catch (err) {
    resp.className = "ai-response error";
    resp.textContent = "Ошибка: " + err.message;
  } finally {
    onDone && onDone();
  }
}

backBtn.onclick = goBack;
restartBtn.onclick = restart;

loadGraph();
