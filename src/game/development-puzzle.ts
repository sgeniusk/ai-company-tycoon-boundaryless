import { agentTypes, items, products } from "./data";
import type {
  ActionCheck,
  ActiveDevelopmentPuzzleModifier,
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
  const activeModifiers = getActivePuzzleModifiers(projectId, state);

  return {
    projectId,
    productId,
    tiles: challengeOrder.map((challenge, index) => {
      const tileModifiers = activeModifiers.filter((modifier) => modifierAppliesToChallenge(modifier, challenge));
      const difficultyDelta = tileModifiers.reduce((sum, modifier) => sum + modifier.difficultyDelta, 0);

      return {
        id: `${projectId}_${challenge}`,
        challenge,
        label: challengeLabels[challenge],
        difficulty: Math.max(1, 5 + index + tagPressure + difficultyDelta),
        stat: challengeStats[challenge],
        modifierLabel: tileModifiers.map((modifier) => modifier.label).join(", ") || undefined,
      };
    }),
  };
}

export function getDevelopmentPuzzleSelectionLimit(state: GameState, projectId?: string): number {
  const activeModifiers = projectId
    ? getActivePuzzleModifiers(projectId, state)
    : state.activeDevelopmentPuzzleModifiers.filter((modifier) => modifier.usesRemaining > 0);
  const limitBonus = activeModifiers.reduce((sum, modifier) => sum + modifier.tileLimitBonus, 0);

  return Math.max(1, 4 + limitBonus);
}

export function getDevelopmentPuzzleResolveCheck(projectId: string, selectedTileIds: string[], state: GameState): ActionCheck {
  const reasons: string[] = [];
  const project = state.productProjects.find((entry) => entry.id === projectId);
  const puzzle = createDevelopmentPuzzle(projectId, state);
  const tileIds = new Set(puzzle.tiles.map((tile) => tile.id));
  const uniqueSelectedTileIds = [...new Set(selectedTileIds)];
  const selectionLimit = getDevelopmentPuzzleSelectionLimit(state, projectId);

  if (!project) reasons.push("개발 중인 프로젝트가 없습니다.");
  if (state.status !== "playing") reasons.push("운영 중인 런에서만 해결할 수 있습니다.");
  if (uniqueSelectedTileIds.length === 0) reasons.push("해결할 이슈를 1개 이상 선택해야 합니다.");
  if (uniqueSelectedTileIds.length > selectionLimit) reasons.push(`이번 퍼즐은 최대 ${selectionLimit}개까지 선택할 수 있습니다.`);
  if (uniqueSelectedTileIds.some((tileId) => !tileIds.has(tileId))) reasons.push("알 수 없는 퍼즐 칸이 포함되어 있습니다.");

  return { ok: reasons.length === 0, reasons };
}

export function resolveDevelopmentPuzzle(projectId: string, selectedTileIds: string[], state: GameState): GameState {
  const project = state.productProjects.find((entry) => entry.id === projectId);
  const check = getDevelopmentPuzzleResolveCheck(projectId, selectedTileIds, state);
  if (!project || !check.ok) return state;

  const puzzle = createDevelopmentPuzzle(projectId, state);
  const selectedSet = new Set(selectedTileIds);
  const selectedTiles = puzzle.tiles.filter((tile) => selectedSet.has(tile.id));
  if (selectedTiles.length === 0) return state;

  const stats = getProjectTeamStats(project.assignedAgentIds, state);
  const appliedModifiers = getAppliedModifiers(projectId, selectedTiles.map((tile) => tile.challenge), state);
  const score = getPuzzleScore(selectedTiles, stats, appliedModifiers);
  const progressGain = Math.round(clamp(score / 7, 2, 22));
  const qualityGain = Math.round(clamp(score / 9, 1, 16));
  const result: DevelopmentPuzzleResult = {
    ...puzzle,
    selectedTileIds: selectedTiles.map((tile) => tile.id),
    score,
    progressGain,
    qualityGain,
    verdict: score >= 70 ? "돌파" : score >= 45 ? "개선" : "아슬아슬",
    appliedModifierLabels: appliedModifiers.map((modifier) => modifier.label),
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
    activeDevelopmentPuzzleModifiers: consumeAppliedModifiers(state.activeDevelopmentPuzzleModifiers, appliedModifiers),
    lastDevelopmentPuzzle: result,
    timeline: [
      `개발 퍼즐 ${result.verdict}: 진행 +${progressGain}, 완성도 +${qualityGain}${result.appliedModifierLabels.length ? ` (${result.appliedModifierLabels.join(", ")})` : ""}`,
      ...state.timeline,
    ].slice(0, 8),
  };
}

function getPuzzleScore(tiles: DevelopmentPuzzleTile[], stats: AgentStats, modifiers: ActiveDevelopmentPuzzleModifier[]): number {
  const scoreBonus = modifiers.reduce((sum, modifier) => sum + modifier.scoreBonus, 0);

  return Math.round(
    clamp(
      tiles.reduce((sum, tile) => sum + Math.max(4, stats[tile.stat] * 2 + 8 - tile.difficulty), 0) + scoreBonus,
      1,
      100,
    ),
  );
}

function getActivePuzzleModifiers(projectId: string, state: GameState): ActiveDevelopmentPuzzleModifier[] {
  return state.activeDevelopmentPuzzleModifiers.filter((modifier) => modifier.projectId === projectId && modifier.usesRemaining > 0);
}

function getAppliedModifiers(projectId: string, selectedChallenges: DevelopmentChallenge[], state: GameState): ActiveDevelopmentPuzzleModifier[] {
  const selectedChallengeSet = new Set(selectedChallenges);
  return getActivePuzzleModifiers(projectId, state).filter(
    (modifier) =>
      modifier.tileLimitBonus > 0 ||
      modifier.targetChallenges.length === 0 ||
      modifier.targetChallenges.some((challenge) => selectedChallengeSet.has(challenge)),
  );
}

function modifierAppliesToChallenge(modifier: ActiveDevelopmentPuzzleModifier, challenge: DevelopmentChallenge): boolean {
  return modifier.targetChallenges.length === 0 || modifier.targetChallenges.includes(challenge);
}

function consumeAppliedModifiers(
  current: ActiveDevelopmentPuzzleModifier[],
  appliedModifiers: ActiveDevelopmentPuzzleModifier[],
): ActiveDevelopmentPuzzleModifier[] {
  const appliedIds = new Set(appliedModifiers.map((modifier) => modifier.id));

  return current
    .map((modifier) => (appliedIds.has(modifier.id) ? { ...modifier, usesRemaining: modifier.usesRemaining - 1 } : modifier))
    .filter((modifier) => modifier.usesRemaining > 0);
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
