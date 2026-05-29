import { agentTypes, capabilities, items, officeExpansions, products, rivalEvents } from "./data";
import { chooseAnnualDirective } from "./annual-review";
import { getAnnualStrategyAdvice } from "./annual-strategy-advisor";
import { applyDueCampaignShocks } from "./campaign-shocks";
import { chooseCardReward, createReleaseCardReward, getStrategyCardById, playStrategyCard } from "./deckbuilding";
import { createDevelopmentPuzzle, resolveDevelopmentPuzzle } from "./development-puzzle";
import { resetRunWithMetaUnlocks } from "./meta-progression";
import { runPersonaPlaytestReview } from "./persona-playtest";
import { evaluateAlphaReadiness, runScriptedCommercialSimulation, runTenMinuteAlphaSimulation, runTenYearCampaignSimulation } from "./run-simulator";
import {
  advanceMonth,
  advanceToFirstAnnualReview,
  advanceToFirstLaunch,
  advanceYearTwoProductRoadmap,
  buyItem,
  buyOfficeExpansion,
  chooseGrowthPath,
  createInitialState,
  getStaffIncidentBriefs,
  getYearTwoProductIssueRecommendation,
  hireAgent,
  resolveStaffIncident,
  startProductProject,
  upgradeCapability,
} from "./simulation";
import type { GameState } from "./types";
import type { MenuId } from "../ui/menu";

export const qaScenarioIds = [
  "fresh",
  "staffing",
  "project",
  "release",
  "reward",
  "reward-picked",
  "growth-picked",
  "shop",
  "office",
  "deck",
  "deck-result",
  "deck-synergy",
  "strategy",
  "counter",
  "rivals",
  "arc",
  "flow",
  "alpha",
  "next-run",
  "restart-setup",
  "finale",
  "review",
  "annual-directed",
  "year-two-plan",
  "year-two-research",
  "year-two-research-complete",
  "year-two-product-candidate",
  "year-two-product-ready",
  "year-two-product-started",
  "year-two-product-issue-result",
  "year-two-product-launch-impact",
  "alpha-run-complete",
  "alpha-run-issue-complete",
  "alpha-run-second-launch",
  "alpha-run-second-reward-picked",
  "reward-bias",
  "annual-strategy",
  "ten-year-sim",
  "campaign-shock",
  "foundation",
  "commercial",
  "result",
  "readiness",
  "persona20",
  "staff-incidents",
  "staff-resolution",
  "staff-aftermath",
  "launch-impact",
  "operations",
  "office-visuals",
  "market-share",
  "big-event",
  "resource-visibility",
  "physical-industries",
  "payoff-juice",
  "collection",
  "milestones",
] as const;

export type QaScenarioId = (typeof qaScenarioIds)[number];

export interface QaScenario {
  id: QaScenarioId;
  label: string;
  state: GameState;
  activeMenu: MenuId;
}

const postReleaseSeenTutorials = [
  "welcome_garage",
  "agent_hired",
  "product_ideas",
  "development_project",
  "card_reward",
  "next_run_setup",
  "office_growth",
  "competition_pressure",
];

