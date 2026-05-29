import { derivationRules } from "./data";
import type { DerivationRuleDefinition, GameState } from "./types";

export function getDerivedArchetypes(state: Pick<GameState, "runModifiers">): DerivationRuleDefinition[] {
  const tags = new Set(state.runModifiers.tags);

  return derivationRules
    .filter((rule) => runHasTags(tags, rule.requires))
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

export function runHasTags(tags: Set<string>, requires: string[]): boolean {
  return requires.every((tag) => tags.has(tag));
}
