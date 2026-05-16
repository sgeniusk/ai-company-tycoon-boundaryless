import { describe, expect, it } from "vitest";
import { growthPaths } from "./data";
import { runAllCommercialSimulations, runAnnualDirectiveSimulation, runScriptedCommercialSimulation, runTenYearCampaignSimulation } from "./run-simulator";

describe("v0.11 commercial balance simulation harness", () => {
  it("runs a scripted productivity strategy through the 10-month MVP window", () => {
    const result = runScriptedCommercialSimulation("productivity_line");

    expect(result.monthsSimulated).toBeGreaterThanOrEqual(10);
    expect(result.finalState.month).toBeGreaterThanOrEqual(10);
    expect(result.finalState.activeProducts.length).toBeGreaterThanOrEqual(2);
    expect(result.finalState.status).not.toBe("failure");
    expect(result.summary.isFinal).toBe(true);
    expect(result.integrity.ok).toBe(true);
  });

  it("covers every growth path as a distinct balance sample", () => {
    const results = runAllCommercialSimulations();

    expect(results.map((result) => result.strategyId).sort()).toEqual(growthPaths.map((path) => path.id).sort());
    expect(results.every((result) => result.integrity.ok)).toBe(true);
  });

  it("runs past the first annual review and chooses a next-year directive", () => {
    const result = runAnnualDirectiveSimulation("productivity_line", 24);

    expect(result.finalState.month).toBeGreaterThanOrEqual(24);
    expect(result.finalState.annualReviewHistory.length).toBeGreaterThanOrEqual(1);
    expect(result.directiveChoicesMade).toBeGreaterThanOrEqual(1);
    expect(result.integrity.ok).toBe(true);
  });

  it("compresses the full 10-year campaign into annual telemetry", () => {
    const result = runTenYearCampaignSimulation("productivity_line");

    expect(result.finalState.month).toBeGreaterThanOrEqual(120);
    expect(result.finalState.status).not.toBe("playing");
    expect(result.annualReviewCount).toBeGreaterThanOrEqual(10);
    expect(result.directiveChoicesMade).toBeGreaterThanOrEqual(5);
    expect(result.yearlySnapshots).toHaveLength(10);
    expect(result.yearlySnapshots[0]).toMatchObject({ year: 1, month: 12 });
    expect(result.yearlySnapshots[9]).toMatchObject({ year: 10, month: 120 });
    expect(result.milestones.some((milestone) => milestone.type === "stage")).toBe(true);
    expect(result.milestones.some((milestone) => milestone.type === "product")).toBe(true);
    expect(result.integrity.ok).toBe(true);
  });
});
