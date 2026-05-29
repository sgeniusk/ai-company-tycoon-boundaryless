import { describe, expect, it } from "vitest";
import { runModifiers } from "./data";
import { resetRunWithMetaUnlocks } from "./meta-progression";
import { createQaScenario } from "./qa-scenarios";
import { createInitialState, hydrateGameState, serializeGameState } from "./simulation";
import {
  DEFAULT_RUN_MODIFIER_SELECTION,
  applyRunModifierStartingDeltas,
  selectRunModifierConfig,
} from "./run-modifiers";
import type { GameState } from "./types";

const nonDefaultSelection = {
  seed: "qa-run-modifier",
  startCityId: "tokyo",
  worldLoreId: "bitcoin_gpu_squeeze",
  marketConditionId: "enterprise_winter",
  founderTraitId: "researcher_founder",
};

describe("v0.63 run modifier foundation", () => {
  it("defines the four required modifier dimensions with standard/no-op choices", () => {
    expect(runModifiers.start_cities.map((entry) => entry.id)).toEqual(
      expect.arrayContaining(["default_city", "seoul", "tokyo", "new_york", "san_francisco", "texas"]),
    );
    expect(runModifiers.world_lore.map((entry) => entry.id)).toEqual(
      expect.arrayContaining(["standard", "alphago_stall", "bitcoin_gpu_squeeze", "open_source_heaven", "regulatory_stronghold"]),
    );
    expect(runModifiers.market_conditions.map((entry) => entry.id)).toEqual(
      expect.arrayContaining(["steady_market", "ai_boom", "enterprise_winter"]),
    );
    expect(runModifiers.founder_traits.map((entry) => entry.id)).toEqual(
      expect.arrayContaining(["no_founder", "engineer_founder", "marketer_founder", "researcher_founder", "capitalist_founder"]),
    );
  });

  it("applies selected starting deltas and stores the selected tag set", () => {
    const baseState = createInitialState(DEFAULT_RUN_MODIFIER_SELECTION);
    const config = selectRunModifierConfig(nonDefaultSelection);
    const modifiedState = applyRunModifierStartingDeltas(baseState, config);

    expect(modifiedState.runModifiers).toMatchObject({
      seed: "qa-run-modifier",
      startCityId: "tokyo",
      worldLoreId: "bitcoin_gpu_squeeze",
      marketConditionId: "enterprise_winter",
      founderTraitId: "researcher_founder",
    });
    expect(modifiedState.runModifiers.tags).toEqual(
      expect.arrayContaining(["city_tokyo", "compute_expensive", "gpu_scarcity", "enterprise_winter", "research_founder"]),
    );
    expect(modifiedState.resources).toMatchObject({
      cash: 9500,
      compute: 70,
      data: 95,
      talent: 4,
      trust: 54,
      hype: 12,
    });
    expect(modifiedState.capabilities).toMatchObject({
      language: 2,
      vision: 1,
      safety: 1,
    });
  });

  it("keeps the default config as a no-op against the existing initial gameplay state", () => {
    const state = createInitialState();
    const config = selectRunModifierConfig();

    expect(state.runModifiers).toMatchObject(DEFAULT_RUN_MODIFIER_SELECTION);
    expect(config.startingResourceDelta).toEqual({});
    expect(config.startingCapabilityDelta).toEqual({});
    expect(state.resources).toEqual({
      cash: 10000,
      users: 0,
      compute: 100,
      data: 50,
      talent: 3,
      trust: 50,
      hype: 10,
      automation: 0,
    });
    expect(state.capabilities).toMatchObject({
      language: 1,
      code: 0,
      vision: 0,
      audio: 0,
      video: 0,
      agent: 0,
      enterprise: 0,
      safety: 0,
      optimization: 0,
      robotics: 0,
      manufacturing: 0,
      logistics: 0,
    });
  });

  it("applies a non-default run config through the next-run reset path", () => {
    const finishedRun: GameState = {
      ...createInitialState(),
      month: 12,
      status: "success",
    };

    const nextRun = resetRunWithMetaUnlocks(finishedRun, [], "balanced_founder", nonDefaultSelection);

    expect(nextRun.month).toBe(1);
    expect(nextRun.runModifiers).toMatchObject({
      startCityId: "tokyo",
      worldLoreId: "bitcoin_gpu_squeeze",
      marketConditionId: "enterprise_winter",
      founderTraitId: "researcher_founder",
    });
    expect(nextRun.resources.compute).toBe(70);
    expect(nextRun.capabilities.safety).toBe(1);
  });

  it("round-trips saved run modifiers and migrates old saves to the standard config", () => {
    const modifiedState = createInitialState(nonDefaultSelection);
    const hydrated = hydrateGameState(serializeGameState(modifiedState));

    expect(hydrated.runModifiers).toEqual(modifiedState.runModifiers);
    expect(hydrated.resources.compute).toBe(70);

    const legacyState: Partial<GameState> = { ...createInitialState() };
    delete legacyState.runModifiers;
    const migrated = hydrateGameState(JSON.stringify({ version: 11, state: legacyState }));

    expect(migrated.runModifiers).toMatchObject(DEFAULT_RUN_MODIFIER_SELECTION);
    expect(migrated.runModifiers.tags).toEqual(expect.arrayContaining(["standard_world", "default_city", "no_founder"]));
  });

  it("registers a non-default browser QA scenario for run modifiers", () => {
    const scenario = createQaScenario("run-modifiers");

    expect(scenario.activeMenu).toBe("company");
    expect(scenario.label).toContain("런 모디파이어");
    expect(scenario.state.runModifiers.worldLoreId).toBe("bitcoin_gpu_squeeze");
    expect(scenario.state.runModifiers.startCityId).toBe("tokyo");
    expect(scenario.state.resources.compute).toBe(70);
  });
});
