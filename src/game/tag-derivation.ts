import { derivationRules } from "./data";
import type { DerivationRuleDefinition, GameState, ResourceMap } from "./types";

export interface ArchetypeCollectionEntry extends DerivationRuleDefinition {
  discovered: boolean;
}

export function getDerivedArchetypes(state: Pick<GameState, "runModifiers">): DerivationRuleDefinition[] {
  const tags = new Set(state.runModifiers.tags);

  return derivationRules
    .filter((rule) => runHasTags(tags, rule.requires))
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

export function getNewlyDiscoveredArchetypes(collection: Iterable<string>, runArchetypes: Iterable<DerivationRuleDefinition>): string[] {
  const discovered = new Set(collection);
  return [...runArchetypes].map((rule) => rule.id).filter((id) => !discovered.has(id));
}

export function getArchetypeMonthlyEffects(state: Pick<GameState, "runModifiers">): ResourceMap {
  return mergeMaps(
    getDerivedArchetypes(state)
      .filter((rule) => rule.yields.kind === "bonus")
      .map((rule) => rule.yields.monthly_effect ?? {}),
  );
}

export function getArchetypeCollectionEntries(state: Pick<GameState, "roguelite">): ArchetypeCollectionEntry[] {
  const discovered = new Set(state.roguelite.discoveredArchetypeIds ?? []);

  return derivationRules
    .map((rule): ArchetypeCollectionEntry => ({
      ...rule,
      discovered: discovered.has(rule.id),
    }))
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

export function runHasTags(tags: Set<string>, requires: string[]): boolean {
  return requires.every((tag) => tags.has(tag));
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
