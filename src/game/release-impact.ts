import { agentTypes, competitors, products, resources, strategyCards } from "./data";
import type { CompetitorState, GameState, ProductDefinition, ResourceMap, StrategyCardDefinition } from "./types";
import { t } from "../i18n";

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

export interface ReleaseReviewSnippet {
  id: "early-user" | "local-owner" | "market-watcher";
  speaker: string;
  text: string;
  tone: "warm" | "funny" | "watch";
}

export interface ReleaseMomentHighlight {
  id: "card-impact" | "rival-reaction" | "team-reaction";
  label: string;
  title: string;
  detail: string;
  tone: "card" | "rival" | "team";
}

export interface ReleaseNextActionStep {
  id: "reward" | "growth" | "advance";
  label: string;
  detail: string;
  menu: "deck" | "results" | "company";
}

export interface ReleaseImpactSummary {
  headline: string;
  description: string;
  badges: string[];
  resourceHighlights: ReleaseResourceHighlight[];
  cardInfluences: ReleaseCardInfluence[];
  reviewSnippets: ReleaseReviewSnippet[];
  momentHighlights: ReleaseMomentHighlight[];
  nextActionSteps: ReleaseNextActionStep[];
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
    reviewSnippets: getReleaseReviewSnippets(release, product, cardInfluences),
    momentHighlights: getReleaseMomentHighlights(state, product, cardInfluences),
    nextActionSteps: getReleaseNextActionSteps(pendingRewardCount),
    nextAction: pendingRewardCount
      ? "덱 메뉴에서 보상 카드를 고르고, 결과 탭의 성장 분기를 하나 확정하세요."
      : "성장 분기 선택 후 다음 제품이나 경쟁 대응으로 이어가세요.",
  };
}

function getReleaseNextActionSteps(pendingRewardCount: number): ReleaseNextActionStep[] {
  return [
    {
      id: "reward",
      label: "보상 카드 선택",
      detail: pendingRewardCount ? `${pendingRewardCount}장 중 1장으로 이번 런의 색을 정합니다.` : "보상 카드가 없으면 현재 덱으로 다음 선택을 이어갑니다.",
      menu: "deck",
    },
    {
      id: "growth",
      label: "성장 분기 선택",
      detail: "생산성, 신뢰, 연구 중 다음 성장 방향을 확정합니다.",
      menu: "results",
    },
    {
      id: "advance",
      label: "다음 달 진행",
      detail: "새 카드와 성장 방향이 월간 운영에 반영되는지 확인합니다.",
      menu: "company",
    },
  ];
}

function getReleaseReviewSnippets(
  release: NonNullable<GameState["lastRelease"]>,
  product: ProductDefinition | undefined,
  cardInfluences: ReleaseCardInfluence[],
): ReleaseReviewSnippet[] {
  const isStrongLaunch = release.review.score >= 80;
  const cardName = cardInfluences[0]?.cardName;
  const domainHook = getDomainReviewHook(product?.domain);

  return [
    {
      id: "early-user",
      speaker: "초기 사용자",
      text: isStrongLaunch
        ? `${release.productName}, 첫날부터 결과물이 빨라서 유료 버튼을 찾게 됩니다.`
        : `${release.productName}, 아이디어는 보이는데 다음 업데이트가 빨리 필요합니다.`,
      tone: "warm",
    },
    {
      id: "local-owner",
      speaker: "동네 사장님",
      text: domainHook,
      tone: "funny",
    },
    {
      id: "market-watcher",
      speaker: "시장 관찰자",
      text: cardName
        ? `${cardName} 덕분에 출시 서사가 생겼습니다. 이제 경쟁사가 숫자를 확인할 차례입니다.`
        : "카드를 섞어 출시하면 다음 결과표에 플레이어의 손맛이 더 선명하게 남습니다.",
      tone: "watch",
    },
  ];
}

