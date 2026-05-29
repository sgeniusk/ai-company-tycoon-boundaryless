import { describe, expect, it } from "vitest";
import { growthPaths, products } from "./data";
import { CAMPAIGN_FINAL_MONTH } from "./campaign";
import {
  evaluateEndToEndCampaignCoverage,
  evaluateAlphaReadiness,
  evaluateSeasonChallengeBalance,
  runAllCommercialSimulations,
  runAnnualDirectiveSimulation,
  runScriptedCommercialSimulation,
  runTenYearCampaignSimulation,
} from "./run-simulator";

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

    expect(result.finalState.month).toBeGreaterThanOrEqual(CAMPAIGN_FINAL_MONTH);
    expect(result.finalState.status).not.toBe("playing");
    expect(result.annualReviewCount).toBeGreaterThanOrEqual(10);
    expect(result.directiveChoicesMade).toBeGreaterThanOrEqual(5);
    expect(result.yearlySnapshots).toHaveLength(10);
    expect(result.yearlySnapshots[0]).toMatchObject({ year: 1, month: 12 });
    expect(result.yearlySnapshots[9]).toMatchObject({ year: 10, month: 120 });
    expect(result.milestones.some((milestone) => milestone.type === "stage")).toBe(true);
    expect(result.milestones.some((milestone) => milestone.type === "product")).toBe(true);
    expect(result.milestones.filter((milestone) => milestone.type === "shock").map((milestone) => milestone.month)).toEqual([36, 72, 108]);
    expect(result.finalState.campaignShockHistory).toEqual(
      expect.arrayContaining(["year3_foundation_model_war", "year6_compute_supply_crunch", "year9_boundaryless_boom"]),
    );
    expect(result.integrity.ok).toBe(true);
  });

  it("completes the full 10-year campaign for every growth path", () => {
    const results = growthPaths.map((path) => runTenYearCampaignSimulation(path.id));

    expect(results.map((result) => result.strategyId).sort()).toEqual(growthPaths.map((path) => path.id).sort());

    for (const result of results) {
      expect(result.finalState.month, result.strategyId).toBeGreaterThanOrEqual(CAMPAIGN_FINAL_MONTH);
      expect(result.finalState.status, result.strategyId).not.toBe("failure");
      expect(result.integrity.ok, result.strategyId).toBe(true);
      expect(result.finale, result.strategyId).toMatchObject({ isFinal: true });
      expect(result.annualReviewCount, result.strategyId).toBeGreaterThanOrEqual(10);
      expect(result.yearlySnapshots, result.strategyId).toHaveLength(10);
      expect(result.yearlySnapshots[result.yearlySnapshots.length - 1], result.strategyId).toMatchObject({
        month: CAMPAIGN_FINAL_MONTH,
      });
    }
  });

  it("keeps a hard-tier 10-year campaign completable for at least one strategy", () => {
    const result = runTenYearCampaignSimulation("productivity_line", { challengeTierId: "hard" });

    expect(result.finalState.runModifiers.challengeTier).toBe("hard");
    expect(result.finalState.month).toBeGreaterThanOrEqual(CAMPAIGN_FINAL_MONTH);
    expect(result.finalState.status).not.toBe("failure");
    expect(result.integrity.ok).toBe(true);
    expect(result.finale).toMatchObject({ isFinal: true });
    expect(result.annualReviewCount).toBeGreaterThanOrEqual(10);
    expect(result.yearlySnapshots).toHaveLength(10);
  });

  it("completes a 10-year campaign after expanding into v0.60 physical industries", () => {
    const physicalDomainIds = ["manufacturing", "logistics", "energy"];
    const result = runTenYearCampaignSimulation("code_vision_lab");
    const launchedPhysicalDomains = new Set(
      result.finalState.activeProducts
        .map((productId) => products.find((product) => product.id === productId)?.domain)
        .filter((domainId): domainId is string => typeof domainId === "string" && physicalDomainIds.includes(domainId)),
    );

    expect(result.finalState.month).toBeGreaterThanOrEqual(CAMPAIGN_FINAL_MONTH);
    expect(result.finalState.status).not.toBe("failure");
    expect(result.integrity.ok).toBe(true);
    expect(result.finale).toMatchObject({ isFinal: true });
    expect(result.finalState.unlockedDomains).toEqual(expect.arrayContaining(physicalDomainIds));
    expect([...launchedPhysicalDomains].sort()).toEqual([...physicalDomainIds].sort());
  });

  it("summarizes alpha readiness across commercial paths and the 10-year campaign", () => {
    const readiness = evaluateAlphaReadiness();

    expect(readiness.versionTarget).toBe("v0.61-alpha");
    expect(readiness.coveredStrategies).toBe(growthPaths.length);
    expect(readiness.gates.map((gate) => gate.id)).toEqual(
      expect.arrayContaining(["commercial_paths", "ten_year_campaign", "integrity", "ending"]),
    );
    expect(readiness.gates.find((gate) => gate.id === "ten_year_campaign")?.detail).toContain(
      `${growthPaths.length}/${growthPaths.length}`,
    );
    expect(readiness.pass).toBe(true);
    expect(readiness.score).toBeGreaterThanOrEqual(70);
  });

  it("checks v0.22 season challenge rewards against pressure guardrails", () => {
    const report = evaluateSeasonChallengeBalance();

    expect(report.versionTarget).toBe("v0.22-alpha");
    expect(report.challengeCount).toBeGreaterThanOrEqual(1);
    expect(report.pass).toBe(true);
    expect(report.completedReward.trust).toBeLessThanOrEqual(3);
    expect(report.unresolvedMomentumPerCompetitor).toBeLessThanOrEqual(2);
    expect(report.recommendations[0]).toContain("보상");
  });

  it("checks v0.61 end-to-end coverage across finale, deck, and office growth", () => {
    const reports = growthPaths.map((path) => ({
      strategyId: path.id,
      report: evaluateEndToEndCampaignCoverage(path.id),
    }));

    for (const { strategyId, report } of reports) {
      expect(report.versionTarget).toBe("v0.61-alpha");
      expect(report.finalMonth, strategyId).toBeGreaterThanOrEqual(CAMPAIGN_FINAL_MONTH);
      expect(report.finalStatus, strategyId).not.toBe("playing");
      expect(report.annualReviewCount, strategyId).toBeGreaterThanOrEqual(10);
      expect(report.productCount, strategyId).toBeGreaterThanOrEqual(3);
      expect(report.officeLevel, strategyId).toBeGreaterThanOrEqual(4);
      expect(report.rewardPickCount, strategyId).toBeGreaterThanOrEqual(2);
      expect(report.pass, strategyId).toBe(true);
    }
  });
});
