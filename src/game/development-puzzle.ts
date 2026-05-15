import { agentTypes, items, products } from "./data";
import type {
  AgentStats,
  DevelopmentChallenge,
  DevelopmentPuzzleResult,
  DevelopmentPuzzleState,
  DevelopmentPuzzleTile,
  GameState,
  HiredAgent,
} from "./types";

const challengeLabels: Record<DevelopmentChallenge, string> = {
  ux: "UX 빈틈",
  bug: "버그 더미",
  compute: "연산 병목",
  safety: "안전 리스크",
  research: "모델 한계",
  market: "시장 포지션",
  data: "데이터 품질",
  creative: "사용감 밋밋함",
  automation: "반복 업무",
};

const challengeStats: Record<DevelopmentChallenge, keyof AgentStats> = {
  ux: "product",
  bug: "engineering",
  compute: "operations",
  safety: "safety",
  research: "research",
  market: "growth",
  data: "research",
  creative: "creativity",
  automation: "autonomy",
};

const challengeOrder: DevelopmentChallenge[] = ["ux", "bug", "compute", "safety", "research", "market", "data", "creative", "automation"];

export function createDevelopmentPuzzle(projectId: string, state: GameState): DevelopmentPuzzleState {
  const project = state.productProjects.find((entry) => entry.id === projectId);
  const product = project ? products.find((entry) => entry.id === project.productId) : undefined;
  const productId = product?.id ?? project?.productId ?? "unknown_product";
  const tagPressure = product?.tags.length ?? 1;

  return {
    projectId,
    productId,
    tiles: challengeOrder.map((challenge, index) => ({
      id: `${projectId}_${challenge}`,
      challenge,
      label: challengeLabels[challenge],
      difficulty: 5 + index + tagPressure,
      stat: challengeStats[challenge],
    })),
  };
}

export function resolveDevelopmentPuzzle(projectId: string, selectedTileIds: string[], state: GameState): GameState {
  const project = state.productProjects.find((entry) => entry.id === projectId);
  if (!project || state.status !== "playing") return state;

  const puzzle = createDevelopmentPuzzle(projectId, state);
  const selectedTiles = puzzle.tiles.filter((tile) => selectedTileIds.includes(tile.id)).slice(0, 4);
  if (selectedTiles.length === 0) return state;

  const stats = getProjectTeamStats(project.assignedAgentIds, state);
  const score = getPuzzleScore(selectedTiles, stats);
  const progressGain = Math.round(clamp(score / 7, 2, 22));
  const qualityGain = Math.round(clamp(score / 9, 1, 16));
  const result: DevelopmentPuzzleResult = {
    ...puzzle,
    selectedTileIds: selectedTiles.map((tile) => tile.id),
    score,
    progressGain,
    qualityGain,
    verdict: score >= 70 ? "돌파" : score >= 45 ? "개선" : "아슬아슬",
  };

  return {
    ...state,
    productProjects: state.productProjects.map((entry) =>
      entry.id === projectId
        ? {
            ...entry,
            progress: clamp(entry.progress + progressGain, 0, 100),
            quality: clamp(entry.quality + qualityGain, 0, 100),
          }
        : entry,
    ),
    lastDevelopmentPuzzle: result,
    timeline: [`개발 퍼즐 ${result.verdict}: 진행 +${progressGain}, 완성도 +${qualityGain}`, ...state.timeline].slice(0, 8),
  };
}

function getPuzzleScore(tiles: DevelopmentPuzzleTile[], stats: AgentStats): number {
  return Math.round(
    clamp(
      tiles.reduce((sum, tile) => sum + Math.max(4, stats[tile.stat] * 2 + 8 - tile.difficulty), 0),
      1,
      100,
    ),
  );
}

function getProjectTeamStats(assignedAgentIds: string[], state: GameState): AgentStats {
  const agentStats = state.hiredAgents
    .filter((agent) => assignedAgentIds.includes(agent.id))
    .reduce((stats, agent) => addStats(stats, getAgentStats(agent, state)), createEmptyStats());

  return addStats(agentStats, getGlobalItemStats(state));
}

function getAgentStats(agent: HiredAgent, state: GameState): AgentStats {
  const type = agentTypes.find((agentType) => agentType.id === agent.typeId);
  const baseStats = type?.stats ?? createEmptyStats();
  const equippedItems = items.filter((item) => agent.equippedItemIds.includes(item.id));

  return equippedItems.reduce((stats, item) => addStats(stats, item.effects), { ...baseStats });
}

function getGlobalItemStats(state: GameState): AgentStats {
  return items
    .filter((item) => state.ownedItems.includes(item.id) && item.target !== "agent")
    .reduce((stats, item) => addStats(stats, item.effects), createEmptyStats());
}

function createEmptyStats(): AgentStats {
  return {
    research: 0,
    engineering: 0,
    product: 0,
    growth: 0,
    safety: 0,
    operations: 0,
    creativity: 0,
    autonomy: 0,
  };
}

function addStats(current: AgentStats, effects: Partial<AgentStats> | Record<string, number>): AgentStats {
  const next = { ...current };
  const effectMap = effects as Record<string, number | undefined>;

  for (const stat of Object.keys(next) as Array<keyof AgentStats>) {
    next[stat] += effectMap[stat] ?? 0;
  }

  return next;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
