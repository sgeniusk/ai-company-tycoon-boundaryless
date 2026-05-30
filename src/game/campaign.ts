import { companyLocations, companyStages } from "./data";
import { getCampaignEnding } from "./campaign-ending";
import type { CompanyLocationDefinition, CompanyStageDefinition, GameState } from "./types";

export const CAMPAIGN_FINAL_MONTH = 120;
export const MONTHS_PER_YEAR = 12;
export const DAYS_PER_MONTH = 30;

export interface CampaignCalendar {
  currentMonth: number;
  totalMonths: number;
  year: number;
  monthOfYear: number;
  remainingMonths: number;
  progressPercent: number;
}

export interface DayPhase {
  id: "day" | "night";
  label: string;
  description: string;
}

export interface CampaignFinale {
  isFinal: boolean;
  title: string;
  endingId: string;
  endingName: string;
  score: number;
  rank: "S" | "A" | "B" | "C" | "D";
  survivedYears: number;
  verdict: string;
}

export interface CompanyStageProgressItem {
  requirement: string;
  label: string;
  current: number;
  target: number;
  currentLabel: string;
  targetLabel: string;
  complete: boolean;
}

export interface CompanyStageProgress {
  current: CompanyStageDefinition;
  next?: CompanyStageDefinition;
  items: CompanyStageProgressItem[];
  completed: number;
  total: number;
  progressPercent: number;
}

export function getCampaignCalendar(state: GameState): CampaignCalendar {
  const currentMonth = Math.max(1, Math.min(CAMPAIGN_FINAL_MONTH, state.month));
  return {
    currentMonth,
    totalMonths: CAMPAIGN_FINAL_MONTH,
    year: Math.floor((currentMonth - 1) / MONTHS_PER_YEAR) + 1,
    monthOfYear: ((currentMonth - 1) % MONTHS_PER_YEAR) + 1,
    remainingMonths: Math.max(0, CAMPAIGN_FINAL_MONTH - currentMonth),
    progressPercent: Math.round(((currentMonth - 1) / (CAMPAIGN_FINAL_MONTH - 1)) * 100),
  };
}

export function getDayPhase(state: GameState): DayPhase {
  if (state.month % 2 === 0) {
    return {
      id: "night",
      label: "밤 작업",
      description: "서버 팬 소리와 모니터 불빛만 남은 집중 시간입니다.",
    };
  }

  return {
    id: "day",
    label: "낮 운영",
    description: "전화, 회의, 채용 연락이 오가는 평범한 근무 시간입니다.",
  };
}

export function getCompanyStarRating(state: GameState): number {
  return Math.min(5, getCampaignCompanyStage(state).order + 1);
}

export function getCampaignCompanyStage(state: GameState): CompanyStageDefinition {
  const orderedStages = [...companyStages].sort((a, b) => b.order - a.order);
  return orderedStages.find((stage) => requirementsMet(stage.requirements, state)) ?? orderedStages[orderedStages.length - 1];
}

export function getCompanyStageProgress(state: GameState): CompanyStageProgress {
  const orderedStages = [...companyStages].sort((a, b) => a.order - b.order);
  const current = getCampaignCompanyStage(state);
  const next = orderedStages.find((stage) => stage.order === current.order + 1);
  const items = Object.entries(next?.requirements ?? {}).map(([requirement, target]) => {
    const currentValue = getRequirementValue(requirement, state);

    return {
      requirement,
      label: requirementLabel(requirement),
      current: currentValue,
      target,
      currentLabel: formatRequirementValue(requirement, currentValue),
      targetLabel: formatRequirementValue(requirement, target),
      complete: currentValue >= target,
    };
  });
  const completed = items.filter((item) => item.complete).length;

  return {
    current,
    next,
    items,
    completed,
    total: items.length,
    progressPercent: items.length ? Math.round((completed / items.length) * 100) : 100,
  };
}

export function getCurrentLocation(state: GameState): CompanyLocationDefinition {
  return companyLocations.find((location) => location.id === state.locationId) ?? companyLocations[0];
}

export function getAvailableLocations(state: GameState): CompanyLocationDefinition[] {
  return companyLocations.filter((location) => getLocationRequirementReasons(location, state).length === 0);
}

