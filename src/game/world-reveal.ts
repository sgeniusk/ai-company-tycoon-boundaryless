import { DEFAULT_RUN_MODIFIER_SELECTION } from "./run-modifiers";
import type { GameState, RunModifiersState } from "./types";

export function isStandardRunModifierSelection(selection: RunModifiersState): boolean {
  return (
    selection.startCityId === DEFAULT_RUN_MODIFIER_SELECTION.startCityId &&
    selection.worldLoreId === DEFAULT_RUN_MODIFIER_SELECTION.worldLoreId &&
    selection.marketConditionId === DEFAULT_RUN_MODIFIER_SELECTION.marketConditionId &&
    selection.founderTraitId === DEFAULT_RUN_MODIFIER_SELECTION.founderTraitId &&
    selection.challengeTier === "standard"
  );
}

export function shouldShowWorldReveal(
  state: Pick<GameState, "month" | "runModifiers" | "status">,
  dismissedSeeds: ReadonlySet<string> = new Set(),
): boolean {
  if (state.status !== "playing" || state.month > 1) return false;
  if (isStandardRunModifierSelection(state.runModifiers)) return false;

  return !dismissedSeeds.has(state.runModifiers.seed);
}
