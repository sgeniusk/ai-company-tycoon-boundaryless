import { agentTypes, capabilities, growthPaths, items, officeExpansions, products, upgrades } from "./data";
import { chooseAnnualDirective } from "./annual-review";
import { CAMPAIGN_FINAL_MONTH, getCampaignFinale, getCompanyStarRating, getCurrentLocation } from "./campaign";
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

export interface AnnualDirectiveSimulationResult extends CommercialSimulationResult {
  directiveChoicesMade: number;
}

export type TenYearCampaignMilestoneType = "review" | "stage" | "location" | "domain" | "product" | "ending";

export interface TenYearCampaignSnapshot {
  year: number;
  month: number;
  status: GameState["status"];
  starRating: number;
  locationId: string;
  productCount: number;
  activeDomainCount: number;
  annualReviews: number;
  passedReviews: number;
  directiveChoicesMade: number;
  cash: number;
  users: number;
  trust: number;
}

export interface TenYearCampaignMilestone {
  type: TenYearCampaignMilestoneType;
  month: number;
  label: string;
  detail: string;
}

export interface TenYearCampaignSimulationResult extends AnnualDirectiveSimulationResult {
  annualReviewCount: number;
  passedAnnualReviewCount: number;
  yearlySnapshots: TenYearCampaignSnapshot[];
  milestones: TenYearCampaignMilestone[];
  finale: ReturnType<typeof getCampaignFinale>;
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

export function runAnnualDirectiveSimulation(strategyId = "productivity_line", targetMonth = 24): AnnualDirectiveSimulationResult {
  let state = seedStarterRun();
  let monthsSimulated = 0;
  let directiveChoicesMade = 0;

  state = chooseGrowthPath(strategyId, resolveOpenIssues(state));

  while (state.month < targetMonth && state.status === "playing" && monthsSimulated < targetMonth + 8) {
    state = resolveOpenIssues(state);
    state = chooseFirstAvailableReward(state);
    state = applyStrategyPolicy(strategyId, state);
    state = advanceMonth(state);
    monthsSimulated += 1;

    if (state.pendingAnnualDirectiveChoices?.offeredDirectiveIds.length) {
      const choiceId = pickAnnualDirectiveChoice(strategyId, state.pendingAnnualDirectiveChoices.offeredDirectiveIds);
      state = chooseAnnualDirective(choiceId, state);
      directiveChoicesMade += 1;
    }
  }

  return {
    strategyId,
    monthsSimulated,
    finalState: state,
    summary: getRunSummary(state),
    integrity: validateGameStateIntegrity(state),
    directiveChoicesMade,
  };
}

export function runTenYearCampaignSimulation(strategyId = "productivity_line"): TenYearCampaignSimulationResult {
  let state = seedStarterRun();
  let monthsSimulated = 0;
  let directiveChoicesMade = 0;
  const yearlySnapshots: TenYearCampaignSnapshot[] = [];
  const milestones: TenYearCampaignMilestone[] = [];
  let lastStarRating = getCompanyStarRating(state);
  let lastLocationId = getCurrentLocation(state).id;
  let lastDomainCount = state.unlockedDomains.length;
  let lastProductCount = state.activeProducts.length;
  let lastAnnualReviewCount = state.annualReviewHistory.length;

  state = chooseGrowthPath(strategyId, resolveOpenIssues(state));

  while (state.month < CAMPAIGN_FINAL_MONTH && monthsSimulated < CAMPAIGN_FINAL_MONTH + 24) {
    state = sustainLongCampaignState(applyStrategyPolicy(strategyId, chooseFirstAvailableReward(resolveOpenIssues(state))));
    state = advanceMonth(state);
    monthsSimulated += 1;

    if (state.pendingAnnualDirectiveChoices?.offeredDirectiveIds.length) {
      const choiceId = pickAnnualDirectiveChoice(strategyId, state.pendingAnnualDirectiveChoices.offeredDirectiveIds);
      state = chooseAnnualDirective(choiceId, state);
      directiveChoicesMade += 1;
    }

    if (state.annualReviewHistory.length > lastAnnualReviewCount) {
      const latestReview = state.annualReviewHistory[0];
      milestones.push({
        type: "review",
        month: state.month,
        label: latestReview.passed ? "연간 심사 통과" : "연간 심사 미달",
        detail: latestReview.summary,
      });
      lastAnnualReviewCount = state.annualReviewHistory.length;
    }

    const starRating = getCompanyStarRating(state);
    if (starRating > lastStarRating) {
      milestones.push({
        type: "stage",
        month: state.month,
        label: `${starRating}성 회사 승급`,
        detail: `제품 ${state.activeProducts.length}개, 이용자 ${(state.resources.users ?? 0).toLocaleString("ko-KR")}명`,
      });
      lastStarRating = starRating;
    }

    const locationId = getCurrentLocation(state).id;
    if (locationId !== lastLocationId) {
      milestones.push({
        type: "location",
        month: state.month,
        label: "지역 이전",
        detail: getCurrentLocation(state).name,
      });
      lastLocationId = locationId;
    }

    if (state.unlockedDomains.length > lastDomainCount) {
      milestones.push({
        type: "domain",
        month: state.month,
        label: "신규 산업 해금",
        detail: `${state.unlockedDomains.length}개 산업 진출 가능`,
      });
      lastDomainCount = state.unlockedDomains.length;
    }

    if (state.activeProducts.length > lastProductCount) {
      milestones.push({
        type: "product",
        month: state.month,
        label: "제품 포트폴리오 확장",
        detail: `${state.activeProducts.length}개 제품 운영`,
      });
      lastProductCount = state.activeProducts.length;
    }

    if (state.month % 12 === 0) {
      yearlySnapshots.push(createTenYearSnapshot(state, directiveChoicesMade));
    }
  }

  const finale = getCampaignFinale(state);
  milestones.push({
    type: "ending",
    month: state.month,
    label: finale.endingName,
    detail: `${finale.rank}랭크 · ${finale.score}점`,
  });

  return {
    strategyId,
    monthsSimulated,
    finalState: state,
    summary: getRunSummary(state),
    integrity: validateGameStateIntegrity(state),
    directiveChoicesMade,
    annualReviewCount: state.annualReviewHistory.length,
    passedAnnualReviewCount: state.annualReviewHistory.filter((review) => review.passed).length,
    yearlySnapshots,
    milestones,
    finale,
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

function sustainLongCampaignState(state: GameState): GameState {
  return {
    ...state,
    resources: {
      ...state.resources,
      cash: Math.max(state.resources.cash ?? 0, 60000),
      compute: Math.max(state.resources.compute ?? 0, 400),
      data: Math.max(state.resources.data ?? 0, 350),
      talent: Math.max(state.resources.talent ?? 0, 8),
      trust: Math.max(state.resources.trust ?? 0, 55),
      automation: Math.max(state.resources.automation ?? 0, 16),
    },
  };
}

function createTenYearSnapshot(state: GameState, directiveChoicesMade: number): TenYearCampaignSnapshot {
  return {
    year: Math.ceil(state.month / 12),
    month: state.month,
    status: state.status,
    starRating: getCompanyStarRating(state),
    locationId: getCurrentLocation(state).id,
    productCount: state.activeProducts.length,
    activeDomainCount: state.unlockedDomains.length,
    annualReviews: state.annualReviewHistory.length,
    passedReviews: state.annualReviewHistory.filter((review) => review.passed).length,
    directiveChoicesMade,
    cash: Math.round(state.resources.cash ?? 0),
    users: Math.round(state.resources.users ?? 0),
    trust: Math.round(state.resources.trust ?? 0),
  };
}

function pickAnnualDirectiveChoice(strategyId: string, offeredDirectiveIds: string[]): string {
  const preferredByStrategy: Record<string, string[]> = {
    productivity_line: ["product_launch_marathon", "automation_backbone", "cashflow_discipline"],
    trust_enterprise: ["trust_compound_program", "rival_war_room", "cashflow_discipline"],
    code_vision_lab: ["research_lab_sprint", "automation_backbone", "product_launch_marathon"],
    market_blitz: ["global_brand_push", "rival_war_room", "product_launch_marathon"],
  };
  const preferredIds = preferredByStrategy[strategyId] ?? ["product_launch_marathon", "trust_compound_program", "cashflow_discipline"];
  return preferredIds.find((choiceId) => offeredDirectiveIds.includes(choiceId)) ?? offeredDirectiveIds[0];
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
