const exercises = [
  {
    id: "goblet-squat",
    name: "Goblet squat",
    category: "Lower body",
    targetMuscles: ["Quads", "Glutes", "Core"],
    equipment: "Dumbbell or kettlebell",
    difficulty: "Beginner",
    setup: "Hold one weight close to your chest. Stand with feet just outside hip width and toes slightly turned out.",
    steps: [
      "Brace your tummy as if you are about to cough.",
      "Sit your hips down and back while keeping your chest tall.",
      "Let your knees track in the same direction as your toes.",
      "Pause briefly, then push the floor away to stand tall.",
    ],
    coachingCues: ["Keep the weight close", "Slow on the way down", "Stand tall at the top"],
    commonMistakes: ["Knees collapsing inward", "Heels lifting", "Rounding the back"],
    easierVariation: "Use bodyweight only and squat to a chair or bench.",
    harderVariation: "Use a heavier weight or add a three-second lower.",
    safetyNote: "Stop if you feel sharp knee, hip, or back pain.",
  },
  {
    id: "romanian-deadlift",
    name: "Romanian deadlift",
    category: "Lower body",
    targetMuscles: ["Hamstrings", "Glutes", "Back"],
    equipment: "Dumbbells",
    difficulty: "Beginner-intermediate",
    setup: "Stand tall with dumbbells in front of your thighs, knees soft, shoulders relaxed.",
    steps: [
      "Push your hips back like you are closing a car door.",
      "Keep the weights close to your legs as they travel down.",
      "Stop when you feel a hamstring stretch without rounding your back.",
      "Squeeze your glutes to return to standing.",
    ],
    coachingCues: ["Hips go back", "Long spine", "Weights stay close"],
    commonMistakes: ["Turning it into a squat", "Reaching the weights forward", "Locking the knees"],
    easierVariation: "Use lighter weights or shorten the range of motion.",
    harderVariation: "Slow the lowering phase or use a single-leg kickstand stance.",
    safetyNote: "Keep the movement controlled and avoid pushing through lower-back discomfort.",
  },
  {
    id: "glute-bridge",
    name: "Glute bridge",
    category: "Lower body",
    targetMuscles: ["Glutes", "Hamstrings", "Core"],
    equipment: "Mat",
    difficulty: "Beginner",
    setup: "Lie on your back with knees bent, feet flat, and heels close enough that you can brush them with your fingers.",
    steps: [
      "Gently tuck your ribs down and brace your core.",
      "Press through your heels and lift your hips.",
      "Squeeze your glutes at the top without arching your back.",
      "Lower slowly until your hips touch the floor.",
    ],
    coachingCues: ["Ribs down", "Push through heels", "Squeeze, do not arch"],
    commonMistakes: ["Overarching the lower back", "Feet too far away", "Rushing reps"],
    easierVariation: "Do fewer reps and pause between each one.",
    harderVariation: "Add a dumbbell across the hips or try single-leg bridges.",
    safetyNote: "Stop if you feel pinching in your lower back.",
  },
  {
    id: "step-up",
    name: "Step-up",
    category: "Lower body",
    targetMuscles: ["Glutes", "Quads", "Calves"],
    equipment: "Step, bench, or sturdy box",
    difficulty: "Beginner",
    setup: "Stand facing a stable step. Put your whole foot on the surface before starting each rep.",
    steps: [
      "Lean forward slightly from the hips.",
      "Push through the foot on the step to stand up.",
      "Bring the other foot up only after the working leg has done the work.",
      "Step down with control and repeat.",
    ],
    coachingCues: ["Whole foot on the step", "Drive through the front leg", "Control the way down"],
    commonMistakes: ["Pushing off too much from the floor leg", "Knee caving inward", "Using a step that is too high"],
    easierVariation: "Use a lower step or hold a wall for balance.",
    harderVariation: "Hold dumbbells or slow the lowering phase.",
    safetyNote: "Use a stable surface and avoid jumping down.",
  },
  {
    id: "incline-push-up",
    name: "Incline push-up",
    category: "Upper body",
    targetMuscles: ["Chest", "Shoulders", "Triceps", "Core"],
    equipment: "Bench, counter, or sturdy surface",
    difficulty: "Beginner",
    setup: "Place hands on a stable surface slightly wider than shoulders. Step feet back until your body forms a straight line.",
    steps: [
      "Brace your core and squeeze your glutes lightly.",
      "Lower your chest toward the surface.",
      "Keep elbows about 45 degrees from your body.",
      "Press the surface away to return to the start.",
    ],
    coachingCues: ["Body moves as one piece", "Elbows soft and angled", "Press away strong"],
    commonMistakes: ["Hips sagging", "Shrugging shoulders", "Flaring elbows wide"],
    easierVariation: "Use a higher surface such as a wall or kitchen counter.",
    harderVariation: "Use a lower surface or move to floor push-ups.",
    safetyNote: "Choose a surface that will not slide.",
  },
  {
    id: "dumbbell-row",
    name: "Dumbbell row",
    category: "Upper body",
    targetMuscles: ["Back", "Lats", "Biceps"],
    equipment: "Dumbbell and bench/chair",
    difficulty: "Beginner",
    setup: "Support one hand on a bench or chair. Hold a dumbbell in the other hand with a long, neutral spine.",
    steps: [
      "Let the working arm hang straight down.",
      "Pull your elbow toward your back pocket.",
      "Pause when the weight reaches your ribs.",
      "Lower the weight with control.",
    ],
    coachingCues: ["Pull with the elbow", "Keep neck relaxed", "No twisting"],
    commonMistakes: ["Yanking the weight", "Shrugging the shoulder", "Rotating the torso"],
    easierVariation: "Use a lighter dumbbell and support both knees on a bench.",
    harderVariation: "Pause for two seconds at the top of each rep.",
    safetyNote: "Avoid twisting through your lower back.",
  },
  {
    id: "shoulder-press",
    name: "Shoulder press",
    category: "Upper body",
    targetMuscles: ["Shoulders", "Triceps", "Upper back"],
    equipment: "Dumbbells",
    difficulty: "Beginner-intermediate",
    setup: "Stand or sit tall with dumbbells at shoulder height and palms facing slightly inward.",
    steps: [
      "Brace your core before pressing.",
      "Press the weights overhead without leaning back.",
      "Finish with biceps near ears and ribs down.",
      "Lower slowly back to shoulder height.",
    ],
    coachingCues: ["Ribs down", "Press straight up", "Control the lower"],
    commonMistakes: ["Leaning back", "Locking out harshly", "Using weights that are too heavy"],
    easierVariation: "Press one arm at a time or use lighter weights.",
    harderVariation: "Add a slow three-second lower.",
    safetyNote: "Stop if you feel shoulder pinching or neck pain.",
  },
  {
    id: "dead-bug",
    name: "Dead bug",
    category: "Core",
    targetMuscles: ["Deep core", "Hip flexors", "Stability"],
    equipment: "Mat",
    difficulty: "Beginner",
    setup: "Lie on your back with arms above shoulders and knees stacked above hips.",
    steps: [
      "Gently press your lower back toward the floor.",
      "Reach one arm and the opposite leg away from each other.",
      "Only go as far as you can without your back arching.",
      "Return to the start and switch sides.",
    ],
    coachingCues: ["Slow and quiet", "Back stays heavy", "Breathe out as you reach"],
    commonMistakes: ["Arching the back", "Moving too fast", "Holding breath"],
    easierVariation: "Move only the arms or only the legs.",
    harderVariation: "Hold light weights or extend both legs farther.",
    safetyNote: "Keep the range small if your back wants to arch.",
  },
  {
    id: "farmer-carry",
    name: "Farmer carry",
    category: "Full body",
    targetMuscles: ["Grip", "Core", "Traps", "Glutes"],
    equipment: "Dumbbells or kettlebells",
    difficulty: "Beginner",
    setup: "Stand tall with a weight in each hand and space to walk safely.",
    steps: [
      "Pick up the weights with a strong, flat back.",
      "Stand tall with shoulders down and chest open.",
      "Walk slowly with short, controlled steps.",
      "Set the weights down carefully at the end.",
    ],
    coachingCues: ["Tall posture", "Quiet steps", "Do not lean"],
    commonMistakes: ["Shrugging", "Holding breath", "Letting weights swing"],
    easierVariation: "Use lighter weights or carry for a shorter distance.",
    harderVariation: "Use heavier weights or carry one weight on one side.",
    safetyNote: "Keep walkways clear and set weights down before grip fails.",
  },
  {
    id: "bike-intervals",
    name: "Bike intervals",
    category: "Conditioning",
    targetMuscles: ["Heart", "Lungs", "Quads", "Glutes"],
    equipment: "Stationary bike",
    difficulty: "Beginner-intermediate",
    setup: "Adjust the seat so your knee stays slightly bent at the bottom of the pedal stroke.",
    steps: [
      "Warm up at an easy pace.",
      "Increase effort for the work interval.",
      "Recover at a gentle pace until breathing settles.",
      "Repeat for the planned rounds, then cool down.",
    ],
    coachingCues: ["Smooth pedals", "Hard but controlled", "Recover fully"],
    commonMistakes: ["Starting too hard", "Skipping the warm-up", "Holding tension in shoulders"],
    easierVariation: "Shorten the hard intervals or reduce resistance.",
    harderVariation: "Add one or two rounds or increase resistance slightly.",
    safetyNote: "Stop if you feel dizzy, chest pain, or unusual shortness of breath.",
  },
  {
    id: "brisk-walk",
    name: "Brisk walk",
    category: "Conditioning",
    targetMuscles: ["Heart", "Lungs", "Legs"],
    equipment: "Comfortable shoes",
    difficulty: "Beginner",
    setup: "Choose a safe route or treadmill pace where you can walk without interruptions.",
    steps: [
      "Start easy for the first few minutes.",
      "Build to a pace where talking takes a little effort.",
      "Keep shoulders relaxed and arms swinging naturally.",
      "Slow down for the final few minutes.",
    ],
    coachingCues: ["Tall posture", "Relaxed shoulders", "Steady breathing"],
    commonMistakes: ["Going too fast too soon", "Looking down the whole time", "Skipping water on warm days"],
    easierVariation: "Break it into two shorter walks.",
    harderVariation: "Add gentle hills or short faster blocks.",
    safetyNote: "Pick well-lit routes and slow down if joints feel irritated.",
  },
  {
    id: "hip-mobility-flow",
    name: "Hip mobility flow",
    category: "Mobility",
    targetMuscles: ["Hips", "Glutes", "Adductors", "Lower back"],
    equipment: "Mat",
    difficulty: "Beginner",
    setup: "Set up on a mat with enough space to move slowly through kneeling and seated positions.",
    steps: [
      "Start with gentle hip circles on hands and knees.",
      "Move into a half-kneeling hip flexor stretch.",
      "Shift into a seated 90/90 position and breathe.",
      "Repeat the flow on both sides.",
    ],
    coachingCues: ["Move slowly", "Breathe into tight areas", "Never force range"],
    commonMistakes: ["Pushing into pain", "Holding breath", "Rushing positions"],
    easierVariation: "Use cushions or blocks for support.",
    harderVariation: "Add longer holds or controlled transitions without hands.",
    safetyNote: "Mobility should feel stretchy or effortful, not sharp.",
  },
];

