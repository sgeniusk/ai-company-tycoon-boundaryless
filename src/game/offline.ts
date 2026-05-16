import { DAYS_PER_MONTH } from "./campaign";
import { calculateMonthlyEconomy, formatResource } from "./simulation";
import type { GameState, ResourceMap } from "./types";

export interface OfflineSettlement {
  elapsedRealDays: number;
  gameDays: number;
  delta: ResourceMap;
  summary: string;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MAX_OFFLINE_GAME_DAYS = 30;

export function calculateOfflineSettlement(state: GameState, savedAt?: Date, now = new Date()): OfflineSettlement {
  const elapsedRealDays = getElapsedRealDays(savedAt, now);
  const gameDays = Math.min(MAX_OFFLINE_GAME_DAYS, elapsedRealDays);

  if (gameDays <= 0 || state.status !== "playing") {
    return {
      elapsedRealDays,
      gameDays: 0,
      delta: {},
      summary: "오프라인 정산 없음",
    };
  }

  const monthly = calculateMonthlyEconomy(state);
  const delta = scaleResourceDelta(monthly.resourceDelta, gameDays / DAYS_PER_MONTH);
  return {
    elapsedRealDays,
    gameDays,
    delta,
    summary: `접속하지 않은 ${elapsedRealDays}일 중 ${gameDays}일치 운영 손익을 반영했습니다.`,
  };
}

export function applyOfflineSettlement(state: GameState, settlement: OfflineSettlement): GameState {
  if (settlement.gameDays <= 0) return state;

  const resources = { ...state.resources };
  for (const [resourceId, amount] of Object.entries(settlement.delta)) {
    resources[resourceId] = (resources[resourceId] ?? 0) + amount;
  }

  return {
    ...state,
    resources,
    timeline: [
      `오프라인 정산: ${settlement.gameDays}일치 · ${formatOfflineDelta(settlement.delta)}`,
      ...state.timeline,
    ].slice(0, 8),
  };
}

function getElapsedRealDays(savedAt: Date | undefined, now: Date): number {
  if (!savedAt || Number.isNaN(savedAt.getTime()) || Number.isNaN(now.getTime())) return 0;
  return Math.max(0, Math.floor((now.getTime() - savedAt.getTime()) / MS_PER_DAY));
}

function scaleResourceDelta(delta: ResourceMap, multiplier: number): ResourceMap {
  const scaled: ResourceMap = {};
  for (const [resourceId, amount] of Object.entries(delta)) {
    const value = amount * multiplier;
    scaled[resourceId] = resourceId === "cash" ? Math.round(value) : Math.round(value * 10) / 10;
  }
  return scaled;
}

function formatOfflineDelta(delta: ResourceMap): string {
  return Object.entries(delta)
    .filter(([, amount]) => amount !== 0)
    .map(([resourceId, amount]) => {
      const sign = amount >= 0 ? "+" : "";
      return `${resourceId === "cash" ? "자금" : resourceId} ${sign}${formatResource(resourceId, amount)}`;
    })
    .join(", ");
}
