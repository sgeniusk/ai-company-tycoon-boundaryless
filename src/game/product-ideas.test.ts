import { describe, expect, it } from "vitest";
import { products } from "./data";
import {
  createProductConcept,
  getProductIdeaCoverage,
  getRenewalReleaseOptions,
  productIdeaBoldOptions,
  productIdeaSubjects,
  productIdeaTypes,
} from "./product-ideas";

describe("v0.27 product idea combination database", () => {
  it("contains enough material to support thousands of product concepts", () => {
    const coverage = getProductIdeaCoverage();

    expect(coverage.subjects).toBeGreaterThanOrEqual(24);
    expect(coverage.productTypes).toBeGreaterThanOrEqual(12);
    expect(coverage.boldOptions).toBeGreaterThanOrEqual(18);
    expect(coverage.totalCombinations).toBeGreaterThanOrEqual(5000);
    expect(coverage.curatedRules).toBeGreaterThanOrEqual(30);
  });

  it("generates a playable concept for every subject, type, and bold option combination", () => {
    for (const subject of productIdeaSubjects) {
      for (const type of productIdeaTypes) {
        for (const option of productIdeaBoldOptions) {
          const concept = createProductConcept(subject.id, type.id, option.id);

          expect(concept.id).toBe(`${subject.id}_${type.id}_${option.id}`);
          expect(concept.title.length).toBeGreaterThan(3);
          expect(concept.pitch.length).toBeGreaterThan(20);
          expect(concept.score).toBeGreaterThanOrEqual(0);
          expect(concept.score).toBeLessThanOrEqual(100);
          expect(concept.prototypeCost.cash).toBeGreaterThan(0);
          expect(concept.capabilityRequirements.length).toBeGreaterThan(0);
          expect(concept.risks.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it("creates distinctive wild concepts from familiar AI-company prompts", () => {
    const vehicleConcept = createProductConcept("electric_vehicle", "vehicle", "hyper_personalized");
    const coffeeConcept = createProductConcept("coffee_chain", "franchise_system", "fully_autonomous");
    const novelConcept = createProductConcept("web_novel", "agent_studio", "generative_ip");

    expect(vehicleConcept.title).toContain("전기차");
    expect(vehicleConcept.pitch).toContain("초개인화");
    expect(vehicleConcept.noveltyTier).toMatch(/promising|wild|legendary/);
    expect(coffeeConcept.title).toContain("커피");
    expect(coffeeConcept.pitch).toContain("무인");
    expect(novelConcept.title).toContain("웹소설");
    expect(novelConcept.strengths.join(" ")).toContain("IP");
  });

  it("offers renewal release paths for existing products instead of only endless new sequels", () => {
    const writingProduct = products.find((product) => product.id === "ai_writing_assistant");
    if (!writingProduct) throw new Error("Missing writing product fixture");

    const renewalOptions = getRenewalReleaseOptions(writingProduct, 2);

    expect(renewalOptions.map((option) => option.id)).toEqual(["major_update", "renewal_launch", "spin_off"]);
    expect(renewalOptions[0].releaseName).toContain("v2");
    expect(renewalOptions[1].releaseName).toContain("리뉴얼");
    expect(renewalOptions[2].releaseName).toContain("파생");
    expect(renewalOptions.every((option) => option.effects.length > 0)).toBe(true);
  });
});
