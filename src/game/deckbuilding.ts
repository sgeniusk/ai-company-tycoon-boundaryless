import { capabilities, metaUnlocks, resources, strategyCards } from "./data";
import type {
  ActionCheck,
  ActiveDevelopmentPuzzleModifier,
  CardRewardChoice,
  DevelopmentChallenge,
  GameState,
  PendingCardReward,
  ProductDefinition,
  ReleaseReview,
  ResourceMap,
  RogueliteState,
  StrategyCardDefinition,
  StrategyDeckState,
} from "./types";

const handLimit = 7;
const cardUpgradeMultiplier = 1.25;
const cardEffectLabels: Record<string, string> = {
  project_progress: "개발 진행",
  project_quality: "완성도",
  puzzle_score_bonus: "퍼즐 점수",
  puzzle_difficulty_delta: "퍼즐 난이도",
  puzzle_tile_limit: "퍼즐 선택",
};

export function createInitialStrategyDeck(unlockedMetaIds: string[] = []): StrategyDeckState {
  const cardIds = getUnlockedStrategyCards(unlockedMetaIds).flatMap((card) => Array.from({ length: card.copies }, () => card.id));

  return {
    hand: cardIds.slice(0, 4),
    drawPile: cardIds.slice(4),
    discardPile: [],
    playedThisTurn: [],
  };
}

export function createInitialRogueliteState(options: {
  runNumber?: number;
  founderInsight?: number;
  unlockedMetaIds?: string[];
} = {}): RogueliteState {
  const unlockedMetaIds = [...new Set(options.unlockedMetaIds ?? [])];

  return {
    runNumber: options.runNumber ?? 1,
    founderInsight: options.founderInsight ?? 0,
    unlockedMetaIds,
    deck: createInitialStrategyDeck(unlockedMetaIds),
    deckEditTokens: 0,
    upgradedCardIds: [],
    rewardHistory: [],
  };
}

export function getUnlockedStrategyCards(unlockedMetaIds: string[] = []): StrategyCardDefinition[] {
  const unlockedMeta = new Set(unlockedMetaIds);

  return strategyCards.filter((card) => {
    if (card.unlock_meta_id && !unlockedMeta.has(card.unlock_meta_id)) return false;
    return true;
  });
}

export function getStrategyCardPlayCheck(card: StrategyCardDefinition, state: GameState): ActionCheck {
  const reasons: string[] = [];

  if (state.status !== "playing") reasons.push("운영 중인 런에서만 사용할 수 있습니다.");
  if (!state.roguelite.deck.hand.includes(card.id)) reasons.push("현재 손패에 없는 카드입니다.");
  appendCostReasons(reasons, card.cost, state);

  if (hasProjectEffect(card) && state.productProjects.length === 0) {
    reasons.push("개발 중인 프로젝트가 필요합니다.");
  }

  for (const reason of getRequirementReasons(card.unlock_requirements, state)) {
    reasons.push(reason);
  }

  return { ok: reasons.length === 0, reasons };
}

export function playStrategyCard(card: StrategyCardDefinition, state: GameState): GameState {
  const check = getStrategyCardPlayCheck(card, state);
  if (!check.ok) return state;

  const effects = getStrategyCardEffects(card, state);
  const resourcesAfterCost = applyResourceDelta(state.resources, negateCosts(card.cost));
  const resourcesAfterEffects = applyResourceDelta(resourcesAfterCost, pickResourceEffects(effects));
  const projectProgress = effects.project_progress ?? 0;
  const projectQuality = effects.project_quality ?? 0;
  const targetProjectId = state.productProjects[0]?.id;
  const puzzleModifier = targetProjectId ? createPuzzleModifier(card, effects, targetProjectId) : undefined;
  const nextProjects = state.productProjects.map((project) =>
    project.id === targetProjectId
      ? {
          ...project,
          progress: clamp(project.progress + projectProgress, 0, 100),
          quality: clamp(project.quality + projectQuality, 0, 100),
        }
      : project,
  );

  return {
    ...state,
    resources: resourcesAfterEffects,
    productProjects: nextProjects,
    activeDevelopmentPuzzleModifiers: puzzleModifier
      ? [...state.activeDevelopmentPuzzleModifiers, puzzleModifier]
      : state.activeDevelopmentPuzzleModifiers,
    roguelite: {
      ...state.roguelite,
      deck: {
        ...state.roguelite.deck,
        hand: removeFirst(state.roguelite.deck.hand, card.id),
        discardPile: [...state.roguelite.deck.discardPile, card.id],
        playedThisTurn: [...state.roguelite.deck.playedThisTurn, card.id],
      },
    },
    timeline: [`카드 사용: ${card.name} (${formatCardEffects(effects)})`, ...state.timeline].slice(0, 8),
  };
}

