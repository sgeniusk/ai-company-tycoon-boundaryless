import { describe, expect, it } from "vitest";
import { agentTypes, automationUpgrades, capabilities, events, items, products, upgrades } from "./data";
import { chooseCardReward, playStrategyCard } from "./deckbuilding";
import { resolveDevelopmentPuzzle } from "./development-puzzle";
import {
  advanceMonth,
  buyAutomationUpgrade,
  buyItem,
  buyUpgrade,
  chooseGrowthPath,
  createInitialState,
  equipItem,
  getAgentHireCheck,
  getGrowthPathChoiceCheck,
  getCompanyStage,
  getMarketRankings,
  getPlayerMarketShare,
  advanceToFirstAnnualReview,
  advanceToFirstLaunch,
  getFirstDevelopmentIssueRecommendation,
  getFirstGrowthRecommendation,
  getFirstProjectRecommendation,
  getFirstRewardRecommendation,
  getYearTwoProductIssueRecommendation,
  getYearTwoProductRecommendation,
  getProductProjectCheck,
  getProductProjectForecast,
  getFirstHireRecommendation,
  getWorkforceMixSummary,
  getWorkforceSynergySummary,
  hydrateGameState,
  hireAgent,
  launchProduct,
  resolveRivalEventChoice,
  resolveEventChoice,
  serializeGameState,
  startProductProject,
  upgradeCapability,
  advanceYearTwoProductRoadmap,
} from "./simulation";
import type { GameState } from "./types";

function createReviewedFirstRunState(): GameState {
  const architect = agentTypes.find((agent) => agent.id === "prompt_architect");
  const writingProduct = products.find((product) => product.id === "ai_writing_assistant");
  if (!architect || !writingProduct) throw new Error("Missing reviewed run fixtures");

  const started = startProductProject(writingProduct, hireAgent(architect, createInitialState()));
  const issueRecommendation = getFirstDevelopmentIssueRecommendation(started);
  if (!issueRecommendation) throw new Error("Missing first issue recommendation");

  const prepared = issueRecommendation.card ? playStrategyCard(issueRecommendation.card, started) : started;
  const resolved = resolveDevelopmentPuzzle(issueRecommendation.projectId, issueRecommendation.selectedTileIds, prepared);
  const launched = advanceToFirstLaunch(resolved);
  const rewardRecommendation = getFirstRewardRecommendation(launched);
  if (!rewardRecommendation) throw new Error("Missing first reward recommendation");

  const rewarded = chooseCardReward(rewardRecommendation.card.id, launched);
  const chosen = chooseGrowthPath("productivity_line", rewarded);

  return advanceToFirstAnnualReview({
    ...chosen,
    currentEvent: undefined,
    currentRivalEvent: undefined,
    month: 10,
    annualReviewHistory: [],
    pendingAnnualDirectiveChoices: undefined,
    resources: {
      ...chosen.resources,
      cash: Math.max(chosen.resources.cash ?? 0, 14000),
      compute: Math.max(chosen.resources.compute ?? 0, 100),
      data: Math.max(chosen.resources.data ?? 0, 70),
      talent: Math.max(chosen.resources.talent ?? 0, 3),
      trust: Math.max(chosen.resources.trust ?? 0, 80),
    },
  }, 12);
}

function withYearTwoProductReadiness(state: GameState): GameState {
  const floorResources = (current: GameState): GameState => ({
    ...current,
    currentEvent: undefined,
    currentRivalEvent: undefined,
    resources: {
      ...current.resources,
      cash: Math.max(current.resources.cash ?? 0, 60000),
      compute: Math.max(current.resources.compute ?? 0, 500),
      data: Math.max(current.resources.data ?? 0, 500),
      talent: Math.max(current.resources.talent ?? 0, 8),
      trust: Math.max(current.resources.trust ?? 0, 90),
    },
  });

  const yearTwoTeamIds = ["garage_junior_dev", "prompt_architect", "data_curator", "infra_operator"];
  const staffed = yearTwoTeamIds.reduce((currentState, agentTypeId) => {
    if (currentState.hiredAgents.some((agent) => agent.typeId === agentTypeId)) return floorResources(currentState);

    const agentType = agentTypes.find((agent) => agent.id === agentTypeId);
    return agentType ? hireAgent(agentType, floorResources(currentState)) : floorResources(currentState);
  }, floorResources(state));

  return floorResources(staffed);
}

describe("simulation milestone 1 shell helpers", () => {
  it("starts as the Korean garage-stage company", () => {
    const state = createInitialState();

    expect(getCompanyStage(state).name).toBe("차고 프로토타입");
  });

  it("advances to seed startup after launching a first product and gaining users", () => {
    const writingProduct = products.find((product) => product.id === "ai_writing_assistant");
    if (!writingProduct) throw new Error("Missing AI writing assistant product");

    const launched = launchProduct(writingProduct, createInitialState());
    const nextMonth = advanceMonth(launched);

    expect(getCompanyStage(nextMonth).name).toBe("시드 스타트업");
  });

  it("records a readable monthly report after advancing the month", () => {
    const writingProduct = products.find((product) => product.id === "ai_writing_assistant");
    if (!writingProduct) throw new Error("Missing AI writing assistant product");

    const launched = launchProduct(writingProduct, createInitialState());
    const nextMonth = advanceMonth(launched);

    expect(nextMonth.lastMonthReport).toMatchObject({
      revenue: 1600,
      newUsers: expect.any(Number),
      generatedData: 5,
    });
  });
});

