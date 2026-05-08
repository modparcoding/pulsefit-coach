import type {
  BodyMetric,
  DailyCheckIn,
  ExerciseProgressionState,
  UserProfile,
  WorkoutDraft,
  WorkoutSession,
} from "../types";
import {
  CURRENT_SCHEMA_VERSION,
  STORAGE_KEYS,
  type Repository,
  type StorageMeta,
} from "./repository";

type ExportPayload = {
  meta: StorageMeta;
  profile: UserProfile | null;
  sessions: WorkoutSession[];
  progression: ExerciseProgressionState[];
  workoutDraft: WorkoutDraft | null;
  bodyMetrics: BodyMetric[];
  checkIns: DailyCheckIn[];
};

export class LocalStorageRepository implements Repository {
  constructor(private readonly storage: Storage = window.localStorage) {
    this.ensureMeta();
  }

  async getProfile(): Promise<UserProfile | null> {
    return this.read<UserProfile>(STORAGE_KEYS.profile, null);
  }

  async saveProfile(profile: UserProfile): Promise<void> {
    this.write(STORAGE_KEYS.profile, profile);
  }

  async getSession(id: string): Promise<WorkoutSession | null> {
    return this.read<WorkoutSession>(STORAGE_KEYS.session(id), null);
  }

  async saveSession(session: WorkoutSession): Promise<void> {
    this.write(STORAGE_KEYS.session(session.id), session);
    const ids = this.read<string[]>(STORAGE_KEYS.sessionsIndex, []);
    if (!ids.includes(session.id)) {
      this.write(STORAGE_KEYS.sessionsIndex, [session.id, ...ids]);
    }
  }

  async listSessions(
    options: { limit?: number; since?: string } = {},
  ): Promise<WorkoutSession[]> {
    const ids = this.read<string[]>(STORAGE_KEYS.sessionsIndex, []);
    const sessions = ids
      .map((id) =>
        this.read<WorkoutSession | null>(STORAGE_KEYS.session(id), null),
      )
      .filter((session): session is WorkoutSession => Boolean(session))
      .filter((session) => !options.since || session.startedAt >= options.since)
      .sort((a, b) => b.startedAt.localeCompare(a.startedAt));

    return typeof options.limit === "number"
      ? sessions.slice(0, options.limit)
      : sessions;
  }

  async getWorkoutDraft(): Promise<WorkoutDraft | null> {
    return this.read<WorkoutDraft | null>(STORAGE_KEYS.workoutDraft, null);
  }

  async saveWorkoutDraft(draft: WorkoutDraft): Promise<void> {
    this.write(STORAGE_KEYS.workoutDraft, draft);
  }

  async clearWorkoutDraft(): Promise<void> {
    this.storage.removeItem(STORAGE_KEYS.workoutDraft);
  }

  async getProgressionState(
    exerciseId: string,
  ): Promise<ExerciseProgressionState | null> {
    return this.read<ExerciseProgressionState>(
      STORAGE_KEYS.progression(exerciseId),
      null,
    );
  }

  async saveProgressionState(state: ExerciseProgressionState): Promise<void> {
    this.write(STORAGE_KEYS.progression(state.exerciseId), state);
  }

  async saveBodyMetric(metric: BodyMetric): Promise<void> {
    const metrics = this.read<BodyMetric[]>(STORAGE_KEYS.bodyMetrics, []);
    const next = [
      metric,
      ...metrics.filter((item) => item.id !== metric.id),
    ].sort((a, b) => b.date.localeCompare(a.date));
    this.write(STORAGE_KEYS.bodyMetrics, next);
  }

  async listBodyMetrics(
    options: { since?: string } = {},
  ): Promise<BodyMetric[]> {
    return this.read<BodyMetric[]>(STORAGE_KEYS.bodyMetrics, []).filter(
      (metric) => !options.since || metric.date >= options.since,
    );
  }

  async saveCheckIn(checkIn: DailyCheckIn): Promise<void> {
    const checkIns = this.read<DailyCheckIn[]>(STORAGE_KEYS.checkIns, []);
    const next = [
      checkIn,
      ...checkIns.filter((item) => item.id !== checkIn.id),
    ].sort((a, b) => b.date.localeCompare(a.date));
    this.write(STORAGE_KEYS.checkIns, next);
  }

  async listCheckIns(
    options: { since?: string } = {},
  ): Promise<DailyCheckIn[]> {
    return this.read<DailyCheckIn[]>(STORAGE_KEYS.checkIns, []).filter(
      (checkIn) => !options.since || checkIn.date >= options.since,
    );
  }

  async exportAll(): Promise<string> {
    const sessions = await this.listSessions();
    const progression = sessions
      .flatMap((session) =>
        session.exerciseResults.map((result) => result.exerciseId),
      )
      .filter((exerciseId, index, all) => all.indexOf(exerciseId) === index)
      .map((exerciseId) =>
        this.read<ExerciseProgressionState | null>(
          STORAGE_KEYS.progression(exerciseId),
          null,
        ),
      )
      .filter((state): state is ExerciseProgressionState => Boolean(state));

    const payload: ExportPayload = {
      meta: this.read<StorageMeta>(STORAGE_KEYS.meta, {
        schemaVersion: CURRENT_SCHEMA_VERSION,
      }),
      profile: await this.getProfile(),
      sessions,
      progression,
      workoutDraft: await this.getWorkoutDraft(),
      bodyMetrics: await this.listBodyMetrics(),
      checkIns: await this.listCheckIns(),
    };

    this.write(STORAGE_KEYS.meta, {
      ...payload.meta,
      lastBackup: new Date().toISOString(),
    });

    return JSON.stringify(payload, null, 2);
  }

  async importAll(json: string): Promise<void> {
    await this.clearAll();
    const payload = JSON.parse(json) as Partial<ExportPayload>;
    this.write(STORAGE_KEYS.meta, {
      schemaVersion: payload.meta?.schemaVersion ?? CURRENT_SCHEMA_VERSION,
      lastBackup: payload.meta?.lastBackup,
    });

    if (payload.profile) this.write(STORAGE_KEYS.profile, payload.profile);

    this.write(STORAGE_KEYS.sessionsIndex, []);
    for (const session of payload.sessions ?? []) {
      await this.saveSession(session);
    }

    for (const state of payload.progression ?? []) {
      await this.saveProgressionState(state);
    }

    if (payload.workoutDraft) await this.saveWorkoutDraft(payload.workoutDraft);

    this.write(STORAGE_KEYS.bodyMetrics, payload.bodyMetrics ?? []);
    this.write(STORAGE_KEYS.checkIns, payload.checkIns ?? []);
  }

  async clearAll(): Promise<void> {
    const keysToRemove: string[] = [];
    for (let index = 0; index < this.storage.length; index += 1) {
      const key = this.storage.key(index);
      if (key?.startsWith("fc:")) keysToRemove.push(key);
    }
    keysToRemove.forEach((key) => this.storage.removeItem(key));
    this.ensureMeta();
  }

  private ensureMeta(): void {
    const meta = this.read<StorageMeta | null>(STORAGE_KEYS.meta, null);
    if (!meta) {
      this.write(STORAGE_KEYS.meta, { schemaVersion: CURRENT_SCHEMA_VERSION });
    }
  }

  private read<T>(key: string, fallback: T): T {
    const raw = this.storage.getItem(key);
    if (!raw) return fallback;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }

  private write<T>(key: string, value: T): void {
    this.storage.setItem(key, JSON.stringify(value));
  }
}
