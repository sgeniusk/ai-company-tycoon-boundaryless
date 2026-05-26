import { createQaScenario, type QaScenarioId } from "./qa-scenarios";

export type BlindRehearsalStatus = "ready_for_human_validation";

export interface BlindPlaytestRehearsalCheckpoint {
  id: string;
  timebox: string;
  goal: string;
  qaRoutes: string[];
  status: BlindRehearsalStatus;
  evidence: string[];
  humanQuestion: string;
}

export interface BlindPlaytestSessionFile {
  id: string;
  path: string;
  status: "예정";
}

export interface ArtIntakeTiming {
  status: "after_v056_blind_test_p0_pass";
  decision: string;
  requiredSources: string[];
  antigravityBriefPath: string;
}

export interface BlindPlaytestRehearsalReport {
  versionTarget: "v0.56-alpha";
  verdict: "ready_for_human_blind_test";
  disclaimer: string;
  realHumanSessionsCaptured: number;
  checkpoints: BlindPlaytestRehearsalCheckpoint[];
  sessionFiles: BlindPlaytestSessionFile[];
  remainingHumanRisks: string[];
  artIntakeTiming: ArtIntakeTiming;
}

const checkpointDefinitions: Array<Omit<BlindPlaytestRehearsalCheckpoint, "status" | "evidence">> = [
  {
    id: "first_10_seconds",
    timebox: "첫 10초",
    goal: "AI 회사 경영 판타지와 첫 제품 출시 목표를 알아본다.",
    qaRoutes: ["?scenario=fresh"],
    humanQuestion: "미나 안내와 첫 화면 신호 중 무엇을 먼저 읽었는가?",
  },
  {
    id: "first_3_minutes",
    timebox: "첫 3분",
    goal: "제품 메뉴로 이동해 추천 첫 제품 개발을 시작한다.",
    qaRoutes: ["?scenario=staffing"],
    humanQuestion: "추천 첫 제품 카드와 첫 제품 개발 시작 버튼을 스스로 찾았는가?",
  },
  {
    id: "first_10_minutes",
    timebox: "첫 10분",
    goal: "첫 제품을 출시하고 출시 결과의 다음 행동 리본을 본다.",
    qaRoutes: ["?scenario=launch-impact", "?scenario=flow"],
    humanQuestion: "출시 결과가 보상감 있는 순간으로 읽혔고 다음 행동을 골랐는가?",
  },
  {
    id: "first_15_minutes",
    timebox: "첫 15분",
    goal: "카드, 개발 이슈, 보상, 성장 선택이 결과를 바꾼다고 이해한다.",
    qaRoutes: ["?scenario=deck", "?scenario=deck-result", "?scenario=reward-picked", "?scenario=growth-picked"],
    humanQuestion: "카드/보상/성장 선택이 숫자와 다음 목표를 바꿨다고 말할 수 있는가?",
  },
  {
    id: "first_20_minutes",
    timebox: "첫 20분",
    goal: "경쟁사와 직원 사건을 화면 사건으로 알아보고 인력 조합 패널에서 직원/AI/로봇 차이를 대충 이해한다.",
    qaRoutes: ["?scenario=office-visuals"],
    humanQuestion: "경쟁사 압박과 직원 사건을 구분하고 사람/AI/로봇 역할 차이를 말할 수 있는가?",
  },
  {
    id: "first_30_minutes",
    timebox: "첫 30분",
    goal: "연간 심사 이후 2년차 운영, 추천 연구, 연구 완료, 제품 후보, 신제품 착수, 이슈 결과, 출시 결과까지 다음 목표가 이어진다.",
    qaRoutes: [
      "?scenario=annual-directed",
      "?scenario=year-two-plan",
      "?scenario=year-two-research",
      "?scenario=year-two-research-complete",
      "?scenario=year-two-product-candidate",
      "?scenario=year-two-product-ready",
      "?scenario=year-two-product-started",
      "?scenario=year-two-product-issue-result",
      "?scenario=year-two-product-launch-impact",
    ],
    humanQuestion: "연간 지시가 실제 운영 보너스와 연구/제품 후보/신제품 착수/이슈 결과/출시 결과로 이어진다고 이해했는가?",
  },
];

const remainingHumanRisks = [
  "첫 개발 이슈/결과 리본이 설명 없이 카드 영향으로 읽히는지",
  "첫 출시 후 다음 행동 리본이 보상 카드와 성장 분기로 실제 클릭을 유도하는지",
  "경쟁사/직원 사건 패널이 압박으로 읽히면서 흐름을 과하게 끊지 않는지",
  "연구 완료 후 제품 후보와 필요 연구 보기 흐름이 다음 목표로 읽히는지",
  "첫 30분 뒤 한 판 더 해볼 마음이 생기는지",
];

export function runV056BlindPlaytestRehearsal(): BlindPlaytestRehearsalReport {
  return {
    versionTarget: "v0.56-alpha",
    verdict: "ready_for_human_blind_test",
    disclaimer: "자동 리허설은 실제 사람 5명 블라인드 테스트가 아님. 실제 관찰 결과는 세션 파일에만 기록한다.",
    realHumanSessionsCaptured: 0,
    checkpoints: checkpointDefinitions.map((checkpoint) => ({
      ...checkpoint,
      status: "ready_for_human_validation",
      evidence: checkpoint.qaRoutes.map(createRouteEvidence),
    })),
    sessionFiles: ["01", "02", "03", "04", "05"].map((id) => ({
      id,
      path: `reports/playtests/v0_56_blind_playtest_session_${id}.md`,
      status: "예정",
    })),
    remainingHumanRisks,
    artIntakeTiming: {
      status: "after_v056_blind_test_p0_pass",
      decision: "최종 그래픽 에셋은 v0.56 블라인드 테스트 P0가 닫힌 뒤 넣는다. 그 전에는 안티그래비티 브리프와 원본 규격만 고정한다.",
      requiredSources: [
        "1152x9600 RGBA character event-pose sheet",
        "2560x1920 RGBA office object sheet",
        "5120x2880 RGBA isometric office backdrop",
      ],
      antigravityBriefPath: "docs/ANTIGRAVITY_ART_BRIEF.md",
    },
  };
}

function createRouteEvidence(route: string): string {
  const scenario = createQaScenario(getScenarioId(route));
  return `${route}: ${scenario.label} / ${scenario.activeMenu} / ${scenario.state.timeline[0] ?? "timeline ready"}`;
}

function getScenarioId(route: string): QaScenarioId {
  const id = route.replace("?scenario=", "") as QaScenarioId;
  return id;
}
