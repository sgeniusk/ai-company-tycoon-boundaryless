import { campaignEndings, derivationRules, difficultyTiers, growthPaths, runModifiers } from "./data";
import { DEFAULT_RUN_MODIFIER_SELECTION, type RunModifierSelectionInput } from "./run-modifiers";
import { getDerivedArchetypes } from "./tag-derivation";
import type { EndingConditionDefinition, EndingDefinition, GameState, ResourceMap } from "./types";

export interface EndingCollectionEntry extends EndingDefinition {
  discovered: boolean;
  targetLabels: string[];
  selection?: RunModifierSelectionInput;
}

export interface EndingRequirementProgress {
  id: string;
  label: string;
  currentLabel: string;
  targetLabel: string;
  complete: boolean;
  blocking: boolean;
  progress: number;
}

export type EndingReplayActionMenuId = "company" | "products" | "deck" | "agents" | "research" | "shop" | "competition" | "log";

export interface EndingReplayRequirementPrompt extends EndingRequirementProgress {
  actionLabel: string;
  targetMenu: EndingReplayActionMenuId;
}

export interface EndingTargetPlan extends EndingDefinition {
  complete: boolean;
  progressPercent: number;
  matchedRequirements: number;
  totalRequirements: number;
  blockers: string[];
  requirements: EndingRequirementProgress[];
}

export interface EndingReplayPlan extends EndingDefinition {
  discovered: boolean;
  selection: RunModifierSelectionInput;
  targetLabels: string[];
  openingMoves: string[];
}

export interface ActiveEndingReplayBrief extends EndingTargetPlan {
  seed: string;
  selection: RunModifierSelectionInput;
  targetLabels: string[];
  openingMoves: string[];
  nextRequirements: EndingReplayRequirementPrompt[];
  rewardLabel: string;
}

export interface EndingNearMissPlan extends EndingTargetPlan {
  missingLabels: string[];
  replaySelection: RunModifierSelectionInput;
  targetLabels: string[];
}

export function getCampaignEnding(finalState: GameState): EndingDefinition {
  const matches = campaignEndings
    .map((ending, index) => ({ ending, index }))
    .filter(({ ending }) => endingMatchesState(ending, finalState))
    .sort((a, b) => b.ending.priority - a.ending.priority || a.index - b.index);

  return matches[0]?.ending ?? campaignEndings[campaignEndings.length - 1];
}

export function getCampaignEndingReport(finalState: GameState): EndingTargetPlan {
  return createEndingTargetPlan(getCampaignEnding(finalState), finalState);
}

export function getEndingTargetPlans(state: GameState, limit = 3): EndingTargetPlan[] {
  const plans = campaignEndings
    .filter((ending) => ending.condition.fallback !== true)
    .map((ending) => createEndingTargetPlan(ending, state));
  const feasiblePlans = plans.filter((plan) => plan.blockers.length === 0);
  const rankedPlans = (feasiblePlans.length ? feasiblePlans : plans).sort(
    (first, second) =>
      Number(second.complete) - Number(first.complete) ||
      second.progressPercent - first.progressPercent ||
      second.priority - first.priority ||
      first.id.localeCompare(second.id),
  );

  return rankedPlans.slice(0, Math.max(1, limit));
}

export function getEndingNearMisses(state: GameState, limit = 3): EndingNearMissPlan[] {
  if (state.status === "playing" && state.month < 120) return [];

  const currentEndingId = getCampaignEnding(state).id;

  return campaignEndings
    .filter((ending) => ending.condition.fallback !== true && ending.id !== currentEndingId)
    .map((ending) => createEndingNearMissPlan(ending, state))
    .filter((plan) => !plan.complete)
    .sort(
      (first, second) =>
        second.progressPercent - first.progressPercent ||
        first.missingLabels.length - second.missingLabels.length ||
        second.priority - first.priority ||
        first.id.localeCompare(second.id),
    )
    .slice(0, Math.max(1, limit));
}

export function getActiveEndingReplayBrief(state: GameState): ActiveEndingReplayBrief | undefined {
  const ending = getReplayEndingFromSeed(state.runModifiers.seed);
  if (!ending) return undefined;

  const plan = createEndingTargetPlan(ending, state);
  const selection = createReplaySelection(ending);

  return {
    ...plan,
    seed: state.runModifiers.seed,
    selection,
    targetLabels: getReplayTargetLabels(ending.condition, selection),
    openingMoves: getReplayOpeningMoves(ending.condition),
    nextRequirements: getReplayNextRequirements(plan.requirements),
    rewardLabel: `완주 보너스 +${ending.meta_reward_bonus} 통찰`,
  };
}

