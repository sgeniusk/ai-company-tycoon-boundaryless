import {
  agentTypes,
  annualReviews,
  automationUpgrades,
  balance,
  capabilities,
  companyLocations,
  companyStages,
  competitors,
  domains,
  events,
  items,
  officeExpansions,
  products,
  resources,
  rivalEvents,
  startingState,
  strategyCards,
  upgrades,
  growthPaths,
} from "./data";
import { applyAchievementUnlocks } from "./achievements";
import { applyDueAnnualReview, getActiveAnnualDirective } from "./annual-review";
import { CAMPAIGN_FINAL_MONTH, getCompanyStarRating, getCurrentLocation, getLocationRequirementReasons } from "./campaign";
import { createInitialRogueliteState, createReleaseCardReward, refreshStrategyDeckForNewMonth } from "./deckbuilding";
import { createReleaseGrowthPaths } from "./growth-paths";
import { createMarketReaction, createReleaseHeadline } from "./release-flavor";
import type {
  AgentStats,
  AgentTypeDefinition,
  ActionCheck,
  AnnualDirectiveState,
  AnnualReviewHistoryEntry,
  AutomationUpgradeDefinition,
  CapabilityDefinition,
  CompanyLocationDefinition,
  CompanyStageDefinition,
  CompetitorDefinition,
  CompetitorState,
  ActiveDevelopmentPuzzleModifier,
  DevelopmentPuzzleResult,
  EventChoiceDefinition,
  EventDefinition,
  GameState,
  HiredAgent,
  ItemDefinition,
  MarketRanking,
  MonthlyEconomy,
  OfficeExpansionDefinition,
  OfficeState,
  CardRewardChoice,
  PendingCardReward,
  ProductProject,
  ProductDefinition,
  ReleaseMoment,
  ReleaseReview,
  RivalEventChoiceDefinition,
  RogueliteState,
  RunRecord,
  ResourceMap,
  ProductProjectForecast,
  StrategyDeckState,
  UpgradeDefinition,
} from "./types";

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const SAVE_VERSION = 7;
const statKeys: Array<keyof AgentStats> = [
  "research",
  "engineering",
  "product",
  "growth",
  "safety",
  "operations",
  "creativity",
  "autonomy",
];

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
    locationId: companyLocations[0]?.id ?? "rural_garage",
    resources: initialResources,
    capabilities: { ...startingState.capabilities },
    activeProducts: [...startingState.active_products],
    unlockedDomains: [...new Set([...domains.filter((domain) => domain.unlocked_by_default).map((domain) => domain.id), ...startingState.unlocked_domains])],
    purchasedUpgrades: [...startingState.purchased_upgrades],
    purchasedAutomationUpgrades: [...startingState.purchased_automation_upgrades],
    hiredAgents: [],
    ownedItems: [],
    office: createInitialOfficeState(),
    productProjects: [],
    productLevels: {},
    competitorStates: createInitialCompetitorStates(startingState.month),
    productReviews: {},
    roguelite: createInitialRogueliteState(),
    activeDevelopmentPuzzleModifiers: [],
    unlockedAchievements: [],
    annualReviewHistory: [],
    eventHistory: [],
    rivalEventHistory: [],
    timeline: ["회사는 작은 AI 생산성 도구 팀으로 시작했습니다."],
    status: "playing",
  };
}

export function formatResource(id: string, value: number): string {
  if (id === "cash") return formatMoney(value);
  return Math.round(value).toLocaleString("en-US");
}

export function getMarketRankings(state: GameState): MarketRanking[] {
  return [
    {
      id: "player",
      score: getPlayerCompetitiveScore(state),
      marketShare: getPlayerMarketShare(state),
      isPlayer: true,
      lastMove: state.activeProducts.length ? "출시 제품 확장 중" : "첫 제품 준비 중",
    },
    ...state.competitorStates.map((competitor) => ({
      id: competitor.id,
      score: competitor.score,
      marketShare: competitor.marketShare,
      isPlayer: false,
      lastMove: competitor.lastMove,
    })),
  ].sort((a, b) => b.marketShare - a.marketShare);
}

export function getPlayerMarketShare(state: GameState): number {
  const playerScore = getPlayerCompetitiveScore(state);
  const rivalScore = state.competitorStates.reduce((sum, competitor) => sum + competitor.score, 0);
  const totalScore = Math.max(1, playerScore + rivalScore);
  return Math.round((playerScore / totalScore) * 100);
}

