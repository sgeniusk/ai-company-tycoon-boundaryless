import { agentTypes, capabilities, growthPaths, items, officeExpansions, products, upgrades } from "./data";
import { chooseCardReward, getStrategyCardById, getStrategyCardPlayCheck, playStrategyCard } from "./deckbuilding";
import { createDevelopmentPuzzle, resolveDevelopmentPuzzle } from "./development-puzzle";
import { resetRunWithMetaUnlocks } from "./meta-progression";
import { getRunSummary, type RunSummary } from "./run-summary";
import { validateGameStateIntegrity, type StateIntegrityReport } from "./state-integrity";
import type { EventChoiceDefinition, GameState, ResourceMap, RivalEventChoiceDefinition } from "./types";
import {
  advanceMonth,
  buyItem,
  buyOfficeExpansion,
  buyUpgrade,
  chooseGrowthPath,
  createInitialState,
  getUpgradeCheck,
  getCapabilityCheck,
  getProductProjectCheck,
  hireAgent,
  resolveEventChoice,
  resolveRivalEventChoice,
  startProductProject,
  upgradeCapability,
} from "./simulation";

export interface CommercialSimulationResult {
  strategyId: string;
  monthsSimulated: number;
  finalState: GameState;
  summary: RunSummary;
  integrity: StateIntegrityReport;
}

export interface TenMinuteAlphaSimulationResult extends CommercialSimulationResult {
  nextRunPreview: GameState;
}

export function runAllCommercialSimulations(): CommercialSimulationResult[] {
  return growthPaths.map((path) => runScriptedCommercialSimulation(path.id));
}

export function runTenMinuteAlphaSimulation(strategyId = "productivity_line"): TenMinuteAlphaSimulationResult {
  let state = seedStarterRun();
  let monthsSimulated = 0;

  state = playOpeningCardAndIssue(state);

  while (state.activeProducts.length === 0 && monthsSimulated < 4) {
    state = advanceMonth(resolveOpenIssues(state));
    monthsSimulated += 1;
  }

  state = chooseFirstAvailableReward(state);
  state = chooseGrowthPath(strategyId, resolveOpenIssues(state));
  state = prepareOfficeSetup(state);

  while (state.month < 5 && state.status === "playing") {
    state = advanceMonth(resolveOpenIssues(state));
    monthsSimulated += 1;
  }

  state = playFirstCounterCard(prepareRivalCounterMoment(state));

  while (state.month < 10 && state.status === "playing" && monthsSimulated < 14) {
    state = resolveOpenIssues(state);
    state = chooseFirstAvailableReward(state);
    state = applyStrategyPolicy(strategyId, state);
    state = advanceMonth(state);
    monthsSimulated += 1;
  }

  state = chooseFirstAvailableReward(resolveOpenIssues(state));
  const summary = getRunSummary(state);

  return {
    strategyId,
    monthsSimulated,
    finalState: state,
    summary,
    integrity: validateGameStateIntegrity(state),
    nextRunPreview: resetRunWithMetaUnlocks(state),
  };
}

export function runScriptedCommercialSimulation(strategyId = "productivity_line", targetMonth = 11): CommercialSimulationResult {
  let state = seedStarterRun();
  let monthsSimulated = 0;

  while (state.activeProducts.length === 0 && monthsSimulated < 3) {
    state = advanceMonth(resolveOpenIssues(state));
    monthsSimulated += 1;
  }

  state = chooseGrowthPath(strategyId, state);

  while (state.month < targetMonth && state.status === "playing" && monthsSimulated < targetMonth + 4) {
    state = resolveOpenIssues(state);
    state = applyStrategyPolicy(strategyId, state);
    state = advanceMonth(state);
    monthsSimulated += 1;
  }

  return {
    strategyId,
    monthsSimulated,
    finalState: state,
    summary: getRunSummary(state),
    integrity: validateGameStateIntegrity(state),
  };
}

function playOpeningCardAndIssue(state: GameState): GameState {
  const card = getStrategyCardById("customer_interviews");
  let nextState = card && getStrategyCardPlayCheck(card, state).ok ? playStrategyCard(card, state) : state;
  const project = nextState.productProjects[0];
  if (!project) return nextState;

  const puzzle = createDevelopmentPuzzle(project.id, nextState);
  return resolveDevelopmentPuzzle(
    project.id,
    puzzle.tiles.slice(0, 4).map((tile) => tile.id),
    nextState,
  );
}

function chooseFirstAvailableReward(state: GameState): GameState {
  const reward = state.roguelite.pendingCardReward;
  if (!reward?.offeredCardIds.length) return state;
  return chooseCardReward(reward.offeredCardIds[0], state);
}

function prepareOfficeSetup(state: GameState): GameState {
  const startupSuite = officeExpansions.find((expansion) => expansion.id === "startup_suite");
  const gpuRack = items.find((item) => item.id === "gpu_rack_mini");
  const fundedState: GameState = {
    ...state,
    resources: {
      ...state.resources,
      cash: Math.max(state.resources.cash ?? 0, 12000),
      data: Math.max(state.resources.data ?? 0, 40),
      compute: Math.max(state.resources.compute ?? 0, 80),
    },
  };
  const expandedState = startupSuite ? buyOfficeExpansion(startupSuite, fundedState) : fundedState;
  return gpuRack ? buyItem(gpuRack, expandedState) : expandedState;
}

