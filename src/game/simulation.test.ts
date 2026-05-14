import { describe, expect, it } from "vitest";
import { agentTypes, automationUpgrades, events, items, products, upgrades } from "./data";
import {
  advanceMonth,
  buyAutomationUpgrade,
  buyItem,
  buyUpgrade,
  createInitialState,
  equipItem,
  getAgentHireCheck,
  getCompanyStage,
  hydrateGameState,
  hireAgent,
  launchProduct,
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
      revenue: 800,
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
