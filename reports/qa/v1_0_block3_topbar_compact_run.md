# v1.0 #3 Top-bar Compaction (market suite -> competition popup) QA

Date: 2026-06-02

## Scope

- Move the always-on market suite (MarketSharePanel + RivalArchetypePanel) out of the TopBar into the CompetitionPanel (competition popup); compact the top bar (3 -> 2 columns, lower min-height). visual/additive.
- No simulation, save, data, economy, tick, or RNG change.

## Implementation (Codex)

- GameChrome TopBar: `<aside className="top-market-suite">` removed; MarketSharePanel/RivalArchetypePanel imports dropped.
- MenuPanels CompetitionPanel: renders MarketSharePanel + RivalArchetypePanel at the top (same components, same props).
- App.css `.top-bar`: 3 -> 2 columns (brand | command-center), min-height 116 -> 96, market-suite rules + responsive breakpoints cleaned.

## TDD Evidence

- RED->GREEN on src/ui/layout-contract.test.ts (top-market-suite absent from gameChrome; Market/Rival present in menuPanels). Full suite 53 files / 651 tests. Build (tsc + vite) clean.

## Browser Verification (Claude, live :5222)

- Element heights at 1366x768: **top bar 224 -> 147px**, **office-scene 244 -> 321px**.
- `check-v096-first-screen`: **officeVisibleFraction desktop 0.29 -> 0.376** (office now the dominant full-width tall scene), mobile 0.26; surface overflow 0; 6 actors.
- `check-v1_0-menu-popup`: 8/8 menus open + dismiss, 0 errors; the competition popup now renders the market share + rival panels.
- Screenshots eyeballed: default screen reads office-first (office dominates); competition popup shows the relocated market suite.

## Gate

`npm run harness:gate < /dev/null`: PASS — 53 files / 651 tests, build 1.40s, no chunk warning.

## Additive Proof

`git --no-pager diff --quiet -- src/game/simulation.ts src/game/types.ts data/`: empty.

## Result — office-first goal achieved

Across the popup redesign (blocks 1-3): menu column -> popup launcher, stage-side -> status popup, office overlays -> next-action chip + 꾸미기 button, market suite -> competition popup, top bar 224 -> 147px. officeVisibleFraction 0.24 -> 0.376; the office now dominates the first screen. Optional further gain (~0.40) would come from merging the command + launcher rows — deferred as polish; the office already dominates.
