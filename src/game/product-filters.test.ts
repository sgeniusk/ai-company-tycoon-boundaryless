import { describe, expect, it } from "vitest";
import { domains, products } from "./data";
import { getProductDomainFilters, getProductsByDomainFilter } from "./product-filters";
import { createInitialState, getProductCheck } from "./simulation";

const physicalIndustryDomainIds = ["manufacturing", "logistics", "energy"] as const;

describe("v0.12.5 product domain filters", () => {
  it("creates an all filter plus one option for every product domain", () => {
    const filters = getProductDomainFilters(products, domains, createInitialState());
    const productDomainIds = new Set(products.map((product) => product.domain));

    expect(filters[0]).toMatchObject({
      id: "all",
      label: "전체",
      productCount: products.length,
      unlocked: true,
    });
    expect(filters.slice(1).map((filter) => filter.id).sort()).toEqual([...productDomainIds].sort());
    expect(filters.some((filter) => filter.id === "semiconductors" && !filter.unlocked)).toBe(true);
  });

  it("filters the product list by selected domain and falls back to all products", () => {
    const chipProducts = getProductsByDomainFilter(products, "semiconductors");

    expect(chipProducts).toHaveLength(products.filter((product) => product.domain === "semiconductors").length);
    expect(chipProducts.map((product) => product.id)).toContain("ai_training_chip");
    expect(getProductsByDomainFilter(products, "missing_domain")).toHaveLength(products.length);
    expect(getProductsByDomainFilter(products, "all")).toHaveLength(products.length);
  });

  it("surfaces exactly three v0.60 physical industry domains as locked product filters", () => {
    const initialState = createInitialState();
    const filters = getProductDomainFilters(products, domains, initialState);
    const domainIds = domains.map((domain) => domain.id);

    expect(domains).toHaveLength(15);
    expect(domainIds).toEqual(expect.arrayContaining([...physicalIndustryDomainIds]));

    for (const domainId of physicalIndustryDomainIds) {
      const domainProducts = products.filter((product) => product.domain === domainId);
      const filter = filters.find((entry) => entry.id === domainId);

      expect(domainProducts.length).toBeGreaterThanOrEqual(2);
      expect(domainProducts.length).toBeLessThanOrEqual(3);
      expect(filter).toMatchObject({
        id: domainId,
        productCount: domainProducts.length,
        unlocked: false,
      });
      expect(filter?.lockedReason).not.toBe("");
      expect(domainProducts.every((product) => !getProductCheck(product, initialState).ok)).toBe(true);
    }
  });
});
