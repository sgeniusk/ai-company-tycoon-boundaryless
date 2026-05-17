import { competitors, domains, growthPaths, products, strategyCards } from "./data";
import { getCampaignCalendar, MONTHS_PER_YEAR } from "./campaign";
import type { GameState } from "./types";
import { t } from "../i18n";

export type CompetitionSignalSeverity = "contested" | "strategic" | "watch" | "low";

export interface GrowthPathCompetitionSignal {
  competitorId: string;
  severity: CompetitionSignalSeverity;
  label: string;
  reason: string;
  overlappingDomains: string[];
  claimedOverlapCount: number;
}

export interface CompetitionSeasonEntrant {
  id: string;
  name: string;
  entryMonth: number;
  tier: string;
  focusDomains: string[];
}

export interface CompetitionSeasonPressure {
  competitorId: string;
  competitorName: string;
  marketShare: number;
  score: number;
  lastMove: string;
}

export interface CompetitionSeasonBrief {
  title: string;
  summary: string;
  recentEntrants: CompetitionSeasonEntrant[];
  nextEntrants: CompetitionSeasonEntrant[];
  topPressure?: CompetitionSeasonPressure;
}

export interface CompetitionSeasonChallenge {
  id: "pressure_counter" | "new_entrant_watch";
  title: string;
  description: string;
  targetMenu: "competition" | "products" | "deck" | "research";
  rewardPreview: string;
  riskPreview: string;
  complete: boolean;
  relatedCompetitorIds: string[];
  recommendedProductIds: string[];
  recommendedCardIds: string[];
}

export function getGrowthPathCompetitionSignals(state: GameState): GrowthPathCompetitionSignal[] {
  const path = growthPaths.find((entry) => entry.id === state.chosenGrowthPath?.id);
  const targetDomains = new Set(
    (path?.recommended_product_ids ?? [])
      .map((productId) => products.find((product) => product.id === productId)?.domain)
      .filter((domain): domain is string => Boolean(domain)),
  );

  return state.competitorStates.map((competitorState) => {
    const competitor = competitors.find((entry) => entry.id === competitorState.id);
    const overlappingDomains = competitor?.focus_domains.filter((domainId) => targetDomains.has(domainId)) ?? [];
    const claimedOverlapCount = competitorState.claimedProducts.filter((productId) => {
      const product = products.find((entry) => entry.id === productId);
      return product ? targetDomains.has(product.domain) : false;
    }).length;

    if (claimedOverlapCount > 0) {
      return {
        competitorId: competitorState.id,
        severity: "contested",
        label: "선점 충돌",
        reason: "선택한 성장 경로의 제품 공간을 이미 선점했습니다.",
        overlappingDomains,
        claimedOverlapCount,
      };
    }

    if (overlappingDomains.length > 0) {
      return {
        competitorId: competitorState.id,
        severity: "strategic",
        label: "전략 충돌",
        reason: "선택한 성장 경로와 같은 시장을 주시하고 있습니다.",
        overlappingDomains,
        claimedOverlapCount,
      };
    }

    if (competitorState.lastMove.includes("준비") || competitorState.lastMove.includes("관찰")) {
      return {
        competitorId: competitorState.id,
        severity: "watch",
        label: "관찰 필요",
        reason: "직접 충돌은 아니지만 다음 움직임을 준비 중입니다.",
        overlappingDomains,
        claimedOverlapCount,
      };
    }

    return {
      competitorId: competitorState.id,
      severity: "low",
      label: "간접 경쟁",
      reason: "현재 선택한 성장 경로와 직접 겹치는 시장은 적습니다.",
      overlappingDomains,
      claimedOverlapCount,
    };
  });
}

export function getCompetitionSeasonBrief(state: GameState): CompetitionSeasonBrief {
  const calendar = getCampaignCalendar(state);
  const seasonStart = (calendar.year - 1) * MONTHS_PER_YEAR + 1;
  const seasonEnd = calendar.year * MONTHS_PER_YEAR;
  const activeCompetitorIds = new Set(state.competitorStates.map((competitor) => competitor.id));
  const recentEntrants = competitors
    .filter((competitor) => {
      const entryMonth = getCompetitorEntryMonth(competitor);
      return activeCompetitorIds.has(competitor.id) && entryMonth >= seasonStart && entryMonth <= state.month && entryMonth > 1;
    })
    .map(toSeasonEntrant)
    .sort(sortEntrantsBySchedule);
  const nextEntrants = competitors
    .filter((competitor) => getCompetitorEntryMonth(competitor) > state.month)
    .map(toSeasonEntrant)
    .sort(sortEntrantsBySchedule)
    .slice(0, 3);
  const topPressure = [...state.competitorStates]
    .sort((a, b) => b.marketShare - a.marketShare || b.score - a.score)
    .map((competitorState) => {
      const competitor = competitors.find((entry) => entry.id === competitorState.id);
      return {
        competitorId: competitorState.id,
        competitorName: competitor ? t(competitor.name_key) : competitorState.id,
        marketShare: competitorState.marketShare,
        score: Math.round(competitorState.score),
        lastMove: competitorState.lastMove,
      };
    })[0];
  const comingThisYear = nextEntrants.filter((entrant) => entrant.entryMonth <= seasonEnd).length;
  const recentSummary = recentEntrants.length ? `신규 경쟁사 ${recentEntrants.length}곳` : "신규 진입 없음";
  const nextSummary = comingThisYear ? `올해 추가 진입 ${comingThisYear}곳 예고` : nextEntrants.length ? `${nextEntrants[0].entryMonth}개월차 다음 파동 예고` : "남은 예정 경쟁사 없음";
  const pressureSummary = topPressure ? `최대 압박 ${topPressure.competitorName} 점유 ${topPressure.marketShare}%` : "시장 압박 없음";

  return {
    title: `${calendar.year}년차 경쟁 시즌`,
    summary: `${recentSummary} · ${nextSummary} · ${pressureSummary}`,
    recentEntrants,
    nextEntrants,
    topPressure,
  };
}

