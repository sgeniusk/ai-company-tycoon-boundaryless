import { describe, expect, it } from "vitest";
import { derivationRules, resources, runModifiers } from "./data";
import { createQaScenario } from "./qa-scenarios";
import { advanceMonth, calculateMonthlyEconomy, createInitialState } from "./simulation";
import { getArchetypeMonthlyEffects, getDerivedArchetypes, getNewlyDiscoveredArchetypes } from "./tag-derivation";
import type { GameState, ResourceMap } from "./types";

const runModifierTagVocabulary = new Set(
  [
    ...runModifiers.start_cities,
    ...runModifiers.world_lore,
    ...runModifiers.market_conditions,
    ...runModifiers.founder_traits,
  ].flatMap((option) => option.tags),
);

function stateWithTags(tags: string[]): Pick<GameState, "runModifiers"> {
  const state = createInitialState();

  return {
    runModifiers: {
      ...state.runModifiers,
      tags,
    },
  };
}

describe("v0.66 tag derivation engine foundation", () => {
  it("defines exactly twelve unique derivation rules", () => {
    const ids = derivationRules.map((rule) => rule.id);

    expect(derivationRules).toHaveLength(12);
    expect(new Set(ids).size).toBe(ids.length);
    expect(derivationRules.map((rule) => rule.discovery_id)).toHaveLength(12);
    expect(new Set(derivationRules.map((rule) => rule.discovery_id)).size).toBe(12);
  });

  it("uses only real run-modifier tags in rule requirements", () => {
    for (const rule of derivationRules) {
      expect(rule.requires.length, `${rule.id}.requires length`).toBeGreaterThanOrEqual(2);
      expect(rule.requires.length, `${rule.id}.requires length`).toBeLessThanOrEqual(3);
      for (const tag of rule.requires) {
        expect(runModifierTagVocabulary.has(tag), `${rule.id} requires unknown tag ${tag}`).toBe(true);
      }
    }
  });

  it("derives a known archetype when all required tags are present", () => {
    const derived = getDerivedArchetypes(stateWithTags(["frontier_cluster", "builder_bias"]));

    expect(derived.map((rule) => rule.id)).toEqual(["frontier_garage"]);
    expect(derived[0]).toMatchObject({
      title: "프런티어 차고",
      discovery_id: "discovery_frontier_garage",
      yields: { kind: "bonus" },
    });
  });

  it("does not derive an archetype when any required tag is missing", () => {
    const derived = getDerivedArchetypes(stateWithTags(["frontier_cluster", "market_boom"]));

    expect(derived.map((rule) => rule.id)).not.toContain("frontier_garage");
  });

  it("returns deterministic id-sorted results independent of tag order", () => {
    const first = getDerivedArchetypes(
      stateWithTags(["community_models", "demand_surge", "builder_bias", "frontier_cluster", "open_source_heaven", "market_boom"]),
    );
    const second = getDerivedArchetypes(
      stateWithTags(["market_boom", "open_source_heaven", "frontier_cluster", "builder_bias", "demand_surge", "community_models"]),
    );
    const ids = first.map((rule) => rule.id);

    expect(first).toEqual(second);
    expect(ids).toEqual([...ids].sort());
    expect(ids).toEqual(["frontier_demo_loop", "frontier_garage", "oss_evangelist"]);
  });

  it("keeps the standard run from spamming derived archetypes", () => {
    expect(getDerivedArchetypes(createInitialState()).length).toBeLessThanOrEqual(1);
  });

  it("registers a tag-derivation QA scenario that derives multiple archetypes", () => {
    const scenario = createQaScenario("tag-derivation");
    const derivedIds = getDerivedArchetypes(scenario.state).map((rule) => rule.id);

    expect(scenario.activeMenu).toBe("company");
    expect(scenario.label).toContain("태그 파생");
    expect(scenario.state.runModifiers).toMatchObject({
      startCityId: "san_francisco",
      worldLoreId: "open_source_heaven",
      marketConditionId: "ai_boom",
      founderTraitId: "engineer_founder",
    });
    expect(derivedIds).toEqual(["frontier_demo_loop", "frontier_garage", "oss_evangelist"]);
  });

  it("derives newly discovered archetype ids from a cross-run collection without mutating inputs", () => {
    const runArchetypes = getDerivedArchetypes(
      stateWithTags(["community_models", "demand_surge", "builder_bias", "frontier_cluster", "open_source_heaven", "market_boom"]),
    );
    const collection = ["frontier_garage"];

    const newlyDiscovered = getNewlyDiscoveredArchetypes(collection, runArchetypes);

    expect(newlyDiscovered).toEqual(["frontier_demo_loop", "oss_evangelist"]);
    expect(collection).toEqual(["frontier_garage"]);
    expect(runArchetypes.map((rule) => rule.id)).toEqual(["frontier_demo_loop", "frontier_garage", "oss_evangelist"]);
    expect(getNewlyDiscoveredArchetypes(new Set(runArchetypes.map((rule) => rule.id)), runArchetypes)).toEqual([]);
  });

  it("keeps every bonus monthly effect small and tied to a real resource id", () => {
    const resourceIds = new Set(Object.keys(resources));

    for (const rule of derivationRules) {
      const monthlyEffect = rule.yields.monthly_effect;

      if (rule.yields.kind === "bonus") {
        expect(monthlyEffect, `${rule.id}.monthly_effect`).toBeTruthy();
        expect(Object.values(monthlyEffect ?? {}).some((value) => value !== 0), `${rule.id}.monthly_effect`).toBe(true);
      } else {
        expect(monthlyEffect, `${rule.id}.monthly_effect`).toBeUndefined();
      }

      for (const [resourceId, amount] of Object.entries(monthlyEffect ?? {})) {
        expect(resourceIds.has(resourceId), `${rule.id}.${resourceId}`).toBe(true);
        expect(Math.abs(amount), `${rule.id}.${resourceId}`).toBeLessThanOrEqual(30);
      }
    }
  });

  it("sums monthly effects from derived bonus archetypes only", () => {
    const effects = getArchetypeMonthlyEffects(
      stateWithTags(["frontier_cluster", "builder_bias", "data_scarce", "synthetic_premium", "consumer_hype", "growth_bias", "funding_drought", "lab_bias"]),
    );

    expect(effects).toEqual({
      compute: 3,
      data: 5,
      users: 30,
      hype: 1,
      cash: -10,
    });
  });

  it("keeps the standard run as an empty archetype-effect no-op", () => {
    expect(getArchetypeMonthlyEffects(createInitialState())).toEqual({});
  });

  it("applies archetype effects through the monthly strategic-effects hook additively", () => {
    const state: GameState = {
      ...createInitialState(),
      runModifiers: {
        ...createInitialState().runModifiers,
        tags: ["frontier_cluster", "builder_bias"],
      },
    };
    const baselineState: GameState = {
      ...state,
      runModifiers: {
        ...state.runModifiers,
        tags: [],
      },
    };
    const baselineEconomy = calculateMonthlyEconomy(baselineState);
    const economy = calculateMonthlyEconomy(state);
    const advanced = advanceMonth(state);
    const expectedEffects: ResourceMap = { compute: 3 };

    expect(getArchetypeMonthlyEffects(state)).toEqual(expectedEffects);
    expect(economy.strategyEffects?.compute).toBe((baselineEconomy.strategyEffects?.compute ?? 0) + expectedEffects.compute);
    expect(economy.strategyEffects?.cash).toBe(baselineEconomy.strategyEffects?.cash);
    expect(economy.strategyEffects?.data).toBe(baselineEconomy.strategyEffects?.data);
    expect(economy.resourceDelta.compute).toBe(baselineEconomy.resourceDelta.compute + expectedEffects.compute);
    expect(advanced.lastMonthReport?.strategyEffects?.compute).toBe((baselineEconomy.strategyEffects?.compute ?? 0) + expectedEffects.compute);
    expect(advanced.resources.compute).toBe((state.resources.compute ?? 0) + economy.resourceDelta.compute);
  });
});
