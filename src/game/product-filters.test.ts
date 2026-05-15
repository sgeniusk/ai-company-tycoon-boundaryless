import { describe, expect, it } from "vitest";
import { domains, products } from "./data";
import { getProductDomainFilters, getProductsByDomainFilter } from "./product-filters";
import { createInitialState } from "./simulation";

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

    expect(chipProducts).toHaveLength(1);
    expect(chipProducts[0].id).toBe("ai_training_chip");
    expect(getProductsByDomainFilter(products, "missing_domain")).toHaveLength(products.length);
    expect(getProductsByDomainFilter(products, "all")).toHaveLength(products.length);
  });
});
