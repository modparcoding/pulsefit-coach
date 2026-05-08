import type {
  EquipmentProfile,
  Exercise,
  ExerciseProgressionState,
  ExerciseResult,
  PlannedExercise,
  ProgressionRecommendation,
  SetResult,
  UserProfile,
  WorkoutSession,
} from "@/types";
import {
  decrementWeight,
  estimateStartingWeight,
  incrementWeight,
} from "./weights";

export function getLastExerciseResult(
  sessions: WorkoutSession[],
  exerciseId: string,
): ExerciseResult | null {
  for (const session of sessions) {
    const result = session.exerciseResults.find(
      (item) => item.exerciseId === exerciseId,
    );
    if (result) return result;
  }
  return null;
}

export function recommendExercise({
  equipment,
  exercise,
  experienceLevel,
  lastResult,
  plannedExercise,
}: {
  equipment: EquipmentProfile | null;
  exercise: Exercise;
  experienceLevel: UserProfile["experienceLevel"];
  lastResult: ExerciseResult | null;
  plannedExercise: PlannedExercise;
}): ProgressionRecommendation {
  if (!lastResult || lastResult.setResults.length === 0) {
    return {
      action: "first_session",
      suggestedWeight: estimateStartingWeight(
        exercise,
        equipment,
        experienceLevel,
      ),
      suggestedReps: plannedExercise.repRange,
      reason:
        "First time logging this here. Start conservative and let the app calibrate from today.",
    };
  }

  if (lastResult.outcome === "pain") {
    return {
      action: "substitute",
      substituteExerciseId:
        exercise.bodyweightSubstitute ??
        exercise.easierVariation ??
        exercise.substitutes[0],
      suggestedReps: plannedExercise.repRange,
      reason:
        "You flagged pain last time. Swap this today and do not push through sharp pain.",
    };
  }

  const lastSets = lastResult.setResults.filter((set) => set.completed);
  const lastWeight = lastSets.find(
    (set) => typeof set.actualWeight === "number",
  )?.actualWeight;
  const hitTopOnAllSets =
    lastSets.length >= plannedExercise.sets &&
    lastSets.every((set) => set.actualReps >= plannedExercise.repRange.max);
  const missedReps = lastSets.some(
    (set) => set.actualReps < plannedExercise.repRange.min,
  );
  const anyHardEffort = lastSets.some((set) => set.effort === "hard");
  const allEasyEffort =
    lastSets.length > 0 && lastSets.every((set) => set.effort === "easy");
  const flaggedTooHard = lastResult.outcome === "too_hard";

  if (missedReps || flaggedTooHard) {
    const suggestedWeight = decrementWeight(lastWeight, exercise, equipment);
    return {
      action: suggestedWeight ? "decrease_weight" : "decrease_reps",
      suggestedWeight,
      suggestedReps: plannedExercise.repRange,
      reason: suggestedWeight
        ? `Last time was tough. Drop to ${suggestedWeight} and make the reps feel clean.`
        : "Last time was tough. Reduce the reps and keep the movement controlled.",
    };
  }

  if (hitTopOnAllSets && !anyHardEffort) {
    const suggestedWeight = incrementWeight(
      lastWeight,
      exercise,
      equipment,
      allEasyEffort ? 2 : 1,
    );
    return {
      action:
        suggestedWeight && suggestedWeight !== lastWeight
          ? "increase_weight"
          : "hold",
      suggestedWeight: suggestedWeight ?? lastWeight,
      suggestedReps: plannedExercise.repRange,
      reason:
        suggestedWeight && suggestedWeight !== lastWeight
          ? `You hit the top of the range last time. Let's try ${suggestedWeight} today.`
          : "You hit the top of the range. Hold this level and make it feel smoother.",
    };
  }

  return {
    action: "hold",
    suggestedWeight: lastWeight,
    suggestedReps: plannedExercise.repRange,
    reason: lastWeight
      ? `Same weight today: ${lastWeight}. Aim for the top of the rep range with calm form.`
      : "Same target today. Aim to add a rep or make the movement feel steadier.",
  };
}

export function buildProgressionState({
  exerciseId,
  lastState,
  plannedExercise,
  recommendation,
  result,
  sessionCompletedAt,
}: {
  exerciseId: string;
  lastState: ExerciseProgressionState | null;
  plannedExercise: PlannedExercise;
  recommendation: ProgressionRecommendation;
  result: ExerciseResult;
  sessionCompletedAt: string;
}): ExerciseProgressionState {
  const completedSets = result.setResults.filter((set) => set.completed);
  const hitTopOnAllSets =
    completedSets.length >= plannedExercise.sets &&
    completedSets.every(
      (set) => set.actualReps >= plannedExercise.repRange.max,
    );
  const anyHardEffort = completedSets.some((set) => set.effort === "hard");
  const missedReps = completedSets.some(
    (set) => set.actualReps < plannedExercise.repRange.min,
  );
  const consecutiveSuccesses =
    hitTopOnAllSets && !anyHardEffort
      ? (lastState?.consecutiveSuccesses ?? 0) + 1
      : missedReps || result.outcome === "too_hard"
        ? 0
        : (lastState?.consecutiveSuccesses ?? 0);

  return {
    exerciseId,
    lastSessionDate: sessionCompletedAt,
    lastSets: completedSets,
    currentTargetWeight: completedSets.find(
      (set) => typeof set.actualWeight === "number",
    )?.actualWeight,
    currentTargetRepRange: plannedExercise.repRange,
    consecutiveSuccesses,
    lastFlaggedPain: result.outcome === "pain",
    lastFlaggedTooHard: result.outcome === "too_hard",
    recommendation,
  };
}

export function setSummary(set: SetResult): string {
  return `${set.actualReps}${set.actualWeight ? ` @ ${set.actualWeight}${set.unit}` : ""}`;
}
