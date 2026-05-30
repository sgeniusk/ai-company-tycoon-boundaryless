import { competitors, difficultyTiers, metaUnlocks, products, resources, strategyCards } from "./data";
import { CAMPAIGN_FINAL_MONTH, getCampaignFinale } from "./campaign";
import { getCampaignEnding } from "./campaign-ending";
import { createInitialRogueliteState, getAvailableStarterDecks, getMetaStartingResourceEffects } from "./deckbuilding";
import { createInitialState } from "./simulation";
import type { RunModifierSelectionInput } from "./run-modifiers";
import { getDerivedArchetypes, getNewlyDiscoveredArchetypes } from "./tag-derivation";
import type { ActionCheck, GameState, MetaUnlockDefinition, ResourceMap, RunRecord, StarterDeckOption } from "./types";
import { t } from "../i18n";

export interface MetaUnlockStatus extends MetaUnlockDefinition {
  unlocked: boolean;
  affordable: boolean;
  reasons: string[];
}

export interface NextRunRecommendedUnlock extends MetaUnlockStatus {
  categoryLabel: string;
  reason: string;
  score: number;
  unlockedCardNames: string[];
}

export interface NextRunStarterDeckPlan extends StarterDeckOption {
  fitScore: number;
  reason: string;
  recommended: boolean;
}

export interface NextRunQuickStart {
  id: "safe_restart" | "recommended_unlock" | "current_deck";
  label: string;
  description: string;
  unlockIds: string[];
  starterDeckId: string;
  affordable: boolean;
  reasons: string[];
  projectedInsightAfterStart: number;
}

export interface NextRunSetupPlan {
  currentRunNumber: number;
  projectedRunNumber: number;
  currentFounderInsight: number;
  insightReward: number;
  projectedFounderInsight: number;
  focusTitle: string;
  focusSummary: string;
  recoveryWarnings: string[];
  bestProductName?: string;
  representativeCardName?: string;
  strongestRivalName?: string;
  recommendedUnlocks: NextRunRecommendedUnlock[];
  starterDeckPlans: NextRunStarterDeckPlan[];
  quickStarts: NextRunQuickStart[];
}

export function getRunInsightReward(state: GameState): number {
  const userBonus = Math.floor((state.resources.users ?? 0) / 1500);
  const trustBonus = Math.floor((state.resources.trust ?? 0) / 40);
  const monthBonus = Math.floor(state.month / 3);
  const statusBonus = state.status === "success" ? 3 : state.status === "failure" ? 1 : 0;
  const rewardMultiplier = difficultyTiers.find((tier) => tier.id === state.runModifiers?.challengeTier)?.reward_multiplier ?? 1;
  const baseReward = Math.max(1, 1 + monthBonus + state.activeProducts.length + userBonus + trustBonus + statusBonus);
  const endingBonus = getNewEndingMetaRewardBonus(state);

  return Math.round(baseReward * rewardMultiplier) + endingBonus;
}

function getNewEndingMetaRewardBonus(state: GameState): number {
  if (state.month < CAMPAIGN_FINAL_MONTH) return 0;
  const ending = getCampaignEnding(state);
  return state.roguelite.discoveredEndingIds.includes(ending.id) ? 0 : ending.meta_reward_bonus;
}

export function getMetaUnlockCheck(metaUnlockId: string, state: GameState, spendableInsight = state.roguelite.founderInsight): ActionCheck {
  const unlock = metaUnlocks.find((entry) => entry.id === metaUnlockId);
  const reasons: string[] = [];

  if (!unlock) reasons.push("알 수 없는 메타 해금입니다.");
  if (state.roguelite.unlockedMetaIds.includes(metaUnlockId)) reasons.push("이미 해금했습니다.");
  if (unlock && spendableInsight < unlock.cost) reasons.push(`창업 통찰 ${unlock.cost} 필요`);

  return { ok: reasons.length === 0, reasons };
}

export function getMetaUnlockStatuses(state: GameState): MetaUnlockStatus[] {
  const projectedInsight = state.roguelite.founderInsight + getRunInsightReward(state);

  return metaUnlocks.map((unlock) => {
    const check = getMetaUnlockCheck(unlock.id, state, projectedInsight);
    return {
      ...unlock,
      unlocked: state.roguelite.unlockedMetaIds.includes(unlock.id),
      affordable: check.ok,
      reasons: check.reasons,
    };
  });
}

