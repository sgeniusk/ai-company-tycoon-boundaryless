import { describe, expect, it } from "vitest";
import { automationUpgrades, events, products, upgrades } from "./data";
import {
  advanceMonth,
  buyAutomationUpgrade,
  buyUpgrade,
  createInitialState,
  getCompanyStage,
  hydrateGameState,
  launchProduct,
  resolveEventChoice,
  serializeGameState,
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
