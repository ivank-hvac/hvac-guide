// External file, not inline -- see landing.js for why (edge CSP has no
// 'unsafe-inline').
(function () {
  var MESSAGES = {
    en: {
      working: "Signing out the other session…",
      failed: "That link expired — go back and click your login email again.",
    },
    ru: {
      working: "Завершаю другую сессию…",
      failed: "Ссылка устарела — вернитесь и снова откройте письмо со ссылкой для входа.",
    },
  };

  // Two distinct reasons land here (see reason in _peek_session_takeover_info,
  // main.py) — "unverified_browser" is the real phishing/CSRF shape (this
  // browser never requested the link it just followed) and gets the sharp
  // warning; "active_session" is the ordinary multi-device re-login and gets
  // a milder heads-up. Unrecognized/missing reason (old pre-migration token)
  // falls back to the mild copy, never the sharp one.
  var ALERTS = {
    unverified_browser: {
      en: "⚠️ This link was not opened on the device that requested it. If someone sent you this link, STOP — continuing will sign this device into THEIR account, not your own.",
      ru: "⚠️ Эта ссылка открыта не на том устройстве, что её запрашивало. Если ссылку прислал вам кто-то другой — ОСТАНОВИТЕСЬ. Продолжив, вы войдёте на этом устройстве в ЧУЖОЙ аккаунт, не в свой.",
    },
    active_session: {
      en: "You already have an active session on another device. Continuing here will sign that other device out.",
      ru: "У вас уже есть активная сессия на другом устройстве. Продолжив здесь, вы завершите ту сессию.",
    },
  };

  var token = new URLSearchParams(location.search).get("token") || "";

  function showExpired() {
    ["en", "ru"].forEach(function (lang) {
      var btn = document.getElementById("continue-" + lang);
      var result = document.getElementById("result-" + lang);
      if (btn) btn.disabled = true;
      if (result) {
        result.className = "result err";
        result.textContent = MESSAGES[lang].failed;
      }
    });
  }

  // Read-only lookup (see _peek_session_takeover_info in main.py) — shows
  // which account this confirm screen is actually about, and why it's
  // showing at all, added for the login-CSRF finding (9 Sep, sharpened
  // 11 Sep after pentest stage 17 showed the original single neutral
  // paragraph wasn't a strong enough deterrent against a rushed click).
  // Doesn't consume the token, so this fetch itself never burns it.
  fetch("/api/session-conflict-info?token=" + encodeURIComponent(token))
    .then(function (r) {
      if (!r.ok) throw new Error("expired");
      return r.json();
    })
    .then(function (data) {
      var copy = ALERTS[data.reason] || ALERTS.active_session;
      var severity = data.reason === "unverified_browser" ? "severe" : "mild";
      ["en", "ru"].forEach(function (lang) {
        var emailEl = document.getElementById("email-" + lang);
        if (emailEl) emailEl.textContent = data.email;
        var alertEl = document.getElementById("alert-" + lang);
        if (alertEl) {
          alertEl.textContent = copy[lang];
          alertEl.className = "alert-box " + severity;
        }
      });
    })
    .catch(showExpired);

  function wire(lang) {
    var btn = document.getElementById("continue-" + lang);
    var result = document.getElementById("result-" + lang);
    if (!btn) return;
    btn.addEventListener("click", function () {
      btn.disabled = true;
      result.className = "result";
      result.textContent = MESSAGES[lang].working;
      fetch("/api/session-takeover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token }),
      })
        .then(function (r) {
          if (r.ok) {
            location.href = "/diagnose";
            return;
          }
          btn.disabled = false;
          result.className = "result err";
          result.textContent = MESSAGES[lang].failed;
        })
        .catch(function () {
          btn.disabled = false;
          result.className = "result err";
          result.textContent = MESSAGES[lang].failed;
        });
    });
  }

  wire("en");
  wire("ru");
})();
