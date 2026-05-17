import { competitors, growthPaths, products } from "./data";
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
