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

  // Picks one of the phone-demo fault scenarios at random per page load
  // (Ivan: "нагенерить штук несколько и рандомно показывать"). .phone-demo
  // starts display:none in style.css and only .demo-active gets
  // display:flex, so this has to run for anything to show at all -- there
  // is no CSS-only fallback if this file somehow fails to load, same
  // tradeoff the language switch above already accepts. Picked once per
  // load, not re-rolled on language switch: both language copies share the
  // same data-variant markup, so [data-lang-block] alone decides which of
  // the now-chosen variant's two copies is visible.
  // Update this count when adding/removing a scenario in index.html.
  var DEMO_VARIANT_COUNT = 3;
  var variant = 1 + Math.floor(Math.random() * DEMO_VARIANT_COUNT);
  document.querySelectorAll('.phone-demo[data-variant="' + variant + '"]').forEach(function (el) {
    el.classList.add("demo-active");
  });
})();
