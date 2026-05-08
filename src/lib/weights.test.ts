import { describe, expect, it } from "vitest";
import type { EquipmentProfile, Exercise } from "@/types";
import { availableWeightsForExercise, estimateStartingWeight } from "./weights";

const dumbbellExercise = {
  equipment: ["dumbbells"],
  startingFraction: 0.12,
} as Pick<Exercise, "equipment" | "startingFraction">;

const fixedEquipment: EquipmentProfile = {
  dumbbells: { kind: "fixed", weights: [12, 5, 8] },
  barbell: null,
  kettlebells: [16, 8],
  resistanceBands: false,
  bench: false,
  pullUpBar: false,
  bodyweightOnly: false,
};

describe("weight helpers", () => {
  it("returns sorted fixed dumbbell weights", () => {
    expect(
      availableWeightsForExercise(dumbbellExercise, fixedEquipment),
    ).toEqual([5, 8, 12]);
  });

  it("generates adjustable dumbbell weights", () => {
    expect(
      availableWeightsForExercise(dumbbellExercise, {
        ...fixedEquipment,
        dumbbells: { kind: "adjustable", min: 2, max: 8, step: 2 },
      }),
    ).toEqual([2, 4, 6, 8]);
  });

  it("snaps a starting suggestion down to available equipment", () => {
    expect(
      estimateStartingWeight(dumbbellExercise, fixedEquipment, "beginner", 65),
    ).toBe(5);
  });

  it("does not suggest weight for bodyweight exercises", () => {
    expect(
      estimateStartingWeight(
        { equipment: ["bodyweight"], startingFraction: 0 },
        fixedEquipment,
        "beginner",
      ),
    ).toBeUndefined();
  });
});
