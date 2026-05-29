import { describe, expect, it } from "vitest";
import { difficultyTiers, runModifiers } from "./data";
import { resetRunWithMetaUnlocks } from "./meta-progression";
import { createQaScenario } from "./qa-scenarios";
import { advanceMonth, calculateMonthlyEconomy, createInitialState, hydrateGameState, serializeGameState } from "./simulation";
import {
  DEFAULT_RUN_MODIFIER_SELECTION,
  applyRunModifierStartingDeltas,
  getDifficultyMonthlyEffects,
  getRunModifierMonthlyEffects,
  rollRunModifierSelection,
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

  it("defines four difficulty tiers with standard as the no-op baseline", () => {
    expect(difficultyTiers.map((tier) => tier.id)).toEqual(["story", "standard", "hard", "brutal"]);
    expect(difficultyTiers.find((tier) => tier.id === "standard")).toMatchObject({
      monthly_headwind: {},
      reward_multiplier: 1,
    });
    expect(difficultyTiers.find((tier) => tier.id === "hard")).toMatchObject({
      monthly_headwind: { cash: -60, hype: -1 },
      reward_multiplier: 1.5,
    });
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
    expect(state.runModifiers.challengeTier).toBe("standard");
    expect(config.challengeTier).toBe("standard");
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

  it("stores an explicit challenge tier without changing seeded run modifier selection", () => {
    const config = selectRunModifierConfig({ ...nonDefaultSelection, challengeTierId: "hard" });
    const seededWithoutTier = selectRunModifierConfig(nonDefaultSelection);

    expect(config).toMatchObject({
      seed: "qa-run-modifier",
      startCityId: "tokyo",
      worldLoreId: "bitcoin_gpu_squeeze",
      marketConditionId: "enterprise_winter",
      founderTraitId: "researcher_founder",
      challengeTier: "hard",
    });
    expect(config.tags).toEqual(seededWithoutTier.tags);
    expect(config.startingResourceDelta).toEqual(seededWithoutTier.startingResourceDelta);
    expect(selectRunModifierConfig({ challengeTierId: "unknown-tier" }).challengeTier).toBe("standard");
  });

  it("applies a non-default run config through the next-run reset path", () => {
    const finishedRun: GameState = {
      ...createInitialState(),
      month: 12,
      status: "success",
    };

    const nextRun = resetRunWithMetaUnlocks(finishedRun, [], "balanced_founder", { ...nonDefaultSelection, challengeTierId: "hard" });

    expect(nextRun.month).toBe(1);
    expect(nextRun.runModifiers).toMatchObject({
      startCityId: "tokyo",
      worldLoreId: "bitcoin_gpu_squeeze",
      marketConditionId: "enterprise_winter",
      founderTraitId: "researcher_founder",
      challengeTier: "hard",
    });
    expect(nextRun.resources.compute).toBe(70);
    expect(nextRun.capabilities.safety).toBe(1);
  });

  it("accumulates newly discovered archetypes across next-run resets without dropping roguelite meta", () => {
    const finishedRun: GameState = {
      ...createInitialState(),
      month: 12,
      status: "success",
      roguelite: {
        ...createInitialState().roguelite,
        founderInsight: 7,
        unlockedMetaIds: ["robotics_seed_memory"],
        discoveredArchetypeIds: ["frontier_garage", "frontier_garage"],
        runHistory: [
          {
            id: "run_1_12",
            runNumber: 1,
            endedMonth: 12,
            status: "success",
            score: 120,
            bestProductName: "AI Writer",
            insightReward: 4,
            note: "seed",
          },
        ],
      },
    };

    const nextRun = resetRunWithMetaUnlocks(finishedRun, [], "balanced_founder", {
      seed: "qa-tag-derivation",
      startCityId: "san_francisco",
      worldLoreId: "open_source_heaven",
      marketConditionId: "ai_boom",
      founderTraitId: "engineer_founder",
    });

    expect(nextRun.roguelite.discoveredArchetypeIds).toEqual(["frontier_garage", "frontier_demo_loop", "oss_evangelist"]);
    expect(nextRun.roguelite.unlockedMetaIds).toEqual(["robotics_seed_memory"]);
    expect(nextRun.roguelite.founderInsight).toBeGreaterThan(7);
    expect(nextRun.roguelite.runHistory[0]).toMatchObject({ runNumber: 1, status: "success" });
    expect(nextRun.roguelite.runHistory[1]).toMatchObject({ note: "seed" });
  });

  it("rolls a deterministic non-standard selection from a seed without changing defaults", () => {
    const first = rollRunModifierSelection("qa-world-reveal-seed");
    const second = rollRunModifierSelection("qa-world-reveal-seed");
    const different = rollRunModifierSelection("qa-world-reveal-seed-2");

    expect(first).toEqual(second);
    expect(first.seed).toBe("qa-world-reveal-seed");
    expect(selectRunModifierConfig(first)).toMatchObject(first);
    expect(first).not.toMatchObject(DEFAULT_RUN_MODIFIER_SELECTION);
    expect(different).not.toEqual(first);

    expect(createInitialState().runModifiers).toMatchObject(DEFAULT_RUN_MODIFIER_SELECTION);
    const standardReset = resetRunWithMetaUnlocks({ ...createInitialState(), month: 12, status: "success" });
    expect(standardReset.runModifiers).toMatchObject(DEFAULT_RUN_MODIFIER_SELECTION);
    expect(standardReset.roguelite.discoveredArchetypeIds).toEqual([]);
  });

  it("round-trips saved run modifiers and migrates old saves to the standard config", () => {
    const modifiedState = createInitialState({ ...nonDefaultSelection, challengeTierId: "hard" });
    const hydrated = hydrateGameState(serializeGameState(modifiedState));

    expect(hydrated.runModifiers).toEqual(modifiedState.runModifiers);
    expect(hydrated.runModifiers.challengeTier).toBe("hard");
    expect(hydrated.resources.compute).toBe(70);

    const legacyRunModifiers: Partial<GameState["runModifiers"]> = { ...modifiedState.runModifiers };
    delete legacyRunModifiers.challengeTier;
    const migratedTier = hydrateGameState(
      JSON.stringify({
        version: 11,
        state: { ...modifiedState, runModifiers: legacyRunModifiers },
      }),
    );

    expect(migratedTier.runModifiers).toMatchObject({
      startCityId: "tokyo",
      worldLoreId: "bitcoin_gpu_squeeze",
      marketConditionId: "enterprise_winter",
      founderTraitId: "researcher_founder",
      challengeTier: "standard",
    });

    const legacyState: Partial<GameState> = { ...createInitialState() };
    delete legacyState.runModifiers;
    const migrated = hydrateGameState(JSON.stringify({ version: 11, state: legacyState }));

    expect(migrated.runModifiers).toMatchObject(DEFAULT_RUN_MODIFIER_SELECTION);
    expect(migrated.runModifiers.challengeTier).toBe("standard");
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

  it("registers a world reveal QA scenario with a rolled seed", () => {
    const scenario = createQaScenario("world-reveal");

    expect(scenario.activeMenu).toBe("company");
    expect(scenario.label).toContain("세계 뽑기");
    expect(scenario.state.runModifiers.seed).toBe("qa-world-reveal");
    expect(scenario.state.runModifiers).not.toMatchObject(DEFAULT_RUN_MODIFIER_SELECTION);
    expect(scenario.state.runModifiers.tags.length).toBeGreaterThan(0);
  });

  it("registers a hard difficulty browser QA scenario", () => {
    const scenario = createQaScenario("difficulty-hard");

    expect(scenario.activeMenu).toBe("company");
    expect(scenario.label).toContain("하드");
    expect(scenario.state.runModifiers.challengeTier).toBe("hard");
    expect(getDifficultyMonthlyEffects(scenario.state)).toEqual({ cash: -60, hype: -1 });
  });

  it("registers a hard reward and reveal browser QA scenario", () => {
    const scenario = createQaScenario("difficulty-reward");

    expect(scenario.activeMenu).toBe("company");
    expect(scenario.label).toContain("보상");
    expect(scenario.state.runModifiers.challengeTier).toBe("hard");
    expect(scenario.state.runModifiers.seed).toBe("qa-difficulty-reward");
    expect(scenario.state.status).toBe("success");
  });

  it("sums conservative monthly effects from active modifier tags", () => {
    const state: GameState = {
      ...createInitialState(),
      runModifiers: {
        ...createInitialState().runModifiers,
        tags: ["compute_expensive", "gpu_scarcity", "market_boom"],
      },
    };

    expect(getRunModifierMonthlyEffects(state)).toEqual({
      compute: -12,
      cash: 100,
      users: 100,
      hype: 1,
    });
  });

  it("keeps standard worlds as a no-op in the monthly economy when tags are empty", () => {
    const standard = createInitialState(DEFAULT_RUN_MODIFIER_SELECTION);
    const noTags: GameState = {
      ...standard,
      runModifiers: {
        ...standard.runModifiers,
        tags: [],
      },
    };

    expect(getRunModifierMonthlyEffects(noTags)).toEqual({});
    expect(getRunModifierMonthlyEffects(standard)).toEqual({});
    expect(getDifficultyMonthlyEffects(standard)).toEqual({});
    expect(calculateMonthlyEconomy(noTags)).toEqual(calculateMonthlyEconomy(standard));
  });

  it("adds hard difficulty as an additive headwind without scaling run-modifier tag effects", () => {
    const standardState = createInitialState(nonDefaultSelection);
    const hardState = createInitialState({
      ...nonDefaultSelection,
      challengeTierId: "hard",
    });
    const standardEconomy = calculateMonthlyEconomy(standardState);
    const runModifierEffects = getRunModifierMonthlyEffects(hardState);
    const difficultyEffects = getDifficultyMonthlyEffects(hardState);
    const economy = calculateMonthlyEconomy(hardState);

    expect(runModifierEffects).toEqual({
      compute: -12,
      cash: -120,
      users: -50,
      trust: 1,
    });
    expect(difficultyEffects).toEqual({ cash: -60, hype: -1 });
    expect(getRunModifierMonthlyEffects(standardState)).toEqual(runModifierEffects);
    expect(economy.strategyEffects?.cash).toBe((standardEconomy.strategyEffects?.cash ?? 0) - 60);
    expect(economy.strategyEffects?.hype).toBe((standardEconomy.strategyEffects?.hype ?? 0) - 1);
    expect(economy.strategyEffects?.compute).toBe(standardEconomy.strategyEffects?.compute);
    expect(economy.strategyEffects?.users).toBe(standardEconomy.strategyEffects?.users);
    expect(economy.strategyEffects?.trust).toBe(standardEconomy.strategyEffects?.trust);
  });

  it("applies GPU-expensive pressure through the run-modifiers QA scenario monthly tick", () => {
    const scenario = createQaScenario("run-modifiers");
    const effects = getRunModifierMonthlyEffects(scenario.state);
    const economy = calculateMonthlyEconomy(scenario.state);
    const advanced = advanceMonth(scenario.state);

    expect(scenario.state.runModifiers.tags).toEqual(expect.arrayContaining(["compute_expensive", "gpu_scarcity"]));
    expect(effects.compute).toBe(-12);
    expect(economy.strategyEffects?.compute).toBe(effects.compute);
    expect(economy.resourceDelta.compute).toBe(-12);
    expect(advanced.lastMonthReport?.strategyEffects?.compute).toBe(-12);
    expect(advanced.resources.compute).toBe(scenario.state.resources.compute - 12);
  });
});
