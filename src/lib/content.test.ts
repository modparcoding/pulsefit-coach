import { describe, expect, it } from "vitest";
import {
  EXERCISES,
  PROGRAMS,
  TEMPLATES,
  getRecommendedProgram,
  getTemplate,
  getTemplatesForProgram,
} from "./content";

describe("static content", () => {
  it("resolves every exercise variation and substitute reference", () => {
    for (const exercise of Object.values(EXERCISES)) {
      const references = [
        exercise.easierVariation,
        exercise.harderVariation,
        exercise.bodyweightSubstitute,
        ...exercise.substitutes,
      ].filter(Boolean);

      for (const reference of references) {
        expect(EXERCISES[reference!], `${exercise.id} -> ${reference}`).toBeDefined();
      }
    }
  });

  it("requires every weighted exercise to have a bodyweight substitute", () => {
    for (const exercise of Object.values(EXERCISES)) {
      if (exercise.trackingType === "weight_reps") {
        expect(exercise.bodyweightSubstitute, exercise.id).toBeTruthy();
      }
    }
  });

  it("resolves every template exercise reference", () => {
    for (const template of Object.values(TEMPLATES)) {
      for (const block of template.blocks) {
        for (const plannedExercise of block.exercises) {
          expect(EXERCISES[plannedExercise.exerciseId], `${template.id} -> ${plannedExercise.exerciseId}`).toBeDefined();
        }
      }
    }
  });

  it("resolves every template program reference", () => {
    for (const template of Object.values(TEMPLATES)) {
      expect(PROGRAMS[template.programId], template.id).toBeDefined();
    }
  });

  it("resolves every program template reference", () => {
    for (const program of Object.values(PROGRAMS)) {
      for (const templateId of program.templateIds) {
        expect(getTemplate(templateId), `${program.id} -> ${templateId}`).toBeTruthy();
      }
    }
  });

  it("matches each program template count to daysPerWeek", () => {
    for (const program of Object.values(PROGRAMS)) {
      expect(program.templateIds.length, program.id).toBe(program.daysPerWeek);
      expect(getTemplatesForProgram(program.id).length, program.id).toBe(program.daysPerWeek);
    }
  });

  it("populates every required exercise field", () => {
    for (const exercise of Object.values(EXERCISES)) {
      expect(exercise.id).toBeTruthy();
      expect(exercise.name).toBeTruthy();
      expect(exercise.movementPattern).toBeTruthy();
      expect(exercise.primaryMuscles.length, exercise.id).toBeGreaterThan(0);
      expect(exercise.secondaryMuscles.length, exercise.id).toBeGreaterThan(0);
      expect(exercise.equipment.length, exercise.id).toBeGreaterThan(0);
      expect(exercise.difficulty).toBeTruthy();
      expect(exercise.trackingType).toBeTruthy();
      expect(exercise.setupSteps.length, exercise.id).toBeGreaterThan(0);
      expect(exercise.executionSteps.length, exercise.id).toBeGreaterThan(0);
      expect(exercise.coachingCues.length, exercise.id).toBeGreaterThan(0);
      expect(exercise.commonMistakes.length, exercise.id).toBeGreaterThan(0);
      expect(exercise.substitutes).toBeDefined();
      expect(exercise.startingFraction).toBeDefined();
      expect(exercise.defaultRepRange).toBeDefined();
      expect(exercise.defaultSets).toBeDefined();
      expect(exercise.defaultRestSeconds).toBeDefined();
    }
  });

  it("uses valid starting fractions", () => {
    for (const exercise of Object.values(EXERCISES)) {
      expect(exercise.startingFraction, exercise.id).toBeGreaterThanOrEqual(0);
      if (exercise.trackingType === "weight_reps") {
        expect(exercise.startingFraction, exercise.id).toBeGreaterThan(0);
      }
    }
  });

  it("uses valid default rep ranges", () => {
    for (const exercise of Object.values(EXERCISES)) {
      expect(exercise.defaultRepRange.min, exercise.id).toBeLessThanOrEqual(exercise.defaultRepRange.max);
    }
  });

  it("recommends Foundations 3-day for beginners", () => {
    expect(getRecommendedProgram("beginner")).toBe(PROGRAMS["foundations-3day"]);
  });
});
