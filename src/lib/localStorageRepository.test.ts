import { beforeEach, describe, expect, it } from "vitest";
import type {
  BodyMetric,
  DailyCheckIn,
  UserProfile,
  WorkoutDraft,
  WorkoutSession,
} from "../types";
import { LocalStorageRepository } from "./localStorageRepository";

const profile: UserProfile = {
  id: "user-1",
  goal: "strength",
  experienceLevel: "beginner",
  units: "kg",
  availableDays: ["mon", "wed", "fri"],
  sessionLengthMinutes: 45,
  injuries: [],
  programId: "foundations-3-day",
  programStartedAt: "2026-05-08",
  equipment: {
    home: {
      dumbbells: { kind: "fixed", weights: [5, 8, 10, 12] },
      barbell: null,
      kettlebells: [8, 12],
      resistanceBands: true,
      bench: true,
      pullUpBar: false,
      bodyweightOnly: false,
    },
    gym: null,
  },
  createdAt: "2026-05-08T08:00:00.000Z",
  updatedAt: "2026-05-08T08:00:00.000Z",
};

const session: WorkoutSession = {
  id: "session-1",
  userId: "user-1",
  templateId: "foundations-a",
  context: "home",
  startedAt: "2026-05-08T09:00:00.000Z",
  completedAt: "2026-05-08T09:40:00.000Z",
  status: "completed",
  durationMinutes: 40,
  overallEffort: 7,
  painReported: false,
  exerciseResults: [],
};

const draft: WorkoutDraft = {
  userId: "user-1",
  templateId: "foundations-a",
  context: "home",
  startedAt: "2026-05-08T09:00:00.000Z",
  exerciseIndex: 1,
  setIndex: 0,
  phase: "exercise",
  results: [],
  updatedAt: "2026-05-08T09:10:00.000Z",
};

describe("LocalStorageRepository", () => {
  let repository: LocalStorageRepository;
  let storage: Storage;

  beforeEach(() => {
    storage = new MemoryStorage();
    repository = new LocalStorageRepository(storage);
  });

  it("saves and loads a profile", async () => {
    await repository.saveProfile(profile);

    await expect(repository.getProfile()).resolves.toEqual(profile);
  });

  it("saves, loads, and lists sessions newest first", async () => {
    await repository.saveSession(session);
    await repository.saveSession({
      ...session,
      id: "session-2",
      startedAt: "2026-05-09T09:00:00.000Z",
    });

    await expect(repository.getSession("session-1")).resolves.toEqual(session);
    await expect(repository.listSessions()).resolves.toMatchObject([
      { id: "session-2" },
      { id: "session-1" },
    ]);
  });

  it("deletes a saved session", async () => {
    await repository.saveSession(session);

    await repository.deleteSession(session.id);

    await expect(repository.getSession(session.id)).resolves.toBeNull();
    await expect(repository.listSessions()).resolves.toEqual([]);
  });

  it("saves body metrics and check-ins", async () => {
    const metric: BodyMetric = {
      id: "metric-1",
      date: "2026-05-08",
      bodyWeight: 70,
    };
    const checkIn: DailyCheckIn = {
      id: "checkin-1",
      date: "2026-05-08",
      energy: 4,
    };

    await repository.saveBodyMetric(metric);
    await repository.saveCheckIn(checkIn);

    await expect(repository.listBodyMetrics()).resolves.toEqual([metric]);
    await expect(repository.listCheckIns()).resolves.toEqual([checkIn]);
  });

  it("saves and clears an in-progress workout draft", async () => {
    await repository.saveWorkoutDraft(draft);

    await expect(repository.getWorkoutDraft()).resolves.toEqual(draft);

    await repository.clearWorkoutDraft();

    await expect(repository.getWorkoutDraft()).resolves.toBeNull();
  });

  it("exports and imports all user data", async () => {
    await repository.saveProfile(profile);
    await repository.saveSession(session);
    await repository.saveWorkoutDraft(draft);
    const exported = await repository.exportAll();

    const nextRepository = new LocalStorageRepository(new MemoryStorage());
    await nextRepository.importAll(exported);

    await expect(nextRepository.getProfile()).resolves.toEqual(profile);
    await expect(nextRepository.listSessions()).resolves.toEqual([session]);
    await expect(nextRepository.getWorkoutDraft()).resolves.toEqual(draft);
  });

  it("clears all fitness coach data", async () => {
    await repository.saveProfile(profile);
    await repository.saveSession(session);
    await repository.clearAll();

    await expect(repository.getProfile()).resolves.toBeNull();
    await expect(repository.listSessions()).resolves.toEqual([]);
  });
});

class MemoryStorage implements Storage {
  private readonly data = new Map<string, string>();

  get length(): number {
    return this.data.size;
  }

  clear(): void {
    this.data.clear();
  }

  getItem(key: string): string | null {
    return this.data.get(key) ?? null;
  }

  key(index: number): string | null {
    return Array.from(this.data.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.data.delete(key);
  }

  setItem(key: string, value: string): void {
    this.data.set(key, value);
  }
}
