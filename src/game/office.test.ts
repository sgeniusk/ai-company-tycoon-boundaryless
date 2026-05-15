import { describe, expect, it } from "vitest";
import { agentTypes, items, officeExpansions, products } from "./data";
import {
  buyItem,
  buyOfficeExpansion,
  createInitialState,
  getAgentEffectiveStats,
  getAgentHireCheck,
  getProductProjectForecast,
  getNextOfficeExpansion,
  getOfficeDecorationSlots,
  getOfficeExpansion,
  getOfficeExpansionCheck,
  getOfficeHireCapacity,
  getPlacedOfficeItems,
  getPlaceOfficeItemCheck,
  hireAgent,
  placeOfficeItem,
  unplaceOfficeItem,
} from "./simulation";
import type { GameState } from "./types";

describe("v0.12.7 office expansion and decoration", () => {
  it("starts with a small office that limits hiring capacity", () => {
    const initial = createRichInitialState();
    const hireOrder = ["prompt_architect", "data_curator", "infra_operator", "growth_hacker"];
    const agents = hireOrder.map((id) => agentTypes.find((agent) => agent.id === id));
    if (agents.some((agent) => !agent)) throw new Error("Missing office hiring fixtures");

    const first = hireAgent(agents[0]!, initial);
    const second = hireAgent(agents[1]!, first);
    const third = hireAgent(agents[2]!, second);

    expect(getOfficeExpansion(third).id).toBe("garage_lab");
    expect(getOfficeHireCapacity(third)).toBe(3);
    expect(third.hiredAgents).toHaveLength(3);
    expect(getAgentHireCheck(agents[3]!, third)).toMatchObject({
      ok: false,
      reasons: expect.arrayContaining(["사무실 수용 인원 3명 한도입니다. 상점에서 사무실을 확장하세요."]),
    });
  });

  it("buys the next office expansion to increase hiring and decoration capacity", () => {
    const initial = {
      ...createRichInitialState(),
      activeProducts: ["ai_writing_assistant"],
    };
    const nextExpansion = getNextOfficeExpansion(initial);
    if (!nextExpansion) throw new Error("Missing next office expansion");

    expect(nextExpansion.id).toBe("startup_suite");
    expect(getOfficeExpansionCheck(nextExpansion, initial).ok).toBe(true);

    const expanded = buyOfficeExpansion(nextExpansion, initial);

    expect(expanded.office.expansionId).toBe("startup_suite");
    expect(getOfficeHireCapacity(expanded)).toBe(5);
    expect(getOfficeDecorationSlots(expanded)).toBe(5);
    expect(expanded.resources.cash).toBe(initial.resources.cash - nextExpansion.cost.cash);
  });

  it("auto-places office decorations while slots remain and lets stored decor be swapped in", () => {
    const initial = createRichInitialState();
    const gpuRack = items.find((item) => item.id === "gpu_rack_mini");
    const whiteboard = items.find((item) => item.id === "tensor_whiteboard");
    const stickyWall = items.find((item) => item.id === "ux_sticky_wall");
    const coolingWall = items.find((item) => item.id === "cooling_fan_wall");
    if (!gpuRack || !whiteboard || !stickyWall || !coolingWall) throw new Error("Missing decoration fixtures");

    const withThreeDecor = [gpuRack, whiteboard, stickyWall].reduce((state, item) => buyItem(item, state), initial);
    const stored = buyItem(coolingWall, withThreeDecor);

    expect(getOfficeDecorationSlots(stored)).toBe(3);
    expect(getPlacedOfficeItems(stored).map((item) => item.id)).toEqual(["gpu_rack_mini", "tensor_whiteboard", "ux_sticky_wall"]);
    expect(stored.office.placedItemIds).not.toContain("cooling_fan_wall");
    expect(getPlaceOfficeItemCheck(coolingWall, stored).ok).toBe(false);

    const withOpenSlot = unplaceOfficeItem("ux_sticky_wall", stored);
    const swapped = placeOfficeItem(coolingWall, withOpenSlot);

    expect(swapped.office.placedItemIds).toContain("cooling_fan_wall");
    expect(getPlacedOfficeItems(swapped).map((item) => item.id)).not.toContain("ux_sticky_wall");
  });

  it("uses only placed office decorations for global stat bonuses", () => {
    const architect = agentTypes.find((agent) => agent.id === "prompt_architect");
    const writingProduct = products.find((product) => product.id === "ai_writing_assistant");
    const stickyWall = items.find((item) => item.id === "ux_sticky_wall");
    const coolingWall = items.find((item) => item.id === "cooling_fan_wall");
    if (!architect || !writingProduct || !stickyWall || !coolingWall) throw new Error("Missing stat fixture");

    const hired = hireAgent(architect, createRichInitialState());
    const withDecor = placeOfficeItem(coolingWall, buyItem(coolingWall, buyItem(stickyWall, hired)));
    const agent = withDecor.hiredAgents[0];

    expect(getAgentEffectiveStats(agent, withDecor).product).toBe(architect.stats.product);
    const decoratedForecast = getProductProjectForecast(writingProduct, withDecor, [agent.id]);

    const withoutStickyWall = unplaceOfficeItem(stickyWall.id, withDecor);
    const plainForecast = getProductProjectForecast(writingProduct, withoutStickyWall, [agent.id]);

    expect(decoratedForecast.expectedQuality).toBeGreaterThan(plainForecast.expectedQuality);
  });

  it("defines office expansion data from small lab to campus", () => {
    expect(officeExpansions.map((expansion) => expansion.id)).toEqual([
      "garage_lab",
      "startup_suite",
      "growth_floor",
      "campus_lab",
    ]);
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
    capabilities: {
      ...createInitialState().capabilities,
      code: 1,
      vision: 1,
      agent: 1,
      robotics: 1,
    },
    activeProducts: ["ai_writing_assistant"],
  };
}
