import { describe, expect, it } from "vitest";
import { derivationRules, runModifiers } from "./data";
import { createQaScenario } from "./qa-scenarios";
import { createInitialState } from "./simulation";
import { getDerivedArchetypes } from "./tag-derivation";
import type { GameState } from "./types";

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
});