export function getEndingReplayPlans(state: Pick<GameState, "roguelite">, limit = 3): EndingReplayPlan[] {
  const discoveredIds = new Set(state.roguelite.discoveredEndingIds ?? []);

  return campaignEndings
    .filter((ending) => ending.condition.fallback !== true)
    .map((ending) => createEndingReplayPlan(ending, discoveredIds))
    .sort(
      (first, second) =>
        Number(first.discovered) - Number(second.discovered) ||
        second.priority - first.priority ||
        first.id.localeCompare(second.id),
    )
    .slice(0, Math.max(1, limit));
}

export function getEndingCollectionEntries(state: Pick<GameState, "roguelite">): EndingCollectionEntry[] {
  const discoveredIds = new Set(state.roguelite.discoveredEndingIds ?? []);

  return campaignEndings
    .map((ending) => {
      const selection = ending.condition.fallback === true ? undefined : createReplaySelection(ending);

      return {
        ...ending,
        discovered: discoveredIds.has(ending.id),
        targetLabels: selection ? getReplayTargetLabels(ending.condition, selection) : [],
        selection,
      };
    })
    .sort((first, second) => Number(second.discovered) - Number(first.discovered) || second.priority - first.priority || first.id.localeCompare(second.id));
}

export function endingMatchesState(ending: EndingDefinition, state: GameState): boolean {
  return conditionMatchesState(ending.condition, state);
}

function createEndingTargetPlan(ending: EndingDefinition, state: GameState): EndingTargetPlan {
  const requirements = getEndingRequirementProgress(ending.condition, state);
  const matchedRequirements = requirements.filter((requirement) => requirement.complete).length;
  const totalRequirements = requirements.length || 1;
  const blockers = requirements.filter((requirement) => requirement.blocking && !requirement.complete).map((requirement) => requirement.label);
  const progressScore = requirements.reduce((total, requirement) => total + requirement.progress, 0) / totalRequirements;

  return {
    ...ending,
    complete: endingMatchesState(ending, state),
    progressPercent: Math.round(progressScore * 100),
    matchedRequirements,
    totalRequirements,
    blockers,
    requirements,
  };
}

function createEndingReplayPlan(ending: EndingDefinition, discoveredIds: Set<string>): EndingReplayPlan {
  const selection = createReplaySelection(ending);

  return {
    ...ending,
    discovered: discoveredIds.has(ending.id),
    selection,
    targetLabels: getReplayTargetLabels(ending.condition, selection),
    openingMoves: getReplayOpeningMoves(ending.condition),
  };
}

function createEndingNearMissPlan(ending: EndingDefinition, state: GameState): EndingNearMissPlan {
  const plan = createEndingTargetPlan(ending, state);
  const replaySelection = createReplaySelection(ending);

  return {
    ...plan,
    missingLabels: plan.requirements.filter((requirement) => !requirement.complete).map((requirement) => requirement.label),
    replaySelection,
    targetLabels: getReplayTargetLabels(ending.condition, replaySelection),
  };
}

function getReplayEndingFromSeed(seed: string): EndingDefinition | undefined {
  if (!seed.startsWith("ending:")) return undefined;
  const endingId = seed.slice("ending:".length);
  return campaignEndings.find((ending) => ending.id === endingId && ending.condition.fallback !== true);
}

function createReplaySelection(ending: EndingDefinition): RunModifierSelectionInput {
  const condition = ending.condition;
  const explicitDimensions = new Set<string>();
  const selection: RunModifierSelectionInput = {
    seed: `ending:${ending.id}`,
    startCityId: firstConditionId(condition.start_city_ids, DEFAULT_RUN_MODIFIER_SELECTION.startCityId, explicitDimensions, "startCityId"),
    worldLoreId: firstConditionId(condition.world_lore_ids, DEFAULT_RUN_MODIFIER_SELECTION.worldLoreId, explicitDimensions, "worldLoreId"),
    marketConditionId: firstConditionId(condition.market_condition_ids, DEFAULT_RUN_MODIFIER_SELECTION.marketConditionId, explicitDimensions, "marketConditionId"),
    founderTraitId: firstConditionId(condition.founder_trait_ids, getReplayFounderTraitId(condition), explicitDimensions, "founderTraitId"),
    challengeTierId: condition.challenge_tier_ids?.[0] ?? "standard",
  };

  return improveReplaySelectionForArchetypes(selection, condition, explicitDimensions);
}

