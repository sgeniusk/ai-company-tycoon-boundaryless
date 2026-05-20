# Production Report — v0.54-alpha Office Object and Backdrop Art Import Pipeline

Date: 2026-05-21

## Summary

v0.54-alpha extends the high-resolution art import workflow from characters to the office object sheet and isometric office backdrop. The game now has canonical source paths, runtime asset targets, manifest metadata, validation, and screen wiring for replacing the current draft office art with final AI-generated or external pixel art.

The current v0.54 files are still source candidates generated from the existing procedural pixel baseline. The production value of this pass is the stable import and normalization path: object source art at 2560×1920 and backdrop source art at 5120×2880 can now be dropped in and regenerated into the runtime game screen.

## Implemented

- Added `scripts/assets/import-v054-office-art.mjs`.
- Added `npm run assets:v054`.
- Added `office_objects_v054_final_art_import` and `office_isometric_v054_final_art_import` to `data/asset_manifest.json`.
- Generated `public/assets/sprites/source/v054-office-objects-final-source.png`.
- Generated `public/assets/sprites/v054-office-objects-final.png`.
- Generated `public/assets/backgrounds/source/v054-isometric-office-final-source.png`.
- Generated `public/assets/backgrounds/v054-isometric-office-final.png`.
- Pointed placed office props and the isometric backdrop renderer at the v0.54 contracts.
- Extended scene backdrop validation for source dimensions and import metadata.
- Updated `office-visuals` to v0.54 object/backdrop import QA.

## Import Contract

```bash
npm run assets:v054 -- --objects-source <path-to-2560x1920-rgba-png> --backdrop-source <path-to-5120x2880-rgba-png>
```

Default behavior generates draft source candidates first so the repo stays reproducible without external files.

| Asset | Size | Purpose |
|---|---:|---|
| `source/v054-office-objects-final-source.png` | 2560×1920 | 4x office object source candidate |
| `v054-office-objects-final.png` | 1280×960 | Runtime office object sheet |
| `source/v054-isometric-office-final-source.png` | 5120×2880 | 4x isometric backdrop source candidate |
| `v054-isometric-office-final.png` | 2560×1440 | Runtime office backdrop |

## Verification

- `npm run assets:v054`
  - Passed
  - Generated v0.54 source candidates and runtime PNGs.
- `file public/assets/sprites/source/v054-office-objects-final-source.png`
  - Passed
  - PNG image data, 2560 x 1920, 8-bit/color RGBA.
- `file public/assets/sprites/v054-office-objects-final.png`
  - Passed
  - PNG image data, 1280 x 960, 8-bit/color RGBA.
- `file public/assets/backgrounds/source/v054-isometric-office-final-source.png`
  - Passed
  - PNG image data, 5120 x 2880, 8-bit/color RGBA.
- `file public/assets/backgrounds/v054-isometric-office-final.png`
  - Passed
  - PNG image data, 2560 x 1440, 8-bit/color RGBA.
- `npm test -- src/game/asset-manifest.test.ts src/game/office-scene.test.ts src/game/qa-scenarios.test.ts src/ui/layout-contract.test.ts`
  - Passed
  - 4 test files / 82 tests.
- `npm run validate:data`
  - Passed
  - Data validation passed.
- `npm run harness:gate`
  - Passed
  - 40 test files / 300 tests, data validation passed, production build passed.
- `curl -I 'http://127.0.0.1:5201/?scenario=office-visuals'`
  - Passed
  - 200 OK.
- `curl -I` for the v0.54 runtime and source PNGs
  - Passed
  - All returned 200 OK.

## Remaining Risk

- Final external office object and backdrop art is still pending.
- Browser screenshot automation was unavailable because Playwright is not installed in the current Node REPL runtime.
- The next art-quality pass should replace the source candidates and visually check backdrop framing, object depth ordering, and HUD/text overlap on desktop and mobile.

## Recommended Next Step

Create or import the actual final office object/backdrop source art, run `npm run assets:v054 -- --objects-source <원본PNG> --backdrop-source <원본PNG>`, then run desktop/mobile screenshot QA against `office-visuals`.
