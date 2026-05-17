import { products, resources, strategyCards } from "./data";
import type { GameState, ResourceMap, StrategyCardDefinition } from "./types";

export interface ReleaseResourceHighlight {
  resourceId: string;
  label: string;
  amount: number;
}

export interface ReleaseCardInfluence {
  cardId: string;
  cardName: string;
  effects: string;
}

export interface ReleaseImpactSummary {
  headline: string;
  description: string;
  badges: string[];
  resourceHighlights: ReleaseResourceHighlight[];
  cardInfluences: ReleaseCardInfluence[];
  nextAction: string;
}

const releaseEffectLabels: Record<string, string> = {
  project_progress: "개발 진행",
  project_quality: "완성도",
  puzzle_score_bonus: "퍼즐 점수",
  puzzle_difficulty_delta: "퍼즐 난이도",
  puzzle_tile_limit: "퍼즐 선택",
  trust: "신뢰",
  hype: "화제성",
  users: "이용자",
  data: "데이터",
  automation: "자동화",
  rival_score_delta: "경쟁 위협",
  rival_momentum_delta: "경쟁 모멘텀",
};

export function getReleaseImpactSummary(state: GameState): ReleaseImpactSummary | undefined {
  const release = state.lastRelease;
  if (!release) return undefined;

  const product = [...products, ...(state.generatedProducts ?? [])].find((entry) => entry.id === release.productId);
  const cardInfluences = getReleaseCardInfluences(state);
  const pendingRewardCount = state.roguelite.pendingCardReward?.offeredCardIds.length ?? 0;
  const isFirstLaunch = state.activeProducts.length <= 1;
  const badges = [
    isFirstLaunch ? "첫 5분 보상" : "출시 보상",
    pendingRewardCount ? `카드 보상 ${pendingRewardCount}장` : "카드 보상 대기",
    cardInfluences.length ? "카드 영향" : "기본 출시",
  ];

  return {
    headline: isFirstLaunch ? "첫 출시가 회사의 첫 팬층을 만들었습니다" : `${release.productName} 출시 충격`,
    description:
      release.review.score >= 80
        ? "이번 출시 성적은 성장 분기와 덱 보상을 동시에 열어 다음 선택의 맛을 키웁니다."
        : "출시는 완료됐지만 다음 업데이트와 카드 보강으로 평판을 끌어올려야 합니다.",
    badges,
    resourceHighlights: [
      {
        resourceId: "hype",
        label: resources.hype?.name ?? "화제성",
        amount: product?.hype_on_launch ?? 0,
      },
      {
        resourceId: "trust",
        label: resources.trust?.name ?? "신뢰",
        amount: release.review.score >= 82 ? 2 : 0,
      },
      {
        resourceId: "users",
        label: resources.users?.name ?? "이용자",
        amount: product?.base_users_per_month ?? 0,
      },
    ],
    cardInfluences,
    nextAction: pendingRewardCount
      ? "덱 메뉴에서 보상 카드를 고르고, 결과 탭의 성장 분기를 하나 확정하세요."
      : "성장 분기 선택 후 다음 제품이나 경쟁 대응으로 이어가세요.",
  };
}

function getReleaseCardInfluences(state: GameState): ReleaseCardInfluence[] {
  const recentCardIds = unique([
    ...state.roguelite.deck.playedThisTurn,
    ...state.roguelite.deck.discardPile.slice().reverse(),
  ]);

  return recentCardIds
    .map((cardId) => strategyCards.find((card) => card.id === cardId))
    .filter((card): card is StrategyCardDefinition => Boolean(card))
    .filter((card) => hasReleaseVisibleEffect(card.effects))
    .map((card) => ({
      cardId: card.id,
      cardName: card.name,
      effects: formatReleaseEffects(card.effects),
    }))
    .slice(0, 3);
}

function hasReleaseVisibleEffect(effects: ResourceMap): boolean {
  return Boolean(
    effects.project_progress ||
      effects.project_quality ||
      effects.puzzle_score_bonus ||
      effects.trust ||
      effects.hype ||
      effects.users ||
      effects.rival_score_delta ||
      effects.rival_momentum_delta,
  );
}

function formatReleaseEffects(effects: ResourceMap): string {
  return Object.entries(effects)
    .filter(([effectId]) => effectId in releaseEffectLabels)
    .map(([effectId, value]) => `${releaseEffectLabels[effectId]} ${value > 0 ? "+" : ""}${value}`)
    .join(" · ");
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}
