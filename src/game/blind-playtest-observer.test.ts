import { describe, expect, it } from "vitest";
import { createQaScenario } from "./qa-scenarios";
import { createInitialState } from "./simulation";
import { createBlindPlaytestObserverSummary, isBlindPlaytestObserverEnabled } from "./blind-playtest-observer";

describe("v0.56 blind playtest observer", () => {
  it("stays inactive unless the v0.56 playtest observer query is present", () => {
    expect(isBlindPlaytestObserverEnabled("?scenario=fresh")).toBe(false);
    expect(isBlindPlaytestObserverEnabled("?scenario=fresh&playtest=v056")).toBe(true);
    expect(isBlindPlaytestObserverEnabled("?scenario=fresh&blindTest=v056")).toBe(true);
  });

  it("creates a bounded session record path and checkpoint prompts", () => {
    const summary = createBlindPlaytestObserverSummary(createInitialState(), "?playtest=v056&session=9");

    expect(summary.active).toBe(true);
    expect(summary.sessionNumber).toBe(5);
    expect(summary.sessionRecordPath).toBe("reports/playtests/v0_56_blind_playtest_session_05.md");
    expect(summary.artGateLabel).toContain("그래픽 에셋");
    expect(summary.checkpoints.map((checkpoint) => checkpoint.id)).toEqual([
      "first_10_seconds",
      "first_3_minutes",
      "first_10_minutes",
      "first_15_minutes",
      "first_20_minutes",
      "first_30_minutes",
    ]);
    expect(summary.checkpoints[0].observationPrompt).toContain("AI 회사");
    expect(summary.checkpoints[4].observationPrompt).toContain("사람/AI/로봇");
  });

  it("marks checkpoint evidence from the current game state", () => {
    const launchSummary = createBlindPlaytestObserverSummary(createQaScenario("launch-impact").state, "?playtest=v056&session=2");
    const yearTwoSummary = createBlindPlaytestObserverSummary(createQaScenario("year-two-product-candidate").state, "?playtest=v056");

    expect(launchSummary.completedCount).toBeGreaterThanOrEqual(3);
    expect(launchSummary.checkpoints.find((checkpoint) => checkpoint.id === "first_10_minutes")?.completed).toBe(true);
    expect(launchSummary.sessionRecordPath).toBe("reports/playtests/v0_56_blind_playtest_session_02.md");

    expect(yearTwoSummary.completedCount).toBeGreaterThanOrEqual(5);
    expect(yearTwoSummary.checkpoints.find((checkpoint) => checkpoint.id === "first_30_minutes")?.completed).toBe(true);
  });
});
