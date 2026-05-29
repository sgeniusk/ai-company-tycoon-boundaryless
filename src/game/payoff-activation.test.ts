import { describe, expect, it } from "vitest";
import { getNewPayoffActivationIds, getPayoffCelebrationMoments } from "./payoff-activation";
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
});
