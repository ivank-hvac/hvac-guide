"""Public showcase demo — standalone app, deliberately separate from app/main.py.

Runs as its own container on the prod host, reachable at hvacdiagtree.com/demo
via a dedicated Caddy route (see ../Caddyfile). Never touches the beta app's
database, secrets, or graph API — that separation is the whole point (see
CLAUDE.md "Публичная демо-витрина"): a bug or an attempt to break out of the
few hardcoded demo paths stays contained to this process, not the one holding
real user accounts and the private graph.

Stage 1 (this commit): prove the container + Caddy route actually work in
production. No demo content yet — that's Stage 2, and it'll be added to this
same file/app, not a different mechanism.
"""
from fastapi import FastAPI
from fastapi.responses import HTMLResponse

app = FastAPI()


@app.get("/demo/health")
def health():
    return {"status": "ok", "stage": 1}


@app.get("/demo", response_class=HTMLResponse)
@app.get("/demo/", response_class=HTMLResponse)
def placeholder():
    return (
        "<!doctype html><html><head><meta charset='utf-8'>"
        "<title>HVAC DiagTree — demo</title></head>"
        "<body style='font-family: system-ui, sans-serif; max-width: 40em; "
        "margin: 4em auto; padding: 0 1em;'>"
        "<h1>Coming soon</h1>"
        "<p>The public demo walkthrough isn't live yet. "
        "In the meantime, <a href='/'>see the project</a>.</p>"
        "</body></html>"
    )
