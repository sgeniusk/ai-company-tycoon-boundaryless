# v0.72 Competitor Logo Atlas Polish Run

Date: 2026-05-31

## Scope

- Replace competitor placeholder identity marks with a deterministic final PNG atlas.
- Wire atlas-backed rival logos into the market HUD, competition panel, and office asset wall.
- Preserve simulation/save determinism: no `GameState`, tick, save, or economy changes.

## RED

Command:

```bash
npm test -- src/game/asset-manifest.test.ts src/ui/layout-contract.test.ts < /dev/null
```

Expected failures:

- `asset-manifest.test.ts` rejected the missing `competitor_logos_v072_atlas` sprite sheet and non-final competitor identities.
- `layout-contract.test.ts` rejected missing `getCompetitorLogoStyle` / atlas-backed competitor logo classes.

Result: 2 failed / 114 passed before implementation.

## GREEN

Commands:

```bash
node scripts/assets/generate-v072-competitor-logo-atlas.mjs
npm test -- src/game/asset-manifest.test.ts src/ui/layout-contract.test.ts < /dev/null
npm run validate:data < /dev/null
```

Results:

- Generated `public/assets/ui/v072-competitor-logo-atlas.png` at 192x64.
- Targeted tests passed: 2 files / 116 tests.
- Data validation passed.

## Browser Smoke

Target:

```text
http://127.0.0.1:5222/?scenario=ending-nearmiss-final
```

Desktop 1366x768:

- `hudLogoCount`: 3
- `panelLogoCount`: 8
- `assetWallLogoCount`: 12
- `atlasStatus`: 200
- `hudAtlasLoaded`: true
- `panelAtlasLoaded`: true
- `assetWallAtlasLoaded`: true
- `horizontalOverflow`: 0
- `textFitFailures`: []
- Console errors: []

Mobile 390x844:

- `hudLogoCount`: 0, expected because the competitor HUD strip is hidden by the existing mobile layout.
- `panelLogoCount`: 8
- `assetWallLogoCount`: 0, expected because the office asset wall is not in the initial mobile viewport.
- `atlasStatus`: 200
- `hudAtlasLoaded`: true
- `panelAtlasLoaded`: true
- `assetWallAtlasLoaded`: true
- `horizontalOverflow`: 0
- `textFitFailures`: []
- Console errors: []

Screenshots:

- `reports/qa/screenshots/v0_72_competitor_logo_atlas_hud_desktop.png`
- `reports/qa/screenshots/v0_72_competitor_logo_atlas_panel_desktop.png`
- `reports/qa/screenshots/v0_72_competitor_logo_atlas_hud_mobile.png`
- `reports/qa/screenshots/v0_72_competitor_logo_atlas_panel_mobile.png`

## Full Gate

Command:

```bash
npm run harness:gate < /dev/null
```

Result: PASS

- Vitest: 53 files / 615 tests passed.
- Data validation: PASS.
- Beta readiness check: PASS, 15/15 checks, 23/23 unlock guidance, 4/4 route axes, 40/40 options.
- TypeScript + Vite production build: PASS.

## Notes

- The atlas is deterministic and generated from a local script with no network or random source.
- No protected contract files were modified.
- No save, simulation, tick, or balance surface changed.
