import resourcesJson from "../../data/resources.json";
import productsJson from "../../data/products.json";
import capabilitiesJson from "../../data/capabilities.json";
import domainsJson from "../../data/domains.json";
import balanceJson from "../../data/balance.json";
import startingStateJson from "../../data/starting_state.json";
import companyStagesJson from "../../data/company_stages.json";
import eventsJson from "../../data/events.json";
import upgradesJson from "../../data/upgrades.json";
import automationUpgradesJson from "../../data/automation_upgrades.json";
import agentTypesJson from "../../data/agent_types.json";
import itemsJson from "../../data/items.json";
import competitorsJson from "../../data/competitors.json";
import rivalEventsJson from "../../data/rival_events.json";
import assetManifestJson from "../../data/asset_manifest.json";
import type {
  AgentTypeDefinition,
  AssetManifestDefinition,
  AutomationUpgradeDefinition,
  BalanceDefinition,
  CapabilityDefinition,
  CompanyStageDefinition,
  CompetitorDefinition,
  DomainDefinition,
  EventDefinition,
  ProductDefinition,
  ResourceDefinition,
  RivalEventDefinition,
  StartingStateDefinition,
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
export const events = eventsJson.events as unknown as EventDefinition[];
export const upgrades = upgradesJson.upgrades as unknown as UpgradeDefinition[];
export const automationUpgrades = automationUpgradesJson.automation_upgrades as unknown as AutomationUpgradeDefinition[];
export const agentTypes = agentTypesJson.agent_types as unknown as AgentTypeDefinition[];
export const items = itemsJson.items as unknown as ItemDefinition[];
export const competitors = competitorsJson.competitors as unknown as CompetitorDefinition[];
export const rivalEvents = rivalEventsJson.rival_events as unknown as RivalEventDefinition[];
export const assetManifest = assetManifestJson as unknown as AssetManifestDefinition;