export function createReleaseCardReward(product: ProductDefinition, review: ReleaseReview, state: GameState): RogueliteState {
  const rewardHistory = state.roguelite.rewardHistory ?? [];
  const deckEditTokens = (state.roguelite.deckEditTokens ?? 0) + 1;

  if (state.roguelite.pendingCardReward) {
    return {
      ...state.roguelite,
      deckEditTokens,
    };
  }

  return {
    ...state.roguelite,
    deckEditTokens,
    pendingCardReward: {
      id: `reward_${rewardHistory.length + 1}_${product.id}_${state.month}`,
      productId: product.id,
      productName: product.name,
      month: state.month,
      reviewGrade: review.grade,
      offeredCardIds: getReleaseRewardCardIds(product, review, state),
    },
  };
}

export function getCardRewardChoiceCheck(cardId: string, state: GameState): ActionCheck {
  const reasons: string[] = [];
  const reward = state.roguelite.pendingCardReward;

  if (state.status !== "playing") reasons.push("운영 중인 런에서만 보상을 고를 수 있습니다.");
  if (!reward) reasons.push("선택할 카드 보상이 없습니다.");
  if (!strategyCards.some((card) => card.id === cardId)) reasons.push("알 수 없는 카드입니다.");
  if (reward && !reward.offeredCardIds.includes(cardId)) reasons.push("이번 보상 후보에 없는 카드입니다.");

  return { ok: reasons.length === 0, reasons };
}

export function chooseCardReward(cardId: string, state: GameState): GameState {
  const check = getCardRewardChoiceCheck(cardId, state);
  const reward = state.roguelite.pendingCardReward;
  const card = getStrategyCardById(cardId);
  if (!check.ok || !reward || !card) return state;

  const historyEntry: CardRewardChoice = {
    rewardId: reward.id,
    productId: reward.productId,
    chosenCardId: card.id,
    month: state.month,
  };

  return {
    ...state,
    roguelite: {
      ...state.roguelite,
      pendingCardReward: undefined,
      rewardHistory: [historyEntry, ...(state.roguelite.rewardHistory ?? [])].slice(0, 12),
      deck: {
        ...state.roguelite.deck,
        discardPile: [...state.roguelite.deck.discardPile, card.id],
      },
    },
    timeline: [`카드 보상 선택: ${card.name}이 덱에 추가됨`, ...state.timeline].slice(0, 8),
  };
}

export type DeckEditAction = "remove" | "upgrade";

export function getDeckEditCheck(action: DeckEditAction, cardId: string, state: GameState): ActionCheck {
  const reasons: string[] = [];
  const card = getStrategyCardById(cardId);
  const cardCount = getDeckCardCount(cardId, state.roguelite.deck);
  const totalCards = getDeckTotalCount(state.roguelite.deck);

  if (state.status !== "playing") reasons.push("운영 중인 런에서만 덱을 편집할 수 있습니다.");
  if ((state.roguelite.deckEditTokens ?? 0) <= 0) reasons.push("덱 편집 토큰이 없습니다.");
  if (!card) reasons.push("알 수 없는 카드입니다.");
  if (cardCount <= 0) reasons.push("덱에 없는 카드입니다.");

  if (action === "remove") {
    if (cardCount <= 1) reasons.push("마지막 카드 사본은 제거할 수 없습니다.");
    if (totalCards <= 4) reasons.push("덱은 최소 4장을 유지해야 합니다.");
  }

  if (action === "upgrade" && (state.roguelite.upgradedCardIds ?? []).includes(cardId)) {
    reasons.push("이미 강화한 카드입니다.");
  }

  return { ok: reasons.length === 0, reasons };
}

export function removeStrategyCardFromDeck(cardId: string, state: GameState): GameState {
  const check = getDeckEditCheck("remove", cardId, state);
  const card = getStrategyCardById(cardId);
  if (!check.ok || !card) return state;

  return {
    ...state,
    roguelite: {
      ...state.roguelite,
      deckEditTokens: Math.max(0, (state.roguelite.deckEditTokens ?? 0) - 1),
      deck: removeOneCardFromDeck(cardId, state.roguelite.deck),
    },
    timeline: [`덱 정리: ${card.name} 1장 제거`, ...state.timeline].slice(0, 8),
  };
}

export function upgradeStrategyCard(cardId: string, state: GameState): GameState {
  const check = getDeckEditCheck("upgrade", cardId, state);
  const card = getStrategyCardById(cardId);
  if (!check.ok || !card) return state;

  return {
    ...state,
    roguelite: {
      ...state.roguelite,
      deckEditTokens: Math.max(0, (state.roguelite.deckEditTokens ?? 0) - 1),
      upgradedCardIds: [...(state.roguelite.upgradedCardIds ?? []), card.id],
    },
    timeline: [`카드 강화: ${card.name}의 긍정 효과 상승`, ...state.timeline].slice(0, 8),
  };
}

