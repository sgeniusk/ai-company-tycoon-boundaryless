import { getAnnualReviewCountdown, getAnnualReviewProgress, getCurrentAnnualReview } from "./annual-review";
import { capabilities, products } from "./data";
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

export type AlphaRunRoadmapId = "first_launch" | "card_payoff" | "reward_growth" | "annual_directive" | "year_two_product";

export interface AlphaRunRoadmapStep {
  id: AlphaRunRoadmapId;
  timeLabel: string;
  title: string;
  detail: string;
  rewardPreview: string;
  actionLabel: string;
  menu: GuidanceMenuId;
  complete: boolean;
  active: boolean;
}

export interface AlphaRunCompletionSummary {
  complete: boolean;
  title: string;
  description: string;
  nextActionId: "resolve_issue" | "launch_product" | "choose_reward" | "view_release";
  nextActionLabel: string;
  nextMenu: GuidanceMenuId;
  statusLabel: string;
}

export interface AlphaRunDebriefHighlight {
  id: "products" | "rewards" | "year_two" | "readiness";
  label: string;
  value: string;
  detail: string;
}

export interface AlphaRunDebriefMoment {
  id: "first_release" | "card_payoff" | "annual_directive" | "second_reward";
  label: string;
  title: string;
  detail: string;
}

