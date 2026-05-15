import { capabilities, growthPaths, items, products, upgrades } from "./data";
import type { GrowthPathDefinition, ProductDefinition, ReleaseGrowthPath } from "./types";

export function createReleaseGrowthPaths(product: ProductDefinition): ReleaseGrowthPath[] {
  return [...growthPaths]
    .map((path) => ({
      path,
      relevance: getPathRelevance(path, product),
    }))
    .sort((a, b) => b.relevance - a.relevance || a.path.order - b.path.order)
    .slice(0, 3)
    .map(({ path }) => ({
      id: path.id,
      title: path.title,
      description: path.description,
      targetMenu: path.target_menu,
      actionLabel: path.action_label,
      payoff: path.payoff,
      bonusDescription: path.bonus_description,
      detail: createGrowthPathDetail(path),
    }));
}

function getPathRelevance(path: GrowthPathDefinition, product: ProductDefinition): number {
  return path.trigger_tags.filter((tag) => product.tags.includes(tag)).length;
}

function createGrowthPathDetail(path: GrowthPathDefinition): string {
  const productNames = namesForIds(path.recommended_product_ids, products);
  const capabilityNames = namesForIds(path.recommended_capability_ids, capabilities);
  const upgradeNames = namesForIds(path.recommended_upgrade_ids, upgrades);
  const itemNames = namesForIds(path.recommended_item_ids, items);

  const parts = [
    productNames.length ? `제품: ${productNames.join(", ")}` : "",
    capabilityNames.length ? `능력: ${capabilityNames.join(", ")}` : "",
    upgradeNames.length ? `투자: ${upgradeNames.join(", ")}` : "",
    itemNames.length ? `아이템: ${itemNames.join(", ")}` : "",
  ].filter(Boolean);

  return parts.join(" / ");
}

function namesForIds<T extends { id: string; name: string }>(ids: string[] | undefined, entries: T[]): string[] {
  if (!ids?.length) return [];
  return ids.map((id) => entries.find((entry) => entry.id === id)?.name ?? id);
}
