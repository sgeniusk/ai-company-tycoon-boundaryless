import { getStaffIncidentBriefs } from "./simulation";
import type { GameState } from "./types";

export type BlindPlaytestCheckpointId =
  | "first_10_seconds"
  | "first_3_minutes"
  | "first_10_minutes"
  | "first_15_minutes"
  | "first_20_minutes"
  | "first_30_minutes";

export interface BlindPlaytestCheckpointStatus {
  id: BlindPlaytestCheckpointId;
  timeLabel: string;
  title: string;
  evidenceLabel: string;
  observationPrompt: string;
  completed: boolean;
}

export interface BlindPlaytestObserverSummary {
  active: boolean;
  sessionNumber: number;
  sessionRecordPath: string;
  completedCount: number;
  totalCount: number;
  verdictLabel: string;
  artGateLabel: string;
  checkpoints: BlindPlaytestCheckpointStatus[];
}

const defaultSessionNumber = 1;
const maxSessionNumber = 5;

function clampSessionNumber(value: string | null): number {
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(parsed)) return defaultSessionNumber;
  return Math.max(1, Math.min(maxSessionNumber, parsed));
}

function getSearchParams(search: string): URLSearchParams {
  return new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
}

export function isBlindPlaytestObserverEnabled(search: string): boolean {
  const params = getSearchParams(search);
  return params.get("playtest") === "v056" || params.get("blindTest") === "v056" || params.get("observer") === "v056-blind";
}

export function createBlindPlaytestObserverSummary(state: GameState, search = ""): BlindPlaytestObserverSummary {
  const params = getSearchParams(search);
  const active = isBlindPlaytestObserverEnabled(search);
  const sessionNumber = clampSessionNumber(params.get("session"));
  const sessionRecordPath = `reports/playtests/v0_56_blind_playtest_session_${String(sessionNumber).padStart(2, "0")}.md`;
  const hasFirstProductStarted = state.hiredAgents.length > 0 || state.productProjects.length > 0 || state.activeProducts.length > 0 || Boolean(state.lastRelease);
  const hasFirstLaunch = state.activeProducts.length > 0 || Boolean(state.lastRelease);
  const hasCardImpactMoment = Boolean(state.lastDevelopmentPuzzle) || Boolean(state.lastRelease) || Boolean(state.chosenGrowthPath);
  const hasWorkforceOrIncidentMoment =
    state.hiredAgents.length > 0 || Boolean(state.currentRivalEvent) || getStaffIncidentBriefs(state).length > 0 || state.recentStaffIncidentResolutions.length > 0;
  const hasYearTwoPlanningMoment = state.annualReviewHistory.length > 0 || Boolean(state.annualDirective) || Boolean(state.lastCapabilityUpgrade);

  const checkpoints: BlindPlaytestCheckpointStatus[] = [
    {
      id: "first_10_seconds",
      timeLabel: "첫 10초",
      title: "정체성",
      evidenceLabel: "AI 회사 경영 판타지",
      observationPrompt: "처음 본 사람이 AI 회사 경영 게임이라고 말하는지 기록",
      completed: true,
    },
    {
      id: "first_3_minutes",
      timeLabel: "첫 3분",
      title: "첫 제품 진입",
      evidenceLabel: "첫 제품 개발 시작",
      observationPrompt: "추천 첫 제품 카드와 개발 시작 버튼을 스스로 찾았는지 기록",
      completed: hasFirstProductStarted,
    },
    {
      id: "first_10_minutes",
      timeLabel: "첫 10분",
      title: "첫 출시",
      evidenceLabel: "출시 결과와 다음 행동",
      observationPrompt: "출시 결과가 보상감 있는 순간인지, 어떤 다음 행동을 눌렀는지 기록",
      completed: hasFirstLaunch,
    },
    {
      id: "first_15_minutes",
      timeLabel: "첫 15분",
      title: "카드 체감",
      evidenceLabel: "카드/보상/성장 영향",
      observationPrompt: "카드나 선택이 숫자와 다음 목표를 바꿨다고 말할 수 있는지 기록",
      completed: hasCardImpactMoment,
    },
    {
      id: "first_20_minutes",
      timeLabel: "첫 20분",
      title: "운영 압박",
      evidenceLabel: "사람/AI/로봇과 사건",
      observationPrompt: "사람/AI/로봇 역할 차이와 경쟁사/직원 사건을 구분하는지 기록",
      completed: hasWorkforceOrIncidentMoment,
    },
    {
      id: "first_30_minutes",
      timeLabel: "첫 30분",
      title: "2년차 연결",
      evidenceLabel: "연간 지시와 연구/제품 후보",
      observationPrompt: "연간 지시가 운영 보너스, 연구, 제품 후보로 이어진다고 이해하는지 기록",
      completed: hasYearTwoPlanningMoment,
    },
  ];
  const completedCount = checkpoints.filter((checkpoint) => checkpoint.completed).length;

  return {
    active,
    sessionNumber,
    sessionRecordPath,
    completedCount,
    totalCount: checkpoints.length,
    verdictLabel: completedCount === checkpoints.length ? "관찰 체크포인트 모두 화면 증거 있음" : `${completedCount}/${checkpoints.length} 체크포인트 화면 증거`,
    artGateLabel: "그래픽 에셋은 실제 블라인드 테스트 P0를 닫은 뒤 투입",
    checkpoints,
  };
}
