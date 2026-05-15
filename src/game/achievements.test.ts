import { describe, expect, it } from "vitest";
import { agentTypes, capabilities, products } from "./data";
import { getAchievementStatuses } from "./achievements";
import {
  advanceMonth,
  createInitialState,
  hireAgent,
  hydrateGameState,
  serializeGameState,
  startProductProject,
  upgradeCapability,
} from "./simulation";

describe("v0.11 commercial run achievements", () => {
  it("unlocks and rewards the first shipped product objective once", () => {
    const architect = agentTypes.find((agent) => agent.id === "prompt_architect");
    const writingProduct = products.find((product) => product.id === "ai_writing_assistant");
    if (!architect || !writingProduct) throw new Error("Missing first release fixture");

    const started = startProductProject(writingProduct, hireAgent(architect, createInitialState()));
    const released = advanceMonth(advanceMonth(started));
    const replayed = advanceMonth(released);

    expect(released.unlockedAchievements).toContain("first_release");
    expect(released.timeline[0]).toContain("업적 달성");
    expect(replayed.unlockedAchievements.filter((id) => id === "first_release")).toHaveLength(1);
  });

  it("tracks visible run goal status for unlocked and locked objectives", () => {
    const architect = agentTypes.find((agent) => agent.id === "prompt_architect");
    const writingProduct = products.find((product) => product.id === "ai_writing_assistant");
    if (!architect || !writingProduct) throw new Error("Missing achievement status fixture");

    const released = advanceMonth(advanceMonth(startProductProject(writingProduct, hireAgent(architect, createInitialState()))));
    const statuses = getAchievementStatuses(released);

    expect(statuses.find((status) => status.id === "first_release")).toMatchObject({
      unlocked: true,
      title: "첫 제품 출시",
    });
    expect(statuses.find((status) => status.id === "two_product_company")).toMatchObject({
      unlocked: false,
    });
  });

  it("persists unlocked achievements through save hydration", () => {
    const capability = capabilities.find((entry) => entry.id === "language");
    if (!capability) throw new Error("Missing capability fixture");

    const researched = upgradeCapability(capability, createInitialState());
    const hydrated = hydrateGameState(serializeGameState(researched));

    expect(researched.unlockedAchievements).toContain("first_research_upgrade");
    expect(hydrated.unlockedAchievements).toEqual(researched.unlockedAchievements);
  });
});
