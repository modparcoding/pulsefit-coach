import type {
  EquipmentProfile,
  ExperienceLevel,
  Goal,
  InjuryFlag,
  Program,
  Units,
  UserProfile,
  Weekday,
} from "@/types";
import { getProgram, getRecommendedProgram } from "./content";

export type OnboardingDraft = {
  name: string;
  goal: Goal;
  experienceLevel: ExperienceLevel;
  units: Units;
  availableDays: Weekday[];
  sessionLengthMinutes: 20 | 30 | 45 | 60;
  injuries: InjuryFlag[];
  trainsAtHome: boolean;
  trainsAtGym: boolean;
  home: {
    bodyweightOnly: boolean;
    dumbbellWeights: string;
    kettlebellWeights: string;
    resistanceBands: boolean;
    bench: boolean;
    pullUpBar: boolean;
  };
};

export const DEFAULT_DRAFT: OnboardingDraft = {
  name: "",
  goal: "strength",
  experienceLevel: "beginner",
  units: "kg",
  availableDays: ["mon", "wed", "fri"],
  sessionLengthMinutes: 30,
  injuries: [],
  trainsAtHome: true,
  trainsAtGym: true,
  home: {
    bodyweightOnly: true,
    dumbbellWeights: "",
    kettlebellWeights: "",
    resistanceBands: false,
    bench: false,
    pullUpBar: false,
  },
};

export function createProfileFromDraft(draft: OnboardingDraft): UserProfile {
  const now = new Date().toISOString();
  const home = draft.trainsAtHome ? createHomeEquipmentProfile(draft) : null;
  const gym = draft.trainsAtGym ? createStandardGymProfile() : null;
  const program = recommendProgramForDraft(draft, home, gym);

  return {
    id: crypto.randomUUID(),
    name: draft.name.trim() || undefined,
    goal: draft.goal,
    experienceLevel: draft.experienceLevel,
    units: draft.units,
    availableDays: draft.availableDays,
    sessionLengthMinutes: draft.sessionLengthMinutes,
    injuries: draft.injuries,
    programId: program.id,
    programStartedAt: todayIsoDate(),
    equipment: { home, gym },
    createdAt: now,
    updatedAt: now,
  };
}

export function createHomeEquipmentProfile(
  draft: OnboardingDraft,
): EquipmentProfile {
  const dumbbellWeights = parseWeights(draft.home.dumbbellWeights);
  const kettlebells = parseWeights(draft.home.kettlebellWeights);
  const hasWeights = dumbbellWeights.length > 0 || kettlebells.length > 0;

  return {
    dumbbells: dumbbellWeights.length
      ? { kind: "fixed", weights: dumbbellWeights }
      : { kind: "none" },
    barbell: null,
    kettlebells,
    resistanceBands: draft.home.resistanceBands,
    bench: draft.home.bench,
    pullUpBar: draft.home.pullUpBar,
    bodyweightOnly: draft.home.bodyweightOnly || !hasWeights,
  };
}

export function createStandardGymProfile(): EquipmentProfile {
  return {
    dumbbells: { kind: "adjustable", min: 2, max: 40, step: 2 },
    barbell: {
      barWeight: 20,
      plates: [1.25, 2.5, 5, 10, 15, 20],
      smallestIncrement: 2.5,
    },
    kettlebells: [6, 8, 10, 12, 16, 20, 24],
    resistanceBands: true,
    bench: true,
    pullUpBar: true,
    bodyweightOnly: false,
  };
}

export function recommendProgramForDraft(
  draft: Pick<OnboardingDraft, "experienceLevel" | "trainsAtGym">,
  home: EquipmentProfile | null,
  gym: EquipmentProfile | null,
): Program {
  const noLoadedEquipment = !gym && Boolean(home?.bodyweightOnly);
  if (noLoadedEquipment) {
    const homeMinimal = getProgram("home-minimal-3day");
    if (homeMinimal) return homeMinimal;
  }

  if (!draft.trainsAtGym && home?.bodyweightOnly) {
    const homeMinimal = getProgram("home-minimal-3day");
    if (homeMinimal) return homeMinimal;
  }

  return getRecommendedProgram(draft.experienceLevel);
}

export function parseWeights(value: string): number[] {
  return value
    .split(/[, ]+/)
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isFinite(item) && item > 0)
    .sort((a, b) => a - b)
    .filter((item, index, all) => all.indexOf(item) === index);
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}