export function getProductCheck(product: ProductDefinition, state: GameState): ActionCheck {
  const reasons: string[] = [];

  if (state.activeProducts.includes(product.id)) {
    reasons.push("이미 출시한 제품입니다.");
  }

  if (state.productProjects.some((project) => project.productId === product.id)) {
    reasons.push("이미 개발 중인 제품입니다.");
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
  const lastRelease = {
    productId: product.id,
    productName: product.name,
    month: state.month,
    review: releaseReview,
    headline: createReleaseHeadline(product, releaseReview),
    marketReaction: createMarketReaction(product, releaseReview),
    expansionHint: getReleaseExpansionHint(product),
    growthPaths: createReleaseGrowthPaths(product),
  };

  return applyAchievementUnlocks({
    ...state,
    resources: nextResources,
    activeProducts: [...state.activeProducts, product.id],
    productLevels: { ...state.productLevels, [product.id]: 1 },
    productReviews: { ...state.productReviews, [product.id]: releaseReview },
    lastRelease,
    roguelite: createReleaseCardReward(product, releaseReview, state),
    timeline: [
      `${product.name} 출시: 시장 반응 ${releaseReview.grade} (${releaseReview.score}점)`,
      `${product.name} 출시: 화제성 +${product.hype_on_launch}`,
      ...state.timeline,
    ].slice(0, 8),
  });
}

export function getAgentHireCheck(agent: AgentTypeDefinition, state: GameState): ActionCheck {
  const reasons = getRequirementReasons(agent.unlock_requirements, state);
  const hireCapacity = getOfficeHireCapacity(state);

  if (state.hiredAgents.some((hiredAgent) => hiredAgent.typeId === agent.id)) {
    reasons.push("이미 고용한 에이전트입니다.");
  }
  if (state.hiredAgents.length >= hireCapacity) {
    reasons.push(`사무실 수용 인원 ${hireCapacity}명 한도입니다. 상점에서 사무실을 확장하세요.`);
  }
  if (getAgentKind(agent) === "ai_agent" && getAiAgentCount(state) >= getAiOperationCapacity(state)) {
    reasons.push(`사람 직원 운용력이 부족합니다. 현재 AI 운용 한도 ${getAiOperationCapacity(state)}개입니다.`);
  }

  appendCostReasons(reasons, getAgentHireCost(agent, state), state);

  return { ok: reasons.length === 0, reasons };
}

export function getAgentHireCost(agent: AgentTypeDefinition, state: GameState): ResourceMap {
  if (getAgentKind(agent) !== "human") return agent.hire_cost;

  const location = getCurrentLocation(state);
  const multiplier = Math.max(0.5, 1 - location.human_hire_discount);
  return Object.fromEntries(
    Object.entries(agent.hire_cost).map(([resourceId, amount]) => [
      resourceId,
      resourceId === "cash" ? Math.round(amount * multiplier) : amount,
    ]),
  );
}

export function getAiOperationCapacity(state: GameState): number {
  const humanOperators = state.hiredAgents.filter((agent) => {
    const type = agentTypes.find((entry) => entry.id === agent.typeId);
    return type ? getAgentKind(type) === "human" : false;
  }).length;
  return 3 + humanOperators * 2 + getCurrentLocation(state).ai_operation_bonus;
}

export function getAiAgentCount(state: GameState): number {
  return state.hiredAgents.filter((agent) => {
    const type = agentTypes.find((entry) => entry.id === agent.typeId);
    return !type || getAgentKind(type) === "ai_agent";
  }).length;
}

export function getOfficeExpansion(state: GameState): OfficeExpansionDefinition {
  return officeExpansions.find((expansion) => expansion.id === state.office?.expansionId) ?? officeExpansions[0];
}

export function getOfficeHireCapacity(state: GameState): number {
  return getOfficeExpansion(state).hire_capacity;
}

export function getOfficeDecorationSlots(state: GameState): number {
  return getOfficeExpansion(state).decoration_slots;
}

export function getNextOfficeExpansion(state: GameState): OfficeExpansionDefinition | undefined {
  const currentLevel = getOfficeExpansion(state).level;
  return [...officeExpansions].sort((a, b) => a.level - b.level).find((expansion) => expansion.level === currentLevel + 1);
}

export function getOfficeExpansionCheck(expansion: OfficeExpansionDefinition, state: GameState): ActionCheck {
  const reasons = getRequirementReasons(expansion.unlock_requirements, state);
  const currentExpansion = getOfficeExpansion(state);

  if (expansion.level <= currentExpansion.level) {
    reasons.push("이미 적용된 사무실 확장입니다.");
  }
  if (expansion.level > currentExpansion.level + 1) {
    reasons.push("이전 단계 사무실 확장이 필요합니다.");
  }
  appendCostReasons(reasons, expansion.cost, state);

  return { ok: reasons.length === 0, reasons };
}

export function buyOfficeExpansion(expansion: OfficeExpansionDefinition, state: GameState): GameState {
  const check = getOfficeExpansionCheck(expansion, state);
  if (!check.ok || state.status !== "playing") return state;

  return {
    ...state,
    resources: applyResourceDelta(state.resources, negateCosts(expansion.cost)),
    office: {
      ...state.office,
      expansionId: expansion.id,
      placedItemIds: state.office.placedItemIds.slice(0, expansion.decoration_slots),
    },
    timeline: [`사무실 확장: ${expansion.name}으로 이전`, ...state.timeline].slice(0, 8),
  };
}

export function getRelocationCheck(locationId: string, state: GameState): ActionCheck {
  const location = companyLocations.find((entry) => entry.id === locationId);
  const reasons: string[] = [];

  if (!location) {
    reasons.push("알 수 없는 지역입니다.");
    return { ok: false, reasons };
  }
  if (state.locationId === location.id) {
    reasons.push("이미 이 지역에서 운영 중입니다.");
  }

  reasons.push(...getLocationRequirementReasons(location, state));
  appendCostReasons(reasons, location.cost, state);

  return { ok: reasons.length === 0, reasons };
}

export function relocateCompany(locationId: string, state: GameState): GameState {
  const location = companyLocations.find((entry) => entry.id === locationId);
  const check = getRelocationCheck(locationId, state);
  if (!location || !check.ok || state.status !== "playing") return state;

  return {
    ...state,
    locationId: location.id,
    resources: applyResourceDelta(state.resources, negateCosts(location.cost)),
    timeline: [`지역 이전: ${location.name} (${location.region})으로 거점을 옮겼습니다.`, ...state.timeline].slice(0, 8),
  };
}

export function getPlacedOfficeItems(state: GameState): ItemDefinition[] {
  const ownedDecorIds = new Set(state.ownedItems.filter((itemId) => isOfficeDecorationItemId(itemId)));
  return state.office.placedItemIds
    .filter((itemId) => ownedDecorIds.has(itemId))
    .map((itemId) => items.find((item) => item.id === itemId))
    .filter((item): item is ItemDefinition => Boolean(item));
}

export function getPlaceOfficeItemCheck(item: ItemDefinition, state: GameState): ActionCheck {
  const reasons: string[] = [];

  if (!isOfficeDecorationItem(item)) reasons.push("사무실에 배치할 수 있는 아이템이 아닙니다.");
  if (!state.ownedItems.includes(item.id)) reasons.push("보유하지 않은 아이템입니다.");
  if (state.office.placedItemIds.includes(item.id)) reasons.push("이미 배치된 아이템입니다.");
  if (getPlacedOfficeItems(state).length >= getOfficeDecorationSlots(state)) {
    reasons.push("사무실 장식 슬롯이 가득 찼습니다.");
  }

  return { ok: reasons.length === 0, reasons };
}

export function placeOfficeItem(item: ItemDefinition, state: GameState): GameState {
  const check = getPlaceOfficeItemCheck(item, state);
  if (!check.ok || state.status !== "playing") return state;

  return {
    ...state,
    office: {
      ...state.office,
      placedItemIds: [...state.office.placedItemIds, item.id],
    },
    timeline: [`사무실 배치: ${item.name}`, ...state.timeline].slice(0, 8),
  };
}

export function unplaceOfficeItem(itemId: string, state: GameState): GameState {
  const item = items.find((entry) => entry.id === itemId);
  if (!item || !state.office.placedItemIds.includes(itemId)) return state;

  return {
    ...state,
    office: {
      ...state.office,
      placedItemIds: state.office.placedItemIds.filter((placedItemId) => placedItemId !== itemId),
    },
    timeline: [`사무실 보관: ${item.name}`, ...state.timeline].slice(0, 8),
  };
}

export function hireAgent(agent: AgentTypeDefinition, state: GameState): GameState {
  const check = getAgentHireCheck(agent, state);
  if (!check.ok || state.status !== "playing") return state;

  const hiredAgent: HiredAgent = {
    id: `agent_${state.hiredAgents.length + 1}_${agent.id}`,
    typeId: agent.id,
    name: agent.name,
    level: 1,
    energy: 100,
    equippedItemIds: [],
  };

  return {
    ...state,
    resources: applyResourceDelta(applyResourceDelta(state.resources, negateCosts(getAgentHireCost(agent, state))), { talent: 1 }),
    hiredAgents: [...state.hiredAgents, hiredAgent],
    timeline: [`고용 완료: ${agent.name} 합류`, ...state.timeline].slice(0, 8),
  };
}

export function getItemCheck(item: ItemDefinition, state: GameState): ActionCheck {
  const reasons = getRequirementReasons(item.unlock_requirements, state);

  if (state.ownedItems.includes(item.id)) {
    reasons.push("이미 보유한 아이템입니다.");
  }

  appendCostReasons(reasons, item.cost, state);

  return { ok: reasons.length === 0, reasons };
}

export function buyItem(item: ItemDefinition, state: GameState): GameState {
  const check = getItemCheck(item, state);
  if (!check.ok || state.status !== "playing") return state;

  const immediateEffects = item.target === "agent" ? {} : pickResourceEffects(item.effects);
  const ownedItems = [...state.ownedItems, item.id];
  const office = maybeAutoPlaceOfficeItem(item, state.office, ownedItems);

  return {
    ...state,
    resources: applyResourceDelta(applyResourceDelta(state.resources, negateCosts(item.cost)), immediateEffects),
    ownedItems,
    office,
    timeline: [`아이템 구매: ${item.name}${office.placedItemIds.includes(item.id) ? " · 사무실 배치" : ""}`, ...state.timeline].slice(0, 8),
  };
}

export function getEquipItemCheck(agentId: string, item: ItemDefinition, state: GameState): ActionCheck {
  const reasons: string[] = [];
  const agent = state.hiredAgents.find((hiredAgent) => hiredAgent.id === agentId);

  if (!agent) reasons.push("장착할 에이전트가 없습니다.");
  if (item.target !== "agent") reasons.push("에이전트 장비가 아닙니다.");
  if (!state.ownedItems.includes(item.id)) reasons.push("보유하지 않은 아이템입니다.");
  if (state.hiredAgents.some((hiredAgent) => hiredAgent.equippedItemIds.includes(item.id))) {
    reasons.push("이미 장착된 아이템입니다.");
  }
  if (agent && agent.equippedItemIds.length >= 2) {
    reasons.push("장착 슬롯이 가득 찼습니다.");
  }

  return { ok: reasons.length === 0, reasons };
}

export function equipItem(agentId: string, item: ItemDefinition, state: GameState): GameState {
  const check = getEquipItemCheck(agentId, item, state);
  if (!check.ok || state.status !== "playing") return state;

  const nextAgents = state.hiredAgents.map((agent) =>
    agent.id === agentId ? { ...agent, equippedItemIds: [...agent.equippedItemIds, item.id] } : agent,
  );

  return {
    ...state,
    resources: applyResourceDelta(state.resources, pickResourceEffects(item.effects)),
    hiredAgents: nextAgents,
    timeline: [`장착 완료: ${item.name}`, ...state.timeline].slice(0, 8),
  };
}

export function getProductProjectCheck(product: ProductDefinition, state: GameState, assignedAgentIds?: string[]): ActionCheck {
  const reasons = getProductCheck(product, state).reasons;
  const availableAgents = getAvailableAgents(state);

  if (assignedAgentIds) {
    const uniqueAssignedAgentIds = [...new Set(assignedAgentIds)];
    if (uniqueAssignedAgentIds.length === 0) {
      reasons.push("투입할 에이전트를 1명 이상 선택해야 합니다.");
    }
    if (uniqueAssignedAgentIds.length > 3) {
      reasons.push("한 프로젝트에는 최대 3명까지 투입할 수 있습니다.");
    }

    for (const agentId of uniqueAssignedAgentIds) {
      const agent = state.hiredAgents.find((hiredAgent) => hiredAgent.id === agentId);
      if (!agent) {
        reasons.push("알 수 없는 에이전트가 포함되어 있습니다.");
      } else if (agent.assignment) {
        reasons.push(`${agent.name}은 이미 다른 프로젝트에 투입되어 있습니다.`);
      }
    }
  } else if (availableAgents.length === 0) {
    reasons.push("투입 가능한 에이전트가 필요합니다.");
  }

  return { ok: reasons.length === 0, reasons };
}

export function startProductProject(product: ProductDefinition, state: GameState, assignedAgentIds?: string[]): GameState {
  const check = getProductProjectCheck(product, state, assignedAgentIds);
  if (!check.ok || state.status !== "playing") return state;

  const assignedAgents = getSelectedProjectAgents(state, assignedAgentIds);
  const projectId = `project_${state.productProjects.length + 1}_${product.id}`;
  const project: ProductProject = {
    id: projectId,
    productId: product.id,
    progress: 0,
    quality: getStartingProjectQuality(assignedAgents, state),
    assignedAgentIds: assignedAgents.map((agent) => agent.id),
    startedMonth: state.month,
  };

  return {
    ...state,
    resources: applyResourceDelta(state.resources, negateCosts(product.launch_cost)),
    hiredAgents: state.hiredAgents.map((agent) =>
      project.assignedAgentIds.includes(agent.id) ? { ...agent, assignment: project.id } : agent,
    ),
    productProjects: [...state.productProjects, project],
    timeline: [`개발 시작: ${product.name} (${assignedAgents.map((agent) => agent.name).join(", ")})`, ...state.timeline].slice(0, 8),
  };
}

export function getProductProjectForecast(
  product: ProductDefinition,
  state: GameState,
  assignedAgentIds?: string[],
): ProductProjectForecast {
  const selectedAgents = getSelectedProjectAgents(state, assignedAgentIds);
  const stats = selectedAgents.reduce((total, agent) => addStats(total, getAgentEffectiveStats(agent, state)), getGlobalItemStats(state));
  const startingQuality = getStartingProjectQuality(selectedAgents, state);
  const monthlyProgressGain = getProjectProgressGain(stats);
  const monthlyQualityGain = getProjectQualityGain(stats);
  const estimatedMonths = Math.max(1, Math.ceil(100 / monthlyProgressGain));
  const expectedQuality = Math.round(clamp(startingQuality + monthlyQualityGain * estimatedMonths, 0, 100));
  const expectedReview = createReleaseReview(product, state, expectedQuality);

  return {
    assignedAgentIds: selectedAgents.map((agent) => agent.id),
    startingQuality,
    monthlyProgressGain,
    monthlyQualityGain,
    estimatedMonths,
    expectedQuality,
    expectedReviewScore: expectedReview.score,
    expectedReviewGrade: expectedReview.grade,
  };
}

export function getAgentEffectiveStats(agent: HiredAgent, state: GameState): AgentStats {
  const type = agentTypes.find((agentType) => agentType.id === agent.typeId);
  const baseStats = type?.stats ?? createEmptyStats();
  const equippedItems = items.filter((item) => agent.equippedItemIds.includes(item.id));

  return equippedItems.reduce((stats, item) => addStats(stats, item.effects), { ...baseStats });
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

  return applyAchievementUnlocks({
    ...state,
    resources: nextResources,
    capabilities: { ...state.capabilities, [capability.id]: nextLevel },
    unlockedDomains: [...unlockedDomains],
    timeline: [
      `${capability.name} Lv.${nextLevel} 연구 완료${unlockedDomainId ? `: 새 분야 ${domainName(unlockedDomainId)} 해금` : ""}`,
      ...state.timeline,
    ].slice(0, 8),
  });
}

export function calculateMonthlyEconomy(state: GameState): MonthlyEconomy {
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
  const revenue = active.reduce((sum, product) => sum + getProductMonthlyRevenue(product, state), 0);
  const newUsers = Math.round(active.reduce((sum, product) => sum + getProductMonthlyUsers(product, state), 0) * growthMultiplier * trustMultiplier);
  const generatedData = active.reduce((sum, product) => sum + getProductMonthlyData(product, state), 0);
  const currentUsers = state.resources.users ?? 0;
  const computeCashCost = Math.ceil(((currentUsers + newUsers) / 1000) * balance.compute_cost_per_1000_users);
  const salaryCost = (state.resources.talent ?? 0) * balance.salary_per_talent;
  const automationDiscount = clamp((state.resources.automation ?? 0) * balance.automation_cost_reduction_per_point, 0, 0.75);
  const locationCostModifier = getCurrentLocation(state).monthly_cost_modifier;
  const totalCost = Math.round((balance.base_monthly_cash_cost + salaryCost + computeCashCost) * locationCostModifier * (1 - automationDiscount));
  const computePressure = Math.ceil(active.reduce((sum, product) => sum + getProductComputePressure(product, state), 0) * Math.max(1, newUsers / 1000) * 0.08);
  const strategyEffects = getMonthlyStrategicEffects(state);
  const resourceDelta = mergeResourceDelta(
    {
      cash: revenue - totalCost,
      users: newUsers,
      data: generatedData,
      compute: -computePressure,
      hype: -balance.monthly_hype_decay,
      trust: trust < balance.trust_recovery_threshold ? balance.trust_recovery_amount : 0,
    },
    strategyEffects ?? {},
  );

  return {
    revenue,
    totalCost,
    newUsers,
    generatedData,
    computePressure,
    strategyEffects,
    resourceDelta,
  };
}

export function advanceMonth(state: GameState): GameState {
  if (state.status !== "playing") return state;

  const active = products.filter((product) => state.activeProducts.includes(product.id));
  const monthlyEconomy = calculateMonthlyEconomy(state);

  const nextResources = applyResourceDelta(
    state.resources,
    monthlyEconomy.resourceDelta,
  );

  const nextMonth = state.month + 1;
  const nextStateWithoutEvent: GameState = {
    ...state,
    month: nextMonth,
    resources: nextResources,
    lastMonthReport: {
      revenue: monthlyEconomy.revenue,
      totalCost: monthlyEconomy.totalCost,
      newUsers: monthlyEconomy.newUsers,
      generatedData: monthlyEconomy.generatedData,
      computePressure: monthlyEconomy.computePressure,
      strategyEffects: monthlyEconomy.strategyEffects,
    },
    status: getNextStatus(nextResources, state.activeProducts.length, nextMonth),
    timeline: [],
  };
  const progressedState = advanceProductProjects(nextStateWithoutEvent);
  const entrantState = addScheduledCompetitors(progressedState);
  const competedState = advanceCompetitors(entrantState);
  const nextStatus = getNextStatus(competedState.resources, competedState.activeProducts.length, nextMonth);
  const nextStateForEvent = { ...competedState, status: nextStatus };
  const nextEvent = state.currentEvent ? state.currentEvent : findNextEligibleEvent(nextStateForEvent);
  const nextRivalEvent = state.currentRivalEvent ? state.currentRivalEvent : findNextEligibleRivalEvent(nextStateForEvent);
  const summary = active.length
    ? `${nextMonth}개월차: 매출 ${formatMoney(monthlyEconomy.revenue)}, 비용 ${formatMoney(monthlyEconomy.totalCost)}, 이용자 +${monthlyEconomy.newUsers.toLocaleString("ko-KR")}, 데이터 +${monthlyEconomy.generatedData}`
    : `${nextMonth}개월차: 아직 출시 제품이 없어 고정비만 발생했습니다.`;

  const advancedState = applyAchievementUnlocks({
    ...nextStateForEvent,
    currentEvent: nextEvent,
    currentRivalEvent: nextRivalEvent,
    status: nextStatus,
    timeline: [
      nextRivalEvent ? `경쟁사 이슈: ${nextRivalEvent.id}` : "",
      nextEvent ? `이슈 발생: ${nextEvent.name}` : "",
      ...competedState.timeline,
      monthlyEconomy.strategyEffects ? `전략 효과: ${formatResourceDelta(monthlyEconomy.strategyEffects)}` : "",
      nextMonth >= CAMPAIGN_FINAL_MONTH ? `10년차 최종 평가: ${nextStatus === "success" ? "성공 엔딩" : "재도전 엔딩"}` : "",
      summary,
      ...state.timeline,
    ]
      .filter(Boolean)
      .slice(0, 8),
  });

  return refreshStrategyDeckForNewMonth(applyDueAnnualReview(advancedState));
}

export function getUpgradeCheck(upgrade: UpgradeDefinition, state: GameState): ActionCheck {
  const reasons = getRequirementReasons(upgrade.requirements, state);
  if (upgrade.one_time && state.purchasedUpgrades.includes(upgrade.id)) {
    reasons.push("이미 도입했습니다.");
  }
  appendCostReasons(reasons, upgrade.cost, state);
  return { ok: reasons.length === 0, reasons };
}

export function getProductLevel(productId: string, state: GameState): number {
  return state.productLevels[productId] ?? (state.activeProducts.includes(productId) ? 1 : 0);
}

export function getProductUpgradeCost(product: ProductDefinition, state: GameState): ResourceMap {
  const currentLevel = Math.max(1, getProductLevel(product.id, state));
  return Object.fromEntries(
    Object.entries(product.launch_cost).map(([resourceId, value]) => [
      resourceId,
      Math.round(value * product.upgrade_cost_multiplier * currentLevel),
    ]),
  );
}

export function getProductUpgradeCheck(product: ProductDefinition, state: GameState): ActionCheck {
  const reasons: string[] = [];
  const currentLevel = getProductLevel(product.id, state);

  if (!state.activeProducts.includes(product.id)) {
    reasons.push("출시한 제품만 업그레이드할 수 있습니다.");
  }
  if (currentLevel >= product.max_level) {
    reasons.push("최대 레벨입니다.");
  }
  appendCostReasons(reasons, getProductUpgradeCost(product, state), state);

  return { ok: reasons.length === 0, reasons };
}

export function upgradeProduct(product: ProductDefinition, state: GameState): GameState {
  const check = getProductUpgradeCheck(product, state);
  if (!check.ok || state.status !== "playing") return state;

  const currentLevel = getProductLevel(product.id, state);
  const nextLevel = currentLevel + 1;

  return {
    ...state,
    resources: applyResourceDelta(state.resources, negateCosts(getProductUpgradeCost(product, state))),
    productLevels: { ...state.productLevels, [product.id]: nextLevel },
    timeline: [`제품 업그레이드: ${product.name} Lv.${nextLevel}`, ...state.timeline].slice(0, 8),
  };
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

export function getGrowthPathChoiceCheck(pathId: string, state: GameState): ActionCheck {
  const reasons: string[] = [];

  if (!growthPaths.some((path) => path.id === pathId)) {
    reasons.push("알 수 없는 성장 경로입니다.");
  }

  if (!state.lastRelease || state.activeProducts.length === 0) {
    reasons.push("첫 제품 출시 후 선택할 수 있습니다.");
  }

  if (state.chosenGrowthPath) {
    reasons.push("이미 성장 경로를 선택했습니다.");
  }

  if (state.status !== "playing") {
    reasons.push("운영 중일 때만 선택할 수 있습니다.");
  }

  return { ok: reasons.length === 0, reasons };
}

export function chooseGrowthPath(pathId: string, state: GameState): GameState {
  const check = getGrowthPathChoiceCheck(pathId, state);
  const path = growthPaths.find((entry) => entry.id === pathId);
  if (!check.ok || !path) return state;

  return applyAchievementUnlocks({
    ...state,
    resources: applyResourceDelta(state.resources, path.commitment_effects),
    chosenGrowthPath: {
      id: path.id,
      title: path.title,
      month: state.month,
      bonusDescription: path.bonus_description,
      effects: path.commitment_effects,
      monthlyEffects: path.monthly_effects,
    },
    timeline: [`성장 경로 선택: ${path.title} - ${path.bonus_description}`, ...state.timeline].slice(0, 8),
  });
}

export function resolveEventChoice(choice: EventChoiceDefinition, state: GameState): GameState {
  if (!state.currentEvent || state.status !== "playing") return state;

  const nextResources = applyResourceDelta(state.resources, choice.effects);

  return applyAchievementUnlocks({
    ...state,
    resources: nextResources,
    currentEvent: undefined,
    eventHistory: [...state.eventHistory, state.currentEvent.id],
    timeline: [`결정: ${choice.text}`, ...state.timeline].slice(0, 8),
  });
}

export function resolveRivalEventChoice(choice: RivalEventChoiceDefinition, state: GameState): GameState {
  if (!state.currentRivalEvent || state.status !== "playing") return state;

  const targetCompetitorId = state.currentRivalEvent.competitor_id;
  const nextCompetitors = recalculateMarketShares(
    state.competitorStates.map((competitor) =>
      competitor.id === targetCompetitorId
        ? {
            ...competitor,
            score: clamp(competitor.score + (choice.competitor_effects.score ?? 0), 1, 999),
            momentum: clamp(competitor.momentum + (choice.competitor_effects.momentum ?? 0), -12, 12),
            lastMove: `이슈 대응 결과: ${choice.id}`,
          }
        : competitor,
    ),
    state,
  );

  return applyAchievementUnlocks({
    ...state,
    resources: applyResourceDelta(state.resources, choice.effects),
    competitorStates: nextCompetitors,
    currentRivalEvent: undefined,
    rivalEventHistory: [...state.rivalEventHistory, state.currentRivalEvent.id],
    timeline: [`경쟁 대응: ${choice.id}`, ...state.timeline].slice(0, 8),
  });
}

export function getCompanyStage(state: GameState): CompanyStageDefinition {
  const orderedStages = [...companyStages].sort((a, b) => b.order - a.order);
  return orderedStages.find((stage) => stageRequirementsMet(stage, state)) ?? orderedStages[orderedStages.length - 1];
}

export function serializeGameState(state: GameState, savedAt = new Date()): string {
  return JSON.stringify({ version: SAVE_VERSION, savedAt: savedAt.toISOString(), state });
}

export function hydrateSavedGame(serialized: string): { state: GameState; savedAt?: Date } {
  try {
    const parsed = JSON.parse(serialized) as { savedAt?: unknown };
    const savedAt = typeof parsed.savedAt === "string" ? new Date(parsed.savedAt) : undefined;
    return {
      state: hydrateGameState(serialized),
      savedAt: savedAt && !Number.isNaN(savedAt.getTime()) ? savedAt : undefined,
    };
  } catch {
    return { state: hydrateGameState(serialized) };
  }
}

export function hydrateGameState(serialized: string): GameState {
  let parsed: { version?: number; state?: Partial<GameState> } | undefined;

  try {
    parsed = JSON.parse(serialized) as { version?: number; state?: Partial<GameState> };
  } catch {
    return createRecoveryState("저장 데이터 복구 실패: 새 게임 상태로 안전하게 되돌렸습니다.");
  }

  if (!parsed.state) return createRecoveryState("저장 데이터 복구 실패: 저장된 회사 상태가 비어 있습니다.");

  const initialState = createInitialState();
  const rawState = parsed.state;
  const ownedItems = sanitizeStringArray(rawState.ownedItems);
  return {
    ...initialState,
    ...rawState,
    month: sanitizeNumber(rawState.month, initialState.month),
    locationId: sanitizeLocationId(rawState.locationId, initialState.locationId),
    resources: sanitizeResourceMap(rawState.resources, initialState.resources),
    capabilities: { ...initialState.capabilities, ...(isRecord(rawState.capabilities) ? rawState.capabilities : {}) },
    activeProducts: sanitizeStringArray(rawState.activeProducts, products.map((product) => product.id)),
    unlockedDomains: sanitizeStringArray(rawState.unlockedDomains, domains.map((domain) => domain.id), initialState.unlockedDomains),
    purchasedUpgrades: sanitizeStringArray(rawState.purchasedUpgrades),
    purchasedAutomationUpgrades: sanitizeStringArray(rawState.purchasedAutomationUpgrades),
    hiredAgents: Array.isArray(rawState.hiredAgents) ? rawState.hiredAgents : [],
    ownedItems,
    office: hydrateOfficeState(rawState.office, ownedItems),
    productProjects: Array.isArray(rawState.productProjects) ? rawState.productProjects : [],
    productLevels: sanitizeProductLevels(rawState.productLevels, rawState.activeProducts ?? []),
    competitorStates: Array.isArray(rawState.competitorStates) ? rawState.competitorStates : initialState.competitorStates,
    productReviews: isRecord(rawState.productReviews) ? rawState.productReviews : {},
    lastRelease: hydrateReleaseMoment(rawState.lastRelease),
    roguelite: hydrateRogueliteState(rawState.roguelite, initialState.roguelite),
    activeDevelopmentPuzzleModifiers: hydrateDevelopmentPuzzleModifiers(rawState.activeDevelopmentPuzzleModifiers),
    lastDevelopmentPuzzle: hydrateDevelopmentPuzzleResult(rawState.lastDevelopmentPuzzle),
    chosenGrowthPath: hydrateChosenGrowthPath(rawState.chosenGrowthPath),
    unlockedAchievements: sanitizeStringArray(rawState.unlockedAchievements),
    annualReviewHistory: hydrateAnnualReviewHistory(rawState.annualReviewHistory),
    annualDirective: hydrateAnnualDirective(rawState.annualDirective),
    eventHistory: sanitizeStringArray(rawState.eventHistory),
    rivalEventHistory: sanitizeStringArray(rawState.rivalEventHistory),
    timeline: sanitizeStringArray(rawState.timeline),
    status: rawState.status === "success" || rawState.status === "failure" || rawState.status === "playing" ? rawState.status : "playing",
  };
}

function createRecoveryState(message: string): GameState {
  const initialState = createInitialState();
  return {
    ...initialState,
    timeline: [message, ...initialState.timeline].slice(0, 8),
  };
}

function hydrateOfficeState(value: unknown, ownedItems: string[]): OfficeState {
  const initialOffice = createInitialOfficeState();
  if (!isRecord(value)) {
    return hydrateLegacyOfficeState(initialOffice, ownedItems);
  }

  const expansionId =
    typeof value.expansionId === "string" && officeExpansions.some((expansion) => expansion.id === value.expansionId)
      ? value.expansionId
      : initialOffice.expansionId;
  const expansion = officeExpansions.find((entry) => entry.id === expansionId) ?? officeExpansions[0];
  const ownedDecorIds = new Set(ownedItems.filter((itemId) => isOfficeDecorationItemId(itemId)));
  const placedItemIds = sanitizeStringArray(value.placedItemIds)
    .filter((itemId) => ownedDecorIds.has(itemId))
    .slice(0, expansion.decoration_slots);

  return {
    expansionId,
    placedItemIds,
  };
}

function hydrateLegacyOfficeState(office: OfficeState, ownedItems: string[]): OfficeState {
  const expansion = officeExpansions.find((entry) => entry.id === office.expansionId) ?? officeExpansions[0];
  return {
    ...office,
    placedItemIds: ownedItems.filter((itemId) => isOfficeDecorationItemId(itemId)).slice(0, expansion.decoration_slots),
  };
}

function sanitizeNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function sanitizeResourceMap(value: unknown, fallback: ResourceMap): ResourceMap {
  const raw = isRecord(value) ? (value as Record<string, unknown>) : {};
  const sanitized: ResourceMap = {};

  for (const [resourceId, fallbackValue] of Object.entries(fallback)) {
    const definition = resources[resourceId];
    const nextValue = sanitizeNumber(raw[resourceId], fallbackValue);
    sanitized[resourceId] = definition ? clamp(nextValue, definition.min_value, definition.max_value) : nextValue;
  }

  return sanitized;
}

function sanitizeStringArray(value: unknown, allowedValues?: string[], fallback: string[] = []): string[] {
  if (!Array.isArray(value)) return [...fallback];

  const allowed = allowedValues ? new Set(allowedValues) : undefined;
  return value.filter((entry): entry is string => typeof entry === "string" && (!allowed || allowed.has(entry)));
}

function sanitizeLocationId(value: unknown, fallback: string): string {
  if (typeof value === "string" && companyLocations.some((location) => location.id === value)) return value;
  return fallback;
}

function sanitizeProductLevels(value: unknown, activeProducts: unknown): Record<string, number> {
  const raw = isRecord(value) ? value : {};
  const activeProductIds = new Set(sanitizeStringArray(activeProducts, products.map((product) => product.id)));
  const sanitized: Record<string, number> = {};

  for (const product of products) {
    const rawLevel = raw[product.id];
    const fallbackLevel = activeProductIds.has(product.id) ? 1 : 0;
    const level = sanitizeNumber(rawLevel, fallbackLevel);
    if (level > 0) sanitized[product.id] = Math.round(clamp(level, 1, product.max_level));
  }

  return sanitized;
}

function createInitialCompetitorStates(month: number): CompetitorState[] {
  return competitors
    .filter((competitor) => getCompetitorEntryMonth(competitor) <= month)
    .map(createCompetitorState);
}

function createCompetitorState(competitor: CompetitorDefinition): CompetitorState {
  return {
    id: competitor.id,
    score: competitor.starting_score,
    marketShare: competitor.starting_market_share,
    momentum: 0,
    claimedProducts: [],
    researchLevel: Math.max(1, Math.floor(getCompetitorEntryMonth(competitor) / 12) + 1),
    lastMove: competitor.entry_month ? "신규 시장 진입" : "출시 준비 중",
  };
}

function getCompetitorEntryMonth(competitor: CompetitorDefinition): number {
  return competitor.entry_month ?? 1;
}

function addScheduledCompetitors(state: GameState): GameState {
  const activeCompetitorIds = new Set(state.competitorStates.map((competitor) => competitor.id));
  const entrants = competitors.filter(
    (competitor) => getCompetitorEntryMonth(competitor) <= state.month && !activeCompetitorIds.has(competitor.id),
  );

  if (entrants.length === 0) return state;

  return {
    ...state,
    competitorStates: [...state.competitorStates, ...entrants.map(createCompetitorState)],
    timeline: [
      ...entrants.map(
        (competitor) => competitor.entry_announcement ?? `강력한 신규 경쟁사 등장: ${competitor.id} 시장 진입`,
      ),
      ...state.timeline,
    ].slice(0, 8),
  };
}

function advanceCompetitors(state: GameState): GameState {
  const playerDomains = new Set(
    products.filter((product) => state.activeProducts.includes(product.id)).map((product) => product.domain),
  );
  const movedCompetitors = state.competitorStates.map((competitorState) => {
    const definition = competitors.find((competitor) => competitor.id === competitorState.id);
    if (!definition) return competitorState;

    const contestedDomain = definition.focus_domains.some((domainId) => playerDomains.has(domainId));
    const nextClaimableProduct = getNextClaimableProduct(definition.focus_domains, competitorState.claimedProducts);
    const productToClaim = shouldCompetitorClaimProduct(definition.id, state.month) ? nextClaimableProduct : undefined;
    const productToPrepare =
      !productToClaim && shouldCompetitorPrepareProduct(definition.id, state.month) ? nextClaimableProduct : undefined;
    const scoreGain = definition.monthly_growth + competitorState.momentum + (contestedDomain ? definition.aggression : 0);
    const claimedProducts = productToClaim ? [...competitorState.claimedProducts, productToClaim.id] : competitorState.claimedProducts;

    return {
      ...competitorState,
      score: clamp(competitorState.score + scoreGain, 1, 999),
      momentum: clamp(competitorState.momentum * 0.65, -12, 12),
      claimedProducts,
      researchLevel: competitorState.researchLevel + (state.month % 4 === 0 ? 1 : 0),
      lastMove: getCompetitorLastMove(productToClaim, productToPrepare, contestedDomain, state.month),
    };
  });
  const nextCompetitors = recalculateMarketShares(movedCompetitors, state);
  const competitionTimeline = getCompetitionTimeline(state.competitorStates, nextCompetitors);

  return {
    ...state,
    competitorStates: nextCompetitors,
    timeline: [...competitionTimeline, ...state.timeline].slice(0, 8),
  };
}

function recalculateMarketShares(competitorStates: CompetitorState[], state: GameState): CompetitorState[] {
  const playerScore = getPlayerCompetitiveScore(state);
  const totalScore = Math.max(1, playerScore + competitorStates.reduce((sum, competitor) => sum + competitor.score, 0));
  return competitorStates.map((competitor) => ({
    ...competitor,
    marketShare: Math.round((competitor.score / totalScore) * 100),
  }));
}

function getPlayerCompetitiveScore(state: GameState): number {
  const capabilityScore = Object.values(state.capabilities).reduce((sum, level) => sum + level, 0) * 4;
  return Math.round(
    18 +
      state.activeProducts.length * 16 +
      state.productProjects.length * 4 +
      (state.resources.users ?? 0) / 700 +
      (state.resources.hype ?? 0) * 0.45 +
      (state.resources.trust ?? 0) * 0.35 +
      (state.resources.automation ?? 0) * 0.5 +
      capabilityScore,
  );
}

function shouldCompetitorClaimProduct(competitorId: string, month: number): boolean {
  const competitorIndex = competitors.findIndex((competitor) => competitor.id === competitorId);
  return month >= 4 && (month + competitorIndex) % 3 === 0;
}

function shouldCompetitorPrepareProduct(competitorId: string, month: number): boolean {
  const competitorIndex = competitors.findIndex((competitor) => competitor.id === competitorId);
  return month >= 2 && month <= 3 && (month + competitorIndex) % 2 === 0;
}

function getCompetitorLastMove(
  productToClaim: ProductDefinition | undefined,
  productToPrepare: ProductDefinition | undefined,
  contestedDomain: boolean,
  month: number,
): string {
  if (productToClaim) return `${productToClaim.name} 시장 선점`;
  if (productToPrepare) return `${productToPrepare.name} 시장 진입 준비`;
  if (contestedDomain) return month <= 3 ? "우리 제품 분야를 관찰" : "우리 제품 분야를 압박";
  return "기초 모델 연구 강화";
}

function getNextClaimableProduct(focusDomains: string[], claimedProducts: string[]): ProductDefinition | undefined {
  return products.find((product) => focusDomains.includes(product.domain) && !claimedProducts.includes(product.id));
}

function getCompetitionTimeline(previous: CompetitorState[], next: CompetitorState[]): string[] {
  return next.flatMap((competitor) => {
    const old = previous.find((entry) => entry.id === competitor.id);
    if (!old) return [];

    if (competitor.claimedProducts.length > old.claimedProducts.length) {
      return [`경쟁사 ${competitor.id} 선점: ${competitor.lastMove}`];
    }

    if (competitor.lastMove !== old.lastMove && competitor.lastMove.includes("준비")) {
      return [`경쟁사 ${competitor.id} 예고: ${competitor.lastMove}`];
    }

    return [];
  });
}

function findNextEligibleRivalEvent(state: GameState) {
  return rivalEvents.find((event) => !state.rivalEventHistory.includes(event.id) && rivalEventRequirementsMet(event.conditions, state));
}

function rivalEventRequirementsMet(conditions: Record<string, number>, state: GameState): boolean {
  return Object.entries(conditions).every(([condition, needed]) => {
    if (condition === "min_month") return state.month >= needed;
    if (condition === "min_products") return state.activeProducts.length >= needed;
    if (condition === "min_trust") return (state.resources.trust ?? 0) >= needed;
    if (condition === "min_market_share") return getPlayerMarketShare(state) >= needed;
    return false;
  });
}

function advanceProductProjects(state: GameState): GameState {
  if (state.productProjects.length === 0) return state;

  let nextState = state;
  const continuingProjects: ProductProject[] = [];
  const releaseTimeline: string[] = [];

  for (const project of state.productProjects) {
    const product = products.find((entry) => entry.id === project.productId);
    if (!product) continue;

    const teamStats = getProjectTeamStats(project, state);
    const progressGain = getProjectProgressGain(teamStats);
    const qualityGain = getProjectQualityGain(teamStats);
    const progressedProject: ProductProject = {
      ...project,
      progress: clamp(project.progress + progressGain, 0, 100),
      quality: clamp(project.quality + qualityGain, 0, 100),
    };

    if (progressedProject.progress >= 100) {
      const releaseReview = createReleaseReview(product, nextState, progressedProject.quality);
      const lastRelease = {
        productId: product.id,
        productName: product.name,
        month: state.month,
        review: releaseReview,
        headline: createReleaseHeadline(product, releaseReview),
        marketReaction: createMarketReaction(product, releaseReview),
        expansionHint: getReleaseExpansionHint(product),
        growthPaths: createReleaseGrowthPaths(product),
      };
      nextState = {
        ...nextState,
        resources: applyResourceDelta(nextState.resources, {
          hype: product.hype_on_launch,
          trust: progressedProject.quality >= 82 ? 2 : 0,
        }),
        activeProducts: [...nextState.activeProducts, product.id],
        productLevels: { ...nextState.productLevels, [product.id]: 1 },
        productReviews: { ...nextState.productReviews, [product.id]: releaseReview },
        lastRelease,
        roguelite: createReleaseCardReward(product, releaseReview, nextState),
        hiredAgents: nextState.hiredAgents.map((agent) =>
          progressedProject.assignedAgentIds.includes(agent.id)
            ? { ...agent, assignment: undefined, energy: clamp(agent.energy - 18, 0, 100) }
            : agent,
        ),
      };
      releaseTimeline.push(`${product.name} 완성: ${releaseReview.grade} (${releaseReview.score}점) 출시`);
    } else {
      continuingProjects.push(progressedProject);
      releaseTimeline.push(`${product.name} 개발 ${Math.round(progressedProject.progress)}% / 완성도 ${Math.round(progressedProject.quality)}`);
    }
  }

  return {
    ...nextState,
    productProjects: continuingProjects,
    timeline: releaseTimeline,
  };
}

function getProjectTeamStats(project: ProductProject, state: GameState): AgentStats {
  const projectAgents = state.hiredAgents.filter((agent) => project.assignedAgentIds.includes(agent.id));
  const agentStats = projectAgents.reduce((stats, agent) => addStats(stats, getAgentEffectiveStats(agent, state)), createEmptyStats());
  return addStats(agentStats, getGlobalItemStats(state));
}

function getProjectProgressGain(_stats: AgentStats): number {
  return 50;
}

function getProjectQualityGain(stats: AgentStats): number {
  return Math.round(clamp(5 + stats.product * 0.65 + stats.creativity * 0.55 + stats.safety * 0.35 + stats.research * 0.25, 7, 24));
}

function getStartingProjectQuality(assignedAgents: HiredAgent[], state: GameState): number {
  const stats = assignedAgents.reduce((total, agent) => addStats(total, getAgentEffectiveStats(agent, state)), getGlobalItemStats(state));
  return Math.round(clamp(35 + stats.product * 0.7 + stats.creativity * 0.5 + stats.safety * 0.25, 35, 72));
}

function getNextStatus(nextResources: ResourceMap, activeProductCount: number, month: number): GameState["status"] {
  if ((nextResources.cash ?? 0) < balance.game_over_cash_threshold && (nextResources.trust ?? 0) < balance.game_over_trust_threshold) {
    return "failure";
  }

  if (month >= CAMPAIGN_FINAL_MONTH && hasCampaignSuccessResources(nextResources, activeProductCount)) {
    return "success";
  }

  if (month >= CAMPAIGN_FINAL_MONTH) return "failure";

  return "playing";
}

function hasCampaignSuccessResources(nextResources: ResourceMap, activeProductCount: number): boolean {
  return (
    (nextResources.users ?? 0) >= balance.success_users_threshold ||
    (nextResources.cash ?? 0) >= balance.success_cash_threshold ||
    ((nextResources.automation ?? 0) >= balance.success_automation_threshold && activeProductCount >= balance.success_min_products) ||
    (activeProductCount >= 3 && (nextResources.cash ?? 0) >= 0 && (nextResources.trust ?? 0) >= 45)
  );
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

function mergeResourceDelta(base: ResourceMap, extra: ResourceMap): ResourceMap {
  const next = { ...base };

  for (const [resourceId, amount] of Object.entries(extra)) {
    next[resourceId] = (next[resourceId] ?? 0) + amount;
  }

  return next;
}

function getChosenGrowthPathMonthlyEffects(state: GameState): ResourceMap | undefined {
  if (!state.chosenGrowthPath) return undefined;

  const path = growthPaths.find((entry) => entry.id === state.chosenGrowthPath?.id);
  if (!path || Object.keys(path.monthly_effects ?? {}).length === 0) return undefined;
  return path.monthly_effects;
}

function getMonthlyStrategicEffects(state: GameState): ResourceMap | undefined {
  const annualDirective = getActiveAnnualDirective(state);
  const effects: ResourceMap[] = [];
  const growthPathEffects = getChosenGrowthPathMonthlyEffects(state);
  if (growthPathEffects && Object.keys(growthPathEffects).length > 0) effects.push(growthPathEffects);
  if (annualDirective?.monthlyEffects && Object.keys(annualDirective.monthlyEffects).length > 0) {
    effects.push(annualDirective.monthlyEffects);
  }

  if (effects.length === 0) return undefined;
  return effects.reduce<ResourceMap>((combined, effect) => mergeResourceDelta(combined, effect), {});
}

function formatResourceDelta(delta: ResourceMap): string {
  return Object.entries(delta)
    .map(([resourceId, amount]) => {
      const resourceName = resources[resourceId]?.name ?? resourceId;
      const sign = amount >= 0 ? "+" : "";
      return `${resourceName} ${sign}${amount.toLocaleString("ko-KR")}`;
    })
    .join(", ");
}

function negateCosts(costs: ResourceMap): ResourceMap {
  return Object.fromEntries(Object.entries(costs).map(([resourceId, value]) => [resourceId, -value]));
}

function domainName(id: string): string {
  return domains.find((domain) => domain.id === id)?.name ?? id;
}

function getReleaseExpansionHint(product: ProductDefinition): string {
  if (product.tags.includes("language")) {
    return "언어 능력은 회의 요약, 고객지원, 교육 제품으로 확장될 수 있습니다.";
  }
  if (product.tags.includes("vision")) {
    return "비전 능력은 썸네일, 영상, 디자인 자동화 시장으로 뻗을 수 있습니다.";
  }
  if (product.tags.includes("code")) {
    return "코드 능력은 개발자 도구, 자동화, 엔터프라이즈 에이전트로 이어질 수 있습니다.";
  }
  return "이 제품의 기반 능력은 새로운 도메인으로 확장될 수 있습니다.";
}

function hydrateReleaseMoment(lastRelease: ReleaseMoment | undefined): ReleaseMoment | undefined {
  if (!lastRelease) return undefined;
  if (lastRelease.growthPaths?.length) return lastRelease;

  const product = products.find((entry) => entry.id === lastRelease.productId);
  const review = lastRelease.review;
  return {
    ...lastRelease,
    headline: lastRelease.headline ?? (product ? createReleaseHeadline(product, review) : `${lastRelease.productName} 출시`),
    marketReaction: lastRelease.marketReaction ?? (product ? createMarketReaction(product, review) : "시장 반응을 다시 집계하고 있습니다."),
    growthPaths: product ? createReleaseGrowthPaths(product) : [],
  };
}

function hydrateChosenGrowthPath(chosenGrowthPath: GameState["chosenGrowthPath"]): GameState["chosenGrowthPath"] {
  if (!chosenGrowthPath) return undefined;

  const path = growthPaths.find((entry) => entry.id === chosenGrowthPath.id);
  return {
    ...chosenGrowthPath,
    monthlyEffects: chosenGrowthPath.monthlyEffects ?? path?.monthly_effects ?? {},
  };
}

function hydrateRogueliteState(value: unknown, fallback: RogueliteState): RogueliteState {
  if (!isRecord(value)) return fallback;

  const unlockedMetaIds = sanitizeStringArray(value.unlockedMetaIds);
  const deck = hydrateStrategyDeck(value.deck, fallback.deck);
  const cardIds = strategyCards.map((card) => card.id);

  return {
    runNumber: Math.max(1, Math.round(sanitizeNumber(value.runNumber, fallback.runNumber))),
    founderInsight: Math.max(0, Math.round(sanitizeNumber(value.founderInsight, fallback.founderInsight))),
    unlockedMetaIds,
    deck,
    deckEditTokens: Math.max(0, Math.round(sanitizeNumber(value.deckEditTokens, fallback.deckEditTokens))),
    upgradedCardIds: uniqueStrings(sanitizeStringArray(value.upgradedCardIds, cardIds)),
    rewardHistory: hydrateCardRewardHistory(value.rewardHistory),
    runHistory: hydrateRunHistory(value.runHistory),
    pendingCardReward: hydratePendingCardReward(value.pendingCardReward),
  };
}

function hydrateStrategyDeck(value: unknown, fallback: StrategyDeckState): StrategyDeckState {
  if (!isRecord(value)) return fallback;

  const cardIds = strategyCards.map((card) => card.id);
  return {
    drawPile: sanitizeStringArray(value.drawPile, cardIds),
    hand: sanitizeStringArray(value.hand, cardIds),
    discardPile: sanitizeStringArray(value.discardPile, cardIds),
    playedThisTurn: sanitizeStringArray(value.playedThisTurn, cardIds),
  };
}

function hydratePendingCardReward(value: unknown): PendingCardReward | undefined {
  if (!isRecord(value)) return undefined;
  const product = typeof value.productId === "string" ? products.find((entry) => entry.id === value.productId) : undefined;
  const offeredCardIds = uniqueStrings(sanitizeStringArray(value.offeredCardIds, strategyCards.map((card) => card.id))).slice(0, 3);

  if (
    typeof value.id !== "string" ||
    !product ||
    typeof value.productName !== "string" ||
    typeof value.reviewGrade !== "string" ||
    offeredCardIds.length === 0
  ) {
    return undefined;
  }

  return {
    id: value.id,
    productId: product.id,
    productName: value.productName,
    month: Math.max(1, Math.round(sanitizeNumber(value.month, 1))),
    reviewGrade: value.reviewGrade,
    offeredCardIds,
  };
}

function hydrateCardRewardHistory(value: unknown): CardRewardChoice[] {
  if (!Array.isArray(value)) return [];
  const productIds = new Set(products.map((product) => product.id));
  const cardIds = new Set(strategyCards.map((card) => card.id));

  return value
    .filter((entry): entry is CardRewardChoice => {
      if (!isRecord(entry)) return false;
      return (
        typeof entry.rewardId === "string" &&
        typeof entry.productId === "string" &&
        productIds.has(entry.productId) &&
        typeof entry.chosenCardId === "string" &&
        cardIds.has(entry.chosenCardId) &&
        typeof entry.month === "number" &&
        Number.isFinite(entry.month)
      );
    })
    .slice(0, 12);
}

function hydrateRunHistory(value: unknown): RunRecord[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((entry): entry is RunRecord => {
      if (!isRecord(entry)) return false;
      return (
        typeof entry.id === "string" &&
        typeof entry.runNumber === "number" &&
        Number.isFinite(entry.runNumber) &&
        typeof entry.endedMonth === "number" &&
        Number.isFinite(entry.endedMonth) &&
        ["playing", "success", "failure"].includes(String(entry.status)) &&
        typeof entry.score === "number" &&
        Number.isFinite(entry.score) &&
        typeof entry.insightReward === "number" &&
        Number.isFinite(entry.insightReward) &&
        typeof entry.note === "string"
      );
    })
    .map((entry) => ({
      ...entry,
      score: Math.round(clamp(entry.score, 0, 100)),
      insightReward: Math.max(0, Math.round(entry.insightReward)),
      runNumber: Math.max(1, Math.round(entry.runNumber)),
      endedMonth: Math.max(1, Math.round(entry.endedMonth)),
      bestProductName: typeof entry.bestProductName === "string" ? entry.bestProductName : undefined,
      representativeCardName: typeof entry.representativeCardName === "string" ? entry.representativeCardName : undefined,
      rivalName: typeof entry.rivalName === "string" ? entry.rivalName : undefined,
    }))
    .slice(0, 8);
}

function hydrateAnnualReviewHistory(value: unknown): AnnualReviewHistoryEntry[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((entry): entry is AnnualReviewHistoryEntry => {
      if (!isRecord(entry)) return false;
      return (
        typeof entry.reviewId === "string" &&
        typeof entry.year === "number" &&
        Number.isFinite(entry.year) &&
        typeof entry.month === "number" &&
        Number.isFinite(entry.month) &&
        typeof entry.passed === "boolean" &&
        typeof entry.score === "number" &&
        Number.isFinite(entry.score) &&
        typeof entry.title === "string" &&
        typeof entry.summary === "string" &&
        isRecord(entry.reward)
      );
    })
    .map((entry) => ({
      ...entry,
      year: Math.max(1, Math.round(entry.year)),
      month: Math.max(1, Math.round(entry.month)),
      score: Math.round(clamp(entry.score, 0, 100)),
      reward: sanitizeResourceDelta(entry.reward),
    }))
    .slice(0, 12);
}

function hydrateAnnualDirective(value: unknown): AnnualDirectiveState | undefined {
  if (!isRecord(value)) return undefined;
  const reviewId = typeof value.reviewId === "string" ? value.reviewId : "";
  const review = annualReviews.find((entry) => entry.id === reviewId);
  const source = value.source === "passed" || value.source === "recovery" ? value.source : undefined;

  if (
    !review ||
    !source ||
    typeof value.title !== "string" ||
    typeof value.description !== "string" ||
    typeof value.recommendedMenu !== "string" ||
    !isRecord(value.monthlyEffects)
  ) {
    return undefined;
  }

  return {
    reviewId,
    year: Math.max(1, Math.round(sanitizeNumber(value.year, review.year))),
    source,
    title: value.title,
    description: value.description,
    expiresMonth: Math.max(review.month + 1, Math.round(sanitizeNumber(value.expiresMonth, review.month + 12))),
    monthlyEffects: sanitizeResourceDelta(value.monthlyEffects),
    recommendedMenu: value.recommendedMenu,
    rivalMomentumDelta: Math.round(clamp(sanitizeNumber(value.rivalMomentumDelta, 0), -12, 12)),
  };
}

function sanitizeResourceDelta(value: Record<string, unknown>): ResourceMap {
  const sanitized: ResourceMap = {};

  for (const [resourceId, amount] of Object.entries(value)) {
    if (resources[resourceId] && typeof amount === "number" && Number.isFinite(amount)) {
      sanitized[resourceId] = amount;
    }
  }

  return sanitized;
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values)];
}

function hydrateDevelopmentPuzzleModifiers(value: unknown): ActiveDevelopmentPuzzleModifier[] {
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is ActiveDevelopmentPuzzleModifier => {
    if (!isRecord(entry)) return false;
    return (
      typeof entry.id === "string" &&
      typeof entry.sourceCardId === "string" &&
      typeof entry.label === "string" &&
      typeof entry.projectId === "string" &&
      Array.isArray(entry.targetChallenges) &&
      typeof entry.scoreBonus === "number" &&
      typeof entry.difficultyDelta === "number" &&
      typeof entry.tileLimitBonus === "number" &&
      typeof entry.usesRemaining === "number"
    );
  });
}

