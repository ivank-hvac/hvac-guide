// Shows the "invite a friend" link for accounts with can_invite set (see
// /panel "Invite-gate accounts"), and the "session history" link for any
// logged-in account. Kept separate from app.js on purpose: this is the only
// place in the tool that needs to know about login state, and app.js is
// already large enough without a new concern threaded through it.
(function () {
  // Icon-only by design (a text label wraps badly on narrow screens in this
  // same button row — see the RU/EN/unit toggles right next to it) — the
  // title gives desktop hover a hint. Reads localStorage directly rather
  // than pulling in app.js's full I18N object, same reasoning as the
  // file-level comment above. A plain addEventListener alongside app.js's
  // own .onclick on the same [data-lang] buttons — the two don't conflict —
  // so the title stays current if the technician switches language after
  // this file's initial fetch already ran, not just at page load.
  function applyHistoryTitle() {
    var historyLink = document.getElementById("historyLink");
    if (!historyLink) return;
    var lang = null;
    try { lang = localStorage.getItem("hvac_lang"); } catch (e) {}
    historyLink.title = lang === "ru" ? "История сессий" : "Session history";
  }

  document.querySelectorAll("[data-lang]").forEach(function (btn) {
    btn.addEventListener("click", applyHistoryTitle);
  });

  fetch("/api/me")
    .then(function (r) { return r.json(); })
    .then(function (me) {
      if (me.logged_in) {
        var historyLink = document.getElementById("historyLink");
        if (historyLink) historyLink.style.display = "";
        applyHistoryTitle();
      }
      if (me.can_invite) {
        var inviteLink = document.getElementById("inviteLink");
        if (inviteLink) inviteLink.style.display = "";
      }
    })
    .catch(function () {});
})();
