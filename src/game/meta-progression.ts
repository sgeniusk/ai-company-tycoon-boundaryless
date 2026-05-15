import { competitors, metaUnlocks, products, resources, strategyCards } from "./data";
import { createInitialRogueliteState, getMetaStartingResourceEffects } from "./deckbuilding";
import { createInitialState } from "./simulation";
import type { ActionCheck, GameState, MetaUnlockDefinition, ResourceMap, RunRecord } from "./types";
import { t } from "../i18n";

export interface MetaUnlockStatus extends MetaUnlockDefinition {
  unlocked: boolean;
  affordable: boolean;
  reasons: string[];
}

export function getRunInsightReward(state: GameState): number {
  const userBonus = Math.floor((state.resources.users ?? 0) / 1500);
  const trustBonus = Math.floor((state.resources.trust ?? 0) / 40);
  const monthBonus = Math.floor(state.month / 3);
  const statusBonus = state.status === "success" ? 3 : state.status === "failure" ? 1 : 0;

  return Math.max(1, 1 + monthBonus + state.activeProducts.length + userBonus + trustBonus + statusBonus);
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

export function resetRunWithMetaUnlocks(state: GameState, requestedMetaUnlockIds: string[] = []): GameState {
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
  const nextState = createInitialState();
  const startingEffects = getMetaStartingResourceEffects(nextMetaIds);

  return {
    ...nextState,
    resources: applyResourceDelta(nextState.resources, startingEffects),
    roguelite: createInitialRogueliteState({
      runNumber: previousRoguelite.runNumber + 1,
      founderInsight: availableInsight,
      unlockedMetaIds: nextMetaIds,
      runHistory: [createRunRecord(state, insightReward), ...(previousRoguelite.runHistory ?? [])].slice(0, 8),
    }),
    timeline: [
      `새 런 시작: 창업 통찰 ${availableInsight} 보유${newlyUnlocked.length ? `, 해금 ${newlyUnlocked.join(", ")}` : ""}`,
      ...nextState.timeline,
    ].slice(0, 8),
  };
}

function createRunRecord(state: GameState, insightReward: number): RunRecord {
  const bestProduct = getBestReviewedProduct(state);
  const representativeCard = getRepresentativeCard(state);
  const rival = getStrongestRival(state);

  return {
    id: `run_${state.roguelite.runNumber}_${state.month}`,
    runNumber: state.roguelite.runNumber,
    endedMonth: state.month,
    status: state.status,
    score: estimateRecordScore(state),
    bestProductName: bestProduct?.name,
    representativeCardName: representativeCard?.name,
    rivalName: rival?.name,
    insightReward,
    note: createRecordNote(state, bestProduct?.name, representativeCard?.name),
  };
}

function getBestReviewedProduct(state: GameState) {
  const reviewedProductId = Object.entries(state.productReviews)
    .sort(([, first], [, second]) => second.score - first.score)[0]?.[0];
  const productId = reviewedProductId ?? state.lastRelease?.productId ?? state.activeProducts[0];

  return products.find((product) => product.id === productId);
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

function createRecordNote(state: GameState, productName?: string, cardName?: string): string {
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
