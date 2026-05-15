import { describe, expect, it } from "vitest";
import { agentTypes, capabilities, domains, products } from "./data";
import { advanceMonth, createInitialState, getAgentHireCheck, getProductCheck } from "./simulation";

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
});
