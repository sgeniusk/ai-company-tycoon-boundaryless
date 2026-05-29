import { derivationRules } from "./data";
import type { DerivationRuleDefinition, GameState } from "./types";

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
