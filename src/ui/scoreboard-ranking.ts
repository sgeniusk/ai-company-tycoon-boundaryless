// 전국 AI 기업 랭킹 전광판을 GameState에서 파생하는 읽기 전용 모듈 (상태 불변).
import type { GameState } from "../game/types";
import { getMarketRankings, getPlayerMarketShare } from "../game/simulation";
import { getRivalCounterPlans } from "../game/rival-counters";
import { getCampaignCalendar } from "../game/campaign";
import { getGuidanceStep } from "../game/guidance";

export interface NationalRanking {
  rank: number; // 1 = 전국 1위 (낮을수록 좋음)
  total: number; // 전국 AI 기업 수 (N사)
  delta: number; // 전월 대비 순위 변화 (양수 = 상승 ▲, 음수 = 하락 ▼, 0 = 유지)
  marketShare: number; // 0–100, 플레이어 시장 점유율
}

// 시장 점유율(절대 강함)과 알려진 경쟁권 내 순위(상대 우위)를 합쳐 0–1 standing 으로.
const SHARE_WEIGHT = 0.65;
const LEAD_WEIGHT = 0.35;
// 상위 구간을 압축해 #1 도달은 압도적 지배를 요구하되, 초반 성장은 순위가 크게 움직이게.
const RANK_CURVE_GAMMA = 1.6;
// 전국 필드는 캠페인이 진행될수록 천천히 커진다(살아있는 생태계 연출).
const NATIONAL_FIELD_BASE = 2140;
const NATIONAL_FIELD_GROWTH_PER_MONTH = 4;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function standingFrom(share01: number, lead01: number): number {
  return clamp(SHARE_WEIGHT * share01 + LEAD_WEIGHT * lead01, 0, 1);
}

function nationalRankFor(standing: number, total: number): number {
  const placement = Math.pow(1 - standing, RANK_CURVE_GAMMA);
  return clamp(Math.round(placement * (total - 1)) + 1, 1, total);
}

function nationalFieldSize(state: GameState): number {
  const { currentMonth } = getCampaignCalendar(state);
  return NATIONAL_FIELD_BASE + Math.max(0, currentMonth - 1) * NATIONAL_FIELD_GROWTH_PER_MONTH;
}

function playerStanding(state: GameState): number {
  const rankings = getMarketRankings(state);
  const playerIndex = Math.max(0, rankings.findIndex((entry) => entry.isPlayer));
  const fieldSize = rankings.length;
  const share01 = getPlayerMarketShare(state) / 100;
  const lead01 = fieldSize <= 1 ? 1 : (fieldSize - playerIndex - 1) / (fieldSize - 1);
  return standingFrom(share01, lead01);
}

export function deriveNationalRanking(state: GameState): NationalRanking {
  const total = nationalFieldSize(state);
  const rank = nationalRankFor(playerStanding(state), total);

  let delta = 0;
  const history = Array.isArray(state.marketShareHistory) ? state.marketShareHistory : [];
  if (history.length >= 2) {
    const last = history[history.length - 1];
    const prev = history[history.length - 2];
    // 히스토리는 로컬 순위를 저장하지 않으므로 상위 라이벌 대비 우열로 lead 를 근사.
    const histLead = (entry: { player: number; topRivalShare: number }) =>
      entry.player >= entry.topRivalShare ? 0.8 : 0.2;
    const curRank = nationalRankFor(standingFrom(last.player / 100, histLead(last)), total);
    const prevRank = nationalRankFor(standingFrom(prev.player / 100, histLead(prev)), total);
    delta = prevRank - curRank;
  }

  return { rank, total, delta, marketShare: getPlayerMarketShare(state) };
}

export function buildScoreboardMarquee(state: GameState): string[] {
  const { rank, total } = deriveNationalRanking(state);
  const calendar = getCampaignCalendar(state);
  const guidance = getGuidanceStep(state);
  const entries: string[] = [];

  const topRival = getRivalCounterPlans(state, 1)[0];
  if (topRival) {
    const rankings = getMarketRankings(state);
    const rivalEntry = rankings.find((entry) => entry.id === topRival.competitorId);
    const rivalIndex = rankings.findIndex((entry) => entry.id === topRival.competitorId);
    if (rivalEntry && rivalIndex >= 0) {
      const rivalLead = rankings.length <= 1 ? 0 : (rankings.length - rivalIndex - 1) / (rankings.length - 1);
      const rivalRank = nationalRankFor(standingFrom(rivalEntry.marketShare / 100, rivalLead), total);
      const gap = Math.abs(rivalRank - rank);
      entries.push(
        rivalRank < rank
          ? `라이벌 ‘${topRival.competitorName}’ 추월까지 ${gap}계단`
          : `라이벌 ‘${topRival.competitorName}’ 대비 ${gap}계단 우위`,
      );
    }
  }

  const goal = guidance.priorityLabel ?? guidance.title;
  entries.push(`이번 달 목표 — ${goal}`);
  if (guidance.actionLabel) {
    entries.push(`${guidance.actionLabel} 시 순위 급상승 예상`);
  }
  entries.push(`글로벌 진출 D-${Math.max(0, calendar.remainingMonths)}개월`);
  entries.push(`전국 점유율 ${getPlayerMarketShare(state)}%`);

  return entries.filter((entry) => entry.length > 0);
}