export function createQaScenario(id: QaScenarioId): QaScenario {
  if (id === "fresh") {
    return {
      id,
      label: "첫 화면 QA",
      state: createInitialState(),
      activeMenu: "company",
    };
  }

  if (id === "market-share") {
    return {
      id,
      label: "시장 점유율 시각화 QA",
      state: advanceToFirstAnnualReview(createInitialState()),
      activeMenu: "company",
    };
  }

  if (id === "big-event") {
    // v0.58 #5 — annual_challenger가 진입한 직후 상태 (entry_month 12). pendingChallengerEntryIds 큐에 autonovaMotors / brewchain이 들어차서 BigEventModal이 즉시 보인다.
    let bigEventState = createInitialState();
    while (bigEventState.month < 13 && bigEventState.status === "playing") {
      bigEventState = advanceMonth(bigEventState);
    }
    return {
      id,
      label: "대형 사건 팝업 QA",
      state: bigEventState,
      activeMenu: "company",
    };
  }

  if (id === "resource-visibility") {
    return {
      id,
      label: "AI 자원 가시화 QA",
      state: createResourceVisibilityScenarioState(),
      activeMenu: "research",
    };
  }

  if (id === "physical-industries") {
    return {
      id,
      label: "물리 산업 도메인 QA",
      state: createPhysicalIndustriesScenarioState(),
      activeMenu: "products",
    };
  }

  if (id === "payoff-juice") {
    return {
      id,
      label: "페이오프 셀러브레이션 QA",
      state: createPayoffJuiceScenarioState(),
      activeMenu: "products",
    };
  }

  if (id === "collection") {
    return {
      id,
      label: "페이오프 도감 QA",
      state: createPayoffCollectionScenarioState(),
      activeMenu: "products",
    };
  }

  if (id === "milestones") {
    return {
      id,
      label: "마일스톤 팡파레 QA",
      state: createMilestoneScenarioState(),
      activeMenu: "company",
    };
  }

  const projectState = createStarterProjectState();

  if (id === "staffing") {
    return {
      id,
      label: "직원 배치 QA",
      state: createStaffingState(),
      activeMenu: "products",
    };
  }

  if (id === "staff-incidents") {
    return {
      id,
      label: "인사 사건 QA",
      state: createStaffIncidentState(),
      activeMenu: "agents",
    };
  }

  if (id === "staff-resolution") {
    return {
      id,
      label: "인사 대응 결과 QA",
      state: createStaffResolutionState(),
      activeMenu: "agents",
    };
  }

  if (id === "staff-aftermath") {
    return {
      id,
      label: "인사 후폭풍 QA",
      state: createStaffAftermathState(),
      activeMenu: "agents",
    };
  }

  if (id === "project") {
    return {
      id,
      label: "개발 중 QA",
      state: projectState,
      activeMenu: "products",
    };
  }

  const releaseState = advanceMonth(advanceMonth(projectState));

  if (id === "reward") {
    return {
      id,
      label: "카드 보상 QA",
      state: withPostReleaseTutorialsSeen(releaseState),
      activeMenu: "deck",
    };
  }

  if (id === "reward-picked") {
    return {
      id,
      label: "보상 선택 완료 QA",
      state: createRewardPickedScenarioState(releaseState),
      activeMenu: "deck",
    };
  }

  if (id === "growth-picked") {
    return {
      id,
      label: "성장 분기 선택 완료 QA",
      state: createGrowthPickedScenarioState(releaseState),
      activeMenu: "company",
    };
  }

  if (id === "shop") {
    return {
      id,
      label: "첫 출시 후 상점 QA",
      state: releaseState,
      activeMenu: "shop",
    };
  }

  if (id === "office") {
    return {
      id,
      label: "사무실 확장 QA",
      state: createOfficeScenarioState(releaseState),
      activeMenu: "shop",
    };
  }

  if (id === "deck") {
    return {
      id,
      label: "첫 개발 이슈 QA",
      state: projectState,
      activeMenu: "deck",
    };
  }

  if (id === "deck-result") {
    return {
      id,
      label: "첫 개발 이슈 결과 QA",
      state: createDevelopmentIssueResultState(projectState),
      activeMenu: "deck",
    };
  }

  if (id === "deck-synergy") {
    return {
      id,
      label: "v0.31 덱 시너지 QA",
      state: createDeckSynergyScenarioState(projectState),
      activeMenu: "deck",
    };
  }

  const strategyState = chooseGrowthPath("productivity_line", releaseState);

  if (id === "strategy") {
    return {
      id,
      label: "전략 경쟁 QA",
      state: strategyState,
      activeMenu: "competition",
    };
  }

  if (id === "counter") {
    return {
      id,
      label: "경쟁 대응 QA",
      state: createCounterScenarioState(strategyState),
      activeMenu: "competition",
    };
  }

  if (id === "rivals") {
    let rivalState = strategyState;
    while (rivalState.month < 12) {
      rivalState = advanceMonth(rivalState);
    }

    return {
      id,
      label: "연간 경쟁사 등장 QA",
      state: {
        ...rivalState,
        timeline: ["강력한 신규 경쟁사 등장 QA: 오토노바 모터스와 브루체인이 시장에 진입", ...rivalState.timeline].slice(0, 8),
      },
      activeMenu: "competition",
    };
  }

  if (id === "arc") {
    let arcState = strategyState;
    while (arcState.month < 6) {
      arcState = advanceMonth(arcState);
    }

    return {
      id,
      label: "10개월 아크 QA",
      state: arcState,
      activeMenu: "company",
    };
  }

  if (id === "flow") {
    return {
      id,
      label: "첫 10분 흐름 QA",
      state: createFirstTenMinuteFlowState(strategyState),
      activeMenu: "company",
    };
  }

  if (id === "alpha") {
    return {
      id,
      label: "10분 알파 완주 QA",
      state: createTenMinuteAlphaState(),
      activeMenu: "company",
    };
  }

  if (id === "next-run") {
    return {
      id,
      label: "새 런 진입 QA",
      state: createNextRunState(),
      activeMenu: "deck",
    };
  }

  if (id === "restart-setup") {
    return {
      id,
      label: "v0.32 재시작 설계 QA",
      state: createRestartSetupState(),
      activeMenu: "deck",
    };
  }

  if (id === "finale") {
    return {
      id,
      label: "10년 엔딩 QA",
      state: createFinaleState(),
      activeMenu: "company",
    };
  }

  if (id === "review") {
    return {
      id,
      label: "연간 심사 QA",
      state: createAnnualReviewScenarioState(),
      activeMenu: "company",
    };
  }

  if (id === "annual-directed") {
    return {
      id,
      label: "연간 지시 선택 완료 QA",
      state: createAnnualDirectedScenarioState(),
      activeMenu: "company",
    };
  }

  if (id === "year-two-plan") {
    return {
      id,
      label: "2년차 운영 시작 QA",
      state: createYearTwoPlanScenarioState(),
      activeMenu: "company",
    };
  }

  if (id === "year-two-research") {
    return {
      id,
      label: "2년차 연구 추천 QA",
      state: createYearTwoResearchScenarioState(),
      activeMenu: "research",
    };
  }

  if (id === "year-two-research-complete") {
    return {
      id,
      label: "2년차 연구 완료 QA",
      state: createYearTwoResearchCompleteScenarioState(),
      activeMenu: "research",
    };
  }

  if (id === "year-two-product-candidate") {
    return {
      id,
      label: "2년차 제품 후보 QA",
      state: createYearTwoProductCandidateScenarioState(),
      activeMenu: "products",
    };
  }

  if (id === "year-two-product-ready") {
    return {
      id,
      label: "2년차 제품 개발 준비 QA",
      state: createYearTwoProductReadyScenarioState(),
      activeMenu: "products",
    };
  }

  if (id === "year-two-product-started") {
    return {
      id,
      label: "2년차 제품 개발 착수 QA",
      state: createYearTwoProductStartedScenarioState(),
      activeMenu: "products",
    };
  }

  if (id === "year-two-product-issue-result") {
    return {
      id,
      label: "2년차 제품 이슈 결과 QA",
      state: createYearTwoProductIssueResultScenarioState(),
      activeMenu: "deck",
    };
  }

  if (id === "year-two-product-launch-impact") {
    return {
      id,
      label: "2년차 신제품 출시 QA",
      state: createYearTwoProductLaunchImpactScenarioState(),
      activeMenu: "company",
    };
  }

  if (id === "alpha-run-complete") {
    return {
      id,
      label: "30분 알파런 완료 QA",
      state: createAlphaRunCompleteScenarioState(),
      activeMenu: "deck",
    };
  }

  if (id === "alpha-run-issue-complete") {
    return {
      id,
      label: "30분 알파런 신제품 이슈 완료 QA",
      state: createAlphaRunIssueCompleteScenarioState(),
      activeMenu: "deck",
    };
  }

  if (id === "alpha-run-second-launch") {
    return {
      id,
      label: "30분 알파런 두 번째 출시 QA",
      state: createAlphaRunSecondLaunchScenarioState(),
      activeMenu: "deck",
    };
  }

  if (id === "alpha-run-second-reward-picked") {
    return {
      id,
      label: "30분 알파런 두 번째 보상 선택 QA",
      state: createAlphaRunSecondRewardPickedScenarioState(),
      activeMenu: "deck",
    };
  }

  if (id === "reward-bias") {
    return {
      id,
      label: "연간 지시 보상 편향 QA",
      state: createAnnualRewardBiasScenarioState(),
      activeMenu: "deck",
    };
  }

  if (id === "annual-strategy") {
    return {
      id,
      label: "연간 전략실 QA",
      state: createAnnualStrategyScenarioState(),
      activeMenu: "company",
    };
  }

  if (id === "ten-year-sim") {
    const result = runTenYearCampaignSimulation("productivity_line");
    return {
      id,
      label: "10년 압축 캠페인 QA",
      state: {
        ...result.finalState,
        timeline: [
          `10년 압축 캠페인 QA: ${result.finale.endingName} / ${result.finale.rank}랭크 / ${result.annualReviewCount}회 심사`,
          ...result.finalState.timeline,
        ].slice(0, 8),
      },
      activeMenu: "company",
    };
  }

  if (id === "campaign-shock") {
    return {
      id,
      label: "v0.33 시장 충격 QA",
      state: createCampaignShockScenarioState(),
      activeMenu: "company",
    };
  }

  if (id === "foundation") {
    return {
      id,
      label: "콘텐츠 기반 추천 QA",
      state: createFoundationScenarioState(),
      activeMenu: "agents",
    };
  }

  if (id === "commercial") {
    return {
      id,
      label: "상용 준비 QA",
      state: runScriptedCommercialSimulation("productivity_line").finalState,
      activeMenu: "company",
    };
  }

  if (id === "result") {
    return {
      id,
      label: "런 결과 QA",
      state: createResultRecapState(),
      activeMenu: "company",
    };
  }

  if (id === "readiness") {
    const readiness = evaluateAlphaReadiness();
    const campaign = runTenYearCampaignSimulation("productivity_line");
    return {
      id,
      label: "v0.20 알파 준비도 QA",
      state: {
        ...campaign.finalState,
        timeline: [
          `v0.20 알파 준비도: ${readiness.pass ? "통과" : "점검 필요"} / ${readiness.score}점 / ${readiness.coveredStrategies}개 전략`,
          ...readiness.gates.map((gate) => `${gate.id}: ${gate.status} · ${gate.detail}`),
          ...campaign.finalState.timeline,
        ].slice(0, 8),
      },
      activeMenu: "company",
    };
  }

  if (id === "persona20") {
    const report = runPersonaPlaytestReview();
    const campaign = runTenYearCampaignSimulation("productivity_line");
    return {
      id,
      label: "v0.50 알파 후보 20인 페르소나 QA",
      state: {
        ...campaign.finalState,
        timeline: [
          `v0.50 20인 페르소나: ${report.verdict} / ${report.score}점 / ${report.personaCount}명`,
          `P0/P1: ${report.unresolvedP0P1Findings.length > 0 ? report.unresolvedP0P1Findings.join(", ") : "없음"}`,
          ...report.firstScreenSignals.map((signal) => `첫 30초: ${signal}`),
          ...report.topPriorities.slice(0, 4).map((priority) => `개선 우선순위: ${priority}`),
          ...report.personaNotes.slice(0, 2).map((note) => `${note.label}: ${note.request}`),
          ...campaign.finalState.timeline,
        ].slice(0, 8),
      },
      activeMenu: "log",
    };
  }

  if (id === "launch-impact") {
    return {
      id,
      label: "v0.56 출시 체감 QA",
      state: createLaunchImpactScenarioState(),
      activeMenu: "company",
    };
  }

  if (id === "operations") {
    return {
      id,
      label: "v0.40 운영 의제 QA",
      state: createOperationsScenarioState(),
      activeMenu: "company",
    };
  }

  if (id === "office-visuals") {
    return {
      id,
      label: "v0.55 스크린샷 QA",
      state: createOfficeVisualScenarioState(),
      activeMenu: "company",
    };
  }

  return {
    id,
    label: "출시 스포트라이트 QA",
    state: releaseState,
    activeMenu: "company",
  };
}