export function getCompetitionSeasonChallenges(state: GameState): CompetitionSeasonChallenge[] {
  const brief = getCompetitionSeasonBrief(state);
  const challenges: CompetitionSeasonChallenge[] = [];

  if (brief.topPressure) {
    const pressureCompetitor = competitors.find((competitor) => competitor.id === brief.topPressure?.competitorId);
    const recommendedProductIds = getRecommendedProductsForDomains(pressureCompetitor?.focus_domains ?? [], state);
    const recommendedCardIds = getCounterCardIds(pressureCompetitor?.focus_domains ?? []);
    const complete = hasActiveProductInDomains(state, pressureCompetitor?.focus_domains ?? []) || hasPlayedCounterCard(state, recommendedCardIds);

    challenges.push({
      id: "pressure_counter",
      title: `${brief.topPressure.competitorName} 압박 대응`,
      description: `${brief.topPressure.lastMove} 흐름을 끊기 위해 겹치는 제품군이나 대응 카드를 준비합니다.`,
      targetMenu: "competition",
      rewardPreview: `대응 카드 ${formatCardNames(recommendedCardIds)} 우선 확보, 시장 점유율 방어`,
      riskPreview: "방치하면 경쟁사가 핵심 제품군을 더 빠르게 선점합니다.",
      complete,
      relatedCompetitorIds: [brief.topPressure.competitorId],
      recommendedProductIds,
      recommendedCardIds,
    });
  }

  if (brief.recentEntrants.length > 0) {
    const entrantDomains = [...new Set(brief.recentEntrants.flatMap((entrant) => entrant.focusDomains))];
    const recommendedProductIds = getRecommendedProductsForDomains(entrantDomains, state);
    const recommendedCardIds = getCounterCardIds(entrantDomains);

    challenges.push({
      id: "new_entrant_watch",
      title: "신규 경쟁자 파동 대응",
      description: `${brief.recentEntrants.map((entrant) => entrant.name).join(", ")} 진입으로 새 시장 파동이 시작됐습니다.`,
      targetMenu: recommendedProductIds.length ? "products" : "competition",
      rewardPreview: "신규 시장 선점 보너스와 다음 연간 심사 안정성",
      riskPreview: "새 경쟁사가 후반 산업의 첫 인상을 가져갑니다.",
      complete: hasActiveProductInDomains(state, entrantDomains),
      relatedCompetitorIds: brief.recentEntrants.map((entrant) => entrant.id),
      recommendedProductIds,
      recommendedCardIds,
    });
  }

  return challenges;
}

function getCompetitorEntryMonth(competitor: { entry_month?: number }): number {
  return competitor.entry_month ?? 1;
}

function toSeasonEntrant(competitor: (typeof competitors)[number]): CompetitionSeasonEntrant {
  return {
    id: competitor.id,
    name: t(competitor.name_key),
    entryMonth: getCompetitorEntryMonth(competitor),
    tier: competitor.rival_tier ?? "initial",
    focusDomains: competitor.focus_domains,
  };
}

function sortEntrantsBySchedule(a: CompetitionSeasonEntrant, b: CompetitionSeasonEntrant): number {
  return a.entryMonth - b.entryMonth || competitors.findIndex((competitor) => competitor.id === a.id) - competitors.findIndex((competitor) => competitor.id === b.id);
}

function hasActiveProductInDomains(state: GameState, domainIds: string[]): boolean {
  return products.some((product) => domainIds.includes(product.domain) && state.activeProducts.includes(product.id));
}

function hasPlayedCounterCard(state: GameState, cardIds: string[]): boolean {
  return state.roguelite.deck.playedThisTurn.some((cardId) => cardIds.includes(cardId));
}

function getRecommendedProductsForDomains(domainIds: string[], state: GameState): string[] {
  const uniqueDomains = new Set(domainIds.filter((domainId) => domains.some((domain) => domain.id === domainId)));

  return products
    .filter((product) => uniqueDomains.has(product.domain) && !state.activeProducts.includes(product.id))
    .sort((a, b) => a.level - b.level || a.name.localeCompare(b.name))
    .map((product) => product.id)
    .slice(0, 3);
}

function getCounterCardIds(domainIds: string[]): string[] {
  const desiredTags = new Set(["counter", ...domainIds]);

  return strategyCards
    .filter((card) => card.tags.includes("counter") || Boolean(card.effects.rival_score_delta || card.effects.rival_momentum_delta))
    .map((card) => ({
      card,
      score:
        card.tags.filter((tag) => desiredTags.has(tag)).length * 8 +
        Math.abs(card.effects.rival_score_delta ?? 0) +
        Math.abs(card.effects.rival_momentum_delta ?? 0) * 3,
    }))
    .sort((a, b) => b.score - a.score || a.card.name.localeCompare(b.card.name))
    .map(({ card }) => card.id)
    .slice(0, 3);
}

function formatCardNames(cardIds: string[]): string {
  const names = cardIds
    .map((cardId) => strategyCards.find((card) => card.id === cardId)?.name)
    .filter((name): name is string => Boolean(name));
  return names.length ? names.join(", ") : "없음";
}
