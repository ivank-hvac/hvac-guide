"""Public showcase demo — standalone app, deliberately separate from app/main.py.

Runs as its own container on the prod host, reachable at hvacdiagtree.com/demo
via a dedicated Caddy route (see ../Caddyfile). Never touches the beta app's
database, secrets, or graph API — that separation is the whole point (see
CLAUDE.md "Публичная демо-витрина"): a bug or an attempt to break out of the
few hardcoded demo paths stays contained to this process, not the one holding
real user accounts and the private graph.

Stage 2 (this commit): the 5 real, hardcoded golden paths (see nodes.py) —
everything off those paths lands on a single "request an invite" stub, no
graph API, no AI calls (there is no ANTHROPIC_API_KEY in this container's
environment at all). Server-rendered, stateless: navigation is plain <a>
links, no cookies/sessions/JS state machine — the breadcrumb trail is
carried entirely in the URL's query string.
"""
from html import escape
from urllib.parse import quote, unquote

from fastapi import FastAPI
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles

from nodes import (
    AI_CANNED_MESSAGE,
    FINISHED_REPORT_PHASES,
    FOOTER_DISCLAIMER,
    INVITE,
    INVITE_STUB_TEXT,
    LINKEDIN_URL,
    NODES,
    RELATED_CHECKS_TITLE,
    RESULT_DISCLAIMER,
    SAFETY_BANNER_TEXT,
)

app = FastAPI()
app.mount("/demo/static", StaticFiles(directory="static"), name="static")

PATH_SEP = "|"
BADGE_LABEL = {"info": "Info", "warning": "Warning", "critical": "Critical"}


def _encode_path(labels: list[str]) -> str:
    return quote(PATH_SEP.join(labels))


def _decode_path(raw: str) -> list[str]:
    if not raw:
        return []
    return [p for p in unquote(raw).split(PATH_SEP) if p]


def _link(node_id: str, path: list[str], new_label: str | None = None) -> str:
    new_path = path + [new_label] if new_label else path
    p = _encode_path(new_path)
    return f"/demo/n/{node_id}?p={p}" if node_id != INVITE else f"/demo/invite?p={p}"


def _page(body: str, path: list[str]) -> str:
    breadcrumb = " → ".join(escape(p) for p in path)
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow">
<title>HVAC DiagTree — demo</title>
<link rel="icon" href="/demo/static/favicon.ico" sizes="any">
<link rel="stylesheet" href="/demo/static/style.css">
<link rel="stylesheet" href="/demo/static/demo.css">
</head>
<body>
  <div class="wrap">
    <header>
      <div class="header-top">
        <h1 class="header-home-row">
          <a class="header-icon-link" href="/demo"><img class="header-icon" src="/demo/static/icon-512.png" alt=""></a>
          <a class="header-title-link" href="/">HVAC DiagTree — demo</a>
        </h1>
      </div>
    </header>
    <main class="card">
      {body}
    </main>
    <footer>
      <a href="/demo" class="btn ghost">⟲ Start Over</a>
    </footer>
    <div class="breadcrumb">{breadcrumb}</div>
    <div class="footer-disclaimer">{escape(FOOTER_DISCLAIMER)}</div>
  </div>
