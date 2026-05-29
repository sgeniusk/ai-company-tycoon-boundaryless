import { describe, expect, it } from "vitest";
import { resources, runModifiers } from "./data";
import { createInitialState } from "./simulation";
import { getRunModifierMonthlyEffects, selectRunModifierConfig } from "./run-modifiers";

const expectedAxisCounts = {
  world_lore: 12,
  start_cities: 11,
  market_conditions: 8,
  founder_traits: 9,
} as const;

const defaultEntryIds = {
  world_lore: "standard",
  start_cities: "default_city",
  market_conditions: "steady_market",
  founder_traits: "no_founder",
} as const;

describe("v0.64 run modifier content wave", () => {
  it("expands every run modifier axis to the v0.64 content counts with unique ids", () => {
    for (const [axis, expectedCount] of Object.entries(expectedAxisCounts)) {
      const entries = runModifiers[axis as keyof typeof expectedAxisCounts];
      const ids = entries.map((entry) => entry.id);

      expect(entries).toHaveLength(expectedCount);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("keeps all default entries as empty-delta no-ops", () => {
    for (const [axis, defaultId] of Object.entries(defaultEntryIds)) {
      const entry = runModifiers[axis as keyof typeof defaultEntryIds].find((option) => option.id === defaultId);

      expect(entry?.starting_deltas.resources).toEqual({});
      expect(entry?.starting_deltas.capabilities).toEqual({});
    }

    const defaultConfig = selectRunModifierConfig();
    const defaultState = createInitialState();

    expect(defaultConfig.startingResourceDelta).toEqual({});
    expect(defaultConfig.startingCapabilityDelta).toEqual({});
    expect(getRunModifierMonthlyEffects(defaultState)).toEqual({});
  });

  it("loads the requested new world-lore deltas and tags from data", () => {
    expect(selectRunModifierConfig({ worldLoreId: "agi_overhang" })).toMatchObject({
      worldLoreId: "agi_overhang",
      startingResourceDelta: { data: 15, hype: 4, trust: -3 },
      tags: expect.arrayContaining(["research_fast", "safety_scrutiny"]),
    });
    expect(selectRunModifierConfig({ worldLoreId: "chip_war" })).toMatchObject({
      worldLoreId: "chip_war",
      startingResourceDelta: { compute: -30, cash: -400 },
      tags: expect.arrayContaining(["export_controls", "compute_regional"]),
    });
    expect(selectRunModifierConfig({ worldLoreId: "robotics_boom" })).toMatchObject({
      worldLoreId: "robotics_boom",
      startingResourceDelta: { compute: 18, automation: 2 },
      startingCapabilityDelta: { optimization: 1 },
      tags: expect.arrayContaining(["embodied_demand", "hardware_capital"]),
    });
  });

  it("keeps seeded selection deterministic after the content expansion", () => {
    const first = selectRunModifierConfig({ seed: "v0.64-content-depth" });
    const second = selectRunModifierConfig({ seed: "v0.64-content-depth" });
    const axisIds = {
      startCityId: new Set(runModifiers.start_cities.map((entry) => entry.id)),
      worldLoreId: new Set(runModifiers.world_lore.map((entry) => entry.id)),
      marketConditionId: new Set(runModifiers.market_conditions.map((entry) => entry.id)),
      founderTraitId: new Set(runModifiers.founder_traits.map((entry) => entry.id)),
    };

    expect(second).toEqual(first);
    expect(first).toMatchObject({
      seed: "v0.64-content-depth",
      startCityId: expect.any(String),
      worldLoreId: expect.any(String),
      marketConditionId: expect.any(String),
      founderTraitId: expect.any(String),
    });
    expect(axisIds.startCityId.has(first.startCityId)).toBe(true);
    expect(axisIds.worldLoreId.has(first.worldLoreId)).toBe(true);
    expect(axisIds.marketConditionId.has(first.marketConditionId)).toBe(true);
    expect(axisIds.founderTraitId.has(first.founderTraitId)).toBe(true);
    expect(selectRunModifierConfig({ seed: "standard" })).toMatchObject({
      startCityId: "default_city",
      worldLoreId: "standard",
      marketConditionId: "steady_market",
      founderTraitId: "no_founder",
    });
  });

  it("keeps every tag_effects resource id valid", () => {
    const resourceIds = new Set(Object.keys(resources));

    for (const [tag, monthlyEffects] of Object.entries(runModifiers.tag_effects)) {
      expect(Object.keys(monthlyEffects), tag).not.toHaveLength(0);
      for (const resourceId of Object.keys(monthlyEffects)) {
        expect(resourceIds.has(resourceId), `${tag}.${resourceId}`).toBe(true);
      }
    }
  });
});
