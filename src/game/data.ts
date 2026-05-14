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
import type {
  AgentTypeDefinition,
  AutomationUpgradeDefinition,
  BalanceDefinition,
  CapabilityDefinition,
  CompanyStageDefinition,
  DomainDefinition,
  EventDefinition,
  ProductDefinition,
  ResourceDefinition,
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