const workouts = [
  {
    id: "lower-strength",
    name: "Lower strength",
    type: "strength",
    minutes: 50,
    load: 72,
    focus: "Squat pattern, hinge, carries",
    coaching: "Build power through the floor. Rest until your next set feels crisp.",
    exercises: [
      { exerciseId: "goblet-squat", sets: 3, reps: "8-10", restSeconds: 75, notes: "Choose a weight that leaves two reps in reserve." },
      { exerciseId: "romanian-deadlift", sets: 3, reps: "8-10", restSeconds: 75, notes: "Move slowly and keep the weights close." },
      { exerciseId: "glute-bridge", sets: 3, reps: "10-12", restSeconds: 45, notes: "Pause for one breath at the top." },
      { exerciseId: "farmer-carry", sets: 3, reps: "30-45 sec", restSeconds: 60, notes: "Walk tall with quiet steps." },
    ],
  },
  {
    id: "upper-build",
    name: "Upper build",
    type: "strength",
    minutes: 45,
    load: 66,
    focus: "Press, row, pull, core brace",
    coaching: "Control the lowering phase and keep shoulders packed on every rep.",
    exercises: [
      { exerciseId: "incline-push-up", sets: 3, reps: "8-12", restSeconds: 60, notes: "Use a higher surface if reps get messy." },
      { exerciseId: "dumbbell-row", sets: 3, reps: "10 each side", restSeconds: 60, notes: "Pull your elbow toward your back pocket." },
      { exerciseId: "shoulder-press", sets: 3, reps: "8-10", restSeconds: 75, notes: "Keep ribs down and avoid leaning back." },
      { exerciseId: "dead-bug", sets: 3, reps: "6 each side", restSeconds: 35, notes: "Slow reps count more than big range." },
    ],
  },
  {
    id: "engine-intervals",
    name: "Engine intervals",
    type: "conditioning",
    minutes: 32,
    load: 78,
    focus: "Bike sprints and breathing reset",
    coaching: "Push the hard blocks, then recover fully before the next wave.",
    exercises: [
      { exerciseId: "bike-intervals", sets: 8, reps: "30 sec hard / 90 sec easy", restSeconds: 90, notes: "Hard should feel like 8 out of 10, not a panic sprint." },
      { exerciseId: "brisk-walk", sets: 1, reps: "8 min cool-down", restSeconds: 0, notes: "Let breathing settle before stopping." },
      { exerciseId: "hip-mobility-flow", sets: 1, reps: "5 min", restSeconds: 0, notes: "Finish with gentle hip openers." },
    ],
  },
  {
    id: "full-body",
    name: "Full-body circuit",
    type: "conditioning",
    minutes: 40,
    load: 70,
    focus: "Kettlebells, step-ups, push-ups",
    coaching: "Keep transitions smooth and let technique set the pace.",
    exercises: [
      { exerciseId: "step-up", sets: 3, reps: "8 each side", restSeconds: 45, notes: "Use a low, stable step." },
      { exerciseId: "incline-push-up", sets: 3, reps: "8-10", restSeconds: 45, notes: "Stop before form breaks." },
      { exerciseId: "dumbbell-row", sets: 3, reps: "10 each side", restSeconds: 45, notes: "Keep the torso still." },
      { exerciseId: "farmer-carry", sets: 3, reps: "30 sec", restSeconds: 60, notes: "Choose a challenging but safe grip." },
    ],
  },
  {
    id: "mobility-flow",
    name: "Mobility flow",
    type: "recovery",
    minutes: 28,
    load: 26,
    focus: "Hips, T-spine, ankles",
    coaching: "Move slowly enough to notice where range starts to change.",
    exercises: [
      { exerciseId: "hip-mobility-flow", sets: 2, reps: "6 min each side", restSeconds: 30, notes: "Use cushions if kneeling feels uncomfortable." },
      { exerciseId: "glute-bridge", sets: 2, reps: "10 slow reps", restSeconds: 30, notes: "Wake up the glutes without rushing." },
      { exerciseId: "dead-bug", sets: 2, reps: "5 each side", restSeconds: 30, notes: "Keep the lower back steady." },
    ],
  },
  {
    id: "walk-reset",
    name: "Zone 2 reset",
    type: "recovery",
    minutes: 35,
    load: 34,
    focus: "Nasal breathing and easy pace",
    coaching: "You should finish fresher than you started.",
    exercises: [
      { exerciseId: "brisk-walk", sets: 1, reps: "30 min", restSeconds: 0, notes: "Keep the pace conversational." },
      { exerciseId: "hip-mobility-flow", sets: 1, reps: "5 min", restSeconds: 0, notes: "Use this as a gentle cool-down." },
    ],
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
  activeWorkout: "lower-strength",
  exerciseCompletions: {},
  currentRun: null,
  plan: [],
  sessions: [
    seededSession(-5, "upper-build", 44, 7, "Rows felt strong today."),
    seededSession(-3, "mobility-flow", 30, 4, "Good reset after a busy day."),
    seededSession(-1, "engine-intervals", 34, 8, "Hard but manageable."),
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
  todayWorkoutName: document.querySelector("#dashboard-title"),
  todayWorkoutFocus: document.querySelector("#todayWorkoutFocus"),
  todayDuration: document.querySelector("#todayDuration"),
  todayDifficulty: document.querySelector("#todayDifficulty"),
  todayExerciseCount: document.querySelector("#todayExerciseCount"),
  startWorkout: document.querySelector("#startWorkout"),
  swapWorkout: document.querySelector("#swapWorkout"),
  weeklyMinutes: document.querySelector("#weeklyMinutes"),
  weeklyWorkouts: document.querySelector("#weeklyWorkouts"),
  targetRemaining: document.querySelector("#targetRemaining"),
  insightGrid: document.querySelector("#insightGrid"),
  progressInsights: document.querySelector("#progressInsights"),
  sessionList: document.querySelector("#sessionList"),
  progressChart: document.querySelector("#progressChart"),
  filterButtons: document.querySelectorAll("[data-filter]"),
  generatePlan: document.querySelector("#generatePlan"),
  resetData: document.querySelector("#resetData"),
  exportSummary: document.querySelector("#exportSummary"),
  coachFocus: document.querySelector("#coachFocus"),
  coachCue: document.querySelector("#coachCue"),
  toast: document.querySelector("#toast"),
  workoutModal: document.querySelector("#workoutModal"),
  closeWorkoutModal: document.querySelector("#closeWorkoutModal"),
  workoutDetailContent: document.querySelector("#workoutDetailContent"),
  guidedWorkoutModal: document.querySelector("#guidedWorkoutModal"),
  guidedWorkoutContent: document.querySelector("#guidedWorkoutContent"),
};

if (!state.plan.length) {
  state.plan = buildPlan();
}

bindEvents();
render();

function seededSession(dayOffset, workoutId, minutes, effort, notes = "") {
  const date = new Date();
  const workout = getWorkout(workoutId);
  date.setDate(date.getDate() + dayOffset);
  return {
    id: crypto.randomUUID(),
    workoutId,
    minutes,
    effort,
    completedExerciseIds: workout.exercises.map((item) => item.exerciseId),
    exerciseStatuses: workout.exercises.map((item) => ({ exerciseId: item.exerciseId, status: "done" })),
    notes,
    date: date.toISOString(),
  };
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    const nextState = saved ? { ...defaultState, ...saved } : structuredClone(defaultState);
    nextState.sessions = (nextState.sessions || []).map(normalizeSession);
    nextState.exerciseCompletions = nextState.exerciseCompletions || {};
    nextState.activeWorkout = nextState.activeWorkout || nextState.selectedWorkout || "lower-strength";
    nextState.currentRun = nextState.currentRun || null;
    return nextState;
  } catch {
    return structuredClone(defaultState);
  }
}

function normalizeSession(session) {
  const completedExerciseIds = Array.isArray(session.completedExerciseIds) ? session.completedExerciseIds : [];
  const exerciseStatuses = Array.isArray(session.exerciseStatuses)
    ? session.exerciseStatuses
    : completedExerciseIds.map((exerciseId) => ({ exerciseId, status: "done" }));
  return {
    id: session.id || crypto.randomUUID(),
    workoutId: session.workoutId || "lower-strength",
    minutes: Number(session.minutes) || 0,
    effort: Number(session.effort) || 0,
    completedExerciseIds,
    exerciseStatuses,
    notes: session.notes || "",
    date: session.date || new Date().toISOString(),
  };
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
    state.selectedWorkout = todayWorkout().id;
    state.activeWorkout = state.selectedWorkout;
    saveAndRender("Fresh week generated");
  });

  elements.startWorkout.addEventListener("click", () => startGuidedWorkout(state.selectedWorkout));
  elements.swapWorkout.addEventListener("click", swapForEasierSession);

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

  elements.closeWorkoutModal.addEventListener("click", closeWorkoutDetail);
  elements.workoutModal.addEventListener("click", (event) => {
    if (event.target === elements.workoutModal) {
      closeWorkoutDetail();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && elements.workoutModal.classList.contains("show")) {
      closeWorkoutDetail();
    }
    if (event.key === "Escape" && elements.guidedWorkoutModal.classList.contains("show")) {
      closeGuidedWorkout();
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

function getExercise(id) {
  return exercises.find((exercise) => exercise.id === id) || exercises[0];
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
  renderToday();
  renderPlan();
  renderWorkoutGrid(document.querySelector("[data-filter].active")?.dataset.filter || "all");
  renderMetrics();
  renderInsights();
  renderSessions();
  renderCoachCue();
  drawChart();
}

function renderToday() {
  const workout = todayWorkout();
  state.selectedWorkout = workout.id;
  state.activeWorkout = workout.id;
  elements.todayWorkoutName.textContent = workout.name;
  elements.todayWorkoutFocus.textContent = workout.focus;
  elements.todayDuration.textContent = scaledMinutes(workout.minutes);
  elements.todayDifficulty.textContent = workoutDifficulty(workout);
  elements.todayExerciseCount.textContent = workout.exercises.length;
}

function todayWorkout() {
  const weekSessions = sessionsThisWeek();
  const usedIds = new Set(weekSessions.map((session) => session.workoutId));
  const selected = getWorkout(state.selectedWorkout || "lower-strength");
  if (selected && !usedIds.has(selected.id)) return selected;
  const planned = state.plan.find((item) => item.workoutId && !usedIds.has(item.workoutId));
  return planned ? getWorkout(planned.workoutId) : getWorkout(state.selectedWorkout || "lower-strength");
}

function workoutDifficulty(workout) {
  if (workout.type === "recovery") return "Easy";
  if (workout.minutes <= 35 || workout.exercises.length <= 3) return "Moderate";
  return state.intensity >= 4 ? "Challenging" : "Moderate";
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
          <strong>${escapeHtml(item.title)}</strong>
          ${
            item.workoutId
              ? `<button type="button" data-plan-open="${index}">${complete ? "Done" : "Open"}</button>`
              : `<span class="pill">${complete ? "Active" : "Recovery"}</span>`
          }
        </article>
      `;
    })
    .join("");

  elements.weekPlan.querySelectorAll("[data-plan-open]").forEach((button) => {
    button.addEventListener("click", () => {
      const item = state.plan[Number(button.dataset.planOpen)];
      selectWorkout(item.workoutId, false);
      openWorkoutDetail(item.workoutId);
    });
  });
}

function renderWorkoutOptions() {
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
            <h3>${escapeHtml(workout.name)}</h3>
            <p>${escapeHtml(workout.focus)}</p>
          </div>
          <p>${escapeHtml(workout.coaching)}</p>
          <div class="exercise-preview">
            ${workout.exercises
              .slice(0, 4)
              .map((item) => `<span>${escapeHtml(getExercise(item.exerciseId).name)} <small>${item.sets} x ${escapeHtml(item.reps)}</small></span>`)
              .join("")}
          </div>
          <div class="stats-row">
            <span>${scaledMinutes(workout.minutes)} min</span>
            <span>${workoutDifficulty(workout)}</span>
            <span>${workout.exercises.length} exercises</span>
          </div>
          <div class="card-actions">
            <button class="secondary-action" type="button" data-view="${workout.id}">View details</button>
            <button type="button" data-pick="${workout.id}">Set today</button>
          </div>
        </article>
      `
    )
    .join("");

  elements.workoutGrid.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => openWorkoutDetail(button.dataset.view));
  });

  elements.workoutGrid.querySelectorAll("[data-pick]").forEach((button) => {
    button.addEventListener("click", () => {
      selectWorkout(button.dataset.pick);
      activateSection("dashboard");
    });
  });
}

