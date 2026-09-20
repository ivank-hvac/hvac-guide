// Shows the "invite a friend" link for accounts with can_invite set (see
// /panel "Invite-gate accounts"), the "session history" link for any
// logged-in account, the "admin panel" link for accounts with is_admin
// set (see /panel — login+is_admin gated when AUTH_ENABLED, same as
// everything else in this file), and the footer's logout button for any
// logged-in account. Kept separate from app.js on purpose: this is the
// only place in the tool that needs to know about login state, and
// app.js is already large enough without a new concern threaded through
// it.
(function () {
  // Reads localStorage directly rather than pulling in app.js's full I18N
  // object -- this file only needs a handful of short strings, not the
  // whole system. A plain addEventListener alongside app.js's own
  // .onclick on the same [data-lang] buttons — the two don't conflict —
  // so titles/labels stay current if the technician switches language
  // after this file's initial fetch already ran, not just at page load.
  function currentLang() {
    var lang = null;
    try { lang = localStorage.getItem("hvac_lang"); } catch (e) {}
    return lang === "ru" ? "ru" : "en";
  }

  // Icon-only by design (a text label wraps badly on narrow screens in this
  // same button row — see the RU/EN/unit toggles right next to it) — the
  // title gives desktop hover a hint.
  function applyIconTitles() {
    var lang = currentLang();
    var historyLink = document.getElementById("historyLink");
    if (historyLink) historyLink.title = lang === "ru" ? "История сессий" : "Session history";
    var modelLookupLink = document.getElementById("modelLookupLink");
    if (modelLookupLink) modelLookupLink.title = lang === "ru" ? "Поиск по модели" : "Model lookup";
    var inviteLink = document.getElementById("inviteLink");
    if (inviteLink) inviteLink.title = lang === "ru" ? "Пригласить" : "Invite a colleague";
    var adminLink = document.getElementById("adminLink");
    if (adminLink) adminLink.title = lang === "ru" ? "Панель администратора" : "Admin panel";
  }

  // logoutFooterBtn is a real <button> with visible text (it sits in the
  // same row as "← Back"/"↺ Start Over", not an icon-only row), so its
  // label needs updating on every language switch too, not just a title.
  function applyLogoutButtonText() {
    var btn = document.getElementById("logoutFooterBtn");
    if (btn) btn.textContent = currentLang() === "ru" ? "🚪 Выйти" : "🚪 Log out";
  }

  document.querySelectorAll("[data-lang]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      applyIconTitles();
      applyLogoutButtonText();
    });
  });

  // 19 Sep 2026, Ivan's own design after pulling logout back out of the
  // header the day before over accidental-tap risk (see CLAUDE.md "Тема
  // интерфейса..."): three SEQUENTIAL confirm()s, all three have to be
  // accepted, any Cancel aborts immediately with no logout and no further
  // prompts. Deliberately more friction than the single confirm() the
  // standing rule (see memory feedback_confirm_before_risky_ui_action)
  // asked for as a minimum -- Ivan's explicit request this time, not a
  // reinterpretation of that rule. The third prompt names the actual
  // reassurance he asked for: a registered account can always get a new
  // login link, logging out isn't a real loss of access.
  var LOGOUT_CONFIRMS = {
    ru: [
      "Выйти из аккаунта?",
      "Точно? После выхода придётся заново запросить письмо со ссылкой для входа.",
      "Последний раз спрашиваем: выйти? Вы зарегистрированы — новую ссылку для входа можно получить в любой момент на /login.",
    ],
    en: [
      "Log out?",
      "Are you sure? You'll need to request a new login link by email to get back in.",
      "Last confirmation — log out? Since you're a registered user, you can request a new login link anytime at /login.",
    ],
  };

  function handleLogoutClick() {
    var msgs = LOGOUT_CONFIRMS[currentLang()];
    if (!window.confirm(msgs[0])) return;
    if (!window.confirm(msgs[1])) return;
    if (!window.confirm(msgs[2])) return;
    fetch("/api/logout", { method: "POST" }).finally(function () {
      window.location.href = "/login";
    });
  }

  fetch("/api/me")
    .then(function (r) { return r.json(); })
    .then(function (me) {
      if (me.logged_in) {
        var historyLink = document.getElementById("historyLink");
        if (historyLink) historyLink.style.display = "";
        var logoutBtn = document.getElementById("logoutFooterBtn");
        if (logoutBtn) {
          logoutBtn.style.display = "";
          logoutBtn.addEventListener("click", handleLogoutClick);
        }
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
      applyLogoutButtonText();
    })
    .catch(function () {});
})();
