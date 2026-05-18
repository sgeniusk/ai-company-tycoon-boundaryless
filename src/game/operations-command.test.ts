import { describe, expect, it } from "vitest";
import { agentTypes, capabilities, products } from "./data";
import {
  createInitialState,
  getOperationsCommandPlan,
  hireAgentViaChannel,
  startProductProject,
} from "./simulation";
import type { GameState, HiredAgent } from "./types";

const architect = () => {
  const agent = agentTypes.find((entry) => entry.id === "prompt_architect");
  if (!agent) throw new Error("Missing prompt architect");
  return agent;
};

const writingProduct = () => {
  const product = products.find((entry) => entry.id === "ai_writing_assistant");
  if (!product) throw new Error("Missing writing product");
  return product;
};

function operationReadyState(): GameState {
  const initial = createInitialState();
  const hired = hireAgentViaChannel(architect(), {
    ...initial,
    resources: {
      ...initial.resources,
      cash: 80000,
      compute: 500,
      data: 500,
      users: 9000,
      trust: 68,
      hype: 30,
      automation: 18,
    },
    activeProducts: ["foundation_model_v0", "ai_writing_assistant"],
    productLevels: { foundation_model_v0: 1, ai_writing_assistant: 1 },
    capabilities: Object.fromEntries(capabilities.map((capability) => [capability.id, Math.min(3, capability.max_level)])),
    unlockedDomains: [
      ...new Set([...initial.unlockedDomains, "developer_tools", "creator_tools", "robotics", "semiconductors"]),
    ],
    office: { expansionId: "campus_lab", placedItemIds: [] },
  }, "career_recruiting");
  const extraAgents: HiredAgent[] = agentTypes
    .filter((agent) => agent.id !== architect().id)
    .slice(0, 4)
    .map((agent, index) => ({
      id: `ops-extra-${index + 1}`,
      typeId: agent.id,
      name: agent.name,
      level: 2,
      energy: 78,
      loyalty: 74,
      equippedItemIds: [],
    }));

  return startProductProject(writingProduct(), {
    ...hired,
    hiredAgents: [...hired.hiredAgents, ...extraAgents],
  }, [hired.hiredAgents[0].id]);
}

describe("v0.40 operations command plan", () => {
  it("turns company state into a visible monthly operating agenda", () => {
    const plan = getOperationsCommandPlan(operationReadyState());

    expect(plan.headline).toContain("운영");
    expect(plan.focusCards.length).toBeGreaterThanOrEqual(3);
    expect(plan.focusCards.map((card) => card.targetMenu)).toEqual(expect.arrayContaining(["products", "agents", "shop"]));
    expect(plan.activeSafeguards.join(" ")).toContain("구획");
    expect(plan.nextMilestone.length).toBeGreaterThan(4);
  });

  it("prioritizes urgent staff care before growth when a key worker is exhausted", () => {
    const state = {
      ...operationReadyState(),
      hiredAgents: operationReadyState().hiredAgents.map((agent, index) =>
        index === 0 ? { ...agent, energy: 18, loyalty: 38, level: 4 } : agent,
      ),
    };

    const plan = getOperationsCommandPlan(state);

    expect(plan.riskLevel).toBe("urgent");
    expect(plan.focusCards[0]).toMatchObject({
      id: "staff_incidents",
      targetMenu: "agents",
      severity: "urgent",
    });
  });
});