function selectWorkout(workoutId, notify = true) {
  const workout = getWorkout(workoutId);
  state.selectedWorkout = workout.id;
  state.activeWorkout = workout.id;
  saveState();
  render();
  if (notify) showToast(`${workout.name} selected`);
}

function openWorkoutDetail(workoutId) {
  const workout = getWorkout(workoutId);
  state.activeWorkout = workout.id;
  state.selectedWorkout = workout.id;
  saveState();
  renderWorkoutDetail(workout.id);
  elements.workoutModal.classList.add("show");
  elements.workoutModal.setAttribute("aria-hidden", "false");
  elements.closeWorkoutModal.focus();
}

function closeWorkoutDetail() {
  elements.workoutModal.classList.remove("show");
  elements.workoutModal.setAttribute("aria-hidden", "true");
}

function renderWorkoutDetail(workoutId) {
  const workout = getWorkout(workoutId);
  elements.workoutDetailContent.innerHTML = `
    <div class="detail-heading">
      <p class="eyebrow">${workout.type}</p>
      <h2 id="modalWorkoutTitle">${escapeHtml(workout.name)}</h2>
      <p>${escapeHtml(workout.focus)}</p>
    </div>
    <div class="detail-stats">
      <span><strong>${scaledMinutes(workout.minutes)}</strong> min</span>
      <span><strong>${workout.exercises.length}</strong> exercises</span>
      <span><strong>${workoutDifficulty(workout)}</strong> difficulty</span>
    </div>
    <div class="coach-callout">
      <strong>Coach guidance</strong>
      <span>${escapeHtml(workout.coaching)}</span>
    </div>
    <div class="exercise-detail-list">
      ${workout.exercises.map((item) => renderExerciseDetail(item)).join("")}
    </div>
    <button class="primary-action" type="button" data-start-detail="${workout.id}">Start guided workout</button>
  `;

  elements.workoutDetailContent.querySelector("[data-start-detail]").addEventListener("click", () => {
    closeWorkoutDetail();
    startGuidedWorkout(workout.id);
  });
}

