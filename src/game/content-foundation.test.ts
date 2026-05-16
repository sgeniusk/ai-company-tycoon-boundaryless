import { describe, expect, it } from "vitest";
import { agentTypes, items, products } from "./data";
import {
  createInitialState,
  getAgentHireCheck,
  getItemCheck,
  hireAgent,
} from "./simulation";
import {
  getAgentContentRows,
  getCampaignContentPhase,
  getFoundationRecommendations,
  getFoundationSnapshot,
  getItemContentRows,
} from "./content-foundation";
import type { GameState } from "./types";

describe("v0.14.2 content foundation helpers", () => {
  it("classifies the current campaign phase from the saveable game state", () => {
    expect(getCampaignContentPhase(createInitialState()).id).toBe("garage");
    expect(getCampaignContentPhase(createMatureState()).id).toBe("enterprise");
  });

  it("builds recruitable agent rows with kind labels, availability, and recommendations", () => {
    const state = createInitialState();
    const rows = getAgentContentRows(state);
    const recommended = rows.filter((row) => row.recommended);

    expect(rows).toHaveLength(agentTypes.length);
    expect(rows.map((row) => row.kind)).toEqual(expect.arrayContaining(["human", "ai_agent", "robot"]));
    expect(recommended.length).toBeGreaterThanOrEqual(3);
    expect(recommended.some((row) => row.kind === "human")).toBe(true);
    expect(recommended.every((row) => getAgentHireCheck(row.agent, state).ok)).toBe(true);
  });

  it("recommends robot and hardware foundations once robotics and scale are unlocked", () => {
    const state = createMatureState();
    const recommendations = getFoundationRecommendations(state, 8);

    expect(recommendations.agents.some((row) => row.kind === "robot")).toBe(true);
    expect(recommendations.items.some((row) => ["hardware", "manufacturing", "mobility"].includes(row.item.category))).toBe(true);
  });

  it("builds item rows that separate owned, available, locked, and office-placeable content", () => {
    const state = {
      ...hireAgent(agentTypes.find((agent) => agent.id === "prompt_architect")!, createInitialState()),
      ownedItems: ["cooling_fan_wall"],
      office: {
        ...createInitialState().office,
        placedItemIds: [],
      },
    };
    const rows = getItemContentRows(state);
    const promptNotebook = rows.find((row) => row.item.id === "prompt_notebook");

    expect(rows).toHaveLength(items.length);
    expect(promptNotebook?.recommended).toBe(true);
    expect(rows.some((row) => row.placeableInOffice)).toBe(true);
    expect(rows.filter((row) => row.available).every((row) => getItemCheck(row.item, state).ok)).toBe(true);
  });

  it("summarizes content foundation counts for UI and reports", () => {
    const state = createMatureState();
    const snapshot = getFoundationSnapshot(state);

    expect(snapshot.agentTotal).toBe(agentTypes.length);
    expect(snapshot.itemTotal).toBe(items.length);
    expect(snapshot.recommendedAgentIds.length).toBeGreaterThan(0);
    expect(snapshot.recommendedItemIds.length).toBeGreaterThan(0);
    expect(snapshot.phase.id).toBe("enterprise");
  });
});

function createMatureState(): GameState {
  return {
    ...createInitialState(),
    month: 48,
    resources: {
      ...createInitialState().resources,
      cash: 120000,
      compute: 1200,
      data: 1200,
      users: 60000,
      trust: 80,
      hype: 35,
      automation: 65,
      talent: 20,
    },
    capabilities: {
      ...createInitialState().capabilities,
      code: 3,
      language: 3,
      vision: 3,
      video: 2,
      agent: 2,
      robotics: 2,
    },
    unlockedDomains: [
      "foundation_models",
      "personal_productivity",
      "developer_tools",
      "creator_tools",
      "robotics",
      "mobility",
    ],
    activeProducts: products.slice(0, 6).map((product) => product.id),
    locationId: "seoul_ai_tower",
  };
}
