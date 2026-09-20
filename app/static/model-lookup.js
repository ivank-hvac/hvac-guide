// Own small page, same lightweight pattern as history.js. Both #input-en/
// #input-ru (and their buttons/status/card) are wired identically -- only
// one language block is ever visible at a time (landing.js toggles
// [data-lang-block]), so a lookup triggered from either one renders into
// its own card, not a shared one, in case the technician switches
// language mid-result.
(function () {
  var MESSAGES = {
    en: {
      searching: "Searching…",
      cached: "Already known — instant",
      lookedUp: "Looked up just now (AI + web search)",
      empty: "—",
      confidenceHigh: "High confidence — found the manufacturer's own spec sheet",
      confidenceLow: "Low confidence — verify against the nameplate",
      sourceLink: "🔗 Open the manufacturer's spec sheet",
      rateLimited: "Too many lookups — try again in a minute.",
      dailyLimit: "Today's lookup limit is used up. Try again tomorrow.",
      genericError: "Could not look this up. Try again in a moment.",
      invalidInput: "Enter a model number using letters, numbers, and - / . only.",
      labels: {
        brand: "Brand", equipment_type: "Equipment type", capacity: "Capacity",
        seer: "SEER", refrigerant: "Refrigerant", compressor_type: "Compressor type",
        metering_device: "Metering device", voltage: "Voltage",
      },
    },
    ru: {
      searching: "Ищем…",
      cached: "Уже есть в базе — мгновенно",
      lookedUp: "Найдено только что (AI + веб-поиск)",
      empty: "—",
      confidenceHigh: "Высокая уверенность — найден фирменный спек-лист",
      confidenceLow: "Низкая уверенность — сверьте с шильдиком",
      sourceLink: "🔗 Открыть спек-лист производителя",
      rateLimited: "Слишком много запросов — попробуйте через минуту.",
      dailyLimit: "Дневной лимит поиска исчерпан. Попробуйте завтра.",
      genericError: "Не удалось найти. Попробуйте ещё раз чуть позже.",
      invalidInput: "Введите номер модели — только буквы, цифры и - / .",
      labels: {
        brand: "Бренд", equipment_type: "Тип оборудования", capacity: "Мощность",
        seer: "SEER", refrigerant: "Хладагент", compressor_type: "Тип компрессора",
        metering_device: "Дозирующее устройство", voltage: "Напряжение",
      },
    },
  };

  var FIELD_ORDER = ["brand", "equipment_type", "capacity", "seer",
                     "refrigerant", "compressor_type", "metering_device", "voltage"];

  function renderCard(card, data, lang) {
    var msgs = MESSAGES[lang];
    card.innerHTML = "";
    card.classList.add("shown");

    var top = document.createElement("div");
    top.className = "lookup-card-top";
    var modelSpan = document.createElement("span");
    modelSpan.className = "lookup-model";
    modelSpan.textContent = data.model_number;
    top.appendChild(modelSpan);
    var sourceSpan = document.createElement("span");
    sourceSpan.className = "lookup-source";
    sourceSpan.textContent = data.source === "cached" ? msgs.cached : msgs.lookedUp;
    top.appendChild(sourceSpan);
    card.appendChild(top);

    var grid = document.createElement("dl");
    grid.className = "lookup-spec-grid";
    FIELD_ORDER.forEach(function (field) {
      var dt = document.createElement("dt");
      dt.textContent = msgs.labels[field];
      var dd = document.createElement("dd");
      var value = data[field];
      if (value) {
        dd.textContent = value;
      } else {
        dd.textContent = msgs.empty;
        dd.className = "empty";
      }
      grid.appendChild(dt);
      grid.appendChild(dd);
    });
    card.appendChild(grid);

    var confidence = document.createElement("div");
    confidence.className = data.confidence === "high" ? "lookup-confidence-high" : "lookup-confidence-low";
    confidence.textContent = data.confidence === "high" ? msgs.confidenceHigh : msgs.confidenceLow;
    card.appendChild(confidence);

    if (data.note) {
      var note = document.createElement("div");
      note.className = "lookup-note";
      note.textContent = data.note;
      card.appendChild(note);
    }

    // Gated on confidence==="high" too, not just source_url's presence --
    // belt-and-suspenders with the backend's own null-unless-manufacturer's-
    // own-page discipline (see MODEL_LOOKUP_SYSTEM_PROMPT's source_url
    // paragraph). A plain <a>, not a button -- this is navigation to a
    // real external page, not an in-app action.
    if (data.confidence === "high" && data.source_url) {
      var sourceLink = document.createElement("a");
      sourceLink.className = "lookup-source-link";
      sourceLink.href = data.source_url;
      sourceLink.target = "_blank";
      sourceLink.rel = "noopener noreferrer";
      sourceLink.textContent = msgs.sourceLink;
      card.appendChild(sourceLink);
    }

    var disclaimer = document.createElement("div");
    disclaimer.className = "lookup-disclaimer";
    disclaimer.textContent = lang === "ru"
      ? "Это ИИ-оценка по данным из сети, не заводская гарантия точности. Всегда сверяйтесь с реальным шильдиком оборудования."
      : "This is an AI-generated estimate from published data, not a factory guarantee of accuracy. Always verify against the unit's actual nameplate.";
    card.appendChild(disclaimer);
  }

  function wire(lang) {
    var input = document.getElementById("input-" + lang);
    var btn = document.getElementById("btn-" + lang);
    var status = document.getElementById("status-" + lang);
    var card = document.getElementById("card-" + lang);
    if (!input || !btn) return;

    function runLookup() {
      var modelNumber = input.value.trim();
      if (!modelNumber) return;
      if (!/^[A-Za-z0-9\-/. ]{1,64}$/.test(modelNumber)) {
        status.textContent = MESSAGES[lang].invalidInput;
        return;
      }
      btn.disabled = true;
      status.textContent = MESSAGES[lang].searching;
      card.classList.remove("shown");
      fetch("/api/model-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model_number: modelNumber, lang: lang }),
      })
        .then(function (r) {
          if (r.status === 429) {
            return r.json().then(function (body) {
              throw new Error(body && body.detail ? body.detail : "rate limited");
            });
          }
          if (!r.ok) throw new Error("http " + r.status);
          return r.json();
        })
        .then(function (data) {
          status.textContent = "";
          renderCard(card, data, lang);
        })
        .catch(function () {
          status.textContent = MESSAGES[lang].genericError;
        })
        .finally(function () {
          btn.disabled = false;
        });
    }

    btn.addEventListener("click", runLookup);
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") runLookup();
    });
  }

  wire("en");
  wire("ru");
})();