function getDomainReviewHook(domain?: string): string {
  if (domain === "personal_productivity") return "회의가 12분 짧아졌는데, 직원들이 이걸 복지라고 우기기 시작했습니다.";
  if (domain === "developer_tools") return "버그 리포트가 줄어든 건 좋은데 개발자들이 새 기능을 더 많이 요구합니다.";
  if (domain === "customer_support") return "새벽 문의가 조용해졌습니다. 대신 사장님이 대시보드를 계속 새로고침합니다.";
  if (domain === "robotics") return "로봇이 일을 잘해서 박수쳤더니, 옆에서 충전부터 해달라고 합니다.";
  if (domain === "odd_industries") return "이상한 조합인데 손님들이 사진을 찍기 시작했습니다. 위험하지만 맛있습니다.";

  return "처음엔 반신반의했는데, 오늘 매장 앞에서 두 명이 이 제품 이야기만 했습니다.";
}

function getReleaseMomentHighlights(
  state: GameState,
  product: ProductDefinition | undefined,
  cardInfluences: ReleaseCardInfluence[],
): ReleaseMomentHighlight[] {
  const highlights: ReleaseMomentHighlight[] = [];
  const firstCardInfluence = cardInfluences[0];

  if (firstCardInfluence) {
    const visibleCardNames = cardInfluences
      .slice(0, 2)
      .map((influence) => influence.cardName)
      .join(" + ");
    const visibleEffects = cardInfluences
      .slice(0, 2)
      .map((influence) => `${influence.cardName}: ${influence.effects}`)
      .join(" · ");

    highlights.push({
      id: "card-impact",
      label: "카드 체감",
      title: cardInfluences.length > 1 ? "카드 콤보 적용" : `${firstCardInfluence.cardName} 적용`,
      detail: visibleEffects,
      tone: "card",
    });
  }

  const rivalTarget = getLaunchRivalTarget(state, product);
  if (rivalTarget) {
    const definition = competitors.find((competitor) => competitor.id === rivalTarget.id);
    const rivalName = definition ? t(definition.name_key) : rivalTarget.id;
    const domainLabel = product?.domain ? product.domain.replace(/_/g, " ") : "핵심";
    const eventDetail =
      state.currentRivalEvent?.competitor_id === rivalTarget.id
        ? ` · ${t(state.currentRivalEvent.name_key)}`
        : "";

    highlights.push({
      id: "rival-reaction",
      label: "경쟁사 반응",
      title: `${rivalName} 견제`,
      detail: `${rivalName} ${rivalTarget.marketShare}% · ${domainLabel} 대응 준비${eventDetail}`,
      tone: "rival",
    });
  }

  const leadAgent = getLeadLaunchAgent(state);
  if (leadAgent) {
    const energyTone = leadAgent.agent.energy < 35 ? "지친 상태로도" : leadAgent.agent.energy < 60 ? "숨을 고르며" : "들뜬 표정으로";

    highlights.push({
      id: "team-reaction",
      label: "팀 반응",
      title: `${leadAgent.name} 회고`,
      detail: `${leadAgent.name}가 ${energyTone} 다음 업데이트 아이디어를 붙였습니다.`,
      tone: "team",
    });
  }

  return highlights.slice(0, 3);
}

function getLaunchRivalTarget(state: GameState, product: ProductDefinition | undefined): CompetitorState | undefined {
  const eventTarget = state.currentRivalEvent
    ? state.competitorStates.find((competitor) => competitor.id === state.currentRivalEvent?.competitor_id)
    : undefined;
  if (eventTarget) return eventTarget;

  const focusedCompetitors = product
    ? state.competitorStates.filter((competitorState) => {
        const definition = competitors.find((competitor) => competitor.id === competitorState.id);
        return definition?.focus_domains.includes(product.domain);
      })
    : [];
  const candidates = focusedCompetitors.length ? focusedCompetitors : state.competitorStates;

  return [...candidates].sort((left, right) => right.marketShare - left.marketShare || right.score - left.score)[0];
}

function getLeadLaunchAgent(state: GameState) {
  const agent = [...state.hiredAgents].sort((left, right) => right.level - left.level || right.energy - left.energy)[0];
  if (!agent) return undefined;

  const definition = agentTypes.find((agentType) => agentType.id === agent.typeId);

  return {
    agent,
    name: agent.name || definition?.name || "창업팀",
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
