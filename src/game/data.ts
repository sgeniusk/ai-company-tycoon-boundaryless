import resourcesJson from "../../data/resources.json";
import productsJson from "../../data/products.json";
import capabilitiesJson from "../../data/capabilities.json";
import domainsJson from "../../data/domains.json";
import balanceJson from "../../data/balance.json";
import startingStateJson from "../../data/starting_state.json";
import companyStagesJson from "../../data/company_stages.json";
import companyLocationsJson from "../../data/company_locations.json";
import eventsJson from "../../data/events.json";
import upgradesJson from "../../data/upgrades.json";
import automationUpgradesJson from "../../data/automation_upgrades.json";
import agentTypesJson from "../../data/agent_types.json";
import itemsJson from "../../data/items.json";
import competitorsJson from "../../data/competitors.json";
import rivalEventsJson from "../../data/rival_events.json";
import assetManifestJson from "../../data/asset_manifest.json";
import growthPathsJson from "../../data/growth_paths.json";
import achievementsJson from "../../data/achievements.json";
import annualReviewsJson from "../../data/annual_reviews.json";
import annualDirectiveChoicesJson from "../../data/annual_directive_choices.json";
import strategyCardsJson from "../../data/strategy_cards.json";
import metaUnlocksJson from "../../data/meta_unlocks.json";
import officeExpansionsJson from "../../data/office_expansions.json";
import type {
  AchievementDefinition,
  AnnualDirectiveChoiceDefinition,
  AnnualReviewDefinition,
  AgentTypeDefinition,
  AssetManifestDefinition,
  AutomationUpgradeDefinition,
  BalanceDefinition,
  CapabilityDefinition,
  CompanyLocationDefinition,
  CompanyStageDefinition,
  CompetitorDefinition,
  DomainDefinition,
  EventDefinition,
  GrowthPathDefinition,
  MetaUnlockDefinition,
  OfficeExpansionDefinition,
  ProductDefinition,
  ResourceDefinition,
  RivalEventDefinition,
  StartingStateDefinition,
  StrategyCardDefinition,
  ItemDefinition,
  UpgradeDefinition,
} from "./types";

export const resources = resourcesJson.resources as Record<string, ResourceDefinition>;
export const products = productsJson.products as unknown as ProductDefinition[];
export const capabilities = capabilitiesJson.capabilities as unknown as CapabilityDefinition[];
export const domains = domainsJson.domains as unknown as DomainDefinition[];
export const balance = balanceJson.balance as BalanceDefinition;
export const startingState = startingStateJson as StartingStateDefinition;
export const companyStages = companyStagesJson.company_stages as unknown as CompanyStageDefinition[];
export const companyLocations = companyLocationsJson.company_locations as unknown as CompanyLocationDefinition[];
export const events = eventsJson.events as unknown as EventDefinition[];
export const upgrades = upgradesJson.upgrades as unknown as UpgradeDefinition[];
export const automationUpgrades = automationUpgradesJson.automation_upgrades as unknown as AutomationUpgradeDefinition[];
export const agentTypes = agentTypesJson.agent_types as unknown as AgentTypeDefinition[];
export const items = itemsJson.items as unknown as ItemDefinition[];
export const competitors = competitorsJson.competitors as unknown as CompetitorDefinition[];
export const rivalEvents = rivalEventsJson.rival_events as unknown as RivalEventDefinition[];
export const assetManifest = assetManifestJson as unknown as AssetManifestDefinition;
export const growthPaths = growthPathsJson.growth_paths as unknown as GrowthPathDefinition[];
export const achievements = achievementsJson.achievements as unknown as AchievementDefinition[];
export const annualReviews = annualReviewsJson.annual_reviews as unknown as AnnualReviewDefinition[];
export const annualDirectiveChoices = annualDirectiveChoicesJson.annual_directive_choices as unknown as AnnualDirectiveChoiceDefinition[];
export const strategyCards = strategyCardsJson.strategy_cards as unknown as StrategyCardDefinition[];
export const metaUnlocks = metaUnlocksJson.meta_unlocks as unknown as MetaUnlockDefinition[];
export const officeExpansions = officeExpansionsJson.office_expansions as unknown as OfficeExpansionDefinition[];
