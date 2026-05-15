import { capabilities, competitors, domains, growthPaths, products, strategyCards } from "./data";
import { getGrowthPathCompetitionSignals, type CompetitionSignalSeverity } from "./competition-signals";
import type { GameState, StrategyCardDefinition } from "./types";
import { t } from "../i18n";

export interface RivalCounterPlan {
  competitorId: string;
  competitorName: string;
  severity: CompetitionSignalSeverity;
  label: string;
  reason: string;
  pressureScore: number;
  domainIds: string[];
  claimedProductIds: string[];
  counterCardIds: string[];
  recommendedProductIds: string[];
  recommendedCapabilityIds: string[];
}

const severityWeights: Record<CompetitionSignalSeverity, number> = {
  contested: 60,
  strategic: 38,
  watch: 18,
  low: 8,
};

const domainCounterTags: Record<string, string[]> = {
  personal_productivity: ["counter", "ux", "product", "market", "trust"],
  customer_support: ["counter", "ux", "product", "trust", "enterprise"],
  education: ["counter", "ux", "product", "trust", "language"],
  developer_tools: ["counter", "developer", "research", "compute"],
  foundation_models: ["counter", "research", "compute", "data"],
  semiconductors: ["counter", "research", "compute", "automation"],
  enterprise_automation: ["counter", "automation", "trust", "enterprise"],
  robotics: ["counter", "automation", "safety", "compute"],
  mobility: ["counter", "automation", "safety", "compute"],
  creator_tools: ["counter", "growth", "creative", "market"],
  toys: ["counter", "growth", "creative", "trust"],
  odd_industries: ["counter", "growth", "creative", "market"],
};

export function getRivalCounterPlans(state: GameState, limit = 3): RivalCounterPlan[] {
  const signals = getGrowthPathCompetitionSignals(state);

  return state.competitorStates
    .map((competitorState) => {
      const competitor = competitors.find((entry) => entry.id === competitorState.id);
      const signal = signals.find((entry) => entry.competitorId === competitorState.id);
      const severity = signal?.severity ?? "low";
      const claimedProducts = products.filter((product) => competitorState.claimedProducts.includes(product.id));
      const domainIds = getCounterDomainIds(state, competitor?.focus_domains ?? [], signal?.overlappingDomains ?? [], claimedProducts.map((product) => product.domain));
      const recommendedProductIds = getRecommendedProductIds(domainIds, competitorState.claimedProducts, state);
      const recommendedCapabilityIds = getRecommendedCapabilityIds(domainIds, recommendedProductIds);
      const counterCardIds = getCounterCardIds(domainIds);
      const pressureScore =
        severityWeights[severity] +
        competitorState.marketShare +
        competitorState.claimedProducts.length * 4 +
        (signal?.claimedOverlapCount ?? 0) * 12 +
        competitorState.momentum * 3 +
        (competitor?.aggression ?? 0) * 2;

      return {
        competitorId: competitorState.id,
        competitorName: competitor ? t(competitor.name_key) : competitorState.id,
        severity,
        label: signal?.label ?? "간접 경쟁",
        reason: signal?.reason ?? "현재 직접 충돌은 약하지만 시장 신호를 관찰합니다.",
        pressureScore: Math.round(pressureScore),
        domainIds,
        claimedProductIds: competitorState.claimedProducts,
        counterCardIds,
        recommendedProductIds,
        recommendedCapabilityIds,
      };
    })
    .filter((plan) => plan.pressureScore > 0)
    .sort((a, b) => b.pressureScore - a.pressureScore || a.competitorName.localeCompare(b.competitorName))
    .slice(0, limit);
}

export function getRivalCounterTargetId(state: GameState): string | undefined {
  return getRivalCounterPlans(state, 1)[0]?.competitorId ?? state.competitorStates[0]?.id;
}

function getCounterDomainIds(
  state: GameState,
  focusDomains: string[],
  overlappingDomains: string[],
  claimedDomains: string[],
): string[] {
  const path = growthPaths.find((entry) => entry.id === state.chosenGrowthPath?.id);
  const pathDomains = (path?.recommended_product_ids ?? [])
    .map((productId) => products.find((product) => product.id === productId)?.domain)
    .filter((domainId): domainId is string => Boolean(domainId));
  const orderedDomains = [...overlappingDomains, ...claimedDomains, ...focusDomains];
  const unique = [...new Set(orderedDomains.filter((domainId) => domains.some((domain) => domain.id === domainId)))];

  if (unique.length > 0) return unique;
  return [...new Set(pathDomains)].slice(0, 2);
}

function getRecommendedProductIds(domainIds: string[], claimedProductIds: string[], state: GameState): string[] {
  const activeProductIds = new Set(state.activeProducts);
  const claimedSet = new Set(claimedProductIds);

  return products
    .filter((product) => domainIds.includes(product.domain))
    .map((product) => ({
      product,
      score: (claimedSet.has(product.id) ? 40 : 0) + (activeProductIds.has(product.id) ? -12 : 0) + Math.max(0, 8 - product.level),
    }))
    .sort((a, b) => b.score - a.score || a.product.level - b.product.level || a.product.name.localeCompare(b.product.name))
    .map(({ product }) => product.id)
    .slice(0, 3);
}

function getRecommendedCapabilityIds(domainIds: string[], productIds: string[]): string[] {
  const capabilityIds = new Set<string>();

  for (const productId of productIds) {
    const product = products.find((entry) => entry.id === productId);
    for (const capabilityId of Object.keys(product?.required_capabilities ?? {})) {
      capabilityIds.add(capabilityId);
    }
  }

  for (const domainId of domainIds) {
    const domain = domains.find((entry) => entry.id === domainId);
    for (const capabilityId of Object.keys(domain?.unlock_requirements ?? {})) {
      capabilityIds.add(capabilityId);
    }
  }

  return [...capabilityIds]
    .filter((capabilityId) => capabilities.some((capability) => capability.id === capabilityId))
    .slice(0, 3);
}

function getCounterCardIds(domainIds: string[]): string[] {
  const desiredTags = new Set(["counter", ...domainIds.flatMap((domainId) => domainCounterTags[domainId] ?? [])]);

  return strategyCards
    .filter((card) => isCounterCard(card))
    .map((card) => ({
      card,
      score:
        card.tags.filter((tag) => desiredTags.has(tag)).length * 10 +
        Math.abs(card.effects.rival_score_delta ?? 0) +
        Math.abs(card.effects.rival_momentum_delta ?? 0) * 3 +
        (card.rarity === "starter" ? 0 : 4),
    }))
    .sort((a, b) => b.score - a.score || a.card.name.localeCompare(b.card.name))
    .map(({ card }) => card.id)
    .slice(0, 3);
}

function isCounterCard(card: StrategyCardDefinition): boolean {
  return card.tags.includes("counter") || Boolean(card.effects.rival_score_delta || card.effects.rival_momentum_delta);
}