export interface AlphaRunDebriefSummary {
  title: string;
  subtitle: string;
  statusLabel: string;
  highlights: AlphaRunDebriefHighlight[];
  moments: AlphaRunDebriefMoment[];
  checklist: string[];
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

export function getAlphaRunRoadmap(state: GameState): AlphaRunRoadmapStep[] {
  const enterpriseProduct = products.find((product) => product.id === "enterprise_workflow_agent");
  const firstTenMinuteActiveStep = getFirstTenMinutePlan(state).find((step) => step.active && !step.complete);
  const firstLaunchComplete = state.activeProducts.length > 0;
  const cardPayoffComplete = Boolean(state.lastDevelopmentPuzzle);
  const firstReleasedProductId = state.activeProducts.find((productId) => productId !== enterpriseProduct?.id) ?? state.activeProducts[0];
  const firstRewardStillPending = Boolean(
    state.roguelite.pendingCardReward &&
      (!firstReleasedProductId || state.roguelite.pendingCardReward.productId === firstReleasedProductId),
  );
  const rewardGrowthComplete = Boolean(state.chosenGrowthPath) && !firstRewardStillPending;
  const annualDirectiveComplete = Boolean(
    state.annualDirective ||
      state.pendingAnnualDirectiveChoices?.offeredDirectiveIds.length ||
      state.annualReviewHistory.length > 0,
  );
  const yearTwoProductComplete = Boolean(
    enterpriseProduct &&
      (state.activeProducts.includes(enterpriseProduct.id) ||
        state.productProjects.some((project) => project.productId === enterpriseProduct.id)),
  );
  const steps: Omit<AlphaRunRoadmapStep, "active">[] = [
    {
      id: "first_launch",
      timeLabel: "0-10분",
      title: "첫 제품 출시",
      detail: "팀원 고용, 제품 개발, 첫 출시까지 한 번에 밀어붙입니다.",
      rewardPreview: "보상 카드와 성장 분기",
      actionLabel: firstLaunchComplete ? "출시 확인" : getFirstLaunchRoadmapActionLabel(firstTenMinuteActiveStep),
      menu: firstLaunchComplete ? "products" : firstTenMinuteActiveStep?.menu ?? "agents",
      complete: firstLaunchComplete,
    },
    {
      id: "card_payoff",
      timeLabel: "10-15분",
      title: "카드 영향 확인",
      detail: "첫 개발 이슈에서 카드가 완성도와 출시 결과를 바꾸는 장면을 봅니다.",
      rewardPreview: "덱 빌드 방향",
      actionLabel: cardPayoffComplete ? "결과 보기" : "덱 열기",
      menu: "deck",
      complete: cardPayoffComplete,
    },
    {
      id: "reward_growth",
      timeLabel: "15-18분",
      title: "보상과 성장 선택",
      detail: "출시 보상 카드를 고르고 회사의 다음 성장 분기를 확정합니다.",
      rewardPreview: "월간 운영 보너스",
      actionLabel: rewardGrowthComplete ? "성장 확인" : state.roguelite.pendingCardReward ? "보상 고르기" : "결과 보기",
      menu: "deck",
      complete: rewardGrowthComplete,
    },
    {
      id: "annual_directive",
      timeLabel: "18-24분",
      title: "1년차 심사",
      detail: "첫해 결과를 확인하고 2년차 운영 지시를 고릅니다.",
      rewardPreview: "연간 지시 3택",
      actionLabel: annualDirectiveComplete ? "지시 확인" : rewardGrowthComplete ? "심사까지 진행" : "회사 보기",
      menu: "company",
      complete: annualDirectiveComplete,
    },
    {
      id: "year_two_product",
      timeLabel: "24-30분",
      title: "2년차 신제품 착수",
      detail: "필요 연구를 채운 뒤 기업 업무 에이전트 개발을 시작합니다.",
      rewardPreview: "두 번째 출시 보상",
      actionLabel: yearTwoProductComplete ? "신제품 확인" : getYearTwoProductRoadmapActionLabel(state, enterpriseProduct),
      menu: yearTwoProductComplete ? "products" : getYearTwoProductRoadmapMenu(state, enterpriseProduct),
      complete: yearTwoProductComplete,
    },
  ];
  const activeIndex = steps.findIndex((step) => !step.complete);

  return steps.map((step, index) => ({
    ...step,
    active: activeIndex === -1 ? index === steps.length - 1 : index === activeIndex,
  }));
}

function getFirstLaunchRoadmapActionLabel(step: FirstTenMinuteStep | undefined): string {
  if (!step) return "팀원 고용";
  if (step.id === "hire_agent") return "팀원 고용";
  if (step.id === "start_product") return "제품 개발";
  if (step.id === "use_card_issue") return "카드/이슈";
  if (step.id === "release_product") return "출시 진행";
  if (step.id === "choose_growth_path") return "성장 선택";
  if (step.id === "visit_shop_office") return "사무실 보기";
  if (step.id === "counter_rival") return "경쟁 대응";
  return step.label;
}

function getYearTwoProductRoadmapActionLabel(state: GameState, enterpriseProduct: (typeof products)[number] | undefined): string {
  if (state.pendingAnnualDirectiveChoices?.offeredDirectiveIds.length) return "지시 선택";

  const missingCapability = getYearTwoProductRoadmapMissingCapability(state, enterpriseProduct);
  if (missingCapability) return `${missingCapability.name} 연구`;

  return "신제품 개발";
}

function getYearTwoProductRoadmapMenu(state: GameState, enterpriseProduct: (typeof products)[number] | undefined): GuidanceMenuId {
  if (state.pendingAnnualDirectiveChoices?.offeredDirectiveIds.length) return "company";
  if (getYearTwoProductRoadmapMissingCapability(state, enterpriseProduct)) return "research";
  return "products";
}

function getYearTwoProductRoadmapMissingCapability(
  state: GameState,
  enterpriseProduct: (typeof products)[number] | undefined,
) {
  if (!enterpriseProduct) return undefined;

  const missingCapabilities = Object.entries(enterpriseProduct.required_capabilities)
    .filter(([capabilityId, requiredLevel]) => (state.capabilities[capabilityId] ?? 0) < requiredLevel)
    .map(([capabilityId]) => capabilities.find((capability) => capability.id === capabilityId))
    .filter((capability): capability is NonNullable<typeof capability> => Boolean(capability));

  if (!missingCapabilities.length) return undefined;

  if (!state.unlockedDomains.includes(enterpriseProduct.domain)) {
    const domainUnlocker = missingCapabilities.find((capability) =>
      capability.unlocks_domains?.[String((state.capabilities[capability.id] ?? 0) + 1)] === enterpriseProduct.domain,
    );
    if (domainUnlocker) return domainUnlocker;
  }

  return (
    ["enterprise", "agent"]
      .map((capabilityId) => missingCapabilities.find((capability) => capability.id === capabilityId))
      .find((capability): capability is NonNullable<typeof capability> => Boolean(capability)) ??
    missingCapabilities[0]
  );
}

export function getAlphaRunRoadmapProgress(state: GameState): number {
  const roadmap = getAlphaRunRoadmap(state);
  if (!roadmap.length) return 0;
  const completedCount = roadmap.filter((step) => step.complete).length;
  return Math.round((completedCount / roadmap.length) * 100);
}

export function getActiveAlphaRunRoadmapStep(state: GameState): AlphaRunRoadmapStep | undefined {
  const roadmap = getAlphaRunRoadmap(state);

  return roadmap.find((step) => step.active) ?? roadmap[roadmap.length - 1];
}

export function getAlphaRunActionFeedback(step: Pick<AlphaRunRoadmapStep, "actionLabel" | "rewardPreview">): string {
  return `${step.actionLabel} 실행 · 다음 보상: ${step.rewardPreview}`;
}

export function getAlphaRunCompletionSummary(state: GameState): AlphaRunCompletionSummary | undefined {
  if (getAlphaRunRoadmapProgress(state) < 100) return undefined;

  const enterpriseProduct = products.find((product) => product.id === "enterprise_workflow_agent");
  if (!enterpriseProduct) return undefined;

  const activeEnterpriseProject = state.productProjects.find((project) => project.productId === enterpriseProduct.id);
  const launchedEnterpriseProduct = state.activeProducts.includes(enterpriseProduct.id);
  const pendingEnterpriseReward = state.roguelite.pendingCardReward?.productId === enterpriseProduct.id;
  const enterpriseIssueResolved = Boolean(
    activeEnterpriseProject && state.lastDevelopmentPuzzle?.projectId === activeEnterpriseProject.id,
  );

  if (launchedEnterpriseProduct) {
    if (pendingEnterpriseReward) {
      return {
        complete: true,
        title: "30분 알파런 완주",
        description: `${enterpriseProduct.name} 출시까지 확인했습니다. 출시 보상 카드를 고르면 블라인드 테스트 직전까지의 핵심 루프가 닫힙니다.`,
        nextActionId: "choose_reward",
        nextActionLabel: "두 번째 보상 고르기",
        nextMenu: "deck",
        statusLabel: "두 번째 출시 보상 대기",
      };
    }

    return {
      complete: true,
      title: "30분 알파런 완주",
      description: `${enterpriseProduct.name} 출시까지 확인했습니다. 이제 블라인드 테스트에서 실제 플레이어가 같은 흐름을 따라오는지만 보면 됩니다.`,
      nextActionId: "view_release",
      nextActionLabel: "디브리프 보기",
      nextMenu: "deck",
      statusLabel: "두 번째 보상 선택 완료",
    };
  }

  if (enterpriseIssueResolved) {
    return {
      complete: true,
      title: "30분 알파런 잠금",
      description: `${enterpriseProduct.name} 첫 개발 이슈가 해결됐습니다. 출시까지 진행해 두 번째 보상 순간을 확인하세요.`,
      nextActionId: "launch_product",
      nextActionLabel: "출시까지 진행",
      nextMenu: "products",
      statusLabel: activeEnterpriseProject
        ? `개발 ${Math.round(activeEnterpriseProject.progress)}% · 완성도 ${Math.round(activeEnterpriseProject.quality)}`
        : "신제품 출시 준비",
    };
  }

  return {
    complete: true,
    title: "30분 알파런 잠금",
    description: `${enterpriseProduct.name} 개발이 시작됐습니다. 다음 개발 이슈를 처리하면 두 번째 출시 보상까지 이어집니다.`,
    nextActionId: "resolve_issue",
    nextActionLabel: "다음 개발 이슈",
    nextMenu: "deck",
    statusLabel: activeEnterpriseProject
      ? `개발 ${Math.round(activeEnterpriseProject.progress)}% · 완성도 ${Math.round(activeEnterpriseProject.quality)}`
      : "신제품 개발 착수 완료",
  };
}

export function getAlphaRunDebriefSummary(state: GameState): AlphaRunDebriefSummary | undefined {
  const completion = getAlphaRunCompletionSummary(state);
  if (!completion || completion.nextActionId !== "view_release") return undefined;

  const enterpriseProduct = products.find((product) => product.id === "enterprise_workflow_agent");
  if (!enterpriseProduct || !state.activeProducts.includes(enterpriseProduct.id)) return undefined;

  const releasedProducts = state.activeProducts
    .map((productId) => products.find((product) => product.id === productId))
    .filter((product): product is NonNullable<typeof product> => Boolean(product));
  const rewardHistory = state.roguelite.rewardHistory ?? [];
  const enterpriseRewardPicked = rewardHistory.some((reward) => reward.productId === enterpriseProduct.id);
  if (!enterpriseRewardPicked) return undefined;

  const productNames = releasedProducts.map((product) => product.name).slice(0, 3).join(" / ");
  const releaseGrade = state.lastRelease ? `${state.lastRelease.review.grade} · ${state.lastRelease.review.score}점` : "출시 결과 확인";
  const directiveLabel = state.annualDirective?.title ?? "연간 지시 완료";
  const firstProduct = releasedProducts.find((product) => product.id !== enterpriseProduct.id) ?? releasedProducts[0];
  const lastPuzzleLabel = state.lastDevelopmentPuzzle
    ? `${state.lastDevelopmentPuzzle.verdict} · ${state.lastDevelopmentPuzzle.score}점`
    : "개발 이슈 해결";

  return {
    title: "알파런 디브리프",
    subtitle: "첫 제품, 카드 영향, 성장 분기, 2년차 신제품 보상까지 한 번의 플레이 목표가 닫혔습니다.",
    statusLabel: "블라인드 테스트 직전 점검",
    highlights: [
      {
        id: "products",
        label: "제품 라인",
        value: `${releasedProducts.length}개 출시`,
        detail: productNames || "첫 출시와 신제품 출시 확인",
      },
      {
        id: "rewards",
        label: "덱 보상",
        value: `${rewardHistory.length}장 선택`,
        detail: "첫 보상과 두 번째 보상이 덱 히스토리에 기록됨",
      },
      {
        id: "year_two",
        label: "2년차 성과",
        value: releaseGrade,
        detail: `${directiveLabel} 이후 ${enterpriseProduct.name} 출시`,
      },
      {
        id: "readiness",
        label: "다음 단계",
        value: "5인 블라인드",
        detail: "실제 플레이어가 같은 흐름을 따라오는지 관찰",
      },
    ],
    moments: [
      {
        id: "first_release",
        label: "0-10분",
        title: firstProduct ? `${firstProduct.name} 출시` : "첫 제품 출시",
        detail: "제품 개발에서 시장 반응까지 첫 루프를 확인",
      },
      {
        id: "card_payoff",
        label: "10-15분",
        title: "카드 영향 체감",
        detail: lastPuzzleLabel,
      },
      {
        id: "annual_directive",
        label: "18-24분",
        title: directiveLabel,
        detail: "2년차 운영 방향을 고정",
      },
      {
        id: "second_reward",
        label: "24-30분",
        title: `${enterpriseProduct.name} 보상 선택`,
        detail: `${releaseGrade} 출시 후 덱 보상까지 완료`,
      },
    ],
    checklist: ["첫 출시 의미 이해", "카드가 개발 결과를 바꾸는 장면 확인", "성장/연간 지시 선택", "2년차 신제품 보상까지 도달"],
  };
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

  const activeStep = getFirstTenMinutePlan(state).find((step) => step.active && !step.complete);
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

  const annualReviewGuidance = getAnnualReviewRunwayGuidance(state);
  if (annualReviewGuidance) return annualReviewGuidance;

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

function getAnnualReviewRunwayGuidance(state: GameState): GuidanceStep | undefined {
  if (state.pendingAnnualDirectiveChoices?.offeredDirectiveIds.length) {
    return {
      id: "choose_annual_directive",
      title: "다음 해 운영 지시 선택",
      description: "연간 심사가 끝났습니다. 다음 해의 보너스 방향을 골라 출시, 신뢰, 경쟁 대응 중 어디에 힘을 실을지 정하세요.",
      actionLabel: "회사 메뉴 보기",
      menu: "company",
      tone: "primary",
      priorityLabel: "심사 보상",
      helperText: "지시 선택은 카드 보상 후보와 월간 운영 보너스에 영향을 줍니다.",
    };
  }

  const review = getCurrentAnnualReview(state);
  const alreadyReviewed = state.annualReviewHistory.some((entry) => entry.reviewId === review.id);
  if (alreadyReviewed || review.year !== 1 || state.activeProducts.length === 0 || state.month < 8) return undefined;

  const progress = getAnnualReviewProgress(review, state);
  const monthsLeft = Math.max(0, review.month - state.month);

  return {
    id: "advance_annual_review",
    title: "1년차 심사까지 마무리하기",
    description: `첫 출시와 경쟁 대응을 확인했습니다. 이제 1년차 심사인 ${review.title}까지 ${monthsLeft}개월만 넘기면 첫해 성과를 볼 수 있습니다.`,
    actionLabel: monthsLeft === 0 ? "심사 확인" : "심사까지 진행",
    tone: progress.completed === progress.total ? "primary" : "steady",
    priorityLabel: "연간 심사",
    helperText: `${getAnnualReviewCountdown(state)} · 목표 ${progress.completed}/${progress.total}`,
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
      description: "제품 메뉴 상단의 추천 첫 제품 카드에서 고용한 에이전트를 바로 투입해 작은 AI 제품부터 완성하세요.",
      actionLabel: "제품 개발 시작",
      menu: "products",
      tone: "primary",
      priorityLabel: "2단계",
      helperText: "추천 첫 제품은 자동 팀이 잡혀 있어 버튼 하나로 첫 프로젝트를 시작할 수 있습니다.",
    };
  }

  if (step.id === "use_card_issue") {
    return {
      id: "use_card_issue",
      title: "카드와 개발 이슈로 품질 올리기",
      description: "바로 다음 달로 넘기기 전에 덱 메뉴 상단의 첫 개발 이슈 카드에서 카드와 이슈가 결과를 바꾸는 순간을 확인하세요.",
      actionLabel: "덱 열기",
      menu: "deck",
      tone: "primary",
      priorityLabel: "3단계",
      helperText: state.productProjects.length > 0 ? "첫 개발 이슈 해결 결과는 현재 프로젝트의 진행도와 완성도에 바로 반영됩니다." : undefined,
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
