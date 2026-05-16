import { describe, expect, it } from "vitest";
import { agentTypes, assetManifest, competitors, items } from "./data";

describe("alpha v0.9 pixel asset manifest", () => {
  const knownAgentIds = new Set(agentTypes.map((agent) => agent.id));
  const knownCompetitorIds = new Set(competitors.map((competitor) => competitor.id));
  const knownItemIds = new Set(items.map((item) => item.id));

  it("defines a stable pixel grid for first-pass sprite replacement", () => {
    expect(assetManifest.version).toBe("0.9.0-alpha");
    expect(assetManifest.sprite_grid.tile_size).toBe(16);
    expect(assetManifest.sprite_grid.character_frame_size).toBe(32);
    expect(assetManifest.sprite_grid.portrait_size).toBe(48);
    expect(assetManifest.sprite_grid.icon_size).toBe(24);
    expect(assetManifest.sprite_grid.competitor_logo_size).toBe(32);
  });

  it("covers priority agent sprites with placeholder-safe animation hooks", () => {
    const priorityAgentIds = ["prompt_architect", "code_smith", "data_curator", "infra_operator", "growth_hacker"];
    const manifestedAgentIds = new Set(assetManifest.agent_sprites.map((sprite) => sprite.agent_type_id));

    for (const agentId of priorityAgentIds) {
      expect(manifestedAgentIds.has(agentId)).toBe(true);
    }

    for (const sprite of assetManifest.agent_sprites) {
      expect(knownAgentIds.has(sprite.agent_type_id)).toBe(true);
      expect(sprite.source_status).toBe("placeholder");
      expect(sprite.palette).toHaveLength(3);
      expect(sprite.palette.every((color) => /^#[0-9a-f]{6}$/i.test(color))).toBe(true);
      expect(sprite.animations.idle.frames).toBe(3);
      expect(sprite.animations.work.frames).toBe(3);
      expect(sprite.portrait_hint).toBeTruthy();
      expect(sprite.prop_hint).toBeTruthy();
    }
  });

  it("assigns every competitor a logo identity hook", () => {
    const identityIds = new Set(assetManifest.competitor_identities.map((identity) => identity.competitor_id));

    for (const competitorId of knownCompetitorIds) {
      expect(identityIds.has(competitorId)).toBe(true);
    }

    for (const identity of assetManifest.competitor_identities) {
      expect(knownCompetitorIds.has(identity.competitor_id)).toBe(true);
      expect(identity.logo_size).toBe(assetManifest.sprite_grid.competitor_logo_size);
      expect(identity.palette.length).toBeGreaterThanOrEqual(3);
      expect(identity.mascot_hint).toBeTruthy();
    }
  });

  it("maps first-shop item icons to known items", () => {
    expect(assetManifest.item_icons.length).toBeGreaterThanOrEqual(18);

    for (const icon of assetManifest.item_icons) {
      expect(knownItemIds.has(icon.item_id)).toBe(true);
      expect(icon.icon_size).toBe(assetManifest.sprite_grid.icon_size);
      expect(icon.readable_shape).toBeTruthy();
    }
  });

  it("prepares a larger office object library for item-driven decoration", () => {
    const linkedItemIds = new Set(assetManifest.office_objects.flatMap((object) => object.linked_item_id ? [object.linked_item_id] : []));

    expect(assetManifest.office_objects.length).toBeGreaterThanOrEqual(18);
    expect(linkedItemIds.size).toBeGreaterThanOrEqual(12);

    for (const object of assetManifest.office_objects) {
      expect(object.footprint[0]).toBeGreaterThanOrEqual(1);
      expect(object.footprint[1]).toBeGreaterThanOrEqual(1);
      expect(object.readable_shape).toBeTruthy();
      expect(object.palette.length).toBeGreaterThanOrEqual(3);
      if (object.linked_item_id) expect(knownItemIds.has(object.linked_item_id)).toBe(true);
    }
  });
});