function createGrowthPickedScenarioState(releaseState: GameState): GameState {
  const rewardPickedState = createRewardPickedScenarioState(releaseState);
  const growthPickedState = chooseGrowthPath("productivity_line", rewardPickedState);

  return withPostReleaseTutorialsSeen(growthPickedState);
}

function createRewardPickedScenarioState(releaseState: GameState): GameState {
  const reward = releaseState.roguelite.pendingCardReward;
  if (!reward?.offeredCardIds.length) return releaseState;

  const pickedState = chooseCardReward(reward.offeredCardIds[0], releaseState);
  return withPostReleaseTutorialsSeen(pickedState);
}

function withPostReleaseTutorialsSeen(state: GameState): GameState {
  return {
    ...state,
    seenTutorials: [...new Set([...(state.seenTutorials ?? []), ...postReleaseSeenTutorials])],
  };
}

function createOperationsScenarioState(): GameState {
  const initial = createInitialState();
  const projectProduct = products.find((product) => product.id === "ai_coding_assistant");
  const hiredAgents = agentTypes.slice(0, 5).map((agent, index) => ({
    id: `operations-agent-${index + 1}`,
    typeId: agent.id,
    name: agent.name,
    level: index === 0 ? 4 : 2,
    energy: index === 0 ? 18 : 78,
    loyalty: index === 0 ? 38 : 74,
    equippedItemIds: [],
  }));
  const baseState: GameState = {
    ...initial,
    month: 18,
    activeProducts: ["foundation_model_v0", "ai_writing_assistant"],
    productLevels: { foundation_model_v0: 1, ai_writing_assistant: 2 },
    hiredAgents,
    resources: {
      ...initial.resources,
      cash: 90000,
      compute: 520,
      data: 520,
      users: 12000,
      trust: 68,
      hype: 32,
      automation: 20,
      talent: 8,
    },
    capabilities: {
      ...initial.capabilities,
      language: 3,
      code: 3,
      vision: 2,
      agent: 2,
      robotics: 1,
      optimization: 2,
    },
    unlockedDomains: [
      ...new Set([...initial.unlockedDomains, "developer_tools", "creator_tools", "robotics", "semiconductors"]),
    ],
    office: {
      expansionId: "campus_lab",
      placedItemIds: [],
    },
    seenTutorials: [
      "welcome_garage",
      "agent_hired",
      "product_ideas",
      "development_project",
      "card_reward",
      "office_growth",
      "competition_pressure",
    ],
    timeline: ["v0.40 운영 의제 QA: 직원, 구획, 제품 개발, 경쟁 압박을 한 화면에서 점검", ...initial.timeline].slice(0, 8),
  };

  if (!projectProduct) return baseState;

  return {
    ...startProductProject(projectProduct, baseState, [hiredAgents[0].id]),
    timeline: ["v0.40 운영 의제 QA: 운영 커맨드 패널과 구획 완충 효과 확인", ...baseState.timeline].slice(0, 8),
  };
}

function createOfficeVisualScenarioState(): GameState {
  const baseState = createOperationsScenarioState();
  const robotType = agentTypes.find((agent) => agent.kind === "robot");
  const alreadyHasRobot = baseState.hiredAgents.some((agent) => agentTypes.find((type) => type.id === agent.typeId)?.kind === "robot");
  const visualDecorItemIds = [
    "gpu_rack_mini",
    "tensor_whiteboard",
    "cooling_fan_wall",
    "ux_sticky_wall",
    "feedback_inbox",
    "instant_noodle_corner",
    "hiring_banner",
    "nap_pod",
    "benchmark_dashboard",
    "robot_charging_mat",
  ];
  const visualAgents = baseState.hiredAgents.map((agent, index) => {
    if (index === 0) return { ...agent, energy: 78, loyalty: 72 };
    if (index === 1) return { ...agent, energy: 74, level: 4, loyalty: 38 };
    if (index === 2) return { ...agent, energy: 24, loyalty: 76 };
    return agent;
  });
  const hiredAgents = robotType && !alreadyHasRobot
    ? [
        ...visualAgents,
        {
          id: "office-visual-robot-1",
          typeId: robotType.id,
          name: robotType.name,
          level: 1,
          energy: 92,
          loyalty: 82,
          equippedItemIds: [],
        },
      ]
    : visualAgents;

  const visualState: GameState = {
    ...baseState,
    hiredAgents,
    ownedItems: [...new Set([...baseState.ownedItems, ...visualDecorItemIds])],
    office: {
      ...baseState.office,
      placedItemIds: visualDecorItemIds,
    },
  };
  const sprintCard = getStrategyCardById("prompt_sprint");
  const reactedState = sprintCard ? playStrategyCard(sprintCard, visualState) : visualState;
  const incidentRivalEvent = rivalEvents.find((event) => event.id === "talent_poach");

  return {
    ...reactedState,
    currentRivalEvent: incidentRivalEvent ?? reactedState.currentRivalEvent,
    timeline: [
      "v0.55 스크린샷 QA / v0.56 사건 화면 QA: 라이벌 이벤트와 인사 사건을 한 화면에서 확인",
      ...reactedState.timeline,
    ].slice(0, 8),
  };
}

