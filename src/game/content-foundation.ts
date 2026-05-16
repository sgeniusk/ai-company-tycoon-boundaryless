import { agentTypes, items } from "./data";
import { getCompanyStarRating } from "./campaign";
import {
  getAgentHireCheck,
  getAiAgentCount,
  getAiOperationCapacity,
  getItemCheck,
  getOfficeDecorationSlots,
  getPlacedOfficeItems,
} from "./simulation";
import type { AgentTypeDefinition, GameState, ItemDefinition } from "./types";

export type ContentPhaseId = "garage" | "startup" | "scaleup" | "enterprise" | "frontier";
export type AgentKind = NonNullable<AgentTypeDefinition["kind"]>;

export interface ContentPhase {
  id: ContentPhaseId;
  label: string;
  description: string;
}

export interface AgentContentRow {
  agent: AgentTypeDefinition;
  kind: AgentKind;
  kindLabel: string;
  available: boolean;
  hired: boolean;
  recommended: boolean;
  score: number;
  reasons: string[];
  phaseLabel: string;
  recommendationReason: string;
}

export interface ItemContentRow {
  item: ItemDefinition;
  available: boolean;
  owned: boolean;
  recommended: boolean;
  score: number;
  reasons: string[];
  phaseLabel: string;
  placeableInOffice: boolean;
  recommendationReason: string;
}

export interface FoundationRecommendations {
  phase: ContentPhase;
  agents: AgentContentRow[];
  items: ItemContentRow[];
}

export interface FoundationSnapshot {
  phase: ContentPhase;
  agentTotal: number;
  itemTotal: number;
  availableAgents: number;
  availableItems: number;
  recommendedAgentIds: string[];
  recommendedItemIds: string[];
}

const contentPhases: ContentPhase[] = [
  {
    id: "garage",
    label: "차고 기반",
    description: "싸고 서툰 사람 직원과 핵심 AI 에이전트로 첫 제품을 만드는 단계입니다.",
  },
  {
    id: "startup",
    label: "초기 스타트업",
    description: "첫 출시 후 제품, 운영, 성장 역할을 나누기 시작하는 단계입니다.",
  },
  {
    id: "scaleup",
    label: "스케일업",
    description: "검증, 경쟁 대응, 사무실 투자, 성장 루프가 중요해지는 단계입니다.",
  },
  {
    id: "enterprise",
    label: "기업/산업 확장",
    description: "신뢰, 로봇공학, 하드웨어, 엔터프라이즈 매출을 굳히는 단계입니다.",
  },
  {
    id: "frontier",
    label: "경계 없는 프런티어",
    description: "AI 회사가 산업 경계를 넘어 플랫폼과 물리 제품을 동시에 운영하는 단계입니다.",
  },
];

export function getCampaignContentPhase(state: GameState): ContentPhase {
  const star = getCompanyStarRating(state);

  if (state.month >= 84 || (star >= 5 && state.month >= 60)) return phaseById("frontier");
  if (state.month >= 36 || star >= 4) return phaseById("enterprise");
  if (state.month >= 14 || star >= 3) return phaseById("scaleup");
  if (state.month >= 4 || star >= 2 || state.activeProducts.length > 0) return phaseById("startup");
  return phaseById("garage");
}

export function getAgentContentRows(state: GameState): AgentContentRow[] {
  const recommendedIds = new Set(scoreAgents(state).slice(0, 5).map((entry) => entry.agent.id));

  return scoreAgents(state).map(({ agent, score, recommendationReason }) => {
    const check = getAgentHireCheck(agent, state);
    const hired = state.hiredAgents.some((hiredAgent) => hiredAgent.typeId === agent.id);

    return {
      agent,
      kind: getAgentKind(agent),
      kindLabel: getAgentKindLabel(agent),
      available: check.ok,
      hired,
      recommended: recommendedIds.has(agent.id),
      score,
      reasons: check.reasons,
      phaseLabel: getUnlockPhaseLabel(agent.unlock_requirements),
      recommendationReason,
    };
  });
}

export function getItemContentRows(state: GameState): ItemContentRow[] {
  const recommendedIds = new Set(scoreItems(state).slice(0, 6).map((entry) => entry.item.id));
  const placedItemIds = new Set(getPlacedOfficeItems(state).map((item) => item.id));
  const openDecorationSlot = getPlacedOfficeItems(state).length < getOfficeDecorationSlots(state);

  return scoreItems(state).map(({ item, score, recommendationReason }) => {
    const check = getItemCheck(item, state);
    const owned = state.ownedItems.includes(item.id);

    return {
      item,
      available: check.ok,
      owned,
      recommended: recommendedIds.has(item.id),
      score,
      reasons: check.reasons,
      phaseLabel: getUnlockPhaseLabel(item.unlock_requirements),
      placeableInOffice: item.target !== "agent" && owned && !placedItemIds.has(item.id) && openDecorationSlot,
      recommendationReason,
    };
  });
}

export function getFoundationRecommendations(state: GameState, limit = 5): FoundationRecommendations {
  return {
    phase: getCampaignContentPhase(state),
    agents: getAgentContentRows(state).filter((row) => row.recommended).slice(0, limit),
    items: getItemContentRows(state).filter((row) => row.recommended).slice(0, limit),
  };
}

export function getFoundationSnapshot(state: GameState): FoundationSnapshot {
  const agentRows = getAgentContentRows(state);
  const itemRows = getItemContentRows(state);

  return {
    phase: getCampaignContentPhase(state),
    agentTotal: agentRows.length,
    itemTotal: itemRows.length,
    availableAgents: agentRows.filter((row) => row.available).length,
    availableItems: itemRows.filter((row) => row.available).length,
    recommendedAgentIds: agentRows.filter((row) => row.recommended).map((row) => row.agent.id),
    recommendedItemIds: itemRows.filter((row) => row.recommended).map((row) => row.item.id),
  };
}

