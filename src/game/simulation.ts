import { balance, capabilities, domains, products, resources, startingState } from "./data";
import type { ActionCheck, CapabilityDefinition, GameState, ProductDefinition, ResourceMap } from "./types";

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const formatMoney = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
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

  return {
    ...state,
    resources: nextResources,
    activeProducts: [...state.activeProducts, product.id],
    timeline: [`${product.name} 출시: 하이프 +${product.hype_on_launch}`, ...state.timeline].slice(0, 8),
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
      `${capability.name} Lv.${nextLevel} 업그레이드${unlockedDomainId ? `: 새 도메인 ${domainName(unlockedDomainId)} 해금` : ""}`,
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
  const summary = active.length
    ? `월 ${nextMonth}: 매출 ${formatMoney(revenue)}, 비용 ${formatMoney(totalCost)}, 유저 +${newUsers.toLocaleString("en-US")}, 데이터 +${generatedData}`
    : `월 ${nextMonth}: 아직 출시 제품이 없어 고정비만 발생했습니다.`;

  return {
    ...state,
    month: nextMonth,
    resources: nextResources,
    status: nextStatus,
    timeline: [summary, ...state.timeline].slice(0, 8),
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
