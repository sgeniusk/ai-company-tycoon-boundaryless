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
  productReviews: Record<string, ReleaseReview>;
  eventHistory: string[];
  timeline: string[];
  lastMonthReport?: MonthlyReport;
  currentEvent?: EventDefinition;
  status: "playing" | "success" | "failure";
}

export interface ActionCheck {
  ok: boolean;
  reasons: string[];
}
