import { describe, expect, it } from "vitest";
import { agentTypes, items } from "./data";

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
});
