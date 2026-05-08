import { describe, expect, it } from "vitest";
import type {
  EquipmentProfile,
  Exercise,
  ExerciseResult,
  PlannedExercise,
  WorkoutSession,
} from "@/types";
import {
  buildProgressionState,
  getLastExerciseResult,
  recommendExercise,
} from "./progression";

const exercise: Exercise = {
  id: "goblet-squat",
  name: "Goblet Squat",
  movementPattern: "squat",
  primaryMuscles: ["quads"],
  secondaryMuscles: ["glutes"],
  equipment: ["dumbbells"],
  difficulty: 2,
  trackingType: "weight_reps",
  setupSteps: ["Hold the dumbbell."],
  executionSteps: ["Squat."],
  coachingCues: ["Chest tall."],
  commonMistakes: ["Rounding."],
  bodyweightSubstitute: "bodyweight-squat",
  startingFraction: 0.12,
  substitutes: ["bodyweight-squat"],
  defaultRepRange: { min: 8, max: 12 },
  defaultSets: 3,
  defaultRestSeconds: 75,
};

const plannedExercise: PlannedExercise = {
  exerciseId: "goblet-squat",
  sets: 3,
  repRange: { min: 8, max: 12 },
  restSeconds: 75,
};

const equipment: EquipmentProfile = {
  dumbbells: { kind: "fixed", weights: [5, 8, 10, 12] },
  barbell: null,
  kettlebells: [],
  resistanceBands: false,
  bench: false,
  pullUpBar: false,
  bodyweightOnly: false,
};

function result(partial: Partial<ExerciseResult> = {}): ExerciseResult {
  return {
    id: "result-1",
    exerciseId: "goblet-squat",
    outcome: "completed",
    setResults: [
      {
        setNumber: 1,
        targetReps: plannedExercise.repRange,
        actualReps: 12,
        actualWeight: 8,
        unit: "kg",
        effort: "just_right",
        completed: true,
        loggedAt: "2026-05-08T10:00:00.000Z",
      },
      {
        setNumber: 2,
        targetReps: plannedExercise.repRange,
        actualReps: 12,
        actualWeight: 8,
        unit: "kg",
        effort: "just_right",
        completed: true,
        loggedAt: "2026-05-08T10:01:00.000Z",
      },
      {
        setNumber: 3,
        targetReps: plannedExercise.repRange,
        actualReps: 12,
        actualWeight: 8,
        unit: "kg",
        effort: "just_right",
        completed: true,
        loggedAt: "2026-05-08T10:02:00.000Z",
      },
    ],
    ...partial,
  };
}

describe("progression", () => {
  it("recommends a first-session starting weight", () => {
    const recommendation = recommendExercise({
      equipment,
      exercise,
      experienceLevel: "beginner",
      lastResult: null,
      plannedExercise,
    });

    expect(recommendation.action).toBe("first_session");
    expect(recommendation.suggestedWeight).toBe(5);
  });

  it("increases when top reps were hit without hard effort", () => {
    const recommendation = recommendExercise({
      equipment,
      exercise,
      experienceLevel: "beginner",
      lastResult: result(),
      plannedExercise,
    });

    expect(recommendation.action).toBe("increase_weight");
    expect(recommendation.suggestedWeight).toBe(10);
  });

  it("decreases when reps were missed", () => {
    const recommendation = recommendExercise({
      equipment,
      exercise,
      experienceLevel: "beginner",
      lastResult: result({
        setResults: result().setResults.map((set) => ({
          ...set,
          actualReps: 6,
        })),
      }),
      plannedExercise,
    });

    expect(recommendation.action).toBe("decrease_weight");
    expect(recommendation.suggestedWeight).toBe(5);
  });

  it("substitutes after pain", () => {
    const recommendation = recommendExercise({
      equipment,
      exercise,
      experienceLevel: "beginner",
      lastResult: result({ outcome: "pain" }),
      plannedExercise,
    });

    expect(recommendation.action).toBe("substitute");
    expect(recommendation.substituteExerciseId).toBe("bodyweight-squat");
  });

  it("finds the newest exercise result from sessions", () => {
    const sessions = [
      {
        startedAt: "2026-05-08T10:00:00.000Z",
        exerciseResults: [result({ id: "new" })],
      },
      {
        startedAt: "2026-05-07T10:00:00.000Z",
        exerciseResults: [result({ id: "old" })],
      },
    ] as WorkoutSession[];

    expect(getLastExerciseResult(sessions, "goblet-squat")?.id).toBe("new");
  });

  it("builds progression state from a completed result", () => {
    const recommendation = recommendExercise({
      equipment,
      exercise,
      experienceLevel: "beginner",
      lastResult: result(),
      plannedExercise,
    });
    const state = buildProgressionState({
      exerciseId: exercise.id,
      lastState: null,
      plannedExercise,
      recommendation,
      result: result(),
      sessionCompletedAt: "2026-05-08T11:00:00.000Z",
    });

    expect(state.consecutiveSuccesses).toBe(1);
    expect(state.currentTargetWeight).toBe(8);
  });
});
