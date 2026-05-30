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

function validateCapabilityDeltaMap(label, capabilityMap, capabilityIds) {
  for (const [capabilityId, value] of Object.entries(capabilityMap ?? {})) {
    if (!capabilityIds.has(capabilityId)) errors.push(`${label}: unknown capability "${capabilityId}"`);
    if (typeof value !== "number") errors.push(`${label}: capability "${capabilityId}" must be a number`);
  }
}

function hasOnlyZeroDeltas(option) {
  const resourceValues = Object.values(option?.starting_deltas?.resources ?? {});
  const capabilityValues = Object.values(option?.starting_deltas?.capabilities ?? {});
  return [...resourceValues, ...capabilityValues].every((value) => value === 0);
}

function hasEmptyStartingDeltas(option) {
  const resources = option?.starting_deltas?.resources;
  const capabilities = option?.starting_deltas?.capabilities;
  return (
    resources &&
    typeof resources === "object" &&
    !Array.isArray(resources) &&
    Object.keys(resources).length === 0 &&
    capabilities &&
    typeof capabilities === "object" &&
    !Array.isArray(capabilities) &&
    Object.keys(capabilities).length === 0
  );
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
const productIdeasData = readJson("product_ideas.json");
const capabilitiesData = readJson("capabilities.json");
const domainsData = readJson("domains.json");
const eventsData = readJson("events.json");
const upgradesData = readJson("upgrades.json");
const automationData = readJson("automation_upgrades.json");
const balanceData = readJson("balance.json");
const startingState = readJson("starting_state.json");
const personasData = readJson("playtest_personas.json");
const companyStagesData = readJson("company_stages.json");
const companyLocationsData = readJson("company_locations.json");
const campaignShocksData = readJson("campaign_shocks.json");
const worldEventsData = readJson("world_events.json");
const runModifiersData = readJson("run_modifiers.json");
const difficultyTiersData = readJson("difficulty_tiers.json");
const derivationRulesData = readJson("derivation_rules.json");
const endingsData = readJson("endings.json");
const agentTypesData = readJson("agent_types.json");
const itemsData = readJson("items.json");
const competitorsData = readJson("competitors.json");
const rivalEventsData = readJson("rival_events.json");
const assetManifestData = readJson("asset_manifest.json");
const growthPathsData = readJson("growth_paths.json");
const achievementsData = readJson("achievements.json");
const strategyCardsData = readJson("strategy_cards.json");
const metaUnlocksData = readJson("meta_unlocks.json");
const deckArchetypesData = readJson("deck_archetypes.json");
const deckSynergiesData = readJson("deck_synergies.json");
const starterDecksData = readJson("starter_decks.json");
const officeExpansionsData = readJson("office_expansions.json");
const officeSynergiesData = readJson("office_synergies.json");
const industrySynergiesData = readJson("industry_synergies.json");
const industryCombosData = readJson("industry_combos.json");
const officeZonesData = readJson("office_zones.json");
const officeSceneData = readJson("office_scene.json");
const officeReactionsData = readJson("office_reactions.json");
const workforceSynergiesData = readJson("workforce_synergies.json");
const annualReviewsData = readJson("annual_reviews.json");
const annualDirectiveChoicesData = readJson("annual_directive_choices.json");
const koLocaleData = readJson("locales/ko.json");
const enLocaleData = readJson("locales/en.json");

const resources = resourcesData?.resources ?? {};
const products = productsData?.products ?? [];
const productIdeaSubjects = productIdeasData?.subjects ?? [];
const productIdeaTypes = productIdeasData?.product_types ?? [];
const productIdeaBoldOptions = productIdeasData?.bold_options ?? [];
const productIdeaRules = productIdeasData?.compatibility_rules ?? [];
const capabilities = capabilitiesData?.capabilities ?? [];
const domains = domainsData?.domains ?? [];
const events = eventsData?.events ?? [];
const upgrades = upgradesData?.upgrades ?? [];
const automationUpgrades = automationData?.automation_upgrades ?? [];
const personas = personasData?.personas ?? [];
const companyStages = companyStagesData?.company_stages ?? [];
const companyLocations = companyLocationsData?.company_locations ?? [];
const campaignShocks = campaignShocksData?.campaign_shocks ?? [];
const worldEvents = worldEventsData?.world_events ?? [];
const runModifiers = runModifiersData ?? {};
const difficultyTiers = difficultyTiersData?.difficulty_tiers ?? [];
const derivationRules = derivationRulesData?.derivation_rules ?? [];
const campaignEndings = endingsData?.endings ?? [];
const agentTypes = agentTypesData?.agent_types ?? [];
const items = itemsData?.items ?? [];
const competitors = competitorsData?.competitors ?? [];
const rivalEvents = rivalEventsData?.rival_events ?? [];
const assetManifest = assetManifestData ?? {};
const growthPaths = growthPathsData?.growth_paths ?? [];
const achievements = achievementsData?.achievements ?? [];
const strategyCards = strategyCardsData?.strategy_cards ?? [];
const metaUnlocks = metaUnlocksData?.meta_unlocks ?? [];
const deckArchetypes = deckArchetypesData?.deck_archetypes ?? [];
const deckSynergies = deckSynergiesData?.deck_synergies ?? [];
const starterDecks = starterDecksData?.starter_decks ?? [];
const officeExpansions = officeExpansionsData?.office_expansions ?? [];
const officeSynergies = officeSynergiesData?.office_synergies ?? [];
const industrySynergies = industrySynergiesData?.industry_synergies ?? [];
const industryCombos = industryCombosData?.industry_combos ?? [];
const officeZones = officeZonesData?.office_zones ?? [];
const officeSceneObjects = officeSceneData?.office_scene_objects ?? [];
const officeReactions = officeReactionsData?.office_reactions ?? [];
const workforceSynergies = workforceSynergiesData?.workforce_synergies ?? [];
const annualReviews = annualReviewsData?.annual_reviews ?? [];
const annualDirectiveChoices = annualDirectiveChoicesData?.annual_directive_choices ?? [];
const localeKeys = new Set([...Object.keys(koLocaleData ?? {}), ...Object.keys(enLocaleData ?? {})]);

const resourceIds = new Set(Object.keys(resources));
const capabilityIds = idsAreUnique("capabilities", capabilities);
const domainIds = idsAreUnique("domains", domains);
const productIds = idsAreUnique("products", products);
idsAreUnique("product_ideas.subjects", productIdeaSubjects);
idsAreUnique("product_ideas.product_types", productIdeaTypes);
idsAreUnique("product_ideas.bold_options", productIdeaBoldOptions);
idsAreUnique("product_ideas.compatibility_rules", productIdeaRules);
idsAreUnique("events", events);
const upgradeIds = idsAreUnique("upgrades", upgrades);
idsAreUnique("automation_upgrades", automationUpgrades);
idsAreUnique("playtest_personas", personas);
idsAreUnique("company_stages", companyStages);
idsAreUnique("company_locations", companyLocations);
idsAreUnique("campaign_shocks", campaignShocks);
idsAreUnique("world_events", worldEvents);
const difficultyTierIds = idsAreUnique("difficulty_tiers", difficultyTiers);
const derivationRuleIds = idsAreUnique("derivation_rules", derivationRules);
idsAreUnique("endings", campaignEndings);
const agentTypeIds = idsAreUnique("agent_types", agentTypes);
const itemIds = idsAreUnique("items", items);
const competitorIds = idsAreUnique("competitors", competitors);
idsAreUnique("rival_events", rivalEvents);
const growthPathIds = idsAreUnique("growth_paths", growthPaths);
idsAreUnique("achievements", achievements);
const strategyCardIds = idsAreUnique("strategy_cards", strategyCards);
const metaUnlockIds = idsAreUnique("meta_unlocks", metaUnlocks);
idsAreUnique("deck_archetypes", deckArchetypes);
idsAreUnique("deck_synergies", deckSynergies);
idsAreUnique("starter_decks", starterDecks);
idsAreUnique("office_expansions", officeExpansions);
idsAreUnique("office_synergies", officeSynergies);
idsAreUnique("industry_synergies", industrySynergies);
idsAreUnique("industry_combos", industryCombos);
const officeZoneIds = idsAreUnique("office_zones", officeZones);
idsAreUnique("office_scene.office_scene_objects", officeSceneObjects);
idsAreUnique("office_reactions", officeReactions);
idsAreUnique("workforce_synergies", workforceSynergies);
idsAreUnique("annual_reviews", annualReviews);
idsAreUnique("annual_directive_choices", annualDirectiveChoices);

const runModifierDimensions = [
  ["start_cities", runModifiers.start_cities, "default_city", 11],
  ["world_lore", runModifiers.world_lore, "standard", 12],
  ["market_conditions", runModifiers.market_conditions, "steady_market", 8],
  ["founder_traits", runModifiers.founder_traits, "no_founder", 9],
];
const runModifierTagIds = new Set();

for (const [dimensionName, entries, defaultId, expectedCount] of runModifierDimensions) {
  if (!Array.isArray(entries) || entries.length === 0) {
    errors.push(`run_modifiers.${dimensionName}: expected a non-empty array`);
    continue;
  }
  if (entries.length !== expectedCount) {
    errors.push(`run_modifiers.${dimensionName}: expected ${expectedCount} entries, found ${entries.length}`);
  }

  const entryIds = idsAreUnique(`run_modifiers.${dimensionName}`, entries);
  if (!entryIds.has(defaultId)) errors.push(`run_modifiers.${dimensionName}: missing default id "${defaultId}"`);

  for (const entry of entries) {
    for (const field of ["name", "description", "starting_deltas", "tags"]) {
      if (!(field in entry)) errors.push(`run_modifiers.${dimensionName} "${entry.id}": missing ${field}`);
    }
    if (!entry.starting_deltas || typeof entry.starting_deltas !== "object" || Array.isArray(entry.starting_deltas)) {
      errors.push(`run_modifiers.${dimensionName} "${entry.id}": starting_deltas must be an object`);
    }
    validateResourceMap(`run_modifiers.${dimensionName} "${entry.id}" resources`, entry.starting_deltas?.resources, resourceIds);
    validateCapabilityDeltaMap(`run_modifiers.${dimensionName} "${entry.id}" capabilities`, entry.starting_deltas?.capabilities, capabilityIds);
    if (!Array.isArray(entry.tags) || entry.tags.length === 0 || entry.tags.some((tag) => typeof tag !== "string" || !tag.trim())) {
      errors.push(`run_modifiers.${dimensionName} "${entry.id}": tags must be a non-empty string array`);
    } else {
      for (const tag of entry.tags) runModifierTagIds.add(tag);
    }
  }

  const defaultEntry = entries.find((entry) => entry.id === defaultId);
  if (defaultEntry && !hasOnlyZeroDeltas(defaultEntry)) {
    errors.push(`run_modifiers.${dimensionName} "${defaultId}": default option must have zero starting deltas`);
  }
  if (defaultEntry && !hasEmptyStartingDeltas(defaultEntry)) {
    errors.push(`run_modifiers.${dimensionName} "${defaultId}": default option starting deltas must be empty objects`);
  }
}

const runModifierTagEffects = runModifiers.tag_effects;
const worldLoreTagIds = new Set();
for (const entry of runModifiers.world_lore ?? []) {
  if (entry?.id) worldLoreTagIds.add(entry.id);
  for (const tag of entry?.tags ?? []) worldLoreTagIds.add(tag);
}
const defaultRunModifierTags = new Set(["default_city", "standard_world", "steady_market", "no_founder"]);
const requiredRunModifierMonthlyEffectTags = [
  "compute_expensive",
  "gpu_scarcity",
  "research_slow",
  "market_boom",
  "enterprise_winter",
  "consumer_hype",
];

if (!runModifierTagEffects || typeof runModifierTagEffects !== "object" || Array.isArray(runModifierTagEffects)) {
  errors.push("run_modifiers.tag_effects: expected an object");
} else {
  for (const tag of requiredRunModifierMonthlyEffectTags) {
    if (!(tag in runModifierTagEffects)) errors.push(`run_modifiers.tag_effects: missing required monthly effect tag "${tag}"`);
  }

  for (const [tag, monthlyEffects] of Object.entries(runModifierTagEffects)) {
    if (!runModifierTagIds.has(tag)) errors.push(`run_modifiers.tag_effects "${tag}": unknown run modifier tag`);
    if (defaultRunModifierTags.has(tag)) errors.push(`run_modifiers.tag_effects "${tag}": default run tags must remain no-op`);
    if (!monthlyEffects || typeof monthlyEffects !== "object" || Array.isArray(monthlyEffects)) {
      errors.push(`run_modifiers.tag_effects "${tag}": monthly effect must be a resource map object`);
      continue;
    }
    validateResourceMap(`run_modifiers.tag_effects "${tag}"`, monthlyEffects, resourceIds);
    if (!Object.values(monthlyEffects).some((value) => typeof value === "number" && value !== 0)) {
      errors.push(`run_modifiers.tag_effects "${tag}": monthly effect must include at least one non-zero resource`);
    }
  }
}

if (!Array.isArray(difficultyTiers) || difficultyTiers.length !== 4) {
  errors.push(`difficulty_tiers: expected exactly 4 tiers, found ${Array.isArray(difficultyTiers) ? difficultyTiers.length : "non-array"}`);
}
for (const requiredTierId of ["story", "standard", "hard", "brutal"]) {
  if (!difficultyTierIds.has(requiredTierId)) errors.push(`difficulty_tiers: missing required tier "${requiredTierId}"`);
}
for (const tier of difficultyTiers) {
  for (const field of ["name", "description", "monthly_headwind", "reward_multiplier"]) {
    if (!(field in tier)) errors.push(`difficulty_tiers "${tier.id}": missing ${field}`);
  }
  if (!tier.monthly_headwind || typeof tier.monthly_headwind !== "object" || Array.isArray(tier.monthly_headwind)) {
    errors.push(`difficulty_tiers "${tier.id}": monthly_headwind must be a resource map object`);
  } else {
    validateResourceMap(`difficulty_tiers "${tier.id}" monthly_headwind`, tier.monthly_headwind, resourceIds);
  }
  if (typeof tier.reward_multiplier !== "number" || tier.reward_multiplier <= 0) {
    errors.push(`difficulty_tiers "${tier.id}": reward_multiplier must be a positive number`);
  }
}
const standardTier = difficultyTiers.find((tier) => tier.id === "standard");
if (standardTier && Object.keys(standardTier.monthly_headwind ?? {}).length > 0) {
  errors.push('difficulty_tiers "standard": monthly_headwind must stay empty');
}
if (standardTier && standardTier.reward_multiplier !== 1) {
  errors.push('difficulty_tiers "standard": reward_multiplier must be 1');
}

if (!Array.isArray(campaignEndings) || campaignEndings.length !== 12) {
  errors.push(`endings: expected exactly 12 campaign endings, found ${Array.isArray(campaignEndings) ? campaignEndings.length : "non-array"}`);
}

const endingReferenceSets = {
  start_city_ids: new Set((runModifiers.start_cities ?? []).map((entry) => entry.id)),
  world_lore_ids: new Set((runModifiers.world_lore ?? []).map((entry) => entry.id)),
  market_condition_ids: new Set((runModifiers.market_conditions ?? []).map((entry) => entry.id)),
  founder_trait_ids: new Set((runModifiers.founder_traits ?? []).map((entry) => entry.id)),
  challenge_tier_ids: difficultyTierIds,
  growth_path_ids: growthPathIds,
  archetype_ids: derivationRuleIds,
};
let fallbackEndingCount = 0;
const endingPriorities = new Set();
const finalEndingEntry = campaignEndings[campaignEndings.length - 1];

for (const ending of campaignEndings) {
  for (const field of ["title", "flavor", "priority", "meta_reward_bonus", "condition"]) {
    if (!(field in ending)) errors.push(`ending "${ending.id}": missing ${field}`);
  }
  if (typeof ending.priority !== "number") {
    errors.push(`ending "${ending.id}": priority must be numeric`);
  } else if (endingPriorities.has(ending.priority)) {
    errors.push(`ending "${ending.id}": priority must be unique`);
  } else {
    endingPriorities.add(ending.priority);
  }
  if (typeof ending.meta_reward_bonus !== "number" || ending.meta_reward_bonus < 0 || ending.meta_reward_bonus > 5) {
    errors.push(`ending "${ending.id}": meta_reward_bonus must be a number from 0 to 5`);
  }
  if (typeof ending.title !== "string" || ending.title.trim().length === 0) {
    errors.push(`ending "${ending.id}": title must be a non-empty string`);
  }
  if (typeof ending.flavor !== "string" || ending.flavor.trim().length < 20) {
    errors.push(`ending "${ending.id}": flavor must be a descriptive string`);
  }

  const condition = ending.condition ?? {};
  if (!condition || typeof condition !== "object" || Array.isArray(condition)) {
    errors.push(`ending "${ending.id}": condition must be an object`);
    continue;
  }
  if (condition.fallback === true) {
    fallbackEndingCount += 1;
    if (ending !== finalEndingEntry) errors.push(`ending "${ending.id}": fallback ending must be the final entry`);
    if (ending.priority !== 0) errors.push(`ending "${ending.id}": fallback ending priority must be 0`);
    if (ending.meta_reward_bonus !== 0) errors.push(`ending "${ending.id}": fallback ending meta_reward_bonus must be 0`);
  } else {
    if (condition.status !== "success") errors.push(`ending "${ending.id}": non-fallback ending must require status success`);
    if (condition.min_month !== 120) errors.push(`ending "${ending.id}": non-fallback ending must require min_month 120`);
    if (ending.meta_reward_bonus <= 0) errors.push(`ending "${ending.id}": non-fallback ending meta_reward_bonus must be positive`);
  }
  if ("status" in condition && !["playing", "success", "failure", "any"].includes(condition.status)) {
    errors.push(`ending "${ending.id}": unknown status condition "${condition.status}"`);
  }
  for (const numericField of ["min_month", "min_products"]) {
    if (numericField in condition && (typeof condition[numericField] !== "number" || condition[numericField] < 0)) {
      errors.push(`ending "${ending.id}": ${numericField} must be a non-negative number`);
    }
  }
  if ("min_resources" in condition) {
    if (!condition.min_resources || typeof condition.min_resources !== "object" || Array.isArray(condition.min_resources)) {
      errors.push(`ending "${ending.id}": min_resources must be a resource map object`);
    } else {
      validateResourceMap(`ending "${ending.id}" min_resources`, condition.min_resources, resourceIds);
    }
  }

  for (const [conditionField, allowedIds] of Object.entries(endingReferenceSets)) {
    if (!(conditionField in condition)) continue;
    if (!Array.isArray(condition[conditionField])) {
      errors.push(`ending "${ending.id}": ${conditionField} must be a string array`);
      continue;
    }
    for (const id of condition[conditionField]) {
      if (typeof id !== "string" || !id.trim()) {
        errors.push(`ending "${ending.id}": ${conditionField} contains an empty id`);
      } else if (!allowedIds.has(id)) {
        errors.push(`ending "${ending.id}": ${conditionField} references unknown id "${id}"`);
      }
    }
  }
}

if (fallbackEndingCount !== 1) {
  errors.push(`endings: expected exactly one fallback ending, found ${fallbackEndingCount}`);
}

if (worldEvents.length < 10 || worldEvents.length > 28) {
  errors.push(`world_events: expected about 10-28 events, found ${worldEvents.length}`);
}

for (const event of worldEvents) {
  for (const field of ["title", "description", "trigger", "year_range", "resource_effects"]) {
    if (!(field in event)) errors.push(`world_events "${event.id}": missing ${field}`);
  }

  if (!Array.isArray(event.year_range) || event.year_range.length !== 2) {
    errors.push(`world_events "${event.id}": year_range must be a [min,max] tuple`);
  } else {
    const [minYear, maxYear] = event.year_range;
    if (!Number.isInteger(minYear) || !Number.isInteger(maxYear) || minYear < 1 || maxYear > 10 || minYear > maxYear) {
      errors.push(`world_events "${event.id}": year_range must stay inside campaign years 1-10`);
    }
  }

  if (!event.resource_effects || typeof event.resource_effects !== "object" || Array.isArray(event.resource_effects)) {
    errors.push(`world_events "${event.id}": resource_effects must be an object`);
  } else {
    validateResourceMap(`world_events "${event.id}" resource_effects`, event.resource_effects, resourceIds);
    if (!Object.values(event.resource_effects).some((value) => typeof value === "number" && value !== 0)) {
      errors.push(`world_events "${event.id}": resource_effects must include at least one non-zero resource`);
    }
  }

  if ("world_lore_tags" in event) {
    if (!Array.isArray(event.world_lore_tags)) {
      errors.push(`world_events "${event.id}": world_lore_tags must be a string array when present`);
    } else {
      for (const tag of event.world_lore_tags) {
        if (typeof tag !== "string" || !tag.trim()) {
          errors.push(`world_events "${event.id}": world_lore_tags must contain only non-empty strings`);
        } else if (!worldLoreTagIds.has(tag)) {
          errors.push(`world_events "${event.id}": world_lore_tags contains unknown world-lore tag "${tag}"`);
        }
      }
    }
  }
}

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

for (const subject of productIdeaSubjects) {
  if (!domainIds.has(subject.domain)) errors.push(`product_ideas subject "${subject.id}": unknown domain "${subject.domain}"`);
  if (!Array.isArray(subject.tags) || subject.tags.length === 0) errors.push(`product_ideas subject "${subject.id}": tags required`);
  if (typeof subject.market_heat !== "number") errors.push(`product_ideas subject "${subject.id}": market_heat must be numeric`);
  if (typeof subject.risk !== "number") errors.push(`product_ideas subject "${subject.id}": risk must be numeric`);
  for (const capabilityId of Object.keys(subject.capability_bias ?? {})) {
    if (!capabilityIds.has(capabilityId)) errors.push(`product_ideas subject "${subject.id}": unknown capability "${capabilityId}"`);
  }
}

for (const productType of productIdeaTypes) {
  if (!Array.isArray(productType.tags) || productType.tags.length === 0) errors.push(`product_ideas type "${productType.id}": tags required`);
  if (typeof productType.cost_multiplier !== "number") errors.push(`product_ideas type "${productType.id}": cost_multiplier must be numeric`);
  if (typeof productType.score_bonus !== "number") errors.push(`product_ideas type "${productType.id}": score_bonus must be numeric`);
  for (const capabilityId of Object.keys(productType.capability_bias ?? {})) {
    if (!capabilityIds.has(capabilityId)) errors.push(`product_ideas type "${productType.id}": unknown capability "${capabilityId}"`);
  }
}

for (const option of productIdeaBoldOptions) {
  if (!Array.isArray(option.tags) || option.tags.length === 0) errors.push(`product_ideas option "${option.id}": tags required`);
  for (const field of ["cost_multiplier", "score_delta", "risk_delta"]) {
    if (typeof option[field] !== "number") errors.push(`product_ideas option "${option.id}": ${field} must be numeric`);
  }
}

if (productIdeaSubjects.length * productIdeaTypes.length * productIdeaBoldOptions.length < 5000) {
  errors.push("product_ideas: expected at least 5000 possible combinations");
}

if (productIdeaRules.length < 30) {
  errors.push("product_ideas: expected at least 30 compatibility rules");
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

for (const location of companyLocations) {
  for (const field of ["name", "region", "description", "talent_pool", "monthly_cost_modifier", "human_hire_discount", "ai_operation_bonus", "cost", "unlock_requirements"]) {
    if (!(field in location)) errors.push(`company_location "${location.id}": missing ${field}`);
  }
  for (const numericField of ["monthly_cost_modifier", "human_hire_discount", "ai_operation_bonus"]) {
    if (typeof location[numericField] !== "number") {
      errors.push(`company_location "${location.id}": ${numericField} must be numeric`);
    }
  }
  validateResourceMap(`company_location "${location.id}" cost`, location.cost, resourceIds);
  for (const [requirement, value] of Object.entries(location.unlock_requirements ?? {})) {
    if (!["min_star", "min_month", "min_products", "min_users", "min_trust", "min_cash"].includes(requirement)) {
      errors.push(`company_location "${location.id}": unknown unlock requirement "${requirement}"`);
    }
    if (typeof value !== "number") errors.push(`company_location "${location.id}": unlock requirement "${requirement}" must be numeric`);
  }
}

for (const shock of campaignShocks) {
  for (const field of [
    "month",
    "year",
    "title",
    "description",
    "pressure_summary",
    "milestone_label",
    "shareable_hook",
    "resource_effects",
    "rival_momentum_delta",
    "rival_focus_domains",
    "recommended_product_ids",
    "recommended_capability_ids",
    "unlock_domain_ids",
  ]) {
    if (!(field in shock)) errors.push(`campaign_shock "${shock.id}": missing ${field}`);
  }
  if (typeof shock.month !== "number" || shock.month < 1 || shock.month > 120) {
    errors.push(`campaign_shock "${shock.id}": month must be 1-120`);
  }
  if (typeof shock.year !== "number") errors.push(`campaign_shock "${shock.id}": year must be numeric`);
  if (typeof shock.rival_momentum_delta !== "number") {
    errors.push(`campaign_shock "${shock.id}": rival_momentum_delta must be numeric`);
  }
  validateResourceMap(`campaign_shock "${shock.id}" resource_effects`, shock.resource_effects, resourceIds);
  for (const domainId of shock.rival_focus_domains ?? []) {
    if (!domainIds.has(domainId)) errors.push(`campaign_shock "${shock.id}": unknown rival focus domain "${domainId}"`);
  }
  for (const productId of shock.recommended_product_ids ?? []) {
    if (!productIds.has(productId)) errors.push(`campaign_shock "${shock.id}": unknown recommended product "${productId}"`);
  }
  for (const capabilityId of shock.recommended_capability_ids ?? []) {
    if (!capabilityIds.has(capabilityId)) errors.push(`campaign_shock "${shock.id}": unknown recommended capability "${capabilityId}"`);
  }
  for (const domainId of shock.unlock_domain_ids ?? []) {
    if (!domainIds.has(domainId)) errors.push(`campaign_shock "${shock.id}": unknown unlock domain "${domainId}"`);
  }
}

if (campaignShocks.length < 3) {
  errors.push("campaign_shocks: expected at least three 10-year pacing shocks");
}

const allowedAgentStats = new Set(["research", "engineering", "product", "growth", "safety", "operations", "creativity", "autonomy"]);
for (const agent of agentTypes) {
  if ("kind" in agent && !["human", "ai_agent", "robot"].includes(agent.kind)) {
    errors.push(`agent_type "${agent.id}": unknown kind "${agent.kind}"`);
  }
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

for (const expansion of officeExpansions) {
  for (const field of ["name", "description", "level", "hire_capacity", "decoration_slots", "monthly_effects", "cost", "unlock_requirements"]) {
    if (!(field in expansion)) errors.push(`office_expansion "${expansion.id}": missing ${field}`);
  }
  for (const numericField of ["level", "hire_capacity", "decoration_slots"]) {
    if (typeof expansion[numericField] !== "number" || expansion[numericField] < 1) {
      errors.push(`office_expansion "${expansion.id}": ${numericField} must be a positive number`);
    }
  }
  validateResourceMap(`office_expansion "${expansion.id}" monthly_effects`, expansion.monthly_effects, resourceIds);
  validateResourceMap(`office_expansion "${expansion.id}" cost`, expansion.cost, resourceIds);
  for (const [requirement, value] of Object.entries(expansion.unlock_requirements ?? {})) {
    if (!["min_month", "min_products", "min_users", "min_trust", "min_cash", "min_data", "min_talent", "min_automation"].includes(requirement)) {
      errors.push(`office_expansion "${expansion.id}": unknown unlock requirement "${requirement}"`);
    }
    if (typeof value !== "number") errors.push(`office_expansion "${expansion.id}": unlock requirement "${requirement}" must be numeric`);
  }
}

for (const synergy of officeSynergies) {
  for (const field of ["title", "description", "required_categories", "required_effects", "monthly_effects", "tags"]) {
    if (!(field in synergy)) errors.push(`office_synergy "${synergy.id}": missing ${field}`);
  }
  for (const [category, value] of Object.entries(synergy.required_categories ?? {})) {
    if (typeof category !== "string" || !category) errors.push(`office_synergy "${synergy.id}": invalid required category`);
    if (typeof value !== "number" || value < 1) errors.push(`office_synergy "${synergy.id}": required category "${category}" must be positive`);
  }
  for (const [effectKey, value] of Object.entries(synergy.required_effects ?? {})) {
    if (![...resourceIds, ...allowedAgentStats].includes(effectKey)) errors.push(`office_synergy "${synergy.id}": unknown required effect "${effectKey}"`);
    if (typeof value !== "number" || value < 1) errors.push(`office_synergy "${synergy.id}": required effect "${effectKey}" must be positive`);
  }
  validateResourceMap(`office_synergy "${synergy.id}" monthly_effects`, synergy.monthly_effects, resourceIds);
  if (!Array.isArray(synergy.tags) || synergy.tags.length === 0) {
    errors.push(`office_synergy "${synergy.id}": tags must be a non-empty array`);
  }
}

if (industrySynergies.length !== 10) errors.push(`industry_synergies: expected exactly 10 synergies, found ${industrySynergies.length}`);
for (const synergy of industrySynergies) {
  for (const field of ["title", "description", "required_domains", "monthly_effects", "tags"]) {
    if (!(field in synergy)) errors.push(`industry_synergy "${synergy.id}": missing ${field}`);
  }
  if (!Array.isArray(synergy.required_domains) || synergy.required_domains.length < 2) {
    errors.push(`industry_synergy "${synergy.id}": required_domains must include at least two domains`);
  }
  for (const domainId of synergy.required_domains ?? []) {
    if (!domainIds.has(domainId)) errors.push(`industry_synergy "${synergy.id}": unknown domain "${domainId}"`);
  }
  validateResourceMap(`industry_synergy "${synergy.id}" monthly_effects`, synergy.monthly_effects, resourceIds);
  if (!Array.isArray(synergy.tags) || synergy.tags.length === 0) {
    errors.push(`industry_synergy "${synergy.id}": tags must be a non-empty array`);
  }
}

if (industryCombos.length !== 10) errors.push(`industry_combos: expected exactly 10 combos, found ${industryCombos.length}`);
for (const combo of industryCombos) {
  for (const field of ["title", "description", "required_domains", "monthly_effects", "risk_label", "tags"]) {
    if (!(field in combo)) errors.push(`industry_combo "${combo.id}": missing ${field}`);
  }
  if (!Array.isArray(combo.required_domains) || combo.required_domains.length < 2 || combo.required_domains.length > 3) {
    errors.push(`industry_combo "${combo.id}": required_domains must include two or three domains`);
  }
  for (const domainId of combo.required_domains ?? []) {
    if (!domainIds.has(domainId)) errors.push(`industry_combo "${combo.id}": unknown domain "${domainId}"`);
  }
  validateResourceMap(`industry_combo "${combo.id}" monthly_effects`, combo.monthly_effects, resourceIds);
  if (!Object.values(combo.monthly_effects ?? {}).some((value) => typeof value === "number" && value < 0)) {
    errors.push(`industry_combo "${combo.id}": monthly_effects must include at least one negative downside`);
  }
  if (typeof combo.risk_label !== "string" || combo.risk_label.trim().length === 0) {
    errors.push(`industry_combo "${combo.id}": risk_label must be a non-empty string`);
  }
  if (!Array.isArray(combo.tags) || combo.tags.length === 0) {
    errors.push(`industry_combo "${combo.id}": tags must be a non-empty array`);
  }
}

for (const zone of officeZones) {
  for (const field of ["title", "description", "min_office_level", "required_resources", "required_capabilities", "required_domains", "required_active_products", "required_hired_agents", "monthly_effects", "tags"]) {
    if (!(field in zone)) errors.push(`office_zone "${zone.id}": missing ${field}`);
  }
  if (typeof zone.min_office_level !== "number" || zone.min_office_level < 1) {
    errors.push(`office_zone "${zone.id}": min_office_level must be a positive number`);
  }
  validateResourceMap(`office_zone "${zone.id}" required_resources`, zone.required_resources, resourceIds);
  validateResourceMap(`office_zone "${zone.id}" monthly_effects`, zone.monthly_effects, resourceIds);
  for (const [capabilityId, value] of Object.entries(zone.required_capabilities ?? {})) {
    if (!capabilityIds.has(capabilityId)) errors.push(`office_zone "${zone.id}": unknown capability "${capabilityId}"`);
    if (typeof value !== "number" || value < 1) errors.push(`office_zone "${zone.id}": required capability "${capabilityId}" must be positive`);
  }
  for (const domainId of zone.required_domains ?? []) {
    if (!domainIds.has(domainId)) errors.push(`office_zone "${zone.id}": unknown domain "${domainId}"`);
  }
  for (const field of ["required_active_products", "required_hired_agents"]) {
    if (typeof zone[field] !== "number" || zone[field] < 0) errors.push(`office_zone "${zone.id}": ${field} must be a non-negative number`);
  }
  if (!Array.isArray(zone.tags) || zone.tags.length === 0) {
    errors.push(`office_zone "${zone.id}": tags must be a non-empty array`);
  }
}

for (const object of officeSceneObjects) {
  for (const field of ["label", "kind", "min_office_level", "x", "y", "w", "h", "palette", "activity", "tags"]) {
    if (!(field in object)) errors.push(`office_scene object "${object.id}": missing ${field}`);
  }
  if (typeof object.min_office_level !== "number" || object.min_office_level < 1) {
    errors.push(`office_scene object "${object.id}": min_office_level must be a positive number`);
  }
  for (const field of ["x", "y", "w", "h"]) {
    if (typeof object[field] !== "number" || object[field] < 0 || object[field] > 100) {
      errors.push(`office_scene object "${object.id}": ${field} must be a 0-100 number`);
    }
  }
  if ((object.w ?? 0) <= 0 || (object.h ?? 0) <= 0) {
    errors.push(`office_scene object "${object.id}": w and h must be positive`);
  }
  validatePalette(`office_scene object "${object.id}"`, object.palette);
  if (object.required_zone_id && !officeZoneIds.has(object.required_zone_id)) {
    errors.push(`office_scene object "${object.id}": unknown required_zone_id "${object.required_zone_id}"`);
  }
  if (!Array.isArray(object.tags) || object.tags.length === 0) {
    errors.push(`office_scene object "${object.id}": tags must be a non-empty array`);
  }
}

if (officeSceneObjects.length < 10) {
  errors.push("office_scene: expected at least 10 office scene objects");
}

const officeReactionTriggers = new Set(["card_use", "product_launch", "rival_alert", "staff_incident"]);
const officeReactionTones = new Set(["boost", "success", "warning", "danger"]);
for (const reaction of officeReactions) {
  for (const field of ["trigger", "label", "bubble", "detail", "tone", "x", "y", "duration_ms", "priority", "tags"]) {
    if (!(field in reaction)) errors.push(`office_reactions "${reaction.id}": missing ${field}`);
  }
  if (!officeReactionTriggers.has(reaction.trigger)) {
    errors.push(`office_reactions "${reaction.id}": unknown trigger "${reaction.trigger}"`);
  }
  if (!officeReactionTones.has(reaction.tone)) {
    errors.push(`office_reactions "${reaction.id}": unknown tone "${reaction.tone}"`);
  }
  for (const field of ["x", "y"]) {
    if (typeof reaction[field] !== "number" || reaction[field] < 0 || reaction[field] > 100) {
      errors.push(`office_reactions "${reaction.id}": ${field} must be a 0-100 number`);
    }
  }
  if (typeof reaction.duration_ms !== "number" || reaction.duration_ms < 500) {
    errors.push(`office_reactions "${reaction.id}": duration_ms must be at least 500`);
  }
  if (typeof reaction.priority !== "number") {
    errors.push(`office_reactions "${reaction.id}": priority must be a number`);
  }
  if (!Array.isArray(reaction.tags) || reaction.tags.length === 0) {
    errors.push(`office_reactions "${reaction.id}": tags must be a non-empty array`);
  }
}

for (const trigger of officeReactionTriggers) {
  if (!officeReactions.some((reaction) => reaction.trigger === trigger)) {
    errors.push(`office_reactions: missing trigger "${trigger}"`);
  }
}

for (const synergy of workforceSynergies) {
  for (const field of ["title", "description", "required_kinds", "stat_effects", "project_effects", "tags"]) {
    if (!(field in synergy)) errors.push(`workforce_synergy "${synergy.id}": missing ${field}`);
  }
  for (const [kind, value] of Object.entries(synergy.required_kinds ?? {})) {
    if (!["human", "ai_agent", "robot"].includes(kind)) errors.push(`workforce_synergy "${synergy.id}": unknown kind "${kind}"`);
    if (typeof value !== "number" || value < 1) errors.push(`workforce_synergy "${synergy.id}": kind "${kind}" must be positive`);
  }
  for (const [effectKey, value] of Object.entries(synergy.stat_effects ?? {})) {
    if (![...resourceIds, ...allowedAgentStats].includes(effectKey)) errors.push(`workforce_synergy "${synergy.id}": unknown stat effect "${effectKey}"`);
    if (typeof value !== "number") errors.push(`workforce_synergy "${synergy.id}": stat effect "${effectKey}" must be numeric`);
  }
  for (const [effectKey, value] of Object.entries(synergy.project_effects ?? {})) {
    if (!["quality", "progress"].includes(effectKey)) errors.push(`workforce_synergy "${synergy.id}": unknown project effect "${effectKey}"`);
    if (typeof value !== "number") errors.push(`workforce_synergy "${synergy.id}": project effect "${effectKey}" must be numeric`);
  }
  if (!Array.isArray(synergy.tags) || synergy.tags.length === 0) {
    errors.push(`workforce_synergy "${synergy.id}": tags must be a non-empty array`);
  }
}

const allowedAnnualReviewRequirements = new Set([
  "min_products",
  "min_domains",
  "min_users",
  "min_hype",
  "min_trust",
  "min_cash",
  "min_data",
  "min_compute",
  "min_automation",
  "min_talent",
  "min_star",
]);
const annualReviewMenuIds = new Set(["company", "products", "deck", "agents", "research", "shop", "competition", "log"]);
if (annualReviews.length !== 10) errors.push(`annual_reviews: expected 10 yearly reviews, found ${annualReviews.length}`);
for (const [index, review] of annualReviews.entries()) {
  for (const field of ["year", "month", "title", "description", "requirements", "reward", "consolation_reward", "spotlight", "directive"]) {
    if (!(field in review)) errors.push(`annual_review "${review.id}": missing ${field}`);
  }
  if (typeof review.year !== "number" || review.year !== index + 1) {
    errors.push(`annual_review "${review.id}": year must equal ${index + 1}`);
  }
  if (typeof review.month !== "number" || review.month !== (index + 1) * 12) {
    errors.push(`annual_review "${review.id}": month must equal ${(index + 1) * 12}`);
  }
  validateResourceMap(`annual_review "${review.id}" reward`, review.reward, resourceIds);
  validateResourceMap(`annual_review "${review.id}" consolation_reward`, review.consolation_reward, resourceIds);
  for (const [requirement, value] of Object.entries(review.requirements ?? {})) {
    if (!allowedAnnualReviewRequirements.has(requirement) && !requirement.startsWith("min_capability_")) {
      errors.push(`annual_review "${review.id}": unknown requirement "${requirement}"`);
    }
    if (requirement.startsWith("min_capability_")) {
      const capabilityId = requirement.replace("min_capability_", "");
      if (!capabilityIds.has(capabilityId)) errors.push(`annual_review "${review.id}": unknown capability requirement "${capabilityId}"`);
    }
    if (typeof value !== "number") errors.push(`annual_review "${review.id}": requirement "${requirement}" must be numeric`);
  }
  for (const outcome of ["passed", "recovery"]) {
    const directive = review.directive?.[outcome];
    if (!directive) {
      errors.push(`annual_review "${review.id}": missing ${outcome} directive`);
      continue;
    }
    for (const field of ["title", "description", "monthly_effects", "recommended_menu", "rival_momentum_delta"]) {
      if (!(field in directive)) errors.push(`annual_review "${review.id}" ${outcome} directive: missing ${field}`);
    }
    validateResourceMap(`annual_review "${review.id}" ${outcome} directive monthly_effects`, directive.monthly_effects, resourceIds);
    if (!annualReviewMenuIds.has(directive.recommended_menu)) {
      errors.push(`annual_review "${review.id}" ${outcome} directive: unknown recommended_menu "${directive.recommended_menu}"`);
    }
    if (typeof directive.rival_momentum_delta !== "number") {
      errors.push(`annual_review "${review.id}" ${outcome} directive: rival_momentum_delta must be numeric`);
    }
  }
}

if (annualDirectiveChoices.length < 6) {
  errors.push(`annual_directive_choices: expected at least 6 choices, found ${annualDirectiveChoices.length}`);
}
for (const choice of annualDirectiveChoices) {
  for (const field of ["title", "description", "sources", "year_range", "monthly_effects", "recommended_menu", "rival_momentum_delta", "tags", "reward_bias_tags"]) {
    if (!(field in choice)) errors.push(`annual_directive_choice "${choice.id}": missing ${field}`);
  }
  if (!Array.isArray(choice.sources) || choice.sources.length === 0) {
    errors.push(`annual_directive_choice "${choice.id}": sources must be a non-empty array`);
  } else {
    for (const source of choice.sources) {
      if (!["passed", "recovery"].includes(source)) {
        errors.push(`annual_directive_choice "${choice.id}": unknown source "${source}"`);
      }
    }
  }
  if (
    !Array.isArray(choice.year_range) ||
    choice.year_range.length !== 2 ||
    typeof choice.year_range[0] !== "number" ||
    typeof choice.year_range[1] !== "number" ||
    choice.year_range[0] < 1 ||
    choice.year_range[1] > 10 ||
    choice.year_range[0] > choice.year_range[1]
  ) {
    errors.push(`annual_directive_choice "${choice.id}": year_range must be [min,max] within 1-10`);
  }
  validateResourceMap(`annual_directive_choice "${choice.id}" monthly_effects`, choice.monthly_effects, resourceIds);
  if (!annualReviewMenuIds.has(choice.recommended_menu)) {
    errors.push(`annual_directive_choice "${choice.id}": unknown recommended_menu "${choice.recommended_menu}"`);
  }
  if (typeof choice.rival_momentum_delta !== "number") {
    errors.push(`annual_directive_choice "${choice.id}": rival_momentum_delta must be numeric`);
  }
  if (!Array.isArray(choice.tags) || choice.tags.length === 0) {
    errors.push(`annual_directive_choice "${choice.id}": tags must be a non-empty array`);
  }
  if (!Array.isArray(choice.reward_bias_tags) || choice.reward_bias_tags.length === 0) {
    errors.push(`annual_directive_choice "${choice.id}": reward_bias_tags must be a non-empty array`);
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
  if ("entry_month" in competitor && (typeof competitor.entry_month !== "number" || competitor.entry_month < 1)) {
    errors.push(`competitor "${competitor.id}": entry_month must be a positive number`);
  }
  if ("rival_tier" in competitor && !["initial", "annual_challenger", "late_boss"].includes(competitor.rival_tier)) {
    errors.push(`competitor "${competitor.id}": unknown rival_tier "${competitor.rival_tier}"`);
  }
  if ("entry_announcement" in competitor && typeof competitor.entry_announcement !== "string") {
    errors.push(`competitor "${competitor.id}": entry_announcement must be a string`);
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

const menuIds = new Set(["company", "products", "deck", "agents", "research", "shop", "competition", "log"]);
for (const path of growthPaths) {
  for (const field of ["title", "description", "target_menu", "action_label", "payoff", "bonus_description"]) {
    if (!path[field]) errors.push(`growth_path "${path.id}": missing ${field}`);
  }
  if (typeof path.order !== "number") errors.push(`growth_path "${path.id}": order must be numeric`);
  validateResourceMap(`growth_path "${path.id}" commitment_effects`, path.commitment_effects, resourceIds);
  validateResourceMap(`growth_path "${path.id}" monthly_effects`, path.monthly_effects, resourceIds);
  if (!path.monthly_effects || Object.keys(path.monthly_effects).length === 0) {
    errors.push(`growth_path "${path.id}": monthly_effects must not be empty`);
  }
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
  for (const objective of path.followup_objectives ?? []) {
    if (!objective.id) errors.push(`growth_path "${path.id}": objective missing id`);
    for (const field of ["label", "description", "target_menu", "completion"]) {
      if (!objective[field]) errors.push(`growth_path "${path.id}" objective "${objective.id}": missing ${field}`);
    }
    if (!menuIds.has(objective.target_menu)) {
      errors.push(`growth_path "${path.id}" objective "${objective.id}": unknown target_menu "${objective.target_menu}"`);
    }
    const completion = objective.completion ?? {};
    if (completion.product_id && !productIds.has(completion.product_id)) {
      errors.push(`growth_path "${path.id}" objective "${objective.id}": unknown product "${completion.product_id}"`);
    }
    if (completion.capability_id && !capabilityIds.has(completion.capability_id)) {
      errors.push(`growth_path "${path.id}" objective "${objective.id}": unknown capability "${completion.capability_id}"`);
    }
    if (completion.owned_item_id && !itemIds.has(completion.owned_item_id)) {
      errors.push(`growth_path "${path.id}" objective "${objective.id}": unknown item "${completion.owned_item_id}"`);
    }
    if (completion.purchased_upgrade_id && !upgradeIds.has(completion.purchased_upgrade_id)) {
      errors.push(`growth_path "${path.id}" objective "${objective.id}": unknown upgrade "${completion.purchased_upgrade_id}"`);
    }
    if (completion.min_resource && !resourceIds.has(completion.min_resource)) {
      errors.push(`growth_path "${path.id}" objective "${objective.id}": unknown resource "${completion.min_resource}"`);
    }
    if ("capability_level" in completion && typeof completion.capability_level !== "number") {
      errors.push(`growth_path "${path.id}" objective "${objective.id}": capability_level must be numeric`);
    }
    if ("min_value" in completion && typeof completion.min_value !== "number") {
      errors.push(`growth_path "${path.id}" objective "${objective.id}": min_value must be numeric`);
    }
  }
}

const allowedAchievementConditions = new Set([
  "min_month",
  "min_products",
  "min_capability_upgrades",
  "min_growth_objectives",
  "min_resolved_events",
  "min_users",
  "min_cash",
]);
for (const achievement of achievements) {
  for (const field of ["title", "description", "condition", "reward"]) {
    if (!achievement[field]) errors.push(`achievement "${achievement.id}": missing ${field}`);
  }
  if (typeof achievement.order !== "number") errors.push(`achievement "${achievement.id}": order must be numeric`);
  validateResourceMap(`achievement "${achievement.id}" reward`, achievement.reward, resourceIds);
  for (const [condition, value] of Object.entries(achievement.condition ?? {})) {
    if (!allowedAchievementConditions.has(condition)) {
      errors.push(`achievement "${achievement.id}": unknown condition "${condition}"`);
    }
    if (typeof value !== "number") {
      errors.push(`achievement "${achievement.id}": condition "${condition}" must be numeric`);
    }
  }
}

const allowedCardCategories = new Set(["build", "ops", "product", "safety", "growth", "research", "automation"]);
const allowedCardRarities = new Set(["starter", "common", "uncommon", "rare", "epic"]);
const allowedCardEffects = new Set([
  ...resourceIds,
  "project_progress",
  "project_quality",
  "puzzle_score_bonus",
  "puzzle_difficulty_delta",
  "puzzle_tile_limit",
  "rival_score_delta",
  "rival_momentum_delta",
]);
for (const card of strategyCards) {
  for (const field of ["name", "category", "rarity", "description", "cost", "effects", "tags", "copies", "unlock_requirements"]) {
    if (!(field in card)) errors.push(`strategy_card "${card.id}": missing ${field}`);
  }
  if (!allowedCardCategories.has(card.category)) errors.push(`strategy_card "${card.id}": unknown category "${card.category}"`);
  if (!allowedCardRarities.has(card.rarity)) errors.push(`strategy_card "${card.id}": unknown rarity "${card.rarity}"`);
  if (typeof card.copies !== "number" || card.copies < 1) errors.push(`strategy_card "${card.id}": copies must be a positive number`);
  if (!Array.isArray(card.tags) || card.tags.length === 0) errors.push(`strategy_card "${card.id}": tags must be a non-empty array`);
  if (card.unlock_meta_id && !metaUnlockIds.has(card.unlock_meta_id)) {
    errors.push(`strategy_card "${card.id}": unknown unlock_meta_id "${card.unlock_meta_id}"`);
  }
  validateResourceMap(`strategy_card "${card.id}" cost`, card.cost, resourceIds);
  for (const [effectKey, value] of Object.entries(card.effects ?? {})) {
    if (!allowedCardEffects.has(effectKey)) errors.push(`strategy_card "${card.id}": unknown effect "${effectKey}"`);
    if (typeof value !== "number") errors.push(`strategy_card "${card.id}": effect "${effectKey}" must be numeric`);
  }
  for (const [requirement, value] of Object.entries(card.unlock_requirements ?? {})) {
    if (
      ![
        "min_month",
        "min_products",
        "min_trust",
      ].includes(requirement) &&
      !requirement.startsWith("min_capability_")
    ) {
      errors.push(`strategy_card "${card.id}": unknown unlock requirement "${requirement}"`);
    }
    if (requirement.startsWith("min_capability_")) {
      const capabilityId = requirement.replace("min_capability_", "");
      if (!capabilityIds.has(capabilityId)) errors.push(`strategy_card "${card.id}": unknown capability requirement "${capabilityId}"`);
    }
    if (typeof value !== "number") errors.push(`strategy_card "${card.id}": unlock requirement "${requirement}" must be numeric`);
  }
}

for (const unlock of metaUnlocks) {
  for (const field of ["title", "description", "cost", "starting_resource_effects", "unlock_card_ids", "tags"]) {
    if (!(field in unlock)) errors.push(`meta_unlock "${unlock.id}": missing ${field}`);
  }
  if (typeof unlock.cost !== "number" || unlock.cost < 0) errors.push(`meta_unlock "${unlock.id}": cost must be a non-negative number`);
  validateResourceMap(`meta_unlock "${unlock.id}" starting_resource_effects`, unlock.starting_resource_effects, resourceIds);
  for (const cardId of unlock.unlock_card_ids ?? []) {
    if (!strategyCardIds.has(cardId)) errors.push(`meta_unlock "${unlock.id}": unknown card "${cardId}"`);
  }
  if (!Array.isArray(unlock.tags) || unlock.tags.length === 0) errors.push(`meta_unlock "${unlock.id}": tags must be a non-empty array`);
}

for (const archetype of deckArchetypes) {
  for (const field of ["title", "description", "tags", "recommended_next_tags", "warning_missing_tags"]) {
    if (!(field in archetype)) errors.push(`deck_archetype "${archetype.id}": missing ${field}`);
  }
  for (const arrayField of ["tags", "recommended_next_tags", "warning_missing_tags"]) {
    if (!Array.isArray(archetype[arrayField]) || archetype[arrayField].length === 0) {
      errors.push(`deck_archetype "${archetype.id}": ${arrayField} must be a non-empty array`);
    }
  }
}

for (const synergy of deckSynergies) {
  for (const field of ["title", "description", "required_tags", "monthly_effects", "play_effect_tags", "play_effect_multiplier", "risk_label"]) {
    if (!(field in synergy)) errors.push(`deck_synergy "${synergy.id}": missing ${field}`);
  }
  if (!synergy.required_tags || Object.keys(synergy.required_tags).length < 2) {
    errors.push(`deck_synergy "${synergy.id}": required_tags needs at least 2 entries`);
  }
  for (const [tag, value] of Object.entries(synergy.required_tags ?? {})) {
    if (typeof tag !== "string" || !tag) errors.push(`deck_synergy "${synergy.id}": invalid required tag`);
    if (typeof value !== "number" || value <= 0) errors.push(`deck_synergy "${synergy.id}": required tag "${tag}" must be positive`);
  }
  validateResourceMap(`deck_synergy "${synergy.id}" monthly_effects`, synergy.monthly_effects, resourceIds);
  if (!Array.isArray(synergy.play_effect_tags) || synergy.play_effect_tags.length === 0) {
    errors.push(`deck_synergy "${synergy.id}": play_effect_tags must be a non-empty array`);
  }
  if (typeof synergy.play_effect_multiplier !== "number" || synergy.play_effect_multiplier < 1 || synergy.play_effect_multiplier > 1.25) {
    errors.push(`deck_synergy "${synergy.id}": play_effect_multiplier must be between 1 and 1.25`);
  }
}

for (const starterDeck of starterDecks) {
  for (const field of ["title", "description", "card_ids", "tags"]) {
    if (!(field in starterDeck)) errors.push(`starter_deck "${starterDeck.id}": missing ${field}`);
  }
  if (starterDeck.required_meta_id && !metaUnlockIds.has(starterDeck.required_meta_id)) {
    errors.push(`starter_deck "${starterDeck.id}": unknown required_meta_id "${starterDeck.required_meta_id}"`);
  }
  if (!Array.isArray(starterDeck.card_ids) || starterDeck.card_ids.length < 4) {
    errors.push(`starter_deck "${starterDeck.id}": card_ids needs at least 4 cards`);
  }
  for (const cardId of starterDeck.card_ids ?? []) {
    if (!strategyCardIds.has(cardId)) errors.push(`starter_deck "${starterDeck.id}": unknown card "${cardId}"`);
  }
  if (!Array.isArray(starterDeck.tags) || starterDeck.tags.length === 0) {
    errors.push(`starter_deck "${starterDeck.id}": tags must be a non-empty array`);
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

  const spriteSheets = assetManifest.sprite_sheets ?? {};
  for (const [sheetId, sheet] of Object.entries(spriteSheets)) {
    validateAssetStatus(`asset_manifest sprite_sheets "${sheetId}"`, sheet.source_status);
    for (const field of ["path", "slice_mode"]) {
      if (typeof sheet[field] !== "string" || sheet[field].length === 0) {
        errors.push(`asset_manifest sprite_sheets "${sheetId}": ${field} must be a non-empty string`);
      }
    }
    for (const field of ["frame_width", "frame_height", "columns", "rows", "frame_count"]) {
      if (typeof sheet[field] !== "number" || sheet[field] <= 0) {
        errors.push(`asset_manifest sprite_sheets "${sheetId}": ${field} must be a positive number`);
      }
    }
    if (sheet.frame_count > sheet.columns * sheet.rows) {
      errors.push(`asset_manifest sprite_sheets "${sheetId}": frame_count must fit inside columns * rows`);
    }
    for (const frameIndex of sheet.preview_frames ?? []) {
      if (!Number.isInteger(frameIndex) || frameIndex < 0 || frameIndex >= sheet.frame_count) {
        errors.push(`asset_manifest sprite_sheets "${sheetId}": preview frame ${frameIndex} is outside sheet bounds`);
      }
    }
    if (sheet.source_path) {
      if (typeof sheet.source_scale !== "number" || sheet.source_scale <= 1) {
        errors.push(`asset_manifest sprite_sheets "${sheetId}": source_scale must be greater than 1 when source_path is set`);
      }
      const normalizedSourceScale = sheet.source_scale / (sheet.density ?? 1);
      if (sheet.source_frame_width !== sheet.frame_width * normalizedSourceScale) {
        errors.push(`asset_manifest sprite_sheets "${sheetId}": source_frame_width must match frame_width * source_scale / density`);
      }
      if (sheet.source_frame_height !== sheet.frame_height * normalizedSourceScale) {
        errors.push(`asset_manifest sprite_sheets "${sheetId}": source_frame_height must match frame_height * source_scale / density`);
      }
      if (typeof sheet.normalized_from !== "string" || sheet.normalized_from.length === 0) {
        errors.push(`asset_manifest sprite_sheets "${sheetId}": normalized_from is required for source-normalized sheets`);
      }
      for (const optionalSourceField of ["source_origin", "import_pipeline", "normalization_method"]) {
        if (optionalSourceField in sheet && (typeof sheet[optionalSourceField] !== "string" || sheet[optionalSourceField].length === 0)) {
          errors.push(`asset_manifest sprite_sheets "${sheetId}": ${optionalSourceField} must be a non-empty string when set`);
        }
      }
      if ("anchor_reference" in sheet && (typeof sheet.anchor_reference !== "string" || sheet.anchor_reference.length === 0)) {
        errors.push(`asset_manifest sprite_sheets "${sheetId}": anchor_reference must be a non-empty string when set`);
      }
      if ("anchor_tolerance_px" in sheet && (typeof sheet.anchor_tolerance_px !== "number" || sheet.anchor_tolerance_px <= 0)) {
        errors.push(`asset_manifest sprite_sheets "${sheetId}": anchor_tolerance_px must be positive when set`);
      }
      if (
        "silhouette_drift_tolerance_px" in sheet
        && (typeof sheet.silhouette_drift_tolerance_px !== "number" || sheet.silhouette_drift_tolerance_px <= 0)
      ) {
        errors.push(`asset_manifest sprite_sheets "${sheetId}": silhouette_drift_tolerance_px must be positive when set`);
      }
    }
  }

  for (const [backdropId, backdrop] of Object.entries(assetManifest.scene_backdrops ?? {})) {
    validateAssetStatus(`asset_manifest scene_backdrops "${backdropId}"`, backdrop.source_status);
    for (const field of ["path", "prompt_summary"]) {
      if (typeof backdrop[field] !== "string" || backdrop[field].length === 0) {
        errors.push(`asset_manifest scene_backdrops "${backdropId}": ${field} must be a non-empty string`);
      }
    }
    for (const field of ["width", "height"]) {
      if (typeof backdrop[field] !== "number" || backdrop[field] <= 0) {
        errors.push(`asset_manifest scene_backdrops "${backdropId}": ${field} must be a positive number`);
      }
    }
    if (backdrop.source_path) {
      for (const field of ["source_width", "source_height", "source_scale"]) {
        if (typeof backdrop[field] !== "number" || backdrop[field] <= 0) {
          errors.push(`asset_manifest scene_backdrops "${backdropId}": ${field} must be a positive number when source_path is set`);
        }
      }
      if (backdrop.source_width <= backdrop.width || backdrop.source_height <= backdrop.height) {
        errors.push(`asset_manifest scene_backdrops "${backdropId}": source dimensions must be larger than runtime dimensions`);
      }
      for (const optionalSourceField of ["normalized_from", "source_origin", "import_pipeline", "normalization_method"]) {
        if (optionalSourceField in backdrop && (typeof backdrop[optionalSourceField] !== "string" || backdrop[optionalSourceField].length === 0)) {
          errors.push(`asset_manifest scene_backdrops "${backdropId}": ${optionalSourceField} must be a non-empty string when set`);
        }
      }
    }
  }

  for (const [qaId, visualQa] of Object.entries(assetManifest.visual_qa ?? {})) {
    for (const field of ["scenario_url", "source_art_status", "desktop_screenshot_path", "mobile_screenshot_path", "report_path"]) {
      if (typeof visualQa[field] !== "string" || visualQa[field].length === 0) {
        errors.push(`asset_manifest visual_qa "${qaId}": ${field} must be a non-empty string`);
      }
    }
    if (!Array.isArray(visualQa.required_viewports) || visualQa.required_viewports.length < 2) {
      errors.push(`asset_manifest visual_qa "${qaId}": required_viewports must include desktop and mobile entries`);
    }
    for (const viewport of visualQa.required_viewports ?? []) {
      if (typeof viewport.id !== "string" || viewport.id.length === 0) {
        errors.push(`asset_manifest visual_qa "${qaId}": viewport id must be a non-empty string`);
      }
      for (const field of ["width", "height"]) {
        if (typeof viewport[field] !== "number" || viewport[field] <= 0) {
          errors.push(`asset_manifest visual_qa "${qaId}": viewport ${field} must be a positive number`);
        }
      }
    }
    if (!Array.isArray(visualQa.checks) || visualQa.checks.length < 4) {
      errors.push(`asset_manifest visual_qa "${qaId}": checks must include at least four visual QA checks`);
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
    const sheet = spriteSheets[sprite.sheet_id];
    if (!sheet) errors.push(`asset_manifest agent_sprites "${sprite.agent_type_id}": unknown sheet_id "${sprite.sheet_id}"`);
    for (const animationName of ["idle", "work", "card_use", "cheer", "alert"]) {
      const animation = sprite.animations?.[animationName];
      if (!animation || typeof animation.frames !== "number" || animation.frames <= 0) {
        errors.push(`asset_manifest agent_sprites "${sprite.agent_type_id}": ${animationName} animation needs positive frames`);
      }
      if (!animation || typeof animation.row !== "number" || animation.row < 0) {
        errors.push(`asset_manifest agent_sprites "${sprite.agent_type_id}": ${animationName} animation needs non-negative row`);
      }
      if (sheet && animation?.row >= sheet.rows) {
        errors.push(`asset_manifest agent_sprites "${sprite.agent_type_id}": ${animationName} row exceeds sheet rows`);
      }
      if (sheet && animation?.frames > sheet.columns) {
        errors.push(`asset_manifest agent_sprites "${sprite.agent_type_id}": ${animationName} frames exceed sheet columns`);
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
    if (object.sheet_id && !spriteSheets[object.sheet_id]) {
      errors.push(`asset_manifest office_objects "${object.object_id}": unknown sheet_id "${object.sheet_id}"`);
    }
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
if (personas.length !== 20) errors.push(`playtest_personas: expected 20 personas, found ${personas.length}`);
if (maleSlots !== 10 || femaleSlots !== 10) errors.push(`playtest_personas: expected 10 male and 10 female slots, found ${maleSlots}/${femaleSlots}`);
for (const persona of personas) {
  for (const field of ["label", "lens", "gender_mix_slot", "benchmark", "concern"]) {
    if (!persona[field]) errors.push(`playtest_persona "${persona.id}": missing ${field}`);
  }
  if (!["male", "female"].includes(persona.gender_mix_slot)) {
    errors.push(`playtest_persona "${persona.id}": unknown gender_mix_slot "${persona.gender_mix_slot}"`);
  }
}

if (errors.length) {
  console.error("Data validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Data validation passed.");
