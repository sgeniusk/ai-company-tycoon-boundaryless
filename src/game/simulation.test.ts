import { describe, expect, it } from "vitest";
import { agentTypes, automationUpgrades, events, items, products, upgrades } from "./data";
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
  hydrateGameState,
  hireAgent,
  launchProduct,
  resolveRivalEventChoice,
  resolveEventChoice,
  serializeGameState,
  startProductProject,
} from "./simulation";

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
});