function createLaunchImpactScenarioState(): GameState {
  const architect = agentTypes.find((agent) => agent.id === "prompt_architect");
  const writingProduct = products.find((product) => product.id === "ai_writing_assistant");
  if (!architect || !writingProduct) return createInitialState();

  let state = startProductProject(writingProduct, hireAgent(architect, createInitialState()));
  for (const cardId of ["prompt_sprint", "customer_interviews"]) {
    const card = getStrategyCardById(cardId);
    if (card) state = playStrategyCard(card, state);
  }
  while (state.productProjects.length > 0 && state.month < 6) {
    state = advanceMonth(state);
  }

  return {
    ...state,
    seenTutorials: [
      ...new Set([
        ...(state.seenTutorials ?? []),
        "welcome_garage",
        "agent_hired",
        "development_project",
        "card_reward",
        "office_growth",
        "competition_pressure",
      ]),
    ],
    timeline: ["v0.56 출시 체감 QA: 카드, 경쟁사, 팀 반응이 첫 제품 성과 패널에 묶임", ...state.timeline].slice(0, 8),
  };
}

function createDeckSynergyScenarioState(projectState: GameState): GameState {
  return {
    ...projectState,
    month: Math.max(projectState.month, 5),
    resources: {
      ...projectState.resources,
      cash: Math.max(projectState.resources.cash ?? 0, 14000),
      data: Math.max(projectState.resources.data ?? 0, 70),
      compute: Math.max(projectState.resources.compute ?? 0, 90),
      hype: Math.max(projectState.resources.hype ?? 0, 20),
      trust: Math.max(projectState.resources.trust ?? 0, 55),
    },
    roguelite: {
      ...projectState.roguelite,
      deck: {
        drawPile: ["rival_benchmark_room", "open_source_push", "safety_review"],
        hand: ["viral_teaser", "market_repositioning", "prompt_sprint", "customer_interviews"],
        discardPile: [],
        playedThisTurn: [],
      },
      rewardHistory: [
        {
          rewardId: "qa_deck_synergy_reward",
          productId: "ai_writing_assistant",
          chosenCardId: "viral_teaser",
          month: 4,
        },
      ],
    },
    seenTutorials: [
      "welcome_garage",
      "agent_hired",
      "product_ideas",
      "development_project",
      "card_reward",
      "office_growth",
      "competition_pressure",
    ],
    timeline: ["v0.31 덱 시너지 QA: 런칭 머신 빌드가 활성화된 덱 화면", ...projectState.timeline].slice(0, 8),
  };
}

function createDevelopmentIssueResultState(projectState: GameState): GameState {
  const interviewCard = getStrategyCardById("customer_interviews");
  const preparedState = interviewCard ? playStrategyCard(interviewCard, projectState) : projectState;
  const projectId = preparedState.productProjects[0]?.id;
  if (!projectId) return preparedState;

  const puzzle = createDevelopmentPuzzle(projectId, preparedState);
  const selectedTileIds = puzzle.tiles.slice(0, 4).map((tile) => tile.id);
  const resolvedState = resolveDevelopmentPuzzle(projectId, selectedTileIds, preparedState);

  return {
    ...resolvedState,
    timeline: [
      ...resolvedState.timeline.slice(0, 1),
      "v0.56 첫 개발 이슈 결과 QA: 카드 보정과 진행도 상승을 덱 상단에서 확인",
      ...resolvedState.timeline.slice(1),
    ].slice(0, 8),
  };
}

function createAnnualReviewScenarioState(): GameState {
  const activeProductIds = ["foundation_model_v0", "ai_writing_assistant"];
  const readyState: GameState = {
    ...createInitialState(),
    month: 11,
    activeProducts: activeProductIds,
    productLevels: Object.fromEntries(activeProductIds.map((productId) => [productId, 1])),
    resources: {
      ...createInitialState().resources,
      cash: 16000,
      users: 1800,
      trust: 42,
      hype: 30,
      automation: 8,
    },
    timeline: ["연간 심사 QA: 1년차 지역 데모데이 직전 상태", ...createInitialState().timeline].slice(0, 8),
  };
  const reviewedState = advanceMonth(readyState);

  return {
    ...reviewedState,
    timeline: ["연간 심사 QA: 목표 달성, 보상, 최근 결과 카드 확인", ...reviewedState.timeline].slice(0, 8),
  };
}

function createAnnualDirectedScenarioState(): GameState {
  const reviewedState = createAnnualReviewScenarioState();
  const directedState = chooseAnnualDirective("trust_compound_program", reviewedState);
  return {
    ...directedState,
    seenTutorials: [
      ...new Set([
        ...(directedState.seenTutorials ?? []),
        "welcome_garage",
        "agent_hired",
        "product_ideas",
        "development_project",
        "card_reward",
        "office_growth",
        "competition_pressure",
        "next_run_setup",
      ]),
    ],
    timeline: [
      "연간 지시 선택 완료 QA: 다음 해 운영 방향과 월간 보너스를 확인",
      ...directedState.timeline,
    ].slice(0, 8),
  };
}

function createYearTwoPlanScenarioState(): GameState {
  const directedState = createAnnualDirectedScenarioState();
  const yearTwoState = advanceMonth(directedState);

  return {
    ...yearTwoState,
    timeline: [
      "2년차 운영 시작 QA: 연간 지시 월간 보너스와 추천 메뉴가 실제 운영으로 이어짐",
      ...yearTwoState.timeline,
    ].slice(0, 10),
  };
}

function createYearTwoResearchScenarioState(): GameState {
  const yearTwoState = createYearTwoPlanScenarioState();

  return {
    ...yearTwoState,
    timeline: [
      "2년차 연구 추천 QA: 연간 지시가 추천한 연구 메뉴에서 바로 다음 실험을 시작",
      ...yearTwoState.timeline,
    ].slice(0, 10),
  };
}

function createYearTwoResearchCompleteScenarioState(): GameState {
  const researchState = createYearTwoResearchScenarioState();
  const recommendedCapabilityId = getAnnualStrategyAdvice(researchState)?.capabilityRecommendations[0]?.id;
  const recommendedCapability = capabilities.find((capability) => capability.id === recommendedCapabilityId);
  const completedState = recommendedCapability ? upgradeCapability(recommendedCapability, researchState) : researchState;

  return {
    ...completedState,
    timeline: [
      "2년차 연구 완료 QA: 추천 연구가 해금 시장과 다음 제품 후보로 이어짐",
      ...completedState.timeline,
    ].slice(0, 10),
  };
}

function createYearTwoProductCandidateScenarioState(): GameState {
  const completedState = createYearTwoResearchCompleteScenarioState();

  return {
    ...completedState,
    timeline: [
      "2년차 제품 후보 QA: 연구 완료 보상이 새 시장 제품 후보와 다음 필요 연구로 이어짐",
      ...completedState.timeline,
    ].slice(0, 10),
  };
}

