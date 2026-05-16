import { annualReviews, capabilities, resources } from "./data";
import { getCompanyStarRating, MONTHS_PER_YEAR } from "./campaign";
import type { AnnualReviewDefinition, AnnualReviewHistoryEntry, GameState, ResourceMap } from "./types";

export interface AnnualReviewProgressItem {
  requirement: string;
  label: string;
  current: number;
  target: number;
  currentLabel: string;
  targetLabel: string;
  complete: boolean;
}

export interface AnnualReviewProgress {
  review: AnnualReviewDefinition;
  items: AnnualReviewProgressItem[];
  completed: number;
  total: number;
  progressPercent: number;
}

export interface AnnualReviewResult extends AnnualReviewHistoryEntry {
  passed: boolean;
}

export function getAnnualReviewForMonth(month: number): AnnualReviewDefinition | undefined {
  return annualReviews.find((review) => month <= review.month) ?? annualReviews[annualReviews.length - 1];
}

export function getCurrentAnnualReview(state: GameState): AnnualReviewDefinition {
  return getAnnualReviewForMonth(state.month) ?? annualReviews[0];
}

export function getAnnualReviewProgress(review: AnnualReviewDefinition, state: GameState): AnnualReviewProgress {
  const items = Object.entries(review.requirements).map(([requirement, target]) => {
    const current = getRequirementCurrentValue(requirement, state);
    return {
      requirement,
      label: getRequirementLabel(requirement),
      current,
      target,
      currentLabel: formatRequirementValue(requirement, current),
      targetLabel: formatRequirementValue(requirement, target),
      complete: current >= target,
    };
  });
  const completed = items.filter((item) => item.complete).length;

  return {
    review,
    items,
    completed,
    total: items.length,
    progressPercent: Math.round((completed / Math.max(1, items.length)) * 100),
  };
}

export function getDueAnnualReviewResult(state: GameState): AnnualReviewResult | undefined {
  const review = annualReviews.find((entry) => entry.month === state.month);
  if (!review) return undefined;
  if (state.annualReviewHistory.some((entry) => entry.reviewId === review.id)) return undefined;

  const progress = getAnnualReviewProgress(review, state);
  const passed = progress.completed === progress.total;
  const reward = passed ? review.reward : review.consolation_reward;

  return {
    reviewId: review.id,
    year: review.year,
    month: review.month,
    passed,
    score: progress.progressPercent,
    title: review.title,
    summary: passed
      ? `${review.title} 통과: ${review.spotlight}`
      : `${review.title} 미달: ${progress.completed}/${progress.total}개 목표 달성`,
    reward,
  };
}

export function applyDueAnnualReview(state: GameState): GameState {
  const result = getDueAnnualReviewResult(state);
  if (!result) return state;

  return {
    ...state,
    resources: applyReviewReward(state.resources, result.reward),
    annualReviewHistory: [result, ...state.annualReviewHistory].slice(0, 12),
    timeline: [`연간 심사: ${result.summary}`, ...state.timeline].slice(0, 8),
  };
}

export function getAnnualReviewCountdown(state: GameState): string {
  const review = getCurrentAnnualReview(state);
  const monthsLeft = Math.max(0, review.month - state.month);
  if (monthsLeft === 0) return `${review.year}년차 심사 월`;
  if (monthsLeft >= MONTHS_PER_YEAR) return `${review.year}년차까지 ${monthsLeft}개월`;
  return `${review.title}까지 ${monthsLeft}개월`;
}

function applyReviewReward(resourcesBefore: ResourceMap, reward: ResourceMap): ResourceMap {
  const nextResources = { ...resourcesBefore };
  for (const [resourceId, value] of Object.entries(reward)) {
    const definition = resources[resourceId];
    const nextValue = (nextResources[resourceId] ?? 0) + value;
    nextResources[resourceId] = definition ? Math.max(definition.min_value, Math.min(definition.max_value, nextValue)) : nextValue;
  }
  return nextResources;
}

function getRequirementCurrentValue(requirement: string, state: GameState): number {
  if (requirement === "min_products") return state.activeProducts.length;
  if (requirement === "min_domains") return state.unlockedDomains.length;
  if (requirement === "min_users") return state.resources.users ?? 0;
  if (requirement === "min_hype") return state.resources.hype ?? 0;
  if (requirement === "min_trust") return state.resources.trust ?? 0;
  if (requirement === "min_cash") return state.resources.cash ?? 0;
  if (requirement === "min_data") return state.resources.data ?? 0;
  if (requirement === "min_compute") return state.resources.compute ?? 0;
  if (requirement === "min_automation") return state.resources.automation ?? 0;
  if (requirement === "min_talent") return state.resources.talent ?? 0;
  if (requirement === "min_star") return getCompanyStarRating(state);
  if (requirement.startsWith("min_capability_")) {
    const capabilityId = requirement.replace("min_capability_", "");
    return state.capabilities[capabilityId] ?? 0;
  }
  return 0;
}

function getRequirementLabel(requirement: string): string {
  const labels: Record<string, string> = {
    min_products: "출시 제품",
    min_domains: "해금 분야",
    min_users: "이용자",
    min_hype: "화제성",
    min_trust: "신뢰",
    min_cash: "자금",
    min_data: "데이터",
    min_compute: "연산력",
    min_automation: "자동화",
    min_talent: "인재",
    min_star: "회사 등급",
  };

  if (requirement.startsWith("min_capability_")) {
    const capabilityId = requirement.replace("min_capability_", "");
    return capabilities.find((capability) => capability.id === capabilityId)?.name ?? capabilityId;
  }
  return labels[requirement] ?? requirement;
}

function formatRequirementValue(requirement: string, value: number): string {
  if (requirement === "min_cash") return `₩${Math.round(value).toLocaleString("ko-KR")}`;
  if (requirement === "min_users") return `${Math.round(value).toLocaleString("ko-KR")}명`;
  if (requirement === "min_star") return `${Math.round(value)}성`;
  if (requirement.startsWith("min_capability_")) return `Lv.${Math.round(value)}`;
  return Math.round(value).toLocaleString("ko-KR");
}
