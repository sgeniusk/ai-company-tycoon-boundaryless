export type ResourceMap = Record<string, number>;
export type CapabilityMap = Record<string, number>;

export interface ResourceDefinition {
  id: string;
  name: string;
  description: string;
  initial_value: number;
  min_value: number;
  max_value: number;
  format: string;
  category: string;
}

export interface ProductDefinition {
  id: string;
  name: string;
  description: string;
  domain: string;
  required_capabilities: Record<string, number>;
  launch_cost: ResourceMap;
  base_revenue: number;
  base_users_per_month: number;
  compute_per_1000_users: number;
  data_generated_per_month: number;
  hype_on_launch: number;
  trust_requirement: number;
  level: number;
  max_level: number;
  upgrade_cost_multiplier: number;
  tags: string[];
}

export interface ProductIdeaSubjectDefinition {
  id: string;
  name: string;
  description: string;
  domain: string;
  tags: string[];
  capability_bias: Record<string, number>;
  market_heat: number;
  risk: number;
}

export interface ProductIdeaTypeDefinition {
  id: string;
  name: string;
  description: string;
  tags: string[];
  capability_bias: Record<string, number>;
  cost_multiplier: number;
  score_bonus: number;
}

export interface ProductIdeaBoldOptionDefinition {
  id: string;
  name: string;
  description: string;
  tags: string[];
  cost_multiplier: number;
  score_delta: number;
  risk_delta: number;
}

export interface ProductIdeaCompatibilityRuleDefinition {
  id: string;
  subject_tags?: string[];
  type_tags?: string[];
  option_tags?: string[];
  title_prefix?: string;
  pitch?: string;
  score_bonus: number;
  strengths: string[];
  risks: string[];
}

export interface ProductIdeaDatabaseDefinition {
  subjects: ProductIdeaSubjectDefinition[];
  product_types: ProductIdeaTypeDefinition[];
  bold_options: ProductIdeaBoldOptionDefinition[];
  compatibility_rules: ProductIdeaCompatibilityRuleDefinition[];
}

export interface CapabilityDefinition {
  id: string;
  name: string;
  description: string;
  max_level: number;
  upgrade_costs: ResourceMap[];
  unlocks_domains?: Record<string, string>;
  effects_per_level?: ResourceMap;
}

export interface DomainDefinition {
  id: string;
  name: string;
  description: string;
  unlocked_by_default: boolean;
  unlock_requirements: Record<string, number>;
  market_size: string;
  risk_level: string;
}

export interface CompanyStageDefinition {
  id: string;
  name: string;
  description: string;
  requirements: Record<string, number>;
  order: number;
}

export interface CompanyLocationDefinition {
  id: string;
  name: string;
  region: string;
  description: string;
  talent_pool: string;
  monthly_cost_modifier: number;
  human_hire_discount: number;
  ai_operation_bonus: number;
  cost: ResourceMap;
  unlock_requirements: Record<string, number>;
}

export interface CampaignShockDefinition {
  id: string;
  month: number;
  year: number;
  title: string;
  description: string;
  pressure_summary: string;
  milestone_label: string;
  shareable_hook: string;
  resource_effects: ResourceMap;
  rival_momentum_delta: number;
  rival_focus_domains: string[];
  recommended_product_ids: string[];
  recommended_capability_ids: string[];
  unlock_domain_ids: string[];
}

export interface EventChoiceDefinition {
  id: string;
  text: string;
  effects: ResourceMap;
  description: string;
}

export interface EventDefinition {
  id: string;
  name: string;
  description: string;
  conditions: Record<string, number>;
  weight: number;
  choices: EventChoiceDefinition[];
}

export interface CompetitorDefinition {
  id: string;
  name_key: string;
  tagline_key: string;
  archetype_key: string;
  focus_domains: string[];
  color: string;
  starting_score: number;
  starting_market_share: number;
  monthly_growth: number;
  aggression: number;
  weakness_key: string;
  entry_month?: number;
  rival_tier?: "initial" | "annual_challenger" | "late_boss";
  entry_announcement?: string;
}

export interface CompetitorState {
  id: string;
  score: number;
  marketShare: number;
  momentum: number;
  claimedProducts: string[];
  researchLevel: number;
  lastMove: string;
}

