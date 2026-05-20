import {
  agentTypes,
  annualDirectiveChoices,
  annualReviews,
  automationUpgrades,
  balance,
  campaignShocks,
  capabilities,
  companyLocations,
  companyStages,
  competitors,
  domains,
  events,
  items,
  officeExpansions,
  officeReactions,
  officeSceneObjects,
  officeSynergies,
  officeZones,
  products,
  resources,
  rivalEvents,
  startingState,
  strategyCards,
  upgrades,
  workforceSynergies,
  growthPaths,
} from "./data";
import { applyAchievementUnlocks } from "./achievements";
import { applyDueAnnualReview, getActiveAnnualDirective } from "./annual-review";
import { applyDueCampaignShocks } from "./campaign-shocks";
import { CAMPAIGN_FINAL_MONTH, getCompanyStarRating, getCurrentLocation, getLocationRequirementReasons } from "./campaign";
import { getCompetitionSeasonChallenges } from "./competition-signals";
import { createInitialRogueliteState, createReleaseCardReward, getDeckSynergyMonthlyEffects, refreshStrategyDeckForNewMonth } from "./deckbuilding";
import { createReleaseGrowthPaths } from "./growth-paths";
import { getRenewalReleaseOptions, type ProductConcept } from "./product-ideas";
import { createMarketReaction, createReleaseHeadline } from "./release-flavor";
import { t } from "../i18n";
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
  OfficeEventReactionStatus,
  OfficeGrowthDecorRecommendation,
  OfficeGrowthPlan,
  OfficeSceneActorStatus,
  OfficeSceneObjectStatus,
  OfficeScenePlan,
  OfficeSynergyStatus,
  OfficeSynergySummary,
  OfficeZonePlan,
  OfficeZoneStatus,
  OperationsCommandFocus,
  OperationsCommandPlan,
  OfficeState,
  CardRewardChoice,
  PendingCardReward,
  PendingAnnualDirectiveChoices,
  ProductProject,
  ProductDefinition,
  ReleaseMoment,
  ReleaseReview,
  RivalEventChoiceDefinition,
  RogueliteState,
  RunRecord,
  ResourceMap,
  StaffIncidentResolutionLogEntry,
  ProductProjectForecast,
  StrategyDeckState,
  UpgradeDefinition,
  WorkforceSynergyStatus,
  WorkforceSynergySummary,
} from "./types";

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const SAVE_VERSION = 11;
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

export type RecruitmentChannelId = "open_recruiting" | "career_recruiting" | "headhunter";

export interface RecruitmentChannelDefinition {
  id: RecruitmentChannelId;
  label: string;
  description: string;
  costMultiplier: number;
  upkeepMultiplier: number;
  statBonus: number;
  qualityLabel: string;
  riskLabel: string;
}

export interface RecruitmentOffer {
  agent: AgentTypeDefinition;
  channel: RecruitmentChannelDefinition;
  adjustedStats: AgentStats;
  hireCost: ResourceMap;
  upkeep: ResourceMap;
  qualityLabel: string;
  riskLabel: string;
  recommendationReason: string;
}

export interface RecruitmentCandidatePool {
  channel: RecruitmentChannelDefinition;
  candidateIds: string[];
  summary: string;
  refreshLabel: string;
  locationLabel: string;
  poolSize: number;
}

export interface RecruitmentBrandProfile {
  score: number;
  gradeLabel: string;
  hiringSlotsOpen: number;
  capacityLabel: string;
  candidatePoolBonus: number;
  drivers: string[];
  warnings: string[];
}

export interface AgentCareerStatus {
  level: number;
  experience: number;
  nextLevelExperience: number;
  progressPercent: number;
  loyalty: number;
  retentionSeverity: "stable" | "watch" | "warning" | "critical";
  retentionRiskLabel: string;
  monthlyGrowthLabel: string;
  levelBonus: number;
}

export interface AgentRetentionAlert {
  agentId: string;
  agentName: string;
  severity: "warning" | "critical";
  loyalty: number;
  message: string;
}

export type StaffIncidentType = "burnout" | "poaching" | "discontent";
export type StaffIncidentAction = "rest" | "salary";

export interface StaffIncidentBrief {
  id: string;
  agentId: string;
  agentName: string;
  type: StaffIncidentType;
  severity: "warning" | "critical";
  title: string;
  description: string;
  triggerLabel: string;
  recommendedAction: StaffIncidentAction;
  actionLabel: string;
  aftermathLabel?: string;
  sourceCompetitorId?: string;
  sourceCompetitorName?: string;
  offerLabel?: string;
  stakesLabel?: string;
}

export type StaffIncidentResolutionId =
  | "recovery_day"
  | "backup_shift"
  | "retention_bonus"
  | "mission_pitch"
  | "contract_review"
  | "one_on_one";

export interface StaffIncidentResolutionOption {
  id: StaffIncidentResolutionId;
  label: string;
  description: string;
  cost: ResourceMap;
  effectLabel: string;
  recommended: boolean;
  available: boolean;
  reasons: string[];
}

export interface AgentDevelopmentProfile {
  traitLabel: string;
  traitDescription: string;
  growthFocusStats: Array<keyof AgentStats>;
  growthFocusLabel: string;
  preferredItemIds: string[];
  preferredItemNames: string[];
  matchedPreferredItemIds: string[];
  matchedPreferredItemNames: string[];
  preferredItemBonus: Partial<AgentStats>;
  loyaltyBonus: number;
}

export interface AgentSpecializationOption {
  id: string;
  stat: keyof AgentStats;
  label: string;
  description: string;
  effect: Partial<AgentStats>;
  unlocked: boolean;
  selected: boolean;
  reasons: string[];
}

