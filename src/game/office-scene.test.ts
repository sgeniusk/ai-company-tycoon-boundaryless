import { describe, expect, it } from "vitest";
import { agentTypes, officeSceneObjects, products } from "./data";
import { createInitialState, getOfficeScenePlan, startProductProject } from "./simulation";
import type { GameState, HiredAgent } from "./types";

function officeVisualState(): GameState {
  const initial = createInitialState();
  const hiredAgents: HiredAgent[] = agentTypes.slice(0, 5).map((agent, index) => ({
    id: `office-visual-agent-${index + 1}`,
    typeId: agent.id,
    name: agent.name,
    level: index === 0 ? 3 : 2,
    energy: 78,
    loyalty: index === 1 ? 40 : 74,
    equippedItemIds: [],
  }));

  return {
    ...initial,
    month: 18,
    activeProducts: ["foundation_model_v0", "ai_writing_assistant"],
    productLevels: { foundation_model_v0: 1, ai_writing_assistant: 2 },
    hiredAgents,
    resources: {
      ...initial.resources,
      cash: 90000,
      compute: 520,
      data: 520,
      users: 12000,
      trust: 68,
      hype: 32,
      automation: 20,
      talent: 8,
    },
    capabilities: {
      ...initial.capabilities,
      code: 3,
      robotics: 1,
    },
    unlockedDomains: [
      ...new Set([...initial.unlockedDomains, "developer_tools", "creator_tools", "robotics", "semiconductors"]),
    ],
    office: {
      expansionId: "campus_lab",
      placedItemIds: [],
    },
  };
}

describe("v0.41 office visual simulation plan", () => {
  it("turns office zones into data-driven scene objects", () => {
    const plan = getOfficeScenePlan(officeVisualState());

    expect(officeSceneObjects.length).toBeGreaterThanOrEqual(10);
    expect(plan.expansionLabel).toContain("캠퍼스");
    expect(plan.objects.map((object) => object.id)).toEqual(expect.arrayContaining(["compute_bay_scene", "robotics_bay_scene", "chip_lab_scene"]));
    expect(plan.objects.find((object) => object.id === "compute_bay_scene")?.active).toBe(true);
    expect(plan.objects.find((object) => object.id === "boundaryless_showroom_scene")?.blockedReason).toContain("5단계");
    expect(plan.activeObjectCount).toBeGreaterThanOrEqual(8);
  });

  it("maps staff assignments and care risks to moving actor states", () => {
    const codingProduct = products.find((product) => product.id === "ai_coding_assistant");
    if (!codingProduct) throw new Error("Missing coding product");
    const state = officeVisualState();
    const started = startProductProject(codingProduct, state, [state.hiredAgents[0].id]);
    const plan = getOfficeScenePlan(started);
    const working = plan.actors.find((actor) => actor.id === state.hiredAgents[0].id);
    const warning = plan.actors.find((actor) => actor.id === state.hiredAgents[1].id);

    expect(working?.state).toBe("working");
    expect(working?.assignmentLabel).toContain("AI 코딩");
    expect(warning?.state).toBe("warning");
    expect(plan.workingActorCount).toBe(1);
    expect(plan.activityTicker.join(" ")).toContain("개발");
  });

  it("keeps robots visually distinct once robotic hiring enters the office", () => {
    const robotType = agentTypes.find((agent) => agent.kind === "robot");
    if (!robotType) throw new Error("Missing robot fixture");
    const state: GameState = {
      ...officeVisualState(),
      hiredAgents: [
        ...officeVisualState().hiredAgents,
        {
          id: "office-robot-1",
          typeId: robotType.id,
          name: robotType.name,
          level: 1,
          energy: 90,
          loyalty: 80,
          equippedItemIds: [],
        },
      ],
    };
    const plan = getOfficeScenePlan(state);
    const robotActor = plan.actors.find((actor) => actor.id === "office-robot-1");

    expect(robotActor?.kind).toBe("robot");
    expect(robotActor?.activity).toContain("충전");
  });
});