// v0.58 #2 — 시장 점유율 sparkline용 derive-only 히스토리. recalculateMarketShares 호출 직후 매월 1개 push, 최근 24개월 슬라이딩 윈도우.
export interface MarketShareHistoryEntry {
  month: number;
  player: number;
  topRivalShare: number;
  topRivalId?: string;
}

export interface RivalEventChoiceDefinition {
  id: string;
  text_key: string;
  description_key: string;
  effects: ResourceMap;
  competitor_effects: Record<string, number>;
}

export interface RivalEventDefinition {
  id: string;
  name_key: string;
  description_key: string;
  conditions: Record<string, number>;
  competitor_id: string;
  choices: RivalEventChoiceDefinition[];
}

export interface SpriteGridDefinition {
  tile_size: number;
  character_frame_size: number;
  portrait_size: number;
  icon_size: number;
  competitor_logo_size: number;
}

export interface SpriteAnimationDefinition {
  duration_ms?: number;
  frames: number;
  row: number;
}

export type AgentSpriteAnimationKey = "idle" | "work" | "card_use" | "cheer" | "alert";

export interface AgentSpriteDefinition {
  agent_type_id: string;
  source_status: "placeholder" | "draft" | "final";
  body_class: string;
  sheet_id?: string;
  palette: string[];
  animations: Record<AgentSpriteAnimationKey, SpriteAnimationDefinition>;
  portrait_hint: string;
  prop_hint: string;
}

export interface CompetitorIdentityDefinition {
  competitor_id: string;
  source_status: "placeholder" | "draft" | "final";
  logo_class: string;
  logo_size: number;
  palette: string[];
  mascot_hint: string;
}

export interface OfficeObjectAssetDefinition {
  object_id: string;
  source_status: "placeholder" | "draft" | "final";
  tile_size: number;
  footprint: [number, number];
  readable_shape: string;
  palette: string[];
  linked_item_id?: string;
  sheet_id?: string;
  sheet_index?: number;
}

export interface ItemIconDefinition {
  item_id: string;
  source_status: "placeholder" | "draft" | "final";
  icon_class: string;
  icon_size: number;
  palette: string[];
  readable_shape: string;
}

export interface SpriteSheetDefinition {
  path: string;
  source_path?: string;
  source_status: "placeholder" | "draft" | "final";
  density?: number;
  source_scale?: number;
  source_frame_width?: number;
  source_frame_height?: number;
  normalized_from?: string;
  source_origin?: string;
  import_pipeline?: string;
  normalization_method?: string;
  anchor_reference?: "bottom-center" | "center" | string;
  anchor_tolerance_px?: number;
  silhouette_drift_tolerance_px?: number;
  frame_width: number;
  frame_height: number;
  columns: number;
  rows: number;
  frame_count: number;
  preview_frames?: number[];
  slice_mode: string;
}

export interface SceneBackdropDefinition {
  path: string;
  source_path?: string;
  source_status: "placeholder" | "draft" | "final";
  width: number;
  height: number;
  source_width?: number;
  source_height?: number;
  source_scale?: number;
  normalized_from?: string;
  source_origin?: string;
  import_pipeline?: string;
  normalization_method?: string;
  prompt_summary: string;
}

export interface VisualQaArtifactDefinition {
  scenario_url: string;
  source_art_status: string;
  desktop_screenshot_path: string;
  mobile_screenshot_path: string;
  report_path: string;
  required_viewports: Array<{
    id: string;
    width: number;
    height: number;
  }>;
  checks: string[];
}

export interface AssetManifestDefinition {
  version: string;
  sprite_grid: SpriteGridDefinition;
  sprite_sheets: Record<string, SpriteSheetDefinition>;
  scene_backdrops: Record<string, SceneBackdropDefinition>;
  visual_qa: Record<string, VisualQaArtifactDefinition>;
  agent_sprites: AgentSpriteDefinition[];
  competitor_identities: CompetitorIdentityDefinition[];
  office_objects: OfficeObjectAssetDefinition[];
  item_icons: ItemIconDefinition[];
}

