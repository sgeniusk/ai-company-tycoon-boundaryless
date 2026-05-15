import { agentTypes, products } from "./data";
import { runScriptedCommercialSimulation } from "./run-simulator";
import { advanceMonth, chooseGrowthPath, createInitialState, hireAgent, startProductProject } from "./simulation";
import type { GameState } from "./types";
import type { MenuId } from "../ui/menu";

export const qaScenarioIds = ["fresh", "staffing", "project", "release", "reward", "shop", "deck", "strategy", "rivals", "arc", "commercial"] as const;

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

  if (id === "commercial") {
    return {
      id,
      label: "상용 준비 QA",
      state: runScriptedCommercialSimulation("productivity_line").finalState,
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
