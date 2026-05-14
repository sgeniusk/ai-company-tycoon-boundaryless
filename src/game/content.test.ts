import { describe, expect, it } from "vitest";
import { agentTypes, competitors, items, rivalEvents } from "./data";
import { locales, t } from "../i18n";

describe("alpha content data", () => {
  it("defines a broad AI agent roster with stats and appearance hooks", () => {
    expect(agentTypes.length).toBeGreaterThanOrEqual(10);

    for (const agent of agentTypes) {
      expect(agent.name).toBeTruthy();
      expect(agent.role).toBeTruthy();
      expect(agent.stats.autonomy).toBeGreaterThanOrEqual(1);
      expect(agent.stats.research + agent.stats.engineering + agent.stats.product + agent.stats.growth).toBeGreaterThan(0);
      expect(agent.appearance.palette.length).toBeGreaterThanOrEqual(3);
      expect(agent.appearance.silhouette).toBeTruthy();
      expect(agent.appearance.signatureProp).toBeTruthy();
      expect(agent.hire_cost.cash).toBeGreaterThan(0);
    }
  });

  it("defines item categories for office, equipment, research, safety, and marketing", () => {
    const categories = new Set(items.map((item) => item.category));

    for (const category of ["office", "equipment", "research", "safety", "marketing"]) {
      expect(categories.has(category)).toBe(true);
    }
    expect(items.length).toBeGreaterThanOrEqual(12);
  });

  it("keeps item effects attached to known game concepts", () => {
    const allowedEffectKeys = new Set([
      "cash",
      "users",
      "compute",
      "data",
      "talent",
      "trust",
      "hype",
      "automation",
      "research",
      "engineering",
      "product",
      "growth",
      "safety",
      "operations",
      "creativity",
      "autonomy",
    ]);

    for (const item of items) {
      for (const effectKey of Object.keys(item.effects)) {
        expect(allowedEffectKeys.has(effectKey)).toBe(true);
      }
    }
  });

  it("defines named AI competitors with localizable display keys", () => {
    expect(competitors.length).toBeGreaterThanOrEqual(5);

    for (const competitor of competitors) {
      expect(competitor.id).toMatch(/^competitor_/);
      expect(competitor.name_key).toBeTruthy();
      expect(competitor.tagline_key).toBeTruthy();
      expect(competitor.focus_domains.length).toBeGreaterThanOrEqual(1);
      expect(competitor.starting_score).toBeGreaterThan(0);
      expect(t(competitor.name_key, "ko")).not.toBe(competitor.name_key);
      expect(t(competitor.name_key, "en")).not.toBe(competitor.name_key);
    }
  });

  it("defines rival events and keeps locale dictionaries aligned", () => {
    expect(rivalEvents.length).toBeGreaterThanOrEqual(3);

    const localeCodes = Object.keys(locales);
    expect(localeCodes).toEqual(expect.arrayContaining(["ko", "en"]));

    for (const event of rivalEvents) {
      expect(t(event.name_key, "ko")).not.toBe(event.name_key);
      expect(t(event.description_key, "en")).not.toBe(event.description_key);
      expect(event.choices.length).toBeGreaterThanOrEqual(2);
      for (const choice of event.choices) {
        expect(t(choice.text_key, "ko")).not.toBe(choice.text_key);
        expect(t(choice.description_key, "en")).not.toBe(choice.description_key);
      }
    }
  });
});
