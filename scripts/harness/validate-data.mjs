import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const dataDir = path.join(root, "data");
const errors = [];

function readJson(fileName) {
  const filePath = path.join(dataDir, fileName);
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    errors.push(`${fileName}: cannot parse JSON (${error.message})`);
    return null;
  }
}

function idsAreUnique(label, items) {
  const seen = new Set();
  for (const item of items) {
    if (!item.id) {
      errors.push(`${label}: item missing id`);
      continue;
    }
    if (seen.has(item.id)) errors.push(`${label}: duplicate id "${item.id}"`);
    seen.add(item.id);
  }
  return seen;
}

function validateResourceMap(label, resourceMap, resourceIds) {
  for (const [resourceId, value] of Object.entries(resourceMap ?? {})) {
    if (!resourceIds.has(resourceId)) errors.push(`${label}: unknown resource "${resourceId}"`);
    if (typeof value !== "number") errors.push(`${label}: resource "${resourceId}" must be a number`);
  }
}

const resourcesData = readJson("resources.json");
const productsData = readJson("products.json");
const capabilitiesData = readJson("capabilities.json");
const domainsData = readJson("domains.json");
const eventsData = readJson("events.json");
const upgradesData = readJson("upgrades.json");
const automationData = readJson("automation_upgrades.json");
const balanceData = readJson("balance.json");
const startingState = readJson("starting_state.json");
const personasData = readJson("playtest_personas.json");
const companyStagesData = readJson("company_stages.json");

const resources = resourcesData?.resources ?? {};
const products = productsData?.products ?? [];
const capabilities = capabilitiesData?.capabilities ?? [];
const domains = domainsData?.domains ?? [];
const events = eventsData?.events ?? [];
const upgrades = upgradesData?.upgrades ?? [];
const automationUpgrades = automationData?.automation_upgrades ?? [];
const personas = personasData?.personas ?? [];
const companyStages = companyStagesData?.company_stages ?? [];

const resourceIds = new Set(Object.keys(resources));
const capabilityIds = idsAreUnique("capabilities", capabilities);
const domainIds = idsAreUnique("domains", domains);
idsAreUnique("products", products);
idsAreUnique("events", events);
idsAreUnique("upgrades", upgrades);
idsAreUnique("automation_upgrades", automationUpgrades);
idsAreUnique("playtest_personas", personas);
idsAreUnique("company_stages", companyStages);

for (const [resourceId, resource] of Object.entries(resources)) {
  if (resource.id !== resourceId) errors.push(`resources: key "${resourceId}" has mismatched id "${resource.id}"`);
  for (const field of ["name", "description", "initial_value", "min_value", "max_value"]) {
    if (!(field in resource)) errors.push(`resources.${resourceId}: missing ${field}`);
  }
}

for (const product of products) {
  if (!domainIds.has(product.domain)) errors.push(`product "${product.id}": unknown domain "${product.domain}"`);
  validateResourceMap(`product "${product.id}" launch_cost`, product.launch_cost, resourceIds);

  for (const [capabilityId, requiredLevel] of Object.entries(product.required_capabilities ?? {})) {
    if (!capabilityIds.has(capabilityId)) errors.push(`product "${product.id}": unknown capability "${capabilityId}"`);
    if (typeof requiredLevel !== "number") errors.push(`product "${product.id}": capability "${capabilityId}" level must be numeric`);
  }
}

for (const capability of capabilities) {
  if (!Array.isArray(capability.upgrade_costs)) errors.push(`capability "${capability.id}": upgrade_costs must be an array`);
  for (const [index, cost] of (capability.upgrade_costs ?? []).entries()) {
    validateResourceMap(`capability "${capability.id}" upgrade_costs[${index}]`, cost, resourceIds);
  }
  for (const domainId of Object.values(capability.unlocks_domains ?? {})) {
    if (!domainIds.has(domainId)) errors.push(`capability "${capability.id}": unlocks unknown domain "${domainId}"`);
  }
}

for (const domain of domains) {
  for (const capabilityId of Object.keys(domain.unlock_requirements ?? {})) {
    if (!capabilityIds.has(capabilityId)) errors.push(`domain "${domain.id}": unknown unlock capability "${capabilityId}"`);
  }
}

for (const stage of companyStages) {
  if (typeof stage.order !== "number") errors.push(`company_stage "${stage.id}": order must be numeric`);
  for (const [requirement, value] of Object.entries(stage.requirements ?? {})) {
    const allowed = new Set([
      "min_products",
      "min_domains",
      "min_users",
      "min_hype",
      "min_trust",
      "min_cash",
      "min_automation",
    ]);
    if (!allowed.has(requirement)) errors.push(`company_stage "${stage.id}": unknown requirement "${requirement}"`);
    if (typeof value !== "number") errors.push(`company_stage "${stage.id}": requirement "${requirement}" must be numeric`);
  }
}

for (const event of events) {
  for (const choice of event.choices ?? []) {
    validateResourceMap(`event "${event.id}" choice "${choice.id}" effects`, choice.effects, resourceIds);
  }
}

for (const upgrade of upgrades) {
  validateResourceMap(`upgrade "${upgrade.id}" cost`, upgrade.cost, resourceIds);
  validateResourceMap(`upgrade "${upgrade.id}" effects`, upgrade.effects, resourceIds);
}

for (const upgrade of automationUpgrades) {
  validateResourceMap(`automation upgrade "${upgrade.id}" cost`, upgrade.cost, resourceIds);
  validateResourceMap(`automation upgrade "${upgrade.id}" effects`, upgrade.effects, resourceIds);
}

if (!balanceData?.balance) errors.push("balance.json: missing balance object");

if (!startingState) {
  errors.push("starting_state.json: missing");
} else {
  for (const capabilityId of Object.keys(startingState.capabilities ?? {})) {
    if (!capabilityIds.has(capabilityId)) errors.push(`starting_state: unknown capability "${capabilityId}"`);
  }
  for (const domainId of startingState.unlocked_domains ?? []) {
    if (!domainIds.has(domainId)) errors.push(`starting_state: unknown domain "${domainId}"`);
  }

  const launchableProducts = products.filter((product) => {
    const domainUnlocked =
      startingState.unlocked_domains?.includes(product.domain) ||
      domains.find((domain) => domain.id === product.domain)?.unlocked_by_default;
    const capabilitiesMet = Object.entries(product.required_capabilities ?? {}).every(
      ([capabilityId, level]) => (startingState.capabilities?.[capabilityId] ?? 0) >= level,
    );
    const costsMet = Object.entries(product.launch_cost ?? {}).every(
      ([resourceId, cost]) => (resources[resourceId]?.initial_value ?? 0) >= cost,
    );
    const trustMet = (resources.trust?.initial_value ?? 0) >= (product.trust_requirement ?? 0);
    return domainUnlocked && capabilitiesMet && costsMet && trustMet;
  });

  if (launchableProducts.length === 0) errors.push("starting_state: no launchable product at game start");
}

const maleSlots = personas.filter((persona) => persona.gender_mix_slot === "male").length;
const femaleSlots = personas.filter((persona) => persona.gender_mix_slot === "female").length;
if (personas.length !== 12) errors.push(`playtest_personas: expected 12 personas, found ${personas.length}`);
if (maleSlots !== 6 || femaleSlots !== 6) errors.push(`playtest_personas: expected 6 male and 6 female slots, found ${maleSlots}/${femaleSlots}`);

if (errors.length) {
  console.error("Data validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Data validation passed.");