export function getLocationRequirementReasons(location: CompanyLocationDefinition, state: GameState): string[] {
  const reasons: string[] = [];

  for (const [requirement, needed] of Object.entries(location.unlock_requirements ?? {})) {
    if (requirement === "min_star" && getCompanyStarRating(state) < needed) reasons.push(`${needed}성 회사 필요`);
    if (requirement === "min_month" && state.month < needed) reasons.push(`${needed}개월차 필요`);
    if (requirement === "min_products" && state.activeProducts.length < needed) reasons.push(`활성 제품 ${needed}개 필요`);
    if (requirement === "min_users" && (state.resources.users ?? 0) < needed) reasons.push(`이용자 ${needed.toLocaleString("ko-KR")}명 필요`);
    if (requirement === "min_trust" && (state.resources.trust ?? 0) < needed) reasons.push(`신뢰 ${needed} 필요`);
    if (requirement === "min_cash" && (state.resources.cash ?? 0) < needed) reasons.push(`자금 ${needed.toLocaleString("ko-KR")} 필요`);
  }

  return reasons;
}

export function getCampaignFinalStatus(state: GameState): GameState["status"] {
  if (state.status === "failure") return "failure";
  if (state.month < CAMPAIGN_FINAL_MONTH) return "playing";
  return getCampaignFinale(state).rank === "D" ? "failure" : "success";
}

export function getCampaignFinale(state: GameState): CampaignFinale {
  const score = getCampaignScore(state);
  const rank = getCampaignRank(score, state.status);
  const location = getCurrentLocation(state);
  const ending = getCampaignEnding(state);
  return {
    isFinal: state.month >= CAMPAIGN_FINAL_MONTH || state.status !== "playing",
    title: "10년차 최종 평가",
    endingId: ending.id,
    endingName: ending.title,
    score,
    rank,
    survivedYears: Math.min(10, Math.max(1, Math.ceil(state.month / MONTHS_PER_YEAR))),
    verdict: `${ending.flavor} ${location.region}에서 출발한 회사가 ${state.activeProducts.length}개 제품과 ${(state.resources.users ?? 0).toLocaleString("ko-KR")}명의 이용자를 남겼습니다.`,
  };
}

function getCampaignScore(state: GameState): number {
  const userScore = Math.min(25, (state.resources.users ?? 0) / 6000);
  const cashScore = Math.min(18, Math.max(-12, (state.resources.cash ?? 0) / 10000));
  const trustScore = Math.min(18, (state.resources.trust ?? 0) / 5);
  const automationScore = Math.min(15, (state.resources.automation ?? 0) / 5);
  const productScore = Math.min(24, state.activeProducts.length * 4);
  const starScore = getCompanyStarRating(state) * 3;
  const domainScore = Math.min(10, state.unlockedDomains.length * 1.5);
  const survivalPenalty = state.status === "failure" ? -25 : 0;

  return Math.round(Math.max(0, Math.min(100, userScore + cashScore + trustScore + automationScore + productScore + starScore + domainScore + survivalPenalty)));
}

function getCampaignRank(score: number, status: GameState["status"]): CampaignFinale["rank"] {
  if (status === "failure") return "D";
  if (score >= 86) return "S";
  if (score >= 72) return "A";
  if (score >= 55) return "B";
  if (score >= 38) return "C";
  return "D";
}

function requirementsMet(requirements: Record<string, number>, state: GameState): boolean {
  return Object.entries(requirements ?? {}).every(([requirement, needed]) => {
    return getRequirementValue(requirement, state) >= needed;
  });
}

function getRequirementValue(requirement: string, state: GameState): number {
  if (requirement === "min_products") return state.activeProducts.length;
  if (requirement === "min_domains") return state.unlockedDomains.length;
  if (requirement === "min_users") return state.resources.users ?? 0;
  if (requirement === "min_hype") return state.resources.hype ?? 0;
  if (requirement === "min_trust") return state.resources.trust ?? 0;
  if (requirement === "min_cash") return state.resources.cash ?? 0;
  if (requirement === "min_automation") return state.resources.automation ?? 0;
  return 0;
}

function requirementLabel(requirement: string): string {
  if (requirement === "min_products") return "출시 제품";
  if (requirement === "min_domains") return "해금 분야";
  if (requirement === "min_users") return "이용자";
  if (requirement === "min_hype") return "화제성";
  if (requirement === "min_trust") return "신뢰";
  if (requirement === "min_cash") return "자금";
  if (requirement === "min_automation") return "자동화";
  return requirement;
}

function formatRequirementValue(requirement: string, value: number): string {
  const rounded = Math.round(value);
  if (requirement === "min_products" || requirement === "min_domains") return `${rounded.toLocaleString("ko-KR")}개`;
  if (requirement === "min_users") return `${rounded.toLocaleString("ko-KR")}명`;
  if (requirement === "min_cash") return rounded.toLocaleString("ko-KR");
  return rounded.toLocaleString("ko-KR");
}
