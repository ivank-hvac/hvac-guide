// Own small page, same lightweight pattern as manage-invites.js -- see
// landing.js for why an inline <script> would silently be dropped (edge CSP
// has no 'unsafe-inline'). Unlike manage-invites.js's per-language-duplicated
// wiring (each click there creates fresh state), this page fetches the list
// ONCE and renders it into both #list-en and #list-ru -- only one is ever
// visible at a time (landing.js toggles [data-lang-block]), so there is no
// reason to double-fetch on a language switch.
(function () {
  var MESSAGES = {
    en: {
      badge: { info: "Info", warning: "Warning", critical: "Critical" },
      noEquipment: "Equipment not specified",
      aiUsed: "🤖 AI asked",
      loadFailed: "Could not load your history. Try reloading the page.",
      loadingDetail: "Loading…",
      detailFailed: "Could not load this session.",
      noFreeText: null,
      freeTextLabel: "Notes",
      aiLabel: "AI response",
      answersLabel: "Questions & answers",
    },
    ru: {
      badge: { info: "Инфо", warning: "Внимание", critical: "Критично" },
      noEquipment: "Оборудование не указано",
      aiUsed: "🤖 Спрашивали AI",
      loadFailed: "Не удалось загрузить историю. Попробуйте перезагрузить страницу.",
      loadingDetail: "Загрузка…",
      detailFailed: "Не удалось загрузить эту сессию.",
      noFreeText: null,
      freeTextLabel: "Заметки",
      aiLabel: "Ответ AI",
      answersLabel: "Вопросы и ответы",
    },
  };

  function formatDate(iso, lang) {
    try {
      var d = new Date(iso);
      return d.toLocaleString(lang === "ru" ? "ru-RU" : "en-US", {
        year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
      });
    } catch (e) {
      return iso;
    }
  }

  function renderList(sessions, lang) {
    var list = document.getElementById("list-" + lang);
    var empty = document.getElementById("empty-" + lang);
    if (!list) return;
    list.innerHTML = "";
    if (!sessions.length) {
      if (empty) empty.style.display = "";
      return;
    }
    if (empty) empty.style.display = "none";
    var msgs = MESSAGES[lang];
    sessions.forEach(function (s) {
      var row = document.createElement("button");
      row.type = "button";
      row.className = "hist-row";

      var top = document.createElement("div");
      top.className = "hist-row-top";
      var date = document.createElement("span");
      date.className = "hist-date";
      date.textContent = formatDate(s.updated_at || s.created_at, lang);
      top.appendChild(date);
      if (s.severity && msgs.badge[s.severity]) {
        var badge = document.createElement("span");
        badge.className = "badge " + s.severity;
        badge.textContent = msgs.badge[s.severity];
        top.appendChild(badge);
      }
      row.appendChild(top);

      var equip = document.createElement("div");
      equip.className = "hist-equipment";
      equip.textContent = s.equipment_type || msgs.noEquipment;
      row.appendChild(equip);

      var meta = document.createElement("div");
      meta.className = "hist-meta";
      if (s.jobsite) {
        var jobsite = document.createElement("span");
        jobsite.className = "hist-jobsite";
        jobsite.textContent = s.jobsite;
        meta.appendChild(jobsite);
      }
      var nodeId = document.createElement("span");
      nodeId.className = "hist-node-id";
      nodeId.textContent = s.final_node_id;
      meta.appendChild(nodeId);
      if (s.ai_used) {
        var ai = document.createElement("span");
        ai.className = "hist-node-id";
        ai.textContent = msgs.aiUsed;
        meta.appendChild(ai);
      }
      row.appendChild(meta);

      var detail = document.createElement("div");
      detail.className = "hist-detail";
      row.appendChild(detail);

      var loaded = false;
      row.addEventListener("click", function () {
        var showing = detail.classList.contains("shown");
        if (showing) {
          detail.classList.remove("shown");
          return;
        }
        detail.classList.add("shown");
        if (loaded) return;
        loaded = true;
        detail.innerHTML = '<div class="hist-loading">' + msgs.loadingDetail + "</div>";
        fetch("/api/history/" + encodeURIComponent(s.session_id))
          .then(function (r) {
            if (!r.ok) throw new Error("http " + r.status);
            return r.json();
          })
          .then(function (full) {
            renderDetail(detail, full, msgs);
          })
          .catch(function () {
            detail.innerHTML = '<div class="hist-loading">' + msgs.detailFailed + "</div>";
          });
      });

      list.appendChild(row);
    });
  }

  function renderDetail(container, full, msgs) {
    container.innerHTML = "";
    if (full.answers && full.answers.length) {
      var qaTitle = document.createElement("dt");
      qaTitle.textContent = msgs.answersLabel;
      container.appendChild(qaTitle);
      var dl = document.createElement("dl");
      full.answers.forEach(function (qa) {
        var dt = document.createElement("dt");
        dt.textContent = qa.question;
        var dd = document.createElement("dd");
        dd.textContent = qa.answer;
        dl.appendChild(dt);
        dl.appendChild(dd);
      });
      container.appendChild(dl);
    }
    if (full.free_text) {
      var ftLabel = document.createElement("dt");
      ftLabel.textContent = msgs.freeTextLabel;
      container.appendChild(ftLabel);
      var ftBody = document.createElement("dd");
      ftBody.textContent = full.free_text;
      container.appendChild(ftBody);
    }
    if (full.ai_used && full.ai_analysis) {
      var aiLabel = document.createElement("dt");
      aiLabel.textContent = msgs.aiLabel;
      container.appendChild(aiLabel);
      var aiBody = document.createElement("div");
      aiBody.className = "hist-ai";
      aiBody.textContent = full.ai_analysis;
      container.appendChild(aiBody);
    }
  }

  fetch("/api/history")
    .then(function (r) {
      if (!r.ok) throw new Error("http " + r.status);
      return r.json();
    })
    .then(function (data) {
      var sessions = data.sessions || [];
      renderList(sessions, "en");
      renderList(sessions, "ru");
    })
    .catch(function () {
      ["en", "ru"].forEach(function (lang) {
        var list = document.getElementById("list-" + lang);
        if (list) list.innerHTML = '<div class="empty">' + MESSAGES[lang].loadFailed + "</div>";
      });
    });
})();