function createYearTwoProductReadyScenarioState(): GameState {
  const candidateState = createYearTwoProductCandidateScenarioState();
  const enterpriseProduct = products.find((product) => product.id === "enterprise_workflow_agent");
  if (!enterpriseProduct) return candidateState;

  let state = withYearTwoProductTeam(candidateState);
  for (const [capabilityId, requiredLevel] of Object.entries(enterpriseProduct.required_capabilities)) {
    const requiredCapability = capabilities.find((capability) => capability.id === capabilityId);
    if (!requiredCapability) continue;

    for (let guard = 0; (state.capabilities[capabilityId] ?? 0) < requiredLevel && guard <= requiredCapability.max_level; guard += 1) {
      const fundedState = withYearTwoProductResourceFloors(state);
      const upgradedState = upgradeCapability(requiredCapability, fundedState);
      if (upgradedState === fundedState) break;
      state = upgradedState;
    }
  }

  const readyState = withYearTwoProductTeam(state);

  return {
    ...readyState,
    timeline: [
      "2년차 제품 개발 준비 QA: 필요 연구를 채워 기업 업무 에이전트 개발 버튼을 확인",
      ...readyState.timeline,
    ].slice(0, 10),
  };
}

function createYearTwoProductStartedScenarioState(): GameState {
  const readyState = createYearTwoProductReadyScenarioState();
  const enterpriseProduct = products.find((product) => product.id === "enterprise_workflow_agent");
  if (!enterpriseProduct) return readyState;

  const assignedAgentIds = readyState.hiredAgents.filter((agent) => !agent.assignment).slice(0, 3).map((agent) => agent.id);
  const startedState = startProductProject(enterpriseProduct, readyState, assignedAgentIds);

  return {
    ...startedState,
    timeline: [
      "2년차 제품 개발 착수 QA: 연구 보상이 실제 신제품 프로젝트로 전환됨",
      ...startedState.timeline,
    ].slice(0, 10),
  };
}

function createYearTwoProductIssueResultScenarioState(): GameState {
  const startedState = createYearTwoProductStartedScenarioState();
  const project = startedState.productProjects.find((productProject) => productProject.productId === "enterprise_workflow_agent");
  if (!project) return startedState;

  const puzzle = createDevelopmentPuzzle(project.id, startedState);
  const selectedTileIds = puzzle.tiles.slice(0, 4).map((tile) => tile.id);
  const resolvedState = resolveDevelopmentPuzzle(project.id, selectedTileIds, startedState);

  return {
    ...resolvedState,
    timeline: [
      "2년차 제품 이슈 결과 QA: 신제품 개발 이슈가 진행도와 완성도를 실제로 올림",
      ...resolvedState.timeline,
    ].slice(0, 10),
  };
}

function createYearTwoProductLaunchImpactScenarioState(): GameState {
  const issueResultState = createYearTwoProductIssueResultScenarioState();
  const launchedState = advanceToFirstLaunch(issueResultState, 8);

  return {
    ...launchedState,
    seenTutorials: [...new Set([...(launchedState.seenTutorials ?? []), ...postReleaseSeenTutorials])],
    timeline: [
      "2년차 신제품 출시 QA: 연구 보상이 기업 업무 에이전트 출시 결과와 카드 보상으로 이어짐",
      ...launchedState.timeline,
    ].slice(0, 10),
  };
}

function createAlphaRunCompleteScenarioState(): GameState {
  const firstIssueState = createDevelopmentIssueResultState(createStarterProjectState());
  const firstReleaseState = advanceToFirstLaunch(firstIssueState, 8);
  const growthPickedState = createGrowthPickedScenarioState(firstReleaseState);
  const reviewedState = advanceToFirstAnnualReview(
    {
      ...growthPickedState,
      currentEvent: undefined,
      currentRivalEvent: undefined,
      resources: {
        ...growthPickedState.resources,
        cash: Math.max(growthPickedState.resources.cash ?? 0, 36000),
        compute: Math.max(growthPickedState.resources.compute ?? 0, 160),
        data: Math.max(growthPickedState.resources.data ?? 0, 260),
        talent: Math.max(growthPickedState.resources.talent ?? 0, 9),
        trust: Math.max(growthPickedState.resources.trust ?? 0, 88),
      },
    },
    12,
  );
  const yearTwoReadyState = withYearTwoProductTeam(withYearTwoProductResourceFloors(reviewedState));
  const completeState = advanceYearTwoProductRoadmap(yearTwoReadyState);

  return {
    ...completeState,
    seenTutorials: [...new Set([...(completeState.seenTutorials ?? []), ...postReleaseSeenTutorials])],
    timeline: [
      "30분 알파런 완료 QA: 첫 출시, 카드 보상, 성장, 연간 지시, 2년차 신제품 착수를 한 화면에서 확인",
      ...completeState.timeline,
    ].slice(0, 10),
  };
}

function createAlphaRunIssueCompleteScenarioState(): GameState {
  const completeState = createAlphaRunCompleteScenarioState();
  const recommendation = getYearTwoProductIssueRecommendation(completeState);
  if (!recommendation?.check.ok) return completeState;

  const preparedState = recommendation.card ? playStrategyCard(recommendation.card, completeState) : completeState;
  const resolvedState = resolveDevelopmentPuzzle(recommendation.projectId, recommendation.selectedTileIds, preparedState);

  return {
    ...resolvedState,
    timeline: [
      "30분 알파런 신제품 이슈 완료 QA: 완주 패널의 다음 개발 이슈가 실제 진행도와 완성도를 올림",
      ...resolvedState.timeline,
    ].slice(0, 10),
  };
}

function createAlphaRunSecondLaunchScenarioState(): GameState {
  const issueCompleteState = createAlphaRunIssueCompleteScenarioState();
  const launchedState = advanceToFirstLaunch(withYearTwoProductResourceFloors(issueCompleteState), 16);

  return {
    ...launchedState,
    seenTutorials: [...new Set([...(launchedState.seenTutorials ?? []), ...postReleaseSeenTutorials])],
    timeline: [
      "30분 알파런 두 번째 출시 QA: 완주 패널의 출시 진행이 두 번째 보상 순간으로 이어짐",
      ...launchedState.timeline,
    ].slice(0, 10),
  };
}

function createAlphaRunSecondRewardPickedScenarioState(): GameState {
  const launchState = createAlphaRunSecondLaunchScenarioState();
  const reward = launchState.roguelite.pendingCardReward;
  const cardId = reward?.offeredCardIds[0];
  const rewardedState = cardId ? chooseCardReward(cardId, launchState) : launchState;

  return {
    ...rewardedState,
    timeline: [
      "30분 알파런 두 번째 보상 선택 QA: 두 번째 출시 보상까지 선택해 알파런 핵심 루프를 닫음",
      ...rewardedState.timeline,
    ].slice(0, 10),
  };
}

