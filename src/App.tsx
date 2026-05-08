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
  buildProgressionState,
  getLastExerciseResult,
  recommendExercise,
} from "@/lib/progression";
import {
  DEFAULT_DRAFT,
  type OnboardingDraft,
  createHomeEquipmentProfile,
  createProfileFromDraft,
  createStandardGymProfile,
  parseWeights,
  recommendProgramForDraft,
} from "@/lib/profile";
import { estimateStartingWeight } from "@/lib/weights";
import type {
  BodyMetric,
  DailyCheckIn,
  EffortBand,
  EquipmentProfile,
  EquipmentRequirement,
  Exercise,
  ExerciseOutcome,
  ExerciseResult,
  Goal,
  InjuryFlag,
  MovementPattern,
  PlannedExercise,
  Program,
  ProgressionRecommendation,
  SetResult,
  UserProfile,
  Weekday,
  WorkoutDraft,
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

const effortOptions: { id: EffortBand; label: string }[] = [
  { id: "easy", label: "Easy" },
  { id: "just_right", label: "Just right" },
  { id: "hard", label: "Hard" },
];

const metricScaleOptions = [1, 2, 3, 4, 5] as const;

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
          <Route
            path="/progress"
            element={<ProgressScreen profile={profile} />}
          />
          <Route
            path="/library"
            element={<LibraryScreen profile={profile} />}
          />
          <Route
            path="/settings"
            element={
              <SettingsScreen onProfileChange={setProfile} profile={profile} />
            }
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
  const weeklyPlan = templates.slice(0, program.daysPerWeek);
  const contextOptions = [
    profile.equipment.home ? ("home" as const) : null,
    profile.equipment.gym ? ("gym" as const) : null,
  ].filter((item): item is "home" | "gym" => Boolean(item));
  const [context, setContext] = useState<"home" | "gym">(
    contextOptions[0] ?? "home",
  );
  const [coachNote, setCoachNote] = useState("");
  const [activeWorkout, setActiveWorkout] = useState(false);
  const [savedDraft, setSavedDraft] = useState<WorkoutDraft | null>(null);
  const canResumeDraft =
    Boolean(template) &&
    savedDraft?.userId === profile.id &&
    savedDraft?.templateId === template?.id &&
    savedDraft?.context === context;

  useEffect(() => {
    repository.getWorkoutDraft().then(setSavedDraft);
  }, [activeWorkout]);

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
          {canResumeDraft && (
            <button
              className="min-h-12 w-full rounded-lg bg-orange-50 px-4 font-black text-orange-950"
              onClick={() => setActiveWorkout(true)}
              type="button"
            >
              Resume saved workout
            </button>
          )}
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

      <section className="grid gap-3">
        <div>
          <h2 className="text-xl font-black">This week&apos;s plan</h2>
          <p className="mt-1 text-sm font-bold leading-6 text-stone-500">
            This is the order your coach will follow on your selected training
            days.
          </p>
        </div>
        {weeklyPlan.map((planTemplate, index) => {
          const isToday = planTemplate.id === template?.id;
          const exerciseNames = flattenTemplateExercises(planTemplate)
            .slice(0, 3)
            .map((plannedExercise) => getExercise(plannedExercise.exerciseId))
            .filter((exercise): exercise is Exercise => Boolean(exercise))
            .map((exercise) => exercise.name);

          return (
            <article
              className={`rounded-lg border p-4 ${
                isToday
                  ? "border-emerald-900 bg-emerald-50"
                  : "border-stone-200 bg-white"
              }`}
              key={planTemplate.id}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-stone-500">
                    {scheduledDayForTemplate(profile, index)}
                  </p>
                  <h3 className="mt-1 font-black">{planTemplate.dayLabel}</h3>
                </div>
                <span className="rounded-md bg-white px-2 py-1 text-xs font-black text-stone-600">
                  {planTemplate.estimatedMinutes} min
                </span>
              </div>
              <p className="mt-2 text-sm font-bold leading-6 text-stone-600">
                {exerciseNames.join(", ")}
                {flattenTemplateExercises(planTemplate).length > 3
                  ? ", ..."
                  : ""}
              </p>
            </article>
          );
        })}
      </section>
    </section>
  );
}

type LoggedExercise = {
  instanceId: string;
  exerciseId: string;
  outcome: ExerciseOutcome;
  painArea?: InjuryFlag["area"];
  substitutedFrom?: string;
  setResults: SetResult[];
};

