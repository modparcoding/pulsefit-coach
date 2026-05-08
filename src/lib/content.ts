import exercisesJson from "@/data/exercises.json";
import programsJson from "@/data/programs.json";
import templatesJson from "@/data/templates.json";
import type { Exercise, ExperienceLevel, Program, WorkoutTemplate } from "@/types";

const exercises = exercisesJson as Exercise[];
const programs = programsJson as Program[];
const templates = templatesJson as WorkoutTemplate[];

export const EXERCISES: Record<string, Exercise> = byId(exercises);
export const PROGRAMS: Record<string, Program> = byId(programs);
export const TEMPLATES: Record<string, WorkoutTemplate> = byId(templates);

validateContent();

export function getExercise(id: string): Exercise | null {
  return EXERCISES[id] ?? null;
}

export function getProgram(id: string): Program | null {
  return PROGRAMS[id] ?? null;
}

export function getTemplate(id: string): WorkoutTemplate | null {
  return TEMPLATES[id] ?? null;
}

export function getTemplatesForProgram(programId: string): WorkoutTemplate[] {
  const program = getProgram(programId);
  if (!program) return [];
  return program.templateIds
    .map((templateId) => getTemplate(templateId))
    .filter((template): template is WorkoutTemplate => Boolean(template));
}

export function getRecommendedProgram(experience: ExperienceLevel): Program {
  const programId =
    experience === "beginner" || experience === "returning"
      ? "foundations-3day"
      : "upper-lower-4day";
  const program = getProgram(programId);
  if (!program) {
    throw new Error(`Recommended program is missing: ${programId}`);
  }
  return program;
}

export function validateContent(): void {
  validateUniqueIds("exercise", exercises);
  validateUniqueIds("program", programs);
  validateUniqueIds("template", templates);

  for (const exercise of exercises) {
    validateExerciseRequiredFields(exercise);
    validateExerciseReferences(exercise);
    validateExerciseNumbers(exercise);
  }

  for (const template of templates) {
    if (!PROGRAMS[template.programId]) {
      throw new Error(`Template "${template.id}" references missing program "${template.programId}"`);
    }

    for (const block of template.blocks) {
      for (const plannedExercise of block.exercises) {
        if (!EXERCISES[plannedExercise.exerciseId]) {
          throw new Error(
            `Template "${template.id}" references missing exercise "${plannedExercise.exerciseId}"`,
          );
        }
      }
    }
  }

  for (const program of programs) {
    for (const templateId of program.templateIds) {
      if (!TEMPLATES[templateId]) {
        throw new Error(`Program "${program.id}" references missing template "${templateId}"`);
      }
    }

    if (program.templateIds.length !== program.daysPerWeek) {
      throw new Error(
        `Program "${program.id}" has ${program.templateIds.length} templates but daysPerWeek is ${program.daysPerWeek}`,
      );
    }
  }
}

function byId<T extends { id: string }>(items: T[]): Record<string, T> {
  return Object.fromEntries(items.map((item) => [item.id, item]));
}

function validateUniqueIds(label: string, items: { id: string }[]): void {
  const seen = new Set<string>();
  for (const item of items) {
    if (seen.has(item.id)) {
      throw new Error(`Duplicate ${label} id: ${item.id}`);
    }
    seen.add(item.id);
  }
}

function validateExerciseReferences(exercise: Exercise): void {
  const references = [
    exercise.easierVariation,
    exercise.harderVariation,
    exercise.bodyweightSubstitute,
    ...exercise.substitutes,
  ].filter((id): id is string => Boolean(id));

  for (const id of references) {
    if (!EXERCISES[id]) {
      throw new Error(`Exercise "${exercise.id}" references missing exercise "${id}"`);
    }
  }

  if (exercise.trackingType === "weight_reps" && !exercise.bodyweightSubstitute) {
    throw new Error(`Exercise "${exercise.id}" is weight_reps but has no bodyweightSubstitute`);
  }
}

function validateExerciseRequiredFields(exercise: Exercise): void {
  const requiredKeys = [
    "id",
    "name",
    "movementPattern",
    "primaryMuscles",
    "secondaryMuscles",
    "equipment",
    "difficulty",
    "trackingType",
    "setupSteps",
    "executionSteps",
    "coachingCues",
    "commonMistakes",
    "substitutes",
    "startingFraction",
    "defaultRepRange",
    "defaultSets",
    "defaultRestSeconds",
  ] as const;

  for (const key of requiredKeys) {
    const value = exercise[key];
    if (value === undefined || value === null || value === "") {
      throw new Error(`Exercise "${exercise.id}" is missing required field "${key}"`);
    }
    if (Array.isArray(value) && value.length === 0 && key !== "substitutes") {
      throw new Error(`Exercise "${exercise.id}" has empty required array "${key}"`);
    }
  }
}

function validateExerciseNumbers(exercise: Exercise): void {
  if (exercise.startingFraction < 0) {
    throw new Error(`Exercise "${exercise.id}" has negative startingFraction`);
  }

  if (exercise.trackingType === "weight_reps" && exercise.startingFraction <= 0) {
    throw new Error(`Exercise "${exercise.id}" is weight_reps but startingFraction is not > 0`);
  }

  if (exercise.defaultRepRange.min > exercise.defaultRepRange.max) {
    throw new Error(`Exercise "${exercise.id}" has an invalid defaultRepRange`);
  }
}
