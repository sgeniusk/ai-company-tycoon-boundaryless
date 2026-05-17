import { describe, expect, it } from "vitest";
import { campaignShocks } from "./data";
import { applyDueCampaignShocks, getCampaignShockForecast } from "./campaign-shocks";
import { advanceMonth, createInitialState } from "./simulation";

describe("v0.33 campaign shock pacing", () => {
  it("defines three readable market shocks across the 10-year campaign", () => {
    expect(campaignShocks.map((shock) => shock.month)).toEqual([36, 72, 108]);
    expect(campaignShocks.map((shock) => shock.id)).toEqual([
      "year3_foundation_model_war",
      "year6_compute_supply_crunch",
      "year9_boundaryless_boom",
    ]);
  });

  it("forecasts the next shock and recommended response from current state", () => {
    const forecast = getCampaignShockForecast(createInitialState());

    expect(forecast.totalCount).toBe(3);
    expect(forecast.completedCount).toBe(0);
    expect(forecast.next).toMatchObject({
      id: "year3_foundation_model_war",
      month: 36,
      monthsUntil: 35,
      applied: false,
    });
    expect(forecast.next?.recommendedProductNames.length).toBeGreaterThan(0);
    expect(forecast.next?.recommendedCapabilityNames).toEqual(expect.arrayContaining(["안전", "최적화"]));
  });

  it("applies a due shock exactly once during monthly advancement", () => {
    const base = {
      ...createInitialState(),
      month: 35,
      activeProducts: ["ai_writing_assistant"],
      resources: {
        ...createInitialState().resources,
        cash: 50000,
        compute: 500,
        data: 300,
        trust: 60,
      },
      campaignShockHistory: [],
    };

    const advanced = advanceMonth(base);

    expect(advanced.month).toBe(36);
    expect(advanced.campaignShockHistory).toContain("year3_foundation_model_war");
    expect(advanced.timeline.join(" ")).toContain("시장 충격");
    expect(advanced.timeline.join(" ")).toContain("파운데이션 모델 전쟁");
    expect(advanced.resources.compute).toBeLessThan(base.resources.compute);
    expect(advanced.competitorStates.some((competitor) => competitor.lastMove.includes("파운데이션 모델 전쟁"))).toBe(true);

    const alreadyApplied = advanceMonth({
      ...base,
      campaignShockHistory: ["year3_foundation_model_war"],
    });

    expect(alreadyApplied.campaignShockHistory.filter((id) => id === "year3_foundation_model_war")).toHaveLength(1);
    expect(alreadyApplied.timeline.join(" ")).not.toContain("파운데이션 모델 전쟁");
  });

  it("can apply a shock directly for deterministic QA fixtures", () => {
    const shocked = applyDueCampaignShocks({
      ...createInitialState(),
      month: 72,
      resources: {
        ...createInitialState().resources,
        cash: 100000,
        compute: 800,
      },
      campaignShockHistory: ["year3_foundation_model_war"],
    });

    expect(shocked.campaignShockHistory).toEqual(expect.arrayContaining(["year6_compute_supply_crunch"]));
    expect(shocked.timeline[0]).toContain("시장 충격");
  });
});
