import { useEffect, useMemo, useState } from "react";
import { Link, Route, Routes } from "react-router-dom";
import {
  EXERCISES,
  PROGRAMS,
  getExercise,
  getProgram,
  getTemplate,
  getTemplatesForProgram,
} from "@/lib/content";
import { LocalStorageRepository } from "@/lib/localStorageRepository";
import {
  DEFAULT_DRAFT,
  type OnboardingDraft,
  createHomeEquipmentProfile,
  createProfileFromDraft,
  createStandardGymProfile,
  recommendProgramForDraft,
} from "@/lib/profile";
import type {
  ExerciseOutcome,
  Goal,
  InjuryFlag,
  PlannedExercise,
  Program,
  UserProfile,
  Weekday,
  WorkoutSession,
  WorkoutTemplate,
} from "@/types";

const repository = new LocalStorageRepository();

const navItems = [
  { href: "/", label: "Today" },
  { href: "/progress", label: "Progress" },
  { href: "/library", label: "Library" },
  { href: "/settings", label: "Settings" },
];

const weekdays: { id: Weekday; label: string }[] = [
  { id: "mon", label: "Mon" },
  { id: "tue", label: "Tue" },
  { id: "wed", label: "Wed" },
  { id: "thu", label: "Thu" },
  { id: "fri", label: "Fri" },
  { id: "sat", label: "Sat" },
  { id: "sun", label: "Sun" },
];

