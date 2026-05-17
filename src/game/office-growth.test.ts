import { describe, expect, it } from "vitest";
import { agentTypes, items } from "./data";
import {
  buyItem,
  createInitialState,
  getOfficeGrowthPlan,
  hireAgent,
} from "./simulation";
import type { GameState } from "./types";

describe("v0.29 office growth planning", () => {
  it("compares the next office expansion with the next relocation candidate", () => {
    const crowded = ["prompt_architect", "data_curator", "infra_operator"].reduce((state, agentId) => {
      const agent = agentTypes.find((entry) => entry.id === agentId);
      if (!agent) throw new Error(`Missing agent fixture ${agentId}`);
      return hireAgent(agent, state);
    }, createRichInitialState());
    const plan = getOfficeGrowthPlan(crowded);

    expect(plan.current).toMatchObject({
      expansionId: "garage_lab",
      hireSlotsUsed: 3,
      hireSlotsTotal: 3,
      decorationSlotsTotal: 3,
    });
    expect(plan.nextExpansion).toMatchObject({
      id: "startup_suite",
      available: true,
      hireCapacityGain: 2,
      decorationSlotGain: 2,
    });
    expect(plan.nextRelocation).toMatchObject({
      id: "local_startup_center",
      available: true,
      aiOperationGain: 1,
    });
    expect(plan.primaryAction.kind).toBe("expand_office");
  });

  it("recommends decorations that complete the next office synergy", () => {
    const gpuRack = items.find((item) => item.id === "gpu_rack_mini");
    const coolingWall = items.find((item) => item.id === "cooling_fan_wall");
    if (!gpuRack || !coolingWall) throw new Error("Missing office decor fixtures");

    const decorated = [gpuRack, coolingWall].reduce((state, item) => buyItem(item, state), createRichInitialState());
    const plan = getOfficeGrowthPlan(decorated);

    expect(plan.nextSynergy?.id).toBe("garage_compute_cluster");
    expect(plan.nextSynergy?.progressLabel).toContain("research 0/1");
    expect(plan.nextSynergy?.recommendedItems[0]).toMatchObject({
      id: "data_labeler_desk",
      available: true,
    });
    expect(plan.primaryAction).toMatchObject({
      kind: "buy_decor",
      targetId: "data_labeler_desk",
    });
  });
});

function createRichInitialState(): GameState {
  return {
    ...createInitialState(),
    month: 4,
    resources: {
      ...createInitialState().resources,
      cash: 100000,
      data: 1000,
      compute: 1000,
      trust: 100,
      hype: 50,
      users: 2000,
      talent: 10,
    },
    activeProducts: ["ai_writing_assistant"],
    productLevels: { ai_writing_assistant: 1 },
  };
}
