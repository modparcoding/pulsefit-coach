import type {
  BodyMetric,
  DailyCheckIn,
  ExerciseProgressionState,
  UserProfile,
  WorkoutSession,
} from "../types";

export interface Repository {
  getProfile(): Promise<UserProfile | null>;
  saveProfile(profile: UserProfile): Promise<void>;

  getSession(id: string): Promise<WorkoutSession | null>;
  saveSession(session: WorkoutSession): Promise<void>;
  listSessions(options?: {
    limit?: number;
    since?: string;
  }): Promise<WorkoutSession[]>;

  getProgressionState(
    exerciseId: string,
  ): Promise<ExerciseProgressionState | null>;
  saveProgressionState(state: ExerciseProgressionState): Promise<void>;

  saveBodyMetric(metric: BodyMetric): Promise<void>;
  listBodyMetrics(options?: { since?: string }): Promise<BodyMetric[]>;

  saveCheckIn(checkIn: DailyCheckIn): Promise<void>;
  listCheckIns(options?: { since?: string }): Promise<DailyCheckIn[]>;

  exportAll(): Promise<string>;
  importAll(json: string): Promise<void>;
  clearAll(): Promise<void>;
}

export interface StorageMeta {
  schemaVersion: number;
  lastBackup?: string;
}

export const STORAGE_KEYS = {
  profile: "fc:profile",
  session: (id: string) => `fc:session:${id}`,
  sessionsIndex: "fc:sessions:index",
  progression: (exerciseId: string) => `fc:progression:${exerciseId}`,
  bodyMetrics: "fc:metrics:body",
  checkIns: "fc:metrics:checkin",
  meta: "fc:meta",
} as const;

export const CURRENT_SCHEMA_VERSION = 1;
