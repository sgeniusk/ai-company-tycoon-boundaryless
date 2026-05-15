import type { DomainDefinition, GameState, ProductDefinition } from "./types";

export const ALL_PRODUCT_DOMAIN_FILTER_ID = "all";

export interface ProductDomainFilter {
  id: string;
  label: string;
  productCount: number;
  unlocked: boolean;
  lockedReason: string;
}

export function getProductDomainFilters(
  productDefinitions: ProductDefinition[],
  domainDefinitions: DomainDefinition[],
  state: GameState,
): ProductDomainFilter[] {
  const productCounts = productDefinitions.reduce<Record<string, number>>((counts, product) => {
    counts[product.domain] = (counts[product.domain] ?? 0) + 1;
    return counts;
  }, {});
  const unlockedDomainIds = new Set(state.unlockedDomains);
  const filters = domainDefinitions
    .filter((domain) => (productCounts[domain.id] ?? 0) > 0)
    .map((domain) => ({
      id: domain.id,
      label: domain.name,
      productCount: productCounts[domain.id] ?? 0,
      unlocked: unlockedDomainIds.has(domain.id) || domain.unlocked_by_default,
      lockedReason: formatDomainRequirements(domain.unlock_requirements),
    }));

  return [
    {
      id: ALL_PRODUCT_DOMAIN_FILTER_ID,
      label: "전체",
      productCount: productDefinitions.length,
      unlocked: true,
      lockedReason: "",
    },
    ...filters,
  ];
}

export function getProductsByDomainFilter(productDefinitions: ProductDefinition[], selectedDomainId: string): ProductDefinition[] {
  if (selectedDomainId === ALL_PRODUCT_DOMAIN_FILTER_ID) return productDefinitions;

  const filteredProducts = productDefinitions.filter((product) => product.domain === selectedDomainId);
  return filteredProducts.length ? filteredProducts : productDefinitions;
}

function formatDomainRequirements(requirements: Record<string, number>): string {
  const entries = Object.entries(requirements);
  if (!entries.length) return "";
  return entries.map(([capabilityId, level]) => `${capabilityId} Lv.${level}`).join(", ");
}
