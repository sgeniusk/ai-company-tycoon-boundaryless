import { achievements, competitors, domains, metaUnlocks, products, resources, strategyCards } from "./data";
import { getRunInsightReward } from "./meta-progression";
import { getTenMonthArc } from "./ten-month-arc";
import type { GameState } from "./types";
import { t } from "../i18n";

export type RunRank = "S" | "A" | "B" | "C" | "D";

export interface RunSpotlightProduct {
  id: string;
  name: string;
  grade: string;
  score: number;
  domainName: string;
  quote: string;
}

export interface RunSpotlightCard {
  id: string;
  name: string;
  rarity: string;
  reason: string;
}

export interface RunSpotlightRival {
  id: string;
  name: string;
  marketShare: number;
  pressure: string;
}

export interface RunNextPreview {
  projectedRunNumber: number;
  projectedFounderInsight: number;
  carryovers: string[];
  unlockOptions: string[];
  openingMoves: string[];
}

export interface RunSpotlight {
  bestProduct?: RunSpotlightProduct;
  representativeCard?: RunSpotlightCard;
  rivalPressure?: RunSpotlightRival;
  insightReward: number;
  insightBreakdown: string[];
  failureReasons: string[];
  nextRunHook: string;
  nextRunPreview: RunNextPreview;
}