function firstConditionId(ids: string[] | undefined, fallback: string, explicitDimensions: Set<string>, dimension: string): string {
  if (ids?.length) {
    explicitDimensions.add(dimension);
    return ids[0];
  }

  return fallback;
}

function getReplayFounderTraitId(condition: EndingConditionDefinition): string {
  if (condition.growth_path_ids?.includes("trust_enterprise")) return "researcher_founder";
  if (condition.growth_path_ids?.includes("code_vision_lab")) return "engineer_founder";
  if (condition.archetype_ids?.some((id) => ["data_alchemist", "lab_in_winter"].includes(id))) return "researcher_founder";
  if (condition.archetype_ids?.includes("compute_siege_survivor")) return "operator_founder";
  return DEFAULT_RUN_MODIFIER_SELECTION.founderTraitId;
}

function improveReplaySelectionForArchetypes(
  selection: RunModifierSelectionInput,
  condition: EndingConditionDefinition,
  explicitDimensions: Set<string>,
): RunModifierSelectionInput {
  if (!condition.archetype_ids?.length) return selection;

  const requiredTags = new Set(
    condition.archetype_ids.flatMap((archetypeId) => derivationRules.find((rule) => rule.id === archetypeId)?.requires ?? []),
  );
  if (requiredTags.size === 0) return selection;

  const nextSelection = { ...selection };
  const replayDimensions = [
    { key: "start_cities" as const, selectionKey: "startCityId" as const },
    { key: "world_lore" as const, selectionKey: "worldLoreId" as const },
    { key: "market_conditions" as const, selectionKey: "marketConditionId" as const },
    { key: "founder_traits" as const, selectionKey: "founderTraitId" as const },
  ];

  for (const dimension of replayDimensions) {
    if (explicitDimensions.has(dimension.selectionKey)) continue;
    const selectedTags = getReplaySelectionTags(nextSelection);
    const missingTags = [...requiredTags].filter((tag) => !selectedTags.has(tag));
    if (missingTags.length === 0) break;

    const currentId = nextSelection[dimension.selectionKey];
    const bestOption = runModifiers[dimension.key]
      .map((option, index) => ({
        option,
        index,
        score: option.tags.filter((tag) => missingTags.includes(tag)).length,
      }))
      .sort((first, second) => second.score - first.score || first.index - second.index)[0];

    if (bestOption && bestOption.score > 0 && bestOption.option.id !== currentId) {
      nextSelection[dimension.selectionKey] = bestOption.option.id;
    }
  }

  return nextSelection;
}

function getReplaySelectionTags(selection: RunModifierSelectionInput): Set<string> {
  const entries = [
    runModifiers.start_cities.find((entry) => entry.id === selection.startCityId),
    runModifiers.world_lore.find((entry) => entry.id === selection.worldLoreId),
    runModifiers.market_conditions.find((entry) => entry.id === selection.marketConditionId),
    runModifiers.founder_traits.find((entry) => entry.id === selection.founderTraitId),
  ];

  return new Set(entries.flatMap((entry) => entry?.tags ?? []));
}

function getReplayTargetLabels(condition: EndingConditionDefinition, selection: RunModifierSelectionInput): string[] {
  const labels: string[] = [];

  pushReplayLabel(labels, selection.startCityId, getRunModifierName("start_cities"), DEFAULT_RUN_MODIFIER_SELECTION.startCityId, condition.start_city_ids);
  pushReplayLabel(labels, selection.worldLoreId, getRunModifierName("world_lore"), DEFAULT_RUN_MODIFIER_SELECTION.worldLoreId, condition.world_lore_ids);
  pushReplayLabel(labels, selection.marketConditionId, getRunModifierName("market_conditions"), DEFAULT_RUN_MODIFIER_SELECTION.marketConditionId, condition.market_condition_ids);
  pushReplayLabel(labels, selection.founderTraitId, getRunModifierName("founder_traits"), DEFAULT_RUN_MODIFIER_SELECTION.founderTraitId, condition.founder_trait_ids);
  pushReplayLabel(labels, selection.challengeTierId, getDifficultyName, "standard", condition.challenge_tier_ids);

  for (const growthPathId of condition.growth_path_ids ?? []) {
    pushUnique(labels, getGrowthPathName(growthPathId));
  }
  for (const archetypeId of condition.archetype_ids ?? []) {
    pushUnique(labels, getArchetypeName(archetypeId));
  }

  return labels;
}