export interface PlaytestPersonaDefinition {
  id: string;
  label: string;
  lens: string;
  gender_mix_slot: "male" | "female";
  benchmark: string;
  concern: string;
}

export interface MarketRanking {
  id: string;
  score: number;
  marketShare: number;
  isPlayer: boolean;
  lastMove: string;
}

export interface UpgradeDefinition {
  id: string;
  name: string;
  category: string;
  description: string;
  cost: ResourceMap;
  effects: ResourceMap;
  requirements: Record<string, number>;
  one_time: boolean;
}

export interface AutomationUpgradeDefinition {
  id: string;
  name: string;
  description: string;
  cost: ResourceMap;
  automation_gain: number;
  effects: ResourceMap;
  requirements: Record<string, number>;
  monthly_benefit: string;
}

export interface AchievementConditionDefinition {
  min_month?: number;
  min_products?: number;
  min_capability_upgrades?: number;
  min_growth_objectives?: number;
  min_resolved_events?: number;
  min_users?: number;
  min_cash?: number;
}

export interface AchievementDefinition {
  id: string;
  order: number;
  title: string;
  description: string;
  condition: AchievementConditionDefinition;
  reward: ResourceMap;
}

export interface AchievementStatus extends AchievementDefinition {
  unlocked: boolean;
  ready: boolean;
  progressLabel: string;
}

export interface AnnualReviewDefinition {
  id: string;
  year: number;
  month: number;
  title: string;
  description: string;
  requirements: Record<string, number>;
  reward: ResourceMap;
  consolation_reward: ResourceMap;
  spotlight: string;
  directive: {
    passed: AnnualReviewDirectiveTemplate;
    recovery: AnnualReviewDirectiveTemplate;
  };
}

export interface AnnualReviewDirectiveTemplate {
  title: string;
  description: string;
  monthly_effects: ResourceMap;
  recommended_menu: string;
  rival_momentum_delta: number;
}

export interface AnnualDirectiveChoiceDefinition extends AnnualReviewDirectiveTemplate {
  id: string;
  sources: AnnualDirectiveSource[];
  year_range: [number, number];
  tags: string[];
  reward_bias_tags: string[];
}

export interface AnnualReviewHistoryEntry {
  reviewId: string;
  year: number;
  month: number;
  passed: boolean;
  score: number;
  title: string;
  summary: string;
  reward: ResourceMap;
}

export type AnnualDirectiveSource = "passed" | "recovery";

export interface AnnualDirectiveState {
  reviewId: string;
  year: number;
  source: AnnualDirectiveSource;
  title: string;
  description: string;
  expiresMonth: number;
  monthlyEffects: ResourceMap;
  recommendedMenu: string;
  rivalMomentumDelta: number;
  rewardBiasTags: string[];
}

export interface PendingAnnualDirectiveChoices {
  reviewId: string;
  year: number;
  month: number;
  source: AnnualDirectiveSource;
  offeredDirectiveIds: string[];
}

export type StrategyCardCategory = "build" | "ops" | "product" | "safety" | "growth" | "research" | "automation";
export type StrategyCardRarity = "starter" | "common" | "uncommon" | "rare" | "epic";

export interface StrategyCardDefinition {
  id: string;
  name: string;
  category: StrategyCardCategory;
  rarity: StrategyCardRarity;
  description: string;
  cost: ResourceMap;
  effects: Record<string, number>;
  tags: string[];
  copies: number;
  unlock_meta_id?: string;
  unlock_requirements: Record<string, number>;
}

export interface DeckArchetypeDefinition {
  id: string;
  title: string;
  description: string;
  tags: string[];
  recommended_next_tags: string[];
  warning_missing_tags: string[];
}

export interface DeckArchetypeScore extends DeckArchetypeDefinition {
  matchScore: number;
  matchedTags: string[];
}

export interface DeckArchetypeSummary {
  primary: DeckArchetypeScore;
  secondary: DeckArchetypeScore[];
  recommendedNextTags: string[];
  warning: string;
}

export interface DeckSynergyDefinition {
  id: string;
  title: string;
  description: string;
  required_tags: Record<string, number>;
  monthly_effects: ResourceMap;
  play_effect_tags: string[];
  play_effect_multiplier: number;
  risk_label: string;
}