function renderExerciseDetail(item) {
  const exercise = getExercise(item.exerciseId);
  return `
    <article class="exercise-detail">
      <div class="exercise-check">
        <span>
          <strong>${escapeHtml(exercise.name)}</strong>
          <small>${item.sets} sets &middot; ${escapeHtml(item.reps)} &middot; ${formatRest(item.restSeconds)} rest</small>
        </span>
      </div>
      <p>${escapeHtml(item.notes)}</p>
      <details>
        <summary>How to do it</summary>
        <div class="instruction-block">
          <p><strong>Setup:</strong> ${escapeHtml(exercise.setup)}</p>
          <ol>${exercise.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol>
          <p><strong>Cues:</strong> ${exercise.coachingCues.map(escapeHtml).join(", ")}</p>
          <p><strong>Common mistakes:</strong> ${exercise.commonMistakes.map(escapeHtml).join(", ")}</p>
          <div class="variation-grid">
            <span><strong>Easier:</strong> ${escapeHtml(exercise.easierVariation)}</span>
            <span><strong>Harder:</strong> ${escapeHtml(exercise.harderVariation)}</span>
          </div>
          <p class="safety-note"><strong>Safety:</strong> ${escapeHtml(exercise.safetyNote)}</p>
        </div>
      </details>
    </article>
  `;
}