function pushReplayLabel(
  labels: string[],
  id: string | undefined,
  nameForId: (id: string) => string,
  defaultId: string,
  targetIds: string[] | undefined,
) {
  if (!id) return;
  if (id === defaultId && !targetIds?.length) return;
  pushUnique(labels, nameForId(id));
}

function pushUnique(values: string[], value: string) {
  if (!values.includes(value)) values.push(value);
}

function getReplayOpeningMoves(condition: EndingConditionDefinition): string[] {
  const moves: string[] = [];

  for (const growthPathId of condition.growth_path_ids ?? []) {
    pushUnique(moves, `${getGrowthPathName(growthPathId)} 성장 경로 선택`);
  }

  for (const archetypeId of condition.archetype_ids ?? []) {
    pushUnique(moves, `${getArchetypeName(archetypeId)} 아키타입 완성`);
  }

  const resourcePriority = ["trust", "automation", "cash", "users", "compute", "data", "hype", "talent"];
  for (const resourceId of resourcePriority) {
    const target = condition.min_resources?.[resourceId];
    if (target !== undefined) pushUnique(moves, `${resourceLabel(resourceId)} ${Math.round(target).toLocaleString("ko-KR")}${resourceUnit(resourceId)}까지 확보`);
  }

  if (condition.min_products !== undefined) {
    pushUnique(moves, `제품 ${condition.min_products}개 출시`);
  }

  if (moves.length === 0) {
    moves.push("10년 캠페인을 끝까지 생존");
  }

  return moves.slice(0, 5);
}

function getReplayNextRequirements(requirements: EndingRequirementProgress[]): EndingReplayRequirementPrompt[] {
  return requirements
    .filter((requirement) => !requirement.complete && requirement.id !== "status" && requirement.id !== "min_month")
    .sort(
      (first, second) =>
        replayRequirementRank(first.id) - replayRequirementRank(second.id) ||
        Number(second.blocking) - Number(first.blocking) ||
        first.label.localeCompare(second.label),
    )
    .slice(0, 4)
    .map(addReplayRequirementAction);
}

function replayRequirementRank(id: string): number {
  if (id === "growth_path_ids") return 0;
  if (id === "archetype_ids") return 1;
  if (id === "min_products") return 2;
  const resourceRanks: Record<string, number> = {
    min_resource_trust: 3,
    min_resource_automation: 4,
    min_resource_cash: 5,
    min_resource_users: 6,
    min_resource_compute: 7,
    min_resource_data: 8,
    min_resource_hype: 9,
    min_resource_talent: 10,
  };
  if (resourceRanks[id] !== undefined) return resourceRanks[id];
  if (id.endsWith("_ids")) return 20;
  return 30;
}

function addReplayRequirementAction(requirement: EndingRequirementProgress): EndingReplayRequirementPrompt {
  return {
    ...requirement,
    ...getReplayRequirementAction(requirement.id),
  };
}

function getReplayRequirementAction(id: string): Pick<EndingReplayRequirementPrompt, "actionLabel" | "targetMenu"> {
  if (id === "growth_path_ids") return { actionLabel: "제품/성장 선택", targetMenu: "products" };
  if (id === "archetype_ids") return { actionLabel: "세계 태그 점검", targetMenu: "company" };
  if (id === "min_products") return { actionLabel: "제품 출시", targetMenu: "products" };

  const resourceActions: Record<string, Pick<EndingReplayRequirementPrompt, "actionLabel" | "targetMenu">> = {
    min_resource_automation: { actionLabel: "자동화 연구", targetMenu: "research" },
    min_resource_cash: { actionLabel: "수익/확장 점검", targetMenu: "shop" },
    min_resource_compute: { actionLabel: "컴퓨트 연구", targetMenu: "research" },
    min_resource_data: { actionLabel: "데이터 연구", targetMenu: "research" },
    min_resource_hype: { actionLabel: "제품 홍보", targetMenu: "products" },
    min_resource_talent: { actionLabel: "팀 채용", targetMenu: "agents" },
    min_resource_trust: { actionLabel: "신뢰 카드/안전 운영", targetMenu: "deck" },
    min_resource_users: { actionLabel: "제품 성장", targetMenu: "products" },
  };

  if (resourceActions[id]) return resourceActions[id];
  if (id.endsWith("_ids")) return { actionLabel: "목표 런 다시 시작", targetMenu: "deck" };
  return { actionLabel: "회사 목표 점검", targetMenu: "company" };
}

