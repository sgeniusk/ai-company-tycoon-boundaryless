import { metaUnlocks, resources } from "./data";
import { createInitialRogueliteState, getMetaStartingResourceEffects } from "./deckbuilding";
import { createInitialState } from "./simulation";
import type { ActionCheck, GameState, MetaUnlockDefinition, ResourceMap } from "./types";

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
  let availableInsight = previousRoguelite.founderInsight + getRunInsightReward(state);
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
    }),
    timeline: [
      `새 런 시작: 창업 통찰 ${availableInsight} 보유${newlyUnlocked.length ? `, 해금 ${newlyUnlocked.join(", ")}` : ""}`,
      ...nextState.timeline,
    ].slice(0, 8),
  };
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