export function getNextRunSetupPlan(state: GameState): NextRunSetupPlan {
  const currentFounderInsight = state.roguelite.founderInsight;
  const insightReward = getRunInsightReward(state);
  const projectedFounderInsight = currentFounderInsight + insightReward;
  const recoveryWarnings = getRestartWarnings(state);
  const bestProduct = getBestReviewedProduct(state);
  const representativeCard = getRepresentativeCard(state);
  const strongestRival = getStrongestRival(state);
  const recommendedUnlocks = getRecommendedUnlocks(state, projectedFounderInsight);
  const starterDeckPlans = getStarterDeckPlans(state);
  const quickStarts = getNextRunQuickStarts(state, projectedFounderInsight, recommendedUnlocks, starterDeckPlans);

  return {
    currentRunNumber: state.roguelite.runNumber,
    projectedRunNumber: state.roguelite.runNumber + 1,
    currentFounderInsight,
    insightReward,
    projectedFounderInsight,
    focusTitle: getNextRunFocusTitle(state, recoveryWarnings),
    focusSummary: createNextRunFocusSummary(state, bestProduct?.name, representativeCard?.name, strongestRival?.name),
    recoveryWarnings,
    bestProductName: bestProduct?.name,
    representativeCardName: representativeCard?.name,
    strongestRivalName: strongestRival?.name,
    recommendedUnlocks,
    starterDeckPlans,
    quickStarts,
  };
}

export function resetRunWithMetaUnlocks(
  state: GameState,
  requestedMetaUnlockIds: string[] = [],
  starterDeckId = "balanced_founder",
  runModifierSelection?: RunModifierSelectionInput,
): GameState {
  const previousRoguelite = state.roguelite;
  const insightReward = getRunInsightReward(state);
  let availableInsight = previousRoguelite.founderInsight + insightReward;
  const unlockedMetaIds = new Set(previousRoguelite.unlockedMetaIds);
  const newlyUnlocked: string[] = [];

  for (const unlockId of requestedMetaUnlockIds) {
    const unlock = metaUnlocks.find((entry) => entry.id === unlockId);
    if (!unlock || unlockedMetaIds.has(unlock.id) || availableInsight < unlock.cost) continue;
    availableInsight -= unlock.cost;
    unlockedMetaIds.add(unlock.id);
    newlyUnlocked.push(unlock.title);
  }

  const nextMetaIds = [...unlockedMetaIds];
  const starterDeck = getAvailableStarterDecks({
    ...state,
    roguelite: {
      ...state.roguelite,
      unlockedMetaIds: nextMetaIds,
    },
  }).find((deck) => deck.id === starterDeckId && deck.available);
  const nextStarterDeckId = starterDeck?.id ?? "balanced_founder";
  const nextState = createInitialState(runModifierSelection);
  const startingEffects = getMetaStartingResourceEffects(nextMetaIds);
  const previousDiscoveredArchetypeIds = uniqueStrings(previousRoguelite.discoveredArchetypeIds ?? []);
  const newlyDiscoveredArchetypeIds = getNewlyDiscoveredArchetypes(previousDiscoveredArchetypeIds, getDerivedArchetypes(nextState));
  const discoveredArchetypeIds = uniqueStrings([...previousDiscoveredArchetypeIds, ...newlyDiscoveredArchetypeIds]);
  const previousDiscoveredEndingIds = uniqueStrings(previousRoguelite.discoveredEndingIds ?? []);
  const completedEndingId = state.month >= CAMPAIGN_FINAL_MONTH ? getCampaignEnding(state).id : undefined;
  const discoveredEndingIds = uniqueStrings([...previousDiscoveredEndingIds, ...(completedEndingId ? [completedEndingId] : [])]);

  return {
    ...nextState,
    resources: applyResourceDelta(nextState.resources, startingEffects),
    seenTutorials: [...(state.seenTutorials ?? [])],
    roguelite: createInitialRogueliteState({
      runNumber: previousRoguelite.runNumber + 1,
      founderInsight: availableInsight,
      unlockedMetaIds: nextMetaIds,
      discoveredArchetypeIds,
      discoveredEndingIds,
      starterDeckId: nextStarterDeckId,
      runHistory: [createRunRecord(state, insightReward), ...(previousRoguelite.runHistory ?? [])].slice(0, 8),
    }),
    timeline: [
      `새 런 시작: ${starterDeck?.title ?? "균형 창업자 덱"} · 창업 통찰 ${availableInsight} 보유${newlyUnlocked.length ? `, 해금 ${newlyUnlocked.join(", ")}` : ""}`,
      ...nextState.timeline,
    ].slice(0, 8),
  };
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.filter((value) => typeof value === "string" && value.length > 0))];
}

