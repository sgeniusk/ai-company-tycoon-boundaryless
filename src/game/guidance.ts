import type { GameState } from "./types";

export type GuidanceMenuId = "company" | "products" | "agents" | "research" | "shop" | "competition" | "log";

export interface GuidanceStep {
  id: string;
  title: string;
  description: string;
  actionLabel: string;
  menu?: GuidanceMenuId;
  tone: "primary" | "warning" | "steady";
}

export interface OpeningObjective {
  id: string;
  label: string;
  complete: boolean;
}

export function getOpeningObjectives(state: GameState): OpeningObjective[] {
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
      complete: state.ownedItems.length > 0 || Object.values(state.capabilities).some((level) => level > 1),
    },
  ];
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
    };
  }

  if (state.status === "failure") {
    return {
      id: "recover_failure",
      title: "운영 위기",
      description: "현금과 신뢰가 무너졌습니다. 새 게임으로 더 짧은 출시 루프를 실험하세요.",
      actionLabel: "새 게임",
      tone: "warning",
    };
  }

  if (state.hiredAgents.length === 0) {
    return {
      id: "hire_first_agent",
      title: "첫 에이전트 영입",
      description: "제품 개발을 시작하려면 먼저 프롬프트 설계가나 인프라 오퍼레이터를 고용하세요.",
      actionLabel: "에이전트 고용",
      menu: "agents",
      tone: "primary",
    };
  }

  if (state.productProjects.length === 0 && state.activeProducts.length === 0) {
    return {
      id: "start_first_project",
      title: "첫 제품 개발",
      description: "고용한 에이전트를 투입해 AI 글쓰기 비서 같은 작은 제품부터 완성하세요.",
      actionLabel: "제품 개발 시작",
      menu: "products",
      tone: "primary",
    };
  }

  if (state.productProjects.length > 0) {
    return {
      id: "advance_project",
      title: "개발 진행",
      description: "프로젝트는 월 단위로 진행됩니다. 다음 달로 넘기면 진척도와 완성도가 올라갑니다.",
      actionLabel: "다음 달 진행",
      tone: "primary",
    };
  }

  if (state.activeProducts.length > 0 && state.ownedItems.length === 0) {
    return {
      id: "buy_first_item",
      title: "첫 아이템 구매",
      description: "출시 후에는 장비나 사무실 물건으로 성장 속도와 팀 개성을 키우세요.",
      actionLabel: "아이템 구매",
      menu: "shop",
      tone: "primary",
    };
  }

  if (state.currentEvent || state.currentRivalEvent) {
    return {
      id: "resolve_events",
      title: "이슈 대응",
      description: "월간 이슈와 경쟁사 움직임을 처리해야 다음 성장 결정을 깔끔하게 할 수 있습니다.",
      actionLabel: "이슈 선택",
      tone: "warning",
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
    };
  }

  return {
    id: "expand_market",
    title: "시장 확장",
    description: "연구로 새 분야를 열고 경쟁사가 선점하기 전에 제품 라인을 늘리세요.",
    actionLabel: "연구하기",
    menu: "research",
    tone: "steady",
  };
}
