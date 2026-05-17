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
  versionTarget: "v0.21-alpha";
  personaCount: number;
  genderMix: {
    male: number;
    female: number;
  };
  score: number;
  verdict: "통과" | "조건부 통과" | "재작업 필요";
  consensus: string;
  topPriorities: string[];
  personaNotes: PersonaPlaytestNote[];
}

const PRIORITIES = [
  "우측 보조 패널을 탭/접기 구조로 압축",
  "첫 5분 보상 연출을 더 크게 표시",
  "시즌 과제 보상/압박 수치 재조정",
  "카드 효과가 제품 개발 결과를 바꿨다는 피드백 강화",
  "20인 보고서를 로그 QA 시나리오로 계속 노출",
  "코드 스플리팅으로 공개 알파 로딩 안정화",
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
    versionTarget: "v0.21-alpha",
    personaCount: playtestPersonas.length,
    genderMix,
    score,
    verdict: score >= 82 && criticalCount === 0 ? "통과" : score >= 70 ? "조건부 통과" : "재작업 필요",
    consensus: `v0.20 기반 루프는 읽히지만, v0.21에서는 보조 패널 압축과 초반 보상 연출을 먼저 고쳐야 한다. 준비도 하네스 점수는 ${readiness.score}점이다.`,
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
    return "글자 밀도와 스크롤 영역을 줄이고, 현재 해야 할 일을 탭 하나 안에서 보이게 해달라.";
  }
  if (persona.id.includes("mobile")) {
    return "짧은 접속에서도 목표, 월간 결과, 다음 행동을 접힌 패널로 바로 확인하게 해달라.";
  }
  if (persona.id.includes("min_max") || persona.id.includes("balance")) {
    return "시즌 과제 보상과 미대응 압박이 장기적으로 무한 스노우볼을 만들지 않는지 더 보여달라.";
  }
  if (persona.id.includes("deckbuilder")) {
    return "카드가 제품 완성도와 출시 성적을 바꾼 순간을 더 크고 명확하게 보여달라.";
  }
  if (persona.id.includes("streamer")) {
    return "출시 대박, 경쟁사 선점, 10년 엔딩처럼 방송에서 바로 읽히는 큰 순간을 키워달라.";
  }
  return "첫 5분 안에 보상 연출과 회사 성장의 변화를 더 크게 보여달라.";
}

function clampScore(score: number): number {
  return Math.max(58, Math.min(94, Math.round(score)));
}
