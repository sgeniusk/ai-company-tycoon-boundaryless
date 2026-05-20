# QA Report — v0.55 Final Source Art Screenshot QA

Date: 2026-05-21

## Scope

Captured the `office-visuals` route in desktop and mobile dimensions using headless Chrome. This pass checks the current draft candidate art and verifies that the screenshot QA loop is ready for the eventual final source-art replacement.

## Pass Criteria

- Manifest records v0.55 visual QA artifact paths and viewport sizes.
- Screenshot command captures desktop 1366×768 and mobile 390×844 PNGs.
- Desktop screenshot includes the full game shell, office playfield, management console, resource strip, and command row.
- Mobile screenshot starts at the left edge of the app shell without the prior headless left-crop.
- Mobile strategy hand and bottom command row fit inside the 390px frame without right-edge clipping.
- Tests and data validation pass.

## Results

| Check | Result |
|---|---|
| v0.55 manifest version and visual QA contract | Passed |
| `qa:office-visuals:screenshots` command contract | Passed |
| Desktop screenshot 1366×768 | Passed |
| Mobile screenshot 390×844 | Passed |
| Mobile shell left-crop fix | Passed |
| Mobile command hand fit | Passed |
| `office-visuals` scenario label and timeline | Passed |
| Data validation | Passed |

## Evidence

- `npm test -- src/game/qa-scenarios.test.ts src/game/asset-manifest.test.ts src/ui/layout-contract.test.ts`: 3 files / 78 tests passed.
- `npm test -- src/game/asset-manifest.test.ts src/ui/layout-contract.test.ts`: 2 files / 43 tests passed.
- `npm run qa:office-visuals:screenshots`: passed.
- `reports/qa/screenshots/v0_55_office_visuals_desktop.png`: 1366 x 768 PNG.
- `reports/qa/screenshots/v0_55_office_visuals_mobile.png`: 390 x 844 PNG.
- `reports/qa/screenshots/v0_55_office_visuals_screenshots.json`: captured URL and viewport manifest.
- `npm run validate:data`: passed.

## Findings

- No P0/P1 layout blockers found in the screenshot QA harness itself.
- P2: final external/AI-generated source art is still pending, so these screenshots are a draft-candidate baseline.
- Resolved: mobile command cards no longer clip at the right edge of the fixed game frame in the 390×844 screenshot.

## Next QA Step

After final source art is imported, rerun `npm run qa:office-visuals:screenshots` and compare character anchors, object depth ordering, backdrop framing, and HUD/text overlap against this baseline.