function toggleExerciseCompletion(workoutId, exerciseId, checked) {
  const current = new Set(completedIdsForWorkout(workoutId));
  if (checked) {
    current.add(exerciseId);
  } else {
    current.delete(exerciseId);
  }
  state.exerciseCompletions[workoutId] = [...current];
  saveState();
}

function completedIdsForWorkout(workoutId) {
  return Array.isArray(state.exerciseCompletions?.[workoutId]) ? state.exerciseCompletions[workoutId] : [];
}

function startGuidedWorkout(workoutId) {
  const workout = getWorkout(workoutId);
  state.currentRun = {
    workoutId: workout.id,
    exerciseIndex: 0,
    phase: "exercise",
    results: [],
    startedAt: new Date().toISOString(),
  };
  state.selectedWorkout = workout.id;
  state.activeWorkout = workout.id;
  saveState();
  renderGuidedWorkout();
  elements.guidedWorkoutModal.classList.add("show");
  elements.guidedWorkoutModal.setAttribute("aria-hidden", "false");
}

function renderGuidedWorkout() {
  if (!state.currentRun) return;
  const workout = getWorkout(state.currentRun.workoutId);
  if (state.currentRun.phase === "rest") {
    renderRestStep(workout);
    return;
  }
  if (state.currentRun.phase === "finish") {
    renderFinishStep(workout);
    return;
  }

  const item = workout.exercises[state.currentRun.exerciseIndex];
  const exercise = getExercise(item.exerciseId);
  elements.guidedWorkoutContent.innerHTML = `
    <div class="guided-topline">
      <span>Exercise ${state.currentRun.exerciseIndex + 1} of ${workout.exercises.length}</span>
      <button type="button" data-close-guided aria-label="Close workout">Close</button>
    </div>
    <div class="guided-card">
      <p class="eyebrow">${escapeHtml(workout.name)}</p>
      <h2 id="guidedWorkoutTitle">${escapeHtml(exercise.name)}</h2>
      <div class="guided-prescription">
        <span><strong>${item.sets}</strong> sets</span>
        <span><strong>${escapeHtml(item.reps)}</strong> reps</span>
        <span><strong>${formatRest(item.restSeconds)}</strong> rest</span>
      </div>
      <p class="guided-instruction">${escapeHtml(exercise.steps[0])} ${escapeHtml(exercise.steps[1])}</p>
      <div class="cue-list">
        ${exercise.coachingCues.slice(0, 3).map((cue) => `<span>${escapeHtml(cue)}</span>`).join("")}
      </div>
      <div class="support-note">
        <strong>Easier option</strong>
        <span>${escapeHtml(exercise.easierVariation)}</span>
      </div>
      <div class="safety-note">
        <strong>Safety</strong>
        <span>${escapeHtml(exercise.safetyNote)}</span>
      </div>
    </div>
    <div class="guided-actions">
      <button class="primary-action" type="button" data-exercise-status="done">Done</button>
      <button class="secondary-action" type="button" data-exercise-status="too-hard">Too hard</button>
      <button class="text-action" type="button" data-exercise-status="skipped">Skip</button>
    </div>
  `;
  bindGuidedButtons();
}