function getRecommendedUnlocks(state: GameState, projectedFounderInsight: number): NextRunRecommendedUnlock[] {
  return metaUnlocks
    .filter((unlock) => !state.roguelite.unlockedMetaIds.includes(unlock.id))
    .map((unlock) => {
      const check = getMetaUnlockCheck(unlock.id, state, projectedFounderInsight);
      const score = scoreMetaUnlock(unlock, state, projectedFounderInsight);
      const unlockedCardNames = strategyCards
        .filter((card) => unlock.unlock_card_ids.includes(card.id))
        .map((card) => card.name);

      return {
        ...unlock,
        unlocked: false,
        affordable: check.ok,
        reasons: check.reasons,
        categoryLabel: getMetaUnlockCategoryLabel(unlock),
        reason: getMetaUnlockRecommendationReason(unlock, state),
        score,
        unlockedCardNames,
      };
    })
    .sort((first, second) => second.score - first.score || first.cost - second.cost);
}

function getStarterDeckPlans(state: GameState): NextRunStarterDeckPlan[] {
  return getAvailableStarterDecks(state)
    .map((deck) => {
      const fitScore = scoreStarterDeck(deck, state);

      return {
        ...deck,
        fitScore,
        reason: getStarterDeckReason(deck, state),
        recommended: false,
      };
    })
    .sort((first, second) => Number(second.available) - Number(first.available) || second.fitScore - first.fitScore)
    .map((deck, index) => ({ ...deck, recommended: index === 0 && deck.available }));
}

function getNextRunQuickStarts(
  state: GameState,
  projectedFounderInsight: number,
  recommendedUnlocks: NextRunRecommendedUnlock[],
  starterDeckPlans: NextRunStarterDeckPlan[],
): NextRunQuickStart[] {
  const recommendedUnlock = recommendedUnlocks.find((unlock) => unlock.affordable) ?? recommendedUnlocks[0];
  const currentStarterDeckId = starterDeckPlans.find((deck) => deck.id === state.roguelite.starterDeckId && deck.available)?.id ?? "balanced_founder";
  const recommendedStarterDeckId = recommendedUnlock
    ? getStarterDeckIdAfterUnlock(state, recommendedUnlock.id)
    : starterDeckPlans.find((deck) => deck.recommended)?.id ?? "balanced_founder";
  const recommendedUnlockCost = recommendedUnlock?.affordable ? recommendedUnlock.cost : 0;

  return [
    {
      id: "safe_restart",
      label: "안전 재시작",
      description: "통찰을 아끼고 균형 창업자 덱으로 초반 제품, 고객, 안전을 고르게 챙깁니다.",
      unlockIds: [],
      starterDeckId: "balanced_founder",
      affordable: true,
      reasons: ["현재 통찰을 보존", "기본 덱으로 실패 복구 안정화"],
      projectedInsightAfterStart: projectedFounderInsight,
    },
    {
      id: "recommended_unlock",
      label: recommendedUnlock ? `${recommendedUnlock.title} 해금` : "추천 해금 없음",
      description: recommendedUnlock
        ? `${recommendedUnlock.categoryLabel} 축을 다음 런의 첫 전략으로 고정합니다.`
        : "남은 해금이 없으므로 현재 덱을 유지합니다.",
      unlockIds: recommendedUnlock?.affordable ? [recommendedUnlock.id] : [],
      starterDeckId: recommendedStarterDeckId,
      affordable: recommendedUnlock ? recommendedUnlock.affordable : true,
      reasons: recommendedUnlock ? [recommendedUnlock.reason, ...recommendedUnlock.reasons] : ["모든 메타 해금을 이미 확보했습니다."],
      projectedInsightAfterStart: Math.max(0, projectedFounderInsight - recommendedUnlockCost),
    },
    {
      id: "current_deck",
      label: "현재 덱 유지",
      description: "이번 런에서 익숙해진 카드 흐름을 유지해 다음 제품 출시 루틴을 빠르게 반복합니다.",
      unlockIds: [],
      starterDeckId: currentStarterDeckId,
      affordable: true,
      reasons: ["현재 스타터 덱 유지", "새 조작 학습 부담 최소화"],
      projectedInsightAfterStart: projectedFounderInsight,
    },
  ];
}