</body>
</html>"""


def _ai_button(path: list[str], node_id: str, recommended: bool, ai_shown: bool) -> str:
    if ai_shown:
        return f"""<div class="ai-box">
      <div class="ai-label">AI-анализ</div>
      <p>{escape(AI_CANNED_MESSAGE)}</p>
      <a class="btn ai" href="{LINKEDIN_URL}" target="_blank" rel="noopener">Request an invite on LinkedIn</a>
    </div>"""
    label = "🤖 Ask AI Assistant (recommended)" if recommended else "🤖 Ask AI Assistant"
    return f'<a class="btn ai" href="/demo/n/{node_id}?p={_encode_path(path)}&ai=1">{label}</a>'


def _deeper_diagnosis_button(path: list[str]) -> str:
    return f'<a class="btn ghost" href="{_link(INVITE, path)}">🔍 Deeper diagnosis (full checklist)</a>'


def _render_question(node: dict, node_id: str, path: list[str]) -> str:
    opts_html = "".join(
        f'<a class="btn" href="{_link(nxt, path, label)}">{escape(label)}</a>'
        for label, nxt in node["options"]
    )
    return f"""
    <div class="q-text">{escape(node["text"])}</div>
    <div class="options">{opts_html}</div>
    """


def _render_measurement(node: dict, node_id: str, path: list[str]) -> str:
    reading_label = f'{node["value"]} {node["unit"]}'
    return f"""
    <div class="q-text">{escape(node["text"])}</div>
    <div class="options">
      <input class="checklist-field-input numeric" type="text" value="{escape(node["value"])}" readonly>
      <span class="numeric-unit">{escape(node["unit"])}</span>
    </div>
    <a class="btn input-action" href="{_link(node["next"], path, reading_label)}">Next</a>
    """


def _render_calc(node: dict, node_id: str, path: list[str]) -> str:
    return f"""
    <div class="q-text">{escape(node["text"])}</div>
    <div class="related-checks">
      <div class="related-checks-title">Result</div>
      <ul><li>{escape(node["comparison"])}</li></ul>
    </div>
    <a class="btn input-action" href="{_link(node["next"], path, node["comparison"])}">Next</a>
    """


def _render_checklist(items: list[tuple]) -> str:
    if not items:
        return ""
    total = len(items)
    rows = []
    for kind, label, unit in items:
        if kind == "field":
            rows.append(
                f'<label class="checklist-item">'
                f"<span>{escape(label)}</span>"
                f'<input class="checklist-field-input numeric" type="text">'
                f'<span class="numeric-unit">{escape(unit)}</span>'
                f"</label>"
            )
        else:
            rows.append(
                f'<label class="checklist-item" onchange="hvacDemoChecklistTick(this)">'
                f'<input type="checkbox">'
                f"<span>{escape(label)}</span>"
                f"</label>"
            )
    rows_html = "".join(rows)
    return f"""
    <div class="checklist">
      <div class="checklist-progress" data-total="{total}">Completed: 0 of {total}</div>
      {rows_html}
    </div>
    <script>
    function hvacDemoChecklistTick(row) {{
      const wrap = row.closest(".checklist");
      const total = wrap.querySelectorAll(".checklist-item").length;
      const done = wrap.querySelectorAll(".checklist-item input[type=checkbox]:checked").length;
      wrap.querySelector(".checklist-progress").textContent = "Completed: " + done + " of " + total;
    }}
    </script>
    """


def _render_result(node: dict, node_id: str, path: list[str], ai_shown: bool) -> str:
    severity = node["severity"]
    badge = f'<span class="badge {severity}">{BADGE_LABEL[severity]}</span>'
    safety_banner = (
        f'<div class="safety-banner">{escape(SAFETY_BANNER_TEXT)}</div>'
        if severity == "critical"
        else ""
    )
    related_html = ""
    if node["related_checks"]:
        items = "".join(f"<li>{escape(rc)}</li>" for rc in node["related_checks"])
        related_html = f"""
        <div class="related-checks">
          <div class="related-checks-title">{escape(RELATED_CHECKS_TITLE)}</div>
          <ul>{items}</ul>
        </div>"""

    ai_html = _ai_button(path, node_id, recommended=node["ai"], ai_shown=ai_shown)
    deeper_html = _deeper_diagnosis_button(path)
    checklist_html = _render_checklist(node["checklist"])

    finished_html = ""
    if node.get("finished_report"):
        phase_rows = "".join(
            f'<div class="btn ghost" style="justify-content:space-between;display:flex">'
            f"<span>{escape(name)}</span><span>{n} left to check</span></div>"
            for name, n in FINISHED_REPORT_PHASES
        )
        finished_html = f"""
        <div class="related-checks">
          <div>Session completed. Thank you!</div>
          <div class="related-checks-title">EQUIPMENT CHECKLIST</div>
          {phase_rows}
        </div>"""

    return f"""
    {badge}
    {safety_banner}
    <div class="result-text">{escape(node["text"])}</div>
    <div class="result-disclaimer">{escape(RESULT_DISCLAIMER)}</div>
    {related_html}
    {ai_html}
    {deeper_html}
    {checklist_html}
    {finished_html}
    """


def _render_invite_stub() -> str:
    return f"""
    <div class="q-text">{escape(INVITE_STUB_TEXT)}</div>
    <a class="btn ai" href="{LINKEDIN_URL}" target="_blank" rel="noopener">Request an invite on LinkedIn</a>
    """


@app.get("/demo/health")
def health():
    return {"status": "ok", "stage": 2}


@app.get("/demo")
@app.get("/demo/")
def start():
    return RedirectResponse(url="/demo/n/start")


@app.get("/demo/invite", response_class=HTMLResponse)
def invite(p: str = ""):
    path = _decode_path(p)
    return _page(_render_invite_stub(), path)


@app.get("/demo/n/{node_id}", response_class=HTMLResponse)
def node_view(node_id: str, p: str = "", ai: str = ""):
    path = _decode_path(p)
    node = NODES.get(node_id)
    if node is None:
        return RedirectResponse(url="/demo/invite?p=" + _encode_path(path))

    if node["kind"] == "question":
        body = _render_question(node, node_id, path)
    elif node["kind"] == "measurement":
        body = _render_measurement(node, node_id, path)
    elif node["kind"] == "calc":
        body = _render_calc(node, node_id, path)
    elif node["kind"] == "result":
        body = _render_result(node, node_id, path, ai_shown=bool(ai))
    else:
        return RedirectResponse(url="/demo/invite?p=" + _encode_path(path))

    return _page(body, path)
