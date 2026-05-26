import { describe, expect, it } from "vitest";
import { agentTypes, capabilities, items, officeExpansions, products } from "./data";
import { chooseAnnualDirective } from "./annual-review";
import { chooseCardReward } from "./deckbuilding";
import { createDevelopmentPuzzle, resolveDevelopmentPuzzle } from "./development-puzzle";
import {
  advanceMonth,
  advanceToFirstAnnualReview,
  advanceToFirstLaunch,
  buyItem,
  buyOfficeExpansion,
  chooseGrowthPath,
  createInitialState,
  hireAgent,
  startProductProject,
  upgradeCapability,
} from "./simulation";
import {
  getActiveAlphaRunRoadmapStep,
  getAlphaRunActionFeedback,
  getAlphaRunCompletionSummary,
  getAlphaRunRoadmap,
  getAlphaRunRoadmapProgress,
  getFirstTenMinutePlan,
  getFirstTenMinuteProgress,
  getGuidanceStep,
  getOpeningObjectives,
} from "./guidance";
import { runTenMinuteAlphaSimulation } from "./run-simulator";
import type { GameState } from "./types";

function createCardSolvedFirstReleaseState(): GameState {
  const architect = agentTypes.find((agent) => agent.id === "prompt_architect");
  const writingProduct = products.find((product) => product.id === "ai_writing_assistant");
  if (!architect || !writingProduct) throw new Error("Missing alpha roadmap fixtures");

  const started = startProductProject(writingProduct, hireAgent(architect, createInitialState()));
  const projectId = started.productProjects[0].id;
  const puzzle = createDevelopmentPuzzle(projectId, started);
  const resolved = resolveDevelopmentPuzzle(
    projectId,
    puzzle.tiles.slice(0, 4).map((tile) => tile.id),
    started,
  );

  return advanceToFirstLaunch(resolved);
}

function createRewardedGrowthState(): GameState {
  const released = createCardSolvedFirstReleaseState();
  const rewardCardId = released.roguelite.pendingCardReward?.offeredCardIds[0];
  const rewarded = rewardCardId ? chooseCardReward(rewardCardId, released) : released;

  return chooseGrowthPath("productivity_line", rewarded);
}

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
    expect(guidance.description).toContain("제품 메뉴 상단");
    expect(guidance.helperText).toContain("추천 첫 제품");
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
    expect(guidance.description).toContain("덱 메뉴 상단");
    expect(guidance.helperText).toContain("첫 개발 이슈");
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

  it("routes a completed first ten minute run toward the year-one annual review", () => {
    const alphaState = runTenMinuteAlphaSimulation("productivity_line").finalState;
    const reviewRunwayState = {
      ...alphaState,
      currentEvent: undefined,
      currentRivalEvent: undefined,
      month: 10,
      annualReviewHistory: [],
    };
    const guidance = getGuidanceStep(reviewRunwayState);

    expect(getFirstTenMinuteProgress(reviewRunwayState)).toBe(100);
    expect(guidance).toMatchObject({
      id: "advance_annual_review",
      actionLabel: "심사까지 진행",
      priorityLabel: "연간 심사",
    });
    expect(guidance.description).toContain("1년차 심사");
    expect(guidance.helperText).toContain("2개월");
  });
});