export interface DeckSynergyStatus extends DeckSynergyDefinition {
  active: boolean;
  progress: number;
  fulfilledTags: string[];
  missingTags: string[];
  monthlyEffects: ResourceMap;
  playEffectMultiplier: number;
}

export interface DeckSynergySummary {
  active: DeckSynergyStatus[];
  nextCandidates: DeckSynergyStatus[];
  totalMonthlyEffects: ResourceMap;
  bestPlayEffectMultiplier: number;
  activeTagLabels: string[];
  warning?: string;
}

export interface StarterDeckDefinition {
  id: string;
  title: string;
  description: string;
  required_meta_id?: string;
  card_ids: string[];
  tags: string[];
}

export interface StarterDeckOption extends StarterDeckDefinition {
  available: boolean;
  lockedReason?: string;
}

export interface StrategyDeckState {
  drawPile: string[];
  hand: string[];
  discardPile: string[];
  playedThisTurn: string[];
}

export interface PendingCardReward {
  id: string;
  productId: string;
  productName: string;
  month: number;
  reviewGrade: string;
  offeredCardIds: string[];
}

export interface CardRewardChoice {
  rewardId: string;
  productId: string;
  chosenCardId: string;
  month: number;
}

export interface RunRecord {
  id: string;
  runNumber: number;
  endedMonth: number;
  status: GameState["status"];
  score: number;
  campaignRank?: "S" | "A" | "B" | "C" | "D";
  endingName?: string;
  survivedYears?: number;
  bestProductName?: string;
  representativeCardName?: string;
  rivalName?: string;
  insightReward: number;
  note: string;
}

export interface MetaUnlockDefinition {
  id: string;
  title: string;
  description: string;
  cost: number;
  starting_resource_effects: ResourceMap;
  unlock_card_ids: string[];
  tags: string[];
}

export interface RogueliteState {
  runNumber: number;
  founderInsight: number;
  unlockedMetaIds: string[];
  starterDeckId?: string;
  deck: StrategyDeckState;
  deckEditTokens: number;
  upgradedCardIds: string[];
  rewardHistory: CardRewardChoice[];
  runHistory: RunRecord[];
  pendingCardReward?: PendingCardReward;
}

export type DevelopmentChallenge = "ux" | "bug" | "compute" | "safety" | "research" | "market" | "data" | "creative" | "automation";

export interface DevelopmentPuzzleTile {
  id: string;
  challenge: DevelopmentChallenge;
  label: string;
  difficulty: number;
  stat: keyof AgentStats;
  modifierLabel?: string;
}

export interface DevelopmentPuzzleState {
  projectId: string;
  productId: string;
  tiles: DevelopmentPuzzleTile[];
}

export interface DevelopmentPuzzleResult extends DevelopmentPuzzleState {
  selectedTileIds: string[];
  score: number;
  progressGain: number;
  qualityGain: number;
  verdict: string;
  appliedModifierLabels: string[];
}

export interface ActiveDevelopmentPuzzleModifier {
  id: string;
  sourceCardId: string;
  label: string;
  projectId: string;
  targetChallenges: DevelopmentChallenge[];
  scoreBonus: number;
  difficultyDelta: number;
  tileLimitBonus: number;
  usesRemaining: number;
}

export interface AgentStats {
  research: number;
  engineering: number;
  product: number;
  growth: number;
  safety: number;
  operations: number;
  creativity: number;
  autonomy: number;
}

export interface AgentAppearance {
  palette: string[];
  silhouette: string;
  hair: string;
  outfit: string;
  signatureProp: string;
}

export interface AgentTypeDefinition {
  id: string;
  name: string;
  role: string;
  description: string;
  kind?: "human" | "ai_agent" | "robot";
  rarity: string;
  stats: AgentStats;
  appearance: AgentAppearance;
  unlock_requirements: Record<string, number>;
  hire_cost: ResourceMap;
  upkeep: ResourceMap;
  preferred_items: string[];
  quirk: string;
}

export interface WorkforceSynergyDefinition {
  id: string;
  title: string;
  description: string;
  required_kinds: Partial<Record<NonNullable<AgentTypeDefinition["kind"]>, number>>;
  stat_effects: Record<string, number>;
  project_effects: {
    quality: number;
    progress: number;
  };
  tags: string[];
}

