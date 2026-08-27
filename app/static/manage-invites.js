// External file, not inline -- see landing.js for why (edge CSP has no
// 'unsafe-inline').
(function () {
  var MESSAGES = {
    en: {
      remaining: function (n) { return n + " left today"; },
      copy: "Copy",
      copied: "Copied",
      failed: "Could not create a link. Try again.",
    },
    ru: {
      remaining: function (n) { return "Осталось сегодня: " + n; },
      copy: "Копировать",
      copied: "Скопировано",
      failed: "Не удалось создать ссылку. Попробуйте ещё раз.",
    },
  };

  function wire(lang) {
    var button = document.getElementById("create-" + lang);
    var remaining = document.getElementById("remaining-" + lang);
    var error = document.getElementById("error-" + lang);
    var links = document.getElementById("links-" + lang);
    if (!button) return;

    button.addEventListener("click", function () {
      button.disabled = true;
      error.textContent = "";
      fetch("/api/invite/create?lang=" + lang, { method: "POST" })
        .then(function (r) {
          return r.json().then(function (data) { return { ok: r.ok, data: data }; });
        })
        .then(function (res) {
          button.disabled = false;
          if (!res.ok) {
            error.textContent = (res.data && res.data.detail) || MESSAGES[lang].failed;
            return;
          }
          remaining.textContent = MESSAGES[lang].remaining(res.data.remaining_today);
          var row = document.createElement("div");
          row.className = "link-row";
          var input = document.createElement("input");
          input.readOnly = true;
          input.value = res.data.url;
          var copyBtn = document.createElement("button");
          copyBtn.type = "button";
          copyBtn.textContent = MESSAGES[lang].copy;
          copyBtn.addEventListener("click", function () {
            input.select();
            (navigator.clipboard
              ? navigator.clipboard.writeText(input.value)
              : Promise.resolve().then(function () { document.execCommand("copy"); })
            ).then(function () {
              copyBtn.textContent = MESSAGES[lang].copied;
              setTimeout(function () { copyBtn.textContent = MESSAGES[lang].copy; }, 1500);
            });
          });
          row.appendChild(input);
          row.appendChild(copyBtn);
          links.insertBefore(row, links.firstChild);
        })
        .catch(function () {
          button.disabled = false;
          error.textContent = MESSAGES[lang].failed;
        });
    });
  }

  wire("en");
  wire("ru");
})();