function getEndingRequirementProgress(condition: EndingConditionDefinition, state: GameState): EndingRequirementProgress[] {
  const requirements: EndingRequirementProgress[] = [];

  if (condition.status && condition.status !== "any") {
    requirements.push({
      id: "status",
      label: "최종 상태",
      currentLabel: statusLabel(state.status),
      targetLabel: statusLabel(condition.status),
      complete: state.status === condition.status,
      blocking: state.status === "failure" && condition.status === "success",
      progress: state.status === condition.status ? 1 : state.status === "playing" && condition.status === "success" ? 0.5 : 0,
    });
  }

  if (condition.min_month !== undefined) {
    requirements.push(numberRequirement("min_month", "진행 개월", state.month, condition.min_month, "개월"));
  }

  if (condition.min_products !== undefined) {
    requirements.push(numberRequirement("min_products", "출시 제품", state.activeProducts.length, condition.min_products, "개"));
  }

  for (const [resourceId, minimum] of Object.entries(condition.min_resources ?? {})) {
    requirements.push(numberRequirement(`min_resource_${resourceId}`, resourceLabel(resourceId), state.resources[resourceId] ?? 0, minimum, resourceUnit(resourceId)));
  }

  pushSelectionRequirement(requirements, "start_city_ids", "시작 도시", state.runModifiers.startCityId, condition.start_city_ids, getRunModifierName("start_cities"));
  pushSelectionRequirement(requirements, "world_lore_ids", "세계관", state.runModifiers.worldLoreId, condition.world_lore_ids, getRunModifierName("world_lore"));
  pushSelectionRequirement(
    requirements,
    "market_condition_ids",
    "시장 조건",
    state.runModifiers.marketConditionId,
    condition.market_condition_ids,
    getRunModifierName("market_conditions"),
  );
  pushSelectionRequirement(
    requirements,
    "founder_trait_ids",
    "창업자 성향",
    state.runModifiers.founderTraitId,
    condition.founder_trait_ids,
    getRunModifierName("founder_traits"),
  );
  pushSelectionRequirement(requirements, "challenge_tier_ids", "도전 티어", state.runModifiers.challengeTier, condition.challenge_tier_ids, getDifficultyName);

  if (condition.growth_path_ids?.length) {
    const currentId = state.chosenGrowthPath?.id;
    const complete = typeof currentId === "string" && condition.growth_path_ids.includes(currentId);
    requirements.push({
      id: "growth_path_ids",
      label: "성장 경로",
      currentLabel: currentId ? getGrowthPathName(currentId) : "미선택",
      targetLabel: condition.growth_path_ids.map(getGrowthPathName).join(" / "),
      complete,
      blocking: Boolean(currentId && !complete),
      progress: complete ? 1 : 0,
    });
  }

  if (condition.archetype_ids?.length) {
    const derivedIds = new Set(getDerivedArchetypes(state).map((rule) => rule.id));
    const missingIds = condition.archetype_ids.filter((id) => !derivedIds.has(id));
    requirements.push({
      id: "archetype_ids",
      label: "파생 아키타입",
      currentLabel: missingIds.length ? `부족 ${missingIds.length}` : "충족",
      targetLabel: condition.archetype_ids.join(" / "),
      complete: missingIds.length === 0,
      blocking: missingIds.length > 0,
      progress: missingIds.length === 0 ? 1 : 0,
    });
  }

  return requirements;
}

function numberRequirement(id: string, label: string, current: number, target: number, unit = ""): EndingRequirementProgress {
  return {
    id,
    label,
    currentLabel: formatRequirementNumber(current, unit),
    targetLabel: formatRequirementNumber(target, unit),
    complete: current >= target,
    blocking: false,
    progress: target <= 0 ? 1 : Math.max(0, Math.min(1, current / target)),
  };
}