export interface WorkforceSynergyStatus extends WorkforceSynergyDefinition {
  active: boolean;
  progressLabel: string;
}

export interface WorkforceSynergySummary {
  active: WorkforceSynergyStatus[];
  locked: WorkforceSynergyStatus[];
  nextCandidate?: WorkforceSynergyStatus;
  totalStats: Record<string, number>;
  projectQualityBonus: number;
  projectProgressBonus: number;
}

export interface ItemDefinition {
  id: string;
  name: string;
  category: string;
  description: string;
  cost: ResourceMap;
  effects: Record<string, number>;
  target: string;
  rarity: string;
  unlock_requirements: Record<string, number>;
  flavor: string;
}

export interface OfficeExpansionDefinition {
  id: string;
  level: number;
  name: string;
  description: string;
  hire_capacity: number;
  decoration_slots: number;
  monthly_effects: ResourceMap;
  cost: ResourceMap;
  unlock_requirements: Record<string, number>;
}

export interface OfficeSynergyDefinition {
  id: string;
  title: string;
  description: string;
  required_categories: Record<string, number>;
  required_effects: Record<string, number>;
  monthly_effects: ResourceMap;
  tags: string[];
}

export interface OfficeSynergyStatus extends OfficeSynergyDefinition {
  active: boolean;
  progressLabel: string;
}

export interface OfficeSynergySummary {
  active: OfficeSynergyStatus[];
  locked: OfficeSynergyStatus[];
  nextCandidate?: OfficeSynergyStatus;
  totalMonthlyEffects: ResourceMap;
}

export interface IndustrySynergyDefinition {
  id: string;
  title: string;
  description: string;
  required_domains: string[];
  monthly_effects: ResourceMap;
  tags: string[];
}

export interface IndustrySynergyStatus extends IndustrySynergyDefinition {
  active: boolean;
  progressLabel: string;
  fulfilledDomains: string[];
  missingDomains: string[];
}

export interface IndustrySynergySummary {
  active: IndustrySynergyStatus[];
  locked: IndustrySynergyStatus[];
  nextCandidate?: IndustrySynergyStatus;
  totalMonthlyEffects: ResourceMap;
}

export interface IndustryComboDefinition {
  id: string;
  title: string;
  description: string;
  required_domains: string[];
  monthly_effects: ResourceMap;
  risk_label: string;
  tags: string[];
}

export interface IndustryComboStatus extends IndustryComboDefinition {
  active: boolean;
  progressLabel: string;
  fulfilledDomains: string[];
  missingDomains: string[];
}

export interface IndustryComboSummary {
  active: IndustryComboStatus[];
  locked: IndustryComboStatus[];
  nextCandidate?: IndustryComboStatus;
  totalMonthlyEffects: ResourceMap;
}

export interface OfficeZoneDefinition {
  id: string;
  title: string;
  description: string;
  min_office_level: number;
  required_resources: ResourceMap;
  required_capabilities: Record<string, number>;
  required_domains: string[];
  required_active_products: number;
  required_hired_agents: number;
  monthly_effects: ResourceMap;
  tags: string[];
}

export interface OfficeZoneStatus extends OfficeZoneDefinition {
  unlocked: boolean;
  active: boolean;
  blockedReasons: string[];
  progressLabel: string;
}

export interface OfficeZonePlan {
  active: OfficeZoneStatus[];
  locked: OfficeZoneStatus[];
  nextZone?: OfficeZoneStatus;
  totalMonthlyEffects: ResourceMap;
  operationLabel: string;
}

export interface OfficeSceneObjectDefinition {
  id: string;
  label: string;
  kind: string;
  min_office_level: number;
  required_zone_id?: string;
  x: number;
  y: number;
  w: number;
  h: number;
  palette: string[];
  activity: string;
  tags: string[];
}

export interface OfficeSceneObjectStatus extends OfficeSceneObjectDefinition {
  active: boolean;
  blockedReason?: string;
  zoneTitle?: string;
}

