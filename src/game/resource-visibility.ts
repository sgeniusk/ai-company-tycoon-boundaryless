import type { GameState, ProductDefinition } from "./types";

export interface AiResourceVisibilityMetrics {
  activeProductCount: number;
  activeProductNames: string[];
  monthlyComputeLoad: number;
  monthlyDataGenerated: number;
  nextLaunchComputeNeeded: number;
  nextLaunchProductName?: string;
}

export function getAiResourceVisibilityMetrics(
  state: GameState,
  productDefinitions: ProductDefinition[],
): AiResourceVisibilityMetrics {
  const activeProducts = productDefinitions.filter((product) => state.activeProducts.includes(product.id));
  const activeProductWeights = activeProducts.map((product) => ({
    product,
    userWeight: product.base_users_per_month * getProductUserMultiplier(product.id, state),
  }));
  const totalUserWeight = activeProductWeights.reduce((sum, entry) => sum + entry.userWeight, 0);
  const currentUsers = Math.max(0, state.resources.users ?? 0);
  const monthlyComputeLoad = activeProductWeights.reduce((sum, entry) => {
    const allocatedUsers = totalUserWeight > 0
      ? (currentUsers * entry.userWeight) / totalUserWeight
      : activeProductWeights.length > 0
        ? currentUsers / activeProductWeights.length
        : 0;

    return sum + entry.product.compute_per_1000_users * getProductComputeMultiplier(entry.product.id, state) * (allocatedUsers / 1000);
  }, 0);
  const monthlyDataGenerated = activeProducts.reduce(
    (sum, product) => sum + product.data_generated_per_month * getProductDataMultiplier(product.id, state),
    0,
  );
  const nextLaunchProduct = getNextLaunchProduct(state, productDefinitions);

  return {
    activeProductCount: activeProducts.length,
    activeProductNames: activeProducts.map((product) => product.name),
    monthlyComputeLoad: roundMetric(monthlyComputeLoad),
    monthlyDataGenerated: roundMetric(monthlyDataGenerated),
    nextLaunchComputeNeeded: nextLaunchProduct?.launch_cost.compute ?? 0,
    nextLaunchProductName: nextLaunchProduct?.name,
  };
}

function getNextLaunchProduct(
  state: GameState,
  productDefinitions: ProductDefinition[],
): ProductDefinition | undefined {
  const activeProject = state.productProjects[0];
  if (activeProject) {
    return productDefinitions.find((product) => product.id === activeProject.productId);
  }

  const claimedProductIds = new Set([
    ...state.activeProducts,
    ...state.productProjects.map((project) => project.productId),
  ]);

  return productDefinitions.find(
    (product) =>
      !claimedProductIds.has(product.id) &&
      state.unlockedDomains.includes(product.domain) &&
      product.trust_requirement <= (state.resources.trust ?? 0) &&
      Object.entries(product.required_capabilities).every(
        ([capabilityId, requiredLevel]) => (state.capabilities[capabilityId] ?? 0) >= requiredLevel,
      ),
  );
}

function getProductLevel(productId: string, state: GameState): number {
  return state.productLevels[productId] ?? (state.activeProducts.includes(productId) ? 1 : 0);
}

function getProductUserMultiplier(productId: string, state: GameState): number {
  return 1 + Math.max(0, getProductLevel(productId, state) - 1) * 0.25;
}

function getProductDataMultiplier(productId: string, state: GameState): number {
  return 1 + Math.max(0, getProductLevel(productId, state) - 1) * 0.2;
}

function getProductComputeMultiplier(productId: string, state: GameState): number {
  return 1 + Math.max(0, getProductLevel(productId, state) - 1) * 0.15;
}

function roundMetric(value: number): number {
  return Math.round(value * 10) / 10;
}
