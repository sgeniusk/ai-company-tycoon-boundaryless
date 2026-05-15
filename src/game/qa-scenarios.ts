import { agentTypes, items, officeExpansions, products } from "./data";
import { runScriptedCommercialSimulation } from "./run-simulator";
import { advanceMonth, buyItem, buyOfficeExpansion, chooseGrowthPath, createInitialState, hireAgent, startProductProject } from "./simulation";
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
  "strategy",
  "counter",
  "rivals",
  "arc",
  "flow",
  "commercial",
  "result",
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

  return {
    id,
    label: "출시 스포트라이트 QA",
    state: releaseState,
    activeMenu: "company",
  };
}

export function getQaScenarioId(value: string | null): QaScenarioId | undefined {
  return qaScenarioIds.find((id) => id === value);
}

export function createQaScenarioFromSearch(search: string): QaScenario | undefined {
  const params = new URLSearchParams(search);
  const scenarioId = getQaScenarioId(params.get("scenario") ?? params.get("qa"));
  return scenarioId ? createQaScenario(scenarioId) : undefined;
}

function createStaffingState(): GameState {
  const architect = agentTypes.find((agent) => agent.id === "prompt_architect");
  const curator = agentTypes.find((agent) => agent.id === "data_curator");

  if (!architect || !curator) return createInitialState();

  return hireAgent(curator, hireAgent(architect, createInitialState()));
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
