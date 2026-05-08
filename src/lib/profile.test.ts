import { describe, expect, it } from "vitest";
import {
  DEFAULT_DRAFT,
  createHomeEquipmentProfile,
  createProfileFromDraft,
  createStandardGymProfile,
  parseWeights,
  recommendProgramForDraft,
} from "./profile";

describe("profile helpers", () => {
  it("parses comma or space separated weights", () => {
    expect(parseWeights("5, 8 10,10, 12")).toEqual([5, 8, 10, 12]);
  });

  it("creates a conservative home bodyweight profile by default", () => {
    expect(createHomeEquipmentProfile(DEFAULT_DRAFT)).toMatchObject({
      bodyweightOnly: true,
      dumbbells: { kind: "none" },
    });
  });

  it("creates a standard commercial gym profile", () => {
    expect(createStandardGymProfile()).toMatchObject({
      bench: true,
      pullUpBar: true,
      dumbbells: { kind: "adjustable", min: 2, max: 40, step: 2 },
    });
  });

  it("recommends home minimal if only bodyweight home equipment exists", () => {
    const home = createHomeEquipmentProfile({
      ...DEFAULT_DRAFT,
      trainsAtGym: false,
    });
    expect(
      recommendProgramForDraft(
        { experienceLevel: "beginner", trainsAtGym: false },
        home,
        null,
      ).id,
    ).toBe("home-minimal-3day");
  });

  it("creates a full profile with dual equipment context", () => {
    const profile = createProfileFromDraft(DEFAULT_DRAFT);
    expect(profile.equipment.home).toBeTruthy();
    expect(profile.equipment.gym).toBeTruthy();
    expect(profile.programId).toBe("foundations-3day");
  });
});
