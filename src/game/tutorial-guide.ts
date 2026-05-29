import { getOfficeGrowthPlan } from "./simulation";
import type { GameState, TutorialGuide } from "./types";

interface TutorialGuideRule extends TutorialGuide {
  visible: (state: GameState, activeMenu?: string) => boolean;
}

const helperName = "미나";

const tutorialGuideRules: TutorialGuideRule[] = [
  {
    id: "welcome_garage",
    helperName,
    title: "차고 AI 회사를 시작했어요",
    message: "강원 산골 차고에서 사람과 AI 에이전트를 한 팀으로 묶어 첫 제품 출시까지 밀어보세요. 경쟁사가 움직이기 전에 첫 시장 반응을 잡는 게 목표입니다.",
    targetMenu: "agents",
    actionLabel: "인재 보기",
    visible: () => true,
  },
  {
    id: "agent_hired",
    helperName,
    title: "첫 팀원이 합류했어요",
    message: "이제 제품 메뉴 상단의 추천 첫 제품 카드에서 자동 팀을 확인하고 바로 개발을 시작할 수 있습니다.",
    targetMenu: "products",
    actionLabel: "첫 제품 개발",
    visible: (state) => state.hiredAgents.length > 0,
  },
  {
    id: "development_project",
    helperName,
    title: "개발 프로젝트가 돌아가요",
    message: "개발 중에는 덱 메뉴에서 카드와 개발 퍼즐로 완성도를 더 끌어올릴 수 있습니다. 출시 점수는 다음 성장 선택에 영향을 줍니다.",
    targetMenu: "deck",
    actionLabel: "덱 확인",
    visible: (state) => state.productProjects.length > 0,
  },
  {
    id: "card_reward",
    helperName,
    title: "출시 보상 카드가 도착했어요",
    message: "제품을 출시하면 카드 보상을 고를 수 있습니다. 이번 런의 회사 전략을 어떤 방향으로 굳힐지 정하는 순간입니다.",
    targetMenu: "deck",
    actionLabel: "보상 선택",
    visible: (state) => Boolean(state.roguelite.pendingCardReward),
  },
  {
    id: "product_ideas",
    helperName,
    title: "아이디어 조합실이 열렸어요",
    message: "첫 출시 이후에는 소재, 제품 타입, 파격 옵션을 조합해 앱부터 전기차, 커피 프랜차이즈까지 다음 개발 후보로 넓힐 수 있습니다.",
    targetMenu: "products",
    actionLabel: "조합 보기",
    visible: (state, activeMenu) => activeMenu === "products" && state.hiredAgents.length > 0 && state.activeProducts.length > 0,
  },
  {
    id: "next_run_setup",
    helperName,
    title: "다음 런 설계실이 열렸어요",
    message: "10개월 이후에는 이번 회사의 실수와 성과를 다음 창업의 해금, 시작 덱, 빠른 시작 선택으로 바꿀 수 있습니다.",
    targetMenu: "deck",
    actionLabel: "설계실 보기",
    visible: (state, activeMenu) => activeMenu === "deck" && state.month >= 10 && state.roguelite.runNumber === 1,
  },
  {
    id: "office_growth",
    helperName,
    title: "사무실 성장 플래너가 켜졌어요",
    message: "팀이 커지면 확장, 지역 이전, 장식 시너지를 비교해야 합니다. 상점에서 다음 공간 선택을 한 번에 볼 수 있습니다.",
    targetMenu: "shop",
    actionLabel: "상점 열기",
    visible: (state) => state.activeProducts.length > 0 && getOfficeGrowthPlan(state).primaryAction.kind !== "maintain",
  },
  {
    id: "competition_pressure",
    helperName,
    title: "경쟁사가 움직이기 시작했어요",
    message: "경쟁 메뉴에서 누가 어떤 시장을 선점했는지 확인하고, 카드와 제품으로 대응 방향을 잡아보세요.",
    targetMenu: "competition",
    actionLabel: "경쟁 확인",
    visible: (state) =>
      state.activeProducts.length > 0 &&
      state.competitorStates.some((competitor) => competitor.claimedProducts.length > 0 || competitor.marketShare >= 18),
  },
];

export const tutorialGuideAuditRules = tutorialGuideRules.map(({ id, title, message, targetMenu, actionLabel }) => ({
  id,
  title,
  message,
  targetMenu,
  actionLabel,
}));

export function getTutorialGuide(state: GameState, activeMenu?: string): TutorialGuide | undefined {
  const seen = new Set(state.seenTutorials ?? []);
  const guide = tutorialGuideRules.find((rule) => !seen.has(rule.id) && rule.visible(state, activeMenu));
  if (!guide) return undefined;

  return {
    id: guide.id,
    helperName: guide.helperName,
    title: guide.title,
    message: guide.message,
    targetMenu: guide.targetMenu,
    actionLabel: guide.actionLabel,
  };
}
