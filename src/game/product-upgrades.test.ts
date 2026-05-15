import { describe, expect, it } from "vitest";
import { products } from "./data";
import {
  advanceMonth,
  createInitialState,
  getProductLevel,
  getProductUpgradeCheck,
  launchProduct,
  upgradeProduct,
} from "./simulation";

describe("v0.11 product upgrade loop", () => {
  it("levels an active product and raises its monthly revenue output", () => {
    const writingProduct = products.find((product) => product.id === "ai_writing_assistant");
    if (!writingProduct) throw new Error("Missing product upgrade fixture");

    const launched = launchProduct(writingProduct, {
      ...createInitialState(),
      resources: {
        ...createInitialState().resources,
        cash: 20000,
        data: 200,
        compute: 200,
      },
    });
    const beforeUpgradeMonth = advanceMonth(launched);
    const upgraded = upgradeProduct(writingProduct, launched);
    const afterUpgradeMonth = advanceMonth(upgraded);

    expect(getProductLevel(writingProduct.id, upgraded)).toBe(2);
    expect(afterUpgradeMonth.lastMonthReport?.revenue).toBeGreaterThan(beforeUpgradeMonth.lastMonthReport?.revenue ?? 0);
  });

  it("blocks product upgrades for locked or maxed products", () => {
    const writingProduct = products.find((product) => product.id === "ai_writing_assistant");
    if (!writingProduct) throw new Error("Missing product upgrade fixture");

    const lockedCheck = getProductUpgradeCheck(writingProduct, createInitialState());
    const maxedCheck = getProductUpgradeCheck(writingProduct, {
      ...launchProduct(writingProduct, createInitialState()),
      productLevels: { [writingProduct.id]: writingProduct.max_level },
    });

    expect(lockedCheck.ok).toBe(false);
    expect(lockedCheck.reasons).toContain("출시한 제품만 업그레이드할 수 있습니다.");
    expect(maxedCheck.ok).toBe(false);
    expect(maxedCheck.reasons).toContain("최대 레벨입니다.");
  });
});