describe("alpha simulation loop", () => {
  it("creates a release review when a product launches", () => {
    const writingProduct = products.find((product) => product.id === "ai_writing_assistant");
    if (!writingProduct) throw new Error("Missing AI writing assistant product");

    const launched = launchProduct(writingProduct, createInitialState());

    expect(launched.productReviews[writingProduct.id]).toMatchObject({
      score: expect.any(Number),
      grade: expect.any(String),
      quote: expect.any(String),
    });
  });

  it("surfaces and resolves an eligible monthly event", () => {
    const writingProduct = products.find((product) => product.id === "ai_writing_assistant");
    if (!writingProduct) throw new Error("Missing AI writing assistant product");

    const launched = launchProduct(writingProduct, createInitialState());
    const nextMonth = advanceMonth(launched);

    expect(nextMonth.currentEvent?.id).toBe("viral_demo");

    const cautiousChoice = events
      .find((event) => event.id === "viral_demo")
      ?.choices.find((choice) => choice.id === "stay_cautious");
    if (!cautiousChoice) throw new Error("Missing viral demo cautious choice");

    const resolved = resolveEventChoice(cautiousChoice, nextMonth);

    expect(resolved.currentEvent).toBeUndefined();
    expect(resolved.resources.trust).toBeGreaterThan(nextMonth.resources.trust);
  });

  it("buys a one-time upgrade and prevents rebuying it", () => {
    const filterUpgrade = upgrades.find((upgrade) => upgrade.id === "content_filter_v1");
    if (!filterUpgrade) throw new Error("Missing content filter upgrade");

    const purchased = buyUpgrade(filterUpgrade, createInitialState());
    const purchasedAgain = buyUpgrade(filterUpgrade, purchased);

    expect(purchased.purchasedUpgrades).toContain("content_filter_v1");
    expect(purchasedAgain.resources.cash).toBe(purchased.resources.cash);
  });

  it("buys automation and stores its compounding gain", () => {
    const automation = automationUpgrades.find((upgrade) => upgrade.id === "auto_customer_support");
    if (!automation) throw new Error("Missing auto customer support automation");

    const readyState = {
      ...createInitialState(),
      month: 3,
    };

    const purchased = buyAutomationUpgrade(automation, readyState);

    expect(purchased.purchasedAutomationUpgrades).toContain("auto_customer_support");
    expect(purchased.resources.automation).toBe(10);
  });

  it("records the last capability upgrade as a readable research moment", () => {
    const enterprise = capabilities.find((capability) => capability.id === "enterprise");
    if (!enterprise) throw new Error("Missing enterprise capability");

    const researched = upgradeCapability(enterprise, createInitialState());
    const hydrated = hydrateGameState(serializeGameState(researched));

    expect(researched.lastCapabilityUpgrade).toMatchObject({
      capabilityId: "enterprise",
      capabilityName: "엔터프라이즈",
      previousLevel: 0,
      nextLevel: 1,
      unlockedDomainId: "enterprise_automation",
      unlockedDomainName: "기업 자동화",
    });
    expect(hydrated.lastCapabilityUpgrade).toEqual(researched.lastCapabilityUpgrade);
  });

  it("serializes and hydrates runtime state for alpha save/load", () => {
    const writingProduct = products.find((product) => product.id === "ai_writing_assistant");
    if (!writingProduct) throw new Error("Missing AI writing assistant product");

    const launched = launchProduct(writingProduct, createInitialState());
    const saved = serializeGameState(launched);
    const hydrated = hydrateGameState(saved);

    expect(hydrated.activeProducts).toEqual(launched.activeProducts);
    expect(hydrated.productReviews.ai_writing_assistant.grade).toBe(launched.productReviews.ai_writing_assistant.grade);
  });
});

