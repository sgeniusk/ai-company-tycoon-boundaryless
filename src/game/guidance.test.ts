import { describe, expect, it } from "vitest";
import { agentTypes, items, officeExpansions, products } from "./data";
import { createDevelopmentPuzzle, resolveDevelopmentPuzzle } from "./development-puzzle";
import { buyItem, buyOfficeExpansion, chooseGrowthPath, createInitialState, hireAgent, startProductProject, advanceMonth } from "./simulation";
import { getFirstTenMinutePlan, getFirstTenMinuteProgress, getGuidanceStep, getOpeningObjectives } from "./guidance";

describe("alpha v0.9.1 player guidance", () => {
  it("points a new player to hiring the first agent", () => {
    const guidance = getGuidanceStep(createInitialState());

    expect(guidance).toMatchObject({
      id: "hire_first_agent",
      menu: "agents",
      actionLabel: "에이전트 고용",
    });
  });

  it("tracks a visible first-session objective strip", () => {
    const architect = agentTypes.find((agent) => agent.id === "prompt_architect");
    const product = products.find((entry) => entry.id === "ai_writing_assistant");
    if (!architect || !product) throw new Error("Missing starter fixtures");

    const initialObjectives = getOpeningObjectives(createInitialState());
    const staffed = hireAgent(architect, createInitialState());
    const started = startProductProject(product, staffed);
    const released = advanceMonth(advanceMonth(started));

    expect(initialObjectives.map((objective) => objective.id)).toEqual([
      "hire_agent",
      "start_product",
      "release_product",
      "choose_next_path",
    ]);
    expect(initialObjectives[0].complete).toBe(false);
    expect(getOpeningObjectives(staffed)[0].complete).toBe(true);
    expect(getOpeningObjectives(started)[1].complete).toBe(true);
    expect(getOpeningObjectives(released)[2].complete).toBe(true);
  });

  it("points a staffed company to starting the first product project", () => {
    const architect = agentTypes.find((agent) => agent.id === "prompt_architect");
    if (!architect) throw new Error("Missing prompt architect");

    const guidance = getGuidanceStep(hireAgent(architect, createInitialState()));

    expect(guidance).toMatchObject({
      id: "start_first_project",
      menu: "products",
      actionLabel: "제품 개발 시작",
    });
  });

  it("points an active project toward card and issue preparation", () => {
    const architect = agentTypes.find((agent) => agent.id === "prompt_architect");
    const product = products.find((entry) => entry.id === "ai_writing_assistant");
    if (!architect || !product) throw new Error("Missing starter fixtures");

    const started = startProductProject(product, hireAgent(architect, createInitialState()));
    const guidance = getGuidanceStep(started);

    expect(guidance).toMatchObject({
      id: "use_card_issue",
      menu: "deck",
      actionLabel: "덱 열기",
    });
  });

  it("points a released first product toward choosing a growth path", () => {
    const architect = agentTypes.find((agent) => agent.id === "prompt_architect");
    const product = products.find((entry) => entry.id === "ai_writing_assistant");
    if (!architect || !product) throw new Error("Missing starter fixtures");

    const started = startProductProject(product, hireAgent(architect, createInitialState()));
    const released = advanceMonth(advanceMonth(started));
    const guidance = getGuidanceStep(released);

    expect(guidance).toMatchObject({
      id: "choose_growth_path",
      menu: "products",
      actionLabel: "성장 분기 보기",
    });
  });

  it("marks the next-growth objective complete after committing to a path", () => {
    const architect = agentTypes.find((agent) => agent.id === "prompt_architect");
    const product = products.find((entry) => entry.id === "ai_writing_assistant");
    if (!architect || !product) throw new Error("Missing starter fixtures");

    const started = startProductProject(product, hireAgent(architect, createInitialState()));
    const released = advanceMonth(advanceMonth(started));
    const chosen = chooseGrowthPath("productivity_line", released);

    expect(getOpeningObjectives(chosen)[3]).toMatchObject({
      id: "choose_next_path",
      complete: true,
    });
    expect(getGuidanceStep(chosen).id).not.toBe("choose_growth_path");
  });
});

