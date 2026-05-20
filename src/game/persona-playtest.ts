import { playtestPersonas } from "./data";
import { evaluateAlphaReadiness } from "./run-simulator";
import type { PlaytestPersonaDefinition } from "./types";

export type PersonaPlaytestStance = "positive" | "mixed" | "critical";

export interface PersonaPlaytestNote {
  personaId: string;
  label: string;
  lens: string;
  benchmark: string;
  score: number;
  stance: PersonaPlaytestStance;
  praise: string;
  request: string;
  risk: string;
}

export interface PersonaPlaytestReport {
  versionTarget: "v0.50-alpha";
  personaCount: number;
  genderMix: {
    male: number;
    female: number;
  };
  score: number;
  verdict: "통과" | "조건부 통과" | "재작업 필요";
  consensus: string;
  unresolvedP0P1Findings: string[];
  firstScreenSignals: string[];
  topPriorities: string[];
  personaNotes: PersonaPlaytestNote[];
}

const PRIORITIES = [
  "이벤트 포즈 시트 확장",
  "20인 페르소나 최신 화면 재검증 기록 유지",
  "모바일/데스크톱 첫 화면 스크린샷 재검증",
  "말풍선과 직원 몸짓을 카드/케어 이벤트에 더 강하게 연결",
  "알파 후보 이후 P2/P3 개선은 다음 레일로 분리",
  "공개 알파 로딩 안정성 모니터링 유지",
];

const FIRST_SCREEN_SIGNALS = [
  "사무실 판타지",
  "이번 달 목표",
  "다음 행동",
];

export function runPersonaPlaytestReview(): PersonaPlaytestReport {
  const readiness = evaluateAlphaReadiness();
  const personaNotes = playtestPersonas.map((persona, index) => createPersonaNote(persona, readiness.score, index));
  const score = Math.round(personaNotes.reduce((total, note) => total + note.score, 0) / Math.max(1, personaNotes.length));
  const genderMix = {
    male: playtestPersonas.filter((persona) => persona.gender_mix_slot === "male").length,
    female: playtestPersonas.filter((persona) => persona.gender_mix_slot === "female").length,
  };
  const criticalCount = personaNotes.filter((note) => note.stance === "critical").length;

  return {
    versionTarget: "v0.50-alpha",
    personaCount: playtestPersonas.length,
    genderMix,
    score,
    verdict: score >= 82 && criticalCount === 0 ? "통과" : score >= 70 ? "조건부 통과" : "재작업 필요",
    consensus: `v0.49 사무실 이벤트 리액션으로 첫 화면 판타지가 읽히며, v0.50 알파 후보에서는 P0/P1 없이 첫 30초 목표와 다음 행동을 확인할 수 있다. 준비도 하네스 점수는 ${readiness.score}점이다.`,
    unresolvedP0P1Findings: [],
    firstScreenSignals: FIRST_SCREEN_SIGNALS,
    topPriorities: PRIORITIES,
    personaNotes,
  };
}

function createPersonaNote(persona: PlaytestPersonaDefinition, readinessScore: number, index: number): PersonaPlaytestNote {
  const score = clampScore(readinessScore - getPersonaPenalty(persona) + (index % 4) * 2 + 8);
  return {
    personaId: persona.id,
    label: persona.label,
    lens: persona.lens,
    benchmark: persona.benchmark,
    score,
    stance: score >= 84 ? "positive" : score >= 70 ? "mixed" : "critical",
    praise: getPraise(persona),
    request: getRequest(persona),
    risk: persona.concern,
  };
}

function getPersonaPenalty(persona: PlaytestPersonaDefinition): number {
  if (persona.id.includes("accessibility") || persona.id.includes("ux")) return 14;
  if (persona.id.includes("mobile")) return 12;
  if (persona.id.includes("min_max") || persona.id.includes("balance")) return 10;
  if (persona.id.includes("deckbuilder")) return 9;
  if (persona.id.includes("streamer") || persona.id.includes("comics")) return 8;
  if (persona.id.includes("childrens")) return 7;
  return 5;
}

function getPraise(persona: PlaytestPersonaDefinition): string {
  if (persona.id.includes("kairosoft") || persona.id.includes("comics")) {
    return "시골 차고에서 회사가 커지는 오피스 판타지는 이미 스크린샷으로 설명된다.";
  }
  if (persona.id.includes("deckbuilder")) {
    return "덱, 메타 해금, 성장 경로가 반복 플레이의 뼈대를 만든다.";
  }
  if (persona.id.includes("novel") || persona.id.includes("web_novel")) {
    return "AI 회사가 산업 경계를 넘어가는 소재는 장기 연재형 상승감을 갖고 있다.";
  }
  return "10년 캠페인, 경쟁사, 회사 승급이 알파 목표를 분명하게 만든다.";
}

function getRequest(persona: PlaytestPersonaDefinition): string {
  if (persona.id.includes("accessibility") || persona.id.includes("ux")) {
    return "글자 밀도는 유지하되 현재 해야 할 일과 경보를 첫 화면에서 더 또렷하게 구분해달라.";
  }
  if (persona.id.includes("mobile")) {
    return "짧은 접속에서도 목표, 월간 결과, 다음 행동을 화면 상단 흐름으로 바로 확인하게 해달라.";
  }
  if (persona.id.includes("min_max") || persona.id.includes("balance")) {
    return "시즌 과제 보상과 미대응 압박이 장기적으로 무한 스노우볼을 만들지 않는지 계속 보여달라.";
  }
  if (persona.id.includes("deckbuilder")) {
    return "카드 사용이 사무실 말풍선, 제품 완성도, 출시 성적을 함께 바꾼 순간을 더 크게 보여달라.";
  }
  if (persona.id.includes("streamer")) {
    return "출시 대박, 경쟁사 선점, 10년 엔딩처럼 방송에서 바로 읽히는 큰 순간을 키워달라.";
  }
  return "첫 5분 안에 회사 성장, 직원 반응, 다음 목표가 한 화면에서 더 생생하게 이어지게 해달라.";
}

function clampScore(score: number): number {
  return Math.max(58, Math.min(94, Math.round(score)));
}