const injuryAreas: { id: InjuryFlag["area"]; label: string }[] = [
  { id: "lower_back", label: "Lower back" },
  { id: "knee", label: "Knee" },
  { id: "shoulder", label: "Shoulder" },
  { id: "wrist", label: "Wrist" },
  { id: "hip", label: "Hip" },
  { id: "ankle", label: "Ankle" },
  { id: "neck", label: "Neck" },
];

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null | undefined>(
    undefined,
  );

  useEffect(() => {
    repository.getProfile().then(setProfile);
  }, []);

  async function handleProfileComplete(nextProfile: UserProfile) {
    await repository.saveProfile(nextProfile);
    setProfile(nextProfile);
  }

  if (profile === undefined) {
    return <LoadingScreen />;
  }

  if (!profile) {
    return <OnboardingScreen onComplete={handleProfileComplete} />;
  }

  return (
    <div className="min-h-dvh bg-stone-50 text-stone-950">
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pb-24 pt-5">
        <Routes>
          <Route path="/" element={<TodayScreen profile={profile} />} />
          <Route path="/progress" element={<ProgressScreen />} />
          <Route path="/library" element={<LibraryScreen />} />
          <Route
            path="/settings"
            element={<SettingsScreen profile={profile} />}
          />
        </Routes>
      </main>

      <nav className="fixed inset-x-0 bottom-0 border-t border-stone-200 bg-white/92 px-3 py-3 backdrop-blur">
        <div className="mx-auto grid max-w-md grid-cols-4 gap-2">
          {navItems.map((item) => (
            <Link
              className="rounded-lg px-2 py-3 text-center text-sm font-bold text-stone-600 hover:bg-emerald-50 hover:text-emerald-900"
              key={item.href}
              to={item.href}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}

function LoadingScreen() {
  return (
    <main className="grid min-h-dvh place-items-center bg-stone-50 px-6 text-center">
      <div>
        <p className="text-xs font-extrabold uppercase tracking-wider text-orange-600">
          PulseFit
        </p>
        <h1 className="mt-2 text-3xl font-black">
          Getting your coach ready...
        </h1>
      </div>
    </main>
  );
}

function OnboardingScreen({
  onComplete,
}: {
  onComplete: (profile: UserProfile) => Promise<void>;
}) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<OnboardingDraft>(DEFAULT_DRAFT);
  const homeEquipment = useMemo(
    () => (draft.trainsAtHome ? createHomeEquipmentProfile(draft) : null),
    [draft],
  );
  const gymEquipment = draft.trainsAtGym ? createStandardGymProfile() : null;
  const recommendedProgram = recommendProgramForDraft(
    draft,
    homeEquipment,
    gymEquipment,
  );
  const totalSteps = 7;

  async function finish() {
    const profile = createProfileFromDraft(draft);
    await onComplete({ ...profile, programId: recommendedProgram.id });
  }

  return (
    <main className="min-h-dvh bg-stone-50 px-4 py-5 text-stone-950">
      <section className="mx-auto flex min-h-[calc(100dvh-40px)] w-full max-w-md flex-col gap-5">
        <header className="space-y-3">
          <p className="text-xs font-extrabold uppercase tracking-wider text-orange-600">
            Step {step + 1} of {totalSteps}
          </p>
          <div className="h-2 overflow-hidden rounded-full bg-stone-200">
            <div
              className="h-full rounded-full bg-emerald-900 transition-all"
              style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </header>

        <div className="flex-1 rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
          {step === 0 && <IntroStep draft={draft} setDraft={setDraft} />}
          {step === 1 && <GoalStep draft={draft} setDraft={setDraft} />}
          {step === 2 && <ScheduleStep draft={draft} setDraft={setDraft} />}
          {step === 3 && (
            <TrainingContextStep draft={draft} setDraft={setDraft} />
          )}
          {step === 4 && (
            <HomeEquipmentStep draft={draft} setDraft={setDraft} />
          )}
          {step === 5 && <InjuryStep draft={draft} setDraft={setDraft} />}
          {step === 6 && <ProgramStep program={recommendedProgram} />}
        </div>

        <footer className="grid grid-cols-[0.7fr_1fr] gap-3">
          <button
            className="min-h-12 rounded-lg bg-stone-200 px-4 font-black text-stone-700 disabled:opacity-40"
            disabled={step === 0}
            onClick={() => setStep((current) => Math.max(current - 1, 0))}
            type="button"
          >
            Back
          </button>
          <button
            className="min-h-12 rounded-lg bg-emerald-900 px-4 font-black text-white"
            onClick={
              step === totalSteps - 1
                ? finish
                : () => setStep((current) => current + 1)
            }
            type="button"
          >
            {step === totalSteps - 1 ? "Save my plan" : "Continue"}
          </button>
        </footer>
      </section>
    </main>
  );
}

function IntroStep({
  draft,
  setDraft,
}: {
  draft: OnboardingDraft;
  setDraft: (draft: OnboardingDraft) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-extrabold uppercase tracking-wider text-orange-600">
          Welcome
        </p>
        <h1 className="mt-2 text-4xl font-black leading-tight">
          Let&apos;s build a plan that feels doable.
        </h1>
      </div>
      <p className="leading-7 text-stone-600">
        A few calm questions first. We&apos;ll use them to pick workouts, avoid
        sore areas, and suggest weights that match the equipment available.
      </p>
      <label className="block text-sm font-black text-stone-700">
        Name, optional
        <input
          className="mt-2 min-h-12 w-full rounded-lg border border-stone-200 px-3 text-base"
          onChange={(event) => setDraft({ ...draft, name: event.target.value })}
          placeholder="What should your coach call you?"
          value={draft.name}
        />
      </label>
    </div>
  );
}

function GoalStep({
  draft,
  setDraft,
}: {
  draft: OnboardingDraft;
  setDraft: (draft: OnboardingDraft) => void;
}) {
  const goals: { id: Goal; label: string; helper: string }[] = [
    {
      id: "strength",
      label: "Get stronger",
      helper: "Learn lifts and build confidence.",
    },
    {
      id: "tone",
      label: "Tone up",
      helper: "Strength work with steady progress.",
    },
    {
      id: "fitness",
      label: "Feel fitter",
      helper: "Balanced workouts and conditioning.",
    },
    {
      id: "weight_loss",
      label: "Support weight loss",
      helper: "Simple consistency without food logging.",
    },
    {
      id: "general_health",
      label: "General health",
      helper: "Move well and feel better.",
    },
  ];

  return (
    <ChoiceStep
      eyebrow="Goal"
      title="What would feel like a win?"
      items={goals}
      selected={draft.goal}
      onSelect={(goal) => setDraft({ ...draft, goal })}
    />
  );
}

function ScheduleStep({
  draft,
  setDraft,
}: {
  draft: OnboardingDraft;
  setDraft: (draft: OnboardingDraft) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-extrabold uppercase tracking-wider text-orange-600">
          Routine
        </p>
        <h1 className="mt-2 text-3xl font-black">
          When can training realistically happen?
        </h1>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {weekdays.map((day) => (
          <button
            className={`min-h-12 rounded-lg border px-2 font-black ${
              draft.availableDays.includes(day.id)
                ? "border-emerald-900 bg-emerald-900 text-white"
                : "border-stone-200 bg-white text-stone-700"
            }`}
            key={day.id}
            onClick={() => toggleDay(draft, setDraft, day.id)}
            type="button"
          >
            {day.label}
          </button>
        ))}
      </div>
      <label className="block text-sm font-black text-stone-700">
        Usual session length
        <select
          className="mt-2 min-h-12 w-full rounded-lg border border-stone-200 px-3 text-base"
          onChange={(event) =>
            setDraft({
              ...draft,
              sessionLengthMinutes: Number(
                event.target.value,
              ) as OnboardingDraft["sessionLengthMinutes"],
            })
          }
          value={draft.sessionLengthMinutes}
        >
          <option value={20}>20 minutes</option>
          <option value={30}>30 minutes</option>
          <option value={45}>45 minutes</option>
          <option value={60}>60 minutes</option>
        </select>
      </label>
      <label className="block text-sm font-black text-stone-700">
        Units
        <select
          className="mt-2 min-h-12 w-full rounded-lg border border-stone-200 px-3 text-base"
          onChange={(event) =>
            setDraft({
              ...draft,
              units: event.target.value as OnboardingDraft["units"],
            })
          }
          value={draft.units}
        >
          <option value="kg">kg</option>
          <option value="lb">lb</option>
        </select>
      </label>
    </div>
  );
}

function TrainingContextStep({
  draft,
  setDraft,
}: {
  draft: OnboardingDraft;
  setDraft: (draft: OnboardingDraft) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-extrabold uppercase tracking-wider text-orange-600">
          Training place
        </p>
        <h1 className="mt-2 text-3xl font-black">
          Where will workouts happen?
        </h1>
      </div>
      <ToggleCard
        checked={draft.trainsAtHome}
        helper="Use bodyweight by default. Add weights if you have them."
        label="Home"
        onChange={(checked) =>
          setDraft({ ...draft, trainsAtHome: checked || !draft.trainsAtGym })
        }
      />
      <ToggleCard
        checked={draft.trainsAtGym}
        helper="Assumes a normal commercial gym: dumbbells, bench, barbell, bands, pull-up area."
        label="Gym"
        onChange={(checked) =>
          setDraft({ ...draft, trainsAtGym: checked || !draft.trainsAtHome })
        }
      />
    </div>
  );
}

function HomeEquipmentStep({
  draft,
  setDraft,
}: {
  draft: OnboardingDraft;
  setDraft: (draft: OnboardingDraft) => void;
}) {
  if (!draft.trainsAtHome) {
    return (
      <div className="space-y-4">
        <p className="text-xs font-extrabold uppercase tracking-wider text-orange-600">
          Home equipment
        </p>
        <h1 className="text-3xl font-black">No home setup needed.</h1>
        <p className="leading-7 text-stone-600">
          We&apos;ll use your gym profile when workouts start.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-extrabold uppercase tracking-wider text-orange-600">
          Home equipment
        </p>
        <h1 className="mt-2 text-3xl font-black">What do you have at home?</h1>
      </div>
      <ToggleCard
        checked={draft.home.bodyweightOnly}
        helper="This is totally fine. The app can still build a useful plan."
        label="Bodyweight only, or mostly bodyweight"
        onChange={(checked) =>
          setDraft({
            ...draft,
            home: { ...draft.home, bodyweightOnly: checked },
          })
        }
      />
      <label className="block text-sm font-black text-stone-700">
        Dumbbells, optional
        <input
          className="mt-2 min-h-12 w-full rounded-lg border border-stone-200 px-3 text-base"
          onChange={(event) =>
            setDraft({
              ...draft,
              home: {
                ...draft.home,
                dumbbellWeights: event.target.value,
                bodyweightOnly: false,
              },
            })
          }
          placeholder="Example: 5, 8, 10, 12"
          value={draft.home.dumbbellWeights}
        />
      </label>
      <label className="block text-sm font-black text-stone-700">
        Kettlebells, optional
        <input
          className="mt-2 min-h-12 w-full rounded-lg border border-stone-200 px-3 text-base"
          onChange={(event) =>
            setDraft({
              ...draft,
              home: {
                ...draft.home,
                kettlebellWeights: event.target.value,
                bodyweightOnly: false,
              },
            })
          }
          placeholder="Example: 8, 12, 16"
          value={draft.home.kettlebellWeights}
        />
      </label>
      <div className="grid gap-3">
        <ToggleCard
          checked={draft.home.resistanceBands}
          label="Resistance bands"
          onChange={(checked) =>
            setDraft({
              ...draft,
              home: { ...draft.home, resistanceBands: checked },
            })
          }
        />
        <ToggleCard
          checked={draft.home.bench}
          label="Bench"
          onChange={(checked) =>
            setDraft({ ...draft, home: { ...draft.home, bench: checked } })
          }
        />
        <ToggleCard
          checked={draft.home.pullUpBar}
          label="Pull-up bar"
          onChange={(checked) =>
            setDraft({ ...draft, home: { ...draft.home, pullUpBar: checked } })
          }
        />
      </div>
    </div>
  );
}

function InjuryStep({
  draft,
  setDraft,
}: {
  draft: OnboardingDraft;
  setDraft: (draft: OnboardingDraft) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-extrabold uppercase tracking-wider text-orange-600">
          Safety
        </p>
        <h1 className="mt-2 text-3xl font-black">
          Anything we should be gentle with?
        </h1>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {injuryAreas.map((area) => {
          const selected = draft.injuries.some(
            (item) => item.area === area.id && item.active,
          );
          return (
            <button
              className={`min-h-12 rounded-lg border px-3 text-left font-black ${
                selected
                  ? "border-emerald-900 bg-emerald-900 text-white"
                  : "border-stone-200 bg-white text-stone-700"
              }`}
              key={area.id}
              onClick={() => toggleInjury(draft, setDraft, area.id)}
              type="button"
            >
              {area.label}
            </button>
          );
        })}
      </div>
      <p className="leading-7 text-stone-600">
        Pain is never something to push through. If something hurts later, the
        app will swap it or back it off.
      </p>
    </div>
  );
}

function ProgramStep({ program }: { program: Program }) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-extrabold uppercase tracking-wider text-orange-600">
          Recommended plan
        </p>
        <h1 className="mt-2 text-3xl font-black">{program.name}</h1>
      </div>
      <p className="leading-7 text-stone-600">{program.description}</p>
      <div className="grid grid-cols-2 gap-3">
        <InfoCard label="Days each week" value={String(program.daysPerWeek)} />
        <InfoCard label="Level" value={program.difficulty} />
      </div>
      <p className="rounded-lg bg-emerald-50 p-4 font-bold leading-7 text-emerald-950">
        We can change this later. For now, this gives the app a safe programme
        to start remembering.
      </p>
    </div>
  );
}

function ChoiceStep<T extends string>({
  eyebrow,
  title,
  items,
  selected,
  onSelect,
}: {
  eyebrow: string;
  title: string;
  items: { id: T; label: string; helper: string }[];
  selected: T;
  onSelect: (value: T) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-extrabold uppercase tracking-wider text-orange-600">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-3xl font-black">{title}</h1>
      </div>
      <div className="grid gap-3">
        {items.map((item) => (
          <button
            className={`rounded-lg border p-4 text-left ${
              selected === item.id
                ? "border-emerald-900 bg-emerald-900 text-white"
                : "border-stone-200 bg-white"
            }`}
            key={item.id}
            onClick={() => onSelect(item.id)}
            type="button"
          >
            <strong className="block text-lg">{item.label}</strong>
            <span
              className={
                selected === item.id ? "text-emerald-50" : "text-stone-600"
              }
            >
              {item.helper}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function TodayScreen({ profile }: { profile: UserProfile }) {
  const program = getProgram(profile.programId) ?? Object.values(PROGRAMS)[0];
  const templates = getTemplatesForProgram(program.id);
  const today = getTodayWorkout(profile, templates);
  const template = today.templateId ? getTemplate(today.templateId) : null;
  const contextOptions = [
    profile.equipment.home ? ("home" as const) : null,
    profile.equipment.gym ? ("gym" as const) : null,
  ].filter((item): item is "home" | "gym" => Boolean(item));
  const [context, setContext] = useState<"home" | "gym">(
    contextOptions[0] ?? "home",
  );
  const [coachNote, setCoachNote] = useState("");
  const [activeWorkout, setActiveWorkout] = useState(false);

  if (template && activeWorkout) {
    return (
      <GuidedWorkout
        context={context}
        onExit={(message) => {
          setActiveWorkout(false);
          setCoachNote(message);
        }}
        profile={profile}
        template={template}
      />
    );
  }

  return (
    <section className="flex flex-1 flex-col gap-5">
      <header className="space-y-2">
        <p className="text-xs font-extrabold uppercase tracking-wider text-orange-600">
          {profile.name ? `${profile.name}'s coach` : "Your coach for today"}
        </p>
        <h1 className="text-4xl font-black leading-tight">
          {today.isTrainingDay
            ? "Today's workout is ready."
            : "Today is a rest day."}
        </h1>
      </header>

      <article className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm">
        <img
          alt="Athlete training in a bright gym"
          className="h-56 w-full object-cover"
          src="/assets/fitness-coach-hero.png"
        />
        <div className="space-y-4 p-5">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-orange-600">
              {program.name}
            </p>
            <h2 className="mt-1 text-2xl font-black">
              {template?.dayLabel ?? "Recovery day"}
            </h2>
          </div>
          <p className="leading-7 text-stone-600">
            {template
              ? `Day ${today.templateNumber} of your programme. Estimated ${template.estimatedMinutes} minutes, built for ${profile.sessionLengthMinutes}-minute sessions.`
              : `Next training day is ${today.nextTrainingDay}. Keep it easy today: walk, stretch, or simply recover.`}
          </p>
          <div className="grid grid-cols-3 gap-2">
            <InfoCard
              label="Context"
              value={contextOptions.length > 1 ? "Home/Gym" : context}
            />
            <InfoCard label="Days/week" value={String(program.daysPerWeek)} />
            <InfoCard label="Level" value={profile.experienceLevel} />
          </div>
          {contextOptions.length > 1 && (
            <div className="grid grid-cols-2 gap-2 rounded-lg bg-stone-100 p-1">
              {contextOptions.map((option) => (
                <button
                  className={`min-h-11 rounded-md font-black capitalize ${
                    context === option
                      ? "bg-white text-emerald-950 shadow-sm"
                      : "text-stone-500"
                  }`}
                  key={option}
                  onClick={() => setContext(option)}
                  type="button"
                >
                  {option}
                </button>
              ))}
            </div>
          )}
          <button
            className="min-h-12 w-full rounded-lg bg-emerald-900 px-4 font-black text-white"
            onClick={() =>
              template
                ? setActiveWorkout(true)
                : setCoachNote(
                    "Today is for recovery. The next build step will show the next training day.",
                  )
            }
            type="button"
          >
            {template ? "Start workout" : "View next workout"}
          </button>
          <button
            className="min-h-12 w-full rounded-lg bg-emerald-50 px-4 font-black text-emerald-950"
            onClick={() =>
              setCoachNote(
                "Easier swaps will use bodyweight substitutes from the exercise library in the guided workout.",
              )
            }
            type="button"
          >
            Swap for easier session
          </button>
          {coachNote && (
            <p className="rounded-lg bg-orange-50 p-3 text-sm font-bold leading-6 text-orange-950">
              {coachNote}
            </p>
          )}
        </div>
      </article>

      <section className="grid gap-3">
        <h2 className="text-xl font-black">Today's exercises</h2>
        {template ? (
          template.blocks.flatMap((block) =>
            block.exercises.slice(0, 4).map((plannedExercise) => {
              const exercise = getExercise(plannedExercise.exerciseId);
              return (
                <article
                  className="rounded-lg border border-stone-200 bg-white p-4"
                  key={`${block.id}-${plannedExercise.exerciseId}`}
                >
                  <strong>
                    {exercise?.name ??
                      plannedExercise.exerciseId.replaceAll("-", " ")}
                  </strong>
                  <p className="mt-1 text-sm font-bold text-stone-500">
                    {plannedExercise.sets} sets · {plannedExercise.repRange.min}
                    -{plannedExercise.repRange.max} reps
                  </p>
                  {exercise?.coachingCues[0] && (
                    <p className="mt-2 text-sm leading-6 text-stone-600">
                      {exercise.coachingCues[0]}
                    </p>
                  )}
                </article>
              );
            }),
          )
        ) : (
          <p className="rounded-lg border border-stone-200 bg-white p-4 leading-7 text-stone-600">
            No workout today. That is part of the plan, not a missed day.
          </p>
        )}
      </section>
    </section>
  );
}

type LoggedExercise = {
  exerciseId: string;
  outcome: ExerciseOutcome;
};

function GuidedWorkout({
  context,
  onExit,
  profile,
  template,
}: {
  context: "home" | "gym";
  onExit: (message: string) => void;
  profile: UserProfile;
  template: WorkoutTemplate;
}) {
  const plannedExercises = useMemo(
    () => flattenTemplateExercises(template),
    [template],
  );
  const [startedAt] = useState(() => new Date().toISOString());
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [phase, setPhase] = useState<"exercise" | "rest" | "complete">(
    "exercise",
  );
  const [results, setResults] = useState<LoggedExercise[]>([]);
  const [overallEffort, setOverallEffort] = useState<
    1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  >(7);
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const plannedExercise = plannedExercises[exerciseIndex];
  const exercise = plannedExercise
    ? getExercise(plannedExercise.exerciseId)
    : null;
  const nextPlannedExercise = plannedExercises[exerciseIndex + 1];
  const nextExercise = nextPlannedExercise
    ? getExercise(nextPlannedExercise.exerciseId)
    : null;
  const completedCount = results.filter(
    (result) => result.outcome === "completed",
  ).length;

  function logExercise(outcome: ExerciseOutcome) {
    if (!plannedExercise) return;
    const nextResults = [
      ...results.filter(
        (result) => result.exerciseId !== plannedExercise.exerciseId,
      ),
      { exerciseId: plannedExercise.exerciseId, outcome },
    ];
    setResults(nextResults);

    if (exerciseIndex >= plannedExercises.length - 1) {
      setPhase("complete");
      return;
    }

    setPhase("rest");
  }

  async function saveWorkout() {
    const sessionId = crypto.randomUUID();
    const now = new Date().toISOString();
    setIsSaving(true);
    await repository.saveSession({
      id: sessionId,
      userId: profile.id,
      templateId: template.id,
      context,
      startedAt,
      completedAt: now,
      status: results.some((result) => result.outcome !== "completed")
        ? "partial"
        : "completed",
      durationMinutes: Math.max(
        1,
        Math.round((Date.parse(now) - Date.parse(startedAt)) / 60000),
      ),
      overallEffort,
      notes: notes.trim() || undefined,
      painReported: false,
      exerciseResults: plannedExercises.map((item, index) => {
        const result = results.find(
          (logged) => logged.exerciseId === item.exerciseId,
        );
        return {
          id: `${sessionId}-${index + 1}`,
          exerciseId: item.exerciseId,
          outcome: result?.outcome ?? "skipped",
          setResults: [],
        };
      }),
    });
    setIsSaving(false);
    onExit(
      `Workout saved. ${completedCount} of ${plannedExercises.length} exercises were marked complete.`,
    );
  }

  if (phase === "complete") {
    const skippedCount = results.filter(
      (result) => result.outcome === "skipped",
    ).length;
    const tooHardCount = results.filter(
      (result) => result.outcome === "too_hard",
    ).length;

    return (
      <section className="flex flex-1 flex-col gap-5">
        <header>
          <p className="text-xs font-extrabold uppercase tracking-wider text-orange-600">
            Workout complete
          </p>
          <h1 className="mt-2 text-4xl font-black leading-tight">
            Nice work. Let&apos;s remember this.
          </h1>
        </header>

        <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-3 gap-2">
            <InfoCard
              label="Complete"
              value={`${completedCount}/${plannedExercises.length}`}
            />
            <InfoCard label="Too hard" value={String(tooHardCount)} />
            <InfoCard label="Skipped" value={String(skippedCount)} />
          </div>

          <label className="mt-5 block text-sm font-black text-stone-700">
            Overall effort: {overallEffort} out of 10
            <input
              className="mt-3 w-full accent-emerald-900"
              max="10"
              min="1"
              onChange={(event) =>
                setOverallEffort(
                  Number(event.target.value) as typeof overallEffort,
                )
              }
              type="range"
              value={overallEffort}
            />
          </label>

          <label className="mt-5 block text-sm font-black text-stone-700">
            Optional note
            <textarea
              className="mt-2 min-h-28 w-full rounded-lg border border-stone-200 p-3 text-base font-medium"
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Anything to remember for next time?"
              value={notes}
            />
          </label>
        </article>

        <button
          className="min-h-12 rounded-lg bg-emerald-900 px-4 font-black text-white disabled:opacity-50"
          disabled={isSaving}
          onClick={saveWorkout}
          type="button"
        >
          {isSaving ? "Saving..." : "Save workout"}
        </button>
      </section>
    );
  }

  if (phase === "rest") {
    return (
      <section className="flex flex-1 flex-col justify-center gap-5">
        <header>
          <p className="text-xs font-extrabold uppercase tracking-wider text-orange-600">
            Rest
          </p>
          <h1 className="mt-2 text-5xl font-black leading-tight">
            {plannedExercise?.restSeconds ?? 60}s
          </h1>
        </header>
        <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-black uppercase tracking-wide text-stone-500">
            Next exercise
          </p>
          <h2 className="mt-2 text-2xl font-black">
            {nextExercise?.name ?? "Finish"}
          </h2>
          {nextPlannedExercise && (
            <p className="mt-2 font-bold text-stone-500">
              {nextPlannedExercise.sets} sets ·{" "}
              {nextPlannedExercise.repRange.min}-
              {nextPlannedExercise.repRange.max} reps
            </p>
          )}
        </article>
        <button
          className="min-h-12 rounded-lg bg-emerald-900 px-4 font-black text-white"
          onClick={() => {
            setExerciseIndex((current) => current + 1);
            setPhase("exercise");
          }}
          type="button"
        >
          Continue
        </button>
      </section>
    );
  }

  return (
    <section className="flex flex-1 flex-col gap-5">
      <header>
        <p className="text-xs font-extrabold uppercase tracking-wider text-orange-600">
          Exercise {exerciseIndex + 1} of {plannedExercises.length} · {context}
        </p>
        <h1 className="mt-2 text-4xl font-black leading-tight">
          {exercise?.name ?? "Exercise"}
        </h1>
        <p className="mt-2 text-stone-600">
          {plannedExercise?.sets} sets · {plannedExercise?.repRange.min}-
          {plannedExercise?.repRange.max} reps · {plannedExercise?.restSeconds}s
          rest
        </p>
      </header>

      <article className="space-y-5 rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-stone-500">
            How to do it
          </p>
          <p className="mt-2 text-lg font-bold leading-7 text-stone-800">
            {exercise?.executionSteps[0] ??
              plannedExercise?.notes ??
              "Move with control and stop if anything hurts."}
          </p>
        </div>

        <div>
          <p className="text-sm font-black uppercase tracking-wide text-stone-500">
            Coach cues
          </p>
          <ul className="mt-2 grid gap-2">
            {(exercise?.coachingCues ?? []).slice(0, 3).map((cue) => (
              <li
                className="rounded-lg bg-stone-100 p-3 font-bold leading-6"
                key={cue}
              >
                {cue}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg bg-emerald-50 p-4">
          <p className="text-sm font-black uppercase tracking-wide text-emerald-950">
            Easier option
          </p>
          <p className="mt-1 font-bold leading-6 text-emerald-950">
            {getVariationName(exercise?.easierVariation) ??
              getVariationName(exercise?.bodyweightSubstitute) ??
              "Reduce the reps or move more slowly with a shorter range."}
          </p>
        </div>

        <div className="rounded-lg bg-orange-50 p-4">
          <p className="text-sm font-black uppercase tracking-wide text-orange-950">
            Safety note
          </p>
          <p className="mt-1 font-bold leading-6 text-orange-950">
            {exercise?.safetyNotes?.[0] ?? "Stop if you feel sharp pain."}
          </p>
        </div>
      </article>

      <div className="grid gap-3">
        <button
          className="min-h-12 rounded-lg bg-emerald-900 px-4 font-black text-white"
          onClick={() => logExercise("completed")}
          type="button"
        >
          Done
        </button>
        <div className="grid grid-cols-2 gap-3">
          <button
            className="min-h-12 rounded-lg bg-orange-50 px-4 font-black text-orange-950"
            onClick={() => logExercise("too_hard")}
            type="button"
          >
            Too hard
          </button>
          <button
            className="min-h-12 rounded-lg bg-stone-200 px-4 font-black text-stone-700"
            onClick={() => logExercise("skipped")}
            type="button"
          >
            Skip
          </button>
        </div>
      </div>
    </section>
  );
}

function ProgressScreen() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);

  useEffect(() => {
    repository.listSessions({ limit: 20 }).then(setSessions);
  }, []);

  const completedThisWeek = sessions.filter(
    (session) =>
      session.completedAt && session.completedAt >= weekStartIsoDate(),
  ).length;
  const tooHardCount = sessions
    .flatMap((session) => session.exerciseResults)
    .filter((result) => result.outcome === "too_hard").length;
  const latestSession = sessions[0];
  const latestTemplate = latestSession
    ? getTemplate(latestSession.templateId)
    : null;

  return (
    <section className="space-y-5">
      <header>
        <p className="text-xs font-extrabold uppercase tracking-wider text-orange-600">
          Progress
        </p>
        <h1 className="mt-2 text-4xl font-black leading-tight">
          Your coach will learn from each session.
        </h1>
      </header>
      <div className="grid gap-3">
        <InfoCard
          label="Completed this week"
          value={`${completedThisWeek} workout${completedThisWeek === 1 ? "" : "s"}`}
        />
        <InfoCard
          label="Exercises marked hard"
          value={tooHardCount ? String(tooHardCount) : "None yet"}
        />
        <InfoCard
          label="Suggested next action"
          value={
            sessions.length
              ? "Repeat the next planned session"
              : "Start your first workout"
          }
        />
      </div>
      <section className="space-y-3">
        <h2 className="text-xl font-black">Recent sessions</h2>
        {sessions.length ? (
          sessions.slice(0, 5).map((session) => (
            <article
              className="rounded-lg border border-stone-200 bg-white p-4"
              key={session.id}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-black">
                    {getTemplate(session.templateId)?.dayLabel ??
                      session.templateId}
                  </h3>
                  <p className="mt-1 text-sm font-bold text-stone-500">
                    {new Date(session.startedAt).toLocaleDateString()} ·{" "}
                    {session.context}
                  </p>
                </div>
                <span className="rounded-md bg-stone-100 px-2 py-1 text-xs font-black capitalize">
                  {session.status}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-stone-600">
                {
                  session.exerciseResults.filter(
                    (result) => result.outcome === "completed",
                  ).length
                }{" "}
                of {session.exerciseResults.length} exercises complete
                {session.overallEffort
                  ? ` · effort ${session.overallEffort}/10`
                  : ""}
              </p>
              {session.notes && (
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  {session.notes}
                </p>
              )}
            </article>
          ))
        ) : (
          <p className="rounded-lg border border-stone-200 bg-white p-4 leading-7 text-stone-600">
            Finish a guided workout and it will appear here automatically.
          </p>
        )}
      </section>
      {latestTemplate && (
        <p className="rounded-lg bg-emerald-50 p-4 font-bold leading-7 text-emerald-950">
          Last saved: {latestTemplate.dayLabel}. The weight-by-set progression
          engine is the next major build step.
        </p>
      )}
    </section>
  );
}

function LibraryScreen() {
  const exercises = Object.values(EXERCISES).slice(0, 12);
  return (
    <section className="space-y-5">
      <header>
        <p className="text-xs font-extrabold uppercase tracking-wider text-orange-600">
          {Object.keys(EXERCISES).length} exercises loaded
        </p>
        <h1 className="mt-2 text-4xl font-black">Exercise Library</h1>
        <p className="mt-2 leading-7 text-stone-600">
          A starter view of the guidance library. Filters and full exercise
          detail pages are next.
        </p>
      </header>
      <div className="grid gap-3">
        {exercises.map((exercise) => (
          <article
            className="rounded-lg border border-stone-200 bg-white p-4"
            key={exercise.id}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-black">{exercise.name}</h2>
                <p className="mt-1 text-sm font-bold capitalize text-stone-500">
                  {exercise.movementPattern.replaceAll("_", " ")}
                </p>
              </div>
              <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-black text-emerald-950">
                Level {exercise.difficulty}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-stone-600">
              {exercise.coachingCues[0]}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function SettingsScreen({ profile }: { profile: UserProfile }) {
  return (
    <section className="space-y-5">
      <header>
        <p className="text-xs font-extrabold uppercase tracking-wider text-orange-600">
          Settings
        </p>
        <h1 className="mt-2 text-4xl font-black">Your setup</h1>
      </header>
      <article className="rounded-lg border border-stone-200 bg-white p-4">
        <dl className="grid gap-3">
          <SettingRow label="Goal" value={profile.goal.replaceAll("_", " ")} />
          <SettingRow
            label="Program"
            value={getProgram(profile.programId)?.name ?? profile.programId}
          />
          <SettingRow label="Units" value={profile.units} />
          <SettingRow
            label="Home equipment"
            value={profile.equipment.home ? "Configured" : "Not used"}
          />
          <SettingRow
            label="Gym equipment"
            value={profile.equipment.gym ? "Standard gym" : "Not used"}
          />
        </dl>
      </article>
    </section>
  );
}

function PlaceholderScreen({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="flex flex-1 flex-col justify-center gap-3">
      <p className="text-xs font-extrabold uppercase tracking-wider text-orange-600">
        Coming next
      </p>
      <h1 className="text-4xl font-black">{title}</h1>
      <p className="leading-7 text-stone-600">
        {subtitle ??
          "This screen will be implemented as the MVP phases progress."}
      </p>
    </section>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-stone-100 p-3">
      <span className="block text-xs font-black uppercase tracking-wide text-stone-500">
        {label}
      </span>
      <strong className="mt-1 block capitalize">{value}</strong>
    </div>
  );
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-stone-100 pb-3 last:border-0 last:pb-0">
      <dt className="font-bold text-stone-500">{label}</dt>
      <dd className="text-right font-black capitalize">{value}</dd>
    </div>
  );
}

function ToggleCard({
  checked,
  helper,
  label,
  onChange,
}: {
  checked: boolean;
  helper?: string;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      className={`w-full rounded-lg border p-4 text-left ${
        checked
          ? "border-emerald-900 bg-emerald-900 text-white"
          : "border-stone-200 bg-white"
      }`}
      onClick={() => onChange(!checked)}
      type="button"
    >
      <strong className="block">{label}</strong>
      {helper && (
        <span className={checked ? "text-emerald-50" : "text-stone-600"}>
          {helper}
        </span>
      )}
    </button>
  );
}

function toggleDay(
  draft: OnboardingDraft,
  setDraft: (draft: OnboardingDraft) => void,
  day: Weekday,
) {
  const selected = draft.availableDays.includes(day);
  const nextDays = selected
    ? draft.availableDays.filter((item) => item !== day)
    : [...draft.availableDays, day];
  setDraft({ ...draft, availableDays: nextDays.length ? nextDays : [day] });
}

function toggleInjury(
  draft: OnboardingDraft,
  setDraft: (draft: OnboardingDraft) => void,
  area: InjuryFlag["area"],
) {
  const selected = draft.injuries.some(
    (item) => item.area === area && item.active,
  );
  const next = selected
    ? draft.injuries.filter((item) => item.area !== area)
    : [...draft.injuries, { area, active: true }];
  setDraft({ ...draft, injuries: next });
}

function flattenTemplateExercises(
  template: WorkoutTemplate,
): PlannedExercise[] {
  return template.blocks.flatMap((block) => block.exercises);
}

function getVariationName(id?: string): string | null {
  if (!id) return null;
  return getExercise(id)?.name ?? null;
}

function weekStartIsoDate(): string {
  const today = new Date();
  const mondayOffset = (today.getDay() + 6) % 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - mondayOffset);
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString();
}

function getTodayWorkout(
  profile: UserProfile,
  templates: ReturnType<typeof getTemplatesForProgram>,
) {
  const today = weekdayFromDate(new Date());
  const dayIndex = profile.availableDays.indexOf(today);
  const nextTrainingDay = profile.availableDays[0] ?? "mon";

  if (dayIndex === -1 || templates.length === 0) {
    return {
      isTrainingDay: false,
      nextTrainingDay,
      templateId: null,
      templateNumber: 0,
    };
  }

  const template = templates[dayIndex % templates.length];
  return {
    isTrainingDay: true,
    nextTrainingDay: today,
    templateId: template.id,
    templateNumber: (dayIndex % templates.length) + 1,
  };
}

function weekdayFromDate(date: Date): Weekday {
  return ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][
    date.getDay()
  ] as Weekday;
}
