const workouts = [
  {
    id: "lower-strength",
    name: "Lower strength",
    type: "strength",
    minutes: 50,
    load: 72,
    focus: "Squat pattern, hinge, carries",
    coaching: "Build power through the floor. Rest until your next set feels crisp.",
  },
  {
    id: "upper-build",
    name: "Upper build",
    type: "strength",
    minutes: 45,
    load: 66,
    focus: "Press, row, pull, core brace",
    coaching: "Control the lowering phase and keep shoulders packed on every rep.",
  },
  {
    id: "engine-intervals",
    name: "Engine intervals",
    type: "conditioning",
    minutes: 32,
    load: 78,
    focus: "Bike sprints and breathing reset",
    coaching: "Push the hard blocks, then recover fully before the next wave.",
  },
  {
    id: "full-body",
    name: "Full-body circuit",
    type: "conditioning",
    minutes: 40,
    load: 70,
    focus: "Kettlebells, step-ups, push-ups",
    coaching: "Keep transitions smooth and let technique set the pace.",
  },
  {
    id: "mobility-flow",
    name: "Mobility flow",
    type: "recovery",
    minutes: 28,
    load: 26,
    focus: "Hips, T-spine, ankles",
    coaching: "Move slowly enough to notice where range starts to change.",
  },
  {
    id: "walk-reset",
    name: "Zone 2 reset",
    type: "recovery",
    minutes: 35,
    load: 34,
    focus: "Nasal breathing and easy pace",
    coaching: "You should finish fresher than you started.",
  },
];

const goals = {
  strength: ["lower-strength", "upper-build", "mobility-flow", "full-body"],
  fatloss: ["engine-intervals", "full-body", "upper-build", "walk-reset"],
  mobility: ["mobility-flow", "walk-reset", "upper-build", "mobility-flow"],
  endurance: ["engine-intervals", "walk-reset", "full-body", "mobility-flow"],
};

const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const storageKey = "pulsefit-state-v1";

const defaultState = {
  goal: "strength",
  targetSessions: 4,
  intensity: 3,
  recoveryPrompts: true,
  selectedWorkout: "lower-strength",
  plan: [],
  sessions: [
    seededSession(-5, "upper-build", 44, 7),
    seededSession(-3, "mobility-flow", 30, 4),
    seededSession(-1, "engine-intervals", 34, 8),
  ],
};

let state = loadState();

const elements = {
  tabs: document.querySelectorAll(".tab-button"),
  screens: document.querySelectorAll(".screen"),
  goalSelect: document.querySelector("#goalSelect"),
  targetSessions: document.querySelector("#targetSessions"),
  intensitySlider: document.querySelector("#intensitySlider"),
  recoveryToggle: document.querySelector("#recoveryToggle"),
  weekPlan: document.querySelector("#weekPlan"),
  workoutGrid: document.querySelector("#workoutGrid"),
  logWorkout: document.querySelector("#logWorkout"),
  sessionForm: document.querySelector("#sessionForm"),
  logMinutes: document.querySelector("#logMinutes"),
  logEffort: document.querySelector("#logEffort"),
  weeklyMinutes: document.querySelector("#weeklyMinutes"),
  weeklyWorkouts: document.querySelector("#weeklyWorkouts"),
  weeklyLoad: document.querySelector("#weeklyLoad"),
  sessionList: document.querySelector("#sessionList"),
  progressChart: document.querySelector("#progressChart"),
  filterButtons: document.querySelectorAll("[data-filter]"),
  generatePlan: document.querySelector("#generatePlan"),
  resetData: document.querySelector("#resetData"),
  exportSummary: document.querySelector("#exportSummary"),
  coachFocus: document.querySelector("#coachFocus"),
  coachCue: document.querySelector("#coachCue"),
  toast: document.querySelector("#toast"),
};

if (!state.plan.length) {
  state.plan = buildPlan();
}

bindEvents();
render();

