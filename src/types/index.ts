export type ExperienceLevel = "beginner" | "returning" | "intermediate" | "advanced";
export type Goal = "strength" | "tone" | "fitness" | "weight_loss" | "general_health";
export type Units = "kg" | "lb";
export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export interface UserProfile {
  id: string;
  name?: string;
  goal: Goal;
  experienceLevel: ExperienceLevel;
  units: Units;
  availableDays: Weekday[];
  sessionLengthMinutes: 20 | 30 | 45 | 60;
  injuries: InjuryFlag[];
  programId: string;
  programStartedAt: string;
  equipment: EquipmentProfile;
  createdAt: string;
  updatedAt: string;
}

export interface InjuryFlag {
  area: "lower_back" | "knee" | "shoulder" | "wrist" | "elbow" | "hip" | "ankle" | "neck" | "other";
  notes?: string;
  active: boolean;
}

export interface EquipmentProfile {
  dumbbells: DumbbellSet;
  barbell: BarbellSet | null;
  kettlebells: number[];
  resistanceBands: boolean;
  bench: boolean;
  pullUpBar: boolean;
  bodyweightOnly: boolean;
}

export type DumbbellSet =
  | { kind: "fixed"; weights: number[] }
  | { kind: "adjustable"; min: number; max: number; step: number }
  | { kind: "none" };

export interface BarbellSet {
  barWeight: number;
  plates: number[];
  smallestIncrement: number;
}

export type MovementPattern =
  | "squat"
  | "hinge"
  | "lunge"
  | "push_horizontal"
  | "push_vertical"
  | "pull_horizontal"
  | "pull_vertical"
  | "core"
  | "carry"
  | "conditioning"
  | "mobility";

export type EquipmentRequirement =
  | "bodyweight"
  | "dumbbells"
  | "barbell"
  | "kettlebell"
  | "bench"
  | "pull_up_bar"
  | "resistance_band";

export type TrackingType = "weight_reps" | "reps_only" | "timed" | "distance" | "mobility";

export interface Exercise {
  id: string;
  name: string;
  movementPattern: MovementPattern;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  equipment: EquipmentRequirement[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  trackingType: TrackingType;
  setupSteps: string[];
  executionSteps: string[];
  coachingCues: string[];
  commonMistakes: string[];
  safetyNotes?: string[];
  easierVariation?: string;
  harderVariation?: string;
  substitutes: string[];
  contraindications?: InjuryFlag["area"][];
  defaultRepRange: { min: number; max: number };
  defaultSets: number;
  defaultRestSeconds: number;
  demoMediaUrl?: string;
}

export interface Program {
  id: string;
  name: string;
  description: string;
  daysPerWeek: 3 | 4 | 5;
  difficulty: ExperienceLevel;
  equipmentRequired: EquipmentRequirement[];
  templateIds: string[];
}

export interface WorkoutTemplate {
  id: string;
  programId: string;
  dayLabel: string;
  estimatedMinutes: number;
  difficulty: 1 | 2 | 3 | 4 | 5;
  blocks: WorkoutBlock[];
}

export interface WorkoutBlock {
  id: string;
  type: "warmup" | "main" | "accessory" | "finisher" | "cooldown";
  exercises: PlannedExercise[];
}

export interface PlannedExercise {
  exerciseId: string;
  sets: number;
  repRange: { min: number; max: number };
  restSeconds: number;
  notes?: string;
}

export type SessionStatus = "in_progress" | "completed" | "abandoned" | "partial";
export type EffortBand = "easy" | "just_right" | "hard";
export type ExerciseOutcome = "completed" | "partial" | "skipped" | "too_hard" | "pain";

export interface WorkoutSession {
  id: string;
  userId: string;
  templateId: string;
  startedAt: string;
  completedAt?: string;
  status: SessionStatus;
  durationMinutes?: number;
  overallEffort?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  notes?: string;
  painReported: boolean;
  exerciseResults: ExerciseResult[];
}

export interface ExerciseResult {
  id: string;
  exerciseId: string;
  outcome: ExerciseOutcome;
  setResults: SetResult[];
  notes?: string;
  painArea?: InjuryFlag["area"];
  substitutedFrom?: string;
}

export interface SetResult {
  setNumber: number;
  targetReps: { min: number; max: number };
  actualReps: number;
  targetWeight?: number;
  actualWeight?: number;
  unit?: Units;
  effort: EffortBand;
  completed: boolean;
  loggedAt: string;
}

export interface BodyMetric {
  id: string;
  date: string;
  bodyWeight?: number;
  waist?: number;
  hips?: number;
  notes?: string;
}

export interface DailyCheckIn {
  id: string;
  date: string;
  energy?: 1 | 2 | 3 | 4 | 5;
  soreness?: 1 | 2 | 3 | 4 | 5;
  sleepHours?: number;
  sleepQuality?: 1 | 2 | 3 | 4 | 5;
  mood?: 1 | 2 | 3 | 4 | 5;
}

export interface ExerciseProgressionState {
  exerciseId: string;
  lastSessionDate: string;
  lastSets: SetResult[];
  currentTargetWeight?: number;
  currentTargetRepRange: { min: number; max: number };
  consecutiveSuccesses: number;
  lastFlaggedPain: boolean;
  lastFlaggedTooHard: boolean;
  recommendation: ProgressionRecommendation;
}

export interface ProgressionRecommendation {
  action:
    | "increase_weight"
    | "hold"
    | "decrease_weight"
    | "decrease_reps"
    | "substitute"
    | "first_session";
  suggestedWeight?: number;
  suggestedReps: { min: number; max: number };
  reason: string;
  substituteExerciseId?: string;
}
