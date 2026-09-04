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

// ---------------------------------------------------------------------------
// Servings + recipe scaling. A toddler counts as half an adult portion.
// ---------------------------------------------------------------------------

const TODDLER_PORTION = 0.5;

function portionsFor(settings) {
  const adults = settings.adults ?? 2;
  const children = settings.children ?? 0;
  return adults + children * TODDLER_PORTION;
}

function scaleFactor(recipe, settings) {
  const base = recipe.baseServings || 2;
  const factor = portionsFor(settings) / base;
  return settings.leftovers ? factor * 2 : factor;
}

// Rounds to something you'd actually measure, rather than "1.73 carrots".
function scaleQty(qty, factor, unit) {
  if (qty == null) return null;
  const scaled = qty * factor;
  if (unit === "g" || unit === "ml") {
    if (scaled >= 100) return Math.round(scaled / 10) * 10;
    return Math.max(5, Math.round(scaled / 5) * 5);
  }
  if (unit === "kg" || unit === "L") {
    return Math.round(scaled * 10) / 10;
  }
  // Countable things and spoons: nearest half.
  return Math.max(0.5, Math.round(scaled * 2) / 2);
}

function formatQty(n) {
  if (n == null) return "";
  const whole = Math.floor(n);
  const frac = n - whole;
  if (frac === 0) return String(whole);
  if (frac === 0.5) return whole === 0 ? "½" : `${whole}½`;
  return String(Math.round(n * 100) / 100);
}

// "3 carrot" reads wrong on a shopping list. Only applies to countable items
// (no unit) that aren't already written plural.
function pluraliseItem(item, qty) {
  if (qty == null || qty <= 1) return item;
  if (/(s|sh|ch|x)$/i.test(item)) return item;
  return item + "s";
}

// Assembles one shopping-list line: "450g beef mince", "1½ brown onions".
function formatIngredient(ing, factor) {
  const qty = scaleQty(ing.qty, factor, ing.unit);
  if (qty == null) return ing.item;
  const spacer = ing.unit.length > 2 ? " " : "";
  const unit = ing.unit ? `${spacer}${ing.unit} ` : " ";
  const item = ing.unit ? ing.item : pluraliseItem(ing.item, qty);
  return `${formatQty(qty)}${unit}${item}`.replace(/\s+/g, " ").trim();
}

// ---------------------------------------------------------------------------
// Week projection. Simple arithmetic only — roll the cycle day forward and
// wrap once it passes the average cycle length.
// ---------------------------------------------------------------------------

function projectedCycleDay(cycleDay, offset, avgCycleLength) {
  const raw = cycleDay + offset;
  // Already overdue: keep counting rather than inventing a new cycle.
  if (cycleDay > avgCycleLength) return raw;
  if (raw <= avgCycleLength) return raw;
  return ((raw - avgCycleLength - 1) % avgCycleLength) + 1;
}

// ---------------------------------------------------------------------------
// Dietary filtering
// ---------------------------------------------------------------------------

function recipeMatchesDietary(recipe, dietary) {
  if (!dietary || dietary.length === 0) return true;
  return dietary.every((tag) => recipe.tags.includes(tag));
}

function alternativesFor(recipes, mealType, dietary, excludeId) {
  return Object.entries(recipes)
    .filter(([id, r]) => r.meal === mealType && id !== excludeId && recipeMatchesDietary(r, dietary))
    .map(([id, r]) => ({ id, ...r }));
}

// A stable integer per calendar date, so the meal picked for a given day is
// always the same one — but different from its neighbours.
function dayIndexFor(dateIso) {
  return daysBetween(new Date(2000, 0, 1), parseLocalDate(dateIso));
}

