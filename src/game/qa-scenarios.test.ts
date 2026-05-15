import { describe, expect, it } from "vitest";
import { createQaScenario, createQaScenarioFromSearch, qaScenarioIds } from "./qa-scenarios";

describe("alpha v0.9.3 QA scenarios", () => {
  it("exposes stable browser QA scenario ids", () => {
    expect(qaScenarioIds).toEqual(["fresh", "project", "release", "shop"]);
  });

  it("creates a fresh first-screen scenario", () => {
    const scenario = createQaScenario("fresh");

    expect(scenario.activeMenu).toBe("company");
    expect(scenario.state.hiredAgents).toHaveLength(0);
    expect(scenario.state.activeProducts).toHaveLength(0);
    expect(scenario.label).toContain("첫 화면");
  });

  it("creates an active project scenario for progress and objective QA", () => {
    const scenario = createQaScenario("project");

    expect(scenario.activeMenu).toBe("products");
    expect(scenario.state.hiredAgents.length).toBeGreaterThanOrEqual(1);
    expect(scenario.state.productProjects).toHaveLength(1);
    expect(scenario.state.activeProducts).not.toContain("ai_writing_assistant");
  });

  it("creates a release spotlight scenario", () => {
    const scenario = createQaScenario("release");

    expect(scenario.activeMenu).toBe("company");
    expect(scenario.state.activeProducts).toContain("ai_writing_assistant");
    expect(scenario.state.lastRelease?.productId).toBe("ai_writing_assistant");
    expect(scenario.state.lastRelease?.expansionHint).toContain("회의");
  });

  it("creates a shop guidance scenario after first release", () => {
    const scenario = createQaScenario("shop");

    expect(scenario.activeMenu).toBe("shop");
    expect(scenario.state.activeProducts).toContain("ai_writing_assistant");
    expect(scenario.state.ownedItems).toHaveLength(0);
  });

  it("creates scenarios from URL search params for browser QA", () => {
    expect(createQaScenarioFromSearch("?scenario=release")?.id).toBe("release");
    expect(createQaScenarioFromSearch("?qa=project")?.id).toBe("project");
    expect(createQaScenarioFromSearch("?scenario=unknown")).toBeUndefined();
  });
});
