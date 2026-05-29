import { describe, expect, it } from "vitest";
import { agentTypes, capabilities, domains, industrySynergies, products } from "./data";
import { getBoundarylessExpansionGoals } from "./boundaryless-expansion";
import { getIndustrySynergySummary } from "./industry-synergies";
import { advanceMonth, calculateMonthlyEconomy, createInitialState, getAgentHireCheck, getProductCheck, upgradeCapability } from "./simulation";
import type { GameState } from "./types";

describe("v0.12.4 boundaryless expansion direction", () => {
  it("starts from a launchable AI model before expanding into apps", () => {
    const state = createInitialState();
    const foundationModel = products.find((product) => product.id === "foundation_model_v0");

    expect(foundationModel).toMatchObject({
      domain: "foundation_models",
      tags: expect.arrayContaining(["model", "core_ai"]),
    });
    expect(getProductCheck(foundationModel!, state).ok).toBe(true);
  });

  it("defines far expansion domains for chips, mobility, robotics, and odd consumer industries", () => {
    const domainIds = new Set(domains.map((domain) => domain.id));
    const productIds = new Set(products.map((product) => product.id));

    expect([...domainIds]).toEqual(
      expect.arrayContaining(["semiconductors", "mobility", "robotics", "odd_industries", "toys"]),
    );
    expect([...productIds]).toEqual(
      expect.arrayContaining([
        "ai_training_chip",
        "autonomous_vehicle_stack",
        "barista_robot_cafe_chain",
        "toy_imagination_engine",
      ]),
    );
  });

  it("tracks the controlled v0.60 physical industries in boundaryless goals", () => {
    const goalIds = getBoundarylessExpansionGoals(createInitialState()).map((goal) => goal.domainId);

    expect(goalIds).toEqual(expect.arrayContaining(["manufacturing", "logistics", "energy"]));
    expect(goalIds.filter((goalId) => ["manufacturing", "logistics", "energy"].includes(goalId))).toHaveLength(3);
  });

  it("defines exactly 10 cross-industry synergies for the boundaryless slice", () => {
    expect(industrySynergies).toHaveLength(10);
    expect(industrySynergies.map((synergy) => synergy.id)).toEqual(
      expect.arrayContaining([
        "robotics_manufacturing_cell",
        "factory_energy_loop",
        "smart_fleet_grid",
        "chip_model_stack",
        "enterprise_energy_ops",
      ]),
    );
    expect(industrySynergies.every((synergy) => synergy.required_domains.length >= 2)).toBe(true);
  });

  it("activates industry synergies from launched products or unlocked domains", () => {
    const state: GameState = {
      ...createInitialState(),
      activeProducts: ["warehouse_robot_fleet"],
      unlockedDomains: [...createInitialState().unlockedDomains, "manufacturing"],
    };
    const summary = getIndustrySynergySummary(state);

    expect(summary.active.map((synergy) => synergy.id)).toContain("robotics_manufacturing_cell");
    expect(summary.totalMonthlyEffects).toMatchObject({
      automation: 2,
      cash: 120,
    });
    expect(summary.nextCandidate?.progressLabel).toContain("잠김");
  });

  it("adds active industry synergy effects through monthly strategy aggregation", () => {
    const base = createInitialState();
    const state: GameState = {
      ...base,
      activeProducts: ["warehouse_robot_fleet"],
      unlockedDomains: [...base.unlockedDomains, "manufacturing"],
      resources: {
        ...base.resources,
        cash: 50000,
        compute: 1000,
        data: 1000,
      },
    };
    const summary = getIndustrySynergySummary(state);
    const economy = calculateMonthlyEconomy(state);

    expect(summary.active.map((synergy) => synergy.id)).toContain("robotics_manufacturing_cell");
    expect(economy.strategyEffects?.automation).toBeGreaterThanOrEqual(summary.totalMonthlyEffects.automation ?? 0);
    expect(economy.strategyEffects?.cash).toBeGreaterThanOrEqual(summary.totalMonthlyEffects.cash ?? 0);
  });

  it("wires manufacturing and logistics capabilities into physical industry gates", () => {
    const capabilityIds = new Set(capabilities.map((capability) => capability.id));
    const capabilityById = new Map(capabilities.map((capability) => [capability.id, capability]));
    const domainById = new Map(domains.map((domain) => [domain.id, domain]));
    const initial = createInitialState();
    const fundedState: GameState = {
      ...initial,
      resources: {
        ...initial.resources,
        cash: 500000,
        compute: 5000,
        data: 5000,
        talent: 50,
      },
    };
    const manufacturing = capabilityById.get("manufacturing");
    const logistics = capabilityById.get("logistics");

    expect(capabilityIds.has("manufacturing")).toBe(true);
    expect(capabilityIds.has("logistics")).toBe(true);
    expect(capabilityIds.has("energy")).toBe(false);
    expect(initial.capabilities).toMatchObject({ manufacturing: 0, logistics: 0 });
    expect(manufacturing?.unlocks_domains).toMatchObject({ "1": "manufacturing", "3": "energy" });
    expect(logistics?.unlocks_domains).toMatchObject({ "1": "logistics" });
    expect(domainById.get("manufacturing")?.unlock_requirements).toMatchObject({ robotics: 1, manufacturing: 1 });
    expect(domainById.get("logistics")?.unlock_requirements).toMatchObject({ logistics: 1 });
    expect(domainById.get("energy")?.unlock_requirements).toMatchObject({ manufacturing: 3 });

    const manufacturingProducts = products.filter((product) => product.domain === "manufacturing");
    const logisticsProducts = products.filter((product) => product.domain === "logistics");
    const energyProducts = products.filter((product) => product.domain === "energy");

    expect(manufacturingProducts.every((product) => (product.required_capabilities.manufacturing ?? 0) >= 1)).toBe(true);
    expect(logisticsProducts.every((product) => (product.required_capabilities.logistics ?? 0) >= 1)).toBe(true);
    expect(energyProducts.every((product) => (product.required_capabilities.manufacturing ?? 0) >= 2)).toBe(true);

    const manufacturingUnlocked = upgradeCapability(manufacturing!, fundedState);
    const logisticsUnlocked = upgradeCapability(logistics!, fundedState);
    const energyUnlocked = [1, 2, 3].reduce<GameState>((state) => upgradeCapability(manufacturing!, state), fundedState);

    expect(manufacturingUnlocked.unlockedDomains).toContain("manufacturing");
    expect(logisticsUnlocked.unlockedDomains).toContain("logistics");
    expect(energyUnlocked.unlockedDomains).toContain("energy");
  });

  it("starts with a larger rival field and introduces annual strong challengers", () => {
    let state = createInitialState();

    expect(state.competitorStates.length).toBeGreaterThanOrEqual(8);
    expect(state.competitorStates.some((competitor) => competitor.id === "competitor_autonova_motors")).toBe(false);

    while (state.month < 12) {
      state = advanceMonth(state);
    }

    expect(state.competitorStates.some((competitor) => competitor.id === "competitor_autonova_motors")).toBe(true);
    expect(state.competitorStates.some((competitor) => competitor.id === "competitor_brewchain")).toBe(true);
    expect(state.timeline.some((entry) => entry.includes("강력한 신규 경쟁사 등장"))).toBe(true);
  });

  it("keeps robots as late hireable development labor unlocked by robotics capability", () => {
    const robotics = capabilities.find((capability) => capability.id === "robotics");
    const robotUnit = agentTypes.find((agent) => agent.id === "factory_robot_unit");
    const initial = createInitialState();
    const roboticsReady = {
      ...initial,
      capabilities: {
        ...initial.capabilities,
        robotics: 1,
      },
    };

    expect(robotics?.unlocks_domains?.["1"]).toBe("robotics");
    expect(robotUnit?.role).toContain("로봇");
    expect(getAgentHireCheck(robotUnit!, initial).ok).toBe(false);
    expect(getAgentHireCheck(robotUnit!, roboticsReady).ok).toBe(true);
  });

  it("summarizes boundaryless industry expansion goals from locked to launched", () => {
    const initial = createInitialState();
    const roboticsReady = {
      ...initial,
      unlockedDomains: [...initial.unlockedDomains, "robotics"],
    };
    const launchedRobotFleet = {
      ...roboticsReady,
      activeProducts: ["warehouse_robot_fleet"],
    };

    expect(getBoundarylessExpansionGoals(initial).find((goal) => goal.domainId === "robotics")).toMatchObject({
      status: "locked",
      progressPercent: 0,
    });
    expect(getBoundarylessExpansionGoals(roboticsReady).find((goal) => goal.domainId === "robotics")).toMatchObject({
      status: "unlocked",
      progressPercent: 50,
      nextProductId: "warehouse_robot_fleet",
    });
    expect(getBoundarylessExpansionGoals(launchedRobotFleet).find((goal) => goal.domainId === "robotics")).toMatchObject({
      status: "launched",
      progressPercent: 100,
    });
  });
});