function withYearTwoProductResourceFloors(state: GameState): GameState {
  return {
    ...state,
    resources: {
      ...state.resources,
      cash: Math.max(state.resources.cash ?? 0, 32000),
      compute: Math.max(state.resources.compute ?? 0, 140),
      data: Math.max(state.resources.data ?? 0, 240),
      talent: Math.max(state.resources.talent ?? 0, 8),
      trust: Math.max(state.resources.trust ?? 0, 85),
    },
  };
}

function withYearTwoProductTeam(state: GameState): GameState {
  const yearTwoTeamIds = ["garage_junior_dev", "prompt_architect", "data_curator", "infra_operator"];

  return yearTwoTeamIds.reduce((currentState, agentTypeId) => {
    if (currentState.hiredAgents.some((agent) => agent.typeId === agentTypeId)) {
      return withYearTwoProductResourceFloors(currentState);
    }

    const agentType = agentTypes.find((agent) => agent.id === agentTypeId);
    if (!agentType) return withYearTwoProductResourceFloors(currentState);

    return hireAgent(agentType, withYearTwoProductResourceFloors(currentState));
  }, withYearTwoProductResourceFloors(state));
}

function createAnnualRewardBiasScenarioState(): GameState {
  const reviewedState = createAnnualReviewScenarioState();
  const directedState = chooseAnnualDirective("trust_compound_program", reviewedState);
  const rewardProduct = products.find((product) => product.id === "customer_support_chatbot");
  if (!rewardProduct) return directedState;

  return {
    ...directedState,
    roguelite: createReleaseCardReward(
      rewardProduct,
      { grade: "A", score: 88, quote: "기업 고객이 안심할 수 있다." },
      directedState,
    ),
    timeline: ["연간 지시 보상 편향 QA: 신뢰 지시가 카드 보상 후보를 기울임", ...directedState.timeline].slice(0, 8),
  };
}

function createAnnualStrategyScenarioState(): GameState {
  const reviewedState = createAnnualReviewScenarioState();
  const directedState = chooseAnnualDirective("trust_compound_program", {
    ...reviewedState,
    capabilities: {
      ...reviewedState.capabilities,
      language: Math.max(reviewedState.capabilities.language ?? 0, 2),
    },
    unlockedDomains: [...new Set([...reviewedState.unlockedDomains, "customer_support"])],
    resources: {
      ...reviewedState.resources,
      cash: Math.max(reviewedState.resources.cash ?? 0, 22000),
      compute: Math.max(reviewedState.resources.compute ?? 0, 90),
      data: Math.max(reviewedState.resources.data ?? 0, 90),
      talent: Math.max(reviewedState.resources.talent ?? 0, 4),
    },
  });

  return {
    ...directedState,
    competitorStates: directedState.competitorStates.map((competitor) =>
      competitor.id === "competitor_chatgody"
        ? {
            ...competitor,
            score: Math.max(competitor.score, 145),
            marketShare: Math.max(competitor.marketShare, 34),
            momentum: Math.max(competitor.momentum, 7),
            claimedProducts: [...new Set([...competitor.claimedProducts, "customer_support_chatbot"])],
            lastMove: "고객지원 시장 신뢰 인증 선점",
          }
        : competitor,
    ),
    timeline: ["연간 전략실 QA: 신뢰 지시가 제품, 연구, 경쟁 대응 추천으로 확장", ...directedState.timeline].slice(0, 8),
  };
}

function createFinaleState(): GameState {
  return {
    ...createInitialState(),
    month: 120,
    locationId: "seoul_ai_tower",
    activeProducts: products.slice(0, 7).map((product) => product.id),
    productLevels: Object.fromEntries(products.slice(0, 7).map((product) => [product.id, 2])),
    resources: {
      ...createInitialState().resources,
      cash: 320000,
      users: 220000,
      trust: 88,
      automation: 72,
      data: 600,
      compute: 420,
    },
    status: "success",
    timeline: ["10년 엔딩 QA: 시골 차고에서 출발해 서울 AI 타워의 세계적 회사가 됨", ...createInitialState().timeline].slice(0, 8),
  };
}

function createFoundationScenarioState(): GameState {
  const activeProductIds = products.slice(0, 6).map((product) => product.id);

  return {
    ...createInitialState(),
    month: 48,
    locationId: "seoul_ai_tower",
    activeProducts: activeProductIds,
    productLevels: Object.fromEntries(activeProductIds.map((productId) => [productId, 2])),
    unlockedDomains: [
      "foundation_models",
      "personal_productivity",
      "developer_tools",
      "creator_tools",
      "robotics",
      "mobility",
    ],
    capabilities: {
      ...createInitialState().capabilities,
      language: 3,
      code: 3,
      vision: 3,
      video: 2,
      agent: 2,
      robotics: 2,
    },
    resources: {
      ...createInitialState().resources,
      cash: 120000,
      compute: 1200,
      data: 1200,
      users: 60000,
      trust: 80,
      hype: 35,
      automation: 65,
      talent: 20,
    },
    timeline: ["콘텐츠 기반 QA: 기업 단계에서 추천 고용과 추천 아이템을 확인", ...createInitialState().timeline].slice(0, 8),
  };
}

function createCampaignShockScenarioState(): GameState {
  const shockReady = {
    ...createInitialState(),
    month: 36,
    activeProducts: ["foundation_model_v0", "ai_writing_assistant"],
    productLevels: {
      foundation_model_v0: 1,
      ai_writing_assistant: 1,
    },
    resources: {
      ...createInitialState().resources,
      cash: 60000,
      compute: 600,
      data: 420,
      users: 9000,
      trust: 64,
      automation: 20,
    },
    campaignShockHistory: [],
    seenTutorials: [
      "welcome_garage",
      "agent_hired",
      "product_ideas",
      "development_project",
      "card_reward",
      "next_run_setup",
      "office_growth",
      "competition_pressure",
    ],
    timeline: ["v0.33 시장 충격 QA: 3년차 충격 직전 상태", ...createInitialState().timeline].slice(0, 8),
  };

  return applyDueCampaignShocks(shockReady);
}

function createResourceVisibilityScenarioState(): GameState {
  const initialState = createInitialState();

  return {
    ...initialState,
    month: 18,
    activeProducts: ["foundation_model_v0", "ai_writing_assistant", "ai_coding_assistant"],
    productLevels: {
      foundation_model_v0: 2,
      ai_writing_assistant: 2,
      ai_coding_assistant: 1,
    },
    productProjects: [
      {
        id: "qa_frontier_reasoning_model",
        productId: "frontier_reasoning_model",
        progress: 72,
        quality: 68,
        assignedAgentIds: [],
        startedMonth: 17,
      },
    ],
    resources: {
      ...initialState.resources,
      cash: 72000,
      compute: 280,
      data: 760,
      users: 24000,
      trust: 76,
      hype: 38,
      automation: 22,
    },
    capabilities: {
      ...initialState.capabilities,
      language: 3,
      code: 2,
      optimization: 1,
    },
    seenTutorials: [
      "welcome_garage",
      "agent_hired",
      "product_ideas",
      "development_project",
      "card_reward",
      "next_run_setup",
      "office_growth",
      "competition_pressure",
    ],
    timeline: [
      "AI 자원 가시화 QA: 연구 패널에서 월간 compute, 데이터, 다음 출시 compute를 확인",
      ...initialState.timeline,
    ].slice(0, 8),
  };
}

