import { describe, expect, it } from "vitest";
import { createInitialState, getPlayerMarketShare } from "../game/simulation";
import { getRivalCounterPlans } from "../game/rival-counters";
import { getGuidanceStep } from "../game/guidance";
import { deriveNationalRanking, buildScoreboardMarquee } from "./scoreboard-ranking";

describe("deriveNationalRanking", () => {
  it("places a fresh garage company deep inside the national field", () => {
    const ranking = deriveNationalRanking(createInitialState());
    expect(ranking.total).toBeGreaterThanOrEqual(2000);
    expect(ranking.rank).toBeGreaterThan(1);
    expect(ranking.rank).toBeLessThanOrEqual(ranking.total);
  });

  it("ranks a dominant company far ahead of a fresh one", () => {
    const fresh = createInitialState();
    // No rivals left in the field => the player stands alone at the top.
    const dominant = { ...fresh, competitorStates: [] };
    expect(deriveNationalRanking(dominant).rank).toBeLessThan(deriveNationalRanking(fresh).rank);
  });

  it("mirrors the live market share without mutating state", () => {
    const state = createInitialState();
    const snapshot = JSON.stringify(state);
    const ranking = deriveNationalRanking(state);
    expect(ranking.marketShare).toBe(getPlayerMarketShare(state));
    expect(JSON.stringify(state)).toBe(snapshot);
  });

  it("reports no movement when there is no recorded share history", () => {
    expect(deriveNationalRanking(createInitialState()).delta).toBe(0);
  });

  it("shows an upward delta when recorded share climbs past the top rival", () => {
    const state = {
      ...createInitialState(),
      marketShareHistory: [
        { month: 1, player: 5, topRivalShare: 30 },
        { month: 2, player: 35, topRivalShare: 20 },
      ],
    };
    expect(deriveNationalRanking(state).delta).toBeGreaterThan(0);
  });
});

describe("buildScoreboardMarquee", () => {
  it("returns a non-empty list of display strings", () => {
    const marquee = buildScoreboardMarquee(createInitialState());
    expect(Array.isArray(marquee)).toBe(true);
    expect(marquee.length).toBeGreaterThan(0);
    expect(marquee.every((entry) => typeof entry === "string" && entry.length > 0)).toBe(true);
  });

  it("surfaces a campaign D-day countdown derived from the calendar", () => {
    const marquee = buildScoreboardMarquee(createInitialState());
    expect(marquee.some((entry) => /D-\d+/.test(entry))).toBe(true);
  });

  it("surfaces this month's objective from the guidance step", () => {
    const state = createInitialState();
    const guidance = getGuidanceStep(state);
    const goal = guidance.priorityLabel ?? guidance.title;
    expect(buildScoreboardMarquee(state).join(" · ")).toContain(goal);
  });

  it("names the top rival to chase when a counter plan exists", () => {
    const state = createInitialState();
    const topRival = getRivalCounterPlans(state, 1)[0];
    if (topRival) {
      expect(buildScoreboardMarquee(state).join(" · ")).toContain(topRival.competitorName);
    }
  });
});
