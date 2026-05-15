import { agentTypes, capabilities, growthPaths, products, upgrades } from "./data";
import { getRunSummary, type RunSummary } from "./run-summary";
import { validateGameStateIntegrity, type StateIntegrityReport } from "./state-integrity";
import type { EventChoiceDefinition, GameState, ResourceMap, RivalEventChoiceDefinition } from "./types";
import {
  advanceMonth,
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

export function runAllCommercialSimulations(): CommercialSimulationResult[] {
  return growthPaths.map((path) => runScriptedCommercialSimulation(path.id));
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