function getRestartWarnings(state: GameState): string[] {
  const warnings: string[] = [];

  if ((state.resources.cash ?? 0) <= 0) warnings.push("현금 흐름 붕괴");
  if ((state.resources.trust ?? 0) < 25) warnings.push("신뢰도 위험");
  if ((state.resources.automation ?? 0) < 5 && state.month >= 8) warnings.push("자동화 부족");
  if (state.activeProducts.length === 0 && state.month >= 4) warnings.push("첫 출시 지연");
  if (state.competitorStates.some((competitor) => competitor.momentum >= 8)) warnings.push("경쟁사 모멘텀 과열");

  return warnings;
}

function getNextRunFocusTitle(state: GameState, recoveryWarnings: string[]): string {
  if (state.status === "failure" || recoveryWarnings.includes("현금 흐름 붕괴") || recoveryWarnings.includes("신뢰도 위험")) {
    return "복구 런 설계";
  }

  if (state.status === "success" || state.month >= CAMPAIGN_FINAL_MONTH) return "확장 런 설계";
  if (state.activeProducts.length >= 3) return "스케일업 런 설계";
  return "다음 런 설계";
}

function createNextRunFocusSummary(state: GameState, bestProductName?: string, cardName?: string, rivalName?: string): string {
  if (state.status === "failure") {
    return `${bestProductName ?? "첫 제품"} 경험을 살려 현금과 신뢰를 먼저 복구하는 재시작이 좋습니다.`;
  }

  if (state.status === "success") {
    return `${bestProductName ?? "대표 제품"} 성과를 다음 런의 더 큰 산업 확장으로 연결할 차례입니다.`;
  }

  if (rivalName) return `${rivalName} 압박을 기억하고 ${cardName ?? "핵심 카드"} 중심의 대응 빌드를 준비합니다.`;
  return `${bestProductName ?? "첫 출시"}와 ${cardName ?? "기본 카드"} 흐름을 바탕으로 다음 런의 실험 방향을 고릅니다.`;
}

function scoreMetaUnlock(unlock: MetaUnlockDefinition, state: GameState, projectedFounderInsight: number): number {
  const tags = new Set(unlock.tags);
  let score = projectedFounderInsight >= unlock.cost ? 35 : -25;

  if ((state.resources.cash ?? 0) <= 0 && (tags.has("automation") || tags.has("ops") || tags.has("growth"))) score += 35;
  if ((state.resources.trust ?? 0) < 25 && (tags.has("safety") || tags.has("quality"))) score += 95;
  if ((state.resources.automation ?? 0) < 6 && (tags.has("automation") || tags.has("ops"))) score += 42;
  if ((state.resources.users ?? 0) < 3000 && (tags.has("growth") || tags.has("retention"))) score += 26;
  if (state.activeProducts.length >= 3 && (tags.has("boundaryless") || tags.has("odd"))) score += 36;
  if (state.month >= 24 && (tags.has("hardware") || tags.has("compute") || tags.has("research"))) score += 28;
  if (unlock.id === "eval_harness" && ((state.resources.trust ?? 0) < 35 || state.status === "failure")) score += 28;
  if (unlock.id === "launch_playbook" && state.status === "success") score += 24;
  if (state.competitorStates.some((competitor) => competitor.momentum >= 8) && (tags.has("counter") || tags.has("enterprise"))) score += 32;

  return score - unlock.cost;
}

