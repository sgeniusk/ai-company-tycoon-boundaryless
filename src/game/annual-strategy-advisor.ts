import { capabilities, domains, products, strategyCards } from "./data";
import { getActiveAnnualDirective } from "./annual-review";
import { getRivalCounterPlans, type RivalCounterPlan } from "./rival-counters";
import type { CapabilityDefinition, GameState, ProductDefinition } from "./types";
import type { MenuId } from "../ui/menu";

export interface AnnualStrategyRecommendation {
  id: string;
  name: string;
  score: number;
  reason: string;
}

export interface AnnualStrategyAdvice {
  directiveTitle: string;
  summary: string;
  recommendedMenu: MenuId;
  tagLabels: string[];
  productRecommendations: AnnualStrategyRecommendation[];
  capabilityRecommendations: AnnualStrategyRecommendation[];
  rivalRecommendations: RivalCounterPlan[];
  actionRecommendations: AnnualStrategyAction[];
}

export interface AnnualStrategyAction {
  label: string;
  menu: MenuId;
  targetId?: string;
  description: string;
}

const strategyTagLabels: Record<string, string> = {
  trust: "신뢰",
  safety: "안전",
  enterprise: "기업",
  product: "제품",
  market: "시장",
  growth: "성장",
  research: "연구",
  compute: "컴퓨트",
  automation: "자동화",
  creative: "크리에이티브",
  developer: "개발자",
  data: "데이터",
};

const capabilityTags: Record<string, string[]> = {
  language: ["trust", "product", "market"],
  code: ["developer", "research"],
  vision: ["creative", "market", "safety"],
  audio: ["creative", "product"],
  video: ["creative", "market"],
  agent: ["automation", "enterprise", "product"],
  enterprise: ["trust", "enterprise", "safety"],
  safety: ["trust", "safety"],
  optimization: ["compute", "research", "automation"],
  robotics: ["automation", "safety", "research"],
};

const domainTags: Record<string, string[]> = {
  personal_productivity: ["product", "market"],
  customer_support: ["trust", "enterprise", "product"],
  education: ["trust", "product"],
  developer_tools: ["developer", "research"],
  foundation_models: ["research", "compute", "data"],
  semiconductors: ["compute", "research", "automation"],
  enterprise_automation: ["enterprise", "automation", "trust"],
  robotics: ["automation", "safety", "compute"],
  mobility: ["safety", "automation", "market"],
  creator_tools: ["creative", "market", "product"],
  toys: ["creative", "trust", "market"],
  odd_industries: ["creative", "market", "automation"],
};

export function getAnnualStrategyAdvice(state: GameState): AnnualStrategyAdvice | undefined {
  const directive = getActiveAnnualDirective(state);
  const directiveTags = [...new Set(directive?.rewardBiasTags ?? [])];
  if (!directive || directiveTags.length === 0) return undefined;

  const productRecommendations = scoreProductsForDirective(state, directiveTags).slice(0, 3);
  const capabilityRecommendations = scoreCapabilitiesForDirective(state, directiveTags).slice(0, 3);
  const rivalRecommendations = scoreRivalPlansForDirective(state, directiveTags).slice(0, 2);
  const tagLabels = directiveTags.map((tag) => strategyTagLabels[tag] ?? tag);
  const leadingProduct = productRecommendations[0]?.name ?? "다음 제품";
  const leadingCapability = capabilityRecommendations[0]?.name ?? "핵심 연구";
  const actionRecommendations = createActionRecommendations(productRecommendations, capabilityRecommendations, rivalRecommendations);

  return {
    directiveTitle: directive.title,
    summary: `${directive.title}은 ${tagLabels.join(", ")} 축을 강화합니다. 다음 행동은 ${leadingProduct} 검토와 ${leadingCapability} 연구입니다.`,
    recommendedMenu: toMenuId(directive.recommendedMenu),
    tagLabels,
    productRecommendations,
    capabilityRecommendations,
    rivalRecommendations,
    actionRecommendations,
  };
}

function toMenuId(value: string): MenuId {
  const menuIds: MenuId[] = ["company", "products", "deck", "agents", "research", "shop", "competition", "log"];
  return menuIds.includes(value as MenuId) ? (value as MenuId) : "company";
}

