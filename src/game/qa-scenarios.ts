import { agentTypes, items, officeExpansions, products } from "./data";
import { chooseAnnualDirective } from "./annual-review";
import { applyDueCampaignShocks } from "./campaign-shocks";
import { createReleaseCardReward, getStrategyCardById, playStrategyCard } from "./deckbuilding";
import { resetRunWithMetaUnlocks } from "./meta-progression";
import { runPersonaPlaytestReview } from "./persona-playtest";
import { evaluateAlphaReadiness, runScriptedCommercialSimulation, runTenMinuteAlphaSimulation, runTenYearCampaignSimulation } from "./run-simulator";
import {
  advanceMonth,
  buyItem,
  buyOfficeExpansion,
  chooseGrowthPath,
  createInitialState,
  getStaffIncidentBriefs,
  hireAgent,
  resolveStaffIncident,
  startProductProject,
} from "./simulation";
import type { GameState } from "./types";
import type { MenuId } from "../ui/menu";

export const qaScenarioIds = [
  "fresh",
  "staffing",
  "project",
  "release",
  "reward",
  "shop",
  "office",
  "deck",
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
] as const;

export type QaScenarioId = (typeof qaScenarioIds)[number];

export interface QaScenario {
  id: QaScenarioId;
  label: string;
  state: GameState;
  activeMenu: MenuId;
}

export function createQaScenario(id: QaScenarioId): QaScenario {
  if (id === "fresh") {
    return {
      id,
      label: "첫 화면 QA",
      state: createInitialState(),
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
      state: releaseState,
      activeMenu: "deck",
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
      label: "덱 퍼즐 QA",
      state: projectState,
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
      label: "v0.21 20인 페르소나 QA",
      state: {
        ...campaign.finalState,
        timeline: [
          `v0.21 20인 페르소나: ${report.verdict} / ${report.score}점 / ${report.personaCount}명`,
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
      label: "v0.22 출시 체감 QA",
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
      label: "v0.43 그래픽 자산/사무실 액터 QA",
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
    if (index === 1) return { ...agent, energy: 74, loyalty: 38 };
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

  return {
    ...baseState,
    hiredAgents,
    ownedItems: [...new Set([...baseState.ownedItems, ...visualDecorItemIds])],
    office: {
      ...baseState.office,
      placedItemIds: visualDecorItemIds,
    },
    timeline: ["v0.41 사무실 픽셀 시뮬레이션 QA: 구획, 사람, AI, 로봇 액터를 한 화면에서 확인", ...baseState.timeline].slice(0, 8),
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
    timeline: ["출시 체감 QA: 카드가 첫 제품 성과와 보상 패널에 반영됨", ...state.timeline].slice(0, 8),
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

  return hireAgent(curator, hireAgent(architect, createInitialState()));
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
  const fundedState: GameState = {
    ...strategyState,
    resources: {
      ...strategyState.resources,
      cash: Math.max(strategyState.resources.cash ?? 0, 12000),
      data: Math.max(strategyState.resources.data ?? 0, 40),
      compute: Math.max(strategyState.resources.compute ?? 0, 80),
    },
  };
  const expandedState = startupSuite ? buyOfficeExpansion(startupSuite, fundedState) : fundedState;
  const decoratedState = gpuRack ? buyItem(gpuRack, expandedState) : expandedState;

  return {
    ...decoratedState,
    timeline: ["첫 10분 흐름 QA: 출시, 성장 선택, 사무실 정비 후 경쟁 대응 직전", ...decoratedState.timeline].slice(0, 8),
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
