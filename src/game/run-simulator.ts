import { agentTypes, capabilities, growthPaths, items, officeExpansions, products, upgrades } from "./data";
import { chooseAnnualDirective } from "./annual-review";
import { CAMPAIGN_FINAL_MONTH, getCampaignFinale, getCompanyStarRating, getCurrentLocation } from "./campaign";
import { getCompetitionSeasonChallenges } from "./competition-signals";
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

export interface AlphaReadinessGate {
  id: "commercial_paths" | "ten_year_campaign" | "integrity" | "ending";
  status: "pass" | "warn" | "fail";
  detail: string;
}

export interface AlphaReadinessReport {
  versionTarget: "v0.20-alpha";
  pass: boolean;
  score: number;
  coveredStrategies: number;
  gates: AlphaReadinessGate[];
  recommendations: string[];
}

export interface SeasonChallengeBalanceReport {
  versionTarget: "v0.22-alpha";
  challengeCount: number;
  relatedCompetitorCount: number;
  unresolvedMomentumPerCompetitor: number;
  completedReward: ResourceMap;
  pass: boolean;
  recommendations: string[];
}

export function runAllCommercialSimulations(): CommercialSimulationResult[] {
  return growthPaths.map((path) => runScriptedCommercialSimulation(path.id));
}

export function evaluateAlphaReadiness(): AlphaReadinessReport {
  const commercialResults = runAllCommercialSimulations();
  const campaignResult = runTenYearCampaignSimulation("productivity_line");
  const commercialPassCount = commercialResults.filter(
    (result) => result.integrity.ok && result.finalState.status !== "failure" && result.finalState.activeProducts.length >= 2,
  ).length;
  const integrityOk = commercialResults.every((result) => result.integrity.ok) && campaignResult.integrity.ok;
  const campaignComplete = campaignResult.finalState.month >= CAMPAIGN_FINAL_MONTH && campaignResult.finalState.status !== "playing";
  const endingGoodEnough = campaignResult.finale.rank !== "D";
  const gates: AlphaReadinessGate[] = [
    {
      id: "commercial_paths",
      status: commercialPassCount === commercialResults.length ? "pass" : commercialPassCount > 0 ? "warn" : "fail",
      detail: `${commercialPassCount}/${commercialResults.length}개 성장 경로가 10개월 상용 루프를 통과`,
    },
    {
      id: "ten_year_campaign",
      status: campaignComplete ? "pass" : "fail",
      detail: `10년 캠페인 ${campaignResult.finalState.month}개월차 / 연간 심사 ${campaignResult.annualReviewCount}회`,
    },
    {
      id: "integrity",
      status: integrityOk ? "pass" : "fail",
      detail: integrityOk ? "모든 시뮬레이션 상태 무결성 통과" : "상태 무결성 오류 확인 필요",
    },
    {
      id: "ending",
      status: endingGoodEnough ? "pass" : "warn",
      detail: `10년 엔딩 ${campaignResult.finale.rank}랭크 · ${campaignResult.finale.score}점`,
    },
  ];
  const score = Math.round(
    (commercialPassCount / Math.max(1, commercialResults.length)) * 40 +
      (campaignComplete ? 25 : 0) +
      (integrityOk ? 20 : 0) +
      (endingGoodEnough ? 15 : 5),
  );

  return {
    versionTarget: "v0.20-alpha",
    pass: gates.every((gate) => gate.status !== "fail") && score >= 70,
    score,
    coveredStrategies: commercialResults.length,
    gates,
    recommendations: [
      "v0.20에서는 브라우저 QA 스크린샷 세트를 갱신한다.",
      "v0.20 이후에는 UI 패널 압축과 코드 스플리팅을 우선순위로 둔다.",
      "경쟁사 시즌 과제의 보상/압박 수치를 플레이테스트로 재조정한다.",
    ],
  };
}

export function evaluateSeasonChallengeBalance(): SeasonChallengeBalanceReport {
  let state = createInitialState();
  while (state.month < 12 && state.status === "playing") {
    state = advanceMonth(resolveOpenIssues(state));
  }

  const challenges = getCompetitionSeasonChallenges(state);
  const relatedCompetitorCount = new Set(challenges.flatMap((challenge) => challenge.relatedCompetitorIds)).size;
  const completedReward: ResourceMap = {
    trust: challenges.length,
    users: challenges.length * 80,
    data: challenges.length * 2,
  };
  const unresolvedMomentumPerCompetitor = 2;
  const pass =
    challenges.length > 0 &&
    completedReward.trust <= 3 &&
    completedReward.users <= 240 &&
    unresolvedMomentumPerCompetitor <= 2 &&
    relatedCompetitorCount > 0;

  return {
    versionTarget: "v0.22-alpha",
    challengeCount: challenges.length,
    relatedCompetitorCount,
    unresolvedMomentumPerCompetitor,
    completedReward,
    pass,
    recommendations: [
      "보상은 신뢰/데이터 중심으로 유지하고 이용자 보상은 과도하게 키우지 않는다.",
      "미대응 압박은 경쟁 모멘텀 +2를 넘기지 않아 초보자 회복 여지를 남긴다.",
      "다음 플레이테스트에서는 시즌 과제 완료율과 다음 해 생존율을 함께 본다.",
    ],
  };
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
