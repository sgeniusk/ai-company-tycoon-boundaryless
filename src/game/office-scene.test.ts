import { describe, expect, it } from "vitest";
import { agentTypes, officeReactions, officeSceneObjects, products } from "./data";
import { getStrategyCardById, playStrategyCard } from "./deckbuilding";
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
    expect(working?.targetMenu).toBe("products");
    expect(working?.actionLabel).toContain("프로젝트");
    expect(warning?.state).toBe("warning");
    expect(warning?.targetMenu).toBe("agents");
    expect(warning?.actionLabel).toContain("케어");
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

describe("v0.49 office event reactions", () => {
  it("loads data-driven reaction hooks for card, launch, rival, and staff moments", () => {
    expect(officeReactions.map((reaction) => reaction.trigger)).toEqual(
      expect.arrayContaining(["card_use", "product_launch", "rival_alert", "staff_incident"]),
    );
    for (const reaction of officeReactions) {
      expect(reaction.duration_ms).toBeGreaterThanOrEqual(900);
      expect(reaction.x).toBeGreaterThanOrEqual(0);
      expect(reaction.x).toBeLessThanOrEqual(100);
      expect(reaction.y).toBeGreaterThanOrEqual(0);
      expect(reaction.y).toBeLessThanOrEqual(100);
    }
  });

  it("turns a recent card use into a visible office reaction", () => {
    const codingProduct = products.find((product) => product.id === "ai_coding_assistant");
    const sprintCard = getStrategyCardById("prompt_sprint");
    if (!codingProduct || !sprintCard) throw new Error("Missing office reaction fixture");

    const state = officeVisualState();
    const started = startProductProject(codingProduct, state, [state.hiredAgents[0].id]);
    const played = playStrategyCard(sprintCard, started);
    const plan = getOfficeScenePlan(played);

    expect(plan.eventReactions.map((reaction) => reaction.trigger)).toContain("card_use");
    expect(plan.eventReactions.find((reaction) => reaction.trigger === "card_use")?.headline).toContain("프롬프트 스프린트");
  });
});

describe("v0.51 office event poses", () => {
  it("assigns warning actors to alert poses before the player opens the staff panel", () => {
    const plan = getOfficeScenePlan(officeVisualState());
    const warningActor = plan.actors.find((actor) => actor.state === "warning");

    expect(warningActor?.reactionPose).toBe("alert");
    expect(warningActor?.reactionPoseSource).toContain("loyalty");
  });

  it("turns a recent card use reaction into a card-use actor pose", () => {
    const codingProduct = products.find((product) => product.id === "ai_coding_assistant");
    const sprintCard = getStrategyCardById("prompt_sprint");
    if (!codingProduct || !sprintCard) throw new Error("Missing office pose fixture");

    const state = officeVisualState();
    const started = startProductProject(codingProduct, state, [state.hiredAgents[0].id]);
    const played = playStrategyCard(sprintCard, started);
    const plan = getOfficeScenePlan(played);
    const workingActor = plan.actors.find((actor) => actor.state === "working");

    expect(plan.eventReactions.map((reaction) => reaction.trigger)).toContain("card_use");
    expect(workingActor?.reactionPose).toBe("card_use");
    expect(workingActor?.reactionPoseSource).toContain("card_use");
  });
});
