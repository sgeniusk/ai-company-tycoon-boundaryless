import { capabilities, resources, runModifiers } from "./data";
import type {
  CapabilityMap,
  GameState,
  ResourceMap,
  RunModifierOptionDefinition,
  RunModifiersState,
} from "./types";

export const DEFAULT_RUN_MODIFIER_SELECTION = {
  startCityId: "default_city",
  worldLoreId: "standard",
  marketConditionId: "steady_market",
  founderTraitId: "no_founder",
} as const;

const DEFAULT_RUN_MODIFIER_SEED = "standard";

export interface RunModifierSelectionInput {
  seed?: string | number;
  startCityId?: string;
  worldLoreId?: string;
  marketConditionId?: string;
  founderTraitId?: string;
}

export interface RunModifierConfig extends RunModifiersState {
  startingResourceDelta: ResourceMap;
  startingCapabilityDelta: CapabilityMap;
}

type RunModifierDimensionKey = "start_cities" | "world_lore" | "market_conditions" | "founder_traits";

interface RunModifierDimension {
  key: RunModifierDimensionKey;
  selectionKey: keyof typeof DEFAULT_RUN_MODIFIER_SELECTION;
  salt: string;
}

const dimensions: RunModifierDimension[] = [
  { key: "start_cities", selectionKey: "startCityId", salt: "city" },
  { key: "world_lore", selectionKey: "worldLoreId", salt: "world" },
  { key: "market_conditions", selectionKey: "marketConditionId", salt: "market" },
  { key: "founder_traits", selectionKey: "founderTraitId", salt: "founder" },
];

export function selectRunModifierConfig(input: RunModifierSelectionInput = {}): RunModifierConfig {
  const seed = normalizeSeed(input.seed);
  const selected = dimensions.map((dimension) => {
    const explicitId = input[dimension.selectionKey];
    const defaultId = DEFAULT_RUN_MODIFIER_SELECTION[dimension.selectionKey];
    return selectOption(runModifiers[dimension.key], defaultId, explicitId, seed, dimension.salt);
  });
  const [startCity, worldLore, marketCondition, founderTrait] = selected;
  const tags = uniqueStrings(selected.flatMap((option) => option.tags));

  return {
    seed,
    startCityId: startCity.id,
    worldLoreId: worldLore.id,
    marketConditionId: marketCondition.id,
    founderTraitId: founderTrait.id,
    tags,
    startingResourceDelta: mergeMaps(selected.map((option) => option.starting_deltas.resources)),
    startingCapabilityDelta: mergeMaps(selected.map((option) => option.starting_deltas.capabilities)),
  };
}

export function rollRunModifierSelection(seed: string | number): RunModifierSelectionInput {
  const config = selectRunModifierConfig({ seed });

  return {
    seed: config.seed,
    startCityId: config.startCityId,
    worldLoreId: config.worldLoreId,
    marketConditionId: config.marketConditionId,
    founderTraitId: config.founderTraitId,
  };
}

export function applyRunModifierStartingDeltas(state: GameState, config: RunModifierConfig): GameState {
  return {
    ...state,
    runModifiers: toRunModifiersState(config),
    resources: applyResourceDelta(state.resources, config.startingResourceDelta),
    capabilities: applyCapabilityDelta(state.capabilities, config.startingCapabilityDelta),
  };
}

export function getRunModifierMonthlyEffects(state: GameState): ResourceMap {
  const tags = state.runModifiers?.tags ?? [];
  if (tags.length === 0) return {};

  return mergeMaps(tags.map((tag) => runModifiers.tag_effects[tag] ?? {}));
}

export function sanitizeRunModifiersState(value: unknown): RunModifiersState {
  if (!isRecord(value)) return toRunModifiersState(selectRunModifierConfig());

  return toRunModifiersState(
    selectRunModifierConfig({
      seed: typeof value.seed === "string" || typeof value.seed === "number" ? value.seed : DEFAULT_RUN_MODIFIER_SEED,
      startCityId: typeof value.startCityId === "string" ? value.startCityId : undefined,
      worldLoreId: typeof value.worldLoreId === "string" ? value.worldLoreId : undefined,
      marketConditionId: typeof value.marketConditionId === "string" ? value.marketConditionId : undefined,
      founderTraitId: typeof value.founderTraitId === "string" ? value.founderTraitId : undefined,
    }),
  );
}

function toRunModifiersState(config: RunModifierConfig): RunModifiersState {
  return {
    seed: config.seed,
    startCityId: config.startCityId,
    worldLoreId: config.worldLoreId,
    marketConditionId: config.marketConditionId,
    founderTraitId: config.founderTraitId,
    tags: [...config.tags],
  };
}

function normalizeSeed(seed: string | number | undefined): string {
  if (typeof seed === "number" && Number.isFinite(seed)) return String(seed);
  if (typeof seed === "string" && seed.trim()) return seed.trim();
  return DEFAULT_RUN_MODIFIER_SEED;
}

function selectOption(
  options: RunModifierOptionDefinition[],
  defaultId: string,
  explicitId: string | undefined,
  seed: string,
  salt: string,
): RunModifierOptionDefinition {
  const explicit = explicitId ? options.find((option) => option.id === explicitId) : undefined;
  if (explicit) return explicit;

  const defaultOption = options.find((option) => option.id === defaultId) ?? options[0];
  if (!defaultOption || seed === DEFAULT_RUN_MODIFIER_SEED) return defaultOption;

  const seededPool = options.filter((option) => option.id !== defaultId);
  if (!seededPool.length) return defaultOption;

  return seededPool[hashSeed(`${seed}:${salt}`) % seededPool.length] ?? defaultOption;
}

function hashSeed(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mergeMaps(maps: ResourceMap[]): ResourceMap {
  const merged: ResourceMap = {};

  for (const map of maps) {
    for (const [id, value] of Object.entries(map ?? {})) {
      merged[id] = (merged[id] ?? 0) + value;
    }
  }

  return Object.fromEntries(Object.entries(merged).filter(([, value]) => value !== 0));
}

function applyResourceDelta(current: ResourceMap, delta: ResourceMap): ResourceMap {
  const next = { ...current };

  for (const [resourceId, amount] of Object.entries(delta)) {
    const definition = resources[resourceId];
    const currentValue = next[resourceId] ?? 0;
    next[resourceId] = definition ? clamp(currentValue + amount, definition.min_value, definition.max_value) : currentValue + amount;
  }

  return next;
}

function applyCapabilityDelta(current: CapabilityMap, delta: CapabilityMap): CapabilityMap {
  const next = { ...current };

  for (const [capabilityId, amount] of Object.entries(delta)) {
    const definition = capabilities.find((capability) => capability.id === capabilityId);
    const currentValue = next[capabilityId] ?? 0;
    next[capabilityId] = definition ? Math.round(clamp(currentValue + amount, 0, definition.max_level)) : currentValue + amount;
  }

  return next;
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.filter((value) => typeof value === "string" && value.length > 0))];
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
