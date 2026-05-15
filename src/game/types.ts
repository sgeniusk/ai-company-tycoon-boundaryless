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

export interface ReleaseReview {
  score: number;
  grade: string;
  quote: string;
}

export type GrowthPathMenuId = "company" | "products" | "agents" | "research" | "shop" | "competition" | "log";

export interface GrowthPathDefinition {
  id: string;
  order: number;
  title: string;
  description: string;
  target_menu: GrowthPathMenuId;
  action_label: string;
  payoff: string;
  trigger_tags: string[];
  recommended_product_ids?: string[];
  recommended_capability_ids?: string[];
  recommended_upgrade_ids?: string[];
  recommended_item_ids?: string[];
}

export interface ReleaseGrowthPath {
  id: string;
  title: string;
  description: string;
  targetMenu: GrowthPathMenuId;
  actionLabel: string;
  payoff: string;
  detail: string;
}

export interface ReleaseMoment {
  productId: string;
  productName: string;
  month: number;
  review: ReleaseReview;
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
}

export interface GameState {
  month: number;
  resources: ResourceMap;
  capabilities: CapabilityMap;
  activeProducts: string[];
  unlockedDomains: string[];
  purchasedUpgrades: string[];
  purchasedAutomationUpgrades: string[];
  hiredAgents: HiredAgent[];
  ownedItems: string[];
  productProjects: ProductProject[];
  competitorStates: CompetitorState[];
  productReviews: Record<string, ReleaseReview>;
  lastRelease?: ReleaseMoment;
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
