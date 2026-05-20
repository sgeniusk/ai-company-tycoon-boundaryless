# Production Report — v0.53-alpha Final Character Art Import Pipeline

Date: 2026-05-20

## Summary

v0.53-alpha adds a reproducible character-art import path. A 1152×9600 transparent RGBA source PNG can now be validated, copied into the canonical source location, and normalized into the 576×4800 runtime atlas used by the office scene.

This pass still does not claim that final external artwork exists. The current imported source is a draft candidate based on the existing v0.52 source. The important production change is that the project now has a stable command and validation path for replacing that candidate with final AI-generated or external pixel art.

## Implemented

- Added `scripts/assets/import-v053-character-source.mjs`.
- Added `npm run assets:v053`.
- Added `agents_v053_final_art_import` to `data/asset_manifest.json`.
- Added `source_origin`, `import_pipeline`, and `normalization_method` sheet metadata.
- Imported `public/assets/sprites/source/v053-agents-event-poses-final-source.png`.
- Generated `public/assets/sprites/v053-agents-event-poses-final.png`.
- Pointed priority agent sprites and the office actor renderer at the v0.53 sheet.
- Updated `office-visuals` to v0.53 final-art import QA.

## Import Contract

```bash
npm run assets:v053 -- --source <path-to-1152x9600-rgba-png>
```

Default behavior uses the current v0.52 source candidate so the repo remains reproducible without external files.

| Asset | Size | Frame | Purpose |
|---|---:|---:|---|
| `source/v053-agents-event-poses-final-source.png` | 1152×9600 | 384×384 | Imported source candidate |
| `v053-agents-event-poses-final.png` | 576×4800 | 192×192 | Runtime atlas used by the game |

Both sheets keep 3 columns, 25 rows, and 75 total frames.

## Verification

- `npm run assets:v053`
  - Passed
  - Imported the v0.53 source candidate and generated the runtime sheet.
- `file public/assets/sprites/source/v053-agents-event-poses-final-source.png`
  - Passed
  - PNG image data, 1152 x 9600, 8-bit/color RGBA.
- `file public/assets/sprites/v053-agents-event-poses-final.png`
  - Passed
  - PNG image data, 576 x 4800, 8-bit/color RGBA.
- `npm test -- src/game/asset-manifest.test.ts src/game/office-scene.test.ts src/game/qa-scenarios.test.ts src/ui/layout-contract.test.ts`
  - Passed
  - 4 test files / 80 tests.
- `npm run harness:gate`
  - Passed
  - 40 test files / 298 tests, data validation passed, production build passed.
- `curl -I 'http://127.0.0.1:5201/?scenario=office-visuals'`
  - Passed
  - 200 OK.
- `curl -I 'http://127.0.0.1:5201/assets/sprites/v053-agents-event-poses-final.png'`
  - Passed
  - 200 OK.
- `curl -I 'http://127.0.0.1:5201/assets/sprites/source/v053-agents-event-poses-final-source.png'`
  - Passed
  - 200 OK.

## Remaining Risk

- Final external character art is still pending.
- Browser screenshot automation was not available because Playwright is not installed in the current Node REPL runtime.
- The next art-quality pass should replace the source candidate and verify silhouette drift, feet anchors, and pose readability visually.

## Recommended Next Step

Create or import the actual final character sprite-sheet source art, run `npm run assets:v053 -- --source <원본PNG>`, then run desktop/mobile screenshot QA against `office-visuals`.
