import { automationUpgrades, balance, capabilities, companyStages, domains, events, products, resources, startingState, upgrades } from "./data";
import type {
  ActionCheck,
  AutomationUpgradeDefinition,
  CapabilityDefinition,
  CompanyStageDefinition,
  EventChoiceDefinition,
  EventDefinition,
  GameState,
  ProductDefinition,
  ReleaseReview,
  ResourceMap,
  UpgradeDefinition,
} from "./types";

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const formatMoney = (value: number) =>
  new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(value);

export function createInitialState(): GameState {
  const initialResources = Object.fromEntries(
    Object.entries(resources).map(([id, resource]) => [id, resource.initial_value]),
  );

  return {
    month: startingState.month,
    resources: initialResources,
    capabilities: { ...startingState.capabilities },
    activeProducts: [...startingState.active_products],
    unlockedDomains: [...new Set([...domains.filter((domain) => domain.unlocked_by_default).map((domain) => domain.id), ...startingState.unlocked_domains])],
    purchasedUpgrades: [...startingState.purchased_upgrades],
    purchasedAutomationUpgrades: [...startingState.purchased_automation_upgrades],
    productReviews: {},
    eventHistory: [],
    timeline: ["회사는 작은 AI 생산성 도구 팀으로 시작했습니다."],
    status: "playing",
  };
}

export function formatResource(id: string, value: number): string {
  if (id === "cash") return formatMoney(value);
  return Math.round(value).toLocaleString("en-US");
}

export function getProductCheck(product: ProductDefinition, state: GameState): ActionCheck {
  const reasons: string[] = [];

  if (state.activeProducts.includes(product.id)) {
    reasons.push("이미 출시한 제품입니다.");
  }

  if (!state.unlockedDomains.includes(product.domain)) {
    reasons.push("아직 도메인이 열리지 않았습니다.");
  }

  for (const [capabilityId, requiredLevel] of Object.entries(product.required_capabilities)) {
    const currentLevel = state.capabilities[capabilityId] ?? 0;
    if (currentLevel < requiredLevel) {
      const capabilityName = capabilities.find((capability) => capability.id === capabilityId)?.name ?? capabilityId;
      reasons.push(`${capabilityName} Lv.${requiredLevel} 필요`);
    }
  }

  if ((state.resources.trust ?? 0) < product.trust_requirement) {
    reasons.push(`신뢰 ${product.trust_requirement} 필요`);
  }

  for (const [resourceId, cost] of Object.entries(product.launch_cost)) {
    if ((state.resources[resourceId] ?? 0) < cost) {
      const resourceName = resources[resourceId]?.name ?? resourceId;
      reasons.push(`${resourceName} 부족`);
    }
  }

  return { ok: reasons.length === 0, reasons };
}

export function launchProduct(product: ProductDefinition, state: GameState): GameState {
  const check = getProductCheck(product, state);
  if (!check.ok || state.status !== "playing") return state;

  const nextResources = applyResourceDelta(state.resources, negateCosts(product.launch_cost));
  nextResources.hype = clamp((nextResources.hype ?? 0) + product.hype_on_launch, 0, 100);
  const releaseReview = createReleaseReview(product, state);

  return {
    ...state,
    resources: nextResources,
    activeProducts: [...state.activeProducts, product.id],
    productReviews: { ...state.productReviews, [product.id]: releaseReview },
    timeline: [
      `${product.name} 출시: 시장 반응 ${releaseReview.grade} (${releaseReview.score}점)`,
      `${product.name} 출시: 화제성 +${product.hype_on_launch}`,
      ...state.timeline,
    ].slice(0, 8),
  };
}

export function getCapabilityCheck(capability: CapabilityDefinition, state: GameState): ActionCheck {
  const currentLevel = state.capabilities[capability.id] ?? 0;
  const reasons: string[] = [];

  if (currentLevel >= capability.max_level) {
    reasons.push("최대 레벨입니다.");
  }

  const nextCost = capability.upgrade_costs[currentLevel];
  if (!nextCost) {
    reasons.push("다음 업그레이드 비용이 없습니다.");
  } else {
    for (const [resourceId, cost] of Object.entries(nextCost)) {
      if ((state.resources[resourceId] ?? 0) < cost) {
        const resourceName = resources[resourceId]?.name ?? resourceId;
        reasons.push(`${resourceName} 부족`);
      }
    }
  }

  return { ok: reasons.length === 0, reasons };
}