function scoreStarterDeck(deck: StarterDeckOption, state: GameState): number {
  const tags = new Set(deck.tags);
  let score = deck.available ? 20 : -60;

  if (deck.id === "balanced_founder") score += state.roguelite.unlockedMetaIds.length === 0 ? 30 : 8;
  if ((state.resources.trust ?? 0) < 35 && (tags.has("trust") || tags.has("safety"))) score += 32;
  if ((state.resources.cash ?? 0) <= 0 && (tags.has("automation") || tags.has("growth") || tags.has("compute"))) score += 18;
  if ((state.resources.users ?? 0) >= 4000 && (tags.has("growth") || tags.has("market"))) score += 24;
  if (state.month >= 18 && (tags.has("hardware") || tags.has("robotics"))) score += 22;
  if (state.activeProducts.length >= 3 && (tags.has("boundaryless") || tags.has("odd"))) score += 18;

  return score;
}

function getMetaUnlockCategoryLabel(unlock: MetaUnlockDefinition): string {
  const tags = new Set(unlock.tags);

  if (tags.has("safety") || tags.has("quality") || tags.has("ux")) return "품질/신뢰";
  if (tags.has("growth") || tags.has("retention")) return "성장/리텐션";
  if (tags.has("automation") || tags.has("ops")) return "운영 자동화";
  if (tags.has("counter") || tags.has("enterprise")) return "경쟁/기업";
  if (tags.has("robotics") || tags.has("hardware") || tags.has("compute") || tags.has("research")) return "하드웨어/연구";
  if (tags.has("boundaryless") || tags.has("odd")) return "경계 확장";
  return "메타";
}

function getMetaUnlockRecommendationReason(unlock: MetaUnlockDefinition, state: GameState): string {
  const tags = new Set(unlock.tags);

  if ((state.resources.trust ?? 0) < 25 && (tags.has("safety") || tags.has("quality"))) {
    return "낮은 신뢰를 복구하고 안전 카드로 다음 출시 사고를 줄입니다.";
  }

  if ((state.resources.cash ?? 0) <= 0 && (tags.has("automation") || tags.has("ops"))) {
    return "무너진 현금 흐름을 자동화와 운영 효율로 회복합니다.";
  }

  if (state.status === "success" && (tags.has("growth") || tags.has("retention"))) {
    return "성공 런의 화제성을 다음 런 첫 출시 성장으로 이어갑니다.";
  }

  if (state.month >= 24 && (tags.has("hardware") || tags.has("compute") || tags.has("research"))) {
    return "중후반 산업 확장을 위한 연산, 반도체, 로봇 기반을 앞당깁니다.";
  }

  if (tags.has("boundaryless") || tags.has("odd")) {
    return "AI 회사가 엉뚱한 산업으로 튀는 밈과 공유 장면을 만듭니다.";
  }

  return `${unlock.title} 카드와 시작 보너스로 다음 런의 전략 축을 넓힙니다.`;
}

function getStarterDeckReason(deck: StarterDeckOption, state: GameState): string {
  const tags = new Set(deck.tags);

  if (!deck.available) return deck.lockedReason ?? "메타 해금이 더 필요합니다.";
  if (deck.id === "balanced_founder") return "초반 비용, 고객, 안전을 모두 다루는 가장 안정적인 선택입니다.";
  if ((state.resources.trust ?? 0) < 35 && (tags.has("trust") || tags.has("safety"))) return "신뢰 복구와 기업형 출시를 빠르게 준비합니다.";
  if (tags.has("growth") || tags.has("market")) return "첫 제품의 사용자 폭발과 출시 장면을 키웁니다.";
  if (tags.has("automation") || tags.has("agent")) return "사람과 에이전트 운용 한계를 자동화로 완화합니다.";
  if (tags.has("hardware") || tags.has("robotics")) return "반도체, 로봇, 자동차 같은 물리 산업으로 빨리 넘어갑니다.";
  if (tags.has("boundaryless") || tags.has("odd")) return "커피 프랜차이즈 같은 이상한 확장으로 공유성을 노립니다.";
  return "현재 해금 상태에서 다음 런의 카드 방향을 바꿉니다.";
}