// Rotates through a phase's options so a week-long phase doesn't serve the
// same dinner seven nights running. Falls back to any compatible recipe if
// the phase's own options are all filtered out by dietary settings.
function suggestedRecipeId(recipes, phaseMeals, mealType, dateIso, dietary) {
  const options = phaseMeals[mealType];
  const pool = (Array.isArray(options) ? options : [options]).filter(
    (id) => recipes[id] && recipeMatchesDietary(recipes[id], dietary)
  );

  if (pool.length === 0) {
    const fallback = alternativesFor(recipes, mealType, dietary, null);
    return fallback.length ? fallback[dayIndexFor(dateIso) % fallback.length].id : null;
  }

  return pool[dayIndexFor(dateIso) % pool.length];
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
    portionsFor,
    scaleFactor,
    scaleQty,
    formatQty,
    projectedCycleDay,
    recipeMatchesDietary,
    alternativesFor,
    dayIndexFor,
    suggestedRecipeId,
    pluraliseItem,
    formatIngredient,
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
    version: 2,
    settings: {
      cycleLength: 28,
      periodLength: 5,
      adults: 2,
      children: 2,
      leftovers: false,
      dietary: ["gluten-free"],
    },
    periods: [],
    // Per-date meal swaps: { "2026-09-04": { dinner: "gf-bolognese" } }
    mealOverrides: {},
  };

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return structuredClone(DEFAULT_STATE);
      const parsed = JSON.parse(raw);
      const settings = { ...DEFAULT_STATE.settings, ...(parsed.settings || {}) };
      return {
        version: 2,
        settings,
        periods: normalizePeriods(parsed.periods, settings),
        mealOverrides: parsed.mealOverrides && typeof parsed.mealOverrides === "object" ? parsed.mealOverrides : {},
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
    if (name === "week") renderWeek();
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
    renderMealButtons("food-meals", isoFromDate(today), phase);

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

  const MEAL_TYPES = ["breakfast", "lunch", "dinner"];

  // The recipe for a given date + meal: an explicit swap if there is one,
  // otherwise the phase default, falling back to any recipe that fits the
  // dietary settings if the default doesn't.
  function recipeIdFor(dateIso, phase, mealType) {
    const override = state.mealOverrides[dateIso] && state.mealOverrides[dateIso][mealType];
    if (override && RECIPES[override]) return override;
    return suggestedRecipeId(RECIPES, CONTENT[phase].food.meals, mealType, dateIso, state.settings.dietary);
  }

  function renderMealButtons(containerId, dateIso, phase) {
    const el = document.getElementById(containerId);
    el.innerHTML = "";
    MEAL_TYPES.forEach((mealType) => {
      const recipeId = recipeIdFor(dateIso, phase, mealType);
      const recipe = RECIPES[recipeId];
      const li = document.createElement("li");
      li.className = "meal-item";

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "meal-btn";
      btn.innerHTML =
        `<span class="meal-label">${mealType}</span>` +
        `<span class="meal-name"></span>` +
        `<span class="meal-time"></span>`;
      btn.querySelector(".meal-name").textContent = recipe.name;
      btn.querySelector(".meal-time").textContent = recipe.time;
      btn.addEventListener("click", () => openRecipeModal(recipeId, dateIso, phase, mealType));

      li.appendChild(btn);
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

  // ---- Week screen -------------------------------------------------------

  function renderWeek() {
    const today = todayLocalMidnight();
    const cycleDay = getCurrentCycleDay(state.periods, today);
    const list = document.getElementById("week-list");
    const empty = document.getElementById("week-empty");
    list.innerHTML = "";

    if (cycleDay === null) {
      empty.hidden = false;
      return;
    }
    empty.hidden = true;

    const avg = getAverageCycleLength(state.periods, state.settings);
    const currentPeriod = sortedPeriods(state.periods)[0];

    for (let offset = 0; offset < 7; offset++) {
      const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset);
      const dateIso = isoFromDate(date);
      const day = projectedCycleDay(cycleDay, offset, avg);

      // Only the current cycle knows its real period length; projected cycles
      // fall back to the setting.
      const rolledOver = day < cycleDay + offset;
      const periodLength = rolledOver ? state.settings.periodLength : (currentPeriod.length ?? state.settings.periodLength);
      const phase = getPhase(day, { ...state.settings, periodLength });
      const info = CONTENT[phase];

      const card = document.createElement("li");
      card.className = "week-day";
      card.style.setProperty("--day-color", info.color);

      const header = document.createElement("div");
      header.className = "week-day-header";
      header.innerHTML =
        `<span class="week-date"></span>` +
        `<span class="week-phase"></span>`;
      header.querySelector(".week-date").textContent =
        offset === 0 ? "Today" : date.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "short" });
      header.querySelector(".week-phase").textContent = `Day ${day} · ${info.label}`;
      card.appendChild(header);

      const meals = document.createElement("ul");
      meals.className = "week-meals";
      meals.id = `week-meals-${dateIso}`;
      card.appendChild(meals);

      list.appendChild(card);
      renderMealButtons(meals.id, dateIso, phase);
    }
  }

  // ---- Recipe modal ------------------------------------------------------

  const modal = document.getElementById("modal");
  const modalBody = document.getElementById("modal-body");

  function closeModal() {
    modal.hidden = true;
    modalBody.innerHTML = "";
  }

  document.getElementById("modal-close").addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hidden) closeModal();
  });

  function openRecipeModal(recipeId, dateIso, phase, mealType) {
    const recipe = RECIPES[recipeId];
    modalBody.innerHTML = "";

    const title = document.createElement("h2");
    title.className = "modal-title";
    title.textContent = recipe.name;
    modalBody.appendChild(title);

    const meta = document.createElement("p");
    meta.className = "modal-meta";
    const mealLabel = mealType.charAt(0).toUpperCase() + mealType.slice(1);
    meta.textContent = `${mealLabel} · ${recipe.time} · ${recipe.tags.join(", ")}`;
    modalBody.appendChild(meta);

    // --- servings controls ---
    const controls = document.createElement("div");
    controls.className = "servings";

    const adultsField = buildNumberSelect("Adults", 1, 8, state.settings.adults);
    const childrenField = buildNumberSelect("Toddlers", 0, 8, state.settings.children);

    const leftoversLabel = document.createElement("label");
    leftoversLabel.className = "leftovers";
    const leftoversBox = document.createElement("input");
    leftoversBox.type = "checkbox";
    leftoversBox.checked = !!state.settings.leftovers;
    leftoversLabel.appendChild(leftoversBox);
    leftoversLabel.appendChild(document.createTextNode(" Cook extra for leftovers"));

    controls.appendChild(adultsField.wrapper);
    controls.appendChild(childrenField.wrapper);
    modalBody.appendChild(controls);
    modalBody.appendChild(leftoversLabel);

    // --- ingredients ---
    const ingHeading = document.createElement("h3");
    ingHeading.className = "modal-subhead";
    modalBody.appendChild(ingHeading);

    const ingList = document.createElement("ul");
    ingList.className = "ingredients";
    modalBody.appendChild(ingList);

    function renderIngredients() {
      const settings = {
        ...state.settings,
        adults: Number(adultsField.select.value),
        children: Number(childrenField.select.value),
        leftovers: leftoversBox.checked,
      };
      const factor = scaleFactor(recipe, settings);
      const portions = portionsFor(settings) * (settings.leftovers ? 2 : 1);
      ingHeading.textContent = `What to buy — makes about ${formatQty(Math.round(portions * 2) / 2)} adult portions`;

      ingList.innerHTML = "";
      recipe.ingredients.forEach((ing) => {
        const li = document.createElement("li");
        li.textContent = formatIngredient(ing, factor);
        ingList.appendChild(li);
      });
    }

    function persistServings() {
      state.settings.adults = Number(adultsField.select.value);
      state.settings.children = Number(childrenField.select.value);
      state.settings.leftovers = leftoversBox.checked;
      saveState(state);
      renderIngredients();
    }

    adultsField.select.addEventListener("change", persistServings);
    childrenField.select.addEventListener("change", persistServings);
    leftoversBox.addEventListener("change", persistServings);
    renderIngredients();

    // --- method ---
    const methodHeading = document.createElement("h3");
    methodHeading.className = "modal-subhead";
    methodHeading.textContent = "Method";
    modalBody.appendChild(methodHeading);

    const methodList = document.createElement("ol");
    methodList.className = "method";
    recipe.method.forEach((step) => {
      const li = document.createElement("li");
      li.textContent = step;
      methodList.appendChild(li);
    });
    modalBody.appendChild(methodList);

    if (recipe.note) {
      const note = document.createElement("p");
      note.className = "modal-note";
      note.textContent = recipe.note;
      modalBody.appendChild(note);
    }

    // --- swap ---
    const swapBtn = document.createElement("button");
    swapBtn.type = "button";
    swapBtn.className = "btn btn-secondary btn-block";
    swapBtn.textContent = "Swap this meal";
    swapBtn.addEventListener("click", () => openSwapList(recipeId, dateIso, phase, mealType));
    modalBody.appendChild(swapBtn);

    modal.hidden = false;
    modalBody.scrollTop = 0;
  }

  function buildNumberSelect(labelText, min, max, value) {
    const wrapper = document.createElement("label");
    wrapper.className = "servings-field";
    const span = document.createElement("span");
    span.className = "servings-label";
    span.textContent = labelText;
    const select = document.createElement("select");
    for (let i = min; i <= max; i++) {
      const opt = document.createElement("option");
      opt.value = String(i);
      opt.textContent = String(i);
      if (i === value) opt.selected = true;
      select.appendChild(opt);
    }
    wrapper.appendChild(span);
    wrapper.appendChild(select);
    return { wrapper, select };
  }

  function openSwapList(currentId, dateIso, phase, mealType) {
    modalBody.innerHTML = "";

    const title = document.createElement("h2");
    title.className = "modal-title";
    title.textContent = `Choose a different ${mealType}`;
    modalBody.appendChild(title);

    const meta = document.createElement("p");
    meta.className = "modal-meta";
    meta.textContent = `Matching your settings: ${state.settings.dietary.length ? state.settings.dietary.join(", ") : "no restrictions"}`;
    modalBody.appendChild(meta);

    const options = alternativesFor(RECIPES, mealType, state.settings.dietary, currentId);
    const list = document.createElement("ul");
    list.className = "swap-list";

    options.forEach((recipe) => {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "meal-btn";
      btn.innerHTML = `<span class="meal-name"></span><span class="meal-time"></span>`;
      btn.querySelector(".meal-name").textContent = recipe.name;
      btn.querySelector(".meal-time").textContent = recipe.time;
      btn.addEventListener("click", () => {
        if (!state.mealOverrides[dateIso]) state.mealOverrides[dateIso] = {};
        state.mealOverrides[dateIso][mealType] = recipe.id;
        saveState(state);
        renderHome();
        renderWeek();
        openRecipeModal(recipe.id, dateIso, phase, mealType);
      });
      li.appendChild(btn);
      list.appendChild(li);
    });

    modalBody.appendChild(list);

    if (state.mealOverrides[dateIso] && state.mealOverrides[dateIso][mealType]) {
      const reset = document.createElement("button");
      reset.type = "button";
      reset.className = "btn btn-secondary btn-block";
      reset.textContent = "Back to the suggested meal";
      reset.addEventListener("click", () => {
        delete state.mealOverrides[dateIso][mealType];
        saveState(state);
        renderHome();
        renderWeek();
        openRecipeModal(recipeIdFor(dateIso, phase, mealType), dateIso, phase, mealType);
      });
      modalBody.appendChild(reset);
    }

    modalBody.scrollTop = 0;
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
    document.getElementById("setting-adults").value = String(state.settings.adults);
    document.getElementById("setting-children").value = String(state.settings.children);
    document.getElementById("setting-leftovers").checked = !!state.settings.leftovers;
    renderDietaryOptions();
  }

  function renderDietaryOptions() {
    const container = document.getElementById("setting-dietary");
    container.innerHTML = "";
    DIETARY_OPTIONS.forEach((option) => {
      const label = document.createElement("label");
      label.className = "checkbox-row";
      const box = document.createElement("input");
      box.type = "checkbox";
      box.value = option.id;
      box.checked = state.settings.dietary.includes(option.id);
      label.appendChild(box);
      label.appendChild(document.createTextNode(" " + option.label));
      container.appendChild(label);
    });
  }

  // Populate the adults/toddlers dropdowns once.
  (function fillServingSelects() {
    [
      { id: "setting-adults", min: 1, max: 8 },
      { id: "setting-children", min: 0, max: 8 },
    ].forEach(({ id, min, max }) => {
      const select = document.getElementById(id);
      for (let i = min; i <= max; i++) {
        const opt = document.createElement("option");
        opt.value = String(i);
        opt.textContent = String(i);
        select.appendChild(opt);
      }
    });
  })();

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
    const dietary = Array.from(document.querySelectorAll("#setting-dietary input:checked")).map((b) => b.value);
    state.settings = {
      ...state.settings,
      cycleLength,
      periodLength,
      adults: Number(document.getElementById("setting-adults").value),
      children: Number(document.getElementById("setting-children").value),
      leftovers: document.getElementById("setting-leftovers").checked,
      dietary,
    };
    saveState(state);
    renderHome();
    renderWeek();
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
          version: 2,
          settings,
          periods: normalizePeriods(parsed.periods, settings),
          mealOverrides: parsed.mealOverrides && typeof parsed.mealOverrides === "object" ? parsed.mealOverrides : {},
        };
        saveState(state);
        renderHome();
        renderWeek();
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
      renderWeek();
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
