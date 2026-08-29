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

  var token = new URLSearchParams(location.search).get("token") || "";

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