type ResolvedPlannedExercise = PlannedExercise & {
  instanceId: string;
  substitutedFrom?: string;
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
  const activeEquipment = profile.equipment[context];
  const plannedExercises = useMemo(
    () =>
      flattenTemplateExercises(template)
        .map((item, index) =>
          resolvePlannedExercise(
            item,
            activeEquipment,
            `${item.exerciseId}-${index}`,
          ),
        )
        .filter((item): item is ResolvedPlannedExercise => Boolean(item)),
    [activeEquipment, template],
  );
  const [startedAt, setStartedAt] = useState(() => new Date().toISOString());
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [setIndex, setSetIndex] = useState(0);
  const [phase, setPhase] = useState<WorkoutDraft["phase"]>("exercise");
  const [results, setResults] = useState<LoggedExercise[]>([]);
  const [repsInput, setRepsInput] = useState("");
  const [weightInput, setWeightInput] = useState("");
  const [effort, setEffort] = useState<EffortBand>("just_right");
  const [painArea, setPainArea] = useState<InjuryFlag["area"]>("lower_back");
  const [recommendations, setRecommendations] = useState<
    Record<string, ProgressionRecommendation>
  >({});
  const [overallEffort, setOverallEffort] = useState<
    1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  >(7);
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [restRemaining, setRestRemaining] = useState(60);
  const [restMode, setRestMode] = useState<"set" | "exercise">("exercise");
  const plannedExercise = plannedExercises[exerciseIndex];
  const exercise = plannedExercise
    ? getExercise(plannedExercise.exerciseId)
    : null;
  const nextPlannedExercise = plannedExercises[exerciseIndex + 1];
  const nextExercise = nextPlannedExercise
    ? getExercise(nextPlannedExercise.exerciseId)
    : null;
  const recommendation = plannedExercise
    ? recommendations[plannedExercise.exerciseId]
    : undefined;
  const suggestedRepRange =
    recommendation?.suggestedReps ?? plannedExercise?.repRange;
  const suggestedWeight =
    recommendation?.suggestedWeight ??
    (exercise
      ? estimateStartingWeight(
          exercise,
          activeEquipment,
          profile.experienceLevel,
        )
      : undefined);
  const currentResult = plannedExercise
    ? results.find((result) => result.instanceId === plannedExercise.instanceId)
    : undefined;
  const loggedSets = currentResult?.setResults ?? [];
  const totalSets = plannedExercise?.sets ?? 0;
  const completedSetCount = results.reduce(
    (total, result) =>
      total + result.setResults.filter((set) => set.completed).length,
    0,
  );

  useEffect(() => {
    if (!plannedExercise) return;
    setRepsInput(
      String(suggestedRepRange?.max ?? plannedExercise.repRange.max),
    );
    setWeightInput(suggestedWeight ? String(suggestedWeight) : "");
    setEffort("just_right");
  }, [
    exerciseIndex,
    plannedExercise,
    setIndex,
    suggestedRepRange?.max,
    suggestedWeight,
  ]);

  useEffect(() => {
    let cancelled = false;

    async function loadRecommendations() {
      const sessions = await repository.listSessions({ limit: 100 });
      const nextRecommendations: Record<string, ProgressionRecommendation> = {};

      for (const item of plannedExercises) {
        const itemExercise = getExercise(item.exerciseId);
        if (!itemExercise) continue;

        nextRecommendations[item.exerciseId] = recommendExercise({
          equipment: activeEquipment,
          exercise: itemExercise,
          experienceLevel: profile.experienceLevel,
          lastResult: getLastExerciseResult(sessions, item.exerciseId),
          plannedExercise: item,
        });
      }

      if (!cancelled) setRecommendations(nextRecommendations);
    }

    loadRecommendations();
    return () => {
      cancelled = true;
    };
  }, [activeEquipment, plannedExercises, profile.experienceLevel]);

  useEffect(() => {
    let cancelled = false;
    setDraftLoaded(false);

    async function loadDraft() {
      const draft = await repository.getWorkoutDraft();
      if (cancelled) return;

      if (
        draft?.userId === profile.id &&
        draft.templateId === template.id &&
        draft.context === context
      ) {
        setStartedAt(draft.startedAt);
        setExerciseIndex(
          Math.min(
            draft.exerciseIndex,
            Math.max(plannedExercises.length - 1, 0),
          ),
        );
        setSetIndex(Math.max(draft.setIndex, 0));
        setPhase(draft.phase);
        setRestMode(draft.restMode ?? "exercise");
        setResults(draft.results);
        setOverallEffort(draft.overallEffort ?? 7);
        setNotes(draft.notes ?? "");
      }

      setDraftLoaded(true);
    }

    loadDraft();
    return () => {
      cancelled = true;
    };
  }, [context, plannedExercises.length, profile.id, template.id]);

  useEffect(() => {
    if (!draftLoaded) return;

    repository.saveWorkoutDraft({
      userId: profile.id,
      templateId: template.id,
      context,
      startedAt,
      exerciseIndex,
      setIndex,
      phase,
      restMode,
      results,
      overallEffort,
      notes: notes.trim() || undefined,
      updatedAt: new Date().toISOString(),
    });
  }, [
    context,
    draftLoaded,
    exerciseIndex,
    overallEffort,
    notes,
    phase,
    profile.id,
    results,
    restMode,
    setIndex,
    startedAt,
    template.id,
  ]);

  useEffect(() => {
    if (phase === "rest") {
      setRestRemaining(plannedExercise?.restSeconds ?? 60);
    }
  }, [phase, plannedExercise?.restSeconds]);

  useEffect(() => {
    if (phase !== "rest") return;
    if (restRemaining <= 0) {
      continueAfterRest();
      return;
    }

    const timeout = window.setTimeout(() => {
      setRestRemaining((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => window.clearTimeout(timeout);
  }, [phase, restRemaining]);

  function upsertResult(nextResult: LoggedExercise) {
    setResults((current) => [
      ...current.filter(
        (result) => result.instanceId !== nextResult.instanceId,
      ),
      nextResult,
    ]);
  }

  function advanceAfterExercise() {
    setSetIndex(0);
    if (exerciseIndex >= plannedExercises.length - 1) {
      setPhase("complete");
      return;
    }

    setRestMode("exercise");
    setPhase("rest");
  }

  function continueAfterRest() {
    if (restMode === "set") {
      setSetIndex((current) => current + 1);
      setPhase("exercise");
      return;
    }

    setExerciseIndex((current) =>
      Math.min(current + 1, plannedExercises.length - 1),
    );
    setSetIndex(0);
    setPhase("exercise");
  }

  function saveSet() {
    if (!plannedExercise) return;
    const actualReps = Math.max(0, Number(repsInput) || 0);
    const enteredWeight = weightInput.trim() ? Number(weightInput) : undefined;
    const actualWeight = Number.isFinite(enteredWeight)
      ? enteredWeight
      : undefined;
    const nextSet: SetResult = {
      setNumber: setIndex + 1,
      targetReps: suggestedRepRange ?? plannedExercise.repRange,
      actualReps,
      targetWeight: suggestedWeight,
      actualWeight,
      unit: actualWeight ? profile.units : undefined,
      effort,
      completed: actualReps > 0,
      loggedAt: new Date().toISOString(),
    };
    const nextSetResults = [
      ...loggedSets.filter((set) => set.setNumber !== nextSet.setNumber),
      nextSet,
    ].sort((a, b) => a.setNumber - b.setNumber);

    upsertResult({
      instanceId: plannedExercise.instanceId,
      exerciseId: plannedExercise.exerciseId,
      outcome:
        nextSetResults.length >= plannedExercise.sets ? "completed" : "partial",
      substitutedFrom: plannedExercise.substitutedFrom,
      setResults: nextSetResults,
    });

    if (setIndex >= plannedExercise.sets - 1) {
      advanceAfterExercise();
      return;
    }

    setRestMode("set");
    setPhase("rest");
  }

  function logExercise(outcome: ExerciseOutcome) {
    if (!plannedExercise) return;
    upsertResult({
      instanceId: plannedExercise.instanceId,
      exerciseId: plannedExercise.exerciseId,
      outcome,
      substitutedFrom: plannedExercise.substitutedFrom,
      setResults: loggedSets,
    });
    advanceAfterExercise();
  }

  function logPain() {
    if (!plannedExercise) return;
    upsertResult({
      instanceId: plannedExercise.instanceId,
      exerciseId: plannedExercise.exerciseId,
      outcome: "pain",
      painArea,
      substitutedFrom: plannedExercise.substitutedFrom,
      setResults: loggedSets,
    });
    advanceAfterExercise();
  }

  function finalExerciseResults(sessionId: string) {
    return plannedExercises.map((item, index) => {
      const result = results.find(
        (logged) => logged.instanceId === item.instanceId,
      );
      return {
        id: `${sessionId}-${index + 1}`,
        exerciseId: item.exerciseId,
        outcome: result?.outcome ?? "skipped",
        painArea: result?.painArea,
        substitutedFrom: result?.substitutedFrom,
        setResults: result?.setResults ?? [],
      };
    });
  }

  async function saveWorkout() {
    const sessionId = crypto.randomUUID();
    const now = new Date().toISOString();
    const exerciseResults = finalExerciseResults(sessionId);
    setIsSaving(true);
    await repository.saveSession({
      id: sessionId,
      userId: profile.id,
      templateId: template.id,
      context,
      startedAt,
      completedAt: now,
      status: exerciseResults.some((result) => result.outcome !== "completed")
        ? "partial"
        : "completed",
      durationMinutes: Math.max(
        1,
        Math.round((Date.parse(now) - Date.parse(startedAt)) / 60000),
      ),
      overallEffort,
      notes: notes.trim() || undefined,
      painReported: exerciseResults.some((result) => result.outcome === "pain"),
      exerciseResults,
    });
    for (const [index, result] of exerciseResults.entries()) {
      const item = plannedExercises[index];
      if (!item || result.setResults.length === 0) continue;

      const lastState = await repository.getProgressionState(result.exerciseId);
      await repository.saveProgressionState(
        buildProgressionState({
          exerciseId: result.exerciseId,
          lastState,
          plannedExercise: item,
          recommendation: recommendations[result.exerciseId] ?? {
            action: "hold",
            suggestedReps: item.repRange,
            reason: "Saved from this workout.",
          },
          result,
          sessionCompletedAt: now,
        }),
      );
    }
    await repository.clearWorkoutDraft();
    setIsSaving(false);
    onExit(
      `Workout saved. ${completedSetCount} sets were logged across ${plannedExercises.length} exercises.`,
    );
  }

  if (!plannedExercise) {
    return (
      <section className="flex flex-1 flex-col justify-center gap-5">
        <header>
          <p className="text-xs font-extrabold uppercase tracking-wider text-orange-600">
            No exercises available
          </p>
          <h1 className="mt-2 text-4xl font-black leading-tight">
            This workout does not fit the selected equipment.
          </h1>
          <p className="mt-2 leading-7 text-stone-600">
            Try switching context or editing equipment in Settings.
          </p>
        </header>
        <button
          className="min-h-12 rounded-lg bg-emerald-900 px-4 font-black text-white"
          onClick={() =>
            onExit(
              "No available exercises for that context. Try a different setup.",
            )
          }
          type="button"
        >
          Back to today
        </button>
      </section>
    );
  }

  if (phase === "complete") {
    const skippedCount = results.filter(
      (result) => result.outcome === "skipped",
    ).length;
    const tooHardCount = results.filter(
      (result) => result.outcome === "too_hard",
    ).length;
    const totalPlannedSets = plannedExercises.reduce(
      (total, item) => total + item.sets,
      0,
    );
    const totalVolume = results
      .flatMap((result) => result.setResults)
      .reduce(
        (total, set) => total + (set.actualWeight ?? 0) * set.actualReps,
        0,
      );

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
              label="Sets logged"
              value={`${completedSetCount}/${totalPlannedSets}`}
            />
            <InfoCard label="Too hard" value={String(tooHardCount)} />
            <InfoCard label="Skipped" value={String(skippedCount)} />
          </div>
          {totalVolume > 0 && (
            <p className="mt-4 rounded-lg bg-stone-100 p-3 text-sm font-bold text-stone-700">
              Estimated volume: {Math.round(totalVolume).toLocaleString()}{" "}
              {profile.units}
            </p>
          )}

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

  if (phase === "pain") {
    const substituteId =
      exercise?.bodyweightSubstitute ??
      exercise?.easierVariation ??
      exercise?.substitutes[0];

    return (
      <section className="flex flex-1 flex-col gap-5">
        <header>
          <p className="text-xs font-extrabold uppercase tracking-wider text-red-700">
            Pain check
          </p>
          <h1 className="mt-2 text-4xl font-black leading-tight">
            Stop this exercise for today.
          </h1>
          <p className="mt-2 leading-7 text-stone-600">
            Sharp pain is a stop signal. We&apos;ll remember this and make the
            next suggestion gentler.
          </p>
        </header>

        <article className="space-y-4 rounded-lg border border-red-100 bg-red-50 p-5">
          <label className="block text-sm font-black text-red-950">
            Where did it hurt?
            <select
              className="mt-2 min-h-12 w-full rounded-lg border border-red-100 bg-white px-3 text-base capitalize text-stone-900"
              onChange={(event) =>
                setPainArea(event.target.value as InjuryFlag["area"])
              }
              value={painArea}
            >
              {injuryAreas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.label}
                </option>
              ))}
              <option value="other">Other / unsure</option>
            </select>
          </label>
          <p className="rounded-lg bg-white p-4 font-bold leading-7 text-red-950">
            Suggested swap next time:{" "}
            {getVariationName(substituteId) ?? "the easier option"}.
          </p>
        </article>

        <div className="grid gap-3">
          <button
            className="min-h-12 rounded-lg bg-red-900 px-4 font-black text-white"
            onClick={logPain}
            type="button"
          >
            Save pain flag
          </button>
          <button
            className="min-h-12 rounded-lg bg-stone-200 px-4 font-black text-stone-700"
            onClick={() => setPhase("exercise")}
            type="button"
          >
            Back
          </button>
        </div>
      </section>
    );
  }

  if (phase === "too_hard") {
    return (
      <section className="flex flex-1 flex-col gap-5">
        <header>
          <p className="text-xs font-extrabold uppercase tracking-wider text-orange-600">
            Too hard
          </p>
          <h1 className="mt-2 text-4xl font-black leading-tight">
            Good data. We&apos;ll back this off.
          </h1>
          <p className="mt-2 leading-7 text-stone-600">
            Stop the remaining sets for this exercise. Next time the coach will
            suggest a gentler target.
          </p>
        </header>

        <article className="rounded-lg border border-orange-100 bg-orange-50 p-5">
          <p className="font-bold leading-7 text-orange-950">
            Easier option:{" "}
            {getVariationName(exercise?.easierVariation) ??
              getVariationName(exercise?.bodyweightSubstitute) ??
              "reduce the reps and move slowly with control"}
            .
          </p>
        </article>

        <div className="grid gap-3">
          <button
            className="min-h-12 rounded-lg bg-orange-700 px-4 font-black text-white"
            onClick={() => logExercise("too_hard")}
            type="button"
          >
            Save and move on
          </button>
          <button
            className="min-h-12 rounded-lg bg-stone-200 px-4 font-black text-stone-700"
            onClick={() => setPhase("exercise")}
            type="button"
          >
            Back
          </button>
        </div>
      </section>
    );
  }

  if (phase === "rest") {
    const previewExercise = restMode === "set" ? exercise : nextExercise;
    const previewSets =
      restMode === "set"
        ? `Set ${Math.min(setIndex + 2, totalSets)} of ${totalSets}`
        : nextPlannedExercise
          ? `${nextPlannedExercise.sets} sets · ${nextPlannedExercise.repRange.min}-${nextPlannedExercise.repRange.max} reps`
          : "Workout complete";

    return (
      <section className="flex flex-1 flex-col justify-center gap-5">
        <header>
          <p className="text-xs font-extrabold uppercase tracking-wider text-orange-600">
            Rest
          </p>
          <h1 className="mt-2 text-5xl font-black leading-tight">
            {formatRestTime(restRemaining)}
          </h1>
          <p className="mt-2 leading-7 text-stone-600">
            Breathe, shake out your hands, and get ready for the next movement.
          </p>
        </header>
        <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-black uppercase tracking-wide text-stone-500">
            {restMode === "set" ? "Next set" : "Next exercise"}
          </p>
          <h2 className="mt-2 text-2xl font-black">
            {previewExercise?.name ?? "Finish"}
          </h2>
          <p className="mt-2 font-bold text-stone-500">{previewSets}</p>
        </article>
        <button
          className="min-h-12 rounded-lg bg-emerald-900 px-4 font-black text-white"
          onClick={continueAfterRest}
          type="button"
        >
          Continue
        </button>
        <button
          className="min-h-12 rounded-lg bg-stone-200 px-4 font-black text-stone-700"
          onClick={continueAfterRest}
          type="button"
        >
          Skip rest
        </button>
      </section>
    );
  }

  return (
    <section className="flex flex-1 flex-col gap-5">
      <header>
        <p className="text-xs font-extrabold uppercase tracking-wider text-orange-600">
          Exercise {exerciseIndex + 1} of {plannedExercises.length} · set{" "}
          {Math.min(setIndex + 1, totalSets)} of {totalSets} · {context}
        </p>
        <h1 className="mt-2 text-4xl font-black leading-tight">
          {exercise?.name ?? "Exercise"}
        </h1>
        <p className="mt-2 text-stone-600">
          Aim for {plannedExercise?.repRange.min}-
          {plannedExercise?.repRange.max} reps. Rest{" "}
          {plannedExercise?.restSeconds}s after this exercise.
        </p>
        {plannedExercise?.substitutedFrom && (
          <p className="mt-3 rounded-lg bg-orange-50 p-3 text-sm font-black leading-6 text-orange-950">
            Swapped from {getExercise(plannedExercise.substitutedFrom)?.name} —
            equipment not available in {context} mode.
          </p>
        )}
      </header>

      <article className="space-y-5 rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-stone-500">
            Suggested today
          </p>
          <p className="mt-2 text-lg font-black text-stone-900">
            {suggestedWeight
              ? `${suggestedWeight}${profile.units} × ${suggestedRepRange?.min}-${suggestedRepRange?.max}`
              : `${suggestedRepRange?.min}-${suggestedRepRange?.max} reps with clean form`}
          </p>
          <p className="mt-2 text-sm font-bold leading-6 text-stone-500">
            {recommendation?.reason ??
              "Start conservative and let the app calibrate from today."}
          </p>
          {recommendation?.action === "substitute" &&
            recommendation.substituteExerciseId && (
              <p className="mt-3 rounded-lg bg-orange-50 p-3 text-sm font-black text-orange-950">
                Suggested swap:{" "}
                {getExercise(recommendation.substituteExerciseId)?.name ??
                  recommendation.substituteExerciseId}
              </p>
            )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm font-black text-stone-700">
            Actual reps
            <input
              className="mt-2 min-h-14 w-full rounded-lg border border-stone-200 px-3 text-center text-2xl font-black"
              inputMode="numeric"
              min="0"
              onChange={(event) => setRepsInput(event.target.value)}
              type="number"
              value={repsInput}
            />
          </label>
          <label className="block text-sm font-black text-stone-700">
            Weight {suggestedWeight ? `(${profile.units})` : ""}
            <input
              className="mt-2 min-h-14 w-full rounded-lg border border-stone-200 px-3 text-center text-2xl font-black disabled:bg-stone-100 disabled:text-stone-400"
              disabled={!suggestedWeight}
              inputMode="decimal"
              min="0"
              onChange={(event) => setWeightInput(event.target.value)}
              type="number"
              value={weightInput}
            />
          </label>
        </div>

        <div>
          <p className="text-sm font-black uppercase tracking-wide text-stone-500">
            How did the set feel?
          </p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {effortOptions.map((option) => (
              <button
                className={`min-h-12 rounded-lg border px-2 text-sm font-black ${
                  effort === option.id
                    ? "border-emerald-900 bg-emerald-900 text-white"
                    : "border-stone-200 bg-white text-stone-700"
                }`}
                key={option.id}
                onClick={() => setEffort(option.id)}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {loggedSets.length > 0 && (
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-stone-500">
              Logged so far
            </p>
            <div className="mt-2 grid gap-2">
              {loggedSets.map((set) => (
                <p
                  className="rounded-lg bg-stone-100 p-3 text-sm font-bold text-stone-700"
                  key={set.setNumber}
                >
                  Set {set.setNumber}: {set.actualReps} reps
                  {set.actualWeight
                    ? ` · ${set.actualWeight}${set.unit}`
                    : ""}{" "}
                  · {effortLabel(set.effort)}
                </p>
              ))}
            </div>
          </div>
        )}

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
          onClick={saveSet}
          type="button"
        >
          Save set
        </button>
        <div className="grid grid-cols-3 gap-2">
          <button
            className="min-h-12 rounded-lg bg-orange-50 px-3 text-sm font-black text-orange-950"
            onClick={() => setPhase("too_hard")}
            type="button"
          >
            Too hard
          </button>
          <button
            className="min-h-12 rounded-lg bg-red-50 px-3 text-sm font-black text-red-950"
            onClick={() => setPhase("pain")}
            type="button"
          >
            Pain
          </button>
          <button
            className="min-h-12 rounded-lg bg-stone-200 px-3 text-sm font-black text-stone-700"
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

function ProgressScreen({ profile }: { profile: UserProfile }) {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<WorkoutSession | null>(
    null,
  );
  const [sessionQuery, setSessionQuery] = useState("");
  const [sessionFilter, setSessionFilter] = useState<
    "all" | "completed" | "partial" | "pain" | "too_hard"
  >("all");
  const [bodyMetrics, setBodyMetrics] = useState<BodyMetric[]>([]);
  const [checkIns, setCheckIns] = useState<DailyCheckIn[]>([]);
  const [metricDraft, setMetricDraft] = useState({
    bodyWeight: "",
    waist: "",
    hips: "",
    sleepHours: "",
    energy: 3,
    soreness: 3,
    sleepQuality: 3,
    mood: 3,
    notes: "",
  });

  useEffect(() => {
    refreshProgressData();
  }, []);

  async function refreshProgressData() {
    const [nextSessions, nextBodyMetrics, nextCheckIns] = await Promise.all([
      repository.listSessions({ limit: 20 }),
      repository.listBodyMetrics({ since: lastNDaysIsoDate(90) }),
      repository.listCheckIns({ since: lastNDaysIsoDate(90) }),
    ]);
    setSessions(nextSessions);
    setBodyMetrics(nextBodyMetrics);
    setCheckIns(nextCheckIns);
  }

  async function saveMetrics() {
    const date = todayIsoInputDate();
    const notes = metricDraft.notes.trim();
    await repository.saveBodyMetric({
      id: `body-${date}`,
      date,
      bodyWeight: optionalNumber(metricDraft.bodyWeight),
      waist: optionalNumber(metricDraft.waist),
      hips: optionalNumber(metricDraft.hips),
      notes: notes || undefined,
    });
    await repository.saveCheckIn({
      id: `checkin-${date}`,
      date,
      energy: metricDraft.energy as DailyCheckIn["energy"],
      soreness: metricDraft.soreness as DailyCheckIn["soreness"],
      sleepHours: optionalNumber(metricDraft.sleepHours),
      sleepQuality: metricDraft.sleepQuality as DailyCheckIn["sleepQuality"],
      mood: metricDraft.mood as DailyCheckIn["mood"],
    });
    setMetricDraft((current) => ({ ...current, notes: "" }));
    await refreshProgressData();
  }

  const completedThisWeek = sessions.filter(
    (session) =>
      session.completedAt && session.completedAt >= weekStartIsoDate(),
  ).length;
  const tooHardCount = sessions
    .flatMap((session) => session.exerciseResults)
    .filter((result) => result.outcome === "too_hard").length;
  const painCount = sessions
    .flatMap((session) => session.exerciseResults)
    .filter((result) => result.outcome === "pain").length;
  const weeklyTarget =
    getProgram(profile.programId)?.daysPerWeek ?? profile.availableDays.length;
  const targetRemaining = Math.max(weeklyTarget - completedThisWeek, 0);
  const mostCompletedTemplate = mostFrequent(
    sessions
      .filter((session) => session.status === "completed")
      .map((session) => session.templateId),
  );
  const latestSession = sessions[0];
  const latestSessionLabel = latestSession
    ? sessionTemplateLabel(latestSession.templateId)
    : null;
  const filteredSessions = sessions
    .filter((session) => {
      if (sessionFilter === "all") return true;
      if (sessionFilter === "pain") return session.painReported;
      if (sessionFilter === "too_hard") {
        return session.exerciseResults.some(
          (result) => result.outcome === "too_hard",
        );
      }
      return session.status === sessionFilter;
    })
    .filter((session) => {
      const query = sessionQuery.trim().toLowerCase();
      if (!query) return true;
      const templateName = sessionTemplateLabel(session.templateId);
      const exerciseNames = session.exerciseResults
        .map(
          (result) => getExercise(result.exerciseId)?.name ?? result.exerciseId,
        )
        .join(" ");
      return `${templateName} ${exerciseNames} ${session.notes ?? ""}`
        .toLowerCase()
        .includes(query);
    });
  const latestMetric = bodyMetrics[0];
  const latestCheckIn = checkIns[0];
  const bodyWeightTrend = metricTrend(bodyMetrics, "bodyWeight", profile.units);
  const waistTrend = metricTrend(bodyMetrics, "waist", profile.units);
  const recentCheckIns = checkIns.filter(
    (checkIn) => checkIn.date >= lastNDaysIsoDate(14),
  );
  const averageEnergy = averageMetric(recentCheckIns, "energy");
  const averageSoreness = averageMetric(recentCheckIns, "soreness");
  const averageSleep = averageMetric(recentCheckIns, "sleepHours");
  const strengthSummaries = buildStrengthSummaries(sessions, profile.units);

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
          label="Target remaining"
          value={`${targetRemaining} workout${targetRemaining === 1 ? "" : "s"}`}
        />
        <InfoCard
          label="Most completed"
          value={
            mostCompletedTemplate
              ? (getTemplate(mostCompletedTemplate)?.dayLabel ?? "Workout")
              : "Not yet"
          }
        />
        <InfoCard
          label="Exercises marked hard"
          value={tooHardCount ? String(tooHardCount) : "None yet"}
        />
        <InfoCard
          label="Pain flags"
          value={painCount ? String(painCount) : "None"}
        />
        <InfoCard
          label="Suggested next action"
          value={
            sessions.length
              ? "Repeat the next planned session"
              : "Start your first workout"
          }
        />
        <InfoCard
          label="Latest check-in"
          value={
            latestCheckIn
              ? `Energy ${latestCheckIn.energy ?? "-"} / soreness ${latestCheckIn.soreness ?? "-"}`
              : "Not logged"
          }
        />
        <InfoCard label="Bodyweight trend" value={bodyWeightTrend} />
        <InfoCard label="Waist trend" value={waistTrend} />
        <InfoCard
          label="14-day energy"
          value={averageEnergy ? `${averageEnergy}/5 avg` : "Not enough data"}
        />
        <InfoCard
          label="14-day soreness"
          value={
            averageSoreness ? `${averageSoreness}/5 avg` : "Not enough data"
          }
        />
        <InfoCard
          label="14-day sleep"
          value={averageSleep ? `${averageSleep}h avg` : "Not enough data"}
        />
      </div>

      <section className="space-y-3">
        <div>
          <h2 className="text-xl font-black">Strength trends</h2>
          <p className="mt-1 text-sm font-bold leading-6 text-stone-500">
            Based on the heaviest logged set for each exercise.
          </p>
        </div>
        {strengthSummaries.length ? (
          strengthSummaries.slice(0, 5).map((summary) => (
            <article
              className="rounded-lg border border-stone-200 bg-white p-4"
              key={summary.exerciseId}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-black">{summary.name}</h3>
                  <p className="mt-1 text-sm font-bold text-stone-500">
                    {summary.latestText}
                  </p>
                </div>
                <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-black text-emerald-950">
                  {summary.trendText}
                </span>
              </div>
              <StrengthSparkline points={summary.points} />
            </article>
          ))
        ) : (
          <p className="rounded-lg border border-stone-200 bg-white p-4 leading-7 text-stone-600">
            Log weighted sets during a workout and strength trends will appear
            here.
          </p>
        )}
      </section>

      <section className="space-y-3 rounded-lg border border-stone-200 bg-white p-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wider text-orange-600">
            Body check-in
          </p>
          <h2 className="mt-1 text-xl font-black">How are things feeling?</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <MetricField
            label="Weight"
            onChange={(value) =>
              setMetricDraft({ ...metricDraft, bodyWeight: value })
            }
            value={metricDraft.bodyWeight}
          />
          <MetricField
            label="Sleep hours"
            onChange={(value) =>
              setMetricDraft({ ...metricDraft, sleepHours: value })
            }
            value={metricDraft.sleepHours}
          />
          <MetricField
            label="Waist"
            onChange={(value) =>
              setMetricDraft({ ...metricDraft, waist: value })
            }
            value={metricDraft.waist}
          />
          <MetricField
            label="Hips"
            onChange={(value) =>
              setMetricDraft({ ...metricDraft, hips: value })
            }
            value={metricDraft.hips}
          />
        </div>
        <ScalePicker
          label="Energy"
          onChange={(energy) => setMetricDraft({ ...metricDraft, energy })}
          value={metricDraft.energy}
        />
        <ScalePicker
          label="Soreness"
          onChange={(soreness) => setMetricDraft({ ...metricDraft, soreness })}
          value={metricDraft.soreness}
        />
        <ScalePicker
          label="Sleep quality"
          onChange={(sleepQuality) =>
            setMetricDraft({ ...metricDraft, sleepQuality })
          }
          value={metricDraft.sleepQuality}
        />
        <ScalePicker
          label="Mood"
          onChange={(mood) => setMetricDraft({ ...metricDraft, mood })}
          value={metricDraft.mood}
        />
        <label className="block text-sm font-black text-stone-700">
          Note
          <textarea
            className="mt-2 min-h-24 w-full rounded-lg border border-stone-200 p-3 text-base font-medium"
            onChange={(event) =>
              setMetricDraft({ ...metricDraft, notes: event.target.value })
            }
            placeholder="Optional: energy, soreness, cycle, stress, anything useful."
            value={metricDraft.notes}
          />
        </label>
        <button
          className="min-h-12 w-full rounded-lg bg-emerald-900 px-4 font-black text-white"
          onClick={saveMetrics}
          type="button"
        >
          Save check-in
        </button>
        {latestMetric && (
          <p className="rounded-lg bg-stone-100 p-3 text-sm font-bold leading-6 text-stone-600">
            Latest body entry: {latestMetric.date}
            {latestMetric.bodyWeight ? ` · ${latestMetric.bodyWeight}` : ""}
            {latestMetric.waist ? ` · waist ${latestMetric.waist}` : ""}
          </p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-black">Recent sessions</h2>
        <div className="grid gap-3 rounded-lg border border-stone-200 bg-white p-4">
          <label className="block text-sm font-black text-stone-700">
            Search history
            <input
              className="mt-2 min-h-12 w-full rounded-lg border border-stone-200 px-3 text-base"
              onChange={(event) => setSessionQuery(event.target.value)}
              placeholder="Workout, exercise, note..."
              value={sessionQuery}
            />
          </label>
          <label className="block text-sm font-black text-stone-700">
            Filter
            <select
              className="mt-2 min-h-12 w-full rounded-lg border border-stone-200 px-3 text-base"
              onChange={(event) =>
                setSessionFilter(event.target.value as typeof sessionFilter)
              }
              value={sessionFilter}
            >
              <option value="all">All sessions</option>
              <option value="completed">Completed</option>
              <option value="partial">Partial</option>
              <option value="pain">Pain flagged</option>
              <option value="too_hard">Too hard</option>
            </select>
          </label>
        </div>
        {filteredSessions.length ? (
          filteredSessions.slice(0, 8).map((session) => (
            <article
              className="rounded-lg border border-stone-200 bg-white p-4"
              key={session.id}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-black">
                    {sessionTemplateLabel(session.templateId)}
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
              {session.exerciseResults.some(
                (result) => result.substitutedFrom,
              ) && (
                <p className="mt-1 text-sm font-bold leading-6 text-orange-700">
                  {
                    session.exerciseResults.filter(
                      (result) => result.substitutedFrom,
                    ).length
                  }{" "}
                  equipment swap
                  {session.exerciseResults.filter(
                    (result) => result.substitutedFrom,
                  ).length === 1
                    ? ""
                    : "s"}{" "}
                  used
                </p>
              )}
              <p className="mt-1 text-sm leading-6 text-stone-600">
                {sessionSetCount(session)} sets logged
                {sessionVolume(session) > 0
                  ? ` · ${Math.round(sessionVolume(session)).toLocaleString()} ${session.exerciseResults.some((result) => result.setResults.some((set) => set.unit === "lb")) ? "lb" : "kg"} volume`
                  : ""}
              </p>
              <div className="mt-3 grid gap-2">
                {session.exerciseResults
                  .filter((result) => result.setResults.length > 0)
                  .slice(0, 3)
                  .map((result) => (
                    <p
                      className="rounded-lg bg-stone-100 p-3 text-xs font-bold leading-5 text-stone-600"
                      key={result.id}
                    >
                      {getExercise(result.exerciseId)?.name ??
                        result.exerciseId}
                      :{" "}
                      {result.setResults
                        .map(
                          (set) =>
                            `${set.actualReps}${set.actualWeight ? ` @ ${set.actualWeight}${set.unit}` : ""}`,
                        )
                        .join(", ")}
                    </p>
                  ))}
              </div>
              {session.notes && (
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  {session.notes}
                </p>
              )}
              <button
                className="mt-3 min-h-10 w-full rounded-lg bg-emerald-50 px-3 text-sm font-black text-emerald-950"
                onClick={() => setSelectedSession(session)}
                type="button"
              >
                View session details
              </button>
            </article>
          ))
        ) : (
          <p className="rounded-lg border border-stone-200 bg-white p-4 leading-7 text-stone-600">
            {sessions.length
              ? "No sessions match that search yet."
              : "Finish a guided workout and it will appear here automatically."}
          </p>
        )}
      </section>
      {latestSessionLabel && (
        <p className="rounded-lg bg-emerald-50 p-4 font-bold leading-7 text-emerald-950">
          Last saved: {latestSessionLabel}. The next workout will use these set
          logs for calmer weight and rep suggestions.
        </p>
      )}
      {selectedSession && (
        <SessionDetailPanel
          onClose={() => setSelectedSession(null)}
          session={selectedSession}
        />
      )}
    </section>
  );
}

function LibraryScreen({ profile }: { profile: UserProfile }) {
  const allExercises = Object.values(EXERCISES);
  const [query, setQuery] = useState("");
  const [movement, setMovement] = useState<MovementPattern | "all">("all");
  const [equipment, setEquipment] = useState<EquipmentRequirement | "all">(
    "all",
  );
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null,
  );
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const contextOptions = [
    profile.equipment.home ? ("home" as const) : null,
    profile.equipment.gym ? ("gym" as const) : null,
  ].filter((item): item is "home" | "gym" => Boolean(item));
  const [quickContext, setQuickContext] = useState<"home" | "gym">(
    contextOptions[0] ?? "home",
  );
  const [quickTemplate, setQuickTemplate] = useState<WorkoutTemplate | null>(
    null,
  );
  const movementOptions = uniqueValues(
    allExercises.map((exercise) => exercise.movementPattern),
  );
  const equipmentOptions = uniqueValues(
    allExercises.flatMap((exercise) => exercise.equipment),
  );
  const exercises = allExercises
    .filter((exercise) =>
      exercise.name.toLowerCase().includes(query.trim().toLowerCase()),
    )
    .filter(
      (exercise) => movement === "all" || exercise.movementPattern === movement,
    )
    .filter(
      (exercise) =>
        equipment === "all" || exercise.equipment.includes(equipment),
    );
  const selectedExerciseLastResult = selectedExercise
    ? findLastExerciseResult(sessions, selectedExercise.id)
    : null;

  useEffect(() => {
    repository.listSessions({ limit: 100 }).then(setSessions);
  }, []);

  if (quickTemplate) {
    return (
      <GuidedWorkout
        context={quickContext}
        onExit={() => setQuickTemplate(null)}
        profile={profile}
        template={quickTemplate}
      />
    );
  }

  return (
    <section className="space-y-5">
      <header>
        <p className="text-xs font-extrabold uppercase tracking-wider text-orange-600">
          {Object.keys(EXERCISES).length} exercises loaded
        </p>
        <h1 className="mt-2 text-4xl font-black">Exercise Library</h1>
        <p className="mt-2 leading-7 text-stone-600">
          Browse exercise guidance by movement and equipment. Tap any exercise
          for setup, cues, mistakes, and safety notes.
        </p>
      </header>
      {contextOptions.length > 1 && (
        <div className="grid grid-cols-2 gap-2 rounded-lg bg-stone-100 p-1">
          {contextOptions.map((option) => (
            <button
              className={`min-h-11 rounded-md font-black capitalize ${
                quickContext === option
                  ? "bg-white text-emerald-950 shadow-sm"
                  : "text-stone-500"
              }`}
              key={option}
              onClick={() => setQuickContext(option)}
              type="button"
            >
              {option}
            </button>
          ))}
        </div>
      )}
      <div className="grid gap-3 rounded-lg border border-stone-200 bg-white p-4">
        <label className="block text-sm font-black text-stone-700">
          Search
          <input
            className="mt-2 min-h-12 w-full rounded-lg border border-stone-200 px-3 text-base"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Squat, row, plank..."
            value={query}
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm font-black text-stone-700">
            Movement
            <select
              className="mt-2 min-h-12 w-full rounded-lg border border-stone-200 px-3 text-base capitalize"
              onChange={(event) =>
                setMovement(event.target.value as MovementPattern | "all")
              }
              value={movement}
            >
              <option value="all">All</option>
              {movementOptions.map((option) => (
                <option key={option} value={option}>
                  {option.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-black text-stone-700">
            Equipment
            <select
              className="mt-2 min-h-12 w-full rounded-lg border border-stone-200 px-3 text-base capitalize"
              onChange={(event) =>
                setEquipment(event.target.value as EquipmentRequirement | "all")
              }
              value={equipment}
            >
              <option value="all">All</option>
              {equipmentOptions.map((option) => (
                <option key={option} value={option}>
                  {option.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
      <div className="grid gap-3">
        {exercises.length ? (
          exercises.map((exercise) => (
            <button
              className="rounded-lg border border-stone-200 bg-white p-4"
              key={exercise.id}
              onClick={() => setSelectedExercise(exercise)}
              type="button"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="text-left">
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
            </button>
          ))
        ) : (
          <p className="rounded-lg border border-stone-200 bg-white p-4 leading-7 text-stone-600">
            No exercises match those filters yet.
          </p>
        )}
      </div>
      {selectedExercise && (
        <ExerciseDetailPanel
          exercise={selectedExercise}
          lastResult={selectedExerciseLastResult}
          onClose={() => setSelectedExercise(null)}
          onStartQuickWorkout={(exercise) => {
            setSelectedExercise(null);
            setQuickTemplate(createQuickWorkoutTemplate(exercise));
          }}
        />
      )}
    </section>
  );
}

function SettingsScreen({
  onProfileChange,
  profile,
}: {
  onProfileChange: (profile: UserProfile | null) => void;
  profile: UserProfile;
}) {
  const [exportedData, setExportedData] = useState("");
  const [importData, setImportData] = useState("");
  const [message, setMessage] = useState("");
  const [profileDraft, setProfileDraft] = useState({
    availableDays: profile.availableDays,
    injuries: profile.injuries,
    programId: profile.programId,
    sessionLengthMinutes: profile.sessionLengthMinutes,
    units: profile.units,
  });
  const [equipmentDraft, setEquipmentDraft] = useState({
    trainsAtHome: Boolean(profile.equipment.home),
    trainsAtGym: Boolean(profile.equipment.gym),
    homeBodyweightOnly: profile.equipment.home?.bodyweightOnly ?? true,
    homeDumbbells: dumbbellWeightsToText(profile.equipment.home),
    homeKettlebells: (profile.equipment.home?.kettlebells ?? []).join(", "),
    homeResistanceBands: profile.equipment.home?.resistanceBands ?? false,
    homeBench: profile.equipment.home?.bench ?? false,
    homePullUpBar: profile.equipment.home?.pullUpBar ?? false,
  });

  async function exportData() {
    setExportedData(await repository.exportAll());
    setMessage("Export ready below.");
  }

  async function importBackup() {
    try {
      await repository.importAll(importData);
      const nextProfile = await repository.getProfile();
      onProfileChange(nextProfile);
      setMessage("Import complete.");
    } catch {
      setMessage("That import did not look like a valid PulseFit backup.");
    }
  }

  async function resetApp() {
    await repository.clearAll();
    onProfileChange(null);
  }

  async function saveProfileSettings() {
    const home = equipmentDraft.trainsAtHome
      ? createEditedHomeEquipment(equipmentDraft)
      : null;
    const gym = equipmentDraft.trainsAtGym ? createStandardGymProfile() : null;
    const nextProfile: UserProfile = {
      ...profile,
      availableDays: profileDraft.availableDays,
      injuries: profileDraft.injuries,
      programId: profileDraft.programId,
      programStartedAt:
        profileDraft.programId === profile.programId
          ? profile.programStartedAt
          : new Date().toISOString(),
      sessionLengthMinutes: profileDraft.sessionLengthMinutes,
      units: profileDraft.units,
      equipment: {
        home: home || gym ? home : createEditedHomeEquipment(equipmentDraft),
        gym,
      },
      updatedAt: new Date().toISOString(),
    };
    await repository.saveProfile(nextProfile);
    onProfileChange(nextProfile);
    setMessage("Setup updated.");
  }

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
      <article className="space-y-4 rounded-lg border border-stone-200 bg-white p-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wider text-orange-600">
            Edit plan
          </p>
          <h2 className="mt-1 text-xl font-black">Adjust the setup</h2>
        </div>
        <label className="block text-sm font-black text-stone-700">
          Program
          <select
            className="mt-2 min-h-12 w-full rounded-lg border border-stone-200 px-3 text-base"
            onChange={(event) =>
              setProfileDraft({
                ...profileDraft,
                programId: event.target.value,
              })
            }
            value={profileDraft.programId}
          >
            {Object.values(PROGRAMS).map((program) => (
              <option key={program.id} value={program.id}>
                {program.name}
              </option>
            ))}
          </select>
        </label>
        <div>
          <p className="text-sm font-black text-stone-700">Training days</p>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {weekdays.map((day) => {
              const selected = profileDraft.availableDays.includes(day.id);
              return (
                <button
                  className={`min-h-11 rounded-lg border px-2 font-black ${
                    selected
                      ? "border-emerald-900 bg-emerald-900 text-white"
                      : "border-stone-200 bg-white text-stone-700"
                  }`}
                  key={day.id}
                  onClick={() => {
                    const nextDays = selected
                      ? profileDraft.availableDays.filter(
                          (item) => item !== day.id,
                        )
                      : [...profileDraft.availableDays, day.id];
                    setProfileDraft({
                      ...profileDraft,
                      availableDays: nextDays.length ? nextDays : [day.id],
                    });
                  }}
                  type="button"
                >
                  {day.label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm font-black text-stone-700">
            Session length
            <select
              className="mt-2 min-h-12 w-full rounded-lg border border-stone-200 px-3 text-base"
              onChange={(event) =>
                setProfileDraft({
                  ...profileDraft,
                  sessionLengthMinutes: Number(
                    event.target.value,
                  ) as UserProfile["sessionLengthMinutes"],
                })
              }
              value={profileDraft.sessionLengthMinutes}
            >
              <option value={20}>20 min</option>
              <option value={30}>30 min</option>
              <option value={45}>45 min</option>
              <option value={60}>60 min</option>
            </select>
          </label>
          <label className="block text-sm font-black text-stone-700">
            Units
            <select
              className="mt-2 min-h-12 w-full rounded-lg border border-stone-200 px-3 text-base"
              onChange={(event) =>
                setProfileDraft({
                  ...profileDraft,
                  units: event.target.value as UserProfile["units"],
                })
              }
              value={profileDraft.units}
            >
              <option value="kg">kg</option>
              <option value="lb">lb</option>
            </select>
          </label>
        </div>
        <div>
          <p className="text-sm font-black text-stone-700">Injuries</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {injuryAreas.map((area) => {
              const selected = profileDraft.injuries.some(
                (item) => item.area === area.id && item.active,
              );
              return (
                <button
                  className={`min-h-11 rounded-lg border px-3 text-left text-sm font-black ${
                    selected
                      ? "border-emerald-900 bg-emerald-900 text-white"
                      : "border-stone-200 bg-white text-stone-700"
                  }`}
                  key={area.id}
                  onClick={() => {
                    const injuries = selected
                      ? profileDraft.injuries.filter(
                          (item) => item.area !== area.id,
                        )
                      : [
                          ...profileDraft.injuries,
                          { area: area.id, active: true },
                        ];
                    setProfileDraft({ ...profileDraft, injuries });
                  }}
                  type="button"
                >
                  {area.label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="space-y-3 rounded-lg bg-stone-100 p-4">
          <p className="text-sm font-black text-stone-700">Training places</p>
          <div className="grid grid-cols-2 gap-2">
            <ToggleCard
              checked={equipmentDraft.trainsAtHome}
              label="Home"
              onChange={(checked) =>
                setEquipmentDraft({
                  ...equipmentDraft,
                  trainsAtHome: checked || !equipmentDraft.trainsAtGym,
                })
              }
            />
            <ToggleCard
              checked={equipmentDraft.trainsAtGym}
              label="Gym"
              onChange={(checked) =>
                setEquipmentDraft({
                  ...equipmentDraft,
                  trainsAtGym: checked || !equipmentDraft.trainsAtHome,
                })
              }
            />
          </div>
        </div>
        {equipmentDraft.trainsAtHome && (
          <div className="space-y-3 rounded-lg bg-stone-100 p-4">
            <p className="text-sm font-black text-stone-700">Home equipment</p>
            <ToggleCard
              checked={equipmentDraft.homeBodyweightOnly}
              helper="Use bodyweight substitutions when weights are not available."
              label="Mostly bodyweight"
              onChange={(checked) =>
                setEquipmentDraft({
                  ...equipmentDraft,
                  homeBodyweightOnly: checked,
                })
              }
            />
            <label className="block text-sm font-black text-stone-700">
              Dumbbells
              <input
                className="mt-2 min-h-12 w-full rounded-lg border border-stone-200 px-3 text-base"
                onChange={(event) =>
                  setEquipmentDraft({
                    ...equipmentDraft,
                    homeDumbbells: event.target.value,
                    homeBodyweightOnly: false,
                  })
                }
                placeholder="Example: 5, 8, 10, 12"
                value={equipmentDraft.homeDumbbells}
              />
            </label>
            <label className="block text-sm font-black text-stone-700">
              Kettlebells
              <input
                className="mt-2 min-h-12 w-full rounded-lg border border-stone-200 px-3 text-base"
                onChange={(event) =>
                  setEquipmentDraft({
                    ...equipmentDraft,
                    homeKettlebells: event.target.value,
                    homeBodyweightOnly: false,
                  })
                }
                placeholder="Example: 8, 12, 16"
                value={equipmentDraft.homeKettlebells}
              />
            </label>
            <div className="grid gap-2">
              <ToggleCard
                checked={equipmentDraft.homeResistanceBands}
                label="Resistance bands"
                onChange={(checked) =>
                  setEquipmentDraft({
                    ...equipmentDraft,
                    homeResistanceBands: checked,
                  })
                }
              />
              <ToggleCard
                checked={equipmentDraft.homeBench}
                label="Bench"
                onChange={(checked) =>
                  setEquipmentDraft({ ...equipmentDraft, homeBench: checked })
                }
              />
              <ToggleCard
                checked={equipmentDraft.homePullUpBar}
                label="Pull-up bar"
                onChange={(checked) =>
                  setEquipmentDraft({
                    ...equipmentDraft,
                    homePullUpBar: checked,
                  })
                }
              />
            </div>
          </div>
        )}
        <button
          className="min-h-12 w-full rounded-lg bg-emerald-900 px-4 font-black text-white"
          onClick={saveProfileSettings}
          type="button"
        >
          Save setup changes
        </button>
      </article>
      <article className="space-y-4 rounded-lg border border-stone-200 bg-white p-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wider text-orange-600">
            Data
          </p>
          <h2 className="mt-1 text-xl font-black">Backup and restore</h2>
          <p className="mt-2 text-sm font-bold leading-6 text-stone-500">
            Everything is stored on this device right now. Export before
            changing browsers or clearing storage.
          </p>
        </div>
        <button
          className="min-h-12 w-full rounded-lg bg-emerald-900 px-4 font-black text-white"
          onClick={exportData}
          type="button"
        >
          Export data
        </button>
        {exportedData && (
          <label className="block text-sm font-black text-stone-700">
            Backup JSON
            <textarea
              className="mt-2 min-h-40 w-full rounded-lg border border-stone-200 p-3 font-mono text-xs"
              readOnly
              value={exportedData}
            />
          </label>
        )}
        <label className="block text-sm font-black text-stone-700">
          Import JSON
          <textarea
            className="mt-2 min-h-32 w-full rounded-lg border border-stone-200 p-3 font-mono text-xs"
            onChange={(event) => setImportData(event.target.value)}
            placeholder="Paste a PulseFit export here"
            value={importData}
          />
        </label>
        <button
          className="min-h-12 w-full rounded-lg bg-stone-200 px-4 font-black text-stone-700 disabled:opacity-50"
          disabled={!importData.trim()}
          onClick={importBackup}
          type="button"
        >
          Import backup
        </button>
        {message && (
          <p className="rounded-lg bg-stone-100 p-3 text-sm font-bold text-stone-600">
            {message}
          </p>
        )}
      </article>
      <article className="space-y-3 rounded-lg border border-red-100 bg-red-50 p-4">
        <h2 className="text-xl font-black text-red-950">Start over</h2>
        <p className="text-sm font-bold leading-6 text-red-950">
          This clears the local profile, sessions, metrics, and progression
          cache on this device.
        </p>
        <button
          className="min-h-12 w-full rounded-lg bg-red-900 px-4 font-black text-white"
          onClick={resetApp}
          type="button"
        >
          Reset app
        </button>
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

function MetricField({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="block text-sm font-black text-stone-700">
      {label}
      <input
        className="mt-2 min-h-12 w-full rounded-lg border border-stone-200 px-3 text-base"
        inputMode="decimal"
        min="0"
        onChange={(event) => onChange(event.target.value)}
        type="number"
        value={value}
      />
    </label>
  );
}

function ScalePicker({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: 1 | 2 | 3 | 4 | 5) => void;
  value: number;
}) {
  return (
    <div>
      <p className="text-sm font-black text-stone-700">{label}</p>
      <div className="mt-2 grid grid-cols-5 gap-2">
        {metricScaleOptions.map((option) => (
          <button
            className={`min-h-10 rounded-lg border font-black ${
              value === option
                ? "border-emerald-900 bg-emerald-900 text-white"
                : "border-stone-200 bg-white text-stone-600"
            }`}
            key={option}
            onClick={() => onChange(option)}
            type="button"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

type StrengthPoint = {
  date: string;
  reps: number;
  weight: number;
};

function StrengthSparkline({ points }: { points: StrengthPoint[] }) {
  if (points.length < 2) {
    return (
      <p className="mt-3 rounded-lg bg-stone-100 p-3 text-sm font-bold text-stone-500">
        One logged session so far.
      </p>
    );
  }

  const weights = points.map((point) => point.weight);
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  const range = Math.max(max - min, 1);
  const path = points
    .map((point, index) => {
      const x = (index / Math.max(points.length - 1, 1)) * 100;
      const y = 30 - ((point.weight - min) / range) * 24;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      aria-hidden="true"
      className="mt-4 h-12 w-full overflow-visible"
      preserveAspectRatio="none"
      viewBox="0 0 100 32"
    >
      <polyline
        fill="none"
        points={path}
        stroke="rgb(6 78 59)"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
      />
    </svg>
  );
}

function ExerciseDetailPanel({
  exercise,
  lastResult,
  onClose,
  onStartQuickWorkout,
}: {
  exercise: Exercise;
  lastResult?: ExerciseResult | null;
  onClose: () => void;
  onStartQuickWorkout?: (exercise: Exercise) => void;
}) {
  return (
    <section className="fixed inset-0 z-20 overflow-y-auto bg-stone-950/35 px-4 py-6">
      <article className="mx-auto max-w-md space-y-5 rounded-lg bg-white p-5 shadow-xl">
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-orange-600">
              {exercise.movementPattern.replaceAll("_", " ")}
            </p>
            <h2 className="mt-1 text-3xl font-black">{exercise.name}</h2>
            <p className="mt-2 text-sm font-bold capitalize text-stone-500">
              {exercise.equipment
                .map((item) => item.replaceAll("_", " "))
                .join(", ")}
            </p>
          </div>
          <button
            className="min-h-10 rounded-lg bg-stone-100 px-3 font-black text-stone-600"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </header>

        {onStartQuickWorkout && (
          <button
            className="min-h-12 w-full rounded-lg bg-emerald-900 px-4 font-black text-white"
            onClick={() => onStartQuickWorkout(exercise)}
            type="button"
          >
            Start quick session
          </button>
        )}

        {lastResult && (
          <div className="rounded-lg bg-emerald-50 p-4">
            <p className="text-sm font-black uppercase tracking-wide text-emerald-950">
              Last time
            </p>
            <p className="mt-2 font-bold leading-6 text-emerald-950">
              {exerciseResultSummary(lastResult)}
            </p>
          </div>
        )}

        <GuidanceList title="Setup" items={exercise.setupSteps} />
        <GuidanceList title="Steps" items={exercise.executionSteps} />
        <GuidanceList title="Coach cues" items={exercise.coachingCues} />
        <GuidanceList title="Common mistakes" items={exercise.commonMistakes} />

        <div className="grid gap-3">
          <InfoCard
            label="Easier"
            value={getVariationName(exercise.easierVariation) ?? "Reduce reps"}
          />
          <InfoCard
            label="Harder"
            value={getVariationName(exercise.harderVariation) ?? "Add control"}
          />
        </div>
        {exercise.safetyNotes?.length ? (
          <div className="rounded-lg bg-orange-50 p-4">
            <p className="text-sm font-black uppercase tracking-wide text-orange-950">
              Safety
            </p>
            <p className="mt-2 font-bold leading-6 text-orange-950">
              {exercise.safetyNotes[0]}
            </p>
          </div>
        ) : null}
      </article>
    </section>
  );
}

function SessionDetailPanel({
  onClose,
  session,
}: {
  onClose: () => void;
  session: WorkoutSession;
}) {
  return (
    <section className="fixed inset-0 z-20 overflow-y-auto bg-stone-950/35 px-4 py-6">
      <article className="mx-auto max-w-md space-y-5 rounded-lg bg-white p-5 shadow-xl">
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-orange-600">
              {new Date(session.startedAt).toLocaleDateString()} ·{" "}
              {session.context}
            </p>
            <h2 className="mt-1 text-3xl font-black">
              {sessionTemplateLabel(session.templateId)}
            </h2>
            <p className="mt-2 text-sm font-bold text-stone-500">
              {sessionSetCount(session)} sets logged
              {session.overallEffort
                ? ` · effort ${session.overallEffort}/10`
                : ""}
            </p>
          </div>
          <button
            className="min-h-10 rounded-lg bg-stone-100 px-3 font-black text-stone-600"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </header>

        <div className="grid gap-3">
          {session.exerciseResults.map((result) => (
            <article
              className="rounded-lg border border-stone-200 bg-stone-50 p-4"
              key={result.id}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-black">
                    {getExercise(result.exerciseId)?.name ?? result.exerciseId}
                  </h3>
                  <p className="mt-1 text-xs font-black uppercase tracking-wide text-stone-500">
                    {result.outcome.replaceAll("_", " ")}
                  </p>
                  {result.substitutedFrom && (
                    <p className="mt-2 text-xs font-bold leading-5 text-orange-700">
                      Swapped from{" "}
                      {getExercise(result.substitutedFrom)?.name ??
                        result.substitutedFrom}
                    </p>
                  )}
                  {result.painArea && (
                    <p className="mt-1 text-xs font-bold leading-5 text-red-700">
                      Pain area: {result.painArea.replaceAll("_", " ")}
                    </p>
                  )}
                </div>
                <span className="rounded-md bg-white px-2 py-1 text-xs font-black text-stone-600">
                  {result.setResults.length} sets
                </span>
              </div>
              {result.setResults.length ? (
                <div className="mt-3 grid gap-2">
                  {result.setResults.map((set) => (
                    <p
                      className="rounded-lg bg-white p-3 text-sm font-bold leading-6 text-stone-700"
                      key={set.setNumber}
                    >
                      Set {set.setNumber}: {set.actualReps} reps
                      {set.actualWeight
                        ? ` · ${set.actualWeight}${set.unit}`
                        : ""}{" "}
                      · {effortLabel(set.effort)}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm font-bold leading-6 text-stone-500">
                  No set details logged for this exercise.
                </p>
              )}
            </article>
          ))}
        </div>

        {session.notes && (
          <p className="rounded-lg bg-emerald-50 p-4 font-bold leading-7 text-emerald-950">
            {session.notes}
          </p>
        )}
      </article>
    </section>
  );
}

function GuidanceList({ items, title }: { items: string[]; title: string }) {
  return (
    <section>
      <h3 className="text-sm font-black uppercase tracking-wide text-stone-500">
        {title}
      </h3>
      <ol className="mt-2 grid gap-2">
        {items.map((item, index) => (
          <li
            className="rounded-lg bg-stone-100 p-3 text-sm font-bold leading-6"
            key={item}
          >
            {index + 1}. {item}
          </li>
        ))}
      </ol>
    </section>
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

function resolvePlannedExercise(
  plannedExercise: PlannedExercise,
  equipment: UserProfile["equipment"]["home"],
  instanceId: string,
): ResolvedPlannedExercise | null {
  const exercise = getExercise(plannedExercise.exerciseId);
  if (!exercise) return null;
  if (exerciseCanBePerformed(exercise, equipment)) {
    return { ...plannedExercise, instanceId };
  }

  const substituteIds = [
    exercise.bodyweightSubstitute,
    ...exercise.substitutes,
  ].filter((id): id is string => Boolean(id));
  const substitute = substituteIds
    .map((id) => getExercise(id))
    .find((candidate): candidate is Exercise =>
      Boolean(candidate && exerciseCanBePerformed(candidate, equipment)),
    );

  if (!substitute) return null;
  return {
    ...plannedExercise,
    exerciseId: substitute.id,
    instanceId,
    substitutedFrom: exercise.id,
  };
}

function exerciseCanBePerformed(
  exercise: Exercise,
  equipment: UserProfile["equipment"]["home"],
): boolean {
  return exercise.equipment.every((requirement) => {
    if (requirement === "bodyweight") return true;
    if (!equipment) return false;
    if (requirement === "dumbbells") return equipment.dumbbells.kind !== "none";
    if (requirement === "barbell") return Boolean(equipment.barbell);
    if (requirement === "kettlebell") return equipment.kettlebells.length > 0;
    if (requirement === "bench") return equipment.bench;
    if (requirement === "pull_up_bar") return equipment.pullUpBar;
    if (requirement === "resistance_band") return equipment.resistanceBands;
    return false;
  });
}

function getVariationName(id?: string): string | null {
  if (!id) return null;
  return getExercise(id)?.name ?? null;
}

function createQuickWorkoutTemplate(exercise: Exercise): WorkoutTemplate {
  return {
    id: `quick-${exercise.id}`,
    programId: "quick",
    dayLabel: `Quick ${exercise.name}`,
    estimatedMinutes: Math.max(8, Math.round(exercise.defaultSets * 4)),
    difficulty: exercise.difficulty,
    blocks: [
      {
        id: "quick-main",
        type: "main",
        exercises: [
          {
            exerciseId: exercise.id,
            sets: exercise.defaultSets,
            repRange: exercise.defaultRepRange,
            restSeconds: exercise.defaultRestSeconds,
            notes: "Quick session from the exercise library.",
          },
        ],
      },
    ],
  };
}

function sessionTemplateLabel(templateId: string): string {
  const template = getTemplate(templateId);
  if (template) return template.dayLabel;
  if (templateId.startsWith("quick-")) {
    const exerciseId = templateId.replace("quick-", "");
    return `Quick ${getExercise(exerciseId)?.name ?? exerciseId.replaceAll("-", " ")}`;
  }
  return templateId;
}

function effortLabel(effort: EffortBand): string {
  return effortOptions.find((option) => option.id === effort)?.label ?? effort;
}

function sessionSetCount(session: WorkoutSession): number {
  return session.exerciseResults.reduce(
    (total, result) => total + result.setResults.length,
    0,
  );
}

function sessionVolume(session: WorkoutSession): number {
  return session.exerciseResults
    .flatMap((result) => result.setResults)
    .reduce(
      (total, set) => total + (set.actualWeight ?? 0) * set.actualReps,
      0,
    );
}

function findLastExerciseResult(
  sessions: WorkoutSession[],
  exerciseId: string,
): ExerciseResult | null {
  for (const session of sessions) {
    const result = session.exerciseResults.find(
      (exerciseResult) => exerciseResult.exerciseId === exerciseId,
    );
    if (result) return result;
  }

  return null;
}

function exerciseResultSummary(result: ExerciseResult): string {
  if (!result.setResults.length) {
    return `Outcome: ${result.outcome.replaceAll("_", " ")}`;
  }

  const setSummary = result.setResults
    .map(
      (set) =>
        `${set.actualReps} reps${set.actualWeight ? ` @ ${set.actualWeight}${set.unit}` : ""}`,
    )
    .join(", ");

  return `${setSummary} · ${result.outcome.replaceAll("_", " ")}`;
}

function formatRestTime(seconds: number): string {
  const safeSeconds = Math.max(seconds, 0);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;
  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function optionalNumber(value: string): number | undefined {
  const number = Number(value);
  return Number.isFinite(number) && value.trim() ? number : undefined;
}

function todayIsoInputDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function lastNDaysIsoDate(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

function uniqueValues<T extends string>(values: T[]): T[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

function scheduledDayForTemplate(profile: UserProfile, index: number): string {
  const day = profile.availableDays[index % profile.availableDays.length];
  return day
    ? (weekdays.find((item) => item.id === day)?.label ?? day)
    : "Plan";
}

function dumbbellWeightsToText(equipment: EquipmentProfile | null): string {
  if (!equipment || equipment.dumbbells.kind === "none") return "";
  if (equipment.dumbbells.kind === "fixed") {
    return equipment.dumbbells.weights.join(", ");
  }
  return `${equipment.dumbbells.min}, ${equipment.dumbbells.max} adjustable`;
}

function createEditedHomeEquipment(equipmentDraft: {
  homeBench: boolean;
  homeBodyweightOnly: boolean;
  homeDumbbells: string;
  homeKettlebells: string;
  homePullUpBar: boolean;
  homeResistanceBands: boolean;
}): EquipmentProfile {
  const dumbbellWeights = parseWeights(equipmentDraft.homeDumbbells);
  const kettlebells = parseWeights(equipmentDraft.homeKettlebells);
  const hasWeights = dumbbellWeights.length > 0 || kettlebells.length > 0;

  return {
    dumbbells: dumbbellWeights.length
      ? { kind: "fixed", weights: dumbbellWeights }
      : { kind: "none" },
    barbell: null,
    kettlebells,
    resistanceBands: equipmentDraft.homeResistanceBands,
    bench: equipmentDraft.homeBench,
    pullUpBar: equipmentDraft.homePullUpBar,
    bodyweightOnly: equipmentDraft.homeBodyweightOnly || !hasWeights,
  };
}

function mostFrequent(values: string[]): string | null {
  if (!values.length) return null;
  const counts = values.reduce<Record<string, number>>((totals, value) => {
    totals[value] = (totals[value] ?? 0) + 1;
    return totals;
  }, {});
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}

function buildStrengthSummaries(
  sessions: WorkoutSession[],
  units: UserProfile["units"],
): {
  exerciseId: string;
  latestText: string;
  name: string;
  points: StrengthPoint[];
  trendText: string;
}[] {
  const byExercise = new Map<string, StrengthPoint[]>();

  for (const session of [...sessions].reverse()) {
    for (const result of session.exerciseResults) {
      const weightedSets = result.setResults.filter(
        (set) => typeof set.actualWeight === "number" && set.actualWeight > 0,
      );
      if (!weightedSets.length) continue;

      const bestSet = [...weightedSets].sort(
        (a, b) =>
          (b.actualWeight ?? 0) - (a.actualWeight ?? 0) ||
          b.actualReps - a.actualReps,
      )[0];
      const points = byExercise.get(result.exerciseId) ?? [];
      points.push({
        date: session.completedAt ?? session.startedAt,
        reps: bestSet.actualReps,
        weight: bestSet.actualWeight ?? 0,
      });
      byExercise.set(result.exerciseId, points);
    }
  }

  return [...byExercise.entries()]
    .map(([exerciseId, points]) => {
      const latest = points[points.length - 1];
      const first = points[0];
      const delta = latest.weight - first.weight;
      const sign = delta > 0 ? "+" : "";

      return {
        exerciseId,
        name: getExercise(exerciseId)?.name ?? exerciseId.replaceAll("-", " "),
        points,
        latestText: `${latest.weight}${units} × ${latest.reps} reps`,
        trendText:
          points.length > 1 && delta !== 0
            ? `${sign}${delta.toFixed(1)}${units}`
            : points.length > 1
              ? "Holding"
              : "New",
      };
    })
    .sort((a, b) => b.points.length - a.points.length);
}

function metricTrend(
  metrics: BodyMetric[],
  key: "bodyWeight" | "waist" | "hips",
  units: UserProfile["units"],
): string {
  const entries = metrics
    .filter((metric) => typeof metric[key] === "number")
    .sort((a, b) => b.date.localeCompare(a.date));
  const latest = entries[0]?.[key];
  const previous = entries[entries.length - 1]?.[key];

  if (typeof latest !== "number") return "Not logged";
  if (typeof previous !== "number" || latest === previous) {
    return `${latest}${key === "bodyWeight" ? units : ""}`;
  }

  const delta = latest - previous;
  const sign = delta > 0 ? "+" : "";
  return `${latest}${key === "bodyWeight" ? units : ""} (${sign}${delta.toFixed(1)})`;
}

function averageMetric<K extends keyof DailyCheckIn>(
  checkIns: DailyCheckIn[],
  key: K,
): string | null {
  const values = checkIns
    .map((checkIn) => checkIn[key])
    .filter((value): value is number => typeof value === "number");

  if (!values.length) return null;
  const average =
    values.reduce((total, value) => total + value, 0) / values.length;
  return average.toFixed(average % 1 === 0 ? 0 : 1);
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