describe("alpha production systems", () => {
  it("recommends a one-click first hire only before the first teammate joins", () => {
    const initial = createInitialState();
    const recommendation = getFirstHireRecommendation(initial);

    expect(recommendation).toMatchObject({
      channelId: "open_recruiting",
      actionLabel: "첫 팀원 바로 고용",
      title: "추천 첫 팀원",
      check: { ok: true },
    });
    expect(recommendation?.agent.id).toBe("prompt_architect");
    expect(recommendation?.offer.agent.id).toBe("prompt_architect");

    const hired = recommendation ? hireAgent(recommendation.agent, initial) : initial;

    expect(getFirstHireRecommendation(hired)).toBeUndefined();
  });

  it("recommends a one-click first product project after the first teammate joins", () => {
    const architect = agentTypes.find((agent) => agent.id === "prompt_architect");
    if (!architect) throw new Error("Missing prompt architect");

    const staffed = hireAgent(architect, createInitialState());
    const recommendation = getFirstProjectRecommendation(staffed);

    expect(recommendation).toMatchObject({
      actionLabel: "첫 제품 바로 개발",
      title: "추천 첫 제품",
      product: { id: "ai_writing_assistant" },
      assignedAgentIds: [staffed.hiredAgents[0].id],
      check: { ok: true },
    });
    expect(recommendation?.forecast.estimatedMonths).toBeGreaterThan(0);

    const started = recommendation
      ? startProductProject(recommendation.product, staffed, recommendation.assignedAgentIds)
      : staffed;

    expect(started.productProjects[0]).toMatchObject({
      productId: "ai_writing_assistant",
      assignedAgentIds: [staffed.hiredAgents[0].id],
    });
    expect(getFirstProjectRecommendation(started)).toBeUndefined();
  });

  it("recommends a one-click first card and development issue after the first project starts", () => {
    const architect = agentTypes.find((agent) => agent.id === "prompt_architect");
    const writingProduct = products.find((product) => product.id === "ai_writing_assistant");
    if (!architect || !writingProduct) throw new Error("Missing first issue fixtures");

    const started = startProductProject(writingProduct, hireAgent(architect, createInitialState()));
    const recommendation = getFirstDevelopmentIssueRecommendation(started);

    expect(recommendation).toMatchObject({
      actionLabel: "첫 이슈 바로 해결",
      title: "추천 첫 개발 이슈",
      product: { id: "ai_writing_assistant" },
      projectId: started.productProjects[0].id,
      card: { id: "customer_interviews" },
      check: { ok: true },
    });
    expect(recommendation?.selectedTileIds).toHaveLength(4);
    expect(recommendation?.tiles.map((tile) => tile.label)).toContain("UX 빈틈");

    const prepared = recommendation?.card ? playStrategyCard(recommendation.card, started) : started;
    const resolved = recommendation
      ? resolveDevelopmentPuzzle(recommendation.projectId, recommendation.selectedTileIds, prepared)
      : started;

    expect(resolved.lastDevelopmentPuzzle?.appliedModifierLabels).toContain("고객 인터뷰");
    expect(getFirstDevelopmentIssueRecommendation(resolved)).toBeUndefined();
  });

  it("advances a solved first project directly to the first launch milestone", () => {
    const architect = agentTypes.find((agent) => agent.id === "prompt_architect");
    const writingProduct = products.find((product) => product.id === "ai_writing_assistant");
    if (!architect || !writingProduct) throw new Error("Missing first launch fixtures");

    const started = startProductProject(writingProduct, hireAgent(architect, createInitialState()));
    const recommendation = getFirstDevelopmentIssueRecommendation(started);
    if (!recommendation) throw new Error("Missing first issue recommendation");

    const prepared = recommendation.card ? playStrategyCard(recommendation.card, started) : started;
    const resolved = resolveDevelopmentPuzzle(recommendation.projectId, recommendation.selectedTileIds, prepared);
    const launched = advanceToFirstLaunch(resolved);

    expect(launched.month).toBeGreaterThan(resolved.month);
    expect(launched.activeProducts).toContain("ai_writing_assistant");
    expect(launched.productProjects.some((project) => project.productId === "ai_writing_assistant")).toBe(false);
    expect(launched.lastRelease?.productId).toBe("ai_writing_assistant");
  });

  it("recommends the first post-launch card reward and clears after choosing it", () => {
    const architect = agentTypes.find((agent) => agent.id === "prompt_architect");
    const writingProduct = products.find((product) => product.id === "ai_writing_assistant");
    if (!architect || !writingProduct) throw new Error("Missing first reward fixtures");

    const started = startProductProject(writingProduct, hireAgent(architect, createInitialState()));
    const issueRecommendation = getFirstDevelopmentIssueRecommendation(started);
    if (!issueRecommendation) throw new Error("Missing first issue recommendation");

    const prepared = issueRecommendation.card ? playStrategyCard(issueRecommendation.card, started) : started;
    const resolved = resolveDevelopmentPuzzle(issueRecommendation.projectId, issueRecommendation.selectedTileIds, prepared);
    const launched = advanceToFirstLaunch(resolved);
    const rewardRecommendation = getFirstRewardRecommendation(launched);

    expect(rewardRecommendation).toMatchObject({
      actionLabel: "첫 보상 바로 선택",
      title: "추천 첫 보상",
      productName: "AI 글쓰기 비서",
      check: { ok: true },
    });
    expect(rewardRecommendation?.card.id).toBe(launched.roguelite.pendingCardReward?.offeredCardIds[0]);

    const rewarded = rewardRecommendation ? chooseCardReward(rewardRecommendation.card.id, launched) : launched;

    expect(rewarded.roguelite.pendingCardReward).toBeUndefined();
    expect(rewarded.roguelite.rewardHistory).toHaveLength(1);
    expect(getFirstRewardRecommendation(rewarded)).toBeUndefined();
  });

  it("recommends the first growth branch after the first reward is chosen", () => {
    const architect = agentTypes.find((agent) => agent.id === "prompt_architect");
    const writingProduct = products.find((product) => product.id === "ai_writing_assistant");
    if (!architect || !writingProduct) throw new Error("Missing first growth fixtures");

    const started = startProductProject(writingProduct, hireAgent(architect, createInitialState()));
    const issueRecommendation = getFirstDevelopmentIssueRecommendation(started);
    if (!issueRecommendation) throw new Error("Missing first issue recommendation");

    const prepared = issueRecommendation.card ? playStrategyCard(issueRecommendation.card, started) : started;
    const resolved = resolveDevelopmentPuzzle(issueRecommendation.projectId, issueRecommendation.selectedTileIds, prepared);
    const launched = advanceToFirstLaunch(resolved);
    const rewardRecommendation = getFirstRewardRecommendation(launched);
    if (!rewardRecommendation) throw new Error("Missing first reward recommendation");

    const rewarded = chooseCardReward(rewardRecommendation.card.id, launched);
    const growthRecommendation = getFirstGrowthRecommendation(rewarded);

    expect(growthRecommendation).toMatchObject({
      actionLabel: "성장 분기 바로 선택",
      title: "추천 성장 분기",
      path: {
        id: "productivity_line",
        title: "생산성 제품 라인 확장",
      },
      check: { ok: true },
    });

    const chosen = growthRecommendation ? chooseGrowthPath(growthRecommendation.path.id, rewarded) : rewarded;

    expect(chosen.chosenGrowthPath?.id).toBe("productivity_line");
    expect(getFirstGrowthRecommendation(chosen)).toBeUndefined();
  });

  it("advances a post-growth first run directly to the year-one annual review", () => {
    const architect = agentTypes.find((agent) => agent.id === "prompt_architect");
    const writingProduct = products.find((product) => product.id === "ai_writing_assistant");
    if (!architect || !writingProduct) throw new Error("Missing annual review fast-forward fixtures");

    const started = startProductProject(writingProduct, hireAgent(architect, createInitialState()));
    const issueRecommendation = getFirstDevelopmentIssueRecommendation(started);
    if (!issueRecommendation) throw new Error("Missing first issue recommendation");

    const prepared = issueRecommendation.card ? playStrategyCard(issueRecommendation.card, started) : started;
    const resolved = resolveDevelopmentPuzzle(issueRecommendation.projectId, issueRecommendation.selectedTileIds, prepared);
    const launched = advanceToFirstLaunch(resolved);
    const rewardRecommendation = getFirstRewardRecommendation(launched);
    if (!rewardRecommendation) throw new Error("Missing first reward recommendation");

    const rewarded = chooseCardReward(rewardRecommendation.card.id, launched);
    const chosen = chooseGrowthPath("productivity_line", rewarded);
    const reviewRunwayState = {
      ...chosen,
      currentEvent: undefined,
      currentRivalEvent: undefined,
      month: 10,
      annualReviewHistory: [],
      pendingAnnualDirectiveChoices: undefined,
      resources: { ...chosen.resources, cash: 12000, compute: 80, data: 50 },
    };
    const reviewed = advanceToFirstAnnualReview(reviewRunwayState);

    expect(reviewed.month).toBe(12);
    expect(reviewed.annualReviewHistory[0]).toMatchObject({
      year: 1,
      month: 12,
      reviewId: "year_1_local_demo_day",
    });
    expect(reviewed.pendingAnnualDirectiveChoices?.offeredDirectiveIds.length).toBeGreaterThan(0);
  });

  it("recommends the enterprise trust directive before year-two product research", () => {
    const reviewed = createReviewedFirstRunState();
    const recommendation = getYearTwoProductRecommendation(reviewed);

    expect(recommendation).toMatchObject({
      action: "choose_directive",
      actionLabel: "지시 선택",
      directiveChoiceId: "trust_compound_program",
      menu: "company",
      product: { id: "enterprise_workflow_agent" },
      check: { ok: true },
    });

    const directed = advanceYearTwoProductRoadmap(reviewed, 1);
    const researchRecommendation = getYearTwoProductRecommendation(directed);

    expect(directed.annualDirective?.title).toBe("신뢰 복리 프로그램");
    expect(directed.pendingAnnualDirectiveChoices).toBeUndefined();
    expect(researchRecommendation).toMatchObject({
      action: "upgrade_research",
      actionLabel: "엔터프라이즈 연구",
      capability: { id: "enterprise" },
      menu: "research",
    });
  });

  it("carries a funded year-two run through research into the enterprise product project", () => {
    const ready = withYearTwoProductReadiness(createReviewedFirstRunState());
    const advanced = advanceYearTwoProductRoadmap(ready);

    expect(advanced.annualDirective?.title).toBe("신뢰 복리 프로그램");
    expect(advanced.capabilities.enterprise).toBeGreaterThanOrEqual(1);
    expect(advanced.capabilities.agent).toBeGreaterThanOrEqual(2);
    expect(advanced.productProjects.some((project) => project.productId === "enterprise_workflow_agent")).toBe(true);
    expect(getYearTwoProductRecommendation(advanced)).toBeUndefined();
  });

  it("recommends and resolves the year-two product issue even after the first launch puzzle", () => {
    const ready = withYearTwoProductReadiness(createReviewedFirstRunState());
    const advanced = advanceYearTwoProductRoadmap(ready);
    const recommendation = getYearTwoProductIssueRecommendation(advanced);

    expect(advanced.lastDevelopmentPuzzle?.projectId).not.toBe(recommendation?.projectId);
    expect(recommendation).toMatchObject({
      actionLabel: "신제품 이슈 바로 해결",
      product: { id: "enterprise_workflow_agent" },
      check: { ok: true },
    });

    const prepared = recommendation?.card ? playStrategyCard(recommendation.card, advanced) : advanced;
    const resolved = recommendation
      ? resolveDevelopmentPuzzle(recommendation.projectId, recommendation.selectedTileIds, prepared)
      : advanced;

    expect(resolved.lastDevelopmentPuzzle?.projectId).toBe(recommendation?.projectId);
    expect(getYearTwoProductIssueRecommendation(resolved)).toBeUndefined();
  });

  it("hires an agent using data-driven cost and raises team talent", () => {
    const architect = agentTypes.find((agent) => agent.id === "prompt_architect");
    if (!architect) throw new Error("Missing prompt architect");

    const initial = createInitialState();
    expect(getAgentHireCheck(architect, initial).ok).toBe(true);

    const hired = hireAgent(architect, initial);

    expect(hired.hiredAgents).toHaveLength(1);
    expect(hired.hiredAgents[0]).toMatchObject({ typeId: "prompt_architect", level: 1, energy: 100 });
    expect(hired.resources.cash).toBe(initial.resources.cash - architect.hire_cost.cash);
    expect(hired.resources.talent).toBe(initial.resources.talent + 1);
  });

  it("buys an agent item and equips it to boost effective project work", () => {
    const architect = agentTypes.find((agent) => agent.id === "prompt_architect");
    const notebook = items.find((item) => item.id === "prompt_notebook");
    if (!architect || !notebook) throw new Error("Missing test agent or item");

    const hired = hireAgent(architect, createInitialState());
    const purchased = buyItem(notebook, hired);
    const equipped = equipItem(purchased.hiredAgents[0].id, notebook, purchased);

    expect(equipped.ownedItems).toContain("prompt_notebook");
    expect(equipped.hiredAgents[0].equippedItemIds).toContain("prompt_notebook");
  });

  it("runs a product project across months and releases it with a review", () => {
    const architect = agentTypes.find((agent) => agent.id === "prompt_architect");
    const coder = agentTypes.find((agent) => agent.id === "data_curator");
    const writingProduct = products.find((product) => product.id === "ai_writing_assistant");
    if (!architect || !coder || !writingProduct) throw new Error("Missing project fixture");

    const staffed = hireAgent(coder, hireAgent(architect, createInitialState()));
    const started = startProductProject(writingProduct, staffed);

    expect(started.productProjects).toHaveLength(1);
    expect(started.activeProducts).not.toContain("ai_writing_assistant");

    const afterFirstMonth = advanceMonth(started);
    const afterSecondMonth = advanceMonth(afterFirstMonth);
    const released = advanceMonth(afterSecondMonth);

    expect(released.productProjects).toHaveLength(0);
    expect(released.activeProducts).toContain("ai_writing_assistant");
    expect(released.productReviews.ai_writing_assistant.grade).toEqual(expect.any(String));
  });

  it("starts product projects with the explicitly selected agents only", () => {
    const architect = agentTypes.find((agent) => agent.id === "prompt_architect");
    const curator = agentTypes.find((agent) => agent.id === "data_curator");
    const writingProduct = products.find((product) => product.id === "ai_writing_assistant");
    if (!architect || !curator || !writingProduct) throw new Error("Missing assignment fixture");

    const staffed = hireAgent(curator, hireAgent(architect, createInitialState()));
    const selectedCuratorId = staffed.hiredAgents.find((agent) => agent.typeId === "data_curator")?.id;
    if (!selectedCuratorId) throw new Error("Missing selected curator");

    const emptyCheck = getProductProjectCheck(writingProduct, staffed, []);
    const started = startProductProject(writingProduct, staffed, [selectedCuratorId]);

    expect(emptyCheck.ok).toBe(false);
    expect(emptyCheck.reasons).toContain("투입할 에이전트를 1명 이상 선택해야 합니다.");
    expect(started.productProjects[0].assignedAgentIds).toEqual([selectedCuratorId]);
    expect(started.hiredAgents.find((agent) => agent.typeId === "prompt_architect")?.assignment).toBeUndefined();
    expect(started.hiredAgents.find((agent) => agent.typeId === "data_curator")?.assignment).toBe(started.productProjects[0].id);
  });

  it("summarizes workforce kind synergies and applies them to project forecasts", () => {
    const human = agentTypes.find((agent) => agent.id === "garage_pm_intern");
    const ai = agentTypes.find((agent) => agent.id === "data_curator");
    const robot = agentTypes.find((agent) => agent.id === "factory_robot_unit");
    const writingProduct = products.find((product) => product.id === "ai_writing_assistant");
    if (!human || !ai || !robot || !writingProduct) throw new Error("Missing workforce synergy fixtures");

    const roboticsReady = {
      ...createInitialState(),
      resources: {
        ...createInitialState().resources,
        cash: 100000,
        compute: 1000,
        data: 1000,
      },
      capabilities: {
        ...createInitialState().capabilities,
        robotics: 1,
      },
    };
    const humanAi = hireAgent(ai, hireAgent(human, roboticsReady));
    const fullCell = hireAgent(robot, humanAi);
    const summary = getWorkforceSynergySummary(fullCell);

    expect(summary.active.map((synergy) => synergy.id)).toEqual(
      expect.arrayContaining(["human_ai_supervision", "human_robot_floor", "ai_robot_pipeline", "full_stack_company_cell"]),
    );
    expect(summary.projectQualityBonus).toBeGreaterThan(0);
    expect(summary.projectProgressBonus).toBeGreaterThan(0);

    const humanAiForecast = getProductProjectForecast(writingProduct, humanAi, humanAi.hiredAgents.map((agent) => agent.id));
    const fullCellForecast = getProductProjectForecast(writingProduct, fullCell, fullCell.hiredAgents.map((agent) => agent.id));

    expect(fullCellForecast.monthlyProgressGain).toBeGreaterThan(humanAiForecast.monthlyProgressGain);
    expect(fullCellForecast.expectedQuality).toBeGreaterThan(humanAiForecast.expectedQuality);
  });

  it("summarizes the human, AI, and robot workforce mix for first blind-test readability", () => {
    const human = agentTypes.find((agent) => agent.id === "garage_junior_dev");
    const ai = agentTypes.find((agent) => agent.id === "prompt_architect");
    const robot = agentTypes.find((agent) => agent.id === "factory_robot_unit");
    if (!human || !ai || !robot) throw new Error("Missing workforce mix fixtures");

    const initial = getWorkforceMixSummary(createInitialState());

    expect(initial.headline).toBe("사람 0 · AI 0/3 · 로봇 0");
    expect(initial.rows.map((row) => row.kind)).toEqual(["human", "ai_agent", "robot"]);
    expect(initial.rows.find((row) => row.kind === "robot")).toMatchObject({
      count: 0,
      statusLabel: "로보틱스 Lv.1 필요",
      emphasis: "locked",
    });

    const roboticsReady = {
      ...createInitialState(),
      resources: { ...createInitialState().resources, cash: 100000, compute: 1000 },
      capabilities: { ...createInitialState().capabilities, robotics: 1 },
    };
    const mixed = hireAgent(robot, hireAgent(ai, hireAgent(human, roboticsReady)));
    const summary = getWorkforceMixSummary(mixed);

    expect(summary.headline).toBe("사람 1 · AI 1/5 · 로봇 1");
    expect(summary.rows.find((row) => row.kind === "human")?.impactLabel).toContain("AI 운용 한도 +2");
    expect(summary.rows.find((row) => row.kind === "human")).toMatchObject({
      roleBadge: "감독",
      metricLabel: "한도 +2",
    });
    expect(summary.rows.find((row) => row.kind === "ai_agent")?.impactLabel).toContain("AI 운용 1/5");
    expect(summary.rows.find((row) => row.kind === "ai_agent")).toMatchObject({
      roleBadge: "자동화",
      metricLabel: "운용 1/5",
    });
    expect(summary.rows.find((row) => row.kind === "robot")?.impactLabel).toContain("하드웨어");
    expect(summary.rows.find((row) => row.kind === "robot")).toMatchObject({
      roleBadge: "현장",
      metricLabel: "완성도 보정",
    });
    expect(summary.activeSynergyLabels).toEqual(
      expect.arrayContaining(["사람-AI 감독 루프", "사람-로봇 현장 운영", "AI-로봇 자동화 파이프라인", "풀스택 회사 셀"]),
    );
  });

  it("keeps project duration stable while team composition changes launch quality", () => {
    const architect = agentTypes.find((agent) => agent.id === "prompt_architect");
    const infra = agentTypes.find((agent) => agent.id === "infra_operator");
    const writingProduct = products.find((product) => product.id === "ai_writing_assistant");
    if (!architect || !infra || !writingProduct) throw new Error("Missing quality fixture");

    const productLed = startProductProject(writingProduct, hireAgent(architect, createInitialState()));
    const opsLed = startProductProject(writingProduct, hireAgent(infra, createInitialState()));
    const productLedAfterMonth = advanceMonth(productLed);
    const opsLedAfterMonth = advanceMonth(opsLed);

    expect(productLedAfterMonth.productProjects[0].progress).toBe(opsLedAfterMonth.productProjects[0].progress);

    const productLedRelease = advanceMonth(productLedAfterMonth);
    const opsLedRelease = advanceMonth(opsLedAfterMonth);

    expect(productLedRelease.activeProducts).toContain("ai_writing_assistant");
    expect(opsLedRelease.activeProducts).toContain("ai_writing_assistant");
    expect(productLedRelease.productReviews.ai_writing_assistant.score).toBeGreaterThan(
      opsLedRelease.productReviews.ai_writing_assistant.score + 10,
    );
  });

  it("weights final release review heavily toward project completeness", () => {
    const architect = agentTypes.find((agent) => agent.id === "prompt_architect");
    const writingProduct = products.find((product) => product.id === "ai_writing_assistant");
    if (!architect || !writingProduct) throw new Error("Missing completeness fixture");

    const baseProject = startProductProject(writingProduct, hireAgent(architect, createInitialState()));
    const lowQuality = {
      ...baseProject,
      productProjects: baseProject.productProjects.map((project) => ({ ...project, progress: 99, quality: 35 })),
    };
    const highQuality = {
      ...baseProject,
      productProjects: baseProject.productProjects.map((project) => ({ ...project, progress: 99, quality: 95 })),
    };

    const lowRelease = advanceMonth(lowQuality);
    const highRelease = advanceMonth(highQuality);

    expect(highRelease.productReviews.ai_writing_assistant.score).toBeGreaterThan(
      lowRelease.productReviews.ai_writing_assistant.score + 30,
    );
  });

  it("stores the latest release moment for the reward spotlight", () => {
    const architect = agentTypes.find((agent) => agent.id === "prompt_architect");
    const writingProduct = products.find((product) => product.id === "ai_writing_assistant");
    if (!architect || !writingProduct) throw new Error("Missing release spotlight fixture");

    const started = startProductProject(writingProduct, hireAgent(architect, createInitialState()));
    const released = advanceMonth(advanceMonth(started));
    const hydrated = hydrateGameState(serializeGameState(released));

    expect(released.lastRelease).toMatchObject({
      productId: "ai_writing_assistant",
      productName: writingProduct.name,
      month: released.month,
      review: {
        grade: released.productReviews.ai_writing_assistant.grade,
        score: released.productReviews.ai_writing_assistant.score,
      },
      headline: expect.stringContaining("AI 글쓰기 비서"),
      marketReaction: expect.stringContaining("이용자"),
      expansionHint: expect.stringContaining("회의"),
    });
    expect(released.lastRelease?.growthPaths).toHaveLength(3);
    expect(released.lastRelease?.growthPaths.map((path) => path.id)).toEqual([
      "productivity_line",
      "trust_enterprise",
      "code_vision_lab",
    ]);
    expect(released.lastRelease?.growthPaths[0]).toMatchObject({
      title: "생산성 제품 라인 확장",
      targetMenu: "products",
      actionLabel: "제품 라인 보기",
    });
    expect(hydrated.lastRelease).toEqual(released.lastRelease);

    const releaseMoment = released.lastRelease;
    if (!releaseMoment) throw new Error("Missing release moment");

    const { growthPaths: _growthPaths, ...legacyLastRelease } = releaseMoment;
    const legacyHydrated = hydrateGameState(
      JSON.stringify({
        version: 1,
        state: {
          ...released,
          lastRelease: legacyLastRelease,
        },
      }),
    );

    expect(legacyHydrated.lastRelease?.growthPaths).toHaveLength(3);
  });

  it("commits to one post-release growth path and persists the identity", () => {
    const architect = agentTypes.find((agent) => agent.id === "prompt_architect");
    const writingProduct = products.find((product) => product.id === "ai_writing_assistant");
    if (!architect || !writingProduct) throw new Error("Missing growth path fixture");

    const started = startProductProject(writingProduct, hireAgent(architect, createInitialState()));
    const released = advanceMonth(advanceMonth(started));

    expect(getGrowthPathChoiceCheck("trust_enterprise", released).ok).toBe(true);

    const chosen = chooseGrowthPath("trust_enterprise", released);
    const chosenAgain = chooseGrowthPath("code_vision_lab", chosen);
    const hydrated = hydrateGameState(serializeGameState(chosen));

    expect(chosen.chosenGrowthPath).toMatchObject({
      id: "trust_enterprise",
      title: "신뢰 기반 엔터프라이즈",
      month: chosen.month,
    });
    expect(chosen.resources.trust).toBeGreaterThan(released.resources.trust);
    expect(chosen.timeline[0]).toContain("성장 경로 선택");
    expect(chosenAgain.chosenGrowthPath?.id).toBe("trust_enterprise");
    expect(chosenAgain.resources).toEqual(chosen.resources);
    expect(hydrated.chosenGrowthPath).toEqual(chosen.chosenGrowthPath);
  });

  it("blocks growth path commitment before a first release", () => {
    const check = getGrowthPathChoiceCheck("productivity_line", createInitialState());
    const attempted = chooseGrowthPath("productivity_line", createInitialState());

    expect(check.ok).toBe(false);
    expect(check.reasons).toContain("첫 제품 출시 후 선택할 수 있습니다.");
    expect(attempted.chosenGrowthPath).toBeUndefined();
  });

  it("keeps the starter product revenue high enough for early runway", () => {
    const writingProduct = products.find((product) => product.id === "ai_writing_assistant");
    if (!writingProduct) throw new Error("Missing starter fixture");

    expect(writingProduct.base_revenue).toBeGreaterThanOrEqual(1400);
  });

  it("lets the starter product release within two months with a suitable first agent", () => {
    const architect = agentTypes.find((agent) => agent.id === "prompt_architect");
    const writingProduct = products.find((product) => product.id === "ai_writing_assistant");
    if (!architect || !writingProduct) throw new Error("Missing starter fixture");

    const started = startProductProject(writingProduct, hireAgent(architect, createInitialState()));
    const afterTwoMonths = advanceMonth(advanceMonth(started));

    expect(afterTwoMonths.activeProducts).toContain("ai_writing_assistant");
    expect(afterTwoMonths.resources.cash).toBeGreaterThanOrEqual(0);
  });

  it("hydrates hired agents, owned items, and active projects from alpha saves", () => {
    const architect = agentTypes.find((agent) => agent.id === "prompt_architect");
    const writingProduct = products.find((product) => product.id === "ai_writing_assistant");
    if (!architect || !writingProduct) throw new Error("Missing save fixture");

    const started = startProductProject(writingProduct, hireAgent(architect, createInitialState()));
    const hydrated = hydrateGameState(serializeGameState(started));

    expect(hydrated.hiredAgents).toHaveLength(1);
    expect(hydrated.productProjects).toHaveLength(1);
    expect(hydrated.ownedItems).toEqual([]);
  });

  it("supports a 10-month prototype run without corrupting core state", () => {
    const architect = agentTypes.find((agent) => agent.id === "prompt_architect");
    const writingProduct = products.find((product) => product.id === "ai_writing_assistant");
    if (!architect || !writingProduct) throw new Error("Missing 10-month fixture");

    let state = startProductProject(writingProduct, hireAgent(architect, createInitialState()));
    for (let month = 0; month < 10; month += 1) {
      state = advanceMonth(state);
    }

    expect(state.month).toBe(11);
    expect(state.activeProducts).toContain("ai_writing_assistant");
    expect(Number.isFinite(state.resources.cash)).toBe(true);
    expect(state.status).not.toBe("failure");
  });
});