function seededSession(dayOffset, workoutId, minutes, effort) {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  return {
    id: crypto.randomUUID(),
    workoutId,
    minutes,
    effort,
    date: date.toISOString(),
  };
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    return saved ? { ...defaultState, ...saved } : structuredClone(defaultState);
  } catch {
    return structuredClone(defaultState);
  }
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function bindEvents() {
  elements.tabs.forEach((tab) => {
    tab.addEventListener("click", () => activateSection(tab.dataset.section));
  });

  elements.goalSelect.addEventListener("change", () => {
    state.goal = elements.goalSelect.value;
    state.plan = buildPlan();
    saveAndRender("Plan updated");
  });

  elements.targetSessions.addEventListener("change", () => {
    state.targetSessions = Number(elements.targetSessions.value);
    state.plan = buildPlan();
    saveAndRender("Weekly target updated");
  });

  elements.intensitySlider.addEventListener("input", () => {
    state.intensity = Number(elements.intensitySlider.value);
    saveAndRender();
  });

  elements.recoveryToggle.addEventListener("change", () => {
    state.recoveryPrompts = elements.recoveryToggle.checked;
    saveAndRender(state.recoveryPrompts ? "Recovery prompts on" : "Recovery prompts off");
  });

  elements.generatePlan.addEventListener("click", () => {
    state.plan = buildPlan(true);
    saveAndRender("Fresh week generated");
  });

  elements.sessionForm.addEventListener("submit", (event) => {
    event.preventDefault();
    logSession(
      elements.logWorkout.value,
      Number(elements.logMinutes.value),
      Number(elements.logEffort.value)
    );
  });

  elements.filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      elements.filterButtons.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      renderWorkoutGrid(button.dataset.filter);
    });
  });

  elements.resetData.addEventListener("click", () => {
    state = structuredClone(defaultState);
    state.plan = buildPlan();
    saveAndRender("Progress reset");
  });

  elements.exportSummary.addEventListener("click", async () => {
    const summary = makeSummary();
    try {
      await navigator.clipboard.writeText(summary);
      showToast("Summary copied");
    } catch {
      showToast(summary);
    }
  });
}

function activateSection(sectionId) {
  elements.tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.section === sectionId));
  elements.screens.forEach((screen) => screen.classList.toggle("active", screen.id === sectionId));
  window.scrollTo({ top: 0, behavior: "smooth" });
  if (sectionId === "progress") {
    drawChart();
  }
}

function buildPlan(shuffle = false) {
  const pool = goals[state.goal] || goals.strength;
  const sessions = Math.min(Math.max(state.targetSessions, 2), 7);
  const restLabel = state.recoveryPrompts ? "Recovery check" : "Rest";
  const plan = dayNames.map((day, index) => ({
    day,
    workoutId: null,
    title: restLabel,
    complete: false,
    key: `${day}-${Date.now()}-${index}`,
  }));
  const preferredDays = sessions <= 3 ? [0, 2, 4] : sessions === 4 ? [0, 1, 3, 5] : [0, 1, 2, 4, 5, 6, 3];
  const offset = shuffle ? Math.floor(Math.random() * pool.length) : 0;

  preferredDays.slice(0, sessions).forEach((dayIndex, index) => {
    const workout = getWorkout(pool[(index + offset) % pool.length]);
    plan[dayIndex] = {
      ...plan[dayIndex],
      workoutId: workout.id,
      title: workout.name,
    };
  });

  return plan;
}

function getWorkout(id) {
  return workouts.find((workout) => workout.id === id) || workouts[0];
}

function saveAndRender(message) {
  saveState();
  render();
  if (message) showToast(message);
}

function render() {
  elements.goalSelect.value = state.goal;
  elements.targetSessions.value = state.targetSessions;
  elements.intensitySlider.value = state.intensity;
  elements.recoveryToggle.checked = state.recoveryPrompts;
  renderPlan();
  renderWorkoutOptions();
  renderWorkoutGrid(document.querySelector("[data-filter].active")?.dataset.filter || "all");
  renderMetrics();
  renderSessions();
  renderCoachCue();
  drawChart();
}