export function upgradeCapability(capability: CapabilityDefinition, state: GameState): GameState {
  const check = getCapabilityCheck(capability, state);
  if (!check.ok || state.status !== "playing") return state;

  const currentLevel = state.capabilities[capability.id] ?? 0;
  const nextLevel = currentLevel + 1;
  const nextResources = applyResourceDelta(state.resources, negateCosts(capability.upgrade_costs[currentLevel]));
  const unlockedDomains = new Set(state.unlockedDomains);
  const unlockedDomainId = capability.unlocks_domains?.[String(nextLevel)];

  if (unlockedDomainId) {
    unlockedDomains.add(unlockedDomainId);
  }

  return {
    ...state,
    resources: nextResources,
    capabilities: { ...state.capabilities, [capability.id]: nextLevel },
    unlockedDomains: [...unlockedDomains],
    timeline: [
      `${capability.name} Lv.${nextLevel} 연구 완료${unlockedDomainId ? `: 새 분야 ${domainName(unlockedDomainId)} 해금` : ""}`,
      ...state.timeline,
    ].slice(0, 8),
  };
}

export function advanceMonth(state: GameState): GameState {
  if (state.status !== "playing") return state;

  const active = products.filter((product) => state.activeProducts.includes(product.id));
  const hype = state.resources.hype ?? 0;
  const trust = state.resources.trust ?? 0;
  const trustMultiplier =
    trust >= balance.trust_multiplier_high_threshold
      ? balance.trust_enterprise_bonus
      : trust <= balance.trust_multiplier_low_threshold
        ? balance.trust_low_penalty
        : 1;
  const growthMultiplier = balance.growth_rate_base + (hype / 100) * (balance.hype_growth_multiplier - 1);
  const revenue = active.reduce((sum, product) => sum + product.base_revenue, 0);
  const newUsers = Math.round(active.reduce((sum, product) => sum + product.base_users_per_month, 0) * growthMultiplier * trustMultiplier);
  const generatedData = active.reduce((sum, product) => sum + product.data_generated_per_month, 0);
  const currentUsers = state.resources.users ?? 0;
  const computeCashCost = Math.ceil(((currentUsers + newUsers) / 1000) * balance.compute_cost_per_1000_users);
  const salaryCost = (state.resources.talent ?? 0) * balance.salary_per_talent;
  const automationDiscount = clamp((state.resources.automation ?? 0) * balance.automation_cost_reduction_per_point, 0, 0.75);
  const totalCost = Math.round((balance.base_monthly_cash_cost + salaryCost + computeCashCost) * (1 - automationDiscount));
  const computePressure = Math.ceil(active.reduce((sum, product) => sum + product.compute_per_1000_users, 0) * Math.max(1, newUsers / 1000) * 0.08);

  const nextResources = applyResourceDelta(state.resources, {
    cash: revenue - totalCost,
    users: newUsers,
    data: generatedData,
    compute: -computePressure,
    hype: -balance.monthly_hype_decay,
    trust: trust < balance.trust_recovery_threshold ? balance.trust_recovery_amount : 0,
  });

  const nextMonth = state.month + 1;
  const nextStatus = getNextStatus(nextResources, state.activeProducts.length);
  const nextStateWithoutEvent: GameState = {
    ...state,
    month: nextMonth,
    resources: nextResources,
    lastMonthReport: {
      revenue,
      totalCost,
      newUsers,
      generatedData,
      computePressure,
    },
    status: nextStatus,
    timeline: [],
  };
  const nextEvent = state.currentEvent ? state.currentEvent : findNextEligibleEvent(nextStateWithoutEvent);
  const summary = active.length
    ? `${nextMonth}개월차: 매출 ${formatMoney(revenue)}, 비용 ${formatMoney(totalCost)}, 이용자 +${newUsers.toLocaleString("ko-KR")}, 데이터 +${generatedData}`
    : `${nextMonth}개월차: 아직 출시 제품이 없어 고정비만 발생했습니다.`;

  return {
    ...nextStateWithoutEvent,
    currentEvent: nextEvent,
    status: nextStatus,
    timeline: [nextEvent ? `이슈 발생: ${nextEvent.name}` : "", summary, ...state.timeline].filter(Boolean).slice(0, 8),
  };
}

export function getUpgradeCheck(upgrade: UpgradeDefinition, state: GameState): ActionCheck {
  const reasons = getRequirementReasons(upgrade.requirements, state);
  if (upgrade.one_time && state.purchasedUpgrades.includes(upgrade.id)) {
    reasons.push("이미 도입했습니다.");
  }
  appendCostReasons(reasons, upgrade.cost, state);
  return { ok: reasons.length === 0, reasons };
}

