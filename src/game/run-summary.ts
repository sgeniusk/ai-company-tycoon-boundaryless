import { achievements } from "./data";
import { getTenMonthArc } from "./ten-month-arc";
import type { GameState } from "./types";

export type RunRank = "S" | "A" | "B" | "C" | "D";

export interface RunSummary {
  isFinal: boolean;
  rank: RunRank;
  score: number;
  title: string;
  verdict: string;
  strengths: string[];
  recommendation: string;
}

export function getRunSummary(state: GameState): RunSummary {
  const isFinal = state.status !== "playing" || state.month >= 10;
  const score = getRunScore(state);
  const rank = state.status === "failure" ? "D" : getRank(score);
  const strengths = getRunStrengths(state);

  return {
    isFinal,
    rank,
    score,
    title: getSummaryTitle(rank, isFinal, state.status),
    verdict: getVerdict(rank, state),
    strengths,
    recommendation: getRecommendation(state, rank, strengths),
  };
}

function getRunScore(state: GameState): number {
  const tenMonthArc = getTenMonthArc(state);
  const achievementRatio = achievements.length
    ? (state.unlockedAchievements.length / achievements.length) * 100
    : 0;

  const baseScore =
    tenMonthArc.progressPercent * 0.42 +
    Math.min(30, state.activeProducts.length * 8) +
    Math.min(20, (state.resources.users ?? 0) / 120) +
    getCashScore(state.resources.cash ?? 0) +
    Math.min(15, (state.resources.trust ?? 0) / 5) +
    Math.min(12, (state.resources.automation ?? 0) / 2) +
    achievementRatio * 0.16;

  const statusBonus = state.status === "success" ? 12 : state.status === "failure" ? -18 : 0;
  return Math.round(Math.max(0, Math.min(100, baseScore + statusBonus)));
}

function getCashScore(cash: number): number {
  if (cash >= 0) return Math.min(12, cash / 1500);
  return -Math.min(24, Math.abs(cash) / 500);
}

function getRank(score: number): RunRank {
  if (score >= 88) return "S";
  if (score >= 74) return "A";
  if (score >= 58) return "B";
  if (score >= 40) return "C";
  return "D";
}

function getRunStrengths(state: GameState): string[] {
  const strengths: string[] = [];

  if (state.activeProducts.length >= 2) strengths.push(`제품 포트폴리오 ${state.activeProducts.length}개로 확장`);
  if ((state.resources.users ?? 0) >= 1000) strengths.push(`이용자 ${(state.resources.users ?? 0).toLocaleString("ko-KR")}명 확보`);
  if ((state.resources.trust ?? 0) >= 50) strengths.push("신뢰 지표가 기업 판매권에 진입");
  if ((state.resources.automation ?? 0) >= 10) strengths.push("자동화 기반으로 비용 압박 완화");
  if (state.chosenGrowthPath) strengths.push(`${state.chosenGrowthPath.title} 전략 정체성 확보`);
  if (state.unlockedAchievements.length >= 3) strengths.push(`상용 런 목표 ${state.unlockedAchievements.length}개 완료`);

  return strengths.length ? strengths : ["첫 출시와 비용 안정화가 다음 런의 핵심 과제"];
}

function getSummaryTitle(rank: RunRank, isFinal: boolean, status: GameState["status"]): string {
  if (!isFinal) return "중간 운영 진단";
  if (status === "success") return "상용화 성공 궤도";
  if (status === "failure") return "런 종료: 운영 위기";
  if (rank === "S" || rank === "A") return "10개월 알파 완주";
  return "10개월 근접 완주";
}

function getVerdict(rank: RunRank, state: GameState): string {
  if (state.status === "failure") return "현금과 신뢰가 동시에 무너져 회사를 재정비해야 합니다.";
  if (rank === "S") return "제품, 신뢰, 자동화가 함께 굴러가는 강한 AI 회사가 됐습니다.";
  if (rank === "A") return "핵심 루프는 상용화 수준에 가깝고 다음 런은 확장 속도가 관건입니다.";
  if (rank === "B") return "성장은 보였지만 제품군이나 신뢰 중 한 축이 더 필요합니다.";
  if (rank === "C") return "생존은 가능하나 출시, 연구, 비용 중 병목이 뚜렷합니다.";
  return "초기 운영 루프를 다시 짧게 돌려 첫 제품과 현금 흐름을 안정화해야 합니다.";
}

function getRecommendation(state: GameState, rank: RunRank, strengths: string[]): string {
  if (state.status === "failure") return "다음 런에서는 현금 0원 진입 전에 첫 제품을 출시하고, 신뢰가 낮을 때는 위험한 화제성 선택을 피하세요.";
  if (state.activeProducts.length === 0) return "첫 제품을 출시하면 매달 매출, 이용자, 데이터가 생기고 다음 전략 분기가 열립니다.";
  if ((state.resources.cash ?? 0) < 0) return "성장은 좋지만 현금이 마이너스입니다. 다음 달에는 자동화와 고정비 축소를 먼저 챙기세요.";
  if (!state.chosenGrowthPath) return "최근 출시 결과에서 성장 경로를 하나 선택해 후속 목표와 월간 전략 효과를 확보하세요.";
  if (state.activeProducts.length < 2) return "두 번째 제품 개발을 시작하면 시장 점유와 업적 보상이 함께 열립니다.";
  if ((state.resources.automation ?? 0) < 8) return "자동화 투자를 늘려 월 비용 압박을 줄이면 10개월 이후 성장 속도가 좋아집니다.";
  if (rank === "S" || strengths.length >= 5) return "다음 버전에서는 경쟁사별 카운터 전략과 고급 제품 업그레이드를 붙이면 장기 플레이가 살아납니다.";
  return "전략 후속 목표 두 개를 완료하고 신뢰 50 이상을 유지하면 다음 런 평점이 크게 올라갑니다.";
}