function renderPlan() {
  elements.weekPlan.innerHTML = state.plan
    .map((item, index) => {
      const sessionOnDay = sessionsThisWeek().find((session) => {
        const date = new Date(session.date);
        return dayNames[(date.getDay() + 6) % 7] === item.day;
      });
      const complete = Boolean(sessionOnDay);
      return `
        <article class="day-card ${complete ? "complete" : ""}">
          <span class="day-name">${item.day}</span>
          <strong>${item.title}</strong>
          ${
            item.workoutId
              ? `<button type="button" data-plan-log="${index}">${complete ? "Done" : "Log"}</button>`
              : `<span class="pill">${complete ? "Active" : "Recovery"}</span>`
          }
        </article>
      `;
    })
    .join("");

  elements.weekPlan.querySelectorAll("[data-plan-log]").forEach((button) => {
    button.addEventListener("click", () => {
      const item = state.plan[Number(button.dataset.planLog)];
      const workout = getWorkout(item.workoutId);
      logSession(workout.id, scaledMinutes(workout.minutes), state.intensity + 4);
    });
  });
}

function renderWorkoutOptions() {
  elements.logWorkout.innerHTML = workouts
    .map((workout) => `<option value="${workout.id}">${workout.name}</option>`)
    .join("");
  elements.logWorkout.value = state.selectedWorkout;
}

function renderWorkoutGrid(filter = "all") {
  const visible = filter === "all" ? workouts : workouts.filter((workout) => workout.type === filter);
  elements.workoutGrid.innerHTML = visible
    .map(
      (workout) => `
        <article class="workout-card ${workout.id === state.selectedWorkout ? "selected" : ""}">
          <div class="workout-topline">
            <span class="workout-icon" aria-hidden="true">${iconForType(workout.type)}</span>
            <span class="pill">${workout.type}</span>
          </div>
          <div>
            <h3>${workout.name}</h3>
            <p>${workout.focus}</p>
          </div>
          <p>${workout.coaching}</p>
          <div class="stats-row">
            <span>${scaledMinutes(workout.minutes)} min</span>
            <span>${scaledLoad(workout.load)} load</span>
            <span>Level ${state.intensity}</span>
          </div>
          <button type="button" data-pick="${workout.id}">Pick workout</button>
        </article>
      `
    )
    .join("");

  elements.workoutGrid.querySelectorAll("[data-pick]").forEach((button) => {
    button.addEventListener("click", () => {
      const workout = getWorkout(button.dataset.pick);
      state.selectedWorkout = workout.id;
      elements.logWorkout.value = workout.id;
      elements.logMinutes.value = scaledMinutes(workout.minutes);
      saveAndRender(`${workout.name} selected`);
      activateSection("dashboard");
    });
  });
}

function iconForType(type) {
  if (type === "conditioning") return `<svg viewBox="0 0 24 24"><path d="m13 2-8 12h7l-1 8 8-12h-7l1-8Z"/></svg>`;
  if (type === "recovery") return `<svg viewBox="0 0 24 24"><path d="M12 21c-4-2.5-7-6-7-10a7 7 0 0 1 14 0c0 4-3 7.5-7 10Z"/><path d="M9 11h6"/></svg>`;
  return `<svg viewBox="0 0 24 24"><path d="M6 7v10M18 7v10M3 10v4M21 10v4M8 12h8"/></svg>`;
}

function renderMetrics() {
  const weekSessions = sessionsThisWeek();
  const minutes = weekSessions.reduce((sum, session) => sum + session.minutes, 0);
  const load = weekSessions.reduce((sum, session) => sum + session.minutes * session.effort, 0);
  elements.weeklyMinutes.textContent = minutes;
  elements.weeklyWorkouts.textContent = weekSessions.length;
  elements.weeklyLoad.textContent = load;
}

