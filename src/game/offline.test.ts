import { describe, expect, it } from "vitest";
import { products } from "./data";
import { calculateOfflineSettlement, applyOfflineSettlement } from "./offline";
import { createInitialState, hydrateSavedGame, launchProduct, serializeGameState } from "./simulation";

describe("v0.14 offline settlement", () => {
  it("stores save time and hydrates it separately from game time", () => {
    const savedAt = new Date("2026-05-01T00:00:00.000Z");
    const serialized = serializeGameState(createInitialState(), savedAt);
    const hydrated = hydrateSavedGame(serialized);

    expect(hydrated.savedAt?.toISOString()).toBe(savedAt.toISOString());
    expect(hydrated.state.month).toBe(1);
  });

  it("settles real offline days as game days without advancing the monthly turn", () => {
    const product = products.find((entry) => entry.id === "ai_writing_assistant");
    if (!product) throw new Error("Missing offline revenue fixture");

    const state = {
      ...launchProduct(product, createInitialState()),
      activeProducts: ["ai_writing_assistant", "frontier_reasoning_model", "ai_training_chip"],
      productLevels: {
        ai_writing_assistant: 1,
        frontier_reasoning_model: 1,
        ai_training_chip: 1,
      },
    };
    const settlement = calculateOfflineSettlement(
      state,
      new Date("2026-05-01T00:00:00.000Z"),
      new Date("2026-05-03T12:00:00.000Z"),
    );
    const settled = applyOfflineSettlement(state, settlement);

    expect(settlement.elapsedRealDays).toBe(2);
    expect(settlement.gameDays).toBe(2);
    expect(settlement.delta.cash).toBeGreaterThan(0);
    expect(settled.month).toBe(state.month);
    expect(settled.timeline[0]).toContain("오프라인 정산");
  });

  it("can produce offline losses when the company has no product revenue", () => {
    const settlement = calculateOfflineSettlement(
      createInitialState(),
      new Date("2026-05-01T00:00:00.000Z"),
      new Date("2026-05-02T00:01:00.000Z"),
    );

    expect(settlement.gameDays).toBe(1);
    expect(settlement.delta.cash).toBeLessThan(0);
  });
});
