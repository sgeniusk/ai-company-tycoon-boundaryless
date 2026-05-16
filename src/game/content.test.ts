import { describe, expect, it } from "vitest";
import { agentTypes, capabilities, competitors, growthPaths, items, products, rivalEvents, upgrades } from "./data";
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

  it("prepares a long-term hiring roster across humans, AI agents, and robots", () => {
    const countsByKind = agentTypes.reduce<Record<string, number>>((counts, agent) => {
      counts[agent.kind ?? "missing"] = (counts[agent.kind ?? "missing"] ?? 0) + 1;
      return counts;
    }, {});

    expect(agentTypes.length).toBeGreaterThanOrEqual(22);
    expect(countsByKind.human).toBeGreaterThanOrEqual(6);
    expect(countsByKind.ai_agent).toBeGreaterThanOrEqual(12);
    expect(countsByKind.robot).toBeGreaterThanOrEqual(3);
    expect(countsByKind.missing ?? 0).toBe(0);

    expect(agentTypes.some((agent) => (agent.unlock_requirements.min_month ?? 0) >= 12)).toBe(true);
    expect(agentTypes.some((agent) => (agent.unlock_requirements.min_star ?? 0) >= 3)).toBe(true);
    expect(agentTypes.every((agent) => agent.preferred_items.length >= 2)).toBe(true);
  });

  it("defines item categories for office, equipment, research, safety, and marketing", () => {
    const categories = new Set(items.map((item) => item.category));

    for (const category of ["office", "equipment", "research", "safety", "marketing", "hardware", "comfort", "manufacturing", "mobility"]) {
      expect(categories.has(category)).toBe(true);
    }
    expect(items.length).toBeGreaterThanOrEqual(36);
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

  it("defines three post-release growth paths with actionable references", () => {
    const productIds = new Set(products.map((product) => product.id));
    const capabilityIds = new Set(capabilities.map((capability) => capability.id));
    const itemIds = new Set(items.map((item) => item.id));
    const upgradeIds = new Set(upgrades.map((upgrade) => upgrade.id));
    const menuIds = new Set(["company", "products", "agents", "research", "shop", "competition", "log"]);

    expect(growthPaths.map((path) => path.id)).toEqual([
      "productivity_line",
      "trust_enterprise",
      "code_vision_lab",
    ]);

    for (const path of growthPaths) {
      expect(path.title).toBeTruthy();
      expect(path.description).toBeTruthy();
      expect(menuIds.has(path.target_menu)).toBe(true);
      expect(path.action_label).toBeTruthy();
      expect(path.payoff).toBeTruthy();
      expect(path.bonus_description).toBeTruthy();
      expect(path.trigger_tags.length).toBeGreaterThan(0);

      for (const [resourceId, value] of Object.entries(path.commitment_effects ?? {})) {
        expect(["cash", "users", "compute", "data", "talent", "trust", "hype", "automation"]).toContain(resourceId);
        expect(typeof value).toBe("number");
      }

      for (const productId of path.recommended_product_ids ?? []) {
        expect(productIds.has(productId)).toBe(true);
      }
      for (const capabilityId of path.recommended_capability_ids ?? []) {
        expect(capabilityIds.has(capabilityId)).toBe(true);
      }
      for (const itemId of path.recommended_item_ids ?? []) {
        expect(itemIds.has(itemId)).toBe(true);
      }
      for (const upgradeId of path.recommended_upgrade_ids ?? []) {
        expect(upgradeIds.has(upgradeId)).toBe(true);
      }
      expect(path.followup_objectives?.length).toBe(3);
      for (const objective of path.followup_objectives ?? []) {
        expect(objective.id).toBeTruthy();
        expect(objective.label).toBeTruthy();
        expect(menuIds.has(objective.target_menu)).toBe(true);
        expect(Object.keys(objective.completion).length).toBeGreaterThan(0);
      }
    }
  });
});