describe("alpha v0.12.8 first ten minute guidance", () => {
  it("shows a seven-step first-session roadmap in the intended order", () => {
    const plan = getFirstTenMinutePlan(createInitialState());

    expect(plan.map((step) => step.id)).toEqual([
      "hire_agent",
      "start_product",
      "use_card_issue",
      "release_product",
      "choose_growth_path",
      "visit_shop_office",
      "counter_rival",
    ]);
    expect(plan[0]).toMatchObject({
      active: true,
      menu: "agents",
      label: "에이전트 고용",
    });
    expect(getFirstTenMinuteProgress(createInitialState())).toBe(0);
  });

  it("prioritizes card and issue response before simply advancing an active project", () => {
    const architect = agentTypes.find((agent) => agent.id === "prompt_architect");
    const writingProduct = products.find((product) => product.id === "ai_writing_assistant");
    if (!architect || !writingProduct) throw new Error("Missing first ten minute fixtures");

    const started = startProductProject(writingProduct, hireAgent(architect, createInitialState()));
    const guidance = getGuidanceStep(started);
    const activeStep = getFirstTenMinutePlan(started).find((step) => step.active);

    expect(guidance).toMatchObject({
      id: "use_card_issue",
      menu: "deck",
      actionLabel: "덱 열기",
    });
    expect(activeStep?.id).toBe("use_card_issue");
  });

  it("moves from issue response to release progress after a development issue is solved", () => {
    const architect = agentTypes.find((agent) => agent.id === "prompt_architect");
    const writingProduct = products.find((product) => product.id === "ai_writing_assistant");
    if (!architect || !writingProduct) throw new Error("Missing first ten minute fixtures");

    const started = startProductProject(writingProduct, hireAgent(architect, createInitialState()));
    const projectId = started.productProjects[0].id;
    const puzzle = createDevelopmentPuzzle(projectId, started);
    const resolved = resolveDevelopmentPuzzle(
      projectId,
      puzzle.tiles.slice(0, 4).map((tile) => tile.id),
      started,
    );

    expect(getGuidanceStep(resolved)).toMatchObject({
      id: "advance_project",
      actionLabel: "출시까지 진행",
    });
    expect(getFirstTenMinutePlan(resolved).find((step) => step.active)?.id).toBe("release_product");
  });

  it("routes a post-growth company toward office setup before rival counter planning", () => {
    const architect = agentTypes.find((agent) => agent.id === "prompt_architect");
    const writingProduct = products.find((product) => product.id === "ai_writing_assistant");
    if (!architect || !writingProduct) throw new Error("Missing post-growth fixtures");

    const released = advanceMonth(advanceMonth(startProductProject(writingProduct, hireAgent(architect, createInitialState()))));
    const chosen = chooseGrowthPath("productivity_line", released);

    expect(getGuidanceStep(chosen)).toMatchObject({
      id: "visit_shop_office",
      menu: "shop",
    });
    expect(getFirstTenMinutePlan(chosen).find((step) => step.active)?.id).toBe("visit_shop_office");
  });

  it("routes an office-ready company toward rival counter planning", () => {
    const architect = agentTypes.find((agent) => agent.id === "prompt_architect");
    const writingProduct = products.find((product) => product.id === "ai_writing_assistant");
    const startupSuite = officeExpansions.find((expansion) => expansion.id === "startup_suite");
    const gpuRack = items.find((item) => item.id === "gpu_rack_mini");
    if (!architect || !writingProduct || !startupSuite || !gpuRack) throw new Error("Missing office-ready fixtures");

    const released = advanceMonth(advanceMonth(startProductProject(writingProduct, hireAgent(architect, createInitialState()))));
    const chosen = chooseGrowthPath("productivity_line", released);
    const funded = {
      ...chosen,
      resources: { ...chosen.resources, cash: 12000, data: 40, compute: 80 },
    };
    const officeReady = buyItem(gpuRack, buyOfficeExpansion(startupSuite, funded));

    expect(getGuidanceStep(officeReady)).toMatchObject({
      id: "counter_rival",
      menu: "competition",
    });
    expect(getFirstTenMinutePlan(officeReady).find((step) => step.active)?.id).toBe("counter_rival");
    expect(getFirstTenMinuteProgress(officeReady)).toBeGreaterThanOrEqual(80);
  });
});
