import { domains, industryCombos, products } from "./data";
import type { GameState, IndustryComboSummary, IndustryComboStatus, ResourceMap } from "./types";

function mergeResourceDelta(base: ResourceMap, extra: ResourceMap): ResourceMap {
  const next = { ...base };

  for (const [resourceId, amount] of Object.entries(extra)) {
    next[resourceId] = (next[resourceId] ?? 0) + amount;
  }

  return next;
}

function getDomainName(domainId: string): string {
  return domains.find((domain) => domain.id === domainId)?.name ?? domainId;
}

function getActiveIndustryDomainIds(state: GameState): Set<string> {
  const activeProductDomains = products
    .filter((product) => state.activeProducts.includes(product.id))
    .map((product) => product.domain);

  return new Set([...state.unlockedDomains, ...activeProductDomains]);
}

export function getIndustryComboSummary(state: GameState): IndustryComboSummary {
  const activeDomainIds = getActiveIndustryDomainIds(state);
  const statuses = industryCombos.map((combo): IndustryComboStatus => {
    const fulfilledDomains = combo.required_domains.filter((domainId) => activeDomainIds.has(domainId));
    const missingDomains = combo.required_domains.filter((domainId) => !activeDomainIds.has(domainId));
    const active = combo.required_domains.length > 0 && missingDomains.length === 0;

    return {
      ...combo,
      active,
      fulfilledDomains,
      missingDomains,
      progressLabel: combo.required_domains
        .map((domainId) => `${getDomainName(domainId)} ${activeDomainIds.has(domainId) ? "✓" : "잠김"}`)
        .join(" · "),
    };
  });
  const active = statuses.filter((status) => status.active);
  const locked = statuses.filter((status) => !status.active);

  return {
    active,
    locked,
    nextCandidate: locked[0],
    totalMonthlyEffects: active.reduce<ResourceMap>(
      (total, combo) => mergeResourceDelta(total, combo.monthly_effects),
      {},
    ),
  };
}