export function buyUpgrade(upgrade: UpgradeDefinition, state: GameState): GameState {
  const check = getUpgradeCheck(upgrade, state);
  if (!check.ok || state.status !== "playing") return state;

  const nextResources = applyResourceDelta(applyResourceDelta(state.resources, negateCosts(upgrade.cost)), upgrade.effects);

  return {
    ...state,
    resources: nextResources,
    purchasedUpgrades: upgrade.one_time ? [...state.purchasedUpgrades, upgrade.id] : state.purchasedUpgrades,
    timeline: [`투자 완료: ${upgrade.name}`, ...state.timeline].slice(0, 8),
  };
}

export function getAutomationUpgradeCheck(upgrade: AutomationUpgradeDefinition, state: GameState): ActionCheck {
  const reasons = getRequirementReasons(upgrade.requirements, state);
  if (state.purchasedAutomationUpgrades.includes(upgrade.id)) {
    reasons.push("이미 자동화했습니다.");
  }
  appendCostReasons(reasons, upgrade.cost, state);
  return { ok: reasons.length === 0, reasons };
}

export function buyAutomationUpgrade(upgrade: AutomationUpgradeDefinition, state: GameState): GameState {
  const check = getAutomationUpgradeCheck(upgrade, state);
  if (!check.ok || state.status !== "playing") return state;

  const nextResources = applyResourceDelta(applyResourceDelta(state.resources, negateCosts(upgrade.cost)), {
    ...upgrade.effects,
    automation: upgrade.automation_gain + (upgrade.effects.automation ?? 0),
  });

  return {
    ...state,
    resources: nextResources,
    purchasedAutomationUpgrades: [...state.purchasedAutomationUpgrades, upgrade.id],
    timeline: [`자동화 도입: ${upgrade.name} (${upgrade.monthly_benefit})`, ...state.timeline].slice(0, 8),
  };
}

export function resolveEventChoice(choice: EventChoiceDefinition, state: GameState): GameState {
  if (!state.currentEvent || state.status !== "playing") return state;

  const nextResources = applyResourceDelta(state.resources, choice.effects);

  return {
    ...state,
    resources: nextResources,
    currentEvent: undefined,
    eventHistory: [...state.eventHistory, state.currentEvent.id],
    timeline: [`결정: ${choice.text}`, ...state.timeline].slice(0, 8),
  };
}

export function getCompanyStage(state: GameState): CompanyStageDefinition {
  const orderedStages = [...companyStages].sort((a, b) => b.order - a.order);
  return orderedStages.find((stage) => stageRequirementsMet(stage, state)) ?? orderedStages[orderedStages.length - 1];
}

export function serializeGameState(state: GameState): string {
  return JSON.stringify({ version: 1, state });
}

export function hydrateGameState(serialized: string): GameState {
  const parsed = JSON.parse(serialized) as { version?: number; state?: GameState };
  if (!parsed.state) return createInitialState();

  return {
    ...createInitialState(),
    ...parsed.state,
    resources: { ...createInitialState().resources, ...parsed.state.resources },
    capabilities: { ...createInitialState().capabilities, ...parsed.state.capabilities },
    activeProducts: parsed.state.activeProducts ?? [],
    unlockedDomains: parsed.state.unlockedDomains ?? createInitialState().unlockedDomains,
    purchasedUpgrades: parsed.state.purchasedUpgrades ?? [],
    purchasedAutomationUpgrades: parsed.state.purchasedAutomationUpgrades ?? [],
    productReviews: parsed.state.productReviews ?? {},
    eventHistory: parsed.state.eventHistory ?? [],
    timeline: parsed.state.timeline ?? [],
  };
}

function getNextStatus(nextResources: ResourceMap, activeProductCount: number): GameState["status"] {
  if ((nextResources.cash ?? 0) < balance.game_over_cash_threshold && (nextResources.trust ?? 0) < balance.game_over_trust_threshold) {
    return "failure";
  }

  if (
    (nextResources.users ?? 0) >= balance.success_users_threshold ||
    (nextResources.cash ?? 0) >= balance.success_cash_threshold ||
    ((nextResources.automation ?? 0) >= balance.success_automation_threshold && activeProductCount >= balance.success_min_products)
  ) {
    return "success";
  }

  return "playing";
}

