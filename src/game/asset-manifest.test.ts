import { describe, expect, it } from "vitest";
import { agentTypes, assetManifest, competitors, items } from "./data";

describe("alpha v0.9 pixel asset manifest", () => {
  const knownAgentIds = new Set(agentTypes.map((agent) => agent.id));
  const knownCompetitorIds = new Set(competitors.map((competitor) => competitor.id));
  const knownItemIds = new Set(items.map((item) => item.id));

  it("defines a stable pixel grid for first-pass sprite replacement", () => {
    expect(assetManifest.version).toBe("0.51-alpha");
    expect(assetManifest.sprite_grid.tile_size).toBe(16);
    expect(assetManifest.sprite_grid.character_frame_size).toBe(32);
    expect(assetManifest.sprite_grid.portrait_size).toBe(48);
    expect(assetManifest.sprite_grid.icon_size).toBe(24);
    expect(assetManifest.sprite_grid.competitor_logo_size).toBe(32);
  });

  it("defines v0.47 high-density sheet slicing contracts for generated pixel art", () => {
    expect(assetManifest.sprite_sheets.agents_v051_event_poses.path).toBe("/assets/sprites/v051-agents-event-poses.png");
    expect(assetManifest.sprite_sheets.agents_v051_event_poses.frame_width).toBe(192);
    expect(assetManifest.sprite_sheets.agents_v051_event_poses.frame_height).toBe(192);
    expect(assetManifest.sprite_sheets.agents_v051_event_poses.columns).toBe(3);
    expect(assetManifest.sprite_sheets.agents_v051_event_poses.rows).toBe(25);
    expect(assetManifest.sprite_sheets.agents_v051_event_poses.frame_count).toBe(75);
    expect(assetManifest.sprite_sheets.agents_v051_event_poses.density).toBe(2);
    expect(assetManifest.sprite_sheets.agents_v051_event_poses.preview_frames).toEqual(expect.arrayContaining([0, 1, 2, 3, 4]));
    expect(assetManifest.sprite_sheets.office_objects_v046_hires_isometric.path).toBe("/assets/sprites/v046-office-objects-hires.png");
    expect(assetManifest.sprite_sheets.office_objects_v046_hires_isometric.frame_width).toBe(256);
    expect(assetManifest.sprite_sheets.office_objects_v046_hires_isometric.frame_height).toBe(192);
    expect(assetManifest.sprite_sheets.office_objects_v046_hires_isometric.density).toBe(2);
    expect(assetManifest.sprite_sheets.office_objects_v046_hires_isometric.preview_frames?.length).toBeGreaterThanOrEqual(6);
    expect(assetManifest.scene_backdrops.office_isometric_v046_hires.path).toBe("/assets/backgrounds/v046-isometric-office-hires.png");
    expect(assetManifest.scene_backdrops.office_isometric_v046_hires.width).toBe(2560);
    expect(assetManifest.scene_backdrops.office_isometric_v046_hires.height).toBe(1440);
  });

  it("covers priority agent sprites with placeholder-safe animation hooks", () => {
    const priorityAgentIds = ["prompt_architect", "code_smith", "data_curator", "infra_operator", "growth_hacker"];
    const manifestedAgentIds = new Set(assetManifest.agent_sprites.map((sprite) => sprite.agent_type_id));

    for (const agentId of priorityAgentIds) {
      expect(manifestedAgentIds.has(agentId)).toBe(true);
    }

    for (const sprite of assetManifest.agent_sprites) {
      expect(knownAgentIds.has(sprite.agent_type_id)).toBe(true);
      expect(["placeholder", "draft"]).toContain(sprite.source_status);
      expect(sprite.palette).toHaveLength(3);
      expect(sprite.palette.every((color) => /^#[0-9a-f]{6}$/i.test(color))).toBe(true);
      expect(sprite.animations.idle.frames).toBe(3);
      expect(sprite.animations.idle.duration_ms).toBeGreaterThanOrEqual(900);
      expect(sprite.animations.work.frames).toBe(3);
      expect(sprite.animations.work.duration_ms ?? Number.POSITIVE_INFINITY).toBeLessThan(sprite.animations.idle.duration_ms ?? 0);
      expect(sprite.animations.card_use.frames).toBe(3);
      expect(sprite.animations.card_use.duration_ms).toBeLessThan(sprite.animations.idle.duration_ms ?? Number.POSITIVE_INFINITY);
      expect(sprite.animations.cheer.frames).toBe(3);
      expect(sprite.animations.alert.frames).toBe(3);
      expect(sprite.portrait_hint).toBeTruthy();
      expect(sprite.prop_hint).toBeTruthy();
    }
  });

  it("attaches priority agents to the v0.51 generated event-pose character sheet", () => {
    assetManifest.agent_sprites.forEach((sprite, index) => {
      expect(sprite.source_status).toBe("draft");
      expect(sprite.sheet_id).toBe("agents_v051_event_poses");
      expect(sprite.animations.idle.row).toBe(index * 5);
      expect(sprite.animations.work.row).toBe(index * 5 + 1);
      expect(sprite.animations.card_use.row).toBe(index * 5 + 2);
      expect(sprite.animations.cheer.row).toBe(index * 5 + 3);
      expect(sprite.animations.alert.row).toBe(index * 5 + 4);
    });
  });

  it("keeps sprite sheet preview frames inside their atlas bounds", () => {
    for (const sheet of Object.values(assetManifest.sprite_sheets)) {
      expect(sheet.preview_frames?.length).toBeGreaterThanOrEqual(4);
      for (const frameIndex of sheet.preview_frames ?? []) {
        expect(Number.isInteger(frameIndex)).toBe(true);
        expect(frameIndex).toBeGreaterThanOrEqual(0);
        expect(frameIndex).toBeLessThan(sheet.frame_count);
      }
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

  it("links first-screen office objects to a generated high-density object sheet", () => {
    const generatedObjects = assetManifest.office_objects.filter((object) => object.sheet_id === "office_objects_v046_hires_isometric");

    expect(generatedObjects.length).toBeGreaterThanOrEqual(10);
    for (const object of generatedObjects) {
      expect(object.source_status).toBe("draft");
      expect(Number.isInteger(object.sheet_index)).toBe(true);
    }
  });
});