function renderRestStep(workout) {
  const nextItem = workout.exercises[state.currentRun.exerciseIndex + 1];
  const previousItem = workout.exercises[state.currentRun.exerciseIndex];
  const nextExercise = getExercise(nextItem.exerciseId);
  elements.guidedWorkoutContent.innerHTML = `
    <div class="guided-topline">
      <span>Rest</span>
      <button type="button" data-close-guided aria-label="Close workout">Close</button>
    </div>
    <div class="rest-card">
      <p class="eyebrow">Take a breath</p>
      <h2 id="guidedWorkoutTitle">${formatRest(previousItem.restSeconds)} rest</h2>
      <p>Let your breathing settle. Shake out tension and get ready for the next movement.</p>
      <div class="next-preview">
        <span>Next exercise</span>
        <strong>${escapeHtml(nextExercise.name)}</strong>
        <small>${nextItem.sets} sets &middot; ${escapeHtml(nextItem.reps)}</small>
      </div>
    </div>
    <button class="primary-action" type="button" data-continue-rest>Continue</button>
  `;
  bindGuidedButtons();
}

function renderFinishStep(workout) {
  const doneCount = state.currentRun.results.filter((result) => result.status === "done").length;
  const tooHardCount = state.currentRun.results.filter((result) => result.status === "too-hard").length;
  elements.guidedWorkoutContent.innerHTML = `
    <div class="guided-topline">
      <span>Workout complete</span>
      <button type="button" data-close-guided aria-label="Close workout">Close</button>
    </div>
    <form class="finish-card" id="finishWorkoutForm">
      <p class="eyebrow">${escapeHtml(workout.name)}</p>
      <h2 id="guidedWorkoutTitle">Nice work. How did it feel?</h2>
      <div class="finish-summary">
        <span><strong>${doneCount}</strong> done</span>
        <span><strong>${tooHardCount}</strong> too hard</span>
        <span><strong>${state.currentRun.results.length}</strong> total</span>
      </div>
      <label>
        Effort 1-10
        <input id="finishEffort" type="range" min="1" max="10" value="7" />
      </label>
      <label>
        Optional note
        <textarea id="finishNotes" rows="4" placeholder="Anything to remember for next time?"></textarea>
      </label>
      <button class="primary-action" type="submit">Save workout</button>
    </form>
  `;
  bindGuidedButtons();
}

