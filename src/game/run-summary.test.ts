import { describe, expect, it } from "vitest";
import { getRunSummary } from "./run-summary";
import { createInitialState } from "./simulation";

describe("v0.11 commercial run summary", () => {
  it("stays advisory before the run reaches a final moment", () => {
    const summary = getRunSummary(createInitialState());

    expect(summary.isFinal).toBe(false);
    expect(summary.recommendation).toContain("첫 제품");
  });

  it("grades a successful commercial run with strengths and a next recommendation", () => {
    const initial = createInitialState();
    const state = {
      ...initial,
      month: 10,
      status: "success" as const,
      activeProducts: ["ai_writing_assistant", "meeting_summary_bot"],
      competitorStates: [
        ...initial.competitorStates,
        {
          id: "competitor_chatgody",
          score: 180,
          marketShare: 32,
          momentum: 4,
          claimedProducts: ["meeting_summary_bot"],
          researchLevel: 3,
          lastMove: "회의 요약 봇을 기업 번들로 압박",
        },
      ],
      productReviews: {
        ai_writing_assistant: { grade: "B", score: 72, quote: "쓸 만한 첫 제품" },
        meeting_summary_bot: { grade: "A", score: 91, quote: "회의 시간이 줄었다" },
      },
      roguelite: {
        ...initial.roguelite,
        rewardHistory: [
          {
            rewardId: "reward_1",
            productId: "meeting_summary_bot",
            chosenCardId: "customer_interviews",
            month: 7,
          },
        ],
      },
      unlockedAchievements: ["first_release", "two_product_company", "market_foothold"],
      resources: {
        ...initial.resources,
        users: 2300,
        cash: 8200,
        trust: 54,
        automation: 12,
      },
    };
    const summary = getRunSummary(state);

    expect(summary.isFinal).toBe(true);
    expect(["S", "A", "B"]).toContain(summary.rank);
    expect(summary.strengths.some((strength) => strength.includes("제품"))).toBe(true);
    expect(summary.recommendation.length).toBeGreaterThan(10);
    expect(summary.spotlight.bestProduct).toMatchObject({
      name: "회의 요약 봇",
      grade: "A",
      score: 91,
      domainName: "개인 생산성",
    });
    expect(summary.spotlight.representativeCard?.name).toBe("고객 인터뷰");
    expect(summary.spotlight.rivalPressure?.name).toContain("챗");
    expect(summary.spotlight.insightReward).toBeGreaterThanOrEqual(1);
  });

  it("marks a failed run as final and gives recovery advice", () => {
    const state = {
      ...createInitialState(),
      month: 5,
      status: "failure" as const,
      resources: {
        ...createInitialState().resources,
        cash: 0,
        trust: 7,
      },
    };
    const summary = getRunSummary(state);

    expect(summary.isFinal).toBe(true);
    expect(summary.rank).toBe("D");
    expect(summary.recommendation).toContain("현금");
    expect(summary.spotlight.failureReasons).toContain("현금 흐름 붕괴");
    expect(summary.spotlight.nextRunHook).toContain("다음 런");
  });

  it("penalizes aggressive growth runs that end with heavy negative cash", () => {
    const state = {
      ...createInitialState(),
      month: 11,
      activeProducts: ["ai_writing_assistant", "meeting_summary_bot"],
      unlockedAchievements: ["first_release", "two_product_company", "market_foothold", "ten_month_survivor"],
      resources: {
        ...createInitialState().resources,
        cash: -9000,
        users: 10000,
        trust: 88,
        automation: 5,
      },
    };
    const summary = getRunSummary(state);

    expect(summary.rank).not.toBe("S");
    expect(summary.recommendation).toContain("현금");
  });
});