export type OfficeEventReactionTrigger = "card_use" | "product_launch" | "rival_alert" | "staff_incident";
export type OfficeEventReactionTone = "boost" | "success" | "warning" | "danger";

export interface OfficeEventReactionDefinition {
  id: string;
  trigger: OfficeEventReactionTrigger;
  label: string;
  bubble: string;
  detail: string;
  tone: OfficeEventReactionTone;
  x: number;
  y: number;
  duration_ms: number;
  priority: number;
  tags: string[];
}

export interface OfficeEventReactionStatus extends OfficeEventReactionDefinition {
  headline: string;
  source: string;
}

export type OfficeSceneActorKind = "human" | "ai_agent" | "robot";
export type OfficeSceneActorState = "working" | "resting" | "warning" | "idle";
export type OfficeSceneActorActionTarget = "agents" | "products";
export type OfficeSceneActorReactionPose = "card_use" | "cheer" | "alert";

export interface OfficeSceneActorStatus {
  id: string;
  name: string;
  kind: OfficeSceneActorKind;
  state: OfficeSceneActorState;
  reactionPose?: OfficeSceneActorReactionPose;
  reactionPoseSource?: string;
  agentTypeId?: string;
  x: number;
  y: number;
  level: number;
  energy: number;
  loyalty: number;
  activity: string;
  assignmentLabel: string;
  focusLabel: string;
  actionLabel: string;
  targetMenu: OfficeSceneActorActionTarget;
}

export interface OfficeScenePlan {
  expansionLabel: string;
  activeObjectCount: number;
  visibleObjectCount: number;
  activeActorCount: number;
  workingActorCount: number;
  objects: OfficeSceneObjectStatus[];
  actors: OfficeSceneActorStatus[];
  eventReactions: OfficeEventReactionStatus[];
  activityTicker: string[];
}

export interface OfficeGrowthCurrent {
  expansionId: string;
  expansionName: string;
  level: number;
  hireSlotsUsed: number;
  hireSlotsTotal: number;
  decorationSlotsUsed: number;
  decorationSlotsTotal: number;
  openDecorationSlots: number;
  activeZoneCount: number;
  nextZoneTitle?: string;
  monthlyEffects: ResourceMap;
}

export interface OfficeGrowthExpansionChoice {
  id: string;
  name: string;
  description: string;
  available: boolean;
  reasons: string[];
  cost: ResourceMap;
  hireCapacityGain: number;
  decorationSlotGain: number;
  monthlyEffects: ResourceMap;
}

export interface OfficeGrowthRelocationChoice {
  id: string;
  name: string;
  region: string;
  description: string;
  available: boolean;
  reasons: string[];
  cost: ResourceMap;
  monthlyCostModifierDelta: number;
  aiOperationGain: number;
  humanHireDiscountDelta: number;
}

export interface OfficeGrowthDecorRecommendation {
  id: string;
  name: string;
  category: string;
  available: boolean;
  owned: boolean;
  placeable: boolean;
  score: number;
  effects: Record<string, number>;
  cost: ResourceMap;
  recommendationReason: string;
}

export interface OfficeGrowthSynergyPlan extends OfficeSynergyStatus {
  recommendedItems: OfficeGrowthDecorRecommendation[];
}

export interface OfficeGrowthDecorRow {
  id: string;
  name: string;
  category: string;
  effects: Record<string, number>;
  linkedSynergyTitles: string[];
}

export type OfficeGrowthActionKind = "expand_office" | "relocate" | "buy_decor" | "place_decor" | "maintain";

export interface OfficeGrowthPrimaryAction {
  kind: OfficeGrowthActionKind;
  label: string;
  reason: string;
  targetId?: string;
}

export interface OfficeGrowthPlan {
  current: OfficeGrowthCurrent;
  nextExpansion?: OfficeGrowthExpansionChoice;
  nextRelocation?: OfficeGrowthRelocationChoice;
  activeSynergies: OfficeSynergyStatus[];
  nextSynergy?: OfficeGrowthSynergyPlan;
  zonePlan: OfficeZonePlan;
  placedDecorRows: OfficeGrowthDecorRow[];
  primaryAction: OfficeGrowthPrimaryAction;
}