function pushSelectionRequirement(
  requirements: EndingRequirementProgress[],
  id: string,
  label: string,
  currentId: string | undefined,
  targetIds: string[] | undefined,
  nameForId: (id: string) => string,
) {
  if (!targetIds?.length) return;

  const complete = typeof currentId === "string" && targetIds.includes(currentId);
  requirements.push({
    id,
    label,
    currentLabel: currentId ? nameForId(currentId) : "없음",
    targetLabel: targetIds.map(nameForId).join(" / "),
    complete,
    blocking: !complete,
    progress: complete ? 1 : 0,
  });
}

function conditionMatchesState(condition: EndingConditionDefinition, state: GameState): boolean {
  if (condition.status && condition.status !== "any" && state.status !== condition.status) return false;
  if (condition.min_month !== undefined && state.month < condition.min_month) return false;
  if (condition.min_products !== undefined && state.activeProducts.length < condition.min_products) return false;
  if (!hasMinimumResources(state.resources, condition.min_resources ?? {})) return false;
  if (!oneOf(state.runModifiers.startCityId, condition.start_city_ids)) return false;
  if (!oneOf(state.runModifiers.worldLoreId, condition.world_lore_ids)) return false;
  if (!oneOf(state.runModifiers.marketConditionId, condition.market_condition_ids)) return false;
  if (!oneOf(state.runModifiers.founderTraitId, condition.founder_trait_ids)) return false;
  if (!oneOf(state.runModifiers.challengeTier, condition.challenge_tier_ids)) return false;
  if (!oneOf(state.chosenGrowthPath?.id, condition.growth_path_ids)) return false;
  if (!hasRequiredArchetypes(state, condition.archetype_ids ?? [])) return false;

  return condition.fallback === true || hasAnySpecificCondition(condition);
}

function hasMinimumResources(resources: ResourceMap, minimums: ResourceMap): boolean {
  return Object.entries(minimums).every(([resourceId, minimum]) => (resources[resourceId] ?? 0) >= minimum);
}

function oneOf(value: string | undefined, allowed: string[] | undefined): boolean {
  return !allowed?.length || (typeof value === "string" && allowed.includes(value));
}

function hasRequiredArchetypes(state: GameState, archetypeIds: string[]): boolean {
  if (archetypeIds.length === 0) return true;

  const derivedIds = new Set(getDerivedArchetypes(state).map((rule) => rule.id));
  return archetypeIds.every((id) => derivedIds.has(id));
}

function hasAnySpecificCondition(condition: EndingConditionDefinition): boolean {
  return Boolean(
    condition.status ||
      condition.min_month !== undefined ||
      condition.min_products !== undefined ||
      Object.keys(condition.min_resources ?? {}).length > 0 ||
      condition.start_city_ids?.length ||
      condition.world_lore_ids?.length ||
      condition.market_condition_ids?.length ||
      condition.founder_trait_ids?.length ||
      condition.challenge_tier_ids?.length ||
      condition.growth_path_ids?.length ||
      condition.archetype_ids?.length,
  );
}

function getRunModifierName(dimension: "start_cities" | "world_lore" | "market_conditions" | "founder_traits") {
  return (id: string) => runModifiers[dimension].find((entry) => entry.id === id)?.name ?? id;
}

function getDifficultyName(id: string): string {
  return difficultyTiers.find((tier) => tier.id === id)?.name ?? id;
}

function getGrowthPathName(id: string): string {
  return growthPaths.find((path) => path.id === id)?.title ?? id;
}

function getArchetypeName(id: string): string {
  return derivationRules.find((rule) => rule.id === id)?.title ?? id;
}

function statusLabel(status: NonNullable<EndingConditionDefinition["status"]>): string {
  if (status === "success") return "성공";
  if (status === "failure") return "실패";
  if (status === "playing") return "진행 중";
  return "무관";
}

function resourceLabel(resourceId: string): string {
  const labels: Record<string, string> = {
    automation: "자동화",
    cash: "자금",
    compute: "컴퓨트",
    data: "데이터",
    hype: "화제성",
    talent: "인재",
    trust: "신뢰",
    users: "이용자",
  };
  return labels[resourceId] ?? resourceId;
}

function resourceUnit(resourceId: string): string {
  if (resourceId === "users") return "명";
  return "";
}

function formatRequirementNumber(value: number, unit: string): string {
  return `${Math.round(value).toLocaleString("ko-KR")}${unit}`;
}
