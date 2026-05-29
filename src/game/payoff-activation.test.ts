import { describe, expect, it } from "vitest";
import {
  discoverActivePayoffs,
  getNewPayoffActivationIds,
  getNewPayoffDiscoveryIds,
  getPayoffCelebrationMoments,
  getPayoffCollectionEntries,
} from "./payoff-activation";
import { createInitialState } from "./simulation";

describe("payoff activation celebration detection", () => {
  it("detects only combo or synergy ids that become newly active", () => {
    const previous = createInitialState();
    const current = {
      ...previous,
      unlockedDomains: ["manufacturing", "logistics", "energy"],
    };

    const previousIds = getPayoffCelebrationMoments(previous).map((moment) => moment.id);
    const currentIds = getPayoffCelebrationMoments(current).map((moment) => moment.id);
    const newlyActiveIds = getNewPayoffActivationIds(previousIds, currentIds);

    expect(previousIds).not.toContain("combo:full_stack_physical_empire");
    expect(currentIds).toContain("combo:full_stack_physical_empire");
    expect(newlyActiveIds).toContain("combo:full_stack_physical_empire");
    expect(newlyActiveIds.every((id) => !previousIds.includes(id))).toBe(true);
  });

  it("marks active payoff ids as first-ever discoveries only once", () => {
    const current = {
      ...createInitialState(),
      unlockedDomains: ["manufacturing", "logistics", "energy"],
    };
    const activeMoments = getPayoffCelebrationMoments(current);
    const firstDiscoveryIds = getNewPayoffDiscoveryIds(current.discoveredPayoffIds, activeMoments);
    const discovered = discoverActivePayoffs(current);
    const secondDiscoveryIds = getNewPayoffDiscoveryIds(discovered.discoveredPayoffIds, getPayoffCelebrationMoments(discovered));
    const rediscovered = discoverActivePayoffs(discovered);

    expect(firstDiscoveryIds).toContain("combo:full_stack_physical_empire");
    expect(discovered.discoveredPayoffIds).toEqual(expect.arrayContaining(firstDiscoveryIds));
    expect(secondDiscoveryIds).toEqual([]);
    expect(rediscovered).toBe(discovered);
  });

  it("builds a collection list with discovered entries revealed and locked entries hidden", () => {
    const collection = getPayoffCollectionEntries({
      ...createInitialState(),
      discoveredPayoffIds: ["combo:full_stack_physical_empire", "synergy:robotics_manufacturing_cell"],
    });

    expect(collection).toHaveLength(20);
    expect(collection.find((entry) => entry.id === "combo:full_stack_physical_empire")).toMatchObject({
      discovered: true,
      kind: "combo",
    });
    expect(collection.find((entry) => entry.id === "synergy:factory_energy_loop")).toMatchObject({
      discovered: false,
      kind: "synergy",
    });
  });
});
