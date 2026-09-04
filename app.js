// Cycle logic. Pure functions, no DOM. Dates are always local-midnight — never UTC.

function parseLocalDate(isoString) {
  const [y, m, d] = isoString.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function localMidnight(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function daysBetween(a, b) {
  const msPerDay = 24 * 60 * 60 * 1000;
  const a0 = localMidnight(a);
  const b0 = localMidnight(b);
  // Round rather than floor/truncate: DST-shifted days are 23h/25h long,
  // so a straight ms/msPerDay division can land on 0.958 or 1.042 instead of 1.
  return Math.round((b0 - a0) / msPerDay);
}

// Each period entry is { start: "YYYY-MM-DD", length: N }. `length` is the
// actual recorded duration of that period (defaults to settings.periodLength
// until edited), separate from settings.periodLength which is only the
// fallback used for a period whose real length isn't known yet.

function sortedPeriods(periods) {
  return [...periods].sort((a, b) => (a.start < b.start ? 1 : a.start > b.start ? -1 : 0));
}

function getCurrentCycleDay(periods, today) {
  if (!periods || periods.length === 0) return null;
  const [mostRecent] = sortedPeriods(periods);
  const diff = daysBetween(parseLocalDate(mostRecent.start), today);
  return diff + 1;
}

function getPhase(cycleDay, settings) {
  const { cycleLength, periodLength } = settings;
  const ovulationCenter = cycleLength - 14;
  const follicularEnd = ovulationCenter - 2;
  const ovulatoryEnd = ovulationCenter + 2;

  if (cycleDay <= periodLength) return "menstrual";
  if (cycleDay <= follicularEnd) return "follicular";
  if (cycleDay <= ovulatoryEnd) return "ovulatory";
  return "luteal";
}

function getAverageCycleLength(periods, settings) {
  const sorted = sortedPeriods(periods);
  if (sorted.length < 2) return settings.cycleLength;

  const recent = sorted.slice(0, 6);
  const gaps = [];
  for (let i = 0; i < recent.length - 1; i++) {
    gaps.push(daysBetween(parseLocalDate(recent[i + 1].start), parseLocalDate(recent[i].start)));
  }
  const sum = gaps.reduce((a, b) => a + b, 0);
  return Math.round(sum / gaps.length);
}

function getNextPredictedStart(periods, settings) {
  const sorted = sortedPeriods(periods);
  if (sorted.length === 0) return null;
  const avg = getAverageCycleLength(periods, settings);
  const mostRecent = parseLocalDate(sorted[0].start);
  const next = new Date(mostRecent.getFullYear(), mostRecent.getMonth(), mostRecent.getDate() + avg);
  return next;
}

function getDaysUntilNextPeriod(periods, settings, today) {
  const next = getNextPredictedStart(periods, settings);
  if (!next) return null;
  return daysBetween(today, next);
}

function isPeriodLate(periods, settings, today) {
  const cycleDay = getCurrentCycleDay(periods, today);
  if (cycleDay === null) return false;
  const avg = getAverageCycleLength(periods, settings);
  return cycleDay > avg;
}

function validateNewPeriodDate(dateString, periods, today) {
  const date = parseLocalDate(dateString);
  if (daysBetween(today, date) > 0) {
    return { ok: false, error: "That date is in the future." };
  }
  const sorted = sortedPeriods(periods);
  if (sorted.length > 0) {
    const gap = daysBetween(parseLocalDate(sorted[0].start), date);
    if (gap < 10 && gap > 0) {
      return { ok: true, warning: `That's only ${gap} days after your last logged period. Logging it anyway.` };
    }
    if (gap === 0) {
      return { ok: false, error: "You've already logged a period on that date." };
    }
  }
  return { ok: true };
}

if (typeof module !== "undefined") {
  module.exports = {
    parseLocalDate,
    localMidnight,
    daysBetween,
    sortedPeriods,
    getCurrentCycleDay,
    getPhase,
    getAverageCycleLength,
    getNextPredictedStart,
    getDaysUntilNextPeriod,
    isPeriodLate,
    validateNewPeriodDate,
  };
}

// ---------------------------------------------------------------------------
// UI wiring. Everything below reads/writes the single localStorage key and
// touches the DOM. Skipped entirely when running under Node (test.html runs
// app.js in a real browser, this file's Node usage is just for automated tests).
// ---------------------------------------------------------------------------

if (typeof document !== "undefined") {
  const STORAGE_KEY = "cycleApp";
  const DEFAULT_STATE = {
    version: 1,
    settings: { cycleLength: 28, periodLength: 5 },
    periods: [],
  };

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return structuredClone(DEFAULT_STATE);
      const parsed = JSON.parse(raw);
      const settings = { ...DEFAULT_STATE.settings, ...(parsed.settings || {}) };
      return {
        version: 1,
        settings,
        periods: normalizePeriods(parsed.periods, settings),
      };
    } catch (e) {
      return structuredClone(DEFAULT_STATE);
    }
  }

  function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  // Accepts either the old plain-date-string format or the current
  // { start, length } object format, and always returns the latter.
  function normalizePeriods(periods, settings) {
    if (!Array.isArray(periods)) return [];
    return periods.map((p) =>
      typeof p === "string" ? { start: p, length: settings.periodLength } : p
    );
  }

  let state = loadState();

  function todayLocalMidnight() {
    return localMidnight(new Date());
  }

  function formatDateLong(dateOrString) {
    const date = typeof dateOrString === "string" ? parseLocalDate(dateOrString) : dateOrString;
    return date.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  }

  function formatDateShort(dateOrString) {
    const date = typeof dateOrString === "string" ? parseLocalDate(dateOrString) : dateOrString;
    return date.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
  }

  // ---- Screen switching ----------------------------------------------------

  const screens = document.querySelectorAll("[data-screen]");
  const navButtons = document.querySelectorAll("[data-nav]");

  function showScreen(name) {
    screens.forEach((el) => {
      el.hidden = el.dataset.screen !== name;
    });
    navButtons.forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.nav === name);
    });
    if (name === "history") renderHistory();
    if (name === "settings") renderSettings();
  }

  navButtons.forEach((btn) => {
    btn.addEventListener("click", () => showScreen(btn.dataset.nav));
  });

  // ---- Home screen -----------------------------------------------------

  function renderHome() {
    const today = todayLocalMidnight();
    const cycleDay = getCurrentCycleDay(state.periods, today);
    const emptyState = document.getElementById("home-empty");
    const content = document.getElementById("home-content");

    if (cycleDay === null) {
      emptyState.hidden = false;
      content.hidden = true;
      return;
    }
    emptyState.hidden = true;
    content.hidden = false;

    const currentPeriod = sortedPeriods(state.periods)[0];
    const effectiveSettings = { ...state.settings, periodLength: currentPeriod.length ?? state.settings.periodLength };
    const phase = getPhase(cycleDay, effectiveSettings);
    const late = isPeriodLate(state.periods, state.settings, today);
    const daysUntil = getDaysUntilNextPeriod(state.periods, state.settings, today);
    const info = CONTENT[phase];

    document.body.style.setProperty("--phase-color", info.color);

    document.getElementById("cycle-day").textContent = `Day ${cycleDay}`;
    document.getElementById("phase-name").textContent = info.label;
    document.getElementById("phase-summary").textContent = info.summary;

    const daysUntilEl = document.getElementById("days-until");
    if (late) {
      const avg = getAverageCycleLength(state.periods, state.settings);
      daysUntilEl.textContent = `${cycleDay - avg} day${cycleDay - avg === 1 ? "" : "s"} late`;
    } else if (daysUntil !== null) {
      daysUntilEl.textContent =
        daysUntil <= 0 ? "Due today" : `${daysUntil} day${daysUntil === 1 ? "" : "s"} until next period`;
    } else {
      daysUntilEl.textContent = "";
    }

    document.getElementById("food-focus").textContent = info.food.focus;
    renderList("food-eat", info.food.eat);
    renderList("food-meals", info.food.meals);

    document.getElementById("training-focus").textContent = info.training.focus;
    renderList("training-do", info.training.do);
    document.getElementById("training-avoid").textContent = info.training.avoid;
  }

  function renderList(id, items) {
    const el = document.getElementById(id);
    el.innerHTML = "";
    items.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      el.appendChild(li);
    });
  }

  document.getElementById("log-period-btn").addEventListener("click", () => {
    logPeriodToday();
  });
  document.getElementById("home-empty-log-btn").addEventListener("click", () => {
    logPeriodToday();
  });

  function logPeriodToday() {
    const today = todayLocalMidnight();
    const iso = isoFromDate(today);
    const check = validateNewPeriodDate(iso, state.periods, today);
    if (!check.ok) {
      alert(check.error);
      return;
    }
    if (check.warning && !confirm(`${check.warning}\n\nLog it anyway?`)) return;
    state.periods.push({ start: iso, length: state.settings.periodLength });
    saveState(state);
    renderHome();
    alert("Logged. Day 1 starts today.");
  }

  function isoFromDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  // ---- History screen --------------------------------------------------

  function renderHistory() {
    const sorted = sortedPeriods(state.periods);
    const list = document.getElementById("history-list");
    const empty = document.getElementById("history-empty");
    list.innerHTML = "";

    if (sorted.length === 0) {
      empty.hidden = false;
      return;
    }
    empty.hidden = true;

    sorted.forEach((period, index) => {
      const li = document.createElement("li");
      li.className = "history-row";

      const info = document.createElement("div");
      info.className = "history-info";

      const dateSpan = document.createElement("span");
      dateSpan.className = "history-date";
      dateSpan.textContent = formatDateLong(period.start);

      const gapSpan = document.createElement("span");
      gapSpan.className = "history-gap";
      if (index < sorted.length - 1) {
        const gap = daysBetween(parseLocalDate(sorted[index + 1].start), parseLocalDate(period.start));
        gapSpan.textContent = `${gap}-day cycle`;
      } else {
        gapSpan.textContent = "First logged period";
      }

      info.appendChild(dateSpan);
      info.appendChild(gapSpan);

      const actions = document.createElement("div");
      actions.className = "history-actions";

      const lengthBtn = document.createElement("button");
      lengthBtn.className = "history-length-btn";
      lengthBtn.type = "button";
      const length = period.length ?? state.settings.periodLength;
      lengthBtn.textContent = `${length}d`;
      lengthBtn.setAttribute("aria-label", `Edit period length, currently ${length} days`);
      lengthBtn.addEventListener("click", () => {
        const input = prompt(`How many days did this period last (started ${formatDateLong(period.start)})?`, String(length));
        if (input === null) return;
        const newLength = Number(input);
        if (!Number.isFinite(newLength) || newLength < 1 || newLength > 15) {
          alert("Period length should be a number between 1 and 15 days.");
          return;
        }
        const target = state.periods.find((p) => p.start === period.start);
        target.length = newLength;
        saveState(state);
        renderHistory();
        renderHome();
      });

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "history-delete-btn";
      deleteBtn.type = "button";
      deleteBtn.textContent = "Delete";
      deleteBtn.setAttribute("aria-label", `Delete period logged for ${formatDateLong(period.start)}`);
      deleteBtn.addEventListener("click", () => {
        if (confirm(`Delete the period logged for ${formatDateLong(period.start)}?`)) {
          state.periods = state.periods.filter((p) => p.start !== period.start);
          saveState(state);
          renderHistory();
          renderHome();
        }
      });

      actions.appendChild(lengthBtn);
      actions.appendChild(deleteBtn);

      li.appendChild(info);
      li.appendChild(actions);
      list.appendChild(li);
    });
  }

  document.getElementById("add-past-date-btn").addEventListener("click", () => {
    document.getElementById("past-date-input").click();
  });

  document.getElementById("past-date-input").addEventListener("change", (e) => {
    const iso = e.target.value;
    if (!iso) return;
    const today = todayLocalMidnight();
    const check = validateNewPeriodDate(iso, state.periods, today);
    if (!check.ok) {
      alert(check.error);
      e.target.value = "";
      return;
    }
    if (check.warning && !confirm(`${check.warning}\n\nLog it anyway?`)) {
      e.target.value = "";
      return;
    }
    state.periods.push({ start: iso, length: state.settings.periodLength });
    saveState(state);
    renderHistory();
    renderHome();
    e.target.value = "";
  });

  // ---- Settings screen ---------------------------------------------------

  function renderSettings() {
    document.getElementById("setting-cycle-length").value = state.settings.cycleLength;
    document.getElementById("setting-period-length").value = state.settings.periodLength;
  }

  document.getElementById("settings-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const cycleLength = Number(document.getElementById("setting-cycle-length").value);
    const periodLength = Number(document.getElementById("setting-period-length").value);
    if (!cycleLength || cycleLength < 10 || cycleLength > 60) {
      alert("Cycle length should be between 10 and 60 days.");
      return;
    }
    if (!periodLength || periodLength < 1 || periodLength > 15) {
      alert("Period length should be between 1 and 15 days.");
      return;
    }
    state.settings = { cycleLength, periodLength };
    saveState(state);
    renderHome();
    alert("Settings saved.");
  });

  document.getElementById("export-btn").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cycle-app-export-${isoFromDate(todayLocalMidnight())}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });

  document.getElementById("import-btn").addEventListener("click", () => {
    document.getElementById("import-file-input").click();
  });

  document.getElementById("import-file-input").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (!parsed.settings || !Array.isArray(parsed.periods)) {
          throw new Error("Missing settings or periods.");
        }
        const settings = { ...DEFAULT_STATE.settings, ...parsed.settings };
        state = {
          version: 1,
          settings,
          periods: normalizePeriods(parsed.periods, settings),
        };
        saveState(state);
        renderHome();
        renderHistory();
        renderSettings();
        alert("Import complete.");
      } catch (err) {
        alert("That file doesn't look like a valid export. Nothing was changed.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  });

  document.getElementById("delete-everything-btn").addEventListener("click", () => {
    if (confirm("Delete everything? This clears all logged periods and resets settings. This cannot be undone.")) {
      state = structuredClone(DEFAULT_STATE);
      saveState(state);
      renderHome();
      renderHistory();
      renderSettings();
      alert("Everything deleted.");
    }
  });

  // ---- Init ---------------------------------------------------------------

  renderHome();
  showScreen("home");

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    });
  }
}
