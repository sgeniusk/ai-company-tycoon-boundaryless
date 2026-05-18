import { describe, expect, it } from "vitest";
import { agentTypes, items, officeExpansions, officeZones, products } from "./data";
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
  getOfficeGrowthPlan,
  getOfficeHireCapacity,
  getOfficeSynergySummary,
  getOfficeMonthlyEffects,
  getOfficeZonePlan,
  getPlacedOfficeItems,
  getPlaceOfficeItemCheck,
  hireAgent,
  placeOfficeItem,
  unplaceOfficeItem,
  advanceMonth,
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

  it("applies office expansion monthly effects after moving into a larger office", () => {
    const initial = {
      ...createRichInitialState(),
      activeProducts: ["ai_writing_assistant"],
      productLevels: { ai_writing_assistant: 1 },
      resources: {
        ...createRichInitialState().resources,
        cash: 100000,
        data: 50,
        compute: 50,
      },
    };
    const startupSuite = officeExpansions.find((expansion) => expansion.id === "startup_suite");
    if (!startupSuite) throw new Error("Missing startup suite");

    const expanded = buyOfficeExpansion(startupSuite, initial);

    expect(getOfficeMonthlyEffects(expanded)).toMatchObject({
      cash: 120,
      users: 40,
    });

    const advanced = advanceMonth(expanded);

    expect(advanced.lastMonthReport?.strategyEffects).toMatchObject({
      cash: 180,
      users: 160,
      data: 1,
    });
    expect(advanced.timeline.some((entry) => entry.includes("사무실 효과"))).toBe(true);
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
      "regional_hq",
      "boundaryless_campus",
    ]);
  });

  it("unlocks office zones by expansion level and applies their monthly operations", () => {
    const architect = agentTypes.find((agent) => agent.id === "prompt_architect");
    const curator = agentTypes.find((agent) => agent.id === "data_curator");
    const writingProduct = products.find((product) => product.id === "ai_writing_assistant");
    const startupSuite = officeExpansions.find((expansion) => expansion.id === "startup_suite");
    if (!architect || !curator || !writingProduct || !startupSuite) throw new Error("Missing office zone fixtures");

    const staffed = hireAgent(curator, hireAgent(architect, createRichInitialState()));
    const expanded = buyOfficeExpansion(startupSuite, {
      ...staffed,
      activeProducts: [writingProduct.id],
      productLevels: { [writingProduct.id]: 1 },
    });
    const zonePlan = getOfficeZonePlan(expanded);

    expect(officeZones.length).toBeGreaterThanOrEqual(8);
    expect(zonePlan.active.map((zone) => zone.id)).toEqual(
      expect.arrayContaining(["founder_command_desk", "compute_bay", "hiring_corner", "launch_stage"]),
    );
    expect(zonePlan.totalMonthlyEffects).toMatchObject({
      cash: 120,
      users: 120,
      data: 2,
    });
    expect(getOfficeGrowthPlan(expanded).current.activeZoneCount).toBe(zonePlan.active.length);

    const advanced = advanceMonth(expanded);

    expect(advanced.lastMonthReport?.strategyEffects).toMatchObject({
      cash: 240,
      users: 160,
      data: 2,
    });
    expect(advanced.timeline.some((entry) => entry.includes("사무실 구획"))).toBe(true);
  });

  it("activates office decoration synergies from placed item categories", () => {
    const gpuRack = items.find((item) => item.id === "gpu_rack_mini");
    const coolingWall = items.find((item) => item.id === "cooling_fan_wall");
    const dataDesk = items.find((item) => item.id === "data_labeler_desk");
    if (!gpuRack || !coolingWall || !dataDesk) throw new Error("Missing office synergy fixtures");

    const decorated = [gpuRack, coolingWall, dataDesk].reduce((state, item) => buyItem(item, state), createRichInitialState());
    const summary = getOfficeSynergySummary(decorated);

    expect(summary.active.map((synergy) => synergy.id)).toContain("garage_compute_cluster");
    expect(summary.totalMonthlyEffects).toMatchObject({
      compute: 6,
      data: 3,
    });
    expect(summary.nextCandidate?.id).toBe("launch_corner");
  });

  it("applies active office synergy effects during monthly operations", () => {
    const gpuRack = items.find((item) => item.id === "gpu_rack_mini");
    const coolingWall = items.find((item) => item.id === "cooling_fan_wall");
    const dataDesk = items.find((item) => item.id === "data_labeler_desk");
    const writingProduct = products.find((product) => product.id === "ai_writing_assistant");
    if (!gpuRack || !coolingWall || !dataDesk || !writingProduct) throw new Error("Missing monthly synergy fixtures");

    const base = {
      ...[gpuRack, coolingWall, dataDesk].reduce((state, item) => buyItem(item, state), createRichInitialState()),
      activeProducts: [writingProduct.id],
      productLevels: { [writingProduct.id]: 1 },
      resources: {
        ...createRichInitialState().resources,
        compute: 100,
        data: 50,
      },
    };
    const advanced = advanceMonth(base);

    expect(advanced.lastMonthReport?.strategyEffects).toMatchObject({
      compute: 8,
      data: 5,
      cash: 60,
    });
    expect(advanced.timeline.some((entry) => entry.includes("사무실 시너지"))).toBe(true);
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