describe("v0.5-v0.8 competitive market systems", () => {
  it("starts with rival companies and a player market ranking", () => {
    const state = createInitialState();
    const rankings = getMarketRankings(state);

    expect(state.competitorStates.length).toBeGreaterThanOrEqual(5);
    expect(rankings[0].marketShare).toBeGreaterThan(0);
    expect(rankings.some((ranking) => ranking.id === "player")).toBe(true);
  });

  it("advances rival scores and recalculates player market share each month", () => {
    const initial = createInitialState();
    const nextMonth = advanceMonth(initial);

    expect(nextMonth.competitorStates[0].score).toBeGreaterThan(initial.competitorStates[0].score);
    expect(getPlayerMarketShare(nextMonth)).toBeGreaterThanOrEqual(0);
    expect(getPlayerMarketShare(nextMonth)).toBeLessThanOrEqual(100);
  });

  it("foreshadows rival claims through the first three months without taking spaces", () => {
    let state = createInitialState();
    while (state.month < 3) {
      state = advanceMonth(state);
    }

    expect(state.month).toBe(3);
    expect(state.competitorStates.every((competitor) => competitor.claimedProducts.length === 0)).toBe(true);
    expect(state.competitorStates.some((competitor) => competitor.lastMove.includes("준비"))).toBe(true);
    expect(state.timeline.some((entry) => entry.includes("경쟁사") && entry.includes("예고"))).toBe(true);
  });

  it("lets rivals claim product spaces after the opening learning window", () => {
    let state = createInitialState();
    while (state.month < 4) {
      state = advanceMonth(state);
    }

    expect(state.competitorStates.some((competitor) => competitor.claimedProducts.length > 0)).toBe(true);
    expect(state.timeline.some((entry) => entry.includes("경쟁사"))).toBe(true);
  });

  it("surfaces and resolves rival events with competitor effects", () => {
    let state = createInitialState();
    for (let month = 0; month < 4; month += 1) {
      state = advanceMonth(state);
    }

    expect(state.currentRivalEvent?.id).toBe("talent_poach");

    const choice = state.currentRivalEvent?.choices.find((entry) => entry.id === "counter_offer");
    if (!choice) throw new Error("Missing rival event choice");

    const resolved = resolveRivalEventChoice(choice, state);

    expect(resolved.currentRivalEvent).toBeUndefined();
    expect(resolved.rivalEventHistory).toContain("talent_poach");
    expect(resolved.competitorStates.some((competitor) => competitor.momentum < 0)).toBe(true);
  });

  it("saves and loads competitor state and rival event history", () => {
    let state = createInitialState();
    for (let month = 0; month < 4; month += 1) {
      state = advanceMonth(state);
    }

    const hydrated = hydrateGameState(serializeGameState(state));

    expect(hydrated.competitorStates).toEqual(state.competitorStates);
    expect(hydrated.currentRivalEvent?.id).toBe(state.currentRivalEvent?.id);
  });

  it("applies unresolved season challenge pressure during monthly advancement", () => {
    let state = createInitialState();
    while (state.month < 12) {
      state = advanceMonth(state);
    }

    const pressureTargetId = state.competitorStates[0].id;
    const beforeMomentum = state.competitorStates.find((competitor) => competitor.id === pressureTargetId)?.momentum ?? 0;
    const advanced = advanceMonth(state);
    const afterMomentum = advanced.competitorStates.find((competitor) => competitor.id === pressureTargetId)?.momentum ?? 0;

    expect(afterMomentum).toBeGreaterThan(beforeMomentum * 0.65);
    expect(advanced.timeline.some((entry) => entry.includes("시즌 압박"))).toBe(true);
  });
});