export function getAgentKind(agent: AgentTypeDefinition): AgentKind {
  return agent.kind ?? "ai_agent";
}

export function getAgentKindLabel(agent: AgentTypeDefinition): string {
  const kind = getAgentKind(agent);
  if (kind === "human") return "사람 직원";
  if (kind === "robot") return "로봇 인력";
  return "AI 에이전트";
}

function scoreAgents(state: GameState): Array<{ agent: AgentTypeDefinition; score: number; recommendationReason: string }> {
  return agentTypes
    .map((agent) => {
      const kind = getAgentKind(agent);
      const check = getAgentHireCheck(agent, state);
      const hired = state.hiredAgents.some((hiredAgent) => hiredAgent.typeId === agent.id);
      const canOperateAi = getAiAgentCount(state) < getAiOperationCapacity(state);
      const phase = getCampaignContentPhase(state);
      let score = 0;
      let recommendationReason = "장기 콘텐츠 풀 후보입니다.";

      if (hired) score -= 200;
      if (check.ok) score += 70;
      if (!check.ok) score -= 30;
      if (kind === "human" && state.hiredAgents.filter((hiredAgent) => getHiredKind(hiredAgent.typeId) === "human").length < 2) {
        score += 42;
        recommendationReason = "AI 운용 한도와 초반 손맛을 받쳐 주는 사람 직원입니다.";
      }
      if (kind === "ai_agent" && canOperateAi) {
        score += 24;
        recommendationReason = "현재 AI 운용 한도 안에서 바로 전력을 늘릴 수 있습니다.";
      }
      if (kind === "robot" && (state.capabilities.robotics ?? 0) > 0) {
        score += phase.id === "enterprise" || phase.id === "frontier" ? 58 : 28;
        recommendationReason = "로봇공학 이후 하드웨어 확장의 발판입니다.";
      }
      if (state.activeProducts.length === 0) {
        score += agent.stats.product + agent.stats.engineering + agent.stats.operations;
      } else {
        score += agent.stats.growth + agent.stats.safety + agent.stats.research + agent.stats.operations;
      }
      score += getPhaseFitScore(agent.unlock_requirements, state);

      return { agent, score, recommendationReason };
    })
    .sort((a, b) => b.score - a.score || a.agent.name.localeCompare(b.agent.name, "ko"));
}

function scoreItems(state: GameState): Array<{ item: ItemDefinition; score: number; recommendationReason: string }> {
  const hiredTypeIds = new Set(state.hiredAgents.map((agent) => agent.typeId));
  const preferredItemIds = new Set(
    agentTypes
      .filter((agent) => hiredTypeIds.has(agent.id))
      .flatMap((agent) => agent.preferred_items),
  );
  const phase = getCampaignContentPhase(state);

  return items
    .map((item) => {
      const check = getItemCheck(item, state);
      const owned = state.ownedItems.includes(item.id);
      let score = 0;
      let recommendationReason = "회사 기반을 넓히는 아이템입니다.";

      if (owned) score -= 200;
      if (check.ok) score += 70;
      if (!check.ok) score -= 30;
      if (preferredItemIds.has(item.id)) {
        score += 35;
        recommendationReason = "현재 팀의 선호 아이템이라 바로 조합이 생깁니다.";
      }
      if (item.target !== "agent" && getPlacedOfficeItems(state).length < getOfficeDecorationSlots(state)) {
        score += 18;
        recommendationReason = "사무실에 배치해 전역 보너스를 만들 수 있습니다.";
      }
      if (state.activeProducts.length === 0 && ["equipment", "office", "research", "comfort"].includes(item.category)) score += 12;
      if ((phase.id === "enterprise" || phase.id === "frontier") && ["hardware", "manufacturing", "mobility"].includes(item.category)) {
        score += 44;
        recommendationReason = "산업 확장 단계에 맞는 하드웨어/제조 기반입니다.";
      }
      score += Object.values(item.effects).reduce((sum, value) => sum + Math.max(0, value), 0);
      score += getPhaseFitScore(item.unlock_requirements, state);

      return { item, score, recommendationReason };
    })
    .sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name, "ko"));
}

function getUnlockPhaseLabel(requirements: Record<string, number>): string {
  const minMonth = requirements.min_month ?? 1;
  const minStar = requirements.min_star ?? 1;
  const robotics = requirements.min_capability_robotics ?? 0;

  if (minMonth >= 84 || minStar >= 5) return "프런티어";
  if (minMonth >= 36 || minStar >= 4 || robotics >= 2) return "기업/산업";
  if (minMonth >= 14 || minStar >= 3 || robotics >= 1) return "스케일업";
  if (minMonth >= 4 || minStar >= 2 || requirements.min_products) return "초기 성장";
  return "차고";
}

function getPhaseFitScore(requirements: Record<string, number>, state: GameState): number {
  const minMonth = requirements.min_month ?? 1;
  const minStar = requirements.min_star ?? 1;
  const star = getCompanyStarRating(state);

  if (state.month >= minMonth && star >= minStar) return 12;
  if (Math.abs(state.month - minMonth) <= 3) return 6;
  return 0;
}

function getHiredKind(typeId: string): AgentKind {
  const agent = agentTypes.find((entry) => entry.id === typeId);
  return agent ? getAgentKind(agent) : "ai_agent";
}

function phaseById(id: ContentPhaseId): ContentPhase {
  return contentPhases.find((phase) => phase.id === id) ?? contentPhases[0];
}
