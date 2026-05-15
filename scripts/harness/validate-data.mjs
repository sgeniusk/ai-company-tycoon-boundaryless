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

function validatePalette(label, palette, minimum = 3) {
  if (!Array.isArray(palette) || palette.length < minimum) {
    errors.push(`${label}: palette needs at least ${minimum} colors`);
    return;
  }
  for (const color of palette) {
    if (typeof color !== "string" || !/^#[0-9a-f]{6}$/i.test(color)) {
      errors.push(`${label}: palette color "${color}" must be a 6-digit hex value`);
    }
  }
}

function validateAssetStatus(label, status) {
  if (!["placeholder", "draft", "final"].includes(status)) {
    errors.push(`${label}: source_status must be placeholder, draft, or final`);
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
const agentTypesData = readJson("agent_types.json");
const itemsData = readJson("items.json");
const competitorsData = readJson("competitors.json");
const rivalEventsData = readJson("rival_events.json");
const assetManifestData = readJson("asset_manifest.json");
const growthPathsData = readJson("growth_paths.json");
const koLocaleData = readJson("locales/ko.json");
const enLocaleData = readJson("locales/en.json");

const resources = resourcesData?.resources ?? {};
const products = productsData?.products ?? [];
const capabilities = capabilitiesData?.capabilities ?? [];
const domains = domainsData?.domains ?? [];
const events = eventsData?.events ?? [];
const upgrades = upgradesData?.upgrades ?? [];
const automationUpgrades = automationData?.automation_upgrades ?? [];
const personas = personasData?.personas ?? [];
const companyStages = companyStagesData?.company_stages ?? [];
const agentTypes = agentTypesData?.agent_types ?? [];
const items = itemsData?.items ?? [];
const competitors = competitorsData?.competitors ?? [];
const rivalEvents = rivalEventsData?.rival_events ?? [];
const assetManifest = assetManifestData ?? {};
const growthPaths = growthPathsData?.growth_paths ?? [];
const localeKeys = new Set([...Object.keys(koLocaleData ?? {}), ...Object.keys(enLocaleData ?? {})]);

const resourceIds = new Set(Object.keys(resources));
const capabilityIds = idsAreUnique("capabilities", capabilities);
const domainIds = idsAreUnique("domains", domains);
const productIds = idsAreUnique("products", products);
idsAreUnique("events", events);
const upgradeIds = idsAreUnique("upgrades", upgrades);
idsAreUnique("automation_upgrades", automationUpgrades);
idsAreUnique("playtest_personas", personas);
idsAreUnique("company_stages", companyStages);
const agentTypeIds = idsAreUnique("agent_types", agentTypes);
const itemIds = idsAreUnique("items", items);
const competitorIds = idsAreUnique("competitors", competitors);
idsAreUnique("rival_events", rivalEvents);
idsAreUnique("growth_paths", growthPaths);

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

const allowedAgentStats = new Set(["research", "engineering", "product", "growth", "safety", "operations", "creativity", "autonomy"]);
for (const agent of agentTypes) {
  for (const stat of allowedAgentStats) {
    if (typeof agent.stats?.[stat] !== "number") errors.push(`agent_type "${agent.id}": missing numeric stat "${stat}"`);
  }
  if (!Array.isArray(agent.appearance?.palette) || agent.appearance.palette.length < 3) {
    errors.push(`agent_type "${agent.id}": appearance palette needs at least 3 colors`);
  }
  for (const itemId of agent.preferred_items ?? []) {
    if (!itemIds.has(itemId)) errors.push(`agent_type "${agent.id}": preferred unknown item "${itemId}"`);
  }
  validateResourceMap(`agent_type "${agent.id}" hire_cost`, agent.hire_cost, resourceIds);
  validateResourceMap(`agent_type "${agent.id}" upkeep`, agent.upkeep, resourceIds);
}

const allowedItemEffects = new Set([...resourceIds, ...allowedAgentStats]);
for (const item of items) {
  validateResourceMap(`item "${item.id}" cost`, item.cost, resourceIds);
  for (const [effectKey, value] of Object.entries(item.effects ?? {})) {
    if (!allowedItemEffects.has(effectKey)) errors.push(`item "${item.id}": unknown effect "${effectKey}"`);
    if (typeof value !== "number") errors.push(`item "${item.id}": effect "${effectKey}" must be numeric`);
  }
}

for (const competitor of competitors) {
  for (const keyField of ["name_key", "tagline_key", "archetype_key", "weakness_key"]) {
    if (!localeKeys.has(competitor[keyField])) errors.push(`competitor "${competitor.id}": locale key missing for ${keyField}`);
  }
  for (const domainId of competitor.focus_domains ?? []) {
    if (!domainIds.has(domainId)) errors.push(`competitor "${competitor.id}": unknown focus domain "${domainId}"`);
  }
  for (const numericField of ["starting_score", "starting_market_share", "monthly_growth", "aggression"]) {
    if (typeof competitor[numericField] !== "number") errors.push(`competitor "${competitor.id}": ${numericField} must be numeric`);
  }
}

for (const event of rivalEvents) {
  if (!localeKeys.has(event.name_key)) errors.push(`rival_event "${event.id}": missing name locale`);
  if (!localeKeys.has(event.description_key)) errors.push(`rival_event "${event.id}": missing description locale`);
  if (!competitorIds.has(event.competitor_id)) errors.push(`rival_event "${event.id}": unknown competitor "${event.competitor_id}"`);
  for (const choice of event.choices ?? []) {
    if (!localeKeys.has(choice.text_key)) errors.push(`rival_event "${event.id}" choice "${choice.id}": missing text locale`);
    if (!localeKeys.has(choice.description_key)) errors.push(`rival_event "${event.id}" choice "${choice.id}": missing description locale`);
    validateResourceMap(`rival_event "${event.id}" choice "${choice.id}" effects`, choice.effects, resourceIds);
    for (const [effectKey, value] of Object.entries(choice.competitor_effects ?? {})) {
      if (!["score", "momentum"].includes(effectKey)) errors.push(`rival_event "${event.id}" choice "${choice.id}": unknown competitor effect "${effectKey}"`);
      if (typeof value !== "number") errors.push(`rival_event "${event.id}" choice "${choice.id}": competitor effect "${effectKey}" must be numeric`);
    }
  }
}

const menuIds = new Set(["company", "products", "agents", "research", "shop", "competition", "log"]);
for (const path of growthPaths) {
  for (const field of ["title", "description", "target_menu", "action_label", "payoff"]) {
    if (!path[field]) errors.push(`growth_path "${path.id}": missing ${field}`);
  }
  if (typeof path.order !== "number") errors.push(`growth_path "${path.id}": order must be numeric`);
  if (!menuIds.has(path.target_menu)) errors.push(`growth_path "${path.id}": unknown target_menu "${path.target_menu}"`);
  if (!Array.isArray(path.trigger_tags) || path.trigger_tags.length === 0) {
    errors.push(`growth_path "${path.id}": trigger_tags must be a non-empty array`);
  }
  for (const productId of path.recommended_product_ids ?? []) {
    if (!productIds.has(productId)) errors.push(`growth_path "${path.id}": unknown recommended product "${productId}"`);
  }
  for (const capabilityId of path.recommended_capability_ids ?? []) {
    if (!capabilityIds.has(capabilityId)) errors.push(`growth_path "${path.id}": unknown recommended capability "${capabilityId}"`);
  }
  for (const upgradeId of path.recommended_upgrade_ids ?? []) {
    if (!upgradeIds.has(upgradeId)) errors.push(`growth_path "${path.id}": unknown recommended upgrade "${upgradeId}"`);
  }
  for (const itemId of path.recommended_item_ids ?? []) {
    if (!itemIds.has(itemId)) errors.push(`growth_path "${path.id}": unknown recommended item "${itemId}"`);
  }
}

if (!assetManifestData) {
  errors.push("asset_manifest.json: missing");
} else {
  const grid = assetManifest.sprite_grid ?? {};
  for (const field of ["tile_size", "character_frame_size", "portrait_size", "icon_size", "competitor_logo_size"]) {
    if (typeof grid[field] !== "number" || grid[field] <= 0) {
      errors.push(`asset_manifest.sprite_grid: ${field} must be a positive number`);
    }
  }

  const requiredAgentSprites = ["prompt_architect", "code_smith", "data_curator", "infra_operator", "growth_hacker"];
  const spriteAgentIds = new Set();
  for (const sprite of assetManifest.agent_sprites ?? []) {
    if (!agentTypeIds.has(sprite.agent_type_id)) errors.push(`asset_manifest agent_sprites: unknown agent_type_id "${sprite.agent_type_id}"`);
    if (spriteAgentIds.has(sprite.agent_type_id)) errors.push(`asset_manifest agent_sprites: duplicate agent_type_id "${sprite.agent_type_id}"`);
    spriteAgentIds.add(sprite.agent_type_id);
    validateAssetStatus(`asset_manifest agent_sprites "${sprite.agent_type_id}"`, sprite.source_status);
    validatePalette(`asset_manifest agent_sprites "${sprite.agent_type_id}"`, sprite.palette);
    for (const animationName of ["idle", "work"]) {
      const animation = sprite.animations?.[animationName];
      if (!animation || typeof animation.frames !== "number" || animation.frames <= 0) {
        errors.push(`asset_manifest agent_sprites "${sprite.agent_type_id}": ${animationName} animation needs positive frames`);
      }
      if (!animation || typeof animation.row !== "number" || animation.row < 0) {
        errors.push(`asset_manifest agent_sprites "${sprite.agent_type_id}": ${animationName} animation needs non-negative row`);
      }
    }
  }
  for (const agentId of requiredAgentSprites) {
    if (!spriteAgentIds.has(agentId)) errors.push(`asset_manifest agent_sprites: missing priority agent "${agentId}"`);
  }

  const identityCompetitorIds = new Set();
  for (const identity of assetManifest.competitor_identities ?? []) {
    if (!competitorIds.has(identity.competitor_id)) {
      errors.push(`asset_manifest competitor_identities: unknown competitor_id "${identity.competitor_id}"`);
    }
    if (identityCompetitorIds.has(identity.competitor_id)) {
      errors.push(`asset_manifest competitor_identities: duplicate competitor_id "${identity.competitor_id}"`);
    }
    identityCompetitorIds.add(identity.competitor_id);
    validateAssetStatus(`asset_manifest competitor_identities "${identity.competitor_id}"`, identity.source_status);
    validatePalette(`asset_manifest competitor_identities "${identity.competitor_id}"`, identity.palette);
    if (identity.logo_size !== grid.competitor_logo_size) {
      errors.push(`asset_manifest competitor_identities "${identity.competitor_id}": logo_size must match sprite_grid.competitor_logo_size`);
    }
  }
  for (const competitorId of competitorIds) {
    if (!identityCompetitorIds.has(competitorId)) {
      errors.push(`asset_manifest competitor_identities: missing competitor "${competitorId}"`);
    }
  }

  const officeObjectIds = new Set();
  for (const object of assetManifest.office_objects ?? []) {
    if (!object.object_id) errors.push("asset_manifest office_objects: object missing object_id");
    if (officeObjectIds.has(object.object_id)) errors.push(`asset_manifest office_objects: duplicate object_id "${object.object_id}"`);
    officeObjectIds.add(object.object_id);
    validateAssetStatus(`asset_manifest office_objects "${object.object_id}"`, object.source_status);
    validatePalette(`asset_manifest office_objects "${object.object_id}"`, object.palette);
    if (object.tile_size !== grid.tile_size) errors.push(`asset_manifest office_objects "${object.object_id}": tile_size must match sprite_grid.tile_size`);
    if (!Array.isArray(object.footprint) || object.footprint.length !== 2) {
      errors.push(`asset_manifest office_objects "${object.object_id}": footprint must be [width, height]`);
    }
    if (object.linked_item_id && !itemIds.has(object.linked_item_id)) {
      errors.push(`asset_manifest office_objects "${object.object_id}": unknown linked_item_id "${object.linked_item_id}"`);
    }
  }

  const iconItemIds = new Set();
  for (const icon of assetManifest.item_icons ?? []) {
    if (!itemIds.has(icon.item_id)) errors.push(`asset_manifest item_icons: unknown item_id "${icon.item_id}"`);
    if (iconItemIds.has(icon.item_id)) errors.push(`asset_manifest item_icons: duplicate item_id "${icon.item_id}"`);
    iconItemIds.add(icon.item_id);
    validateAssetStatus(`asset_manifest item_icons "${icon.item_id}"`, icon.source_status);
    validatePalette(`asset_manifest item_icons "${icon.item_id}"`, icon.palette);
    if (icon.icon_size !== grid.icon_size) errors.push(`asset_manifest item_icons "${icon.item_id}": icon_size must match sprite_grid.icon_size`);
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
