import { describe, expect, it } from "vitest";
import { createInitialState, hydrateGameState, serializeGameState } from "./simulation";
import { validateGameStateIntegrity } from "./state-integrity";

describe("v0.11 save integrity and recovery", () => {
  it("recovers to a playable initial state when saved JSON is corrupt", () => {
    const recovered = hydrateGameState("{bad json");

    expect(recovered.status).toBe("playing");
    expect(recovered.month).toBe(createInitialState().month);
    expect(recovered.timeline[0]).toContain("저장 데이터 복구 실패");
  });

  it("sanitizes non-numeric resource values during hydration", () => {
    const corrupted = JSON.stringify({
      version: 2,
      state: {
        ...createInitialState(),
        resources: {
          ...createInitialState().resources,
          cash: null,
          users: "many",
        },
      },
    });
    const hydrated = hydrateGameState(corrupted);

    expect(hydrated.resources.cash).toBe(createInitialState().resources.cash);
    expect(hydrated.resources.users).toBe(createInitialState().resources.users);
    expect(validateGameStateIntegrity(hydrated).issues).toEqual([]);
  });

  it("reports integrity issues for malformed runtime state snapshots", () => {
    const report = validateGameStateIntegrity({
      ...createInitialState(),
      activeProducts: ["missing_product"],
      resources: {
        ...createInitialState().resources,
        cash: Number.NaN,
      },
    });

    expect(report.ok).toBe(false);
    expect(report.issues.some((issue) => issue.includes("cash"))).toBe(true);
    expect(report.issues.some((issue) => issue.includes("missing_product"))).toBe(true);
  });

  it("keeps valid saves free of integrity issues", () => {
    const hydrated = hydrateGameState(serializeGameState(createInitialState()));

    expect(validateGameStateIntegrity(hydrated)).toMatchObject({ ok: true, issues: [] });
  });
});
