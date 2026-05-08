import type {
  EffortBand,
  EquipmentProfile,
  Exercise,
  UserProfile,
} from "@/types";

const EXPERIENCE_MULTIPLIER: Record<UserProfile["experienceLevel"], number> = {
  beginner: 0.85,
  returning: 0.95,
  intermediate: 1,
  advanced: 1.1,
};

export function availableWeightsForExercise(
  exercise: Pick<Exercise, "equipment">,
  equipment: EquipmentProfile | null,
): number[] {
  if (!equipment) return [];

  if (exercise.equipment.includes("dumbbells")) {
    return dumbbellWeights(equipment);
  }

  if (exercise.equipment.includes("kettlebell")) {
    return [...equipment.kettlebells].sort((a, b) => a - b);
  }

  if (exercise.equipment.includes("barbell") && equipment.barbell) {
    return barbellWeights(equipment);
  }

  return [];
}

export function estimateStartingWeight(
  exercise: Pick<Exercise, "equipment" | "startingFraction">,
  equipment: EquipmentProfile | null,
  experienceLevel: UserProfile["experienceLevel"],
  bodyWeight = 65,
): number | undefined {
  const available = availableWeightsForExercise(exercise, equipment);
  if (!available.length || exercise.startingFraction <= 0) return undefined;

  const target =
    bodyWeight *
    exercise.startingFraction *
    EXPERIENCE_MULTIPLIER[experienceLevel];
  return available.filter((weight) => weight <= target).at(-1) ?? available[0];
}

export function incrementWeight(
  currentWeight: number | undefined,
  exercise: Pick<Exercise, "equipment">,
  equipment: EquipmentProfile | null,
  jumps = 1,
): number | undefined {
  const available = availableWeightsForExercise(exercise, equipment);
  if (!available.length) return currentWeight;
  if (typeof currentWeight !== "number") return available[0];

  let nextWeight = currentWeight;
  for (let index = 0; index < jumps; index += 1) {
    const candidate = available.find((weight) => weight > nextWeight);
    if (!candidate) return nextWeight;
    nextWeight = candidate;
  }
  return nextWeight;
}

export function decrementWeight(
  currentWeight: number | undefined,
  exercise: Pick<Exercise, "equipment">,
  equipment: EquipmentProfile | null,
): number | undefined {
  const available = availableWeightsForExercise(exercise, equipment);
  if (!available.length) return currentWeight;
  if (typeof currentWeight !== "number") return available[0];

  const lowerWeights = available.filter((weight) => weight < currentWeight);
  return lowerWeights.at(-1) ?? available[0];
}

export function nextDefaultEffort(previous?: EffortBand): EffortBand {
  return previous ?? "just_right";
}

function dumbbellWeights(equipment: EquipmentProfile): number[] {
  if (equipment.dumbbells.kind === "none") return [];
  if (equipment.dumbbells.kind === "fixed") {
    return [...equipment.dumbbells.weights].sort((a, b) => a - b);
  }

  const weights: number[] = [];
  for (
    let weight = equipment.dumbbells.min;
    weight <= equipment.dumbbells.max;
    weight += equipment.dumbbells.step
  ) {
    weights.push(Number(weight.toFixed(2)));
  }
  return weights;
}

function barbellWeights(equipment: EquipmentProfile): number[] {
  if (!equipment.barbell) return [];

  const weights: number[] = [equipment.barbell.barWeight];
  const maxAddedWeight = equipment.barbell.plates.reduce(
    (total, plate) => total + plate * 2,
    0,
  );
  for (
    let load =
      equipment.barbell.barWeight + equipment.barbell.smallestIncrement;
    load <= equipment.barbell.barWeight + maxAddedWeight;
    load += equipment.barbell.smallestIncrement
  ) {
    weights.push(Number(load.toFixed(2)));
  }

  return weights;
}
