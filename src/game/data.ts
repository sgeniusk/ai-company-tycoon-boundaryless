import resourcesJson from "../../data/resources.json";
import productsJson from "../../data/products.json";
import capabilitiesJson from "../../data/capabilities.json";
import domainsJson from "../../data/domains.json";
import balanceJson from "../../data/balance.json";
import startingStateJson from "../../data/starting_state.json";
import type {
  BalanceDefinition,
  CapabilityDefinition,
  DomainDefinition,
  ProductDefinition,
  ResourceDefinition,
  StartingStateDefinition,
} from "./types";

export const resources = resourcesJson.resources as Record<string, ResourceDefinition>;
export const products = productsJson.products as unknown as ProductDefinition[];
export const capabilities = capabilitiesJson.capabilities as unknown as CapabilityDefinition[];
export const domains = domainsJson.domains as unknown as DomainDefinition[];
export const balance = balanceJson.balance as BalanceDefinition;
export const startingState = startingStateJson as StartingStateDefinition;
