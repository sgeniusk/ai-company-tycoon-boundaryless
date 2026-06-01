# v0.97 #1 Desktop Resource-HUD Pixel Redesign QA

Date: 2026-06-02

## Scope

- Goal: restore the pixel resource icons and +/- deltas on desktop (>1100px) without text overflow, while keeping the v0.96 value-only compaction on mobile (<=1100px). Carried from v0.96.
- Code path: visual-only `App.css` only (plus the v0.97 layout contract). `ResourceStrip` markup unchanged.
- No simulation, save, data, economy, tick, or RNG behavior changed.

## Implementation

- Scoped the v0.96 resource compaction (`.resource-icon`/`.resource-delta`/`.resource-tile span` `display:none` + `.resource-tile`/`strong` restructure) into `@media (max-width: 1100px)`.
- Added a `@media (min-width: 1101px)` desktop compact tile under `.first-screen-composition`: small pixel icon (`transform: scale(0.62)`), value at `0.56rem` (`tabular-nums`), delta at `0.46rem`, name span hidden; neutral delta collapses to a `·` glyph so "변동 없음" cannot overflow. Vertical micro-stack `grid-template-rows: 15px 12px 9px`.

## TDD Evidence

- RED: `npm test -- src/ui/layout-contract.test.ts` — failed on the new `v0.97 keeps desktop resource-HUD pixel icons and deltas visible` test before the CSS change.
- GREEN: same command passed (1 file / 121 tests).

## Browser Verification (Claude, live dev server :5222)

Codex cannot run the browser (sandbox blocks Chromium localhost), so Claude verified on the live server.

Desktop (1366x768):
- Resource tiles: 8
- Pixel icons visible: 8 / 8
- Deltas visible: 8 / 8
- Surface text overflow: 0
- Document overflow: 0

Mobile (390x844):
- Pixel icons visible: 0 / 8 (compaction preserved — value-only)
- Deltas visible: 0 / 8 (compaction preserved)
- Surface text overflow: 0

Regression — committed first-screen smoke `node scripts/qa/check-v096-first-screen.mjs`:
- desktop/mobile exit 0, surface overflow 0, office fraction 0.26 / 0.246, 6 actors.

Screenshots:
- `reports/qa/screenshots/v0_97_resource_hud_desktop.png`
- `reports/qa/screenshots/v0_97_resource_hud_mobile.png`

## Gate

`npm run harness:gate < /dev/null`: PASS — 53 files / 644 tests, validate:data, beta-readiness 15/15, build 2.06s.

## Visual-Only Proof

`git --no-pager diff --quiet -- src/game/simulation.ts src/game/types.ts data/`: empty (visual-only).

## Notes

- This is v0.97 block #1 (desktop resource-HUD). Remaining v0.97 work per `reports/v0_96_plus_commercial_polish_roadmap.md`: broaden the pixel-art consistency sweep (soft SaaS shadows, card-like panels, inconsistent radii, non-stepped animations, pixel tokens).
- Delta magnitude is shown at desktop in a compact form; the neutral state is a tiny `·`. If a future resource produces a very wide delta, re-check the smoke overflow stays 0.
