import { resources } from "../game/data";
import { formatResource } from "../game/simulation";
import type { GameState, ResourceMap } from "../game/types";

export function statusLabel(status: GameState["status"]): string {
  if (status === "success") return "성공 궤도";
  if (status === "failure") return "위기";
  return "운영 중";
}

export function statLabel(stat: string): string {
  const labels: Record<string, string> = {
    research: "연구",
    engineering: "개발",
    product: "제품",
    growth: "성장",
    safety: "안전",
    operations: "운영",
    creativity: "창의",
    autonomy: "자율",
  };
  return labels[stat] ?? stat;
}

export function itemCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    office: "사무실",
    equipment: "장비",
    research: "연구",
    safety: "안전",
    marketing: "마케팅",
  };
  return labels[category] ?? category;
}

export function itemTargetLabel(target: string): string {
  const labels: Record<string, string> = {
    agent: "에이전트",
    office: "사무실",
    company: "회사",
  };
  return labels[target] ?? target;
}

export function formatCost(cost: ResourceMap): string {
  return Object.entries(cost)
    .map(([resourceId, value]) => `${resources[resourceId]?.name ?? resourceId} ${formatResource(resourceId, value)}`)
    .join(", ");
}

export function formatEffects(effects: Record<string, number>): string {
  const effectLabels: Record<string, string> = {
    project_progress: "개발 진행",
    project_quality: "완성도",
    puzzle_score_bonus: "퍼즐 점수",
    puzzle_difficulty_delta: "퍼즐 난이도",
    puzzle_tile_limit: "퍼즐 선택",
    rival_score_delta: "경쟁 위협",
    rival_momentum_delta: "경쟁 모멘텀",
  };

  return Object.entries(effects)
    .map(([key, value]) => {
      const sign = value >= 0 ? "+" : "";
      return `${resources[key]?.name ?? effectLabels[key] ?? statLabel(key)} ${sign}${value}`;
    })
    .join(", ");
}