function createPhysicalIndustriesScenarioState(): GameState {
  const initialState = createInitialState();
  const physicalIndustryDomainIds = ["manufacturing", "logistics", "energy"];

  return {
    ...initialState,
    month: 24,
    unlockedDomains: [...new Set([...initialState.unlockedDomains, ...physicalIndustryDomainIds])],
    capabilities: {
      ...initialState.capabilities,
      robotics: 2,
      manufacturing: 3,
      logistics: 2,
      agent: 2,
      optimization: 3,
      enterprise: 1,
      vision: 2,
    },
    resources: {
      ...initialState.resources,
      cash: 180000,
      compute: 1600,
      data: 1500,
      users: 32000,
      trust: 84,
      hype: 44,
      automation: 48,
      talent: 16,
    },
    seenTutorials: [
      "welcome_garage",
      "agent_hired",
      "product_ideas",
      "development_project",
      "card_reward",
      "next_run_setup",
      "office_growth",
      "competition_pressure",
    ],
    timeline: [
      "v0.60 물리 산업 QA: 제조, 물류, 에너지 도메인과 시작 제품 후보를 제품 패널에서 확인",
      ...initialState.timeline,
    ].slice(0, 8),
  };
}

function createPayoffJuiceScenarioState(): GameState {
  const physicalState = createPhysicalIndustriesScenarioState();
  return {
    ...physicalState,
    timeline: [
      "v0.62 페이오프 QA: 풀스택 물리 제국 조합 발동 셀러브레이션을 즉시 확인",
      ...physicalState.timeline,
    ].slice(0, 8),
  };
}

function createPayoffCollectionScenarioState(): GameState {
  const initialState = createInitialState();

  return {
    ...initialState,
    month: 30,
    discoveredPayoffIds: [
      "combo:full_stack_physical_empire",
      "combo:robot_factory_subscription",
      "synergy:robotics_manufacturing_cell",
      "synergy:factory_energy_loop",
    ],
    seenTutorials: [
      "welcome_garage",
      "agent_hired",
      "product_ideas",
      "development_project",
      "card_reward",
      "next_run_setup",
      "office_growth",
      "competition_pressure",
    ],
    timeline: [
      "v0.62 도감 QA: 발견된 페이오프와 잠긴 ??? 항목을 제품 패널에서 확인",
      ...initialState.timeline,
    ].slice(0, 8),
  };
}

function createMilestoneScenarioState(): GameState {
  const initialState = createInitialState();
  const reviewReward = { cash: 3500, trust: 4, hype: 6 };

  return {
    ...initialState,
    month: 12,
    activeProducts: ["foundation_model_v0"],
    productLevels: {
      ...initialState.productLevels,
      foundation_model_v0: 1,
    },
    resources: {
      ...initialState.resources,
      cash: 5500,
      users: 820,
      trust: 34,
      hype: 12,
    },
    unlockedAchievements: ["first_release"],
    annualReviewHistory: [
      {
        reviewId: "year_1_local_demo_day",
        year: 1,
        month: 12,
        passed: true,
        score: 100,
        title: "지역 AI 데모데이",
        summary: "지역 AI 데모데이 통과: 첫 심사를 간발의 차로 넘겼습니다.",
        reward: reviewReward,
      },
    ],
    seenTutorials: [
      "welcome_garage",
      "agent_hired",
      "product_ideas",
      "development_project",
      "card_reward",
      "next_run_setup",
      "office_growth",
      "competition_pressure",
    ],
    timeline: [
      "v0.62 마일스톤 QA: 업적 팡파레와 연간 심사 near-miss relief를 회사 패널에서 확인",
      ...initialState.timeline,
    ].slice(0, 8),
  };
}

export function getQaScenarioId(value: string | null): QaScenarioId | undefined {
  return qaScenarioIds.find((id) => id === value);
}

export function createQaScenarioFromSearch(search: string): QaScenario | undefined {
  const params = new URLSearchParams(search);
  const scenarioId = getQaScenarioId(params.get("scenario") ?? params.get("qa"));
  if (!scenarioId) return undefined;

  const scenario = createQaScenario(scenarioId);
  const menu = getQaMenuId(params.get("menu"));
  return menu ? { ...scenario, activeMenu: menu } : scenario;
}

function getQaMenuId(value: string | null): MenuId | undefined {
  const menuIds: MenuId[] = ["company", "products", "deck", "agents", "research", "shop", "competition", "log"];
  return menuIds.find((menuId) => menuId === value);
}

function createStaffingState(): GameState {
  const architect = agentTypes.find((agent) => agent.id === "prompt_architect");
  const curator = agentTypes.find((agent) => agent.id === "data_curator");

  if (!architect || !curator) return createInitialState();

  const staffed = hireAgent(curator, hireAgent(architect, createInitialState()));

  return {
    ...staffed,
    seenTutorials: [...staffed.seenTutorials, "welcome_garage", "agent_hired"],
  };
}

function createStaffIncidentState(): GameState {
  const architect = agentTypes.find((agent) => agent.id === "prompt_architect");
  const curator = agentTypes.find((agent) => agent.id === "data_curator");
  const junior = agentTypes.find((agent) => agent.id === "garage_junior_dev");
  const writingProduct = products.find((product) => product.id === "ai_writing_assistant");

  if (!architect || !curator || !junior || !writingProduct) return createInitialState();

  const staffed = hireAgent(junior, hireAgent(curator, hireAgent(architect, createInitialState())));
  const projectState = startProductProject(writingProduct, staffed, [staffed.hiredAgents[0].id]);

  return {
    ...projectState,
    hiredAgents: projectState.hiredAgents.map((agent) => {
      if (agent.typeId === "prompt_architect") {
        return { ...agent, level: 4, energy: 18, loyalty: 38 };
      }
      if (agent.typeId === "data_curator") {
        return {
          ...agent,
          level: 1,
          energy: 76,
          loyalty: 42,
          recruitmentChannelId: "headhunter",
          salaryMultiplier: 1.75,
          riskLabel: "계약 불만",
        };
      }
      return { ...agent, energy: 72, loyalty: 68 };
    }),
    timeline: ["인사 사건 QA: 번아웃, 스카우트, 계약 불만을 동시에 확인", ...projectState.timeline].slice(0, 8),
  };
}

function createStaffResolutionState(): GameState {
  const incidentState = createStaffIncidentState();
  const burnout = getStaffIncidentBriefs(incidentState).find((incident) => incident.type === "burnout");
  if (!burnout) return incidentState;
  const resolved = resolveStaffIncident(burnout.id, "recovery_day", incidentState);

  return {
    ...resolved,
    timeline: ["인사 대응 결과 QA: 회복일 지정 결과 카드 확인", ...resolved.timeline].slice(0, 8),
  };
}