function renderSessions() {
  const sessions = [...state.sessions].sort((a, b) => new Date(b.date) - new Date(a.date));
  elements.sessionList.innerHTML = sessions.length
    ? sessions
        .map((session) => {
          const workout = getWorkout(session.workoutId);
          const date = new Date(session.date);
          return `
            <article class="session-item">
              <strong>${workout.name}<span>${session.minutes} min</span></strong>
              <span>${date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })} · effort ${session.effort}/10 · load ${session.minutes * session.effort}</span>
            </article>
          `;
        })
        .join("")
    : `<article class="session-item"><strong>No sessions yet</strong><span>Your first logged workout will appear here.</span></article>`;
}

function renderCoachCue() {
  const workout = getWorkout(state.selectedWorkout);
  elements.coachFocus.textContent = workout.name;
  elements.coachCue.textContent = workout.coaching;
}

function logSession(workoutId, minutes, effort) {
  state.selectedWorkout = workoutId;
  state.sessions.push({
    id: crypto.randomUUID(),
    workoutId,
    minutes,
    effort,
    date: new Date().toISOString(),
  });
  saveAndRender("Session logged");
}

function sessionsThisWeek() {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  start.setHours(0, 0, 0, 0);
  return state.sessions.filter((session) => new Date(session.date) >= start);
}

function scaledMinutes(minutes) {
  return Math.round(minutes * (0.82 + state.intensity * 0.06));
}

function scaledLoad(load) {
  return Math.round(load * (0.78 + state.intensity * 0.08));
}

function drawChart() {
  const canvas = elements.progressChart;
  const context = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const padding = 50;
  const chartHeight = height - padding * 2.35;
  const chartBottom = padding + chartHeight;
  const now = new Date();
  const data = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now);
    date.setDate(now.getDate() - (6 - index));
    const dayLoad = state.sessions
      .filter((session) => sameDay(new Date(session.date), date))
      .reduce((sum, session) => sum + session.minutes * session.effort, 0);
    return {
      label: date.toLocaleDateString(undefined, { weekday: "short" }),
      value: dayLoad,
    };
  });
  const max = Math.max(250, ...data.map((item) => item.value));
  const barWidth = (width - padding * 2) / data.length - 18;

  context.clearRect(0, 0, width, height);
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.strokeStyle = "#dce4df";
  context.lineWidth = 2;

  for (let i = 0; i < 4; i += 1) {
    const y = padding + (chartHeight / 3) * i;
    context.beginPath();
    context.moveTo(padding, y);
    context.lineTo(width - padding, y);
    context.stroke();
  }

  data.forEach((item, index) => {
    const x = padding + index * ((width - padding * 2) / data.length) + 9;
    const barHeight = item.value ? Math.max(8, (item.value / max) * chartHeight) : 4;
    const y = chartBottom - barHeight;
    context.fillStyle = index === data.length - 1 ? "#e76f51" : "#244f3d";
    roundRect(context, x, y, barWidth, barHeight, 10);
    context.fill();
    context.fillStyle = "#64716d";
    context.font = "700 24px Inter, sans-serif";
    context.textAlign = "center";
    context.fillText(item.label, x + barWidth / 2, height - 24);
    context.fillStyle = "#15211d";
    context.font = "800 22px Inter, sans-serif";
    context.fillText(item.value, x + barWidth / 2, y - 12);
  });
}

function roundRect(context, x, y, width, height, radius) {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.arcTo(x + width, y, x + width, y + height, safeRadius);
  context.arcTo(x + width, y + height, x, y + height, safeRadius);
  context.arcTo(x, y + height, x, y, safeRadius);
  context.arcTo(x, y, x + width, y, safeRadius);
  context.closePath();
}

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function makeSummary() {
  const weekSessions = sessionsThisWeek();
  const minutes = weekSessions.reduce((sum, session) => sum + session.minutes, 0);
  const load = weekSessions.reduce((sum, session) => sum + session.minutes * session.effort, 0);
  return `PulseFit summary: ${weekSessions.length}/${state.targetSessions} sessions, ${minutes} minutes, ${load} training load. Goal: ${state.goal}.`;
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => elements.toast.classList.remove("show"), 2200);
}