function scoreProductsForDirective(state: GameState, directiveTags: string[]): AnnualStrategyRecommendation[] {
  const activeProductIds = new Set(state.activeProducts);
  const directiveTagSet = new Set(directiveTags);

  return products
    .map((product) => {
      const tags = new Set([...product.tags, ...(domainTags[product.domain] ?? [])]);
      const matches = [...tags].filter((tag) => directiveTagSet.has(tag));
      const missingCapabilities = Object.entries(product.required_capabilities)
        .filter(([capabilityId, requiredLevel]) => (state.capabilities[capabilityId] ?? 0) < requiredLevel)
        .map(([capabilityId]) => capabilities.find((capability) => capability.id === capabilityId)?.name ?? capabilityId);
      const score =
        matches.length * 35 +
        (activeProductIds.has(product.id) ? -40 : 0) +
        Math.max(0, 8 - product.level) +
        (missingCapabilities.length === 0 ? 12 : -missingCapabilities.length * 8) +
        (state.resources.trust >= product.trust_requirement ? 6 : -10);

      return {
        id: product.id,
        name: product.name,
        score,
        reason: formatProductReason(product, matches, missingCapabilities),
      };
    })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, "ko"));
}

function scoreCapabilitiesForDirective(state: GameState, directiveTags: string[]): AnnualStrategyRecommendation[] {
  const directiveTagSet = new Set(directiveTags);

  return capabilities
    .map((capability) => {
      const tags = capabilityTags[capability.id] ?? [];
      const matches = tags.filter((tag) => directiveTagSet.has(tag));
      const currentLevel = state.capabilities[capability.id] ?? 0;
      const maxed = currentLevel >= capability.max_level;
      const score = matches.length * 34 + (maxed ? -100 : 0) + Math.max(0, capability.max_level - currentLevel);

      return {
        id: capability.id,
        name: capability.name,
        score,
        reason: formatCapabilityReason(capability, matches, currentLevel),
      };
    })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, "ko"));
}

function scoreRivalPlansForDirective(state: GameState, directiveTags: string[]): RivalCounterPlan[] {
  const directiveTagSet = new Set(directiveTags);

  return getRivalCounterPlans(state, 5)
    .map((plan) => {
      const counterCardTags = plan.counterCardIds
        .flatMap((cardId) => strategyCards.find((card) => card.id === cardId)?.tags ?? []);
      const productTags = plan.recommendedProductIds
        .flatMap((productId) => products.find((product) => product.id === productId)?.tags ?? []);
      const domainPlanTags = plan.domainIds.flatMap((domainId) => domainTags[domainId] ?? []);
      const matches = [...counterCardTags, ...productTags, ...domainPlanTags].filter((tag) => directiveTagSet.has(tag)).length;

      return {
        plan,
        score: plan.pressureScore + matches * 18,
      };
    })
    .sort((a, b) => b.score - a.score || a.plan.competitorName.localeCompare(b.plan.competitorName, "ko"))
    .map(({ plan }) => plan);
}

function createActionRecommendations(
  productRecommendations: AnnualStrategyRecommendation[],
  capabilityRecommendations: AnnualStrategyRecommendation[],
  rivalRecommendations: RivalCounterPlan[],
): AnnualStrategyAction[] {
  const actions: AnnualStrategyAction[] = [];
  const product = productRecommendations[0];
  const capability = capabilityRecommendations[0];
  const rival = rivalRecommendations[0];

  if (product) {
    actions.push({
      label: "제품 후보 보기",
      menu: "products",
      targetId: product.id,
      description: `${product.name} 개발 가능성을 확인합니다.`,
    });
  }
  if (capability) {
    actions.push({
      label: "연구 후보 보기",
      menu: "research",
      targetId: capability.id,
      description: `${capability.name} 연구 비용과 해금 효과를 확인합니다.`,
    });
  }
  if (rival) {
    actions.push({
      label: "경쟁 대응 보기",
      menu: "competition",
      targetId: rival.competitorId,
      description: `${rival.competitorName} 대응 카드와 제품 후보를 확인합니다.`,
    });
  }

  return actions;
}

function formatProductReason(product: ProductDefinition, matches: string[], missingCapabilities: string[]): string {
  const matchedLabel = matches.length ? `${matches.map((tag) => strategyTagLabels[tag] ?? tag).join(", ")} 지시와 맞음` : "지시 태그와 간접 연결";
  const capabilityLabel = missingCapabilities.length ? `필요 연구: ${missingCapabilities.join(", ")}` : "현재 연구로 개발 가능";
  const domainName = domains.find((domain) => domain.id === product.domain)?.name ?? product.domain;
  return `${matchedLabel} · ${domainName} · ${capabilityLabel}`;
}

function formatCapabilityReason(capability: CapabilityDefinition, matches: string[], currentLevel: number): string {
  const matchedLabel = matches.length ? `${matches.map((tag) => strategyTagLabels[tag] ?? tag).join(", ")} 강화` : "장기 기반 연구";
  return `${matchedLabel} · 현재 Lv.${currentLevel}/${capability.max_level}`;
}
