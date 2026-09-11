// Shows the "invite a friend" link for accounts with can_invite set (see
// /panel "Invite-gate accounts"), the "session history" link for any
// logged-in account, and the "admin panel" link for accounts with
// is_admin set (see /panel — login+is_admin gated when AUTH_ENABLED, same
// as everything else in this file). Kept separate from app.js on purpose:
// this is the only place in the tool that needs to know about login state,
// and app.js is already large enough without a new concern threaded
// through it.
(function () {
  // Icon-only by design (a text label wraps badly on narrow screens in this
  // same button row — see the RU/EN/unit toggles right next to it) — the
  // title gives desktop hover a hint. Reads localStorage directly rather
  // than pulling in app.js's full I18N object, same reasoning as the
  // file-level comment above. A plain addEventListener alongside app.js's
  // own .onclick on the same [data-lang] buttons — the two don't conflict —
  // so the title stays current if the technician switches language after
  // this file's initial fetch already ran, not just at page load.
  function applyIconTitles() {
    var lang = null;
    try { lang = localStorage.getItem("hvac_lang"); } catch (e) {}
    var historyLink = document.getElementById("historyLink");
    if (historyLink) historyLink.title = lang === "ru" ? "История сессий" : "Session history";
    var inviteLink = document.getElementById("inviteLink");
    if (inviteLink) inviteLink.title = lang === "ru" ? "Пригласить" : "Invite a colleague";
    var adminLink = document.getElementById("adminLink");
    if (adminLink) adminLink.title = lang === "ru" ? "Панель администратора" : "Admin panel";
  }

  document.querySelectorAll("[data-lang]").forEach(function (btn) {
    btn.addEventListener("click", applyIconTitles);
  });

  fetch("/api/me")
    .then(function (r) { return r.json(); })
    .then(function (me) {
      if (me.logged_in) {
        var historyLink = document.getElementById("historyLink");
        if (historyLink) historyLink.style.display = "";
      }
      if (me.can_invite) {
        var inviteLink = document.getElementById("inviteLink");
        if (inviteLink) inviteLink.style.display = "";
      }
      if (me.is_admin) {
        var adminLink = document.getElementById("adminLink");
        if (adminLink) adminLink.style.display = "";
      }
      applyIconTitles();
    })
    .catch(function () {});
})();
