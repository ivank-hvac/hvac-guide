// External file, not inline -- see landing.js for why (edge CSP has no
// 'unsafe-inline').
(function () {
  var MESSAGES = {
    en: {
      sending: "Sending…",
      failed: "Something went wrong. Try again.",
      expired: "That link is invalid or already used — request a new one below.",
    },
    ru: {
      sending: "Отправляю…",
      failed: "Что-то пошло не так. Попробуйте ещё раз.",
      expired: "Ссылка недействительна или уже использована — запросите новую ниже.",
    },
  };

  if (/[?&]expired=1/.test(location.search)) {
    ["en", "ru"].forEach(function (lang) {
      var result = document.getElementById("result-" + lang);
      if (result) {
        result.className = "result warn";
        result.textContent = MESSAGES[lang].expired;
      }
    });
  }

  function wire(lang) {
    var form = document.getElementById("form-" + lang);
    var result = document.getElementById("result-" + lang);
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = form.email.value.trim();
      var button = form.querySelector("button");
      button.disabled = true;
      result.className = "result";
      result.textContent = MESSAGES[lang].sending;
      fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, lang: lang }),
      })
        .then(function (r) {
          return r.json().then(function (data) { return { ok: r.ok, data: data }; });
        })
        .then(function (res) {
          button.disabled = false;
          if (res.ok) {
            result.className = "result ok";
            result.textContent = res.data.message;
            form.style.display = "none";
          } else {
            result.className = "result err";
            result.textContent = (res.data && res.data.detail) || MESSAGES[lang].failed;
          }
        })
        .catch(function () {
          button.disabled = false;
          result.className = "result err";
          result.textContent = MESSAGES[lang].failed;
        });
    });
  }

  wire("en");
  wire("ru");
})();
