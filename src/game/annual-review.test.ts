import { describe, expect, it } from "vitest";
import { annualReviews } from "./data";
import {
  getAnnualReviewForMonth,
  getAnnualReviewProgress,
  getCurrentAnnualReview,
  getDueAnnualReviewResult,
} from "./annual-review";
import { advanceMonth, createInitialState, hydrateGameState, serializeGameState } from "./simulation";
import type { GameState } from "./types";

describe("v0.14.3 annual review foundation", () => {
  it("defines ten annual review milestones for the 10-year campaign", () => {
    expect(annualReviews).toHaveLength(10);
    expect(annualReviews.map((review) => review.month)).toEqual([12, 24, 36, 48, 60, 72, 84, 96, 108, 120]);
  });

  it("selects the current annual review from campaign month", () => {
    expect(getCurrentAnnualReview(createInitialState()).id).toBe("year_1_local_demo_day");
    expect(getAnnualReviewForMonth(49)?.id).toBe("year_5_platform_pressure");
  });

  it("reports readable progress toward the current annual review", () => {
    const progress = getAnnualReviewProgress(getCurrentAnnualReview(createInitialState()), createInitialState());

    expect(progress.items.length).toBeGreaterThanOrEqual(2);
    expect(progress.items.every((item) => item.label && item.currentLabel && item.targetLabel)).toBe(true);
    expect(progress.progressPercent).toBeGreaterThanOrEqual(0);
  });

  it("awards a passed annual review when a year-end state meets all goals", () => {
    const state = createYearOneReadyState();
    const result = getDueAnnualReviewResult(state);

    expect(result?.passed).toBe(true);
    expect(result?.reward.cash).toBeGreaterThan(0);
  });

  it("applies annual review rewards and records history when advancing into month 12", () => {
    const state = {
      ...createYearOneReadyState(),
      month: 11,
      annualReviewHistory: [],
    };
    const next = advanceMonth(state);

    expect(next.month).toBe(12);
    expect(next.annualReviewHistory).toHaveLength(1);
    expect(next.annualReviewHistory[0]).toMatchObject({
      reviewId: "year_1_local_demo_day",
      year: 1,
      passed: true,
    });
    expect(next.resources.cash).toBeGreaterThan(state.resources.cash);
    expect(next.timeline[0]).toContain("연간 심사");
  });

  it("hydrates legacy saves without annual review history", () => {
    const serialized = serializeGameState(createInitialState());
    const parsed = JSON.parse(serialized);
    delete parsed.state.annualReviewHistory;

    const hydrated = hydrateGameState(JSON.stringify(parsed));

    expect(hydrated.annualReviewHistory).toEqual([]);
  });
});

function createYearOneReadyState(): GameState {
  return {
    ...createInitialState(),
    month: 12,
    activeProducts: ["foundation_model_v0", "ai_writing_assistant"],
    resources: {
      ...createInitialState().resources,
      cash: 12000,
      users: 1800,
      trust: 42,
      hype: 30,
      automation: 8,
    },
  };
}
