import { describe, expect, it } from "vitest";
import { agentTypes, products } from "./data";
import { createProductConcept } from "./product-ideas";
import {
  advanceMonth,
  createInitialState,
  getAvailableProductDefinitions,
  getProductLevel,
  hydrateGameState,
  hireAgent,
  launchProduct,
  serializeGameState,
  startProductConceptProject,
  startProductRenewalProject,
} from "./simulation";

function fundedState() {
  const initialState = createInitialState();

  return {
    ...initialState,
    resources: {
      ...initialState.resources,
      cash: 120000,
      compute: 1200,
      data: 1200,
      trust: 90,
    },
    capabilities: Object.fromEntries(
      Object.keys(initialState.capabilities).map((capabilityId) => [capabilityId, 4]),
    ),
    unlockedDomains: [
      ...new Set([
        ...initialState.unlockedDomains,
        "creator_tools",
        "developer_tools",
        "customer_support",
        "education",
        "enterprise_automation",
        "semiconductors",
        "mobility",
        "robotics",
        "odd_industries",
        "toys",
      ]),
    ],
  };
}

function advanceUntilProjectsComplete(state: ReturnType<typeof createInitialState>, maxMonths = 6) {
  let current = state;

  for (let month = 0; month < maxMonths && current.productProjects.length > 0; month += 1) {
    current = advanceMonth(current);
  }

  return current;
}

describe("v0.28 product concept and renewal projects", () => {
  it("turns a composed product idea into a real project and released product", () => {
    const architect = agentTypes.find((agent) => agent.id === "prompt_architect");
    if (!architect) throw new Error("Missing concept project fixture");

    const concept = createProductConcept("electric_vehicle", "vehicle", "hyper_personalized");
    const staffed = hireAgent(architect, fundedState());
    const started = startProductConceptProject(concept, staffed, [staffed.hiredAgents[0].id]);
    const generatedProduct = started.generatedProducts[0];

    expect(generatedProduct.name).toBe(concept.title);
    expect(started.productProjects[0].productId).toBe(generatedProduct.id);
    expect(getAvailableProductDefinitions(started).some((product) => product.id === generatedProduct.id)).toBe(true);
    expect(started.activeProducts).not.toContain(generatedProduct.id);

    const released = advanceUntilProjectsComplete(started);

    expect(released.productProjects).toHaveLength(0);
    expect(released.activeProducts).toContain(generatedProduct.id);
    expect(released.lastRelease?.productName).toBe(concept.title);
    expect(released.productReviews[generatedProduct.id]).toBeDefined();
  });

  it("preserves generated concept products through save hydration", () => {
    const architect = agentTypes.find((agent) => agent.id === "prompt_architect");
    if (!architect) throw new Error("Missing concept save fixture");

    const concept = createProductConcept("coffee_chain", "franchise_system", "weird_crossover");
    const staffed = hireAgent(architect, fundedState());
    const released = advanceUntilProjectsComplete(
      startProductConceptProject(concept, staffed, [staffed.hiredAgents[0].id]),
    );
    const generatedProduct = released.generatedProducts[0];
    const hydrated = hydrateGameState(serializeGameState(released));

    expect(hydrated.generatedProducts[0]?.id).toBe(generatedProduct.id);
    expect(hydrated.activeProducts).toContain(generatedProduct.id);
    expect(getAvailableProductDefinitions(hydrated).some((product) => product.id === generatedProduct.id)).toBe(true);
    expect(hydrated.roguelite.pendingCardReward?.productId).toBe(generatedProduct.id);
  });

  it("ships an existing product renewal through development instead of an instant upgrade", () => {
    const architect = agentTypes.find((agent) => agent.id === "prompt_architect");
    const writingProduct = products.find((product) => product.id === "ai_writing_assistant");
    if (!architect || !writingProduct) throw new Error("Missing renewal project fixture");

    const launched = launchProduct(writingProduct, fundedState());
    const staffed = hireAgent(architect, launched);
    const started = startProductRenewalProject(writingProduct, "major_update", staffed, [staffed.hiredAgents[0].id]);

    expect(started.productProjects[0]).toMatchObject({
      productId: writingProduct.id,
      kind: "renewal",
      renewalOptionId: "major_update",
      releaseName: "AI 글쓰기 비서 v2",
    });
    expect(getProductLevel(writingProduct.id, started)).toBe(1);

    const released = advanceUntilProjectsComplete(started);

    expect(released.productProjects).toHaveLength(0);
    expect(released.activeProducts.filter((productId) => productId === writingProduct.id)).toHaveLength(1);
    expect(getProductLevel(writingProduct.id, released)).toBe(2);
    expect(released.lastRelease?.productName).toBe("AI 글쓰기 비서 v2");
    expect(released.timeline.join(" ")).toContain("리뉴얼 출시");
  });
});
