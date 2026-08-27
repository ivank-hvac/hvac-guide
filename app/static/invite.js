// External file, not inline -- see landing.js for why (edge CSP has no
// 'unsafe-inline').
(function () {
  var code = location.pathname.split("/").filter(Boolean).pop();

  var MESSAGES = {
    en: {
      sending: "Sending…",
      failed: "Something went wrong. Try again.",
    },
    ru: {
      sending: "Отправляю…",
      failed: "Что-то пошло не так. Попробуйте ещё раз.",
    },
  };

  function wire(lang) {
    var form = document.getElementById("form-" + lang);
    var result = document.getElementById("result-" + lang);
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = form.email.value.trim();
      var tosAccepted = form.tos.checked;
      var button = form.querySelector("button");
      button.disabled = true;
      result.className = "result";
      result.textContent = MESSAGES[lang].sending;
      fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code, email: email, lang: lang, tos_accepted: tosAccepted }),
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
