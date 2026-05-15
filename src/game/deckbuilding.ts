import { capabilities, metaUnlocks, resources, strategyCards } from "./data";
import type { ActionCheck, GameState, ResourceMap, RogueliteState, StrategyCardDefinition, StrategyDeckState } from "./types";

const handLimit = 7;
const cardEffectLabels: Record<string, string> = {
  project_progress: "개발 진행",
  project_quality: "완성도",
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

  const resourcesAfterCost = applyResourceDelta(state.resources, negateCosts(card.cost));
  const resourcesAfterEffects = applyResourceDelta(resourcesAfterCost, pickResourceEffects(card.effects));
  const projectProgress = card.effects.project_progress ?? 0;
  const projectQuality = card.effects.project_quality ?? 0;
  const targetProjectId = state.productProjects[0]?.id;
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
    roguelite: {
      ...state.roguelite,
      deck: {
        ...state.roguelite.deck,
        hand: removeFirst(state.roguelite.deck.hand, card.id),
        discardPile: [...state.roguelite.deck.discardPile, card.id],
        playedThisTurn: [...state.roguelite.deck.playedThisTurn, card.id],
      },
    },
    timeline: [`카드 사용: ${card.name} (${formatCardEffects(card.effects)})`, ...state.timeline].slice(0, 8),
  };
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
  return Boolean(card.effects.project_progress || card.effects.project_quality);
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