export function getStrategyCardEffects(card: StrategyCardDefinition, state: GameState): Record<string, number> {
  if (!(state.roguelite.upgradedCardIds ?? []).includes(card.id)) return card.effects;

  return Object.fromEntries(
    Object.entries(card.effects).map(([effectId, amount]) => [
      effectId,
      amount > 0 ? Math.ceil(amount * cardUpgradeMultiplier) : amount,
    ]),
  );
}

export function getDeckCardCounts(deck: StrategyDeckState): Array<{ cardId: string; count: number }> {
  const counts = new Map<string, number>();

  for (const cardId of [...deck.hand, ...deck.drawPile, ...deck.discardPile, ...deck.playedThisTurn]) {
    counts.set(cardId, (counts.get(cardId) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([cardId, count]) => ({ cardId, count }))
    .sort((a, b) => a.cardId.localeCompare(b.cardId));
}

export function drawStrategyCards(count: number, state: GameState): GameState {
  let deck = { ...state.roguelite.deck };

  for (let drawIndex = 0; drawIndex < count && deck.hand.length < handLimit; drawIndex += 1) {
    deck = drawOne(deck);
  }

  return {
    ...state,
    roguelite: {
      ...state.roguelite,
      deck,
    },
  };
}

export function refreshStrategyDeckForNewMonth(state: GameState): GameState {
  const resetState = {
    ...state,
    roguelite: {
      ...state.roguelite,
      deck: {
        ...state.roguelite.deck,
        playedThisTurn: [],
      },
    },
  };

  return drawStrategyCards(1, resetState);
}

export function getStrategyCardById(cardId: string): StrategyCardDefinition | undefined {
  return strategyCards.find((card) => card.id === cardId);
}

function drawOne(deck: StrategyDeckState): StrategyDeckState {
  const refilled =
    deck.drawPile.length > 0
      ? deck
      : {
          ...deck,
          drawPile: deck.discardPile,
          discardPile: [],
        };

  const nextCardId = refilled.drawPile.find((cardId) => !refilled.hand.includes(cardId));
  if (!nextCardId) return refilled;

  return {
    ...refilled,
    drawPile: removeFirst(refilled.drawPile, nextCardId),
    hand: [...refilled.hand, nextCardId],
  };
}

function hasProjectEffect(card: StrategyCardDefinition): boolean {
  return Boolean(
    card.effects.project_progress ||
      card.effects.project_quality ||
      card.effects.puzzle_score_bonus ||
      card.effects.puzzle_difficulty_delta ||
      card.effects.puzzle_tile_limit,
  );
}

function createPuzzleModifier(
  card: StrategyCardDefinition,
  effects: Record<string, number>,
  projectId: string,
): ActiveDevelopmentPuzzleModifier | undefined {
  const scoreBonus = effects.puzzle_score_bonus ?? 0;
  const difficultyDelta = effects.puzzle_difficulty_delta ?? 0;
  const tileLimitBonus = effects.puzzle_tile_limit ?? 0;

  if (!scoreBonus && !difficultyDelta && !tileLimitBonus) return undefined;

  return {
    id: `${projectId}_${card.id}`,
    sourceCardId: card.id,
    label: card.name,
    projectId,
    targetChallenges: getPuzzleTargets(card.tags),
    scoreBonus,
    difficultyDelta,
    tileLimitBonus,
    usesRemaining: 1,
  };
}

function getPuzzleTargets(tags: string[]): DevelopmentChallenge[] {
  const targets = new Set<DevelopmentChallenge>();
  const tagSet = new Set(tags);

  if (tagSet.has("ux") || tagSet.has("product") || tagSet.has("language")) targets.add("ux");
  if (tagSet.has("compute") || tagSet.has("speed")) targets.add("compute");
  if (tagSet.has("safety") || tagSet.has("quality")) targets.add("safety");
  if (tagSet.has("growth") || tagSet.has("hype")) targets.add("market");
  if (tagSet.has("data") || tagSet.has("research")) targets.add("data");
  if (tagSet.has("developer")) targets.add("bug");
  if (tagSet.has("automation") || tagSet.has("agent")) targets.add("automation");

  return [...targets];
}

function appendCostReasons(reasons: string[], cost: ResourceMap = {}, state: GameState): void {
  for (const [resourceId, amount] of Object.entries(cost)) {
    if ((state.resources[resourceId] ?? 0) < amount) {
      const resourceName = resources[resourceId]?.name ?? resourceId;
      reasons.push(`${resourceName} 부족`);
    }
  }
}

function getRequirementReasons(requirements: Record<string, number>, state: GameState): string[] {
  const reasons: string[] = [];

  for (const [requirement, needed] of Object.entries(requirements ?? {})) {
    if (requirement === "min_month" && state.month < needed) reasons.push(`${needed}개월차 필요`);
    if (requirement === "min_products" && state.activeProducts.length < needed) reasons.push(`활성 제품 ${needed}개 필요`);
    if (requirement === "min_trust" && (state.resources.trust ?? 0) < needed) reasons.push(`신뢰 ${needed} 필요`);
    if (requirement.startsWith("min_capability_")) {
      const capabilityId = requirement.replace("min_capability_", "");
      const currentLevel = state.capabilities[capabilityId] ?? 0;
      if (currentLevel < needed) {
        const capabilityName = capabilities.find((capability) => capability.id === capabilityId)?.name ?? capabilityId;
        reasons.push(`${capabilityName} Lv.${needed} 필요`);
      }
    }
  }

  return reasons;
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

function pickResourceEffects(effects: Record<string, number>): ResourceMap {
  return Object.fromEntries(Object.entries(effects).filter(([resourceId]) => Boolean(resources[resourceId])));
}

function negateCosts(costs: ResourceMap): ResourceMap {
  return Object.fromEntries(Object.entries(costs).map(([resourceId, value]) => [resourceId, -value]));
}

function removeFirst(values: string[], target: string): string[] {
  let removed = false;
  return values.filter((value) => {
    if (!removed && value === target) {
      removed = true;
      return false;
    }
    return true;
  });
}

function getReleaseRewardCardIds(product: ProductDefinition, review: ReleaseReview, state: GameState): string[] {
  const availableCards = getUnlockedStrategyCards(state.roguelite.unlockedMetaIds).filter(
    (card) => getRequirementReasons(card.unlock_requirements, state).length === 0,
  );
  const productTags = new Set(product.tags);
  const ownedCounts = getDeckCardCounts(state.roguelite.deck);
  const countById = new Map(ownedCounts.map(({ cardId, count }) => [cardId, count]));
  const gradeBonus = review.score >= 85 ? 4 : review.score >= 70 ? 2 : 0;
  const rankedCards = availableCards
    .map((card) => ({
      card,
      score:
        card.tags.filter((tag) => productTags.has(tag)).length * 14 +
        (card.rarity === "starter" ? 2 : 8) +
        gradeBonus -
        (countById.get(card.id) ?? 0) * 2,
    }))
    .sort((a, b) => b.score - a.score || a.card.id.localeCompare(b.card.id))
    .map(({ card }) => card.id);

  return [...new Set(rankedCards)].slice(0, 3);
}

function getDeckCardCount(cardId: string, deck: StrategyDeckState): number {
  return getDeckCardCounts(deck).find((entry) => entry.cardId === cardId)?.count ?? 0;
}

function getDeckTotalCount(deck: StrategyDeckState): number {
  return deck.hand.length + deck.drawPile.length + deck.discardPile.length + deck.playedThisTurn.length;
}

function removeOneCardFromDeck(cardId: string, deck: StrategyDeckState): StrategyDeckState {
  if (deck.hand.includes(cardId)) {
    return { ...deck, hand: removeFirst(deck.hand, cardId) };
  }
  if (deck.drawPile.includes(cardId)) {
    return { ...deck, drawPile: removeFirst(deck.drawPile, cardId) };
  }
  if (deck.discardPile.includes(cardId)) {
    return { ...deck, discardPile: removeFirst(deck.discardPile, cardId) };
  }
  return { ...deck, playedThisTurn: removeFirst(deck.playedThisTurn, cardId) };
}

function formatCardEffects(effects: Record<string, number>): string {
  return Object.entries(effects)
    .map(([effectId, amount]) => {
      const label = resources[effectId]?.name ?? cardEffectLabels[effectId] ?? effectId;
      const sign = amount >= 0 ? "+" : "";
      return `${label} ${sign}${amount}`;
    })
    .join(", ");
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function getMetaStartingResourceEffects(unlockedMetaIds: string[]): ResourceMap {
  const unlockedSet = new Set(unlockedMetaIds);
  return metaUnlocks
    .filter((unlock) => unlockedSet.has(unlock.id))
    .reduce<ResourceMap>((effects, unlock) => {
      for (const [resourceId, amount] of Object.entries(unlock.starting_resource_effects)) {
        effects[resourceId] = (effects[resourceId] ?? 0) + amount;
      }
      return effects;
    }, {});
}