describe("alpha v0.56 30 minute alpha run roadmap", () => {
  it("shows the full first-session arc and next rewards from a fresh run", () => {
    const roadmap = getAlphaRunRoadmap(createInitialState());

    expect(roadmap.map((step) => step.id)).toEqual([
      "first_launch",
      "card_payoff",
      "reward_growth",
      "annual_directive",
      "year_two_product",
    ]);
    expect(roadmap[0]).toMatchObject({
      active: true,
      complete: false,
      actionLabel: "팀원 고용",
      menu: "agents",
      rewardPreview: "보상 카드와 성장 분기",
      timeLabel: "0-10분",
      title: "첫 제품 출시",
    });
    expect(roadmap[4]).toMatchObject({
      rewardPreview: "두 번째 출시 보상",
      title: "2년차 신제품 착수",
    });
    expect(getAlphaRunRoadmapProgress(createInitialState())).toBe(0);
    expect(getAlphaRunActionFeedback(roadmap[0])).toBe("팀원 고용 실행 · 다음 보상: 보상 카드와 성장 분기");
  });

  it("retargets the first launch roadmap control to the next concrete setup menu", () => {
    const architect = agentTypes.find((agent) => agent.id === "prompt_architect");
    const writingProduct = products.find((product) => product.id === "ai_writing_assistant");
    if (!architect || !writingProduct) throw new Error("Missing alpha roadmap control fixtures");

    const staffed = hireAgent(architect, createInitialState());
    const started = startProductProject(writingProduct, staffed);
    const projectId = started.productProjects[0].id;
    const puzzle = createDevelopmentPuzzle(projectId, started);
    const resolved = resolveDevelopmentPuzzle(
      projectId,
      puzzle.tiles.slice(0, 4).map((tile) => tile.id),
      started,
    );

    expect(getAlphaRunRoadmap(createInitialState())[0]).toMatchObject({
      id: "first_launch",
      menu: "agents",
      actionLabel: "팀원 고용",
    });
    expect(getAlphaRunRoadmap(staffed)[0]).toMatchObject({
      id: "first_launch",
      menu: "products",
      actionLabel: "제품 개발",
    });
    expect(getAlphaRunRoadmap(started)[0]).toMatchObject({
      id: "first_launch",
      menu: "deck",
      actionLabel: "카드/이슈",
    });
    expect(getAlphaRunRoadmap(resolved)[0]).toMatchObject({
      id: "first_launch",
      menu: "products",
      actionLabel: "출시 진행",
    });
  });

  it("moves the active target to annual review after first launch, card payoff, reward, and growth choice", () => {
    const grown = createRewardedGrowthState();
    const roadmap = getAlphaRunRoadmap(grown);

    expect(roadmap.slice(0, 3).every((step) => step.complete)).toBe(true);
    expect(roadmap.find((step) => step.active)?.id).toBe("annual_directive");
    expect(getActiveAlphaRunRoadmapStep(grown)).toMatchObject({
      id: "annual_directive",
      actionLabel: "심사까지 진행",
      menu: "company",
    });
    expect(getAlphaRunActionFeedback(roadmap.find((step) => step.active)!)).toBe("심사까지 진행 실행 · 다음 보상: 연간 지시 3택");
    expect(getAlphaRunRoadmapProgress(grown)).toBe(60);
  });

  it("moves the active target to the year-two product after the first annual review", () => {
    const reviewed = advanceToFirstAnnualReview(createRewardedGrowthState(), 12);
    const roadmap = getAlphaRunRoadmap(reviewed);

    expect(roadmap.find((step) => step.id === "annual_directive")).toMatchObject({
      complete: true,
    });
    expect(roadmap.find((step) => step.active)?.id).toBe("year_two_product");
    expect(getActiveAlphaRunRoadmapStep(reviewed)).toMatchObject({
      id: "year_two_product",
      actionLabel: "지시 선택",
      menu: "company",
    });
    expect(getAlphaRunRoadmapProgress(reviewed)).toBe(80);
  });

  it("retargets the year-two product roadmap control through directive, research, and product start", () => {
    const reviewed = advanceToFirstAnnualReview(createRewardedGrowthState(), 12);
    const directed = chooseAnnualDirective("trust_compound_program", reviewed);
    const enterpriseCapability = directed.annualDirective ? products.find((product) => product.id === "enterprise_workflow_agent") : undefined;
    const enterpriseResearchCapability = capabilities.find((capability) => capability.id === "enterprise");
    if (!enterpriseResearchCapability) throw new Error("Missing enterprise research capability");
    const enterpriseResearch = upgradeCapability(
      enterpriseResearchCapability,
      {
        ...directed,
        resources: { ...directed.resources, cash: 10000, data: 100, talent: 3 },
      },
    );

    expect(enterpriseCapability?.id).toBe("enterprise_workflow_agent");
    expect(getActiveAlphaRunRoadmapStep(directed)).toMatchObject({
      id: "year_two_product",
      actionLabel: "엔터프라이즈 연구",
      menu: "research",
    });
    expect(getActiveAlphaRunRoadmapStep(enterpriseResearch)).toMatchObject({
      id: "year_two_product",
      actionLabel: "에이전트 연구",
      menu: "research",
    });
  });

  it("counts the alpha run complete once the year-two enterprise product is in motion", () => {
    const reviewed = advanceToFirstAnnualReview(createRewardedGrowthState(), 12);
    const enterpriseStarted = {
      ...reviewed,
      productProjects: [
        ...reviewed.productProjects,
        {
          id: "project_enterprise_workflow_agent",
          productId: "enterprise_workflow_agent",
          assignedAgentIds: reviewed.hiredAgents.slice(0, 2).map((agent) => agent.id),
          progress: 12,
          quality: 70,
          startedMonth: reviewed.month,
          isRenewal: false,
        },
      ],
    };
    const roadmap = getAlphaRunRoadmap(enterpriseStarted);
    const completion = getAlphaRunCompletionSummary(enterpriseStarted);

    expect(roadmap.every((step) => step.complete)).toBe(true);
    expect(roadmap.find((step) => step.active)?.id).toBe("year_two_product");
    expect(getAlphaRunRoadmapProgress(enterpriseStarted)).toBe(100);
    expect(completion).toMatchObject({
      complete: true,
      title: "30분 알파런 잠금",
      nextActionId: "resolve_issue",
      nextActionLabel: "다음 개발 이슈",
      nextMenu: "deck",
      statusLabel: "개발 12% · 완성도 70",
    });
    expect(completion?.description).toContain("기업 업무 에이전트");
  });

  it("retargets the alpha run completion payoff to launch after the enterprise issue is solved", () => {
    const reviewed = advanceToFirstAnnualReview(createRewardedGrowthState(), 12);
    const enterpriseStarted = {
      ...reviewed,
      productProjects: [
        ...reviewed.productProjects,
        {
          id: "project_enterprise_workflow_agent",
          productId: "enterprise_workflow_agent",
          assignedAgentIds: reviewed.hiredAgents.slice(0, 2).map((agent) => agent.id),
          progress: 72,
          quality: 86,
          startedMonth: reviewed.month,
          isRenewal: false,
        },
      ],
      lastDevelopmentPuzzle: {
        projectId: "project_enterprise_workflow_agent",
        productId: "enterprise_workflow_agent",
        tiles: [],
        selectedTileIds: ["tile_a"],
        score: 88,
        verdict: "성공",
        progressGain: 48,
        qualityGain: 16,
        appliedModifierLabels: [],
      },
    };

    expect(getAlphaRunCompletionSummary(enterpriseStarted)).toMatchObject({
      complete: true,
      title: "30분 알파런 잠금",
      nextActionId: "launch_product",
      nextActionLabel: "출시까지 진행",
      nextMenu: "products",
      statusLabel: "개발 72% · 완성도 86",
    });
  });

  it("points the alpha run completion payoff to the second reward when the enterprise product has launched with pending reward", () => {
    const reviewed = advanceToFirstAnnualReview(createRewardedGrowthState(), 12);
    const launchedEnterprise = {
      ...reviewed,
      activeProducts: [...reviewed.activeProducts, "enterprise_workflow_agent"],
      roguelite: {
        ...reviewed.roguelite,
        pendingCardReward: {
          id: "reward_enterprise_workflow_agent",
          productId: "enterprise_workflow_agent",
          productName: "기업 업무 에이전트",
          month: reviewed.month,
          reviewGrade: "A",
          offeredCardIds: ["interoperability_shield"],
        },
      },
    };

    expect(getAlphaRunCompletionSummary(launchedEnterprise)).toMatchObject({
      complete: true,
      title: "30분 알파런 완주",
      nextActionId: "choose_reward",
      nextActionLabel: "두 번째 보상 고르기",
      nextMenu: "deck",
      statusLabel: "두 번째 출시 보상 대기",
    });
  });

  it("switches the alpha run completion payoff once the enterprise product reward has been picked", () => {
    const reviewed = advanceToFirstAnnualReview(createRewardedGrowthState(), 12);
    const launchedEnterprise = {
      ...reviewed,
      activeProducts: [...reviewed.activeProducts, "enterprise_workflow_agent"],
    };

    expect(getAlphaRunCompletionSummary(launchedEnterprise)).toMatchObject({
      complete: true,
      title: "30분 알파런 완주",
      nextActionId: "view_release",
      nextActionLabel: "디브리프 보기",
      nextMenu: "deck",
      statusLabel: "두 번째 보상 선택 완료",
    });
  });
});