function bindGuidedButtons() {
  elements.guidedWorkoutContent.querySelectorAll("[data-close-guided]").forEach((button) => {
    button.addEventListener("click", closeGuidedWorkout);
  });

  elements.guidedWorkoutContent.querySelectorAll("[data-exercise-status]").forEach((button) => {
    button.addEventListener("click", () => recordExerciseStatus(button.dataset.exerciseStatus));
  });

  const continueButton = elements.guidedWorkoutContent.querySelector("[data-continue-rest]");
  if (continueButton) {
    continueButton.addEventListener("click", () => {
      state.currentRun.exerciseIndex += 1;
      state.currentRun.phase = "exercise";
      saveState();
      renderGuidedWorkout();
    });
  }

  const finishForm = elements.guidedWorkoutContent.querySelector("#finishWorkoutForm");
  if (finishForm) {
    finishForm.addEventListener("submit", (event) => {
      event.preventDefault();
      completeGuidedWorkout();
    });
  }
}

function recordExerciseStatus(status) {
  const workout = getWorkout(state.currentRun.workoutId);
  const item = workout.exercises[state.currentRun.exerciseIndex];
  state.currentRun.results.push({
    exerciseId: item.exerciseId,
    status,
  });

  if (state.currentRun.exerciseIndex >= workout.exercises.length - 1) {
    state.currentRun.phase = "finish";
  } else {
    state.currentRun.phase = "rest";
  }
  saveState();
  renderGuidedWorkout();
}

function completeGuidedWorkout() {
  const run = state.currentRun;
  const workout = getWorkout(run.workoutId);
  const effort = Number(elements.guidedWorkoutContent.querySelector("#finishEffort").value);
  const notes = elements.guidedWorkoutContent.querySelector("#finishNotes").value.trim();
  const completedExerciseIds = run.results
    .filter((result) => result.status === "done")
    .map((result) => result.exerciseId);

  logSession(workout.id, scaledMinutes(workout.minutes), effort, completedExerciseIds, notes, run.results);
  state.currentRun = null;
  saveState();
  closeGuidedWorkout();
  activateSection("progress");
}

function closeGuidedWorkout() {
  elements.guidedWorkoutModal.classList.remove("show");
  elements.guidedWorkoutModal.setAttribute("aria-hidden", "true");
}

function swapForEasierSession() {
  const easyWorkout = workouts.find((workout) => workout.type === "recovery" && workout.id !== state.selectedWorkout) || getWorkout("mobility-flow");
  selectWorkout(easyWorkout.id, false);
  showToast(`${easyWorkout.name} is ready for today`);
}

function iconForType(type) {
  if (type === "conditioning") return `<svg viewBox="0 0 24 24"><path d="m13 2-8 12h7l-1 8 8-12h-7l1-8Z"/></svg>`;
  if (type === "recovery") return `<svg viewBox="0 0 24 24"><path d="M12 21c-4-2.5-7-6-7-10a7 7 0 0 1 14 0c0 4-3 7.5-7 10Z"/><path d="M9 11h6"/></svg>`;
  return `<svg viewBox="0 0 24 24"><path d="M6 7v10M18 7v10M3 10v4M21 10v4M8 12h8"/></svg>`;
}

function renderMetrics() {
  const weekSessions = sessionsThisWeek();
  const minutes = weekSessions.reduce((sum, session) => sum + session.minutes, 0);
  elements.weeklyMinutes.textContent = minutes;
  elements.weeklyWorkouts.textContent = weekSessions.length;
  elements.targetRemaining.textContent = Math.max(state.targetSessions - weekSessions.length, 0);
}

