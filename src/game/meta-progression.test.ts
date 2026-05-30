import { describe, expect, it } from "vitest";
import { getCampaignEnding } from "./campaign-ending";
import { getNextRunSetupPlan, getRunInsightReward, resetRunWithMetaUnlocks } from "./meta-progression";
import { createInitialState } from "./simulation";

describe("v0.32 next-run setup plan", () => {
  it("keeps standard difficulty run insight rewards unchanged", () => {
    const finished = {
      ...createInitialState({ challengeTierId: "standard" }),
      month: 12,
      status: "success" as const,
      activeProducts: ["ai_writing_assistant", "meeting_summary_bot"],
      resources: {
        ...createInitialState().resources,
        users: 4200,
        trust: 70,
      },
    };

    expect(getRunInsightReward(finished)).toBe(13);
  });

  it("rounds hard difficulty run insight rewards with the tier multiplier", () => {
    const finished = {
      ...createInitialState({ challengeTierId: "hard" }),
      month: 12,
      status: "success" as const,
      activeProducts: ["ai_writing_assistant", "meeting_summary_bot"],
      resources: {
        ...createInitialState().resources,
        users: 4200,
        trust: 70,
      },
    };

    expect(getRunInsightReward(finished)).toBe(20);
  });

  it("turns a finished run into recommended unlocks, starter decks, and quick starts", () => {
    const finished = {
      ...createInitialState(),
      month: 10,
      status: "failure" as const,
      activeProducts: ["ai_writing_assistant", "meeting_summary_bot"],
      productReviews: {
        ai_writing_assistant: { grade: "B", score: 74, quote: "첫 제품치고는 괜찮다." },
        meeting_summary_bot: { grade: "A", score: 88, quote: "회의 시간이 줄었다." },
      },
      resources: {
        ...createInitialState().resources,
        cash: -1200,
        users: 2600,
        trust: 18,
        automation: 3,
      },
      roguelite: {
        ...createInitialState().roguelite,
        founderInsight: 1,
        rewardHistory: [
          {
            rewardId: "reward_test",
            productId: "meeting_summary_bot",
            chosenCardId: "customer_interviews",
            month: 8,
          },
        ],
      },
    };

    const plan = getNextRunSetupPlan(finished);

    expect(plan.projectedRunNumber).toBe(2);
    expect(plan.projectedFounderInsight).toBeGreaterThan(finished.roguelite.founderInsight);
    expect(plan.focusTitle).toContain("복구");
    expect(plan.recoveryWarnings).toEqual(expect.arrayContaining(["현금 흐름 붕괴", "신뢰도 위험"]));
    expect(plan.recommendedUnlocks[0]).toMatchObject({
      id: "eval_harness",
      categoryLabel: "품질/신뢰",
      affordable: true,
    });
    expect(plan.starterDeckPlans[0]).toMatchObject({
      id: "balanced_founder",
      available: true,
    });
    expect(plan.quickStarts.map((quickStart) => quickStart.id)).toEqual(
      expect.arrayContaining(["safe_restart", "recommended_unlock", "current_deck"]),
    );
  });

  it("uses quick-start payloads to reset into the recommended next run", () => {
    const finished = {
      ...createInitialState(),
      month: 12,
      status: "success" as const,
      activeProducts: ["ai_writing_assistant", "meeting_summary_bot"],
      resources: {
        ...createInitialState().resources,
        cash: 12000,
        users: 4200,
        trust: 70,
      },
      roguelite: {
        ...createInitialState().roguelite,
        founderInsight: 4,
      },
    };
    const plan = getNextRunSetupPlan(finished);
    const unlockQuickStart = plan.quickStarts.find((quickStart) => quickStart.id === "recommended_unlock");
    if (!unlockQuickStart) throw new Error("Missing recommended unlock quick start");

    const nextRun = resetRunWithMetaUnlocks(finished, unlockQuickStart.unlockIds, unlockQuickStart.starterDeckId);

    expect(nextRun.roguelite.runNumber).toBe(2);
    expect(nextRun.roguelite.unlockedMetaIds).toEqual(expect.arrayContaining(unlockQuickStart.unlockIds));
    expect(nextRun.roguelite.starterDeckId).toBe(unlockQuickStart.starterDeckId);
    expect(nextRun.roguelite.runHistory[0]).toMatchObject({ runNumber: 1 });
  });

  it("records the finished campaign ending in the cross-run collection and nudges insight reward", () => {
    const initial = createInitialState();
    const finished = {
      ...initial,
      month: 120,
      status: "success" as const,
      activeProducts: [
        "ai_writing_assistant",
        "meeting_summary_bot",
        "customer_support_chatbot",
        "foundation_model_v0",
      ],
      resources: {
        ...initial.resources,
        cash: 180000,
        users: 140000,
        trust: 76,
        automation: 58,
      },
    };
    const ending = getCampaignEnding(finished);
    const insightReward = getRunInsightReward(finished);

    expect(ending).toMatchObject({
      id: "standard_platform_compounder",
      meta_reward_bonus: 2,
    });
    expect(insightReward).toBe(144);

    const nextRun = resetRunWithMetaUnlocks(finished);

    expect(nextRun.roguelite.discoveredEndingIds).toEqual(["standard_platform_compounder"]);
    expect(nextRun.roguelite.founderInsight).toBe(insightReward);
    expect(nextRun.roguelite.runHistory[0]).toMatchObject({
      endingName: "표준 세계의 복리 플랫폼",
      insightReward,
    });
  });

  it("keeps ending discoveries unique across repeated resets", () => {
    const initial = createInitialState();
    const finished = {
      ...initial,
      month: 120,
      status: "success" as const,
      activeProducts: ["ai_writing_assistant", "meeting_summary_bot", "customer_support_chatbot"],
      resources: {
        ...initial.resources,
        cash: 120000,
        users: 120000,
        trust: 65,
        automation: 50,
      },
      roguelite: {
        ...initial.roguelite,
        discoveredEndingIds: ["standard_platform_compounder", "standard_platform_compounder", "garage_restart"],
      },
    };

    const nextRun = resetRunWithMetaUnlocks(finished);

    expect(nextRun.roguelite.discoveredEndingIds).toEqual(["standard_platform_compounder", "garage_restart"]);
  });
});
