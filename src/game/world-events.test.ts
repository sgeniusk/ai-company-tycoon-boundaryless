import { describe, expect, it } from "vitest";
import { CAMPAIGN_FINAL_MONTH } from "./campaign";
import { worldEvents } from "./data";
import { createQaScenario } from "./qa-scenarios";
import { runTenYearCampaignSimulation } from "./run-simulator";
import { advanceMonth, createInitialState, hydrateGameState, serializeGameState } from "./simulation";
import { validateGameStateIntegrity } from "./state-integrity";
import { applyDueWorldEvents, getRunWorldEventSchedule } from "./world-events";
import type { GameState } from "./types";

const worldEventSelection = {
  seed: "qa-world-events",
  worldLoreId: "bitcoin_gpu_squeeze",
};

describe("v0.63 yearly world events", () => {
  it("defines a conservative pool of seed-selectable yearly events", () => {
    expect(worldEvents.length).toBeGreaterThanOrEqual(10);
    expect(worldEvents.length).toBeLessThanOrEqual(12);
    expect(new Set(worldEvents.map((event) => event.id)).size).toBe(worldEvents.length);

    for (const event of worldEvents) {
      expect(event.title.length).toBeGreaterThan(0);
      expect(event.description.length).toBeGreaterThan(0);
      expect(event.trigger.length).toBeGreaterThan(0);
      expect(event.year_range[0]).toBeGreaterThanOrEqual(1);
      expect(event.year_range[1]).toBeLessThanOrEqual(10);
      expect(event.year_range[0]).toBeLessThanOrEqual(event.year_range[1]);
      expect(Object.keys(event.resource_effects).length).toBeGreaterThan(0);
      expect(Math.abs(event.resource_effects.cash ?? 0)).toBeLessThanOrEqual(5000);
      expect(Math.abs(event.resource_effects.users ?? 0)).toBeLessThanOrEqual(900);
      expect(Math.abs(event.resource_effects.compute ?? 0)).toBeLessThanOrEqual(45);
      expect(Math.abs(event.resource_effects.data ?? 0)).toBeLessThanOrEqual(60);
      expect(Math.abs(event.resource_effects.talent ?? 0)).toBeLessThanOrEqual(1);
      expect(Math.abs(event.resource_effects.trust ?? 0)).toBeLessThanOrEqual(4);
      expect(Math.abs(event.resource_effects.hype ?? 0)).toBeLessThanOrEqual(5);
      expect(Math.abs(event.resource_effects.automation ?? 0)).toBeLessThanOrEqual(3);
    }
  });

  it("selects the same yearly event sequence from the same seed and world lore", () => {
    const first = getRunWorldEventSchedule(createInitialState(worldEventSelection)).map((event) => `${event.year}:${event.id}`);
    const second = getRunWorldEventSchedule(createInitialState(worldEventSelection)).map((event) => `${event.year}:${event.id}`);
    const differentSeed = getRunWorldEventSchedule(
      createInitialState({
        ...worldEventSelection,
        seed: "qa-world-events-alt",
      }),
    ).map((event) => `${event.year}:${event.id}`);
    const differentLore = getRunWorldEventSchedule(
      createInitialState({
        ...worldEventSelection,
        worldLoreId: "open_source_heaven",
      }),
    ).map((event) => `${event.year}:${event.id}`);

    expect(first).toEqual(second);
    expect(first.length).toBeGreaterThanOrEqual(8);
    expect(first).not.toEqual(differentSeed);
    expect(first).not.toEqual(differentLore);
  });

  it("applies a due world event once and dedupes through worldEventHistory", () => {
    const state = createInitialState(worldEventSelection);
    const [firstDueEvent] = getRunWorldEventSchedule(state);
    const dueState: GameState = {
      ...state,
      month: firstDueEvent.month,
      resources: {
        ...state.resources,
        cash: 100000,
        compute: 500,
        data: 500,
        trust: 60,
        hype: 30,
      },
      worldEventHistory: [],
    };

    const applied = applyDueWorldEvents(dueState);
    const appliedAgain = applyDueWorldEvents(applied);

    expect(applied.worldEventHistory).toContain(firstDueEvent.id);
    expect(applied.worldEventHistory.filter((id) => id === firstDueEvent.id)).toHaveLength(1);
    expect(applied.timeline.join(" ")).toContain("세계 이벤트");
    expect(applied.timeline.join(" ")).toContain(firstDueEvent.title);
    expect(applied.resources).toMatchObject(applyExpectedDelta(dueState.resources, firstDueEvent.resource_effects));
    expect(appliedAgain.worldEventHistory.filter((id) => id === firstDueEvent.id)).toHaveLength(1);
    expect(appliedAgain.resources).toEqual(applied.resources);
  });

  it("hooks world events into monthly advancement beside campaign shocks", () => {
    const state = createInitialState(worldEventSelection);
    const [firstDueEvent] = getRunWorldEventSchedule(state);
    const beforeDue: GameState = {
      ...state,
      month: firstDueEvent.month - 1,
      resources: {
        ...state.resources,
        cash: 100000,
        compute: 500,
        data: 500,
      },
      worldEventHistory: [],
    };

    const advanced = advanceMonth(beforeDue);

    expect(advanced.month).toBe(firstDueEvent.month);
    expect(advanced.worldEventHistory).toContain(firstDueEvent.id);
  });

  it("round-trips worldEventHistory and migrates old saves to an empty list", () => {
    const state: GameState = {
      ...createInitialState(worldEventSelection),
      worldEventHistory: ["year2_gpu_spot_market"],
    };
    const hydrated = hydrateGameState(serializeGameState(state));

    expect(hydrated.worldEventHistory).toEqual(["year2_gpu_spot_market"]);

    const legacyState: Partial<GameState> = { ...createInitialState(worldEventSelection) };
    delete legacyState.worldEventHistory;
    const migrated = hydrateGameState(JSON.stringify({ version: 11, state: legacyState }));

    expect(migrated.worldEventHistory).toEqual([]);
    expect(validateGameStateIntegrity(migrated)).toMatchObject({ ok: true, issues: [] });
  });

  it("registers a browser QA scenario with a fired world event", () => {
    const scenario = createQaScenario("world-events");

    expect(scenario.activeMenu).toBe("company");
    expect(scenario.label).toContain("세계 이벤트");
    expect(scenario.state.runModifiers.worldLoreId).toBe("bitcoin_gpu_squeeze");
    expect(scenario.state.worldEventHistory.length).toBeGreaterThan(0);
    expect(scenario.state.timeline.join(" ")).toContain("세계 이벤트");
  });

  it("keeps the standard 10-year campaign simulator completable with world events active", () => {
    const result = runTenYearCampaignSimulation("productivity_line");

    expect(result.finalState.month).toBeGreaterThanOrEqual(CAMPAIGN_FINAL_MONTH);
    expect(result.finalState.status).not.toBe("failure");
    expect(result.finalState.worldEventHistory.length).toBeGreaterThanOrEqual(8);
    expect(result.integrity.ok).toBe(true);
  });
});

function applyExpectedDelta(current: GameState["resources"], delta: GameState["resources"]): GameState["resources"] {
  return Object.fromEntries(Object.entries(current).map(([id, value]) => [id, value + (delta[id] ?? 0)]));
}
