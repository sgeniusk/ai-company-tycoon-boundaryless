import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { agentTypes, assetManifest, competitors, items } from "./data";

const packageJson = JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8")) as {
  scripts: Record<string, string>;
};
const v053ImportScript = readFileSync(new URL("../../scripts/assets/import-v053-character-source.mjs", import.meta.url), "utf8");
const v054ImportScript = readFileSync(new URL("../../scripts/assets/import-v054-office-art.mjs", import.meta.url), "utf8");
const v055ScreenshotScript = readFileSync(new URL("../../scripts/qa/capture-office-visuals-screenshots.mjs", import.meta.url), "utf8");

function readPngSize(assetPath: string) {
  const buffer = readFileSync(new URL(`../../public${assetPath}`, import.meta.url), "binary");
  const readUInt32BE = (offset: number) => (
    ((buffer.charCodeAt(offset) & 0xff) * 0x1000000)
    + ((buffer.charCodeAt(offset + 1) & 0xff) << 16)
    + ((buffer.charCodeAt(offset + 2) & 0xff) << 8)
    + (buffer.charCodeAt(offset + 3) & 0xff)
  );

  return {
    width: readUInt32BE(16),
    height: readUInt32BE(20),
  };
}

describe("alpha v0.9 pixel asset manifest", () => {
  const knownAgentIds = new Set(agentTypes.map((agent) => agent.id));
  const knownCompetitorIds = new Set(competitors.map((competitor) => competitor.id));
  const knownItemIds = new Set(items.map((item) => item.id));

  it("defines a stable pixel grid for first-pass sprite replacement", () => {
    expect(assetManifest.version).toBe("0.55-alpha");
    expect(assetManifest.sprite_grid.tile_size).toBe(16);
    expect(assetManifest.sprite_grid.character_frame_size).toBe(32);
    expect(assetManifest.sprite_grid.portrait_size).toBe(48);
    expect(assetManifest.sprite_grid.icon_size).toBe(24);
    expect(assetManifest.sprite_grid.competitor_logo_size).toBe(32);
  });

  it("defines v0.53 final-art import and normalized event-pose sheet contracts", () => {
    const eventPoseSheet = assetManifest.sprite_sheets.agents_v053_final_art_import;

    expect(eventPoseSheet).toMatchObject({
      path: "/assets/sprites/v053-agents-event-poses-final.png",
      source_path: "/assets/sprites/source/v053-agents-event-poses-final-source.png",
      source_status: "draft",
      density: 2,
      source_scale: 4,
      source_frame_width: 384,
      source_frame_height: 384,
      normalized_from: "v053-agents-event-poses-final-source",
      source_origin: "imported_source_candidate",
      import_pipeline: "scripts/assets/import-v053-character-source.mjs",
      normalization_method: "nearest-neighbor 4x source to 2x runtime",
      anchor_reference: "bottom-center",
      anchor_tolerance_px: 8,
      silhouette_drift_tolerance_px: 12,
      frame_width: 192,
      frame_height: 192,
      columns: 3,
      rows: 25,
      frame_count: 75,
    });
    expect(eventPoseSheet.preview_frames).toEqual(expect.arrayContaining([0, 1, 2, 3, 4, 7, 13, 19, 23]));

    expect(readPngSize(eventPoseSheet.path)).toEqual({ width: 576, height: 4800 });
    if (!eventPoseSheet.source_path) throw new Error("v0.53 event-pose sheet must keep a source_path");
    expect(readPngSize(eventPoseSheet.source_path)).toEqual({ width: 1152, height: 9600 });
  });

  it("exposes a reproducible v0.53 character-source import command", () => {
    expect(packageJson.scripts["assets:v053"]).toBe("node scripts/assets/import-v053-character-source.mjs");
    expect(v053ImportScript).toContain("decodePngRgba");
    expect(v053ImportScript).toContain("downsampleNearest");
    expect(v053ImportScript).toContain("validateSourceDimensions");
    expect(v053ImportScript).toContain("v053-agents-event-poses-final-source.png");
  });

  it("defines v0.54 imported office object and backdrop art contracts", () => {
    const objectSheet = assetManifest.sprite_sheets.office_objects_v054_final_art_import;
    const backdrop = assetManifest.scene_backdrops.office_isometric_v054_final_art_import;

    expect(objectSheet).toMatchObject({
      path: "/assets/sprites/v054-office-objects-final.png",
      source_path: "/assets/sprites/source/v054-office-objects-final-source.png",
      source_status: "draft",
      density: 2,
      source_scale: 4,
      source_frame_width: 512,
      source_frame_height: 384,
      normalized_from: "v054-office-objects-final-source",
      source_origin: "imported_source_candidate",
      import_pipeline: "scripts/assets/import-v054-office-art.mjs",
      normalization_method: "nearest-neighbor 4x source to 2x runtime",
      frame_width: 256,
      frame_height: 192,
      columns: 5,
      rows: 5,
      frame_count: 21,
    });
    expect(readPngSize(objectSheet.path)).toEqual({ width: 1280, height: 960 });
    if (!objectSheet.source_path) throw new Error("v0.54 office object sheet must keep a source_path");
    expect(readPngSize(objectSheet.source_path)).toEqual({ width: 2560, height: 1920 });

    expect(backdrop).toMatchObject({
      path: "/assets/backgrounds/v054-isometric-office-final.png",
      source_path: "/assets/backgrounds/source/v054-isometric-office-final-source.png",
      source_status: "draft",
      width: 2560,
      height: 1440,
      source_width: 5120,
      source_height: 2880,
      source_origin: "imported_source_candidate",
      import_pipeline: "scripts/assets/import-v054-office-art.mjs",
      normalization_method: "nearest-neighbor 4x source to 2x runtime",
    });
    expect(readPngSize(backdrop.path)).toEqual({ width: 2560, height: 1440 });
    if (!backdrop.source_path) throw new Error("v0.54 office backdrop must keep a source_path");
    expect(readPngSize(backdrop.source_path)).toEqual({ width: 5120, height: 2880 });
  });

  it("exposes a reproducible v0.54 office-art import command", () => {
    expect(packageJson.scripts["assets:v054"]).toContain("scripts/assets/import-v054-office-art.mjs");
    expect(v054ImportScript).toContain("decodePngRgba");
    expect(v054ImportScript).toContain("downsampleNearest");
    expect(v054ImportScript).toContain("validateObjectSourceDimensions");
    expect(v054ImportScript).toContain("validateBackdropSourceDimensions");
    expect(v054ImportScript).toContain("v054-office-objects-final-source.png");
    expect(v054ImportScript).toContain("v054-isometric-office-final-source.png");
  });

  it("defines v0.55 final-art screenshot QA artifacts without claiming final external art exists", () => {
    const visualQa = assetManifest.visual_qa.office_visuals_v055_screenshot_qa;

    expect(visualQa).toMatchObject({
      scenario_url: "/?scenario=office-visuals",
      source_art_status: "draft_candidates_pending_final_replacement",
      desktop_screenshot_path: "reports/qa/screenshots/v0_55_office_visuals_desktop.png",
      mobile_screenshot_path: "reports/qa/screenshots/v0_55_office_visuals_mobile.png",
      report_path: "reports/qa/v0_55_final_source_art_screenshot_qa.md",
    });
    expect(visualQa.required_viewports).toEqual([
      { id: "desktop", width: 1366, height: 768 },
      { id: "mobile", width: 390, height: 844 },
    ]);
    expect(visualQa.checks).toEqual(expect.arrayContaining([
      "actor_anchor_readability",
      "object_depth_ordering",
      "backdrop_framing",
      "hud_text_overlap",
      "mobile_command_hand_fit",
    ]));
  });

  it("exposes a reproducible v0.55 office-visuals screenshot command", () => {
    expect(packageJson.scripts["qa:office-visuals:screenshots"]).toContain("scripts/qa/capture-office-visuals-screenshots.mjs");
    expect(v055ScreenshotScript).toContain("reports/qa/screenshots/v0_55_office_visuals_desktop.png");
    expect(v055ScreenshotScript).toContain("reports/qa/screenshots/v0_55_office_visuals_mobile.png");
    expect(v055ScreenshotScript).toContain("--window-size=1366,768");
    expect(v055ScreenshotScript).toContain("--window-size=390,844");
    expect(v055ScreenshotScript).toContain("?scenario=office-visuals");
  });

  it("keeps v0.47 high-density office slicing contracts for generated pixel art", () => {
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

  it("attaches priority agents to the v0.53 imported final-art event-pose character sheet", () => {
    assetManifest.agent_sprites.forEach((sprite, index) => {
      expect(sprite.source_status).toBe("draft");
      expect(sprite.sheet_id).toBe("agents_v053_final_art_import");
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

  it("ships a commercial UI icon atlas for first-screen chrome controls", () => {
    const atlas = assetManifest.sprite_sheets.commercial_ui_v071_atlas;
    const atlasScriptUrl = new URL("../../scripts/assets/generate-v071-commercial-ui-atlas.mjs", import.meta.url);

    expect(atlas).toMatchObject({
      path: "/assets/ui/v071-commercial-ui-atlas.png",
      source_status: "final",
      frame_width: 48,
      frame_height: 48,
      columns: 8,
      rows: 3,
      frame_count: 24,
      slice_mode: "row-major commercial UI icon atlas",
    });
    expect(readPngSize(atlas.path)).toEqual({ width: 384, height: 144 });
    expect(packageJson.scripts["assets:v071"]).toBe("node scripts/assets/generate-v071-commercial-ui-atlas.mjs");
    expect(readFileSync(atlasScriptUrl, "utf8")).toContain("v071-commercial-ui-atlas.png");
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
    const generatedObjects = assetManifest.office_objects.filter((object) => object.sheet_id === "office_objects_v054_final_art_import");

    expect(generatedObjects.length).toBeGreaterThanOrEqual(10);
    for (const object of generatedObjects) {
      expect(object.source_status).toBe("draft");
      expect(Number.isInteger(object.sheet_index)).toBe(true);
    }
  });
});
