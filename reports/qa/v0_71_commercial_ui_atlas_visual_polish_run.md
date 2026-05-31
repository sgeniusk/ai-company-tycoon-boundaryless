# v0.71 Commercial UI Atlas Visual Polish QA Run

Date: 2026-05-31

## Scope

- Added a deterministic 24-frame commercial UI icon atlas for first-screen chrome controls.
- Skinned bottom HUD resources, command buttons, and main menu rails with atlas-backed icons.
- Kept the change presentation-only: no simulation tick, save migration, economy, ending, or content-balance changes.
- Preserved protected contract files: `AGENTS.md`, `feature_list.json`, `progress.md`, `CLAUDE.md`, and `docs/ROADMAP.md` have no diff.

## TDD Evidence

- RED: Added `src/game/asset-manifest.test.ts` and `src/ui/layout-contract.test.ts` coverage for `commercial_ui_v071_atlas`, the generator script, PNG dimensions, `getCommercialUiIconStyle`, and resource/command/menu icon skinning. The new tests initially failed because the atlas manifest entry and GameChrome icon wiring did not exist.
- GREEN: `npm test -- src/game/asset-manifest.test.ts src/ui/layout-contract.test.ts < /dev/null`
  - Result: 2 files passed / 114 tests passed.

## Browser Smoke

Scenario: `http://127.0.0.1:5222/?scenario=beta-readiness`

- Desktop 1366x768:
  - Resource icons: 8 visible.
  - Command icons: 4 visible.
  - Menu icons: 8 visible.
  - Atlas request: 200.
  - Atlas backgrounds loaded from `/assets/ui/v071-commercial-ui-atlas.png`: yes.
  - Text fit failures: none.
  - Major chrome overlaps: none.
  - Horizontal overflow: none.
  - Console/page errors: none.
  - Screenshot: `reports/qa/screenshots/v0_71_commercial_ui_atlas_desktop.png`
- Mobile 390x844:
  - Resource icons: 8 visible.
  - Command icons: 4 visible.
  - Menu icons: 5 visible.
  - Atlas request: 200.
  - Atlas backgrounds loaded from `/assets/ui/v071-commercial-ui-atlas.png`: yes.
  - Resource strip uses internal scrolling instead of clipping; clipped resource tiles: 0.
  - Text fit failures: none.
  - Major chrome overlaps: none.
  - Horizontal overflow: none.
  - Console/page errors: none.
  - Screenshot: `reports/qa/screenshots/v0_71_commercial_ui_atlas_mobile.png`

## Gate

Command: `npm run harness:gate < /dev/null`

- `npm test -- --maxWorkers=1`: 53 files passed / 613 tests passed.
- `npm run validate:data`: Data validation passed.
- `npm run qa:beta-readiness:check`: PASS, 15/15 readiness checks.
- `npm run build`: PASS, Vite production build completed.

## Notes

- The generated atlas is reproducible via `npm run assets:v071`.
- Secondary command buttons intentionally use icon-forward labels with accessible `aria-label`s to keep the compact commercial HUD from overflowing.