function createStaffAftermathState(): GameState {
  const incidentState = createStaffIncidentState();
  const afterMonth = advanceMonth(incidentState);

  return {
    ...afterMonth,
    timeline: ["인사 후폭풍 QA: 미대응 사건이 월간 압박으로 반영됨", ...afterMonth.timeline].slice(0, 8),
  };
}

function createStarterProjectState(): GameState {
  const architect = agentTypes.find((agent) => agent.id === "prompt_architect");
  const writingProduct = products.find((product) => product.id === "ai_writing_assistant");

  if (!architect || !writingProduct) return createInitialState();

  return startProductProject(writingProduct, hireAgent(architect, createInitialState()));
}

function createOfficeScenarioState(releaseState: GameState): GameState {
  const startupSuite = officeExpansions.find((expansion) => expansion.id === "startup_suite");
  const decorIds = ["gpu_rack_mini", "ux_sticky_wall", "tensor_whiteboard"];
  const decorItems = decorIds
    .map((itemId) => items.find((item) => item.id === itemId))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const fundedState: GameState = {
    ...releaseState,
    resources: {
      ...releaseState.resources,
      cash: Math.max(releaseState.resources.cash ?? 0, 16000),
      data: Math.max(releaseState.resources.data ?? 0, 60),
      compute: Math.max(releaseState.resources.compute ?? 0, 120),
    },
  };
  const expandedState = startupSuite ? buyOfficeExpansion(startupSuite, fundedState) : fundedState;
  const decoratedState = decorItems.reduce((state, item) => buyItem(item, state), expandedState);

  return {
    ...decoratedState,
    timeline: ["사무실 확장 QA: 스타트업 스위트와 핵심 장식을 배치", ...decoratedState.timeline].slice(0, 8),
  };
}

function createFirstTenMinuteFlowState(strategyState: GameState): GameState {
  const startupSuite = officeExpansions.find((expansion) => expansion.id === "startup_suite");
  const gpuRack = items.find((item) => item.id === "gpu_rack_mini");
  const alphaState = runTenMinuteAlphaSimulation(strategyState.chosenGrowthPath?.id ?? "productivity_line").finalState;
  const fundedState: GameState = {
    ...alphaState,
    currentEvent: undefined,
    currentRivalEvent: undefined,
    month: Math.max(alphaState.month, 10),
    seenTutorials: [
      ...new Set([
        ...(alphaState.seenTutorials ?? []),
        "welcome_garage",
        "agent_hired",
        "product_ideas",
        "development_project",
        "card_reward",
        "next_run_setup",
        "office_growth",
        "competition_pressure",
      ]),
    ],
    resources: {
      ...alphaState.resources,
      cash: Math.max(alphaState.resources.cash ?? 0, 12000),
      data: Math.max(alphaState.resources.data ?? 0, 40),
      compute: Math.max(alphaState.resources.compute ?? 0, 80),
    },
  };
  const expandedState = startupSuite && fundedState.office.expansionId !== startupSuite.id ? buyOfficeExpansion(startupSuite, fundedState) : fundedState;
  const decoratedState = gpuRack && !expandedState.ownedItems.includes(gpuRack.id) ? buyItem(gpuRack, expandedState) : expandedState;

  return {
    ...decoratedState,
    timeline: ["v0.56 첫 10분 흐름 QA: 첫 출시, 카드 체감, 사무실 정비, 경쟁 대응 후 연간 심사까지 2개월", ...decoratedState.timeline].slice(0, 8),
  };
}

function createTenMinuteAlphaState(): GameState {
  const alphaState = runTenMinuteAlphaSimulation("productivity_line").finalState;

  return {
    ...alphaState,
    timeline: ["10분 알파 완주 QA: 결과 화면, 통찰 보상, 다음 런 전환 확인", ...alphaState.timeline].slice(0, 8),
  };
}

function createNextRunState(): GameState {
  const alphaState = runTenMinuteAlphaSimulation("productivity_line").finalState;
  const nextRunState = resetRunWithMetaUnlocks(alphaState);

  return {
    ...nextRunState,
    timeline: ["새 런 진입 QA: 덱 메뉴에서 최근 런 기록과 메타 해금 후보 확인", ...nextRunState.timeline].slice(0, 8),
  };
}

function createRestartSetupState(): GameState {
  const alphaState = runTenMinuteAlphaSimulation("productivity_line").finalState;

  return {
    ...alphaState,
    seenTutorials: [
      ...new Set([
        ...(alphaState.seenTutorials ?? []),
        "welcome_garage",
        "agent_hired",
        "product_ideas",
        "development_project",
        "card_reward",
        "next_run_setup",
        "office_growth",
        "competition_pressure",
      ]),
    ],
    timeline: ["v0.32 재시작 설계 QA: 다음 런 설계실에서 빠른 시작, 추천 해금, 시작 덱을 비교", ...alphaState.timeline].slice(0, 8),
  };
}

function createCounterScenarioState(strategyState: GameState): GameState {
  let counterState = strategyState;
  while (counterState.month < 5) {
    counterState = advanceMonth(counterState);
  }

  const counterCardIds = ["market_repositioning", "rival_benchmark_room"];
  const hand = [
    ...counterCardIds,
    ...counterState.roguelite.deck.hand.filter((cardId) => !counterCardIds.includes(cardId)),
  ].slice(0, 7);

  return {
    ...counterState,
    resources: {
      ...counterState.resources,
      cash: Math.max(counterState.resources.cash ?? 0, 3200),
      data: Math.max(counterState.resources.data ?? 0, 12),
      trust: Math.max(counterState.resources.trust ?? 0, 45),
    },
    competitorStates: counterState.competitorStates.map((competitor) =>
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
      ...counterState.roguelite,
      deck: {
        ...counterState.roguelite.deck,
        hand,
        drawPile: counterState.roguelite.deck.drawPile.filter((cardId) => !counterCardIds.includes(cardId)),
        discardPile: counterState.roguelite.deck.discardPile.filter((cardId) => !counterCardIds.includes(cardId)),
        playedThisTurn: [],
      },
    },
    timeline: ["경쟁 대응 QA: 챗지오디가 회의 요약 봇 시장을 선점", ...counterState.timeline].slice(0, 8),
  };
}

function createResultRecapState(): GameState {
  const commercialState = runScriptedCommercialSimulation("productivity_line", 11).finalState;
  const reviewedProductId = Object.keys(commercialState.productReviews)[0] ?? "ai_writing_assistant";
  const rewardHistory = commercialState.roguelite.rewardHistory.length
    ? commercialState.roguelite.rewardHistory
    : [
        {
          rewardId: "qa_result_reward",
          productId: reviewedProductId,
          chosenCardId: "customer_interviews",
          month: Math.max(2, commercialState.month - 2),
        },
      ];

  return {
    ...commercialState,
    roguelite: {
      ...commercialState.roguelite,
      rewardHistory,
    },
    timeline: ["런 결과 QA: 대표 제품, 대표 카드, 경쟁 압박, 창업 통찰 카드 확인", ...commercialState.timeline].slice(0, 8),
  };
}