export type OperationsCommandRiskLevel = "stable" | "watch" | "urgent";
export type OperationsCommandSeverity = "stable" | "opportunity" | "watch" | "urgent";

export interface OperationsCommandFocus {
  id: string;
  title: string;
  description: string;
  severity: OperationsCommandSeverity;
  targetMenu: GrowthPathMenuId;
  actionLabel: string;
}

export interface OperationsCommandPlan {
  headline: string;
  summary: string;
  riskLevel: OperationsCommandRiskLevel;
  focusCards: OperationsCommandFocus[];
  activeSafeguards: string[];
  nextMilestone: string;
}

export interface OfficeState {
  expansionId: string;
  placedItemIds: string[];
}

export interface ReleaseReview {
  score: number;
  grade: string;
  quote: string;
}

export type GrowthPathMenuId = "company" | "products" | "deck" | "agents" | "research" | "shop" | "competition" | "log";

export interface GrowthPathDefinition {
  id: string;
  order: number;
  title: string;
  description: string;
  target_menu: GrowthPathMenuId;
  action_label: string;
  payoff: string;
  bonus_description: string;
  commitment_effects: ResourceMap;
  monthly_effects: ResourceMap;
  trigger_tags: string[];
  recommended_product_ids?: string[];
  recommended_capability_ids?: string[];
  recommended_upgrade_ids?: string[];
  recommended_item_ids?: string[];
  followup_objectives?: GrowthPathObjectiveDefinition[];
}

export interface GrowthPathObjectiveDefinition {
  id: string;
  label: string;
  description: string;
  target_menu: GrowthPathMenuId;
  completion: {
    product_id?: string;
    capability_id?: string;
    capability_level?: number;
    owned_item_id?: string;
    purchased_upgrade_id?: string;
    min_resource?: string;
    min_value?: number;
  };
}

export interface GrowthPathObjective {
  id: string;
  label: string;
  description: string;
  targetMenu: GrowthPathMenuId;
  complete: boolean;
}

export interface ReleaseGrowthPath {
  id: string;
  title: string;
  description: string;
  targetMenu: GrowthPathMenuId;
  actionLabel: string;
  payoff: string;
  bonusDescription: string;
  detail: string;
}

export interface ChosenGrowthPath {
  id: string;
  title: string;
  month: number;
  bonusDescription: string;
  effects: ResourceMap;
  monthlyEffects: ResourceMap;
}

export interface TutorialGuide {
  id: string;
  helperName: string;
  title: string;
  message: string;
  targetMenu: GrowthPathMenuId;
  actionLabel: string;
}

export interface ReleaseMoment {
  productId: string;
  productName: string;
  month: number;
  review: ReleaseReview;
  headline: string;
  marketReaction: string;
  expansionHint: string;
  growthPaths: ReleaseGrowthPath[];
}

export interface HiredAgent {
  id: string;
  typeId: string;
  name: string;
  level: number;
  energy: number;
  experience?: number;
  loyalty?: number;
  monthsEmployed?: number;
  equippedItemIds: string[];
  specializationStat?: keyof AgentStats;
  specializationChosenMonth?: number;
  recruitmentChannelId?: string;
  salaryMultiplier?: number;
  statBonus?: number;
  upkeep?: ResourceMap;
  qualityLabel?: string;
  riskLabel?: string;
  assignment?: string;
}

export interface ProductProject {
  id: string;
  productId: string;
  kind?: "new" | "renewal";
  renewalOptionId?: string;
  releaseName?: string;
  progress: number;
  quality: number;
  assignedAgentIds: string[];
  startedMonth: number;
}

export interface ProductProjectForecast {
  assignedAgentIds: string[];
  startingQuality: number;
  monthlyProgressGain: number;
  monthlyQualityGain: number;
  estimatedMonths: number;
  expectedQuality: number;
  expectedReviewScore: number;
  expectedReviewGrade: string;
}

