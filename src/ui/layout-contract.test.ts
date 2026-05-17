import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { menus } from "./menu";

const appCss = readFileSync(new URL("../App.css", import.meta.url), "utf8");
const gameChrome = readFileSync(new URL("../components/GameChrome.tsx", import.meta.url), "utf8");

describe("v0.13.3 compact game shell layout", () => {
  it("keeps desktop play inside a fixed HUD, stage, and menu grid", () => {
    expect(appCss).toContain("grid-template-areas:");
    expect(appCss).toContain("\"top top top\"");
    expect(appCss).toContain("\"stage stage menu\"");
    expect(appCss).toContain("\"resources commands menu\"");
    expect(appCss).toContain("height: 100dvh");
    expect(appCss).toMatch(/\.app-shell\s*{[^}]*overflow:\s*hidden/s);
    expect(appCss).toMatch(/\.menu-panel\s*{[^}]*overflow:\s*auto/s);
  });

  it("moves resources into a compact bottom HUD instead of a tall web sidebar", () => {
    expect(appCss).toMatch(/\.resource-strip\s*{[^}]*grid-template-columns:\s*repeat\(8,\s*minmax\(0,\s*1fr\)\)/s);
    expect(appCss).toMatch(/\.resource-strip\s*{[^}]*overflow:\s*hidden/s);
    expect(appCss).toMatch(/\.resource-tile\s*{[^}]*min-height:\s*42px/s);
  });

  it("treats the command row as a fixed bottom control strip", () => {
    expect(appCss).toMatch(/\.command-row\s*{[^}]*grid-area:\s*commands/s);
    expect(appCss).toMatch(/\.command-row\s*{[^}]*overflow:\s*hidden/s);
    expect(appCss).toMatch(/\.command-row\s+p\s*{[^}]*white-space:\s*nowrap/s);
  });

  it("keeps tablet and mobile layouts in a fixed game viewport with internal scrolling", () => {
    expect(appCss).toMatch(/@media\s*\(max-width:\s*1100px\)\s*{[\s\S]*body\s*{[^}]*overflow:\s*hidden/s);
    expect(appCss).toMatch(/@media\s*\(max-width:\s*1100px\)\s*{[\s\S]*\.app-shell\s*{[^}]*height:\s*100dvh/s);
    expect(appCss).toMatch(/@media\s*\(max-width:\s*1100px\)\s*{[\s\S]*\.menu-panel\s*{[^}]*overflow:\s*auto/s);
  });

  it("prevents narrow screens from creating horizontal page overflow", () => {
    expect(appCss).toMatch(/\.app-shell\s*{[^}]*width:\s*min\(100%,\s*1366px\)/s);
    expect(appCss).toMatch(/\.game-stage,\s*\.menu-layout,\s*\.resource-strip,\s*\.command-row\s*{[^}]*min-width:\s*0/s);
    expect(appCss).toMatch(/\.resource-tile,\s*\.office-scene,\s*\.stage-side,\s*\.menu-panel,\s*\.panel\s*{[^}]*min-width:\s*0/s);
    expect(appCss).toMatch(/@media\s*\(max-width:\s*1100px\)\s*{[\s\S]*\.app-shell\s*{[^}]*width:\s*100vw/s);
    expect(appCss).toMatch(/@media\s*\(max-width:\s*700px\)\s*{[\s\S]*\.app-shell\s*{[^}]*width:\s*min\(100vw,\s*390px\)/s);
    expect(appCss).toMatch(/@media\s*\(max-width:\s*700px\)\s*{[\s\S]*\.app-shell\s*{[^}]*margin:\s*0/s);
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

  it("gives launch impact feedback a distinct reward panel inside the results tab", () => {
    expect(appCss).toMatch(/\.launch-impact-panel\s*{[^}]*background:/s);
    expect(appCss).toMatch(/\.launch-impact-badges\s*{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/s);
    expect(appCss).toMatch(/\.card-impact-list\s*{[^}]*gap:/s);
  });

  it("shows shareable timeline moments as a compact highlight grid", () => {
    expect(appCss).toMatch(/\.highlight-moment-grid\s*{[^}]*grid-template-columns:/s);
    expect(appCss).toMatch(/\.highlight-moment-card\s*{[^}]*min-height:/s);
    expect(appCss).toMatch(/\.highlight-moment-card\.tone-positive/s);
  });

  it("frames the right management surface as an in-game console", () => {
    expect(appCss).toMatch(/\.menu-layout\s*{[^}]*background:\s*#20342d/s);
    expect(appCss).toMatch(/\.menu-layout\s*{[^}]*border:\s*3px solid var\(--line\)/s);
    expect(appCss).toMatch(/\.menu-panel\s*{[^}]*background:\s*#fff7df/s);
    expect(appCss).toMatch(/\.menu-panel\s*{[^}]*border:\s*2px solid var\(--line\)/s);
    expect(appCss).toMatch(/\.main-menu button span\s*{[^}]*display:\s*none/s);
  });

  it("puts quick state overlays inside the office playfield", () => {
    expect(gameChrome).toContain('className="office-hud"');
    expect(gameChrome).toContain('className="office-alert-strip"');
    expect(appCss).toMatch(/\.office-hud\s*{[^}]*position:\s*absolute/s);
    expect(appCss).toMatch(/\.office-hud\s*{[^}]*z-index:\s*5/s);
    expect(appCss).toMatch(/\.office-alert-strip\s*{[^}]*position:\s*absolute/s);
  });

  it("protects the playfield by narrowing the persistent console column", () => {
    expect(appCss).toMatch(/\.app-shell\s*{[^}]*grid-template-columns:\s*minmax\(0,\s*0\.94fr\)\s+minmax\(0,\s*1fr\)\s+clamp\(330px,\s*28vw,\s*390px\)/s);
    expect(appCss).toMatch(/\.game-stage\s*{[^}]*grid-template-columns:\s*minmax\(0,\s*1\.72fr\)\s+minmax\(230px,\s*0\.48fr\)/s);
  });

  it("keeps mobile chrome compact enough for the office scene to remain visible", () => {
    expect(appCss).toMatch(/@media\s*\(max-width:\s*700px\)\s*{[\s\S]*\.top-bar\s*{[^}]*display:\s*grid/s);
    expect(appCss).toMatch(/@media\s*\(max-width:\s*700px\)\s*{[\s\S]*\.status-cluster\s*{[^}]*grid-template-columns:\s*repeat\(4,\s*minmax\(0,\s*1fr\)\)/s);
    expect(appCss).toMatch(/@media\s*\(max-width:\s*700px\)\s*{[\s\S]*\.status-cluster \.status-pill:nth-of-type\(n \+ 5\)\s*{[^}]*display:\s*none/s);
    expect(appCss).toMatch(/@media\s*\(max-width:\s*700px\)\s*{[\s\S]*\.office-wall\s*{[^}]*min-height:\s*0/s);
  });
});
