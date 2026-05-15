import { describe, expect, it } from "vitest";
import { agentTypes, products, upgrades } from "./data";
import { advanceMonth, buyUpgrade, chooseGrowthPath, createInitialState, hireAgent, startProductProject } from "./simulation";
import { getGrowthPathObjectives } from "./growth-objectives";

function releasedStarterState() {
  const architect = agentTypes.find((agent) => agent.id === "prompt_architect");
  const writingProduct = products.find((product) => product.id === "ai_writing_assistant");
  if (!architect || !writingProduct) throw new Error("Missing growth objective fixture");

  const started = startProductProject(writingProduct, hireAgent(architect, createInitialState()));
  return advanceMonth(advanceMonth(started));
}

describe("alpha v0.9.8 growth path follow-up objectives", () => {
  it("shows three objectives for the chosen growth path", () => {
    const chosen = chooseGrowthPath("productivity_line", releasedStarterState());
    const objectives = getGrowthPathObjectives(chosen);

    expect(objectives).toHaveLength(3);
    expect(objectives.map((objective) => objective.id)).toEqual([
      "start_meeting_summary",
      "raise_language_level",
      "buy_productivity_tooling",
    ]);
    expect(objectives.every((objective) => objective.complete === false)).toBe(true);
  });

  it("marks resource and upgrade objectives complete from real game state", () => {
    const filterUpgrade = upgrades.find((upgrade) => upgrade.id === "content_filter_v1");
    if (!filterUpgrade) throw new Error("Missing trust objective fixture");

    const chosen = chooseGrowthPath("trust_enterprise", releasedStarterState());
    const invested = buyUpgrade(filterUpgrade, chosen);
    const objectives = getGrowthPathObjectives(invested);

    expect(objectives.find((objective) => objective.id === "adopt_content_filter")?.complete).toBe(true);
    expect(objectives.find((objective) => objective.id === "raise_trust_45")?.complete).toBe(true);
  });
});
