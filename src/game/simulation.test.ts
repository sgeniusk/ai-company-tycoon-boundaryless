import { describe, expect, it } from "vitest";
import { products } from "./data";
import { advanceMonth, createInitialState, getCompanyStage, launchProduct } from "./simulation";

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
