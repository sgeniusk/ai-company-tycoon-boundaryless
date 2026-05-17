import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { menus } from "./menu";

const appCss = readFileSync(new URL("../App.css", import.meta.url), "utf8");

describe("v0.13.3 compact game shell layout", () => {
  it("keeps desktop play inside a fixed HUD, stage, and menu grid", () => {
    expect(appCss).toContain("grid-template-areas:");
    expect(appCss).toContain("\"top top top\"");
    expect(appCss).toContain("\"resources stage menu\"");
    expect(appCss).toContain("\"commands stage menu\"");
    expect(appCss).toContain("height: 100vh");
    expect(appCss).toMatch(/\.app-shell\s*{[^}]*overflow:\s*hidden/s);
    expect(appCss).toMatch(/\.menu-panel\s*{[^}]*overflow:\s*auto/s);
  });

  it("groups menu buttons into compact rail sections", () => {
    expect(menus.map((menu) => `${menu.group}:${menu.id}`)).toEqual([
      "core:company",
      "core:products",
      "core:deck",
      "operations:agents",
      "operations:research",
      "operations:shop",
      "meta:competition",
      "meta:log",
    ]);
  });

  it("caps stage-side cards so long campaign summaries scroll instead of overlapping", () => {
    expect(appCss).toMatch(/\.stage-side\s*>\s*article\s*{[^}]*max-height:/s);
    expect(appCss).toMatch(/\.stage-side\s*>\s*article\s*{[^}]*overflow:\s*auto/s);
    expect(appCss).toMatch(/\.stage-side\s*>\s*article\s*{[^}]*scrollbar-width:\s*thin/s);
  });

  it("compresses the right-side stage information into a tabbed game panel", () => {
    expect(appCss).toMatch(/\.stage-side-tabs\s*{[^}]*grid-template-columns:\s*repeat\(4,\s*minmax\(0,\s*1fr\)\)/s);
    expect(appCss).toMatch(/\.stage-side-panel\s*{[^}]*overflow:\s*auto/s);
    expect(appCss).toMatch(/\.stage-side-panel\s*>\s*article/s);
  });
});
