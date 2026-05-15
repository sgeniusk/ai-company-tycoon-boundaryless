import { getGrowthPathObjectives } from "./growth-objectives";
import { getPlayerMarketShare } from "./simulation";
import type { GameState } from "./types";

export interface TenMonthMilestone {
  id: string;
  title: string;
  description: string;
  complete: boolean;
  detail: string;
}

export interface TenMonthArc {
  summary: string;
  progressPercent: number;
  milestones: TenMonthMilestone[];
}

export function getTenMonthArc(state: GameState): TenMonthArc {
  const strategyObjectives = getGrowthPathObjectives(state);
  const completedStrategyObjectives = strategyObjectives.filter((objective) => objective.complete).length;
  const marketShare = getPlayerMarketShare(state);

  const milestones: TenMonthMilestone[] = [
    {
      id: "first_release",
      title: "첫 제품 출시",
      description: "작은 AI 제품 하나를 시장에 내보냅니다.",
      complete: state.activeProducts.length > 0,
      detail: `${state.activeProducts.length}개 출시`,
    },
    {
      id: "strategy_commitment",
      title: "성장 전략 선택",
      description: "생산성, 엔터프라이즈, 연구소 중 회사의 방향을 고릅니다.",
      complete: Boolean(state.chosenGrowthPath),
      detail: state.chosenGrowthPath?.title ?? "미선택",
    },
    {
      id: "strategy_objective",
      title: "전략 목표 1개 완료",
      description: "선택한 전략의 첫 후속 목표를 실제 행동으로 완료합니다.",
      complete: completedStrategyObjectives > 0,
      detail: strategyObjectives.length ? `${completedStrategyObjectives}/${strategyObjectives.length} 완료` : "전략 선택 필요",
    },
    {
      id: "market_foothold",
      title: "시장 교두보 확보",
      description: "이용자나 점유율 중 하나를 의미 있게 끌어올립니다.",
      complete: (state.resources.users ?? 0) >= 1000 || marketShare >= 18,
      detail: `이용자 ${Math.round(state.resources.users ?? 0).toLocaleString("ko-KR")}명 / 점유 ${marketShare}%`,
    },
    {
      id: "month_ten_runway",
      title: "10개월 생존",
      description: "초기 알파 목표인 10개월 경영 루프를 실패 없이 통과합니다.",
      complete: state.month >= 10 && state.status !== "failure",
      detail: `${state.month}개월차 / ${state.status}`,
    },
  ];

  const completedCount = milestones.filter((milestone) => milestone.complete).length;

  return {
    summary: `10개월 MVP 5단계 중 ${completedCount}단계 완료`,
    progressPercent: Math.round((completedCount / milestones.length) * 100),
    milestones,
  };
}
