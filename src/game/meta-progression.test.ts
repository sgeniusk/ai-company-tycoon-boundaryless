import { describe, expect, it } from "vitest";
import { getNextRunSetupPlan, resetRunWithMetaUnlocks } from "./meta-progression";
import { createInitialState } from "./simulation";

describe("v0.32 next-run setup plan", () => {
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
});
