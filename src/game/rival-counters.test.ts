import { describe, expect, it } from "vitest";
import { createInitialState } from "./simulation";
import { getRivalCounterPlans, getRivalCounterTargetId } from "./rival-counters";
import type { GameState } from "./types";

describe("v0.12.6 rival counter planning", () => {
  it("turns claimed rival pressure into card, product, and research recommendations", () => {
    const state = createContestedProductivityState();
    const plans = getRivalCounterPlans(state);

    expect(plans[0]).toMatchObject({
      competitorId: "competitor_chatgody",
      severity: "contested",
    });
    expect(plans[0].counterCardIds).toEqual(expect.arrayContaining(["market_repositioning", "rival_benchmark_room"]));
    expect(plans[0].recommendedProductIds).toContain("meeting_summary_bot");
    expect(plans[0].recommendedCapabilityIds).toContain("language");
    expect(plans[0].pressureScore).toBeGreaterThan(40);
  });

  it("chooses the highest pressure rival as the default counter-card target", () => {
    const state = createContestedProductivityState();

    expect(getRivalCounterTargetId(state)).toBe("competitor_chatgody");
  });
});

function createContestedProductivityState(): GameState {
  const initial = createInitialState();

  return {
    ...initial,
    month: 5,
    chosenGrowthPath: {
      id: "productivity_line",
      title: "생산성 제품 라인 확장",
      month: 3,
      bonusDescription: "생산성 제품군을 빠르게 넓힙니다.",
      effects: {},
      monthlyEffects: {},
    },
    competitorStates: initial.competitorStates.map((competitor) =>
      competitor.id === "competitor_chatgody"
        ? {
            ...competitor,
            score: 120,
            marketShare: 31,
            momentum: 6,
            claimedProducts: ["meeting_summary_bot"],
            lastMove: "회의 요약 봇 시장 선점",
          }
        : competitor,
    ),
  };
}
