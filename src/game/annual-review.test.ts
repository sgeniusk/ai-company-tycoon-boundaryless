import { describe, expect, it } from "vitest";
import { annualDirectiveChoices, annualReviews } from "./data";
import {
  chooseAnnualDirective,
  getAnnualReviewForMonth,
  getActiveAnnualDirective,
  getAnnualDirectiveChoiceRows,
  getAnnualReviewProgress,
  getCurrentAnnualReview,
  getDueAnnualReviewResult,
} from "./annual-review";
import { advanceMonth, calculateMonthlyEconomy, createInitialState, hydrateGameState, serializeGameState } from "./simulation";
import type { GameState } from "./types";

describe("v0.14.5 annual directive choices", () => {
  it("defines ten annual review milestones for the 10-year campaign", () => {
    expect(annualReviews).toHaveLength(10);
    expect(annualReviews.map((review) => review.month)).toEqual([12, 24, 36, 48, 60, 72, 84, 96, 108, 120]);
  });

  it("defines pass and recovery directives for each annual review", () => {
    expect(
      annualReviews.every((review) => review.directive.passed.title && review.directive.recovery.title),
    ).toBe(true);
    expect(annualReviews[0].directive.passed.monthly_effects.cash).toBeGreaterThan(0);
    expect(annualReviews[0].directive.recovery.monthly_effects.cash).toBeGreaterThan(0);
  });

  it("defines a reusable pool of annual directive choices", () => {
    expect(annualDirectiveChoices.length).toBeGreaterThanOrEqual(6);
    expect(annualDirectiveChoices.every((choice) => choice.title && choice.monthly_effects && choice.recommended_menu)).toBe(true);
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

  it("creates a next-year directive after an annual review and applies its monthly effects", () => {
    const state = {
      ...createYearOneReadyState(),
      month: 11,
      annualReviewHistory: [],
    };
    const reviewed = advanceMonth(state);

    expect(reviewed.annualDirective).toMatchObject({
      reviewId: "year_1_local_demo_day",
      source: "passed",
      expiresMonth: 24,
    });
    expect(reviewed.pendingAnnualDirectiveChoices?.offeredDirectiveIds).toHaveLength(3);
    expect(getActiveAnnualDirective(reviewed)?.title).toContain("투자자");

    const economy = calculateMonthlyEconomy(reviewed);
    expect(economy.strategyEffects?.cash).toBeGreaterThanOrEqual(reviewed.annualDirective?.monthlyEffects.cash ?? 0);
  });

  it("lets the player choose one of the offered annual directives", () => {
    const reviewed = advanceMonth({
      ...createYearOneReadyState(),
      month: 11,
      annualReviewHistory: [],
    });
    const choices = getAnnualDirectiveChoiceRows(reviewed);
    const selectedChoice = choices.find((choice) => choice.id === "product_launch_marathon") ?? choices[0];
    const chosen = chooseAnnualDirective(selectedChoice.id, reviewed);

    expect(choices).toHaveLength(3);
    expect(chosen.pendingAnnualDirectiveChoices).toBeUndefined();
    expect(chosen.annualDirective).toMatchObject({
      reviewId: "year_1_local_demo_day",
      title: selectedChoice.title,
      recommendedMenu: selectedChoice.recommended_menu,
    });
    expect(chosen.timeline[0]).toContain("연간 지시 선택");
  });

  it("ignores expired annual directives after the next review month", () => {
    const reviewed = advanceMonth({
      ...createYearOneReadyState(),
      month: 11,
      annualReviewHistory: [],
    });
    const expired = {
      ...reviewed,
      month: reviewed.annualDirective?.expiresMonth ?? 24,
    };

    expect(getActiveAnnualDirective(expired)).toBeUndefined();
    expect(calculateMonthlyEconomy(expired).strategyEffects?.cash ?? 0).toBe(0);
  });

  it("hydrates legacy saves without annual review history", () => {
    const serialized = serializeGameState(createInitialState());
    const parsed = JSON.parse(serialized);
    delete parsed.state.annualReviewHistory;
    delete parsed.state.annualDirective;
    delete parsed.state.pendingAnnualDirectiveChoices;

    const hydrated = hydrateGameState(JSON.stringify(parsed));

    expect(hydrated.annualReviewHistory).toEqual([]);
    expect(hydrated.annualDirective).toBeUndefined();
    expect(hydrated.pendingAnnualDirectiveChoices).toBeUndefined();
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
