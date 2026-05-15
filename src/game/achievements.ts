import { achievements, resources } from "./data";
import { getGrowthPathObjectives } from "./growth-objectives";
import type { AchievementConditionDefinition, AchievementStatus, GameState, ResourceMap } from "./types";

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export function getAchievementStatuses(state: GameState): AchievementStatus[] {
  const unlocked = new Set(state.unlockedAchievements ?? []);

  return [...achievements]
    .sort((a, b) => a.order - b.order)
    .map((achievement) => ({
      ...achievement,
      unlocked: unlocked.has(achievement.id),
      ready: achievementConditionMet(achievement.condition, state),
      progressLabel: getAchievementProgressLabel(achievement.condition, state),
    }));
}

export function applyAchievementUnlocks(state: GameState): GameState {
  const unlocked = new Set(state.unlockedAchievements ?? []);
  const newlyUnlocked = getAchievementStatuses(state).filter((achievement) => achievement.ready && !unlocked.has(achievement.id));

  if (newlyUnlocked.length === 0) {
    return state.unlockedAchievements ? state : { ...state, unlockedAchievements: [] };
  }

  const combinedReward = newlyUnlocked.reduce<ResourceMap>(
    (reward, achievement) => mergeResourceDelta(reward, achievement.reward),
    {},
  );

  return {
    ...state,
    resources: applyResourceReward(state.resources, combinedReward),
    unlockedAchievements: [...(state.unlockedAchievements ?? []), ...newlyUnlocked.map((achievement) => achievement.id)],
    timeline: [
      ...newlyUnlocked.map(
        (achievement) => `업적 달성: ${achievement.title} - 보상 ${formatReward(achievement.reward)}`,
      ),
      ...state.timeline,
    ].slice(0, 8),
  };
}

function achievementConditionMet(condition: AchievementConditionDefinition, state: GameState): boolean {
  return Object.entries(condition).every(([key, target]) => {
    if (typeof target !== "number") return false;
    return getConditionProgress(key, state) >= target;
  });
}

function getAchievementProgressLabel(condition: AchievementConditionDefinition, state: GameState): string {
  const entries = Object.entries(condition);
  if (entries.length === 0) return "조건 없음";

  return entries
    .map(([key, target]) => {
      const current = getConditionProgress(key, state);
      return `${conditionLabel(key)} ${Math.min(current, Number(target))}/${target}`;
    })
    .join(" · ");
}

function getConditionProgress(key: string, state: GameState): number {
  if (key === "min_month") return state.month;
  if (key === "min_products") return state.activeProducts.length;
  if (key === "min_capability_upgrades") {
    return Object.values(state.capabilities).reduce((sum, level) => sum + Math.max(0, level - 1), 0);
  }
  if (key === "min_growth_objectives") {
    return getGrowthPathObjectives(state).filter((objective) => objective.complete).length;
  }
  if (key === "min_resolved_events") return state.eventHistory.length + state.rivalEventHistory.length;
  if (key === "min_users") return state.resources.users ?? 0;
  if (key === "min_cash") return state.resources.cash ?? 0;
  return 0;
}

function conditionLabel(key: string): string {
  if (key === "min_month") return "개월";
  if (key === "min_products") return "제품";
  if (key === "min_capability_upgrades") return "연구";
  if (key === "min_growth_objectives") return "전략 목표";
  if (key === "min_resolved_events") return "이슈 대응";
  if (key === "min_users") return "이용자";
  if (key === "min_cash") return "현금";
  return key;
}

function mergeResourceDelta(current: ResourceMap, delta: ResourceMap): ResourceMap {
  const next = { ...current };
  for (const [resourceId, amount] of Object.entries(delta)) {
    next[resourceId] = (next[resourceId] ?? 0) + amount;
  }
  return next;
}

function applyResourceReward(current: ResourceMap, reward: ResourceMap): ResourceMap {
  const next = { ...current };

  for (const [resourceId, amount] of Object.entries(reward)) {
    const definition = resources[resourceId];
    const currentValue = next[resourceId] ?? 0;
    next[resourceId] = definition ? clamp(currentValue + amount, definition.min_value, definition.max_value) : currentValue + amount;
  }

  return next;
}

function formatReward(reward: ResourceMap): string {
  return Object.entries(reward)
    .map(([resourceId, amount]) => {
      const name = resources[resourceId]?.name ?? resourceId;
      return `${name} +${amount.toLocaleString("ko-KR")}`;
    })
    .join(", ");
}