function prepareRivalCounterMoment(state: GameState): GameState {
  const counterCardIds = ["market_repositioning", "rival_benchmark_room"];
  const hand = [
    ...counterCardIds,
    ...state.roguelite.deck.hand.filter((cardId) => !counterCardIds.includes(cardId)),
  ].slice(0, 7);

  return {
    ...state,
    resources: {
      ...state.resources,
      cash: Math.max(state.resources.cash ?? 0, 3200),
      data: Math.max(state.resources.data ?? 0, 12),
      trust: Math.max(state.resources.trust ?? 0, 45),
    },
    competitorStates: state.competitorStates.map((competitor) =>
      competitor.id === "competitor_chatgody"
        ? {
            ...competitor,
            score: Math.max(competitor.score, 130),
            marketShare: Math.max(competitor.marketShare, 32),
            momentum: Math.max(competitor.momentum, 6),
            claimedProducts: [...new Set([...competitor.claimedProducts, "meeting_summary_bot"])],
            lastMove: "회의 요약 봇 시장 선점",
          }
        : competitor,
    ),
    roguelite: {
      ...state.roguelite,
      deck: {
        ...state.roguelite.deck,
        hand,
        drawPile: state.roguelite.deck.drawPile.filter((cardId) => !counterCardIds.includes(cardId)),
        discardPile: state.roguelite.deck.discardPile.filter((cardId) => !counterCardIds.includes(cardId)),
        playedThisTurn: [],
      },
    },
    timeline: ["10분 알파: 챗지오디가 회의 요약 봇 시장을 선점", ...state.timeline].slice(0, 8),
  };
}

function playFirstCounterCard(state: GameState): GameState {
  const card = getStrategyCardById("market_repositioning");
  if (!card || !getStrategyCardPlayCheck(card, state).ok) return state;
  return playStrategyCard(card, state);
}

function seedStarterRun(): GameState {
  const architect = agentTypes.find((agent) => agent.id === "prompt_architect");
  const writingProduct = products.find((product) => product.id === "ai_writing_assistant");
  if (!architect || !writingProduct) return createInitialState();

  const hired = hireAgent(architect, createInitialState());
  return startProductProject(writingProduct, hired);
}

function resolveOpenIssues(state: GameState): GameState {
  let nextState = state;

  if (nextState.currentEvent) {
    nextState = resolveEventChoice(pickBestChoice(nextState.currentEvent.choices), nextState);
  }
  if (nextState.currentRivalEvent) {
    nextState = resolveRivalEventChoice(pickBestChoice(nextState.currentRivalEvent.choices), nextState);
  }

  return nextState;
}

function applyStrategyPolicy(strategyId: string, state: GameState): GameState {
  const path = growthPaths.find((entry) => entry.id === strategyId);
  if (!path || state.status !== "playing") return state;

  let nextState = state;

  if (nextState.productProjects.length === 0) {
    const product = findRecommendedProduct(path.recommended_product_ids ?? [], nextState);
    if (product) nextState = startProductProject(product, nextState);
  }

  for (const upgradeId of path.recommended_upgrade_ids ?? []) {
    const upgrade = upgrades.find((entry) => entry.id === upgradeId);
    if (upgrade && getUpgradeCheck(upgrade, nextState).ok) {
      nextState = buyUpgrade(upgrade, nextState);
      break;
    }
  }

  for (const capabilityId of path.recommended_capability_ids ?? []) {
    const capability = capabilities.find((entry) => entry.id === capabilityId);
    if (capability && getCapabilityCheck(capability, nextState).ok) {
      nextState = upgradeCapability(capability, nextState);
      break;
    }
  }

  if (nextState.productProjects.length === 0) {
    const product = findRecommendedProduct(path.recommended_product_ids ?? [], nextState);
    if (product) nextState = startProductProject(product, nextState);
  }

  return nextState;
}

function findRecommendedProduct(productIds: string[], state: GameState) {
  return productIds
    .map((productId) => products.find((product) => product.id === productId))
    .find((product) => product && getProductProjectCheck(product, state).ok);
}

function pickBestChoice<T extends EventChoiceDefinition | RivalEventChoiceDefinition>(choices: T[]): T {
  return [...choices].sort((a, b) => getChoiceScore(b.effects) - getChoiceScore(a.effects))[0];
}

function getChoiceScore(effects: ResourceMap): number {
  const weights: ResourceMap = {
    cash: 0.001,
    users: 0.002,
    compute: 0.25,
    data: 0.35,
    talent: 2,
    trust: 3,
    hype: 1,
    automation: 3,
  };

  return Object.entries(effects).reduce((score, [resourceId, amount]) => score + amount * (weights[resourceId] ?? 0), 0);
}
