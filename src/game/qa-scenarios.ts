import { agentTypes, products } from "./data";
import { runScriptedCommercialSimulation } from "./run-simulator";
import { advanceMonth, chooseGrowthPath, createInitialState, hireAgent, startProductProject } from "./simulation";
import type { GameState } from "./types";
import type { MenuId } from "../ui/menu";

export const qaScenarioIds = ["fresh", "project", "release", "shop", "deck", "strategy", "arc", "commercial"] as const;

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

  if (id === "project") {
    return {
      id,
      label: "개발 중 QA",
      state: projectState,
      activeMenu: "products",
    };
  }

  const releaseState = advanceMonth(advanceMonth(projectState));

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

function createStarterProjectState(): GameState {
  const architect = agentTypes.find((agent) => agent.id === "prompt_architect");
  const writingProduct = products.find((product) => product.id === "ai_writing_assistant");

  if (!architect || !writingProduct) return createInitialState();

  return startProductProject(writingProduct, hireAgent(architect, createInitialState()));
}