export const recruitmentChannels: RecruitmentChannelDefinition[] = [
  {
    id: "open_recruiting",
    label: "공채",
    description: "지역 인재풀을 기반으로 저렴하게 채용합니다. 초반 인원 확장에 유리하지만 능력치 보정은 없습니다.",
    costMultiplier: 1,
    upkeepMultiplier: 0.95,
    statBonus: 0,
    qualityLabel: "지역 인재풀",
    riskLabel: "품질 편차 낮음",
  },
  {
    id: "career_recruiting",
    label: "경력 채용",
    description: "연봉을 높여 실무형 후보를 끌어옵니다. 채용비와 유지비가 늘지만 즉시 전력감입니다.",
    costMultiplier: 1.55,
    upkeepMultiplier: 1.35,
    statBonus: 1,
    qualityLabel: "실무 검증",
    riskLabel: "연봉 압박",
  },
  {
    id: "headhunter",
    label: "헤드헌터",
    description: "수수료를 크게 써서 상위권 후보를 찾습니다. 강력하지만 고정비와 검증 리스크가 큽니다.",
    costMultiplier: 2.25,
    upkeepMultiplier: 1.75,
    statBonus: 2,
    qualityLabel: "핵심 인재 후보",
    riskLabel: "검증 필요",
  },
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
    generatedProducts: [],
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
    campaignShockHistory: [],
    eventHistory: [],
    rivalEventHistory: [],
    seenTutorials: [],
    recentStaffIncidentResolutions: [],
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

export function getAvailableProductDefinitions(state: GameState): ProductDefinition[] {
  return [...products, ...(state.generatedProducts ?? [])];
}

function getProductDefinition(productId: string, state: GameState): ProductDefinition | undefined {
  return getAvailableProductDefinitions(state).find((product) => product.id === productId);
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

export function getRecruitmentChannel(channelId: RecruitmentChannelId): RecruitmentChannelDefinition {
  return recruitmentChannels.find((channel) => channel.id === channelId) ?? recruitmentChannels[0];
}

export function getRecruitmentBrandProfile(state: GameState): RecruitmentBrandProfile {
  const office = getOfficeExpansion(state);
  const location = getCurrentLocation(state);
  const placedItems = getPlacedOfficeItems(state);
  const activeSynergies = getOfficeSynergySummary(state).active;
  const hiringSlotsOpen = Math.max(0, getOfficeHireCapacity(state) - state.hiredAgents.length);
  const star = getCompanyStarRating(state);
  const trust = state.resources.trust ?? 0;
  const hype = state.resources.hype ?? 0;
  const userScaleScore = Math.min(10, Math.floor((state.resources.users ?? 0) / 10000));
  const officeScore = office.level * 9;
  const locationScore = location.ai_operation_bonus * 5 + (location.human_hire_discount < 0 ? Math.round(Math.abs(location.human_hire_discount) * 40) : 0);
  const marketScore = Math.min(14, state.activeProducts.length * 3) + (trust >= 70 ? 10 : trust >= 45 ? 5 : 0) + (hype >= 35 ? 5 : 0) + userScaleScore;
  const decorScore = placedItems.length * 3 + activeSynergies.length * 6;
  const capacityScore = hiringSlotsOpen >= 3 ? 6 : hiringSlotsOpen >= 1 ? 2 : -16;
  const score = Math.round(clamp(officeScore + locationScore + marketScore + decorScore + star * 6 + capacityScore, 0, 100));
  const candidatePoolBonus = hiringSlotsOpen <= 0 ? 0 : score >= 82 ? 2 : score >= 62 ? 1 : 0;
  const drivers = [
    `${office.name} 고용 슬롯 ${state.hiredAgents.length}/${getOfficeHireCapacity(state)}`,
    `${location.region} · ${location.talent_pool}`,
    `${star}성 회사 평판`,
  ];
  const warnings: string[] = [];

  if (placedItems.length > 0) drivers.push(`장식 ${placedItems.length}개 배치`);
  if (activeSynergies.length > 0) drivers.push(`사무실 시너지 ${activeSynergies.length}개`);
  if (trust >= 60) drivers.push(`신뢰 ${Math.round(trust)}로 후보 설득`);
  if ((state.resources.users ?? 0) >= 10000) drivers.push(`이용자 ${(state.resources.users ?? 0).toLocaleString("ko-KR")}명`);
  if (hiringSlotsOpen <= 0) warnings.push("사무실 정원이 가득 차 후보 보너스가 막혔습니다.");
  if (hiringSlotsOpen === 1) warnings.push("남은 자리가 1명이라 채용 결정 압박이 큽니다.");
  if (location.monthly_cost_modifier >= 1.4) warnings.push("도시 거점 유지비가 높아 연봉 부담이 커집니다.");
  if (trust < 35) warnings.push("신뢰가 낮아 좋은 후보 설득력이 약합니다.");

  return {
    score,
    gradeLabel: getRecruitmentBrandGradeLabel(score),
    hiringSlotsOpen,
    capacityLabel: hiringSlotsOpen > 0 ? `빈 자리 ${hiringSlotsOpen}명` : "정원 가득 참",
    candidatePoolBonus,
    drivers,
    warnings,
  };
}

export function getRecruitmentCandidatePool(state: GameState, channelId: RecruitmentChannelId): RecruitmentCandidatePool {
  const channel = getRecruitmentChannel(channelId);
  const location = getCurrentLocation(state);
  const brandProfile = getRecruitmentBrandProfile(state);
  const hiredTypeIds = new Set(state.hiredAgents.map((agent) => agent.typeId));
  const poolSize = getRecruitmentPoolSize(channel.id, state);
  const roboticsBayActive = isOfficeZoneActive(state, "robotics_bay");
  const candidates = agentTypes
    .filter((agent) => !hiredTypeIds.has(agent.id))
    .filter((agent) => getRequirementReasons(agent.unlock_requirements, state).length === 0)
    .filter((agent) => isRecruitmentPoolCompatible(agent, channel.id, state))
    .map((agent) => ({
      agent,
      score: getRecruitmentCandidateScore(agent, channel.id, state) * 10 + getRecruitmentRotationScore(agent, channel.id, state),
    }))
    .sort((left, right) => right.score - left.score || left.agent.id.localeCompare(right.agent.id));
  const candidateIds = candidates.slice(0, poolSize).map(({ agent }) => agent.id);

  return {
    channel,
    candidateIds,
    summary: `${location.name} · ${channel.label} 후보 ${candidateIds.length}/${poolSize}명 · ${brandProfile.gradeLabel}${roboticsBayActive ? " · 로봇 고용 베이" : ""}`,
    refreshLabel: `다음 후보 갱신 ${state.month + 1}개월차`,
    locationLabel: `${location.region} · ${location.talent_pool}`,
    poolSize,
  };
}

export function getAgentHireCheck(agent: AgentTypeDefinition, state: GameState): ActionCheck {
  return getAgentHireCheckForChannel(agent, state, "open_recruiting");
}

export function getAgentHireCheckForChannel(agent: AgentTypeDefinition, state: GameState, channelId: RecruitmentChannelId): ActionCheck {
  const reasons = getRequirementReasons(agent.unlock_requirements, state);
  const hireCapacity = getOfficeHireCapacity(state);
  const channel = getRecruitmentChannel(channelId);

  if (state.hiredAgents.some((hiredAgent) => hiredAgent.typeId === agent.id)) {
    reasons.push("이미 고용한 에이전트입니다.");
  }
  if (state.hiredAgents.length >= hireCapacity) {
    reasons.push(`사무실 수용 인원 ${hireCapacity}명 한도입니다. 상점에서 사무실을 확장하세요.`);
  }
  if (getAgentKind(agent) === "ai_agent" && getAiAgentCount(state) >= getAiOperationCapacity(state)) {
    reasons.push(`사람 직원 운용력이 부족합니다. 현재 AI 운용 한도 ${getAiOperationCapacity(state)}개입니다.`);
  }

  if (channel.id === "headhunter" && getCompanyStarRating(state) < 2 && getAgentKind(agent) !== "human") {
    reasons.push("2성 회사부터 AI·로봇 헤드헌터 의뢰가 가능합니다.");
  }

  appendCostReasons(reasons, getAgentHireCostForChannel(agent, state, channel.id), state);

  return { ok: reasons.length === 0, reasons };
}

export function getAgentHireCost(agent: AgentTypeDefinition, state: GameState): ResourceMap {
  return getAgentHireCostForChannel(agent, state, "open_recruiting");
}

export function getAgentHireCostForChannel(agent: AgentTypeDefinition, state: GameState, channelId: RecruitmentChannelId): ResourceMap {
  const channel = getRecruitmentChannel(channelId);
  const baseCost = channel.id === "open_recruiting" && getAgentKind(agent) === "human"
    ? applyHumanLocationHireModifier(agent.hire_cost, state)
    : agent.hire_cost;

  return scaleResourceMap(baseCost, channel.costMultiplier);
}

export function getAgentUpkeepForChannel(agent: AgentTypeDefinition, channelId: RecruitmentChannelId): ResourceMap {
  return scaleResourceMap(agent.upkeep, getRecruitmentChannel(channelId).upkeepMultiplier);
}

export function getAgentStatsForChannel(agent: AgentTypeDefinition, channelId: RecruitmentChannelId): AgentStats {
  const channel = getRecruitmentChannel(channelId);
  if (channel.statBonus <= 0) return { ...agent.stats };

  return addStats(agent.stats, Object.fromEntries(statKeys.map((stat) => [stat, channel.statBonus])));
}

export function getRecruitmentOffer(agent: AgentTypeDefinition, state: GameState, channelId: RecruitmentChannelId): RecruitmentOffer {
  const channel = getRecruitmentChannel(channelId);
  const location = getCurrentLocation(state);
  const kind = getAgentKind(agent);
  const locationHint =
    kind === "human" && channel.id === "open_recruiting"
      ? `${location.region} ${location.talent_pool}`
      : channel.id === "headhunter"
        ? "비공개 후보 검증 필요"
        : "즉시 전력 후보";

  return {
    agent,
    channel,
    adjustedStats: getAgentStatsForChannel(agent, channel.id),
    hireCost: getAgentHireCostForChannel(agent, state, channel.id),
    upkeep: getAgentUpkeepForChannel(agent, channel.id),
    qualityLabel: channel.qualityLabel,
    riskLabel: channel.riskLabel,
    recommendationReason: locationHint,
  };
}

export function getHiredAgentMonthlyUpkeep(agent: HiredAgent): ResourceMap {
  if (agent.upkeep) return agent.upkeep;

  const type = agentTypes.find((entry) => entry.id === agent.typeId);
  if (!type) return {};

  return scaleResourceMap(type.upkeep, agent.salaryMultiplier ?? 1);
}

export function getTeamMonthlySalaryCost(state: GameState): number {
  const floatingTalentCount = Math.max(0, (state.resources.talent ?? 0) - state.hiredAgents.length);
  const floatingTalentSalary = floatingTalentCount * balance.salary_per_talent;
  const contractSalary = state.hiredAgents.reduce((total, agent) => total + (getHiredAgentMonthlyUpkeep(agent).cash ?? 0), 0);

  return floatingTalentSalary + contractSalary;
}

export function getAgentCareerStatus(agent: HiredAgent, _state: GameState): AgentCareerStatus {
  const level = sanitizeAgentLevel(agent.level);
  const experience = Math.max(0, Math.round(agent.experience ?? 0));
  const nextLevelExperience = getAgentNextLevelExperience(level);
  const loyalty = getAgentLoyalty(agent);
  const retentionSeverity = getRetentionSeverity(loyalty);

  return {
    level,
    experience,
    nextLevelExperience,
    progressPercent: Math.round(clamp((experience / nextLevelExperience) * 100, 0, 100)),
    loyalty,
    retentionSeverity,
    retentionRiskLabel: getRetentionRiskLabel(retentionSeverity),
    monthlyGrowthLabel: agent.assignment ? "프로젝트 경험 +2" : "운영 경험 +1",
    levelBonus: getAgentLevelStatBonus(level),
  };
}

export function getAgentRetentionAlerts(state: GameState): AgentRetentionAlert[] {
  return state.hiredAgents
    .map((agent) => ({ agent, status: getAgentCareerStatus(agent, state) }))
    .filter(({ status }) => status.retentionSeverity === "warning" || status.retentionSeverity === "critical")
    .map(({ agent, status }) => ({
      agentId: agent.id,
      agentName: agent.name,
      severity: status.retentionSeverity === "critical" ? "critical" : "warning",
      loyalty: status.loyalty,
      message:
        status.retentionSeverity === "critical"
          ? `${agent.name} 이직 위험이 큽니다. 연봉 협상이나 휴식이 필요합니다.`
          : `${agent.name} 충성도가 흔들립니다. 과로와 계약 압박을 확인하세요.`,
    }));
}

export function getStaffIncidentBriefs(state: GameState): StaffIncidentBrief[] {
  const incidents = state.hiredAgents.flatMap((agent) => {
    const career = getAgentCareerStatus(agent, state);
    const loyalty = career.loyalty;
    const energy = Math.round(agent.energy);
    const level = career.level;
    const agentIncidents: StaffIncidentBrief[] = [];

    if (energy <= 35) {
      agentIncidents.push({
        id: `${agent.id}-burnout`,
        agentId: agent.id,
        agentName: agent.name,
        type: "burnout",
        severity: energy <= 20 ? "critical" : "warning",
        title: `${agent.name} 번아웃 위험`,
        description: `체력 ${energy}입니다. 프로젝트 성과보다 퇴사 리스크가 먼저 커질 수 있습니다.`,
        triggerLabel: `체력 ${energy}`,
        recommendedAction: "rest",
        actionLabel: "휴식 검토",
        aftermathLabel: "방치 시 체력 -14 · 충성 -4",
      });
    }

    if (level >= 3 && loyalty <= 55) {
      const poachingOffer = getStaffPoachingOffer(state, agent, level);
      agentIncidents.push({
        id: `${agent.id}-poaching`,
        agentId: agent.id,
        agentName: agent.name,
        type: "poaching",
        severity: loyalty < 45 ? "critical" : "warning",
        title: `${agent.name} 스카우트 제안`,
        description: `${poachingOffer.sourceCompetitorName} 같은 경쟁사가 Lv.${level} 핵심 인재를 노립니다. ${poachingOffer.offerLabel} 조건이 돌기 전에 계약 만족도를 올리세요.`,
        triggerLabel: `Lv.${level} · 충성 ${loyalty} · ${poachingOffer.sourceCompetitorName} 제안`,
        recommendedAction: "salary",
        actionLabel: "연봉 협상",
        aftermathLabel: "방치 시 충성 -12 · 경쟁사 모멘텀 +8",
        ...poachingOffer,
      });
    }

    if (loyalty <= 50 && (agent.recruitmentChannelId === "headhunter" || (agent.salaryMultiplier ?? 1) >= 1.3)) {
      agentIncidents.push({
        id: `${agent.id}-discontent`,
        agentId: agent.id,
        agentName: agent.name,
        type: "discontent",
        severity: loyalty < 35 ? "critical" : "warning",
        title: `${agent.name} 계약 불만`,
        description: `계약 기대치와 실제 회사 상태 사이의 간극이 커졌습니다. 방치하면 충성도가 더 빨리 흔들립니다.`,
        triggerLabel: `충성 ${loyalty} · 연봉 x${agent.salaryMultiplier ?? 1}`,
        recommendedAction: "salary",
        actionLabel: "조건 조정",
        aftermathLabel: "방치 시 충성 -8 · 현금/신뢰 손실",
      });
    }

    return agentIncidents;
  });

  return incidents
    .sort((left, right) => getStaffIncidentSeverityScore(right) - getStaffIncidentSeverityScore(left) || left.agentName.localeCompare(right.agentName, "ko"))
    .slice(0, 4);
}

export function getStaffIncidentResolutionOptions(incidentId: string, state: GameState): StaffIncidentResolutionOption[] {
  const incident = getStaffIncidentBriefs(state).find((entry) => entry.id === incidentId);
  const agent = incident ? state.hiredAgents.find((entry) => entry.id === incident.agentId) : undefined;
  if (!incident || !agent) return [];

  return getStaffIncidentBaseResolutionOptions(incident, agent).map((option) => {
    const check = getStaffIncidentResolutionCheck(incidentId, option.id, state);
    return {
      ...option,
      available: check.ok,
      reasons: check.reasons,
    };
  });
}

export function getStaffIncidentResolutionCheck(incidentId: string, resolutionId: StaffIncidentResolutionId, state: GameState): ActionCheck {
  const reasons: string[] = [];
  const incident = getStaffIncidentBriefs(state).find((entry) => entry.id === incidentId);
  const agent = incident ? state.hiredAgents.find((entry) => entry.id === incident.agentId) : undefined;

  if (!incident || !agent) {
    reasons.push("대상 인사 사건을 찾을 수 없습니다.");
    return { ok: false, reasons };
  }

  const option = getStaffIncidentBaseResolutionOptions(incident, agent).find((entry) => entry.id === resolutionId);
  if (!option) {
    reasons.push("선택할 수 없는 대응입니다.");
    return { ok: false, reasons };
  }

  if (state.status !== "playing") {
    reasons.push("진행 중인 런에서만 대응할 수 있습니다.");
  }

  appendCostReasons(reasons, option.cost, state);
  return { ok: reasons.length === 0, reasons };
}

export function getRecentStaffIncidentResolutionLog(state: GameState, limit = 3): StaffIncidentResolutionLogEntry[] {
  return [...(state.recentStaffIncidentResolutions ?? [])]
    .filter((entry) => !(entry.isAftermath || entry.resolutionId === "unresolved_aftermath"))
    .sort((left, right) => right.month - left.month)
    .slice(0, limit);
}

export function getRecentStaffIncidentAftermathLog(state: GameState, limit = 3): StaffIncidentResolutionLogEntry[] {
  return [...(state.recentStaffIncidentResolutions ?? [])]
    .filter((entry) => entry.isAftermath || entry.resolutionId === "unresolved_aftermath")
    .sort((left, right) => right.month - left.month)
    .slice(0, limit);
}

export function resolveStaffIncident(incidentId: string, resolutionId: StaffIncidentResolutionId, state: GameState): GameState {
  const check = getStaffIncidentResolutionCheck(incidentId, resolutionId, state);
  if (!check.ok) return state;

  const incident = getStaffIncidentBriefs(state).find((entry) => entry.id === incidentId);
  const agent = incident ? state.hiredAgents.find((entry) => entry.id === incident.agentId) : undefined;
  if (!incident || !agent) return state;
  const option = getStaffIncidentBaseResolutionOptions(incident, agent).find((entry) => entry.id === resolutionId);
  if (!option) return state;

  const nextAgents = state.hiredAgents.map((entry) => {
    if (entry.id !== incident.agentId) return entry;
    return applyStaffIncidentResolutionToAgent(entry, resolutionId);
  });
  const shouldClearAssignment = resolutionId === "recovery_day";
  const resolutionRecord = createStaffIncidentResolutionRecord(state, incident, agent, option, resolutionId);

  return {
    ...state,
    resources: applyResourceDelta(applyResourceDelta(state.resources, negateCosts(option.cost)), getStaffIncidentResolutionResourceDelta(resolutionId)),
    hiredAgents: nextAgents,
    productProjects: shouldClearAssignment
      ? state.productProjects.map((project) => ({
          ...project,
          assignedAgentIds: project.assignedAgentIds.filter((agentId) => agentId !== incident.agentId),
        }))
      : state.productProjects,
    recentStaffIncidentResolutions: [resolutionRecord, ...(state.recentStaffIncidentResolutions ?? [])].slice(0, 6),
    timeline: [`인사 사건 대응: ${agent.name} · ${option.label} (${incident.title})`, ...state.timeline].slice(0, 8),
  };
}

export function getAgentDevelopmentProfile(agent: HiredAgent, _state: GameState): AgentDevelopmentProfile {
  const agentType = getHiredAgentType(agent);
  const preferredItemIds = agentType?.preferred_items ?? [];
  const preferredItems = preferredItemIds
    .map((itemId) => items.find((item) => item.id === itemId))
    .filter((item): item is ItemDefinition => Boolean(item));
  const matchedPreferredItems = preferredItems.filter((item) => agent.equippedItemIds.includes(item.id));
  const growthFocusStats = getAgentGrowthFocusStats(agentType);

  return {
    traitLabel: getAgentTraitLabel(agentType),
    traitDescription: agentType?.quirk ?? "현재 회사에서 역할을 만들어 가는 인력입니다.",
    growthFocusStats,
    growthFocusLabel: `${growthFocusStats.map(getStatKoreanLabel).join("·")} 집중`,
    preferredItemIds,
    preferredItemNames: preferredItems.map((item) => item.name),
    matchedPreferredItemIds: matchedPreferredItems.map((item) => item.id),
    matchedPreferredItemNames: matchedPreferredItems.map((item) => item.name),
    preferredItemBonus: getPreferredItemStatBonus(agent, agentType),
    loyaltyBonus: getPreferredItemLoyaltyBonus(agent, agentType),
  };
}

export function getAgentSpecializationOptions(agent: HiredAgent, _state: GameState): AgentSpecializationOption[] {
  const selectedStat = getAgentSpecializationStat(agent);
  const level = sanitizeAgentLevel(agent.level);

  return getAgentGrowthFocusStats(getHiredAgentType(agent)).map((stat) => {
    const reasons: string[] = [];
    if (level < 3) reasons.push("Lv.3부터 전문화할 수 있습니다.");
    if (selectedStat && selectedStat !== stat) reasons.push("이미 다른 전문화를 선택했습니다.");

    return {
      id: stat,
      stat,
      label: `${getStatKoreanLabel(stat)} 스페셜리스트`,
      description: `${agent.name}의 ${getStatKoreanLabel(stat)} 역량을 장기 성장축으로 고정합니다.`,
      effect: { [stat]: getAgentSpecializationStatBonus(agent) } as Partial<AgentStats>,
      unlocked: reasons.length === 0,
      selected: selectedStat === stat,
      reasons,
    };
  });
}

export function getAgentSpecializationCheck(agentId: string, specializationStat: keyof AgentStats, state: GameState): ActionCheck {
  const reasons: string[] = [];
  const agent = state.hiredAgents.find((entry) => entry.id === agentId);

  if (!agent) {
    reasons.push("대상 직원을 찾을 수 없습니다.");
    return { ok: false, reasons };
  }

  const selectedStat = getAgentSpecializationStat(agent);
  if (selectedStat) {
    reasons.push("이미 전문화를 선택했습니다.");
  }

  const option = getAgentSpecializationOptions(agent, state).find((entry) => entry.stat === specializationStat);
  if (!option) {
    reasons.push("선택할 수 없는 전문화입니다.");
  } else {
    reasons.push(...option.reasons.filter((reason) => !reason.includes("이미 다른 전문화")));
  }

  return { ok: reasons.length === 0, reasons };
}

export function chooseAgentSpecialization(agentId: string, specializationStat: keyof AgentStats, state: GameState): GameState {
  const check = getAgentSpecializationCheck(agentId, specializationStat, state);
  if (!check.ok || state.status !== "playing") return state;

  const agent = state.hiredAgents.find((entry) => entry.id === agentId);
  if (!agent) return state;
  const label = `${getStatKoreanLabel(specializationStat)} 스페셜리스트`;

  return {
    ...state,
    hiredAgents: state.hiredAgents.map((entry) =>
      entry.id === agentId
        ? {
            ...entry,
            specializationStat,
            specializationChosenMonth: state.month,
            loyalty: clamp(getAgentLoyalty(entry) + 5, 0, 100),
          }
        : entry,
    ),
    timeline: [`전문화 선택: ${agent.name} · ${label}`, ...state.timeline].slice(0, 8),
  };
}

export function getAgentRestCost(agent: HiredAgent): ResourceMap {
  const monthlyCash = getHiredAgentMonthlyUpkeep(agent).cash ?? 180;
  return { cash: Math.max(150, Math.round(monthlyCash * 0.5)) };
}

export function getAgentRestCheck(agentId: string, state: GameState): ActionCheck {
  const reasons: string[] = [];
  const agent = state.hiredAgents.find((entry) => entry.id === agentId);

  if (!agent) {
    reasons.push("대상 직원을 찾을 수 없습니다.");
    return { ok: false, reasons };
  }

  if (agent.assignment) {
    reasons.push(`${agent.name}은 프로젝트 투입 중입니다.`);
  }

  if (agent.energy >= 95 && getAgentLoyalty(agent) >= 95) {
    reasons.push("이미 충분히 회복된 상태입니다.");
  }

  appendCostReasons(reasons, getAgentRestCost(agent), state);
  return { ok: reasons.length === 0, reasons };
}

export function restAgent(agentId: string, state: GameState): GameState {
  const agent = state.hiredAgents.find((entry) => entry.id === agentId);
  if (!agent || !getAgentRestCheck(agentId, state).ok || state.status !== "playing") return state;

  const cost = getAgentRestCost(agent);
  const nextAgents = state.hiredAgents.map((entry) =>
    entry.id === agentId
      ? {
          ...entry,
          energy: clamp(entry.energy + 32, 0, 100),
          loyalty: clamp(getAgentLoyalty(entry) + 10, 0, 100),
        }
      : entry,
  );

  return {
    ...state,
    resources: applyResourceDelta(state.resources, negateCosts(cost)),
    hiredAgents: nextAgents,
    timeline: [`유급 휴식: ${agent.name} 컨디션 회복`, ...state.timeline].slice(0, 8),
  };
}

export function getAgentSalaryNegotiationCost(agent: HiredAgent): ResourceMap {
  const monthlyCash = getHiredAgentMonthlyUpkeep(agent).cash ?? 300;
  return { cash: Math.max(500, Math.round(monthlyCash * 2)) };
}

export function getAgentSalaryNegotiationCheck(agentId: string, state: GameState): ActionCheck {
  const reasons: string[] = [];
  const agent = state.hiredAgents.find((entry) => entry.id === agentId);

  if (!agent) {
    reasons.push("대상 직원을 찾을 수 없습니다.");
    return { ok: false, reasons };
  }

  if (getAgentLoyalty(agent) >= 90) {
    reasons.push("이미 만족도가 높은 계약입니다.");
  }

  if ((agent.salaryMultiplier ?? 1) >= 2.5) {
    reasons.push("현재 회사 단계에서 더 올리기 어려운 연봉입니다.");
  }

  appendCostReasons(reasons, getAgentSalaryNegotiationCost(agent), state);
  return { ok: reasons.length === 0, reasons };
}

export function negotiateAgentSalary(agentId: string, state: GameState): GameState {
  const agent = state.hiredAgents.find((entry) => entry.id === agentId);
  if (!agent || !getAgentSalaryNegotiationCheck(agentId, state).ok || state.status !== "playing") return state;

  const cost = getAgentSalaryNegotiationCost(agent);
  const nextAgents = state.hiredAgents.map((entry) => {
    if (entry.id !== agentId) return entry;

    return {
      ...entry,
      energy: clamp(entry.energy + 4, 0, 100),
      loyalty: clamp(getAgentLoyalty(entry) + 22, 0, 100),
      salaryMultiplier: Number(((entry.salaryMultiplier ?? 1) + 0.12).toFixed(2)),
      upkeep: scaleResourceMap(getHiredAgentMonthlyUpkeep(entry), 1.12),
    };
  });

  return {
    ...state,
    resources: applyResourceDelta(state.resources, negateCosts(cost)),
    hiredAgents: nextAgents,
    timeline: [`연봉 협상: ${agent.name} 충성도 회복, 월 유지비 상승`, ...state.timeline].slice(0, 8),
  };
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

export function getWorkforceSynergySummary(state: GameState, assignedAgentIds?: string[]): WorkforceSynergySummary {
  const selectedAgents = assignedAgentIds
    ? state.hiredAgents.filter((agent) => assignedAgentIds.includes(agent.id))
    : state.hiredAgents;
  const kindCounts = selectedAgents.reduce<Record<string, number>>((counts, agent) => {
    const agentType = agentTypes.find((entry) => entry.id === agent.typeId);
    const kind = agentType ? getAgentKind(agentType) : "ai_agent";
    counts[kind] = (counts[kind] ?? 0) + 1;
    return counts;
  }, {});
  const statuses = workforceSynergies.map((synergy) => {
    const progress = getRequirementProgress(synergy.required_kinds, kindCounts);

    return {
      ...synergy,
      active: progress.complete,
      progressLabel: progress.labels.join(" · "),
    };
  });
  const active = statuses.filter((synergy) => synergy.active);
  const locked = statuses.filter((synergy) => !synergy.active);

  return {
    active,
    locked,
    nextCandidate: locked[0],
    totalStats: active.reduce<Record<string, number>>(
      (total, synergy) => mergeResourceDelta(total, synergy.stat_effects),
      {},
    ),
    projectQualityBonus: active.reduce((sum, synergy) => sum + synergy.project_effects.quality, 0),
    projectProgressBonus: active.reduce((sum, synergy) => sum + synergy.project_effects.progress, 0),
  };
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

export function getOfficeMonthlyEffects(state: GameState): ResourceMap {
  return getOfficeExpansion(state).monthly_effects ?? {};
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

export function getOfficeSynergySummary(state: GameState): OfficeSynergySummary {
  const placedItems = getPlacedOfficeItems(state);
  const categoryCounts = countPlacedItemCategories(placedItems);
  const effectTotals = sumPlacedItemEffects(placedItems);
  const statuses = officeSynergies.map((synergy) => {
    const categoryProgress = getRequirementProgress(synergy.required_categories, categoryCounts);
    const effectProgress = getRequirementProgress(synergy.required_effects, effectTotals);
    const active = categoryProgress.complete && effectProgress.complete;

    return {
      ...synergy,
      active,
      progressLabel: [...categoryProgress.labels, ...effectProgress.labels].join(" · "),
    };
  });
  const active = statuses.filter((status) => status.active);
  const locked = statuses.filter((status) => !status.active);

  return {
    active,
    locked,
    nextCandidate: locked[0],
    totalMonthlyEffects: active.reduce<ResourceMap>(
      (total, synergy) => mergeResourceDelta(total, synergy.monthly_effects),
      {},
    ),
  };
}

export function getOfficeZonePlan(state: GameState): OfficeZonePlan {
  const officeLevel = getOfficeExpansion(state).level;
  const statuses = officeZones.map((zone): OfficeZoneStatus => {
    const blockedReasons = getOfficeZoneBlockedReasons(zone, state, officeLevel);
    const unlocked = officeLevel >= zone.min_office_level;
    const active = unlocked && blockedReasons.length === 0;

    return {
      ...zone,
      unlocked,
      active,
      blockedReasons,
      progressLabel: active
        ? `가동 중 · 월간 ${formatResourceDelta(zone.monthly_effects)}`
        : blockedReasons.slice(0, 2).join(" / "),
    };
  });
  const active = statuses.filter((zone) => zone.active);
  const locked = statuses.filter((zone) => !zone.active);
  const totalMonthlyEffects = active.reduce<ResourceMap>((total, zone) => mergeResourceDelta(total, zone.monthly_effects), {});

  return {
    active,
    locked,
    nextZone: locked[0],
    totalMonthlyEffects,
    operationLabel: active.length
      ? `${active.length}개 구획 가동 · ${formatResourceDelta(totalMonthlyEffects)}`
      : "가동 중인 사무실 구획 없음",
  };
}

export function isOfficeZoneActive(state: GameState, zoneId: string): boolean {
  return getOfficeZonePlan(state).active.some((zone) => zone.id === zoneId);
}

const officeActorSlots = [
  { x: 18, y: 65 },
  { x: 30, y: 54 },
  { x: 43, y: 68 },
  { x: 55, y: 52 },
  { x: 68, y: 66 },
  { x: 80, y: 48 },
  { x: 25, y: 78 },
  { x: 50, y: 79 },
  { x: 74, y: 78 },
  { x: 38, y: 42 },
  { x: 62, y: 39 },
  { x: 84, y: 65 },
];

export function getOfficeScenePlan(state: GameState): OfficeScenePlan {
  const expansion = getOfficeExpansion(state);
  const zonePlan = getOfficeZonePlan(state);
  const eventReactions = getOfficeEventReactions(state);
  const activeZoneIds = new Set(zonePlan.active.map((zone) => zone.id));
  const zoneTitles = new Map([...zonePlan.active, ...zonePlan.locked].map((zone) => [zone.id, zone.title]));
  const objectStatuses = officeSceneObjects.map((object): OfficeSceneObjectStatus => {
    const levelBlocked = expansion.level < object.min_office_level;
    const zoneBlocked = Boolean(object.required_zone_id && !activeZoneIds.has(object.required_zone_id));
    const blockedReason = levelBlocked
      ? `${object.min_office_level}단계 사무실 필요`
      : zoneBlocked && object.required_zone_id
        ? `${zoneTitles.get(object.required_zone_id) ?? "연결 구획"} 잠금`
        : undefined;

    return {
      ...object,
      active: !blockedReason,
      blockedReason,
      zoneTitle: object.required_zone_id ? zoneTitles.get(object.required_zone_id) : undefined,
    };
  });
  const visibleObjects = objectStatuses.filter((object) => object.active || object.min_office_level <= expansion.level + 1);
  const actors = state.hiredAgents.length
    ? assignOfficeActorReactionPoses(
        state.hiredAgents.slice(0, officeActorSlots.length).map((agent, index) => createOfficeSceneActor(agent, index, state)),
        eventReactions,
      )
    : [createFounderPlaceholderActor()];
  const workingActorCount = actors.filter((actor) => actor.state === "working").length;

  return {
    expansionLabel: expansion.name,
    activeObjectCount: objectStatuses.filter((object) => object.active).length,
    visibleObjectCount: visibleObjects.length,
    activeActorCount: state.hiredAgents.length,
    workingActorCount,
    objects: visibleObjects,
    actors,
    eventReactions,
    activityTicker: createOfficeSceneActivityTicker(state, expansion.name, zonePlan.active.length, workingActorCount),
  };
}

function assignOfficeActorReactionPoses(
  actors: OfficeSceneActorStatus[],
  reactions: OfficeEventReactionStatus[],
): OfficeSceneActorStatus[] {
  const cardUseReaction = reactions.find((reaction) => reaction.trigger === "card_use");
  const launchReaction = reactions.find((reaction) => reaction.trigger === "product_launch");
  const alertReaction = reactions.find((reaction) => reaction.trigger === "rival_alert" || reaction.trigger === "staff_incident");
  const cardTargetIndex = cardUseReaction ? actors.findIndex((actor) => actor.state === "working") : -1;
  const cheerTargetIndex = launchReaction
    ? actors.findIndex((actor) => actor.state !== "warning" && actor.state !== "resting")
    : -1;

  return actors.map((actor, index) => {
    if (index === cardTargetIndex && cardUseReaction) {
      return {
        ...actor,
        reactionPose: "card_use",
        reactionPoseSource: `card_use:${cardUseReaction.source}`,
      };
    }

    if (index === cheerTargetIndex && launchReaction) {
      return {
        ...actor,
        reactionPose: "cheer",
        reactionPoseSource: `product_launch:${launchReaction.source}`,
      };
    }

    if (actor.state === "warning" || actor.state === "resting") {
      return {
        ...actor,
        reactionPose: "alert",
        reactionPoseSource: actor.state === "warning"
          ? `loyalty:${actor.loyalty}`
          : `energy:${actor.energy}`,
      };
    }

    if (alertReaction) {
      return {
        ...actor,
        reactionPose: "alert",
        reactionPoseSource: `${alertReaction.trigger}:${alertReaction.source}`,
      };
    }

    return actor;
  });
}

function getOfficeEventReactions(state: GameState): OfficeEventReactionStatus[] {
  const entries = officeReactions
    .map((definition): OfficeEventReactionStatus | undefined => {
      if (definition.trigger === "card_use") {
        const cardEntry = state.timeline.find((entry) => entry.startsWith("카드 사용:"));
        const playedCards = state.roguelite.deck.playedThisTurn;
        const playedCardId = playedCards[playedCards.length - 1];
        const playedCard = playedCardId ? strategyCards.find((card) => card.id === playedCardId) : undefined;
        const cardName = playedCard?.name ?? cardEntry?.replace(/^카드 사용:\s*/, "").split(" (")[0];
        if (!cardName) return undefined;

        return {
          ...definition,
          headline: `${cardName} 발동`,
          source: cardEntry ?? `playedThisTurn:${playedCardId}`,
        };
      }

      if (definition.trigger === "product_launch") {
        const launch = state.lastRelease;
        if (!launch || launch.month < state.month - 1) return undefined;

        return {
          ...definition,
          headline: `${launch.productName} ${launch.review.grade}`,
          source: `lastRelease:${launch.productId}`,
        };
      }

      if (definition.trigger === "rival_alert") {
        const rivalEntry = state.timeline.find((entry) => entry.includes("경쟁사") || entry.includes("라이벌") || entry.includes("스카우트"));
        const rivalEvent = state.currentRivalEvent;
        if (!rivalEntry && !rivalEvent) return undefined;

        return {
          ...definition,
          headline: rivalEvent ? t(rivalEvent.name_key) : "경쟁사 움직임",
          source: rivalEntry ?? `rivalEvent:${rivalEvent?.id}`,
        };
      }

      const staffEntry = state.timeline.find((entry) => entry.includes("인사") || entry.includes("후폭풍") || entry.includes("퇴사"));
      const staffSummary = state.lastMonthReport?.staffAftermathSummary;
      if (!staffEntry && !staffSummary) return undefined;

      return {
        ...definition,
        headline: staffSummary ?? "직원 케어 경보",
        source: staffEntry ?? "staffAftermathSummary",
      };
    })
    .filter((reaction): reaction is OfficeEventReactionStatus => Boolean(reaction));

  return entries.sort((a, b) => b.priority - a.priority || a.id.localeCompare(b.id)).slice(0, 3);
}

function createOfficeSceneActor(agent: HiredAgent, index: number, state: GameState): OfficeSceneActorStatus {
  const agentType = getHiredAgentType(agent);
  const slot = officeActorSlots[index % officeActorSlots.length];
  const assignment = agent.assignment ? state.productProjects.find((project) => project.id === agent.assignment) : undefined;
  const assignedProduct = assignment ? getProductDefinition(assignment.productId, state) : undefined;
  const energy = agent.energy ?? 100;
  const loyalty = agent.loyalty ?? 70;
  const kind = agentType ? getAgentKind(agentType) : "ai_agent";
  const stateLabel = energy <= 30 ? "resting" : loyalty <= 45 ? "warning" : assignment ? "working" : "idle";
  const assignmentLabel = assignedProduct && assignment
    ? `${assignedProduct.name} ${Math.round(assignment.progress)}%`
    : stateLabel === "resting"
      ? "회복 필요"
      : stateLabel === "warning"
        ? "케어 필요"
        : kind === "robot"
          ? "충전 대기"
          : "운영 대기";
  const focus = getOfficeSceneActorFocus(stateLabel);

  return {
    id: agent.id,
    name: agent.name,
    kind,
    state: stateLabel,
    agentTypeId: agent.typeId,
    x: slot.x,
    y: slot.y + (index % 2 === 0 ? 0 : 2),
    level: agent.level,
    energy,
    loyalty,
    activity: getOfficeSceneActorActivity(stateLabel, kind, assignedProduct?.name),
    assignmentLabel,
    ...focus,
  };
}

function createFounderPlaceholderActor(): OfficeSceneActorStatus {
  return {
    id: "founder-placeholder",
    name: "창업자",
    kind: "human",
    state: "idle",
    x: 18,
    y: 68,
    level: 1,
    energy: 100,
    loyalty: 100,
    activity: "첫 채용 준비",
    assignmentLabel: "차고 운영",
    focusLabel: "창업 준비",
    actionLabel: "첫 채용",
    targetMenu: "agents",
  };
}

function getOfficeSceneActorFocus(actorState: OfficeSceneActorStatus["state"]): Pick<OfficeSceneActorStatus, "focusLabel" | "actionLabel" | "targetMenu"> {
  if (actorState === "working") {
    return {
      focusLabel: "작업 중",
      actionLabel: "프로젝트 보기",
      targetMenu: "products",
    };
  }
  if (actorState === "resting") {
    return {
      focusLabel: "회복 필요",
      actionLabel: "휴식 관리",
      targetMenu: "agents",
    };
  }
  if (actorState === "warning") {
    return {
      focusLabel: "케어 경고",
      actionLabel: "케어 보기",
      targetMenu: "agents",
    };
  }

  return {
    focusLabel: "대기 중",
    actionLabel: "배치 보기",
    targetMenu: "agents",
  };
}

function getOfficeSceneActorActivity(
  actorState: OfficeSceneActorStatus["state"],
  kind: OfficeSceneActorStatus["kind"],
  productName?: string,
): string {
  if (actorState === "working" && productName) return `${productName} 개발`;
  if (actorState === "resting") return "번아웃 회복";
  if (actorState === "warning") return "리텐션 경보";
  if (kind === "robot") return "충전 대기";
  if (kind === "ai_agent") return "프롬프트 대기";
  return "운영 대기";
}

function createOfficeSceneActivityTicker(
  state: GameState,
  expansionLabel: string,
  activeZoneCount: number,
  workingActorCount: number,
): string[] {
  const activeProject = state.productProjects[0];
  const activeProduct = activeProject ? getProductDefinition(activeProject.productId, state) : undefined;
  const entries = [
    `${expansionLabel} · 구획 ${activeZoneCount}개 가동`,
    activeProject && activeProduct
      ? `${activeProduct.name} 개발 ${Math.round(activeProject.progress)}%`
      : "제품 개발 대기",
    workingActorCount > 0
      ? `${workingActorCount}명/기 작업 중`
      : state.hiredAgents.length > 0
        ? "배치 가능한 인력 대기"
        : "첫 직원 또는 AI 에이전트 채용 필요",
  ];

  if (state.lastMonthReport?.staffAftermathSummary) entries.push("인사 후폭풍 표시 중");
  if (state.currentEvent) entries.push(`긴급 이슈: ${state.currentEvent.name}`);

  return entries;
}

function getOfficeZoneBlockedReasons(zone: (typeof officeZones)[number], state: GameState, officeLevel: number): string[] {
  const reasons: string[] = [];

  if (officeLevel < zone.min_office_level) {
    reasons.push(`${zone.min_office_level}단계 사무실 필요`);
  }
  for (const [resourceId, needed] of Object.entries(zone.required_resources ?? {})) {
    if ((state.resources[resourceId] ?? 0) < needed) {
      const resourceName = resources[resourceId]?.name ?? resourceId;
      reasons.push(`${resourceName} ${needed.toLocaleString("ko-KR")} 필요`);
    }
  }
  for (const [capabilityId, needed] of Object.entries(zone.required_capabilities ?? {})) {
    if ((state.capabilities[capabilityId] ?? 0) < needed) {
      const capabilityName = capabilities.find((capability) => capability.id === capabilityId)?.name ?? capabilityId;
      reasons.push(`${capabilityName} Lv.${needed} 필요`);
    }
  }
  for (const domainId of zone.required_domains ?? []) {
    if (!state.unlockedDomains.includes(domainId)) {
      const domainName = domains.find((domain) => domain.id === domainId)?.name ?? domainId;
      reasons.push(`${domainName} 분야 필요`);
    }
  }
  if (state.activeProducts.length < (zone.required_active_products ?? 0)) {
    reasons.push(`활성 제품 ${zone.required_active_products}개 필요`);
  }
  if (state.hiredAgents.length < (zone.required_hired_agents ?? 0)) {
    reasons.push(`고용 인력 ${zone.required_hired_agents}명 필요`);
  }

  return reasons;
}

export function getOfficeGrowthPlan(state: GameState): OfficeGrowthPlan {
  const expansion = getOfficeExpansion(state);
  const placedItems = getPlacedOfficeItems(state);
  const nextExpansion = getNextOfficeExpansion(state);
  const nextExpansionCheck = nextExpansion ? getOfficeExpansionCheck(nextExpansion, state) : undefined;
  const currentLocation = getCurrentLocation(state);
  const nextLocation = getNextCompanyLocation(state);
  const nextLocationCheck = nextLocation ? getRelocationCheck(nextLocation.id, state) : undefined;
  const synergySummary = getOfficeSynergySummary(state);
  const zonePlan = getOfficeZonePlan(state);
  const nextSynergy = synergySummary.nextCandidate
    ? {
        ...synergySummary.nextCandidate,
        recommendedItems: getOfficeDecorRecommendationsForSynergy(synergySummary.nextCandidate, state),
      }
    : undefined;
  const current = {
    expansionId: expansion.id,
    expansionName: expansion.name,
    level: expansion.level,
    hireSlotsUsed: state.hiredAgents.length,
    hireSlotsTotal: getOfficeHireCapacity(state),
    decorationSlotsUsed: placedItems.length,
    decorationSlotsTotal: getOfficeDecorationSlots(state),
    openDecorationSlots: Math.max(0, getOfficeDecorationSlots(state) - placedItems.length),
    activeZoneCount: zonePlan.active.length,
    nextZoneTitle: zonePlan.nextZone?.title,
    monthlyEffects: getOfficeMonthlyEffects(state),
  };
  const nextExpansionChoice = nextExpansion
    ? {
        id: nextExpansion.id,
        name: nextExpansion.name,
        description: nextExpansion.description,
        available: Boolean(nextExpansionCheck?.ok),
        reasons: nextExpansionCheck?.reasons ?? [],
        cost: nextExpansion.cost,
        hireCapacityGain: nextExpansion.hire_capacity - expansion.hire_capacity,
        decorationSlotGain: nextExpansion.decoration_slots - expansion.decoration_slots,
        monthlyEffects: nextExpansion.monthly_effects,
      }
    : undefined;
  const nextRelocationChoice = nextLocation
    ? {
        id: nextLocation.id,
        name: nextLocation.name,
        region: nextLocation.region,
        description: nextLocation.description,
        available: Boolean(nextLocationCheck?.ok),
        reasons: nextLocationCheck?.reasons ?? [],
        cost: nextLocation.cost,
        monthlyCostModifierDelta: Number((nextLocation.monthly_cost_modifier - currentLocation.monthly_cost_modifier).toFixed(2)),
        aiOperationGain: nextLocation.ai_operation_bonus - currentLocation.ai_operation_bonus,
        humanHireDiscountDelta: Number((nextLocation.human_hire_discount - currentLocation.human_hire_discount).toFixed(2)),
      }
    : undefined;

  return {
    current,
    nextExpansion: nextExpansionChoice,
    nextRelocation: nextRelocationChoice,
    activeSynergies: synergySummary.active,
    nextSynergy,
    zonePlan,
    placedDecorRows: placedItems.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      effects: item.effects,
      linkedSynergyTitles: synergySummary.active.filter((synergy) => itemContributesToSynergy(item, synergy)).map((synergy) => synergy.title),
    })),
    primaryAction: chooseOfficeGrowthPrimaryAction(current, nextExpansionChoice, nextRelocationChoice, nextSynergy),
  };
}

export function getOperationsCommandPlan(state: GameState): OperationsCommandPlan {
  const economy = calculateMonthlyEconomy(state);
  const officePlan = getOfficeGrowthPlan(state);
  const zonePlan = officePlan.zonePlan;
  const staffIncidents = getStaffIncidentBriefs(state);
  const criticalIncidentCount = staffIncidents.filter((incident) => incident.severity === "critical").length;
  const focusCards: OperationsCommandFocus[] = [];
  const activeProject = state.productProjects[0];
  const activeProjectProduct = activeProject ? getProductDefinition(activeProject.productId, state) : undefined;
  const activeProducts = getAvailableProductDefinitions(state).filter((product) => state.activeProducts.includes(product.id));
  const renewalCandidate = activeProducts.find((product) => getProductLevel(product.id, state) < product.max_level);
  const openHireSlots = Math.max(0, getOfficeHireCapacity(state) - state.hiredAgents.length);
  const cashDelta = economy.resourceDelta.cash ?? 0;
  const cash = state.resources.cash ?? 0;
  const trust = state.resources.trust ?? 0;
  const rivalPressure = getStrongestCompetitorPressure(state);
  const playerMarketShare = getPlayerMarketShare(state);

  if (staffIncidents.length > 0) {
    focusCards.push({
      id: "staff_incidents",
      title: criticalIncidentCount > 0 ? "긴급 인사 케어" : "직원 리스크 점검",
      description: `${staffIncidents.length}건의 인사 사건이 있습니다. 방치하면 후폭풍이 개발 완성도와 경쟁사 모멘텀에 번집니다.`,
      severity: criticalIncidentCount > 0 ? "urgent" : "watch",
      targetMenu: "agents",
      actionLabel: "에이전트 콘솔",
    });
  } else if (openHireSlots > 0) {
    focusCards.push({
      id: "hire_capacity",
      title: "채용 여력 사용",
      description: `현재 빈 자리 ${openHireSlots}명입니다. 제품/운영을 동시에 굴리려면 사람, AI, 로봇 조합을 늘리세요.`,
      severity: state.hiredAgents.length < 2 ? "watch" : "opportunity",
      targetMenu: "agents",
      actionLabel: "후보 보기",
    });
  }

  if (activeProject && activeProjectProduct) {
    focusCards.push({
      id: "active_project",
      title: `${activeProjectProduct.name} 완주`,
      description: `진행 ${Math.round(activeProject.progress)}%, 완성도 ${Math.round(activeProject.quality)}입니다. 카드와 개발 이슈 대응으로 출시 점수를 끌어올리세요.`,
      severity: activeProject.quality < 45 ? "watch" : "opportunity",
      targetMenu: "products",
      actionLabel: "제품 개발",
    });
  } else if (state.activeProducts.length === 0) {
    focusCards.push({
      id: "first_product",
      title: "첫 제품 출시",
      description: "출시 제품이 아직 없습니다. AI 모델이나 생산성 제품을 빠르게 만들어 첫 매출과 카드 보상을 열어야 합니다.",
      severity: "urgent",
      targetMenu: "products",
      actionLabel: "제품 선택",
    });
  } else if (renewalCandidate) {
    focusCards.push({
      id: "renewal",
      title: "대표 제품 리뉴얼",
      description: `${renewalCandidate.name}은 Lv.${getProductLevel(renewalCandidate.id, state)}입니다. 새 제품만 늘리기보다 업데이트/리뉴얼로 유지율을 챙길 수 있습니다.`,
      severity: "opportunity",
      targetMenu: "products",
      actionLabel: "리뉴얼 후보",
    });
  }

  if (cash < 0 || cashDelta < 0 || trust < 35) {
    focusCards.push({
      id: "runway",
      title: cash < 0 ? "현금 위기" : cashDelta < 0 ? "손익 방어" : "신뢰 회복",
      description:
        cash < 0
          ? "현금이 0 아래로 내려갔습니다. 비용을 줄이고 즉시 매출 제품이나 운영 자동화를 봐야 합니다."
          : cashDelta < 0
            ? `이번 달 현금 흐름이 ${formatMoney(cashDelta)}입니다. 자동화, 제품 리뉴얼, 구획 보너스로 고정비를 눌러야 합니다.`
            : `신뢰 ${Math.round(trust)}입니다. 기업/안전 제품과 지시 보너스로 낮은 신뢰 페널티를 피하세요.`,
      severity: cash < 0 || trust < 25 ? "urgent" : "watch",
      targetMenu: cashDelta < 0 ? "shop" : "research",
      actionLabel: cashDelta < 0 ? "운영 개선" : "연구 보기",
    });
  }

  if (zonePlan.nextZone) {
    focusCards.push({
      id: "next_office_zone",
      title: `다음 구획: ${zonePlan.nextZone.title}`,
      description: zonePlan.nextZone.blockedReasons.length
        ? zonePlan.nextZone.blockedReasons.slice(0, 2).join(" / ")
        : `${zonePlan.nextZone.title}을 가동해 월간 운영 효과를 늘릴 수 있습니다.`,
      severity: zonePlan.active.length < 2 ? "watch" : "opportunity",
      targetMenu: "shop",
      actionLabel: "공간 성장",
    });
  }

  if (rivalPressure.marketShare > playerMarketShare || state.currentRivalEvent) {
    focusCards.push({
      id: "rival_pressure",
      title: `${rivalPressure.name} 압박`,
      description: `경쟁사 점유 ${rivalPressure.marketShare}% 대 우리 ${playerMarketShare}%입니다. 대응 카드와 카운터 제품을 검토하세요.`,
      severity: rivalPressure.marketShare - playerMarketShare >= 20 ? "watch" : "opportunity",
      targetMenu: "competition",
      actionLabel: "경쟁 대응",
    });
  }

  const sortedFocusCards = focusCards
    .sort((left, right) => getOperationsSeverityScore(right.severity) - getOperationsSeverityScore(left.severity))
    .slice(0, 4);
  const riskLevel: OperationsCommandPlan["riskLevel"] = sortedFocusCards.some((card) => card.severity === "urgent")
    ? "urgent"
    : sortedFocusCards.some((card) => card.severity === "watch")
      ? "watch"
      : "stable";
  const activeSafeguards = getOperationsActiveSafeguards(state, zonePlan);

  return {
    headline: riskLevel === "urgent" ? "긴급 운영 회의" : riskLevel === "watch" ? "월간 운영 점검" : "운영 성장 의제",
    summary: `손익 ${formatMoney(cashDelta)} · 구획 ${zonePlan.active.length}개 · 인사 사건 ${staffIncidents.length}건 · 점유 ${playerMarketShare}%`,
    riskLevel,
    focusCards: sortedFocusCards,
    activeSafeguards,
    nextMilestone: getOperationsNextMilestone(state, officePlan),
  };
}

function getOperationsSeverityScore(severity: OperationsCommandFocus["severity"]): number {
  if (severity === "urgent") return 4;
  if (severity === "watch") return 3;
  if (severity === "opportunity") return 2;
  return 1;
}

function getOperationsActiveSafeguards(state: GameState, zonePlan: OfficeZonePlan): string[] {
  const safeguards = [`가동 구획 ${zonePlan.active.length}개`];
  if (isOfficeZoneActive(state, "retention_lounge")) safeguards.push("복지 라운지: 인사 후폭풍 완화");
  if (isOfficeZoneActive(state, "robotics_bay")) safeguards.push("로봇 고용 베이: 로봇 후보 우선 노출");
  if (isOfficeZoneActive(state, "chip_lab")) safeguards.push("칩 실험 랩: 연산 압박 완화");
  if (isOfficeZoneActive(state, "boundaryless_showroom_zone")) safeguards.push("경계 없는 쇼룸: 확장 스크린샷감 강화");
  return safeguards.slice(0, 4);
}

function getOperationsNextMilestone(state: GameState, officePlan: OfficeGrowthPlan): string {
  if (state.activeProducts.length === 0) return "첫 제품 출시로 매출, 카드 보상, 성장 분기를 여세요.";
  if (officePlan.nextExpansion?.available) return `${officePlan.nextExpansion.name} 확장으로 고용/장식 한도를 늘릴 수 있습니다.`;
  if (officePlan.zonePlan.nextZone) return `${officePlan.zonePlan.nextZone.title} 구획 조건을 채우면 월간 운영 효과가 늘어납니다.`;
  if (getCompanyStarRating(state) < 5) return "다음 별 등급 조건을 채워 더 좋은 지역과 후보 풀을 여세요.";
  return "10년 최종 평가를 위해 시장 점유율과 경계 확장 제품을 밀어붙이세요.";
}

function getOfficeDecorRecommendationsForSynergy(synergy: OfficeSynergyStatus, state: GameState): OfficeGrowthDecorRecommendation[] {
  const placedItems = getPlacedOfficeItems(state);
  const placedItemIds = new Set(placedItems.map((item) => item.id));
  const categoryCounts = countPlacedItemCategories(placedItems);
  const effectTotals = sumPlacedItemEffects(placedItems);

  return items
    .filter((item) => isOfficeDecorationItem(item) && !placedItemIds.has(item.id))
    .map((item) => {
      const itemCheck = getItemCheck(item, state);
      const placeCheck = state.ownedItems.includes(item.id) ? getPlaceOfficeItemCheck(item, state) : undefined;
      const score = getOfficeDecorRecommendationScore(item, synergy, categoryCounts, effectTotals);

      return {
        id: item.id,
        name: item.name,
        category: item.category,
        available: state.ownedItems.includes(item.id) ? Boolean(placeCheck?.ok) : itemCheck.ok,
        owned: state.ownedItems.includes(item.id),
        placeable: Boolean(placeCheck?.ok),
        score,
        effects: item.effects,
        cost: item.cost,
        recommendationReason: getOfficeDecorRecommendationReason(item, synergy, categoryCounts, effectTotals),
      };
    })
    .filter((item) => item.score > 0 && (item.available || item.owned))
    .sort((a, b) => b.score - a.score || getCostWeight(a.cost) - getCostWeight(b.cost) || a.name.localeCompare(b.name, "ko"))
    .slice(0, 3);
}

function getOfficeDecorRecommendationScore(
  item: ItemDefinition,
  synergy: OfficeSynergyStatus,
  categoryCounts: Record<string, number>,
  effectTotals: Record<string, number>,
): number {
  let score = 0;

  for (const [category, needed] of Object.entries(synergy.required_categories)) {
    const missing = Math.max(0, needed - (categoryCounts[category] ?? 0));
    if (missing > 0 && item.category === category) score += 48 + missing * 8;
  }

  for (const [effectId, needed] of Object.entries(synergy.required_effects)) {
    const missing = Math.max(0, needed - (effectTotals[effectId] ?? 0));
    const amount = item.effects[effectId] ?? 0;
    if (missing > 0 && amount > 0) score += Math.min(amount, missing) * 6 + Math.max(0, amount - missing);
  }

  return score;
}

function getOfficeDecorRecommendationReason(
  item: ItemDefinition,
  synergy: OfficeSynergyStatus,
  categoryCounts: Record<string, number>,
  effectTotals: Record<string, number>,
): string {
  const matches: string[] = [];

  for (const [category, needed] of Object.entries(synergy.required_categories)) {
    if ((categoryCounts[category] ?? 0) < needed && item.category === category) matches.push(`${category} 분류`);
  }

  for (const [effectId, needed] of Object.entries(synergy.required_effects)) {
    if ((effectTotals[effectId] ?? 0) < needed && (item.effects[effectId] ?? 0) > 0) matches.push(`${effectId} +${item.effects[effectId]}`);
  }

  return matches.length
    ? `${synergy.title}에 필요한 ${matches.slice(0, 2).join(", ")} 보강`
    : `${synergy.title} 후보를 넓히는 장식`;
}

function chooseOfficeGrowthPrimaryAction(
  current: OfficeGrowthPlan["current"],
  nextExpansion: OfficeGrowthPlan["nextExpansion"],
  nextRelocation: OfficeGrowthPlan["nextRelocation"],
  nextSynergy: OfficeGrowthPlan["nextSynergy"],
): OfficeGrowthPlan["primaryAction"] {
  const teamCrowded = current.hireSlotsUsed >= current.hireSlotsTotal;
  const decorCrowded = current.openDecorationSlots === 0;

  if (nextExpansion?.available && (teamCrowded || decorCrowded)) {
    return {
      kind: "expand_office",
      label: "사무실 확장",
      reason: teamCrowded ? "팀 수용 인원이 가득 찼습니다." : "장식 슬롯이 가득 찼습니다.",
      targetId: nextExpansion.id,
    };
  }

  const recommendedDecor = nextSynergy?.recommendedItems[0];
  if (recommendedDecor && current.openDecorationSlots > 0) {
    return {
      kind: recommendedDecor.owned ? "place_decor" : "buy_decor",
      label: recommendedDecor.owned ? "추천 장식 배치" : "추천 장식 구매",
      reason: recommendedDecor.recommendationReason,
      targetId: recommendedDecor.id,
    };
  }

  if (nextExpansion?.available) {
    return {
      kind: "expand_office",
      label: "사무실 확장",
      reason: `${nextExpansion.name}으로 고용과 장식 여유를 늘릴 수 있습니다.`,
      targetId: nextExpansion.id,
    };
  }

  if (nextRelocation?.available) {
    return {
      kind: "relocate",
      label: "지역 이전",
      reason: `${nextRelocation.name}으로 AI 운용과 인재 접근성을 바꿀 수 있습니다.`,
      targetId: nextRelocation.id,
    };
  }

  return {
    kind: "maintain",
    label: "운영 유지",
    reason: nextExpansion?.reasons[0] ?? nextRelocation?.reasons[0] ?? "현재 사무실을 더 활용하세요.",
  };
}

function getNextCompanyLocation(state: GameState): CompanyLocationDefinition | undefined {
  const currentIndex = companyLocations.findIndex((location) => location.id === state.locationId);
  return companyLocations[Math.max(0, currentIndex) + 1];
}

function itemContributesToSynergy(item: ItemDefinition, synergy: OfficeSynergyStatus): boolean {
  if (synergy.required_categories[item.category]) return true;
  return Object.keys(item.effects).some((effectId) => Boolean(synergy.required_effects[effectId]));
}

function getCostWeight(cost: ResourceMap): number {
  return Object.entries(cost).reduce((sum, [resourceId, amount]) => sum + (resourceId === "cash" ? amount : amount * 120), 0);
}

function countPlacedItemCategories(placedItems: ItemDefinition[]): Record<string, number> {
  return placedItems.reduce<Record<string, number>>((counts, item) => {
    counts[item.category] = (counts[item.category] ?? 0) + 1;
    return counts;
  }, {});
}

function sumPlacedItemEffects(placedItems: ItemDefinition[]): Record<string, number> {
  return placedItems.reduce<Record<string, number>>((totals, item) => {
    for (const [effectId, amount] of Object.entries(item.effects ?? {})) {
      totals[effectId] = (totals[effectId] ?? 0) + amount;
    }
    return totals;
  }, {});
}

function getRequirementProgress(
  requirements: Record<string, number>,
  currentValues: Record<string, number>,
): { complete: boolean; labels: string[] } {
  const labels = Object.entries(requirements).map(([id, needed]) => {
    const current = currentValues[id] ?? 0;
    return `${id} ${Math.min(current, needed)}/${needed}`;
  });
  const complete = Object.entries(requirements).every(([id, needed]) => (currentValues[id] ?? 0) >= needed);

  return { complete, labels };
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
  return hireAgentViaChannel(agent, state, "open_recruiting");
}

export function hireAgentViaChannel(agent: AgentTypeDefinition, state: GameState, channelId: RecruitmentChannelId): GameState {
  const channel = getRecruitmentChannel(channelId);
  const check = getAgentHireCheckForChannel(agent, state, channel.id);
  if (!check.ok || state.status !== "playing") return state;
  const offer = getRecruitmentOffer(agent, state, channel.id);

  const hiredAgent: HiredAgent = {
    id: `agent_${state.hiredAgents.length + 1}_${agent.id}`,
    typeId: agent.id,
    name: agent.name,
    level: 1,
    energy: 100,
    experience: 0,
    loyalty: getInitialAgentLoyalty(channel.id),
    monthsEmployed: 0,
    equippedItemIds: [],
    recruitmentChannelId: channel.id,
    salaryMultiplier: channel.upkeepMultiplier,
    statBonus: channel.statBonus,
    upkeep: offer.upkeep,
    qualityLabel: offer.qualityLabel,
    riskLabel: offer.riskLabel,
  };

  return {
    ...state,
    resources: applyResourceDelta(applyResourceDelta(state.resources, negateCosts(offer.hireCost)), { talent: 1 }),
    hiredAgents: [...state.hiredAgents, hiredAgent],
    timeline: [`${channel.label} 고용 완료: ${agent.name} 합류 (${offer.qualityLabel})`, ...state.timeline].slice(0, 8),
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
    kind: "new",
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

export function createProductDefinitionFromConcept(concept: ProductConcept, state: GameState): ProductDefinition {
  const id = `concept_${concept.id}_${state.month}_${(state.generatedProducts ?? []).length + 1}`;
  const capabilityEntries = Object.entries({
    ...concept.subject.capability_bias,
    ...concept.productType.capability_bias,
  }).slice(0, 4);
  const requiredCapabilities = Object.fromEntries(
    capabilityEntries.map(([capabilityId, level]) => [capabilityId, clamp(Math.round(level), 1, 3)]),
  );

  return {
    id,
    name: concept.title,
    description: concept.pitch,
    domain: concept.suggestedDomain,
    required_capabilities: requiredCapabilities,
    launch_cost: concept.prototypeCost,
    base_revenue: Math.round(500 + concept.score * 24 + concept.subject.market_heat * 90),
    base_users_per_month: Math.round(80 + concept.score * 7 + concept.subject.market_heat * 30),
    compute_per_1000_users: Math.max(8, Math.round(8 + concept.tags.length * 1.6 + concept.subject.risk)),
    data_generated_per_month: Math.max(4, Math.round(4 + concept.score / 12 + concept.productType.score_bonus)),
    hype_on_launch: clamp(Math.round(4 + concept.score / 12 + concept.boldOption.score_delta / 2), 3, 18),
    trust_requirement: clamp(Math.round(concept.subject.risk * 6 - concept.boldOption.risk_delta), 0, 85),
    level: 1,
    max_level: 3,
    upgrade_cost_multiplier: 1.55,
    tags: concept.tags,
  };
}

export function getProductConceptProjectCheck(
  concept: ProductConcept,
  state: GameState,
  assignedAgentIds?: string[],
): ActionCheck {
  return getProductProjectCheck(createProductDefinitionFromConcept(concept, state), state, assignedAgentIds);
}

export function startProductConceptProject(
  concept: ProductConcept,
  state: GameState,
  assignedAgentIds?: string[],
): GameState {
  const generatedProduct = createProductDefinitionFromConcept(concept, state);
  const check = getProductProjectCheck(generatedProduct, state, assignedAgentIds);
  if (!check.ok || state.status !== "playing") return state;

  const projectState = {
    ...state,
    generatedProducts: [...(state.generatedProducts ?? []), generatedProduct],
  };
  const started = startProductProject(generatedProduct, projectState, assignedAgentIds);

  return {
    ...started,
    timeline: [`아이디어 채택: ${generatedProduct.name}`, ...started.timeline].slice(0, 8),
  };
}

export function getProductRenewalCost(product: ProductDefinition, state: GameState): ResourceMap {
  const currentLevel = Math.max(1, getProductLevel(product.id, state));
  return Object.fromEntries(
    Object.entries(product.launch_cost).map(([resourceId, value]) => [
      resourceId,
      Math.round(value * product.upgrade_cost_multiplier * currentLevel * 0.9),
    ]),
  );
}

export function getProductRenewalProjectCheck(
  product: ProductDefinition,
  renewalOptionId: string,
  state: GameState,
  assignedAgentIds?: string[],
): ActionCheck {
  const reasons: string[] = [];
  const currentLevel = getProductLevel(product.id, state);

  if (!state.activeProducts.includes(product.id)) reasons.push("출시한 제품만 리뉴얼할 수 있습니다.");
  if (currentLevel >= product.max_level) reasons.push("최대 레벨입니다.");
  if (state.productProjects.some((project) => project.productId === product.id)) {
    reasons.push("이미 이 제품의 개발 프로젝트가 진행 중입니다.");
  }
  if (!getRenewalReleaseOptions(product, currentLevel + 1).some((option) => option.id === renewalOptionId)) {
    reasons.push("알 수 없는 리뉴얼 방식입니다.");
  }
  appendCostReasons(reasons, getProductRenewalCost(product, state), state);

  const selectedAgents = assignedAgentIds ? [...new Set(assignedAgentIds)] : getAvailableAgents(state).slice(0, 1).map((agent) => agent.id);
  if (selectedAgents.length === 0) reasons.push("투입 가능한 에이전트가 필요합니다.");
  if (selectedAgents.length > 3) reasons.push("한 프로젝트에는 최대 3명까지 투입할 수 있습니다.");
  for (const agentId of selectedAgents) {
    const agent = state.hiredAgents.find((hiredAgent) => hiredAgent.id === agentId);
    if (!agent) reasons.push("알 수 없는 에이전트가 포함되어 있습니다.");
    else if (agent.assignment) reasons.push(`${agent.name}은 이미 다른 프로젝트에 투입되어 있습니다.`);
  }

  return { ok: reasons.length === 0, reasons };
}

export function startProductRenewalProject(
  product: ProductDefinition,
  renewalOptionId: string,
  state: GameState,
  assignedAgentIds?: string[],
): GameState {
  const check = getProductRenewalProjectCheck(product, renewalOptionId, state, assignedAgentIds);
  if (!check.ok || state.status !== "playing") return state;

  const assignedAgents = getSelectedProjectAgents(state, assignedAgentIds);
  const nextLevel = getProductLevel(product.id, state) + 1;
  const renewalOption = getRenewalReleaseOptions(product, nextLevel).find((option) => option.id === renewalOptionId);
  const releaseName = renewalOption?.releaseName ?? `${product.name} v${nextLevel}`;
  const projectId = `renewal_${state.productProjects.length + 1}_${product.id}_${renewalOptionId}`;
  const project: ProductProject = {
    id: projectId,
    productId: product.id,
    kind: "renewal",
    renewalOptionId,
    releaseName,
    progress: 0,
    quality: getStartingProjectQuality(assignedAgents, state) + 4,
    assignedAgentIds: assignedAgents.map((agent) => agent.id),
    startedMonth: state.month,
  };

  return {
    ...state,
    resources: applyResourceDelta(state.resources, negateCosts(getProductRenewalCost(product, state))),
    hiredAgents: state.hiredAgents.map((agent) =>
      project.assignedAgentIds.includes(agent.id) ? { ...agent, assignment: project.id } : agent,
    ),
    productProjects: [...state.productProjects, project],
    timeline: [`리뉴얼 개발 시작: ${releaseName} (${assignedAgents.map((agent) => agent.name).join(", ")})`, ...state.timeline].slice(0, 8),
  };
}

export function getProductProjectForecast(
  product: ProductDefinition,
  state: GameState,
  assignedAgentIds?: string[],
): ProductProjectForecast {
  const selectedAgents = getSelectedProjectAgents(state, assignedAgentIds);
  const assignedIds = selectedAgents.map((agent) => agent.id);
  const workforceSynergy = getWorkforceSynergySummary(state, assignedIds);
  const stats = addStats(
    selectedAgents.reduce((total, agent) => addStats(total, getAgentEffectiveStats(agent, state)), getGlobalItemStats(state)),
    workforceSynergy.totalStats,
  );
  const startingQuality = getStartingProjectQuality(selectedAgents, state);
  const monthlyProgressGain = getProjectProgressGain(stats) + workforceSynergy.projectProgressBonus;
  const monthlyQualityGain = getProjectQualityGain(stats) + workforceSynergy.projectQualityBonus;
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
  const contractStats = addStats(baseStats, Object.fromEntries(statKeys.map((stat) => [stat, agent.statBonus ?? 0])));
  const leveledStats = addStats(contractStats, getAgentLevelStatEffects(baseStats, agent.level));
  const preferredStats = addStats(leveledStats, getPreferredItemStatBonus(agent, type));
  const specializedStats = addStats(preferredStats, getSpecializationStatEffect(agent));

  return equippedItems.reduce((stats, item) => addStats(stats, item.effects), specializedStats);
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
  const active = getAvailableProductDefinitions(state).filter((product) => state.activeProducts.includes(product.id));
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
  const salaryCost = getTeamMonthlySalaryCost(state);
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

  const active = getAvailableProductDefinitions(state).filter((product) => state.activeProducts.includes(product.id));
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
  const staffAftermathState = applyUnresolvedStaffIncidentAftermaths(nextStateWithoutEvent, state, nextMonth);
  const careerState = advanceAgentCareers(staffAftermathState);
  const progressedState = advanceProductProjects(careerState);
  const entrantState = addScheduledCompetitors(progressedState);
  const seasonAdjustedState = applySeasonChallengeOutcomes(entrantState);
  const competedState = advanceCompetitors(seasonAdjustedState);
  const nextStatus = getNextStatus(competedState.resources, competedState.activeProducts.length, nextMonth);
  const nextStateForEvent = { ...competedState, status: nextStatus };
  const nextEvent = state.currentEvent ? state.currentEvent : findNextEligibleEvent(nextStateForEvent);
  const nextRivalEvent = state.currentRivalEvent ? state.currentRivalEvent : findNextEligibleRivalEvent(nextStateForEvent);
  const staffTimelineHighlights = getPriorityStaffTimelineEntries(competedState.timeline);
  const nonPriorityTimeline = competedState.timeline.filter((entry) => !staffTimelineHighlights.includes(entry));
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
      ...staffTimelineHighlights,
      ...nonPriorityTimeline,
      getOfficeMonthlyTimelineEntry(state) ?? "",
      getOfficeSynergyTimelineEntry(state) ?? "",
      getOfficeZoneTimelineEntry(state) ?? "",
      monthlyEconomy.strategyEffects ? `전략 효과: ${formatResourceDelta(monthlyEconomy.strategyEffects)}` : "",
      nextMonth >= CAMPAIGN_FINAL_MONTH ? `10년차 최종 평가: ${nextStatus === "success" ? "성공 엔딩" : "재도전 엔딩"}` : "",
      summary,
      ...state.timeline,
    ]
      .filter(Boolean)
      .slice(0, 10),
  });

  const reviewedState = applyDueAnnualReview(advancedState);
  const shockedState = applyDueCampaignShocks(reviewedState);
  const finalStatus = getNextStatus(shockedState.resources, shockedState.activeProducts.length, nextMonth);

  return refreshStrategyDeckForNewMonth({ ...shockedState, status: finalStatus });
}

function getPriorityStaffTimelineEntries(timeline: string[]): string[] {
  return timeline.filter((entry) => entry.startsWith("퇴사 발생") || entry.startsWith("인사 경고") || entry.startsWith("직원 성장") || entry.startsWith("인사 후폭풍"));
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

export function dismissTutorialGuide(tutorialId: string, state: GameState): GameState {
  const seenTutorials = state.seenTutorials ?? [];
  if (!tutorialId || seenTutorials.includes(tutorialId)) return state;

  return {
    ...state,
    seenTutorials: [...seenTutorials, tutorialId],
  };
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
  const generatedProducts = sanitizeGeneratedProducts(rawState.generatedProducts);
  const hydratedActiveProducts = sanitizeStringArray(rawState.activeProducts, [
    ...products.map((product) => product.id),
    ...generatedProducts.map((product) => product.id),
  ]);
  return {
    ...initialState,
    ...rawState,
    month: sanitizeNumber(rawState.month, initialState.month),
    locationId: sanitizeLocationId(rawState.locationId, initialState.locationId),
    resources: sanitizeResourceMap(rawState.resources, initialState.resources),
    capabilities: { ...initialState.capabilities, ...(isRecord(rawState.capabilities) ? rawState.capabilities : {}) },
    activeProducts: hydratedActiveProducts,
    generatedProducts,
    unlockedDomains: sanitizeStringArray(rawState.unlockedDomains, domains.map((domain) => domain.id), initialState.unlockedDomains),
    purchasedUpgrades: sanitizeStringArray(rawState.purchasedUpgrades),
    purchasedAutomationUpgrades: sanitizeStringArray(rawState.purchasedAutomationUpgrades),
    hiredAgents: Array.isArray(rawState.hiredAgents) ? rawState.hiredAgents : [],
    ownedItems,
    office: hydrateOfficeState(rawState.office, ownedItems),
    productProjects: Array.isArray(rawState.productProjects) ? rawState.productProjects : [],
    productLevels: sanitizeProductLevels(rawState.productLevels, hydratedActiveProducts, generatedProducts),
    competitorStates: Array.isArray(rawState.competitorStates) ? rawState.competitorStates : initialState.competitorStates,
    productReviews: isRecord(rawState.productReviews) ? rawState.productReviews : {},
    lastRelease: hydrateReleaseMoment(rawState.lastRelease, generatedProducts),
    roguelite: hydrateRogueliteState(rawState.roguelite, initialState.roguelite, generatedProducts),
    activeDevelopmentPuzzleModifiers: hydrateDevelopmentPuzzleModifiers(rawState.activeDevelopmentPuzzleModifiers),
    lastDevelopmentPuzzle: hydrateDevelopmentPuzzleResult(rawState.lastDevelopmentPuzzle),
    chosenGrowthPath: hydrateChosenGrowthPath(rawState.chosenGrowthPath),
    unlockedAchievements: sanitizeStringArray(rawState.unlockedAchievements),
    annualReviewHistory: hydrateAnnualReviewHistory(rawState.annualReviewHistory),
    annualDirective: hydrateAnnualDirective(rawState.annualDirective),
    pendingAnnualDirectiveChoices: hydratePendingAnnualDirectiveChoices(rawState.pendingAnnualDirectiveChoices),
    campaignShockHistory: sanitizeStringArray(rawState.campaignShockHistory, campaignShocks.map((shock) => shock.id)),
    eventHistory: sanitizeStringArray(rawState.eventHistory),
    rivalEventHistory: sanitizeStringArray(rawState.rivalEventHistory),
    seenTutorials: sanitizeStringArray(rawState.seenTutorials),
    recentStaffIncidentResolutions: hydrateStaffIncidentResolutionLog(rawState.recentStaffIncidentResolutions),
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

function hydrateStaffIncidentResolutionLog(value: unknown): StaffIncidentResolutionLogEntry[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((entry): entry is Record<string, unknown> => isRecord(entry))
    .map((entry, index): StaffIncidentResolutionLogEntry => {
      const incidentType: StaffIncidentResolutionLogEntry["incidentType"] =
        entry.incidentType === "poaching" || entry.incidentType === "discontent" ? entry.incidentType : "burnout";
      const severity: StaffIncidentResolutionLogEntry["severity"] = entry.severity === "critical" ? "critical" : "warning";

      return {
        id: typeof entry.id === "string" ? entry.id : `legacy-staff-resolution-${index}`,
        month: Math.max(1, Math.round(sanitizeNumber(entry.month, 1))),
        agentId: typeof entry.agentId === "string" ? entry.agentId : "unknown-agent",
        agentName: typeof entry.agentName === "string" ? entry.agentName : "알 수 없는 직원",
        incidentType,
        incidentTitle: typeof entry.incidentTitle === "string" ? entry.incidentTitle : "인사 사건",
        severity,
        resolutionId: typeof entry.resolutionId === "string" ? entry.resolutionId : "unknown",
        resolutionLabel: typeof entry.resolutionLabel === "string" ? entry.resolutionLabel : "대응 완료",
        summary: typeof entry.summary === "string" ? entry.summary : "인사 사건 대응 기록을 복구했습니다.",
        effectLabel: typeof entry.effectLabel === "string" ? entry.effectLabel : "효과 기록 없음",
        projectImpactLabel: typeof entry.projectImpactLabel === "string" ? entry.projectImpactLabel : undefined,
        isAftermath: typeof entry.isAftermath === "boolean" ? entry.isAftermath : entry.resolutionId === "unresolved_aftermath",
        sourceCompetitorId: typeof entry.sourceCompetitorId === "string" ? entry.sourceCompetitorId : undefined,
        sourceCompetitorName: typeof entry.sourceCompetitorName === "string" ? entry.sourceCompetitorName : undefined,
        offerLabel: typeof entry.offerLabel === "string" ? entry.offerLabel : undefined,
        stakesLabel: typeof entry.stakesLabel === "string" ? entry.stakesLabel : undefined,
      };
    })
    .slice(0, 6);
}

function sanitizeLocationId(value: unknown, fallback: string): string {
  if (typeof value === "string" && companyLocations.some((location) => location.id === value)) return value;
  return fallback;
}

function sanitizeGeneratedProducts(value: unknown): ProductDefinition[] {
  if (!Array.isArray(value)) return [];

  const seenIds = new Set<string>();
  return value
    .filter((entry): entry is ProductDefinition => {
      if (!isRecord(entry)) return false;
      if (typeof entry.id !== "string" || seenIds.has(entry.id) || products.some((product) => product.id === entry.id)) return false;
      if (typeof entry.name !== "string" || typeof entry.description !== "string") return false;
      if (typeof entry.domain !== "string" || !domains.some((domain) => domain.id === entry.domain)) return false;
      if (!isRecord(entry.required_capabilities) || !isRecord(entry.launch_cost)) return false;
      for (const capabilityId of Object.keys(entry.required_capabilities)) {
        if (!capabilities.some((capability) => capability.id === capabilityId)) return false;
      }
      for (const resourceId of Object.keys(entry.launch_cost)) {
        if (!resources[resourceId]) return false;
      }
      seenIds.add(entry.id);
      return true;
    })
    .map((product) => ({
      ...product,
      base_revenue: sanitizeNumber(product.base_revenue, 500),
      base_users_per_month: sanitizeNumber(product.base_users_per_month, 100),
      compute_per_1000_users: sanitizeNumber(product.compute_per_1000_users, 10),
      data_generated_per_month: sanitizeNumber(product.data_generated_per_month, 5),
      hype_on_launch: sanitizeNumber(product.hype_on_launch, 5),
      trust_requirement: sanitizeNumber(product.trust_requirement, 0),
      level: sanitizeNumber(product.level, 1),
      max_level: sanitizeNumber(product.max_level, 3),
      upgrade_cost_multiplier: sanitizeNumber(product.upgrade_cost_multiplier, 1.5),
      tags: Array.isArray(product.tags) ? product.tags.filter((tag): tag is string => typeof tag === "string") : [],
    }));
}

function sanitizeProductLevels(
  value: unknown,
  activeProducts: unknown,
  generatedProducts: ProductDefinition[] = [],
): Record<string, number> {
  const raw = isRecord(value) ? value : {};
  const allProducts = [...products, ...generatedProducts];
  const activeProductIds = new Set(sanitizeStringArray(activeProducts, allProducts.map((product) => product.id)));
  const sanitized: Record<string, number> = {};

  for (const product of allProducts) {
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

function applySeasonChallengeOutcomes(state: GameState): GameState {
  const challenges = getCompetitionSeasonChallenges(state);
  if (challenges.length === 0) return state;

  const completed = challenges.filter((challenge) => challenge.complete);
  const unresolved = challenges.filter((challenge) => !challenge.complete);
  const unresolvedCompetitorIds = new Set(unresolved.flatMap((challenge) => challenge.relatedCompetitorIds));
  const nextCompetitors = state.competitorStates.map((competitor) =>
    unresolvedCompetitorIds.has(competitor.id)
      ? {
          ...competitor,
          momentum: clamp(competitor.momentum + 2, -12, 12),
          lastMove: competitor.lastMove.includes("시즌 압박") ? competitor.lastMove : `${competitor.lastMove} · 시즌 압박`,
        }
      : competitor,
  );
  const rewardDelta: ResourceMap = completed.length
    ? {
        trust: completed.length,
        users: completed.length * 80,
        data: completed.length * 2,
      }
    : {};

  return {
    ...state,
    competitorStates: nextCompetitors,
    resources: Object.keys(rewardDelta).length ? applyResourceDelta(state.resources, rewardDelta) : state.resources,
    timeline: [
      ...state.timeline,
      completed.length ? `시즌 과제 보상: ${completed.length}개 대응 완료 (${formatResourceDelta(rewardDelta)})` : "",
      unresolved.length ? `시즌 압박: ${unresolved.map((challenge) => challenge.title).join(", ")}` : "",
    ]
      .filter(Boolean)
      .slice(0, 8),
  };
}

function advanceCompetitors(state: GameState): GameState {
  const playerDomains = new Set(
    getAvailableProductDefinitions(state).filter((product) => state.activeProducts.includes(product.id)).map((product) => product.domain),
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
  const competitionTimeline = getCompetitionTimeline(state.competitorStates, nextCompetitors).slice(0, 3);

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
    const product = getProductDefinition(project.productId, state);
    if (!product) continue;

    const teamStats = getProjectTeamStats(project, state);
    const progressGain = getProjectProgressGain(teamStats, project, state);
    const qualityGain = getProjectQualityGain(teamStats, project, state);
    const progressedProject: ProductProject = {
      ...project,
      progress: clamp(project.progress + progressGain, 0, 100),
      quality: clamp(project.quality + qualityGain, 0, 100),
    };

    if (progressedProject.progress >= 100) {
      const releaseReview = createReleaseReview(product, nextState, progressedProject.quality);
      const isRenewal = progressedProject.kind === "renewal";
      const nextLevel = isRenewal ? Math.min(product.max_level, getProductLevel(product.id, nextState) + 1) : 1;
      const releaseName = progressedProject.releaseName ?? product.name;
      const lastRelease = {
        productId: product.id,
        productName: releaseName,
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
          hype: isRenewal ? Math.ceil(product.hype_on_launch * 0.55) : product.hype_on_launch,
          trust: progressedProject.quality >= 82 ? (isRenewal ? 3 : 2) : 0,
        }),
        activeProducts: isRenewal || nextState.activeProducts.includes(product.id) ? nextState.activeProducts : [...nextState.activeProducts, product.id],
        productLevels: { ...nextState.productLevels, [product.id]: nextLevel },
        productReviews: { ...nextState.productReviews, [product.id]: releaseReview },
        lastRelease,
        roguelite: createReleaseCardReward(product, releaseReview, nextState),
        hiredAgents: nextState.hiredAgents.map((agent) =>
          progressedProject.assignedAgentIds.includes(agent.id)
            ? { ...agent, assignment: undefined, energy: clamp(agent.energy - 18, 0, 100) }
            : agent,
        ),
      };
      releaseTimeline.push(
        isRenewal
          ? `${releaseName} 리뉴얼 출시: ${releaseReview.grade} (${releaseReview.score}점)`
          : `${product.name} 완성: ${releaseReview.grade} (${releaseReview.score}점) 출시`,
      );
    } else {
      continuingProjects.push(progressedProject);
      releaseTimeline.push(`${product.name} 개발 ${Math.round(progressedProject.progress)}% / 완성도 ${Math.round(progressedProject.quality)}`);
    }
  }

  return {
    ...nextState,
    productProjects: continuingProjects,
    timeline: [...releaseTimeline, ...state.timeline].slice(0, 8),
  };
}

function advanceAgentCareers(state: GameState): GameState {
  if (state.hiredAgents.length === 0) return state;

  const levelUpNames: string[] = [];
  const initialZeroLoyaltyIds = new Set(state.hiredAgents.filter((agent) => getAgentLoyalty(agent) <= 0).map((agent) => agent.id));
  const nextAgents = state.hiredAgents.map((agent) => {
    const assigned = Boolean(agent.assignment);
    const experienceGain = assigned ? 2 : 1;
    let level = sanitizeAgentLevel(agent.level);
    let experience = Math.max(0, Math.round(agent.experience ?? 0)) + experienceGain;

    while (level < 10 && experience >= getAgentNextLevelExperience(level)) {
      experience -= getAgentNextLevelExperience(level);
      level += 1;
      levelUpNames.push(agent.name);
    }

    const nextEnergy = clamp(agent.energy + (assigned ? -6 : 8), 0, 100);
    const loyalty = clamp(getAgentLoyalty(agent) + getMonthlyAgentLoyaltyDelta(agent, state, assigned, nextEnergy), 0, 100);

    return {
      ...agent,
      level,
      experience,
      loyalty,
      monthsEmployed: (agent.monthsEmployed ?? 0) + 1,
      energy: nextEnergy,
    };
  });
  const departingAgents = nextAgents.filter((agent) => initialZeroLoyaltyIds.has(agent.id) || getAgentLoyalty(agent) <= 0);
  const departingIds = new Set(departingAgents.map((agent) => agent.id));
  const retainedAgents = nextAgents.filter((agent) => !departingIds.has(agent.id));
  const retentionAlerts = getAgentRetentionAlerts({ ...state, hiredAgents: retainedAgents });
  const careerTimeline = [
    levelUpNames.length ? `직원 성장: ${levelUpNames.slice(0, 2).join(", ")} 레벨업` : "",
    departingAgents.length ? `퇴사 발생: ${departingAgents.map((agent) => agent.name).join(", ")} 이직` : "",
    retentionAlerts[0] ? `인사 경고: ${retentionAlerts[0].message}` : "",
  ].filter(Boolean);

  return {
    ...state,
    resources: departingAgents.length ? applyResourceDelta(state.resources, { talent: -departingAgents.length }) : state.resources,
    hiredAgents: retainedAgents,
    productProjects: departingAgents.length
      ? state.productProjects.map((project) => ({
          ...project,
          assignedAgentIds: project.assignedAgentIds.filter((agentId) => !departingIds.has(agentId)),
        }))
      : state.productProjects,
    timeline: [...careerTimeline, ...state.timeline].slice(0, 8),
  };
}

function getProjectTeamStats(project: ProductProject, state: GameState): AgentStats {
  const projectAgents = state.hiredAgents.filter((agent) => project.assignedAgentIds.includes(agent.id));
  const agentStats = projectAgents.reduce((stats, agent) => addStats(stats, getAgentEffectiveStats(agent, state)), createEmptyStats());
  const workforceSynergy = getWorkforceSynergySummary(state, project.assignedAgentIds);
  return addStats(addStats(agentStats, getGlobalItemStats(state)), workforceSynergy.totalStats);
}

function getProjectProgressGain(_stats: AgentStats, project?: ProductProject, state?: GameState): number {
  const workforceSynergy = project && state ? getWorkforceSynergySummary(state, project.assignedAgentIds) : undefined;
  return 50 + (workforceSynergy?.projectProgressBonus ?? 0);
}

function getProjectQualityGain(stats: AgentStats, project?: ProductProject, state?: GameState): number {
  const workforceSynergy = project && state ? getWorkforceSynergySummary(state, project.assignedAgentIds) : undefined;
  return Math.round(clamp(5 + stats.product * 0.65 + stats.creativity * 0.55 + stats.safety * 0.35 + stats.research * 0.25, 7, 24)) + (workforceSynergy?.projectQualityBonus ?? 0);
}

function getStartingProjectQuality(assignedAgents: HiredAgent[], state: GameState): number {
  const assignedIds = assignedAgents.map((agent) => agent.id);
  const workforceSynergy = getWorkforceSynergySummary(state, assignedIds);
  const stats = addStats(
    assignedAgents.reduce((total, agent) => addStats(total, getAgentEffectiveStats(agent, state)), getGlobalItemStats(state)),
    workforceSynergy.totalStats,
  );
  return Math.round(clamp(35 + stats.product * 0.7 + stats.creativity * 0.5 + stats.safety * 0.25 + workforceSynergy.projectQualityBonus, 35, 78));
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
  const officeMonthlyEffects = getOfficeMonthlyEffects(state);
  const officeSynergyEffects = getOfficeSynergySummary(state).totalMonthlyEffects;
  const officeZoneEffects = getOfficeZonePlan(state).totalMonthlyEffects;
  const deckSynergyEffects = getDeckSynergyMonthlyEffects(state);
  if (growthPathEffects && Object.keys(growthPathEffects).length > 0) effects.push(growthPathEffects);
  if (annualDirective?.monthlyEffects && Object.keys(annualDirective.monthlyEffects).length > 0) {
    effects.push(annualDirective.monthlyEffects);
  }
  if (Object.keys(officeMonthlyEffects).length > 0) effects.push(officeMonthlyEffects);
  if (Object.keys(officeSynergyEffects).length > 0) effects.push(officeSynergyEffects);
  if (Object.keys(officeZoneEffects).length > 0) effects.push(officeZoneEffects);
  if (Object.keys(deckSynergyEffects).length > 0) effects.push(deckSynergyEffects);

  if (effects.length === 0) return undefined;
  return effects.reduce<ResourceMap>((combined, effect) => mergeResourceDelta(combined, effect), {});
}

function getOfficeSynergyTimelineEntry(state: GameState): string | undefined {
  const activeSynergies = getOfficeSynergySummary(state).active;
  if (activeSynergies.length === 0) return undefined;

  return `사무실 시너지: ${activeSynergies.map((synergy) => synergy.title).join(", ")}`;
}

function getOfficeZoneTimelineEntry(state: GameState): string | undefined {
  const zonePlan = getOfficeZonePlan(state);
  if (zonePlan.active.length === 0) return undefined;

  return `사무실 구획: ${zonePlan.active.slice(0, 3).map((zone) => zone.title).join(", ")} 가동`;
}

function getOfficeMonthlyTimelineEntry(state: GameState): string | undefined {
  const effects = getOfficeMonthlyEffects(state);
  if (Object.keys(effects).length === 0) return undefined;

  return `사무실 효과: ${getOfficeExpansion(state).name} (${formatResourceDelta(effects)})`;
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

function hydrateReleaseMoment(lastRelease: ReleaseMoment | undefined, generatedProducts: ProductDefinition[] = []): ReleaseMoment | undefined {
  if (!lastRelease) return undefined;
  if (lastRelease.growthPaths?.length) return lastRelease;

  const product = [...products, ...generatedProducts].find((entry) => entry.id === lastRelease.productId);
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

function hydrateRogueliteState(value: unknown, fallback: RogueliteState, generatedProducts: ProductDefinition[] = []): RogueliteState {
  if (!isRecord(value)) return fallback;

  const unlockedMetaIds = sanitizeStringArray(value.unlockedMetaIds);
  const deck = hydrateStrategyDeck(value.deck, fallback.deck);
  const cardIds = strategyCards.map((card) => card.id);

  return {
    runNumber: Math.max(1, Math.round(sanitizeNumber(value.runNumber, fallback.runNumber))),
    founderInsight: Math.max(0, Math.round(sanitizeNumber(value.founderInsight, fallback.founderInsight))),
    unlockedMetaIds,
    starterDeckId: typeof value.starterDeckId === "string" ? value.starterDeckId : fallback.starterDeckId,
    deck,
    deckEditTokens: Math.max(0, Math.round(sanitizeNumber(value.deckEditTokens, fallback.deckEditTokens))),
    upgradedCardIds: uniqueStrings(sanitizeStringArray(value.upgradedCardIds, cardIds)),
    rewardHistory: hydrateCardRewardHistory(value.rewardHistory),
    runHistory: hydrateRunHistory(value.runHistory),
    pendingCardReward: hydratePendingCardReward(value.pendingCardReward, generatedProducts),
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

function hydratePendingCardReward(value: unknown, generatedProducts: ProductDefinition[] = []): PendingCardReward | undefined {
  if (!isRecord(value)) return undefined;
  const product = typeof value.productId === "string"
    ? [...products, ...generatedProducts].find((entry) => entry.id === value.productId)
    : undefined;
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
    rewardBiasTags: sanitizeStringArray(value.rewardBiasTags),
  };
}

function hydratePendingAnnualDirectiveChoices(value: unknown): PendingAnnualDirectiveChoices | undefined {
  if (!isRecord(value)) return undefined;
  const reviewId = typeof value.reviewId === "string" ? value.reviewId : "";
  const review = annualReviews.find((entry) => entry.id === reviewId);
  const source = value.source === "passed" || value.source === "recovery" ? value.source : undefined;
  const annualDirectiveChoiceIds = annualDirectiveChoices.map((choice) => choice.id);
  const offeredDirectiveIds = uniqueStrings(sanitizeStringArray(value.offeredDirectiveIds, annualDirectiveChoiceIds)).slice(0, 3);

  if (!review || !source || offeredDirectiveIds.length === 0) return undefined;

  return {
    reviewId,
    year: Math.max(1, Math.round(sanitizeNumber(value.year, review.year))),
    month: Math.max(1, Math.round(sanitizeNumber(value.month, review.month))),
    source,
    offeredDirectiveIds,
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

function getHiredAgentType(agent: HiredAgent): AgentTypeDefinition | undefined {
  return agentTypes.find((agentType) => agentType.id === agent.typeId);
}

function getAgentTraitLabel(agentType: AgentTypeDefinition | undefined): string {
  if (!agentType) return "성장 대기 인력";
  const topStat = getAgentGrowthFocusStats(agentType)[0];
  const kind = getAgentKind(agentType);
  const kindLabel = kind === "human" ? "사람" : kind === "robot" ? "로봇" : "AI";
  const focusLabel = getStatKoreanLabel(topStat);

  return `${focusLabel}형 ${kindLabel}`;
}

function getAgentGrowthFocusStats(agentType: AgentTypeDefinition | undefined): Array<keyof AgentStats> {
  const baseStats = agentType?.stats ?? createEmptyStats();

  return [...statKeys]
    .sort((left, right) => baseStats[right] - baseStats[left] || statKeys.indexOf(left) - statKeys.indexOf(right))
    .slice(0, 2);
}

function getPreferredItemStatBonus(agent: HiredAgent, agentType: AgentTypeDefinition | undefined): Partial<AgentStats> {
  const matchCount = getMatchedPreferredItemCount(agent, agentType);
  if (matchCount <= 0) return {};

  return Object.fromEntries(getAgentGrowthFocusStats(agentType).map((stat) => [stat, matchCount])) as Partial<AgentStats>;
}

function getPreferredItemLoyaltyBonus(agent: HiredAgent, agentType: AgentTypeDefinition | undefined): number {
  return Math.min(2, getMatchedPreferredItemCount(agent, agentType));
}

function getSpecializationStatEffect(agent: HiredAgent): Partial<AgentStats> {
  const stat = getAgentSpecializationStat(agent);
  if (!stat) return {};

  return { [stat]: getAgentSpecializationStatBonus(agent) } as Partial<AgentStats>;
}

function getAgentSpecializationStatBonus(agent: HiredAgent): number {
  return sanitizeAgentLevel(agent.level) >= 6 ? 3 : 2;
}

function getAgentSpecializationStat(agent: HiredAgent): keyof AgentStats | undefined {
  return statKeys.includes(agent.specializationStat as keyof AgentStats)
    ? (agent.specializationStat as keyof AgentStats)
    : undefined;
}

function getMatchedPreferredItemCount(agent: HiredAgent, agentType: AgentTypeDefinition | undefined): number {
  const preferredItemIds = new Set(agentType?.preferred_items ?? []);
  return agent.equippedItemIds.filter((itemId) => preferredItemIds.has(itemId)).length;
}

function getStatKoreanLabel(stat: keyof AgentStats): string {
  const labels: Record<keyof AgentStats, string> = {
    research: "연구",
    engineering: "개발",
    product: "제품",
    growth: "성장",
    safety: "안전",
    operations: "운영",
    creativity: "창의",
    autonomy: "자율",
  };

  return labels[stat];
}

function sanitizeAgentLevel(level: number | undefined): number {
  return Math.round(clamp(level ?? 1, 1, 10));
}

function getAgentLevelStatBonus(level: number | undefined): number {
  return Math.max(0, sanitizeAgentLevel(level) - 1);
}

function getAgentLevelStatEffects(baseStats: AgentStats, level: number | undefined): Partial<AgentStats> {
  const bonus = getAgentLevelStatBonus(level);
  if (bonus <= 0) return {};

  return Object.fromEntries(
    [...statKeys]
      .sort((left, right) => baseStats[right] - baseStats[left])
      .slice(0, 3)
      .map((stat) => [stat, bonus]),
  ) as Partial<AgentStats>;
}

function getAgentNextLevelExperience(level: number): number {
  return Math.max(3, sanitizeAgentLevel(level) * 3);
}

function getInitialAgentLoyalty(channelId?: string): number {
  if (channelId === "headhunter") return 66;
  if (channelId === "career_recruiting") return 74;
  return 82;
}

function getAgentLoyalty(agent: HiredAgent): number {
  return Math.round(clamp(agent.loyalty ?? getInitialAgentLoyalty(agent.recruitmentChannelId), 0, 100));
}

function getMonthlyAgentLoyaltyDelta(agent: HiredAgent, state: GameState, assigned: boolean, nextEnergy: number): number {
  let delta = agent.recruitmentChannelId === "open_recruiting" ? 1 : 0;

  if ((agent.salaryMultiplier ?? 1) >= 1.7) delta -= 2;
  else if ((agent.salaryMultiplier ?? 1) >= 1.3) delta -= 1;
  if ((state.resources.cash ?? 0) < 0) delta -= 4;
  if (assigned && nextEnergy < 35) delta -= 3;
  if (!assigned && nextEnergy >= 80) delta += 1;
  if ((state.resources.trust ?? 50) >= 70) delta += 1;
  delta += getPreferredItemLoyaltyBonus(agent, getHiredAgentType(agent));

  return delta;
}

function getRetentionSeverity(loyalty: number): AgentCareerStatus["retentionSeverity"] {
  if (loyalty < 30) return "critical";
  if (loyalty < 45) return "warning";
  if (loyalty < 60) return "watch";
  return "stable";
}

function getRetentionRiskLabel(severity: AgentCareerStatus["retentionSeverity"]): string {
  if (severity === "critical") return "이직 위험";
  if (severity === "warning") return "협상 필요";
  if (severity === "watch") return "주의";
  return "안정";
}

function getStaffIncidentSeverityScore(incident: StaffIncidentBrief): number {
  const typeWeight = incident.type === "poaching" ? 3 : incident.type === "burnout" ? 2 : 1;
  return (incident.severity === "critical" ? 100 : 50) + typeWeight;
}

interface StaffIncidentAftermathEffect {
  incident: StaffIncidentBrief;
  resourceDelta: ResourceMap;
  energyDelta: number;
  loyaltyDelta: number;
  competitorMomentumDelta: number;
  projectProgressPenalty: number;
  projectQualityPenalty: number;
  effectLabel: string;
  summary: string;
  mitigationLabel?: string;
}

function applyUnresolvedStaffIncidentAftermaths(targetState: GameState, sourceState: GameState, appliedMonth: number): GameState {
  const effects = getStaffIncidentAftermathEffects(sourceState);
  if (!effects.length) return targetState;

  const agentDeltas = new Map<string, { energy: number; loyalty: number }>();
  const projectImpactLabels = new Map<string, string>();
  const projectImpactSummaries: string[] = [];
  const staffAftermathResourceDelta = effects.reduce((total, effect) => mergeResourceDelta(total, effect.resourceDelta), {} as ResourceMap);
  let resourcesAftermath = targetState.resources;
  let competitorStatesAftermath = targetState.competitorStates;
  let productProjectsAftermath = targetState.productProjects;

  for (const effect of effects) {
    resourcesAftermath = applyResourceDelta(resourcesAftermath, effect.resourceDelta);
    const currentDelta = agentDeltas.get(effect.incident.agentId) ?? { energy: 0, loyalty: 0 };
    agentDeltas.set(effect.incident.agentId, {
      energy: currentDelta.energy + effect.energyDelta,
      loyalty: currentDelta.loyalty + effect.loyaltyDelta,
    });

    if (effect.competitorMomentumDelta !== 0 && effect.incident.sourceCompetitorId) {
      competitorStatesAftermath = competitorStatesAftermath.map((competitor) =>
        competitor.id === effect.incident.sourceCompetitorId
          ? { ...competitor, momentum: competitor.momentum + effect.competitorMomentumDelta, lastMove: `${effect.incident.agentName} 스카우트 압박 강화` }
          : competitor,
      );
    }

    const assignedProject = productProjectsAftermath.find((project) => project.assignedAgentIds.includes(effect.incident.agentId));
    if (assignedProject && (effect.projectProgressPenalty > 0 || effect.projectQualityPenalty > 0)) {
      const product = getProductDefinition(assignedProject.productId, targetState);
      const projectName = product?.name ?? "개발 프로젝트";
      const impactLabel = `${projectName} 프로젝트 진행 -${effect.projectProgressPenalty} · 완성도 -${effect.projectQualityPenalty}`;
      projectImpactLabels.set(effect.incident.agentId, impactLabel);
      projectImpactSummaries.push(`${effect.incident.agentName}: ${projectName} 완성도 -${effect.projectQualityPenalty}`);
      productProjectsAftermath = productProjectsAftermath.map((project) =>
        project.id === assignedProject.id
          ? {
              ...project,
              progress: clamp(project.progress - effect.projectProgressPenalty, 0, 100),
              quality: clamp(project.quality - effect.projectQualityPenalty, 0, 100),
            }
          : project,
      );
    }
  }

  const nextAgents = targetState.hiredAgents.map((agent) => {
    const delta = agentDeltas.get(agent.id);
    if (!delta) return agent;

    return {
      ...agent,
      energy: clamp(Math.round(agent.energy) + delta.energy, 0, 100),
      loyalty: clamp(getAgentLoyalty(agent) + delta.loyalty, 0, 100),
    };
  });
  const aftermathRecords = effects.map((effect, index): StaffIncidentResolutionLogEntry => {
    const projectImpactLabel = projectImpactLabels.get(effect.incident.agentId);
    return {
      id: `staff-aftermath-${appliedMonth}-${effect.incident.agentId}-${index + 1}`,
      month: appliedMonth,
      agentId: effect.incident.agentId,
      agentName: effect.incident.agentName,
      incidentType: effect.incident.type,
      incidentTitle: effect.incident.title,
      severity: effect.incident.severity,
      resolutionId: "unresolved_aftermath",
      resolutionLabel: "미대응 후폭풍",
      summary: projectImpactLabel ? `${effect.summary} ${projectImpactLabel} 손실이 개발 일정에 반영됐습니다.` : effect.summary,
      effectLabel: [effect.effectLabel, effect.mitigationLabel, projectImpactLabel].filter(Boolean).join(" · "),
      projectImpactLabel,
      isAftermath: true,
      sourceCompetitorId: effect.incident.sourceCompetitorId,
      sourceCompetitorName: effect.incident.sourceCompetitorName,
      offerLabel: effect.incident.offerLabel,
      stakesLabel: effect.incident.stakesLabel,
    };
  });
  const timelineEntries = aftermathRecords.map((record) => `인사 후폭풍: ${record.agentName} · ${record.effectLabel}`);
  const staffAftermathSummary = createStaffAftermathMonthlySummary(
    effects.length,
    projectImpactSummaries,
    staffAftermathResourceDelta,
    effects.map((effect) => effect.mitigationLabel).filter((label): label is string => Boolean(label)),
  );

  return {
    ...targetState,
    resources: resourcesAftermath,
    competitorStates: competitorStatesAftermath,
    productProjects: productProjectsAftermath,
    hiredAgents: nextAgents,
    lastMonthReport: targetState.lastMonthReport
      ? {
          ...targetState.lastMonthReport,
          staffAftermathCount: effects.length,
          staffAftermathSummary,
          staffAftermathResourceDelta,
          staffAftermathProjectImpact: projectImpactSummaries.length ? projectImpactSummaries.slice(0, 2).join(" / ") : undefined,
        }
      : targetState.lastMonthReport,
    recentStaffIncidentResolutions: [...aftermathRecords, ...(targetState.recentStaffIncidentResolutions ?? [])].slice(0, 6),
    timeline: [...timelineEntries, ...targetState.timeline].slice(0, 8),
  };
}

function createStaffAftermathMonthlySummary(
  effectCount: number,
  projectImpactSummaries: string[],
  resourceDelta: ResourceMap,
  mitigationLabels: string[] = [],
): string {
  const impactText = projectImpactSummaries.length
    ? `프로젝트 손실 ${projectImpactSummaries.slice(0, 2).join(" / ")}`
    : "직원 컨디션/충성도 손실";
  const resourceText = Object.keys(resourceDelta).length ? ` · 자원 ${formatResourceDelta(resourceDelta)}` : "";
  const mitigationText = mitigationLabels.length ? ` · ${[...new Set(mitigationLabels)].join(" / ")}` : "";
  return `${effectCount}건 후폭풍 · ${impactText}${resourceText}${mitigationText}`;
}

function getStaffIncidentAftermathEffects(state: GameState, limit = 2): StaffIncidentAftermathEffect[] {
  const selectedIncidents: StaffIncidentBrief[] = [];
  const affectedAgentIds = new Set<string>();

  for (const incident of getStaffIncidentBriefs(state)) {
    if (affectedAgentIds.has(incident.agentId)) continue;
    selectedIncidents.push(incident);
    affectedAgentIds.add(incident.agentId);
    if (selectedIncidents.length >= limit) break;
  }

  return selectedIncidents
    .map((incident) => {
      const agent = state.hiredAgents.find((entry) => entry.id === incident.agentId);
      return agent ? createStaffIncidentAftermathEffect(incident, agent, state) : undefined;
    })
    .filter((effect): effect is StaffIncidentAftermathEffect => Boolean(effect));
}

function createStaffIncidentAftermathEffect(incident: StaffIncidentBrief, agent: HiredAgent, state: GameState): StaffIncidentAftermathEffect {
  if (incident.type === "burnout") {
    return applyStaffAftermathMitigation({
      incident,
      resourceDelta: {},
      energyDelta: -14,
      loyaltyDelta: -4,
      competitorMomentumDelta: 0,
      projectProgressPenalty: balance.staff_aftermath_burnout_project_progress_penalty,
      projectQualityPenalty: balance.staff_aftermath_burnout_project_quality_penalty,
      effectLabel: "체력 -14 · 충성 -4",
      summary: `${agent.name}의 번아웃 위험을 넘겨 체력과 충성도가 동시에 흔들렸습니다. 다음 달 개발 배치 전 회복이 필요합니다.`,
    }, state);
  }

  if (incident.type === "poaching") {
    return applyStaffAftermathMitigation({
      incident,
      resourceDelta: { hype: -1 },
      energyDelta: 0,
      loyaltyDelta: -12,
      competitorMomentumDelta: 8,
      projectProgressPenalty: balance.staff_aftermath_poaching_project_progress_penalty,
      projectQualityPenalty: balance.staff_aftermath_poaching_project_quality_penalty,
      effectLabel: `충성 -12 · ${incident.sourceCompetitorName ?? "경쟁사"} 모멘텀 +8`,
      summary: `${incident.sourceCompetitorName ?? "경쟁사"}의 스카우트 제안을 방치해 ${agent.name}의 충성도가 떨어지고 경쟁사 모멘텀이 올랐습니다.`,
    }, state);
  }

  const frictionCost = Math.max(120, Math.round((getHiredAgentMonthlyUpkeep(agent).cash ?? 200) * 0.35));
  return applyStaffAftermathMitigation({
    incident,
    resourceDelta: { cash: -frictionCost, trust: -1 },
    energyDelta: 0,
    loyaltyDelta: -8,
    competitorMomentumDelta: 0,
    projectProgressPenalty: balance.staff_aftermath_discontent_project_progress_penalty,
    projectQualityPenalty: balance.staff_aftermath_discontent_project_quality_penalty,
    effectLabel: `충성 -8 · 현금 ${formatMoney(-frictionCost)} · 신뢰 -1`,
    summary: `${agent.name}의 계약 불만을 넘겨 보상성 비용과 신뢰 손실이 발생했습니다. 다음 불만은 더 빨리 커질 수 있습니다.`,
  }, state);
}

function applyStaffAftermathMitigation(effect: StaffIncidentAftermathEffect, state: GameState): StaffIncidentAftermathEffect {
  if (!isOfficeZoneActive(state, "retention_lounge")) return effect;

  const softenNegative = (value: number) => (value < 0 ? -Math.max(1, Math.ceil(Math.abs(value) * 0.55)) : value);
  const softenPenalty = (value: number) => Math.max(0, Math.floor(value * 0.55));
  const resourceDelta = Object.fromEntries(
    Object.entries(effect.resourceDelta).map(([resourceId, amount]) => [resourceId, softenNegative(amount)]),
  );

  return {
    ...effect,
    resourceDelta,
    energyDelta: softenNegative(effect.energyDelta),
    loyaltyDelta: softenNegative(effect.loyaltyDelta),
    competitorMomentumDelta: effect.competitorMomentumDelta > 0 ? Math.max(1, Math.floor(effect.competitorMomentumDelta * 0.65)) : effect.competitorMomentumDelta,
    projectProgressPenalty: softenPenalty(effect.projectProgressPenalty),
    projectQualityPenalty: softenPenalty(effect.projectQualityPenalty),
    effectLabel: `${effect.effectLabel} 완충`,
    summary: `${effect.summary} 복지 라운지가 후폭풍 일부를 흡수했습니다.`,
    mitigationLabel: "복지 라운지 완충",
  };
}

function createStaffIncidentResolutionRecord(
  state: GameState,
  incident: StaffIncidentBrief,
  agent: HiredAgent,
  option: Omit<StaffIncidentResolutionOption, "available" | "reasons">,
  resolutionId: StaffIncidentResolutionId,
): StaffIncidentResolutionLogEntry {
  return {
    id: `staff-resolution-${state.month}-${incident.agentId}-${resolutionId}-${(state.recentStaffIncidentResolutions ?? []).length + 1}`,
    month: state.month,
    agentId: incident.agentId,
    agentName: agent.name,
    incidentType: incident.type,
    incidentTitle: incident.title,
    severity: incident.severity,
    resolutionId,
    resolutionLabel: option.label,
    summary: getStaffIncidentResolutionSummary(agent, incident, option, resolutionId),
    effectLabel: option.effectLabel,
    sourceCompetitorId: incident.sourceCompetitorId,
    sourceCompetitorName: incident.sourceCompetitorName,
    offerLabel: incident.offerLabel,
    stakesLabel: incident.stakesLabel,
  };
}

function getStaffIncidentResolutionSummary(
  agent: HiredAgent,
  incident: StaffIncidentBrief,
  option: Omit<StaffIncidentResolutionOption, "available" | "reasons">,
  resolutionId: StaffIncidentResolutionId,
): string {
  if (resolutionId === "recovery_day") {
    return `${agent.name}에게 ${option.label}을 실행해 프로젝트 배치 해제와 컨디션 회복을 처리했습니다.`;
  }

  if (resolutionId === "backup_shift") {
    return `${agent.name}에게 ${option.label}를 붙여 ${incident.title}을 완화하고 현재 개발 배치를 유지했습니다.`;
  }

  if (resolutionId === "retention_bonus") {
    if (incident.sourceCompetitorName) {
      return `${agent.name}에게 ${option.label}를 지급해 ${incident.sourceCompetitorName}의 스카우트 제안을 막았습니다. ${incident.stakesLabel ?? "경쟁 압박"} 대응으로 장기 연봉 압박이 커졌습니다.`;
    }
    return `${agent.name}에게 ${option.label}를 지급해 스카우트 제안을 막았지만 장기 연봉 압박이 커졌습니다.`;
  }

  if (resolutionId === "mission_pitch") {
    if (incident.sourceCompetitorName) {
      return `${agent.name}에게 창업 미션을 다시 설명해 ${incident.sourceCompetitorName}의 제안을 비용 없이 흔들었습니다. ${incident.stakesLabel ?? "경쟁 압박"}은 계속 감시해야 합니다.`;
    }
    return `${agent.name}에게 창업 미션을 다시 설명해 비용 없이 이탈 위험을 낮췄습니다.`;
  }

  if (resolutionId === "contract_review") {
    return `${agent.name}의 조건을 재조정해 계약 불만을 줄였지만 월 유지비가 소폭 올랐습니다.`;
  }

  return `${agent.name}와 1:1 면담을 진행해 계약 불만을 듣고 단기 신뢰를 회복했습니다.`;
}

function getStaffIncidentBaseResolutionOptions(incident: StaffIncidentBrief, agent: HiredAgent): Array<Omit<StaffIncidentResolutionOption, "available" | "reasons">> {
  const restCost = getAgentRestCost(agent);
  const negotiationCost = getAgentSalaryNegotiationCost(agent);
  const lightContractCost = { cash: Math.max(250, Math.round((negotiationCost.cash ?? 500) * 0.45)) };
  const backupCost = { cash: Math.max(120, Math.round((getHiredAgentMonthlyUpkeep(agent).cash ?? 180) * 0.35)), compute: 4 };

  if (incident.type === "burnout") {
    return [
      {
        id: "recovery_day",
        label: "회복일 지정",
        description: "일정을 잠시 비우고 유급 회복 시간을 줍니다. 배치 중이면 프로젝트에서 빠집니다.",
        cost: restCost,
        effectLabel: "체력 +32 · 충성 +10 · 배치 해제",
        recommended: true,
      },
      {
        id: "backup_shift",
        label: "백업 교대",
        description: "외부 백업과 자동화를 붙여 당장 무너지지 않게 합니다. 배치는 유지됩니다.",
        cost: backupCost,
        effectLabel: "체력 +18 · 충성 +6 · 배치 유지",
        recommended: false,
      },
    ];
  }

  if (incident.type === "poaching") {
    return [
      {
        id: "retention_bonus",
        label: "리텐션 보너스",
        description: "보너스와 조건 조정으로 경쟁사 제안을 눌러 앉힙니다.",
        cost: negotiationCost,
        effectLabel: "충성 +24 · 연봉 상승",
        recommended: true,
      },
      {
        id: "mission_pitch",
        label: "창업 미션 설득",
        description: "돈보다 비전으로 붙잡습니다. 비용은 낮지만 효과도 작습니다.",
        cost: {},
        effectLabel: "충성 +12 · 화제성 +2",
        recommended: false,
      },
    ];
  }

  return [
    {
      id: "contract_review",
      label: "조건 재조정",
      description: "계약 조건을 일부 조정해 불만이 더 커지기 전에 막습니다.",
      cost: lightContractCost,
      effectLabel: "충성 +16 · 연봉 소폭 상승",
      recommended: true,
    },
    {
      id: "one_on_one",
      label: "1:1 면담",
      description: "시간을 써서 불만의 원인을 듣고 단기 신뢰를 회복합니다.",
      cost: {},
      effectLabel: "충성 +8 · 체력 +4 · 신뢰 +1",
      recommended: false,
    },
  ];
}

function applyStaffIncidentResolutionToAgent(agent: HiredAgent, resolutionId: StaffIncidentResolutionId): HiredAgent {
  if (resolutionId === "recovery_day") {
    return {
      ...agent,
      assignment: undefined,
      energy: clamp(agent.energy + 32, 0, 100),
      loyalty: clamp(getAgentLoyalty(agent) + 10, 0, 100),
    };
  }

  if (resolutionId === "backup_shift") {
    return {
      ...agent,
      energy: clamp(agent.energy + 18, 0, 100),
      loyalty: clamp(getAgentLoyalty(agent) + 6, 0, 100),
    };
  }

  if (resolutionId === "retention_bonus") {
    return applyAgentSalaryAdjustment(agent, 0.1, 24);
  }

  if (resolutionId === "mission_pitch") {
    return {
      ...agent,
      energy: clamp(agent.energy + 2, 0, 100),
      loyalty: clamp(getAgentLoyalty(agent) + 12, 0, 100),
    };
  }

  if (resolutionId === "contract_review") {
    return applyAgentSalaryAdjustment(agent, 0.05, 16);
  }

  return {
    ...agent,
    energy: clamp(agent.energy + 4, 0, 100),
    loyalty: clamp(getAgentLoyalty(agent) + 8, 0, 100),
  };
}

function applyAgentSalaryAdjustment(agent: HiredAgent, salaryDelta: number, loyaltyDelta: number): HiredAgent {
  return {
    ...agent,
    loyalty: clamp(getAgentLoyalty(agent) + loyaltyDelta, 0, 100),
    salaryMultiplier: Number(((agent.salaryMultiplier ?? 1) + salaryDelta).toFixed(2)),
    upkeep: scaleResourceMap(getHiredAgentMonthlyUpkeep(agent), 1 + salaryDelta),
  };
}

function getStaffIncidentResolutionResourceDelta(resolutionId: StaffIncidentResolutionId): ResourceMap {
  if (resolutionId === "mission_pitch") return { hype: 2 };
  if (resolutionId === "one_on_one") return { trust: 1 };
  return {};
}

function getStaffPoachingOffer(state: GameState, agent: HiredAgent, level: number): Pick<StaffIncidentBrief, "sourceCompetitorId" | "sourceCompetitorName" | "offerLabel" | "stakesLabel"> {
  const pressure = getStrongestCompetitorPressure(state);
  const monthlyUpkeep = getHiredAgentMonthlyUpkeep(agent).cash ?? 180;
  const offerMultiplier = Number((1.15 + Math.min(0.7, pressure.marketShare / 100 + pressure.aggression * 0.04 + level * 0.03)).toFixed(2));
  const signingBonus = Math.max(600, Math.round(monthlyUpkeep * offerMultiplier * 2));
  const momentumLabel = pressure.momentum >= 0 ? `+${pressure.momentum}` : `${pressure.momentum}`;

  return {
    sourceCompetitorId: pressure.id,
    sourceCompetitorName: pressure.name,
    offerLabel: `제안 조건: 연봉 x${offerMultiplier} · 사이닝 ${formatMoney(signingBonus)}`,
    stakesLabel: `${pressure.name} 점유 ${pressure.marketShare}% · 모멘텀 ${momentumLabel}`,
  };
}

function getStrongestCompetitorPressure(state: GameState): {
  id: string;
  name: string;
  marketShare: number;
  score: number;
  momentum: number;
  aggression: number;
} {
  const strongest = [...state.competitorStates].sort((left, right) => right.marketShare - left.marketShare || right.score - left.score)[0];
  const definition = strongest ? competitors.find((competitor) => competitor.id === strongest.id) : competitors[0];
  return {
    id: strongest?.id ?? definition?.id ?? "unknown_competitor",
    name: definition ? t(definition.name_key, "ko") : "경쟁사",
    marketShare: strongest?.marketShare ?? definition?.starting_market_share ?? 0,
    score: strongest?.score ?? definition?.starting_score ?? 0,
    momentum: strongest?.momentum ?? 0,
    aggression: definition?.aggression ?? 2,
  };
}

function getRecruitmentPoolSize(channelId: RecruitmentChannelId, state: GameState): number {
  const starBonus = Math.max(0, getCompanyStarRating(state) - 1);
  const brandBonus = getRecruitmentBrandProfile(state).candidatePoolBonus;
  const roboticsBonus = isOfficeZoneActive(state, "robotics_bay") && channelId !== "open_recruiting" ? 1 : 0;

  if (channelId === "headhunter") return Math.min(7, 3 + Math.floor(starBonus / 2) + brandBonus + roboticsBonus);
  if (channelId === "career_recruiting") return Math.min(8, 4 + Math.floor(starBonus / 2) + brandBonus + roboticsBonus);
  return Math.min(8, 5 + Math.floor(starBonus / 2) + Math.min(1, brandBonus));
}

function isRecruitmentPoolCompatible(agent: AgentTypeDefinition, channelId: RecruitmentChannelId, state: GameState): boolean {
  const kind = getAgentKind(agent);
  const star = getCompanyStarRating(state);

  if (channelId === "headhunter" && star < 2 && kind !== "human") return false;
  if (channelId === "open_recruiting" && star <= 1 && kind === "robot") return false;
  return true;
}

function getRecruitmentCandidateScore(agent: AgentTypeDefinition, channelId: RecruitmentChannelId, state: GameState): number {
  const kind = getAgentKind(agent);
  const location = getCurrentLocation(state);
  const brandProfile = getRecruitmentBrandProfile(state);
  const statTotal = statKeys.reduce((total, stat) => total + agent.stats[stat], 0);
  const rarityScore = getAgentRarityScore(agent.rarity);
  const star = getCompanyStarRating(state);
  let score = statTotal + rarityScore + star * 2 + Math.floor(brandProfile.score / 12);

  if (channelId === "open_recruiting") {
    score += kind === "human" ? 26 : 8;
    score += agent.rarity === "common" ? 14 : -rarityScore;
    score += kind === "human" && location.human_hire_discount > 0 ? 8 : 0;
  }

  if (channelId === "career_recruiting") {
    score += kind === "human" ? 14 : 16;
    score += agent.rarity === "rare" ? 10 : agent.rarity === "epic" ? 8 : 2;
    score += location.ai_operation_bonus > 0 && kind === "ai_agent" ? location.ai_operation_bonus * 3 : 0;
    score += isOfficeZoneActive(state, "robotics_bay") && kind === "robot" ? 90 : 0;
  }

  if (channelId === "headhunter") {
    score += rarityScore * 2;
    score += kind === "robot" ? 14 : kind === "ai_agent" ? 12 : 8;
    score += location.monthly_cost_modifier > 1 ? 8 : 0;
    score += isOfficeZoneActive(state, "robotics_bay") && kind === "robot" ? 72 : 0;
  }

  return score;
}

function getRecruitmentBrandGradeLabel(score: number): string {
  if (score >= 86) return `세계급 채용 브랜드 ${score}`;
  if (score >= 70) return `강한 채용 브랜드 ${score}`;
  if (score >= 50) return `성장 채용 브랜드 ${score}`;
  return `지역 채용 브랜드 ${score}`;
}

function getAgentRarityScore(rarity: string): number {
  if (rarity === "legendary") return 36;
  if (rarity === "epic") return 24;
  if (rarity === "rare") return 14;
  return 4;
}

function getRecruitmentRotationScore(agent: AgentTypeDefinition, channelId: RecruitmentChannelId, state: GameState): number {
  return hashString(`${state.month}:${state.locationId}:${channelId}:${agent.id}`) % 1000;
}

function applyHumanLocationHireModifier(cost: ResourceMap, state: GameState): ResourceMap {
  const location = getCurrentLocation(state);
  const multiplier = Math.max(0.5, 1 - location.human_hire_discount);

  if (cost.cash === undefined) return { ...cost };
  return { ...cost, cash: Math.round(cost.cash * multiplier) };
}

function scaleResourceMap(resourcesToScale: ResourceMap = {}, multiplier: number): ResourceMap {
  return Object.fromEntries(
    Object.entries(resourcesToScale).map(([resourceId, amount]) => [resourceId, Math.max(0, Math.round(amount * multiplier))]),
  );
}

function hashString(value: string): number {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function appendCostReasons(reasons: string[], cost: ResourceMap = {}, state: GameState): void {
  for (const [resourceId, amount] of Object.entries(cost)) {
    if ((state.resources[resourceId] ?? 0) < amount) {
      const resourceName = resources[resourceId]?.name ?? resourceId;
      reasons.push(`${resourceName} 부족`);
    }
  }
}
