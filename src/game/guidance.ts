import type { GameState } from "./types";

export type GuidanceMenuId = "company" | "products" | "deck" | "agents" | "research" | "shop" | "competition" | "log";

export interface GuidanceStep {
  id: string;
  title: string;
  description: string;
  actionLabel: string;
  menu?: GuidanceMenuId;
  tone: "primary" | "warning" | "steady";
  priorityLabel?: string;
  helperText?: string;
}

export interface OpeningObjective {
  id: string;
  label: string;
  complete: boolean;
}

export interface FirstTenMinuteStep {
  id: string;
  label: string;
  detail: string;
  menu: GuidanceMenuId;
  complete: boolean;
  active: boolean;
}

export function getOpeningObjectives(state: GameState): OpeningObjective[] {
  const choseNextPath = hasChosenNextGrowthPath(state);

  return [
    {
      id: "hire_agent",
      label: "에이전트 고용",
      complete: state.hiredAgents.length > 0,
    },
    {
      id: "start_product",
      label: "제품 개발 시작",
      complete: state.productProjects.length > 0 || state.activeProducts.length > 0,
    },
    {
      id: "release_product",
      label: "첫 제품 출시",
      complete: state.activeProducts.length > 0,
    },
    {
      id: "choose_next_path",
      label: "다음 성장 선택",
      complete: choseNextPath,
    },
  ];
}

export function getFirstTenMinutePlan(state: GameState): FirstTenMinuteStep[] {
  const steps = getFirstTenMinuteStepDefinitions(state);
  const activeIndex = steps.findIndex((step) => !step.complete);

  return steps.map((step, index) => ({
    ...step,
    active: activeIndex === -1 ? index === steps.length - 1 : index === activeIndex,
  }));
}

export function getFirstTenMinuteProgress(state: GameState): number {
  const plan = getFirstTenMinutePlan(state);
  if (!plan.length) return 0;
  const completedCount = plan.filter((step) => step.complete).length;
  return Math.round((completedCount / plan.length) * 100);
}

export function getGuidanceStep(state: GameState): GuidanceStep {
  if (state.status === "success") {
    return {
      id: "scale_success",
      title: "성공 궤도 진입",
      description: "이미 세계적 AI 회사의 조건을 달성했습니다. 경쟁 메뉴에서 시장 지배력을 확인하세요.",
      actionLabel: "경쟁 확인",
      menu: "competition",
      tone: "primary",
      priorityLabel: "런 목표 달성",
    };
  }

  if (state.status === "failure") {
    return {
      id: "recover_failure",
      title: "운영 위기",
      description: "현금과 신뢰가 무너졌습니다. 새 게임으로 더 짧은 출시 루프를 실험하세요.",
      actionLabel: "새 게임",
      tone: "warning",
      priorityLabel: "재도전",
    };
  }

  const activeStep = getFirstTenMinutePlan(state).find((step) => step.active);
  if (activeStep) return createGuidanceForFirstTenMinuteStep(activeStep, state);

  if (state.currentEvent || state.currentRivalEvent) {
    return {
      id: "resolve_events",
      title: "이슈 대응",
      description: "월간 이슈와 경쟁사 움직임을 처리해야 다음 성장 결정을 깔끔하게 할 수 있습니다.",
      actionLabel: "이슈 선택",
      tone: "warning",
      priorityLabel: "열린 이슈",
    };
  }

  if (state.resources.automation < 10) {
    return {
      id: "add_automation",
      title: "자동화 기반 만들기",
      description: "자동화 투자를 시작하면 운영비 압박을 줄이고 더 큰 제품을 준비할 수 있습니다.",
      actionLabel: "자동화 투자",
      menu: "shop",
      tone: "steady",
      priorityLabel: "운영 안정화",
    };
  }

  return {
    id: "expand_market",
    title: "시장 확장",
    description: "연구로 새 분야를 열고 경쟁사가 선점하기 전에 제품 라인을 늘리세요.",
    actionLabel: "연구하기",
    menu: "research",
    tone: "steady",
    priorityLabel: "확장",
  };
}

function hasChosenNextGrowthPath(state: GameState): boolean {
  return (
    Boolean(state.chosenGrowthPath) ||
    state.ownedItems.length > 0 ||
    state.activeProducts.length > 1 ||
    (state.activeProducts.length > 0 && state.productProjects.length > 0) ||
    Object.values(state.capabilities).some((level) => level > 1)
  );
}

