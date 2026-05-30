import {
  getEndingAxisCoverageSummary,
  getEndingCollectionSummary,
  type EndingAxisCoverageSummary,
} from "./campaign-ending";
import type { GameState } from "./types";

export interface BetaReadinessAxisSummary extends EndingAxisCoverageSummary {
  detail: string;
}

export interface BetaReadinessCheck {
  id: "ending_routes" | "reward_pool" | "unlock_guidance" | "route_coverage" | "target_replay" | "route_quick_start";
  label: string;
  detail: string;
  complete: boolean;
}

export interface BetaReadinessSummary {
  title: string;
  endingTotal: number;
  replayableTotal: number;
  resultOnlyTotal: number;
  codexProgressLabel: string;
  rewardProgressLabel: string;
  codexStatusLabel: string;
  lockedReplayableLabel: string;
  unlockHintCount: number;
  unlockHintEligibleCount: number;
  unlockHintCoveragePercent: number;
  unlockHintLabel: string;
  routeAxisCount: number;
  routeAxisTotal: number;
  routeAxisLabel: string;
  routeOptionCount: number;
  routeOptionTotal: number;
  routeOptionLabel: string;
  nextTargetLabel: string;
  axes: BetaReadinessAxisSummary[];
  checks: BetaReadinessCheck[];
  completeCheckCount: number;
  totalCheckCount: number;
  readinessPercent: number;
  statusLabel: string;
}

const minimumBetaEndingRoutes = 24;

export function getBetaReadinessSummary(state: Pick<GameState, "roguelite">): BetaReadinessSummary {
  const endingCollectionSummary = getEndingCollectionSummary(state);
  const axes = getEndingAxisCoverageSummary().map((axis) => ({
    ...axis,
    detail: axis.complete ? `${axis.covered}/${axis.total}` : `${axis.covered}/${axis.total} · 남은 ${axis.missingLabels.slice(0, 2).join(" / ")}`,
  }));
  const routeAxisCount = axes.filter((axis) => axis.complete).length;
  const routeAxisTotal = axes.length;
  const routeOptionCount = axes.reduce((total, axis) => total + axis.covered, 0);
  const routeOptionTotal = axes.reduce((total, axis) => total + axis.total, 0);
  const nextTargetLabel = endingCollectionSummary.nextReplayPlan?.title ?? "모든 목표 엔딩 발견";
  const nextTargetRouteLabel =
    endingCollectionSummary.nextReplayPlan?.targetLabels.slice(0, 3).join(" / ") ?? "모든 목표 엔딩 발견";
  const resultOnlyTotal = Math.max(0, endingCollectionSummary.totalCount - endingCollectionSummary.replayableCount);
  const checks: BetaReadinessCheck[] = [
    {
      id: "ending_routes",
      label: "엔딩 루트",
      detail: `${endingCollectionSummary.totalCount} 결말 · ${endingCollectionSummary.replayableCount} 목표 · ${resultOnlyTotal} 결과 전용`,
      complete: endingCollectionSummary.totalCount >= minimumBetaEndingRoutes && endingCollectionSummary.replayableCount > 0,
    },
    {
      id: "reward_pool",
      label: "도감 보상",
      detail: `${endingCollectionSummary.discoveredRewardBonus}/${endingCollectionSummary.totalRewardBonus} 통찰 · 목표 엔딩 ${endingCollectionSummary.lockedReplayableCount}개 남음`,
      complete: endingCollectionSummary.totalRewardBonus >= endingCollectionSummary.replayableCount && endingCollectionSummary.lockedRewardBonus >= 0,
    },
    {
      id: "unlock_guidance",
      label: "해금 안내",
      detail: `${endingCollectionSummary.unlockHintCount}/${endingCollectionSummary.unlockHintEligibleCount} · ${endingCollectionSummary.unlockHintCoveragePercent}%`,
      complete:
        endingCollectionSummary.unlockHintEligibleCount > 0 &&
        endingCollectionSummary.unlockHintCount === endingCollectionSummary.unlockHintEligibleCount &&
        endingCollectionSummary.unlockHintCoveragePercent === 100,
    },
    {
      id: "route_coverage",
      label: "루트 커버리지",
      detail: `${routeAxisCount}/${routeAxisTotal} 축 · ${routeOptionCount}/${routeOptionTotal} 옵션`,
      complete: routeAxisTotal > 0 && routeAxisCount === routeAxisTotal && routeOptionCount === routeOptionTotal,
    },
    {
      id: "target_replay",
      label: "목표 런",
      detail: nextTargetLabel,
      complete: Boolean(endingCollectionSummary.nextReplayPlan) || endingCollectionSummary.lockedReplayableCount === 0,
    },
    {
      id: "route_quick_start",
      label: "원클릭 목표 런",
      detail: nextTargetRouteLabel,
      complete: Boolean(endingCollectionSummary.nextReplayPlan?.selection?.seed) || endingCollectionSummary.lockedReplayableCount === 0,
    },
  ];
  const completeCheckCount = checks.filter((check) => check.complete).length;
  const statusLabel = completeCheckCount === checks.length ? "준비 완료" : "점검 필요";

  return {
    title: "v0.67 멀티 엔딩 준비도",
    endingTotal: endingCollectionSummary.totalCount,
    replayableTotal: endingCollectionSummary.replayableCount,
    resultOnlyTotal,
    codexProgressLabel: `${endingCollectionSummary.discoveredCount}/${endingCollectionSummary.totalCount}`,
    rewardProgressLabel: `${endingCollectionSummary.discoveredRewardBonus}/${endingCollectionSummary.totalRewardBonus}`,
    codexStatusLabel: `도감 ${endingCollectionSummary.discoveredCount}/${endingCollectionSummary.totalCount} · 보상 ${endingCollectionSummary.discoveredRewardBonus}/${endingCollectionSummary.totalRewardBonus}`,
    lockedReplayableLabel: `목표 엔딩 ${endingCollectionSummary.lockedReplayableCount}개 남음`,
    unlockHintCount: endingCollectionSummary.unlockHintCount,
    unlockHintEligibleCount: endingCollectionSummary.unlockHintEligibleCount,
    unlockHintCoveragePercent: endingCollectionSummary.unlockHintCoveragePercent,
    unlockHintLabel: `${endingCollectionSummary.unlockHintCount}/${endingCollectionSummary.unlockHintEligibleCount}`,
    routeAxisCount,
    routeAxisTotal,
    routeAxisLabel: `${routeAxisCount}/${routeAxisTotal}`,
    routeOptionCount,
    routeOptionTotal,
    routeOptionLabel: `${routeOptionCount}/${routeOptionTotal}`,
    nextTargetLabel,
    axes,
    checks,
    completeCheckCount,
    totalCheckCount: checks.length,
    readinessPercent: checks.length ? Math.round((completeCheckCount / checks.length) * 100) : 100,
    statusLabel,
  };
}