function getStarterDeckIdAfterUnlock(state: GameState, unlockId: string): string {
  const stateAfterUnlock: GameState = {
    ...state,
    roguelite: {
      ...state.roguelite,
      unlockedMetaIds: [...new Set([...state.roguelite.unlockedMetaIds, unlockId])],
    },
  };
  const unlockedDeck = getAvailableStarterDecks(stateAfterUnlock).find((deck) => deck.required_meta_id === unlockId && deck.available);

  return unlockedDeck?.id ?? "balanced_founder";
}

function createRunRecord(state: GameState, insightReward: number): RunRecord {
  const bestProduct = getBestReviewedProduct(state);
  const representativeCard = getRepresentativeCard(state);
  const rival = getStrongestRival(state);
  const campaignFinale = state.month >= CAMPAIGN_FINAL_MONTH ? getCampaignFinale(state) : undefined;

  return {
    id: `run_${state.roguelite.runNumber}_${state.month}`,
    runNumber: state.roguelite.runNumber,
    endedMonth: state.month,
    status: state.status,
    score: estimateRecordScore(state),
    campaignRank: campaignFinale?.rank,
    endingId: campaignFinale?.endingId,
    endingName: campaignFinale?.endingName,
    survivedYears: campaignFinale?.survivedYears,
    bestProductName: bestProduct?.name,
    representativeCardName: representativeCard?.name,
    rivalName: rival?.name,
    insightReward,
    note: createRecordNote(state, bestProduct?.name, representativeCard?.name, campaignFinale?.endingName),
  };
}

function getBestReviewedProduct(state: GameState) {
  const reviewedProductId = Object.entries(state.productReviews)
    .sort(([, first], [, second]) => second.score - first.score)[0]?.[0];
  const productId = reviewedProductId ?? state.lastRelease?.productId ?? state.activeProducts[0];

  return [...products, ...(state.generatedProducts ?? [])].find((product) => product.id === productId);
}

function getRepresentativeCard(state: GameState) {
  const rewardCardId = state.roguelite.rewardHistory[0]?.chosenCardId;
  const upgradedCardId = state.roguelite.upgradedCardIds[0];
  const recentDiscardId = state.roguelite.deck.discardPile[state.roguelite.deck.discardPile.length - 1];
  const recentCardId = rewardCardId ?? upgradedCardId ?? recentDiscardId ?? state.roguelite.deck.hand[0];

  return strategyCards.find((card) => card.id === recentCardId);
}

function getStrongestRival(state: GameState) {
  const strongest = [...state.competitorStates].sort((a, b) => b.marketShare - a.marketShare || b.score - a.score)[0];
  const definition = competitors.find((competitor) => competitor.id === strongest?.id);

  return definition ? { id: definition.id, name: t(definition.name_key, "ko") } : undefined;
}

function estimateRecordScore(state: GameState): number {
  const statusBonus = state.status === "success" ? 20 : state.status === "failure" ? -15 : 0;
  const productScore = Math.min(30, state.activeProducts.length * 10);
  const userScore = Math.min(25, (state.resources.users ?? 0) / 400);
  const cashScore = Math.max(-20, Math.min(15, (state.resources.cash ?? 0) / 1000));
  const trustScore = Math.min(20, (state.resources.trust ?? 0) / 4);

  return Math.round(Math.max(0, Math.min(100, productScore + userScore + cashScore + trustScore + statusBonus)));
}

function createRecordNote(state: GameState, productName?: string, cardName?: string, endingName?: string): string {
  if (endingName) return `10년 엔딩 ${endingName}: ${productName ?? "대표 제품"}을 남기고 다음 창업 기록으로 이어진 런`;
  if (state.status === "failure") return `${productName ?? "첫 제품"}을 살리고 현금 흐름을 더 빨리 안정화해야 했던 런`;
  if (productName && cardName) return `${productName}과 ${cardName} 조합이 기억할 만했던 런`;
  if (productName) return `${productName}을 중심으로 확장을 시작한 런`;
  return "첫 출시까지의 속도를 더 높여야 하는 런";
}

function applyResourceDelta(current: ResourceMap, delta: ResourceMap): ResourceMap {
  const next = { ...current };

  for (const [resourceId, amount] of Object.entries(delta)) {
    const definition = resources[resourceId];
    const currentValue = next[resourceId] ?? 0;
    next[resourceId] = definition ? clamp(currentValue + amount, definition.min_value, definition.max_value) : currentValue + amount;
  }

  return next;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
