import { growthPaths } from "./data";
import type { GameState, GrowthPathObjective, GrowthPathObjectiveDefinition } from "./types";

export function getGrowthPathObjectives(state: GameState): GrowthPathObjective[] {
  const path = growthPaths.find((entry) => entry.id === state.chosenGrowthPath?.id);
  if (!path?.followup_objectives?.length) return [];

  return path.followup_objectives.map((objective) => ({
    id: objective.id,
    label: objective.label,
    description: objective.description,
    targetMenu: objective.target_menu,
    complete: objectiveComplete(objective, state),
  }));
}

function objectiveComplete(objective: GrowthPathObjectiveDefinition, state: GameState): boolean {
  const completion = objective.completion;
  const checks: boolean[] = [];

  if (completion.product_id) {
    checks.push(
      state.activeProducts.includes(completion.product_id) ||
        state.productProjects.some((project) => project.productId === completion.product_id),
    );
  }

  if (completion.capability_id) {
    checks.push((state.capabilities[completion.capability_id] ?? 0) >= (completion.capability_level ?? 1));
  }

  if (completion.owned_item_id) {
    checks.push(state.ownedItems.includes(completion.owned_item_id));
  }

  if (completion.purchased_upgrade_id) {
    checks.push(state.purchasedUpgrades.includes(completion.purchased_upgrade_id));
  }

  if (completion.min_resource) {
    checks.push((state.resources[completion.min_resource] ?? 0) >= (completion.min_value ?? 0));
  }

  return checks.length > 0 && checks.every(Boolean);
}
