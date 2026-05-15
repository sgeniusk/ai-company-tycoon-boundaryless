import { describe, expect, it } from "vitest";
import { agentTypes, growthPaths, products } from "./data";
import {
  advanceMonth,
  chooseGrowthPath,
  createInitialState,
  hireAgent,
  startProductProject,
} from "./simulation";

function releaseStarterProduct() {
  const architect = agentTypes.find((agent) => agent.id === "prompt_architect");
  const writingProduct = products.find((product) => product.id === "ai_writing_assistant");
  if (!architect || !writingProduct) throw new Error("Missing strategy fixture");

  return advanceMonth(advanceMonth(startProductProject(writingProduct, hireAgent(architect, createInitialState()))));
}

describe("v0.11 growth path monthly strategy effects", () => {
  it("defines monthly effects for every commercial growth path", () => {
    for (const path of growthPaths) {
      expect(path.monthly_effects).toBeTruthy();
      expect(Object.values(path.monthly_effects ?? {}).some((value) => value !== 0)).toBe(true);
    }
  });

  it("applies the chosen path monthly effect in the month report", () => {
    const released = releaseStarterProduct();
    const chosen = chooseGrowthPath("productivity_line", released);
    const advanced = advanceMonth(chosen);

    expect(advanced.lastMonthReport?.strategyEffects).toEqual({
      users: 120,
      hype: 1,
      data: 2,
    });
    expect(advanced.resources.users).toBeGreaterThan(chosen.resources.users);
    expect(advanced.timeline.some((entry) => entry.includes("전략 효과"))).toBe(true);
  });

  it("leaves the monthly report strategy slot empty before committing to a path", () => {
    const released = releaseStarterProduct();
    const advanced = advanceMonth(released);

    expect(advanced.lastMonthReport?.strategyEffects).toBeUndefined();
  });
});