function renderInsights() {
  const insights = weeklyInsights();
  const cards = [
    { label: "Most completed type", value: insights.mostCompletedType, detail: "The pattern showing up most this week." },
    { label: "Exercises too hard", value: insights.tooHardCount, detail: insights.tooHardCount ? "Use easier options next time." : "Nothing marked too hard yet." },
    { label: "Next action", value: insights.nextAction, detail: "A simple suggestion for today." },
  ];

  elements.insightGrid.innerHTML = cards
    .map(
      (card) => `
        <article class="insight-card">
          <span>${escapeHtml(card.label)}</span>
          <strong>${escapeHtml(card.value)}</strong>
          <p>${escapeHtml(card.detail)}</p>
        </article>
      `
    )
    .join("");

  elements.progressInsights.innerHTML = [
    `You have completed ${insights.completedThisWeek} workout${insights.completedThisWeek === 1 ? "" : "s"} this week.`,
    insights.remaining ? `${insights.remaining} target session${insights.remaining === 1 ? "" : "s"} remaining.` : "Weekly target reached.",
    `Most completed workout type: ${insights.mostCompletedType}.`,
    insights.tooHardCount ? `${insights.tooHardCount} exercise${insights.tooHardCount === 1 ? "" : "s"} marked too hard.` : "No exercises marked too hard this week.",
    `Suggested next action: ${insights.nextAction}.`,
  ]
    .map((item) => `<article><strong>${escapeHtml(item)}</strong></article>`)
    .join("");
}

function weeklyInsights() {
  const weekSessions = sessionsThisWeek();
  const typeCounts = weekSessions.reduce((counts, session) => {
    const type = getWorkout(session.workoutId).type;
    counts[type] = (counts[type] || 0) + 1;
    return counts;
  }, {});
  const mostCompletedType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "None yet";
  const tooHardCount = weekSessions.reduce(
    (sum, session) => sum + (session.exerciseStatuses || []).filter((item) => item.status === "too-hard").length,
    0
  );
  const remaining = Math.max(state.targetSessions - weekSessions.length, 0);
  let nextAction = "Start today's workout";
  if (tooHardCount >= 2) nextAction = "Choose an easier session";
  if (!remaining) nextAction = "Take a recovery win";
  if (weekSessions.length === 0) nextAction = "Do one short guided workout";

  return {
    completedThisWeek: weekSessions.length,
    remaining,
    mostCompletedType: capitalize(mostCompletedType),
    tooHardCount,
    nextAction,
  };
}

function renderSessions() {
  const sessions = [...state.sessions].sort((a, b) => new Date(b.date) - new Date(a.date));
  elements.sessionList.innerHTML = sessions.length
    ? sessions
        .map((session) => {
          const workout = getWorkout(session.workoutId);
          const date = new Date(session.date);
          const completeCount = session.completedExerciseIds?.length || 0;
          const totalCount = workout.exercises.length;
          const tooHardCount = (session.exerciseStatuses || []).filter((item) => item.status === "too-hard").length;
          const skippedCount = (session.exerciseStatuses || []).filter((item) => item.status === "skipped").length;
          return `
            <article class="session-item">
              <strong>${escapeHtml(workout.name)}<span>${session.minutes} min</span></strong>
              <span>${date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })} &middot; effort ${session.effort}/10 &middot; ${completeCount} of ${totalCount} done</span>
              ${tooHardCount || skippedCount ? `<span>${tooHardCount} too hard &middot; ${skippedCount} skipped</span>` : ""}
              ${session.notes ? `<p>${escapeHtml(session.notes)}</p>` : ""}
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

function logSession(workoutId, minutes, effort, completedExerciseIds = [], notes = "", exerciseStatuses = []) {
  state.selectedWorkout = workoutId;
  state.activeWorkout = workoutId;
  state.sessions.push({
    id: crypto.randomUUID(),
    workoutId,
    minutes,
    effort,
    completedExerciseIds,
    exerciseStatuses,
    notes,
    date: new Date().toISOString(),
  });
  state.exerciseCompletions[workoutId] = [];
  saveAndRender("Workout saved");
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
    const dayMinutes = state.sessions
      .filter((session) => sameDay(new Date(session.date), date))
      .reduce((sum, session) => sum + session.minutes, 0);
    return {
      label: date.toLocaleDateString(undefined, { weekday: "short" }),
      value: dayMinutes,
    };
  });
  const max = Math.max(60, ...data.map((item) => item.value));
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
  const insights = weeklyInsights();
  const minutes = sessionsThisWeek().reduce((sum, session) => sum + session.minutes, 0);
  return `PulseFit summary: ${insights.completedThisWeek}/${state.targetSessions} workouts, ${minutes} minutes moved, ${insights.tooHardCount} exercises marked too hard. Suggested next action: ${insights.nextAction}.`;
}

function formatRest(seconds) {
  if (!seconds) return "no";
  if (seconds < 60) return `${seconds}s`;
  return `${Math.round(seconds / 60)} min`;
}

function capitalize(value) {
  return String(value).charAt(0).toUpperCase() + String(value).slice(1);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => elements.toast.classList.remove("show"), 2200);
}