export interface BalanceDefinition {
  base_monthly_cash_cost: number;
  salary_per_talent: number;
  compute_cost_per_1000_users: number;
  monthly_hype_decay: number;
  trust_recovery_threshold: number;
  trust_recovery_amount: number;
  growth_rate_base: number;
  hype_growth_multiplier: number;
  trust_multiplier_high_threshold: number;
  trust_multiplier_low_threshold: number;
  trust_enterprise_bonus: number;
  trust_low_penalty: number;
  automation_cost_reduction_per_point: number;
  staff_aftermath_burnout_project_progress_penalty: number;
  staff_aftermath_burnout_project_quality_penalty: number;
  staff_aftermath_poaching_project_progress_penalty: number;
  staff_aftermath_poaching_project_quality_penalty: number;
  staff_aftermath_discontent_project_progress_penalty: number;
  staff_aftermath_discontent_project_quality_penalty: number;
  game_over_cash_threshold: number;
  game_over_trust_threshold: number;
  success_users_threshold: number;
  success_cash_threshold: number;
  success_automation_threshold: number;
  success_min_products: number;
}

export interface StartingStateDefinition {
  month: number;
  capabilities: CapabilityMap;
  unlocked_domains: string[];
  active_products: string[];
  purchased_upgrades: string[];
  purchased_automation_upgrades: string[];
}

export interface MonthlyReport {
  revenue: number;
  totalCost: number;
  newUsers: number;
  generatedData: number;
  computePressure: number;
  strategyEffects?: ResourceMap;
  staffAftermathCount?: number;
  staffAftermathSummary?: string;
  staffAftermathResourceDelta?: ResourceMap;
  staffAftermathProjectImpact?: string;
}

export interface MonthlyEconomy extends MonthlyReport {
  resourceDelta: ResourceMap;
}

export interface CapabilityUpgradeMoment {
  capabilityId: string;
  capabilityName: string;
  previousLevel: number;
  nextLevel: number;
  resourceCost: ResourceMap;
  month: number;
  unlockedDomainId?: string;
  unlockedDomainName?: string;
}

export interface StaffIncidentResolutionLogEntry {
  id: string;
  month: number;
  agentId: string;
  agentName: string;
  incidentType: "burnout" | "poaching" | "discontent";
  incidentTitle: string;
  severity: "warning" | "critical";
  resolutionId: string;
  resolutionLabel: string;
  summary: string;
  effectLabel: string;
  projectImpactLabel?: string;
  isAftermath?: boolean;
  sourceCompetitorId?: string;
  sourceCompetitorName?: string;
  offerLabel?: string;
  stakesLabel?: string;
}

export interface GameState {
  month: number;
  locationId: string;
  resources: ResourceMap;
  capabilities: CapabilityMap;
  activeProducts: string[];
  generatedProducts: ProductDefinition[];
  unlockedDomains: string[];
  purchasedUpgrades: string[];
  purchasedAutomationUpgrades: string[];
  hiredAgents: HiredAgent[];
  ownedItems: string[];
  office: OfficeState;
  productProjects: ProductProject[];
  productLevels: Record<string, number>;
  competitorStates: CompetitorState[];
  marketShareHistory: MarketShareHistoryEntry[];
  pendingChallengerEntryIds: string[];
  productReviews: Record<string, ReleaseReview>;
  lastRelease?: ReleaseMoment;
  roguelite: RogueliteState;
  activeDevelopmentPuzzleModifiers: ActiveDevelopmentPuzzleModifier[];
  lastDevelopmentPuzzle?: DevelopmentPuzzleResult;
  lastCapabilityUpgrade?: CapabilityUpgradeMoment;
  chosenGrowthPath?: ChosenGrowthPath;
  unlockedAchievements: string[];
  annualReviewHistory: AnnualReviewHistoryEntry[];
  annualDirective?: AnnualDirectiveState;
  pendingAnnualDirectiveChoices?: PendingAnnualDirectiveChoices;
  campaignShockHistory: string[];
  eventHistory: string[];
  rivalEventHistory: string[];
  seenTutorials: string[];
  discoveredPayoffIds: string[];
  recentStaffIncidentResolutions: StaffIncidentResolutionLogEntry[];
  timeline: string[];
  lastMonthReport?: MonthlyReport;
  currentEvent?: EventDefinition;
  currentRivalEvent?: RivalEventDefinition;
  status: "playing" | "success" | "failure";
}

export interface ActionCheck {
  ok: boolean;
  reasons: string[];
}