function applyResourceDelta(current: ResourceMap, delta: ResourceMap): ResourceMap {
  const next = { ...current };

  for (const [resourceId, amount] of Object.entries(delta)) {
    const definition = resources[resourceId];
    const currentValue = next[resourceId] ?? 0;
    next[resourceId] = definition ? clamp(currentValue + amount, definition.min_value, definition.max_value) : currentValue + amount;
  }

  return next;
}

function negateCosts(costs: ResourceMap): ResourceMap {
  return Object.fromEntries(Object.entries(costs).map(([resourceId, value]) => [resourceId, -value]));
}

function domainName(id: string): string {
  return domains.find((domain) => domain.id === id)?.name ?? id;
}

function stageRequirementsMet(stage: CompanyStageDefinition, state: GameState): boolean {
  return Object.entries(stage.requirements).every(([requirement, needed]) => {
    if (requirement === "min_products") return state.activeProducts.length >= needed;
    if (requirement === "min_domains") return state.unlockedDomains.length >= needed;
    if (requirement === "min_users") return (state.resources.users ?? 0) >= needed;
    if (requirement === "min_hype") return (state.resources.hype ?? 0) >= needed;
    if (requirement === "min_trust") return (state.resources.trust ?? 0) >= needed;
    if (requirement === "min_cash") return (state.resources.cash ?? 0) >= needed;
    if (requirement === "min_automation") return (state.resources.automation ?? 0) >= needed;
    return false;
  });
}

function createReleaseReview(product: ProductDefinition, state: GameState): ReleaseReview {
  const score = Math.round(
    clamp(55 + product.hype_on_launch * 1.8 + (state.resources.trust ?? 0) * 0.18 + Object.keys(product.required_capabilities).length * 4, 45, 99),
  );
  const grade = score >= 90 ? "S" : score >= 80 ? "A" : score >= 70 ? "B" : score >= 60 ? "C" : "D";
  const quote =
    score >= 80
      ? "출시 첫날부터 커뮤니티가 술렁입니다."
      : score >= 70
        ? "쓸모는 확실하지만 다음 업데이트가 중요합니다."
        : "아이디어는 좋지만 완성도가 더 필요합니다.";
  return { score, grade, quote };
}

function findNextEligibleEvent(state: GameState): EventDefinition | undefined {
  return events.find((event) => !state.eventHistory.includes(event.id) && eventRequirementsMet(event, state));
}

function eventRequirementsMet(event: EventDefinition, state: GameState): boolean {
  return Object.entries(event.conditions).every(([condition, needed]) => {
    if (condition === "min_month") return state.month >= needed;
    if (condition === "min_products") return state.activeProducts.length >= needed;
    if (condition === "min_hype") return (state.resources.hype ?? 0) >= needed;
    if (condition === "min_trust") return (state.resources.trust ?? 0) >= needed;
    if (condition === "min_data") return (state.resources.data ?? 0) >= needed;
    if (condition === "min_users") return (state.resources.users ?? 0) >= needed;
    if (condition === "min_talent") return (state.resources.talent ?? 0) >= needed;
    if (condition === "min_capabilities") return Object.values(state.capabilities).filter((level) => level > 0).length >= needed;
    return false;
  });
}

function getRequirementReasons(requirements: Record<string, number>, state: GameState): string[] {
  const reasons: string[] = [];

  for (const [requirement, needed] of Object.entries(requirements ?? {})) {
    if (requirement === "min_month" && state.month < needed) reasons.push(`${needed}개월차 필요`);
    if (requirement === "min_products" && state.activeProducts.length < needed) reasons.push(`활성 제품 ${needed}개 필요`);
    if (requirement === "min_users" && (state.resources.users ?? 0) < needed) reasons.push(`이용자 ${needed.toLocaleString("ko-KR")}명 필요`);
    if (requirement === "min_trust" && (state.resources.trust ?? 0) < needed) reasons.push(`신뢰 ${needed} 필요`);
    if (requirement === "min_talent" && (state.resources.talent ?? 0) < needed) reasons.push(`인재 ${needed}명 필요`);
    if (requirement === "min_automation" && (state.resources.automation ?? 0) < needed) reasons.push(`자동화 ${needed} 필요`);
  }

  return reasons;
}

function appendCostReasons(reasons: string[], cost: ResourceMap, state: GameState): void {
  for (const [resourceId, amount] of Object.entries(cost)) {
    if ((state.resources[resourceId] ?? 0) < amount) {
      const resourceName = resources[resourceId]?.name ?? resourceId;
      reasons.push(`${resourceName} 부족`);
    }
  }
}
