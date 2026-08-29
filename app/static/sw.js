// App-shell cache, nothing more. Complements the localStorage-based offline
// snapshot in app.js (which recovers graph POSITION/DATA on a reload with no
// connectivity) — without this, that recovery code never gets a chance to
// run at all, because a plain page reload with zero connectivity can't even
// fetch the HTML/JS/CSS that contains it. See CLAUDE.md "Server-driven
// graph delivery" / the PWA-offline note for why this is deliberately just
// the shell: individual graph nodes are NOT precached or listed here — the
// whole point of per-node delivery is that the client never holds more of
// the graph than it has actually visited, and a service worker that
// precached node data would quietly undo that.
const CACHE_NAME = "hvac-diagtree-shell-v1";
const SHELL_ASSETS = ["/diagnose", "./style.css", "./app.js", "./favicon.ico", "./icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL_ASSETS))
      .catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

const SHELL_PATHS = new Set(SHELL_ASSETS.map((p) => new URL(p, self.registration.scope).pathname));

// Network-first, falling back to the cached copy only when the network
// request itself fails outright. This is deliberate: over a working
// connection, every visit still checks the network first (and refreshes the
// cache), so a new deploy's app.js is never stuck behind a stale cached
// copy — the fallback only ever engages with no connectivity at all.
// Everything outside SHELL_PATHS (every /api/* call, /graph.json, login/
// invite/legal pages, the landing page) is left completely untouched by
// this handler and goes straight to the network as if no service worker
// were installed.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (!SHELL_PATHS.has(url.pathname)) return;
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