function hydrateDevelopmentPuzzleResult(value: unknown): DevelopmentPuzzleResult | undefined {
  if (!isRecord(value)) return undefined;
  if (typeof value.projectId !== "string" || typeof value.productId !== "string") return undefined;
  if (!Array.isArray(value.tiles) || !Array.isArray(value.selectedTileIds)) return undefined;

  return value as unknown as DevelopmentPuzzleResult;
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

function createEmptyStats(): AgentStats {
  return {
    research: 0,
    engineering: 0,
    product: 0,
    growth: 0,
    safety: 0,
    operations: 0,
    creativity: 0,
    autonomy: 0,
  };
}

function addStats(current: AgentStats, effects: Partial<AgentStats> | Record<string, number>): AgentStats {
  const next = { ...current };
  const effectMap = effects as Record<string, number | undefined>;

  for (const stat of statKeys) {
    next[stat] += effectMap[stat] ?? 0;
  }

  return next;
}

function getGlobalItemStats(state: GameState): AgentStats {
  return getPlacedOfficeItems(state).reduce((stats, item) => addStats(stats, item.effects), createEmptyStats());
}

function createInitialOfficeState(): OfficeState {
  return {
    expansionId: officeExpansions[0]?.id ?? "garage_lab",
    placedItemIds: [],
  };
}

function maybeAutoPlaceOfficeItem(item: ItemDefinition, office: OfficeState, ownedItems: string[]): OfficeState {
  if (!isOfficeDecorationItem(item) || office.placedItemIds.includes(item.id)) return office;

  const ownedDecorIds = new Set(ownedItems.filter((itemId) => isOfficeDecorationItemId(itemId)));
  const placedItemIds = office.placedItemIds.filter((itemId) => ownedDecorIds.has(itemId));
  const expansion = officeExpansions.find((entry) => entry.id === office.expansionId) ?? officeExpansions[0];
  if (placedItemIds.length >= expansion.decoration_slots) return { ...office, placedItemIds };

  return {
    ...office,
    placedItemIds: [...placedItemIds, item.id],
  };
}

function isOfficeDecorationItem(item: ItemDefinition): boolean {
  return item.target !== "agent";
}

function isOfficeDecorationItemId(itemId: string): boolean {
  const item = items.find((entry) => entry.id === itemId);
  return Boolean(item && isOfficeDecorationItem(item));
}

function pickResourceEffects(effects: Record<string, number>): ResourceMap {
  return Object.fromEntries(Object.entries(effects).filter(([resourceId]) => Boolean(resources[resourceId])));
}

function getAvailableAgents(state: GameState): HiredAgent[] {
  return state.hiredAgents.filter((agent) => !agent.assignment);
}

function getSelectedProjectAgents(state: GameState, assignedAgentIds?: string[]): HiredAgent[] {
  const availableAgents = getAvailableAgents(state);
  if (!assignedAgentIds) return availableAgents.slice(0, 3);

  const selectedIds = new Set(assignedAgentIds);
  return availableAgents.filter((agent) => selectedIds.has(agent.id)).slice(0, 3);
}

function createReleaseReview(product: ProductDefinition, state: GameState, projectQuality = 60): ReleaseReview {
  const claimPenalty = getProductClaimPenalty(product, state);
  const score = Math.round(
    clamp(
      54 +
        product.hype_on_launch * 1.8 +
        (state.resources.trust ?? 0) * 0.18 +
        Object.keys(product.required_capabilities).length * 4 +
        (projectQuality - 60) * 0.65 -
        claimPenalty,
      45,
      99,
    ),
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

function getProductClaimPenalty(product: ProductDefinition, state: GameState): number {
  const claimCount = state.competitorStates.filter((competitor) => competitor.claimedProducts.includes(product.id)).length;
  return clamp(claimCount * 5, 0, 15);
}

function getProductMonthlyRevenue(product: ProductDefinition, state: GameState): number {
  return Math.round(product.base_revenue * getProductRevenueMultiplier(product.id, state));
}

function getProductMonthlyUsers(product: ProductDefinition, state: GameState): number {
  return Math.round(product.base_users_per_month * getProductUserMultiplier(product.id, state));
}

function getProductMonthlyData(product: ProductDefinition, state: GameState): number {
  return Math.round(product.data_generated_per_month * getProductDataMultiplier(product.id, state));
}

function getProductComputePressure(product: ProductDefinition, state: GameState): number {
  return product.compute_per_1000_users * getProductComputeMultiplier(product.id, state);
}

function getProductRevenueMultiplier(productId: string, state: GameState): number {
  return 1 + Math.max(0, getProductLevel(productId, state) - 1) * 0.35;
}

function getProductUserMultiplier(productId: string, state: GameState): number {
  return 1 + Math.max(0, getProductLevel(productId, state) - 1) * 0.25;
}

function getProductDataMultiplier(productId: string, state: GameState): number {
  return 1 + Math.max(0, getProductLevel(productId, state) - 1) * 0.2;
}

function getProductComputeMultiplier(productId: string, state: GameState): number {
  return 1 + Math.max(0, getProductLevel(productId, state) - 1) * 0.15;
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
    if (requirement === "min_cash" && (state.resources.cash ?? 0) < needed) reasons.push(`자금 ${formatMoney(needed)} 필요`);
    if (requirement === "min_data" && (state.resources.data ?? 0) < needed) reasons.push(`데이터 ${needed} 필요`);
    if (requirement === "min_star" && getCompanyStarRating(state) < needed) reasons.push(`${needed}성 회사 필요`);
    if (requirement.startsWith("min_capability_")) {
      const capabilityId = requirement.replace("min_capability_", "");
      const currentLevel = state.capabilities[capabilityId] ?? 0;
      if (currentLevel < needed) {
        const capabilityName = capabilities.find((capability) => capability.id === capabilityId)?.name ?? capabilityId;
        reasons.push(`${capabilityName} Lv.${needed} 필요`);
      }
    }
  }

  return reasons;
}

function getAgentKind(agent: AgentTypeDefinition): NonNullable<AgentTypeDefinition["kind"]> {
  return agent.kind ?? "ai_agent";
}

function appendCostReasons(reasons: string[], cost: ResourceMap = {}, state: GameState): void {
  for (const [resourceId, amount] of Object.entries(cost)) {
    if ((state.resources[resourceId] ?? 0) < amount) {
      const resourceName = resources[resourceId]?.name ?? resourceId;
      reasons.push(`${resourceName} 부족`);
    }
  }
}
