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
  aftermath: CampaignAftermath;
}

export type CampaignAftermathSignalTone = "positive" | "neutral" | "warning";

export interface CampaignAftermathSignal {
  id: "legacy" | "scale" | "geopolitics" | "trust" | "runway" | "operations";
  label: string;
  detail: string;
  tone: CampaignAftermathSignalTone;
}

export interface CampaignAftermath {
  yearLabel: string;
  headline: string;
  summary: string;
  signals: CampaignAftermathSignal[];
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
    aftermath: getCampaignAftermath(state, ending.title, rank),
  };
}

function getCampaignAftermath(state: GameState, endingName: string, rank: CampaignFinale["rank"]): CampaignAftermath {
  const productCount = state.activeProducts.length;
  const users = Math.max(0, Math.round(state.resources.users ?? 0));
  const cash = Math.round(state.resources.cash ?? 0);
  const automation = Math.round(state.resources.automation ?? 0);
  const rankIsStrong = rank === "S" || rank === "A";
  const posture = rankIsStrong ? "다음 10년의 시장 표준을 설계합니다" : rank === "D" ? "생존 조직으로 재편됩니다" : "성장과 책임 사이의 운영 체계를 다시 씁니다";

  return {
    yearLabel: "11년차 후일담",
    headline: `${endingName} 이후, 회사는 ${posture}.`,
    summary: `${cash.toLocaleString("ko-KR")} 자금, 자동화 ${automation}, ${users.toLocaleString("ko-KR")}명 이용자 기반이 다음 12개월의 평판을 결정합니다.`,
    signals: [
      {
        id: "legacy",
        label: "남은 유산",
        detail: `${productCount}개 제품과 ${users.toLocaleString("ko-KR")}명 이용자가 ${endingName}의 후속 시장을 만듭니다.`,
        tone: rankIsStrong ? "positive" : "neutral",
      },
      getScaleAftermathSignal(state),
      getPressureAftermathSignal(state, rank),
    ],
  };
}

function getScaleAftermathSignal(state: GameState): CampaignAftermathSignal {
  const automation = Math.round(state.resources.automation ?? 0);
  const users = Math.max(0, Math.round(state.resources.users ?? 0));

  if (automation >= 65) {
    return {
      id: "scale",
      label: "운영 확장",
      detail: `자동화 ${automation}의 운영망이 11년차 실험과 고객 대응을 더 빠르게 묶습니다.`,
      tone: "positive",
    };
  }

  return {
    id: "scale",
    label: "시장 관성",
    detail: `${users.toLocaleString("ko-KR")}명 고객 기반은 남았지만, 자동화 ${automation}의 병목을 계속 관리해야 합니다.`,
    tone: automation >= 45 ? "neutral" : "warning",
  };
}

function getPressureAftermathSignal(state: GameState, rank: CampaignFinale["rank"]): CampaignAftermathSignal {
  const trust = Math.round(state.resources.trust ?? 0);
  const cash = Math.round(state.resources.cash ?? 0);
  const hasGeopoliticalPressure = state.worldEventHistory.some((eventId) =>
    ["autonomous_weapons_hearing", "border_drone_contracts"].includes(eventId),
  );

  if (hasGeopoliticalPressure) {
    return {
      id: "geopolitics",
      label: "지정학 리스크",
      detail: "국방 조달과 자율 시스템 논란이 11년차 감사, 수출 통제, 중립성 검증을 요구합니다.",
      tone: "warning",
    };
  }

  if (trust < 65) {
    return {
      id: "trust",
      label: "신뢰 재건",
      detail: `신뢰 ${trust}에서 출발하는 후속 시장은 안전 검증과 고객 설명을 먼저 요구합니다.`,
      tone: "warning",
    };
  }

  if (cash < 50000 || rank === "D") {
    return {
      id: "runway",
      label: "런웨이 압박",
      detail: `${cash.toLocaleString("ko-KR")} 자금으로 다음 제품보다 구조조정과 파트너십이 먼저 필요합니다.`,
      tone: "warning",
    };
  }

  return {
    id: "operations",
    label: "후속 운영",
    detail: "고객 신뢰와 제품 운영이 안정권에 들어와, 11년차에는 새 시장 진입 타이밍이 핵심입니다.",
    tone: rank === "S" || rank === "A" ? "positive" : "neutral",
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
