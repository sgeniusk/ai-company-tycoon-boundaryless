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
  frames: number;
  row: number;
}

export interface AgentSpriteDefinition {
  agent_type_id: string;
  source_status: "placeholder" | "draft" | "final";
  body_class: string;
  palette: string[];
  animations: {
    idle: SpriteAnimationDefinition;
    work: SpriteAnimationDefinition;
  };
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
}

export interface ItemIconDefinition {
  item_id: string;
  source_status: "placeholder" | "draft" | "final";
  icon_class: string;
  icon_size: number;
  palette: string[];
  readable_shape: string;
}

export interface AssetManifestDefinition {
  version: string;
  sprite_grid: SpriteGridDefinition;
  agent_sprites: AgentSpriteDefinition[];
  competitor_identities: CompetitorIdentityDefinition[];
  office_objects: OfficeObjectAssetDefinition[];
  item_icons: ItemIconDefinition[];
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
  cost: ResourceMap;
  unlock_requirements: Record<string, number>;
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
  equippedItemIds: string[];
  assignment?: string;
}

export interface ProductProject {
  id: string;
  productId: string;
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
}

export interface MonthlyEconomy extends MonthlyReport {
  resourceDelta: ResourceMap;
}

export interface GameState {
  month: number;
  locationId: string;
  resources: ResourceMap;
  capabilities: CapabilityMap;
  activeProducts: string[];
  unlockedDomains: string[];
  purchasedUpgrades: string[];
  purchasedAutomationUpgrades: string[];
  hiredAgents: HiredAgent[];
  ownedItems: string[];
  office: OfficeState;
  productProjects: ProductProject[];
  productLevels: Record<string, number>;
  competitorStates: CompetitorState[];
  productReviews: Record<string, ReleaseReview>;
  lastRelease?: ReleaseMoment;
  roguelite: RogueliteState;
  activeDevelopmentPuzzleModifiers: ActiveDevelopmentPuzzleModifier[];
  lastDevelopmentPuzzle?: DevelopmentPuzzleResult;
  chosenGrowthPath?: ChosenGrowthPath;
  unlockedAchievements: string[];
  annualReviewHistory: AnnualReviewHistoryEntry[];
  eventHistory: string[];
  rivalEventHistory: string[];
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