export interface RunSummary {
  isFinal: boolean;
  rank: RunRank;
  score: number;
  title: string;
  verdict: string;
  strengths: string[];
  recommendation: string;
  spotlight: RunSpotlight;
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
    spotlight: getRunSpotlight(state, rank),
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

function getRunSpotlight(state: GameState, rank: RunRank): RunSpotlight {
  const bestProduct = getBestProduct(state);
  const representativeCard = getRepresentativeCard(state);
  const rivalPressure = getRivalPressure(state, bestProduct?.id);
  const insightReward = getRunInsightReward(state);

  return {
    bestProduct,
    representativeCard,
    rivalPressure,
    insightReward,
    insightBreakdown: getInsightBreakdown(state),
    failureReasons: getFailureReasons(state),
    nextRunHook: getNextRunHook(state, rank, bestProduct, representativeCard),
    nextRunPreview: getNextRunPreview(state, insightReward, bestProduct, representativeCard, rivalPressure),
  };
}

function getBestProduct(state: GameState): RunSpotlightProduct | undefined {
  const reviewedProducts = Object.entries(state.productReviews)
    .map(([productId, review]) => {
      const product = products.find((entry) => entry.id === productId);
      const domain = product ? domains.find((entry) => entry.id === product.domain) : undefined;

      return {
        id: productId,
        name: product?.name ?? state.lastRelease?.productName ?? productId,
        grade: review.grade,
        score: review.score,
        domainName: domain?.name ?? product?.domain ?? "미분류",
        quote: review.quote,
      };
    })
    .sort((a, b) => b.score - a.score);

  if (reviewedProducts[0]) return reviewedProducts[0];

  if (state.lastRelease) {
    const product = products.find((entry) => entry.id === state.lastRelease?.productId);
    const domain = product ? domains.find((entry) => entry.id === product.domain) : undefined;
    return {
      id: state.lastRelease.productId,
      name: state.lastRelease.productName,
      grade: state.lastRelease.review.grade,
      score: state.lastRelease.review.score,
      domainName: domain?.name ?? product?.domain ?? "미분류",
      quote: state.lastRelease.review.quote,
    };
  }

  return undefined;
}

function getRepresentativeCard(state: GameState): RunSpotlightCard | undefined {
  const rewardChoice = state.roguelite.rewardHistory.find((choice) => strategyCards.some((card) => card.id === choice.chosenCardId));
  if (rewardChoice) {
    const card = strategyCards.find((entry) => entry.id === rewardChoice.chosenCardId);
    if (card) return { id: card.id, name: card.name, rarity: card.rarity, reason: "출시 보상으로 회사 색을 바꾼 카드" };
  }

  const upgradedCard = strategyCards.find((card) => state.roguelite.upgradedCardIds.includes(card.id));
  if (upgradedCard) {
    return { id: upgradedCard.id, name: upgradedCard.name, rarity: upgradedCard.rarity, reason: "이번 런에서 강화한 카드" };
  }

  const recentCardId = [...state.roguelite.deck.playedThisTurn, ...state.roguelite.deck.discardPile].reverse()[0] ?? state.roguelite.deck.hand[0];
  const recentCard = strategyCards.find((entry) => entry.id === recentCardId);

  return recentCard
    ? { id: recentCard.id, name: recentCard.name, rarity: recentCard.rarity, reason: "현재 덱에서 가장 눈에 띄는 카드" }
    : undefined;
}

function getRivalPressure(state: GameState, bestProductId?: string): RunSpotlightRival | undefined {
  const matchingRival = bestProductId
    ? state.competitorStates.find((competitor) => competitor.claimedProducts.includes(bestProductId))
    : undefined;
  const strongestRival =
    matchingRival ??
    [...state.competitorStates].sort((a, b) => b.marketShare - a.marketShare || b.score - a.score)[0];
  const definition = competitors.find((entry) => entry.id === strongestRival?.id);

  if (!strongestRival || !definition) return undefined;

  const claimedProduct = products.find((product) => strongestRival.claimedProducts.includes(product.id));
  const move = claimedProduct ? `${claimedProduct.name} 선점` : strongestRival.lastMove;

  return {
    id: strongestRival.id,
    name: t(definition.name_key, "ko"),
    marketShare: strongestRival.marketShare,
    pressure: `${move} · 점유율 ${strongestRival.marketShare}%`,
  };
}

function getInsightBreakdown(state: GameState): string[] {
  const breakdown = [`기본 +1`, `진행 ${Math.floor(state.month / 3)}회 +${Math.floor(state.month / 3)}`];
  if (state.activeProducts.length > 0) breakdown.push(`출시 제품 ${state.activeProducts.length}개 +${state.activeProducts.length}`);
  if ((state.resources.users ?? 0) >= 1500) breakdown.push(`이용자 보너스 +${Math.floor((state.resources.users ?? 0) / 1500)}`);
  if ((state.resources.trust ?? 0) >= 40) breakdown.push(`신뢰 보너스 +${Math.floor((state.resources.trust ?? 0) / 40)}`);
  if (state.status === "success") breakdown.push("성공 보너스 +3");
  if (state.status === "failure") breakdown.push("실패 학습 +1");
  return breakdown;
}

function getFailureReasons(state: GameState): string[] {
  const reasons: string[] = [];

  if ((state.resources.cash ?? 0) <= 0) reasons.push("현금 흐름 붕괴");
  if ((state.resources.trust ?? 0) <= 12) reasons.push("신뢰도 위험");
  if (state.activeProducts.length === 0) reasons.push("출시 제품 없음");
  if (state.month >= 4 && !state.chosenGrowthPath) reasons.push("성장 경로 미확정");
  if (state.productProjects.length === 0 && state.activeProducts.length < 2 && state.month >= 6) reasons.push("후속 제품 공백");

  return reasons.length ? reasons : ["치명적 실패 원인은 없지만 성장 속도가 부족함"];
}

function getNextRunHook(
  state: GameState,
  rank: RunRank,
  bestProduct?: RunSpotlightProduct,
  card?: RunSpotlightCard,
): string {
  if (state.status === "failure") return "다음 런은 첫 출시를 앞당기고 현금 0원 이전에 자동화나 신뢰 회복을 챙기는 짧은 복구 런으로 시작하세요.";
  if (bestProduct && card) return `다음 런은 ${bestProduct.name}의 강점과 ${card.name} 카드를 더 일찍 묶어 같은 전략을 빠르게 재현해볼 만합니다.`;
  if (bestProduct) return `다음 런은 ${bestProduct.name}을 기준점으로 삼고 두 번째 제품을 더 빨리 붙이면 점수가 크게 오릅니다.`;
  if (rank === "S" || rank === "A") return "다음 런은 다른 산업 도메인으로 넘어가 경쟁사 카운터 덱을 실험해도 됩니다.";
  return "다음 런은 첫 제품, 첫 카드 사용, 첫 성장 경로 선택을 5개월 안에 묶는 것이 목표입니다.";
}

function getNextRunPreview(
  state: GameState,
  insightReward: number,
  bestProduct?: RunSpotlightProduct,
  card?: RunSpotlightCard,
  rival?: RunSpotlightRival,
): RunNextPreview {
  const projectedFounderInsight = state.roguelite.founderInsight + insightReward;
  const carryovers = [
    `창업 통찰 ${projectedFounderInsight} 보유`,
    `런 ${state.roguelite.runNumber + 1} 시작`,
    ...getUnlockedMetaCarryovers(state),
  ].slice(0, 4);
  const unlockOptions = metaUnlocks
    .filter((unlock) => !state.roguelite.unlockedMetaIds.includes(unlock.id))
    .filter((unlock) => unlock.cost <= projectedFounderInsight)
    .slice(0, 3)
    .map((unlock) => `${unlock.title} 해금 가능 · 비용 ${unlock.cost}`);

  return {
    projectedRunNumber: state.roguelite.runNumber + 1,
    projectedFounderInsight,
    carryovers,
    unlockOptions: unlockOptions.length ? unlockOptions : ["이번 통찰은 저장하고 다음 런 보너스 선택지를 기다리기"],
    openingMoves: getNextOpeningMoves(state, bestProduct, card, rival),
  };
}

function getUnlockedMetaCarryovers(state: GameState): string[] {
  return state.roguelite.unlockedMetaIds
    .map((metaId) => metaUnlocks.find((unlock) => unlock.id === metaId))
    .filter((unlock): unlock is NonNullable<typeof unlock> => Boolean(unlock))
    .map((unlock) => {
      const effects = Object.entries(unlock.starting_resource_effects)
        .map(([resourceId, amount]) => `${resources[resourceId]?.name ?? resourceId} +${amount}`)
        .join(", ");
      return effects ? `${unlock.title}: ${effects}` : unlock.title;
    });
}

function getNextOpeningMoves(
  state: GameState,
  bestProduct?: RunSpotlightProduct,
  card?: RunSpotlightCard,
  rival?: RunSpotlightRival,
): string[] {
  if (state.status === "failure") {
    return ["첫 제품을 3개월 안에 출시", "현금 0원 이전에 비용 절감 선택", "신뢰가 낮으면 위험 이벤트 회피"];
  }

  return [
    bestProduct ? `${bestProduct.name} 계열 제품을 초반 기준점으로 잡기` : "첫 제품을 즉시 개발 시작",
    card ? `${card.name} 카드를 첫 개발 이슈 전에 사용` : "손패에서 개발 보정 카드를 먼저 확인",
    rival ? `${rival.name} 압박을 보고 카운터 제품 준비` : "첫 출시 후 경쟁사 점유율 확인",
  ];
}
