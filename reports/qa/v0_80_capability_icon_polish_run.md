# v0.80 Capability Icon Polish Run

Date: 2026-05-31

## Scope

- Commercial-polish block for the existing AI research menu.
- Added a deterministic capability icon atlas and connected it to every research row.
- No simulation, save, economy, or balance code changed.
- Protected contract files were not edited.

## TDD Evidence

RED:

- `npm test -- src/game/asset-manifest.test.ts src/ui/layout-contract.test.ts < /dev/null`
- Expected failures:
  - missing `assetManifest.sprite_sheets.capability_research_v080_atlas`
  - missing research-menu atlas-backed `capability-icon` contract

GREEN:

- `npm run assets:v080 < /dev/null`
  - Wrote `public/assets/ui/v080-capability-research-atlas.png` at 288x96.
- `npm test -- src/game/asset-manifest.test.ts src/ui/layout-contract.test.ts < /dev/null`
  - 2 files passed.
  - 126 tests passed.

## Browser Smoke

Local URL:

- `http://127.0.0.1:5222/?scenario=annual-strategy&menu=research`

Process:

- Dismissed queued competitor event and helper tutorial overlays.
- Scrolled the research menu to capability rows.
- Captured desktop and mobile screenshots.

Results:

- Desktop 1366x768:
  - atlas request: 200
  - console/page errors: 0
  - capability icons: 12
  - capability rows: 12
  - visible blocking overlays after dismissal: false
  - horizontal overflow: 0
  - screenshot: `reports/qa/screenshots/v0_80_capability_icons_desktop.png`
- Mobile 390x844:
  - atlas request: 200
  - console/page errors: 0
  - capability icons: 12
  - capability rows: 12
  - visible blocking overlays after dismissal: false
  - horizontal overflow: 0
  - screenshot: `reports/qa/screenshots/v0_80_capability_icons_mobile.png`

## Gate

- `npm run harness:gate < /dev/null`
  - PASS
  - Vitest: 53 files passed / 625 tests passed
  - Data validation: PASS
  - Beta readiness: PASS, 15/15 checks, 24 endings total / 23 replayable
  - Build: PASS

## Notes

- The capability atlas covers all 12 research capabilities in `data/capabilities.json`.
- The block is UI/asset-only and does not affect determinism.
