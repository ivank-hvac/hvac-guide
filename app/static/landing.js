// Mirrors the tool's own language preference so switching here does not get
// undone the moment the technician enters the checklist.
//
// Kept as its own file rather than inline in index.html on purpose: the edge
// Caddy in front of this app sends `script-src 'self'` with no
// 'unsafe-inline' and no nonce, so an inline <script> block is silently
// dropped by the browser -- the page rendered with only the lang-switch
// buttons and the (hardcoded-visible) footer, nothing else, and no console
// error a technician would ever see. A same-origin external file satisfies
// 'self' without needing any change on the edge. See CLAUDE.md "СЛЕДУЮЩЕЕ —
// план выхода в паблик" — found live 2026-08-22 from a real screenshot.
(function () {
  var SUPPORTED = ["en", "ru"];
  function apply(lang) {
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-lang-block]").forEach(function (el) {
      el.classList.toggle("shown", el.getAttribute("data-lang-block") === lang);
    });
    document.querySelectorAll("[data-set-lang]").forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-set-lang") === lang);
    });
    try { localStorage.setItem("hvac_lang", lang); } catch (e) {}
  }
  var saved;
  try { saved = localStorage.getItem("hvac_lang"); } catch (e) {}
  if (!SUPPORTED.includes(saved)) {
    saved = SUPPORTED.includes((navigator.language || "").slice(0, 2))
      ? navigator.language.slice(0, 2) : "en";
  }
  apply(saved);
  document.querySelectorAll("[data-set-lang]").forEach(function (b) {
    b.onclick = function () { apply(b.getAttribute("data-set-lang")); };
  });

  // Shared logout button for the standalone pages that load this file
  // (history.html, manage-invites.html, model-lookup.html) -- found
  // missing entirely (18 Sep 2026), same gap as /panel's own logout link.
  // POST rather than a plain <a href>, matching /api/logout's own
  // reasoning (no GET-triggered state change from a prefetch/crawler);
  // the redirect happens here regardless of whether the request itself
  // succeeds, so a network blip still lands the technician on /login
  // rather than a page that silently kept working with a stale session.
  //
  // Unlike history.html/manage-invites.html (which 404 outright without
  // AUTH_ENABLED, so this button is unreachable there in self-host mode
  // anyway), model-lookup.html stays open without login at all -- a
  // self-host with no RESEND_API_KEY would otherwise show a logout
  // button with nothing real to log out of. /api/me already answers
  // {logged_in:false} in that mode (see app.main), so hide the button
  // there rather than special-casing per page.
  var logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    fetch("/api/me")
      .then(function (r) { return r.json(); })
      .then(function (me) {
        if (!me.logged_in) { logoutBtn.style.display = "none"; return; }
        logoutBtn.onclick = function () {
          fetch("/api/logout", { method: "POST" }).finally(function () {
            window.location.href = "/login";
          });
        };
      })
      .catch(function () {});
  }
})();
