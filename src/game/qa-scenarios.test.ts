import { describe, expect, it } from "vitest";
import { createQaScenario, createQaScenarioFromSearch, qaScenarioIds } from "./qa-scenarios";

describe("alpha v0.9.3 QA scenarios", () => {
  it("exposes stable browser QA scenario ids", () => {
    expect(qaScenarioIds).toEqual(["fresh", "staffing", "project", "release", "reward", "shop", "deck", "strategy", "arc", "commercial"]);
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

  it("creates a staffing scenario for explicit product team assignment QA", () => {
    const scenario = createQaScenario("staffing");

    expect(scenario.activeMenu).toBe("products");
    expect(scenario.state.hiredAgents.length).toBeGreaterThanOrEqual(2);
    expect(scenario.state.productProjects).toHaveLength(0);
    expect(scenario.state.activeProducts).toHaveLength(0);
  });

  it("creates a release spotlight scenario", () => {
    const scenario = createQaScenario("release");

    expect(scenario.activeMenu).toBe("company");
    expect(scenario.state.activeProducts).toContain("ai_writing_assistant");
    expect(scenario.state.lastRelease?.productId).toBe("ai_writing_assistant");
    expect(scenario.state.lastRelease?.expansionHint).toContain("회의");
    expect(scenario.state.lastRelease?.growthPaths).toHaveLength(3);
  });

  it("creates a shop guidance scenario after first release", () => {
    const scenario = createQaScenario("shop");

    expect(scenario.activeMenu).toBe("shop");
    expect(scenario.state.activeProducts).toContain("ai_writing_assistant");
    expect(scenario.state.ownedItems).toHaveLength(0);
  });

  it("creates a card reward scenario after first release", () => {
    const scenario = createQaScenario("reward");

    expect(scenario.activeMenu).toBe("deck");
    expect(scenario.state.activeProducts).toContain("ai_writing_assistant");
    expect(scenario.state.roguelite.pendingCardReward?.offeredCardIds).toHaveLength(3);
    expect(scenario.state.roguelite.deckEditTokens).toBeGreaterThanOrEqual(1);
  });

  it("creates a deck and puzzle scenario for roguelite QA", () => {
    const scenario = createQaScenario("deck");

    expect(scenario.activeMenu).toBe("deck");
    expect(scenario.state.productProjects).toHaveLength(1);
    expect(scenario.state.roguelite.deck.hand.length).toBeGreaterThanOrEqual(4);
  });

  it("creates strategy and arc scenarios for post-release QA", () => {
    const strategy = createQaScenario("strategy");
    const arc = createQaScenario("arc");

    expect(strategy.activeMenu).toBe("competition");
    expect(strategy.state.chosenGrowthPath?.id).toBe("productivity_line");
    expect(arc.activeMenu).toBe("company");
    expect(arc.state.chosenGrowthPath?.id).toBe("productivity_line");
    expect(arc.state.month).toBeGreaterThanOrEqual(6);
  });

  it("creates a commercial readiness scenario for final-summary QA", () => {
    const scenario = createQaScenario("commercial");

    expect(scenario.activeMenu).toBe("company");
    expect(scenario.state.month).toBeGreaterThanOrEqual(10);
    expect(scenario.state.unlockedAchievements.length).toBeGreaterThanOrEqual(2);
    expect(scenario.state.status).not.toBe("failure");
  });

  it("creates scenarios from URL search params for browser QA", () => {
    expect(createQaScenarioFromSearch("?scenario=release")?.id).toBe("release");
    expect(createQaScenarioFromSearch("?scenario=staffing")?.id).toBe("staffing");
    expect(createQaScenarioFromSearch("?scenario=reward")?.id).toBe("reward");
    expect(createQaScenarioFromSearch("?scenario=strategy")?.id).toBe("strategy");
    expect(createQaScenarioFromSearch("?scenario=deck")?.id).toBe("deck");
    expect(createQaScenarioFromSearch("?scenario=commercial")?.id).toBe("commercial");
    expect(createQaScenarioFromSearch("?qa=project")?.id).toBe("project");
    expect(createQaScenarioFromSearch("?scenario=unknown")).toBeUndefined();
  });
});