function getFirstTenMinuteStepDefinitions(state: GameState): Omit<FirstTenMinuteStep, "active">[] {
  return [
    {
      id: "hire_agent",
      label: "에이전트 고용",
      detail: "첫 개발자를 확보",
      menu: "agents",
      complete: state.hiredAgents.length > 0,
    },
    {
      id: "start_product",
      label: "제품 시작",
      detail: "작은 AI 제품 착수",
      menu: "products",
      complete: state.productProjects.length > 0 || state.activeProducts.length > 0,
    },
    {
      id: "use_card_issue",
      label: "카드/이슈 대응",
      detail: "손패와 개발 이슈로 품질 보정",
      menu: "deck",
      complete: Boolean(state.lastDevelopmentPuzzle) || state.activeProducts.length > 0,
    },
    {
      id: "release_product",
      label: "첫 출시",
      detail: "리뷰와 보상 획득",
      menu: "products",
      complete: state.activeProducts.length > 0,
    },
    {
      id: "choose_growth_path",
      label: "성장 선택",
      detail: "회사의 방향 결정",
      menu: "products",
      complete: Boolean(state.chosenGrowthPath),
    },
    {
      id: "visit_shop_office",
      label: "사무실 정비",
      detail: "확장과 장식 효과 확보",
      menu: "shop",
      complete: state.office.expansionId !== "garage_lab" || state.office.placedItemIds.length > 0,
    },
    {
      id: "counter_rival",
      label: "경쟁 대응",
      detail: "라이벌 압박 확인",
      menu: "competition",
      complete: Boolean(state.chosenGrowthPath) && (state.month >= 5 || Boolean(state.currentRivalEvent)),
    },
  ];
}

function createGuidanceForFirstTenMinuteStep(step: FirstTenMinuteStep, state: GameState): GuidanceStep {
  if (step.id === "hire_agent") {
    return {
      id: "hire_first_agent",
      title: "첫 에이전트 영입",
      description: "제품 개발을 시작하려면 먼저 프롬프트 설계가나 인프라 오퍼레이터를 고용하세요.",
      actionLabel: "에이전트 고용",
      menu: "agents",
      tone: "primary",
      priorityLabel: "1단계",
      helperText: "첫 30초 목표는 개발 버튼이 열리도록 만드는 것입니다.",
    };
  }

  if (step.id === "start_product") {
    return {
      id: "start_first_project",
      title: "첫 제품 개발",
      description: "고용한 에이전트를 투입해 AI 글쓰기 비서 같은 작은 제품부터 완성하세요.",
      actionLabel: "제품 개발 시작",
      menu: "products",
      tone: "primary",
      priorityLabel: "2단계",
      helperText: "큰 꿈은 나중에 펼치고, 첫 런은 빠른 출시 감각을 먼저 잡습니다.",
    };
  }

  if (step.id === "use_card_issue") {
    return {
      id: "use_card_issue",
      title: "카드와 개발 이슈로 품질 올리기",
      description: "바로 다음 달로 넘기기 전에 덱에서 카드나 3x3 개발 이슈를 한 번 사용해 완성도를 끌어올리세요.",
      actionLabel: "덱 열기",
      menu: "deck",
      tone: "primary",
      priorityLabel: "3단계",
      helperText: state.productProjects.length > 0 ? "카드/이슈 결과는 현재 프로젝트의 진행도와 완성도에 반영됩니다." : undefined,
    };
  }

  if (step.id === "release_product") {
    return {
      id: "advance_project",
      title: "첫 출시까지 밀어붙이기",
      description: "이제 월을 넘겨 첫 제품을 출시하세요. 출시 리뷰가 카드 보상과 성장 분기를 엽니다.",
      actionLabel: "출시까지 진행",
      tone: "primary",
      priorityLabel: "4단계",
      helperText: state.currentEvent || state.currentRivalEvent ? "열린 이슈가 있어도 첫 출시 흐름은 계속 보이게 유지합니다." : undefined,
    };
  }

  if (step.id === "choose_growth_path") {
    return {
      id: "choose_growth_path",
      title: "다음 성장 분기 선택",
      description: "첫 출시가 끝났습니다. 생산성 제품군, 신뢰 기반 엔터프라이즈, 코드/비전 연구 중 다음 회사를 정하세요.",
      actionLabel: "성장 분기 보기",
      menu: "products",
      tone: "primary",
      priorityLabel: "5단계",
      helperText: "성장 분기는 이후 제품 추천, 경쟁사 충돌, 월간 보너스에 영향을 줍니다.",
    };
  }

  if (step.id === "visit_shop_office") {
    return {
      id: "visit_shop_office",
      title: "상점에서 사무실을 정비하기",
      description: "출시 후에는 사무실 확장과 장식 아이템으로 고용 한도와 개발 품질 보너스를 챙기세요.",
      actionLabel: "상점 열기",
      menu: "shop",
      tone: "steady",
      priorityLabel: "6단계",
      helperText: "사무실이 넓어질수록 더 많은 에이전트를 고용하고 장식 효과를 배치할 수 있습니다.",
    };
  }

  return {
    id: "counter_rival",
    title: "경쟁사 대응 플랜 확인",
    description: "이제 경쟁 메뉴에서 챗지오디 같은 라이벌이 어떤 시장을 선점하는지 보고 대응 카드와 제품을 고르세요.",
    actionLabel: "경쟁 확인",
    menu: "competition",
    tone: "steady",
    priorityLabel: "7단계",
    helperText: "첫 10분의 목표는 한 번 출시하고 다음 경쟁 방향까지 보는 것입니다.",
  };
}
