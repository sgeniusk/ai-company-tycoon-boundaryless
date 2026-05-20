# Production Report — v0.52-alpha Source Sprite Replacement Pipeline

Date: 2026-05-20

## Summary

v0.52-alpha separates the character event-pose atlas into a high-resolution source sheet and a normalized runtime sheet. The game now renders priority actors from `agents_v052_source_event_poses`, while the manifest preserves the original source path and frame metadata needed to swap in a final generated pixel-art sheet later.

This pass does not claim final external AI artwork. It creates the source-ready contract, generated high-resolution draft assets, validation checks, and QA surface needed for that final import.

## Implemented

- Added `agents_v052_source_event_poses` to `data/asset_manifest.json`.
- Generated source sheet: `public/assets/sprites/source/v052-agents-event-poses-source.png`.
- Generated runtime sheet: `public/assets/sprites/v052-agents-event-poses.png`.
- Kept the v0.51 row contract: 5 priority agents, 5 pose rows per agent, 3 frames per row.
- Added source metadata: `source_path`, `source_scale`, `source_frame_width`, `source_frame_height`, `normalized_from`, `anchor_reference`, `anchor_tolerance_px`, and `silhouette_drift_tolerance_px`.
- Added data validation for source-normalized sprite sheets.
- Updated `GameChrome` to use the v0.52 sheet and show source/game frame sizes in the QA inspector.
- Updated `office-visuals` QA scenario labels and tests.

## Asset Contract

| Asset | Size | Frame | Purpose |
|---|---:|---:|---|
| `source/v052-agents-event-poses-source.png` | 1152×9600 | 384×384 | High-resolution source draft |
| `v052-agents-event-poses.png` | 576×4800 | 192×192 | Runtime atlas used by the game |

Both sheets use 3 columns, 25 rows, and 75 total frames.

## Verification

- `npm run assets:v052`
  - Passed
  - Generated v0.52 source and runtime event-pose sheets.
- `file public/assets/sprites/source/v052-agents-event-poses-source.png`
  - Passed
  - PNG image data, 1152 x 9600, 8-bit/color RGBA.
- `file public/assets/sprites/v052-agents-event-poses.png`
  - Passed
  - PNG image data, 576 x 4800, 8-bit/color RGBA.
- `npm test -- src/game/asset-manifest.test.ts src/game/office-scene.test.ts src/game/qa-scenarios.test.ts src/ui/layout-contract.test.ts`
  - Passed
  - 4 test files / 79 tests.
- `npm run harness:gate`
  - Passed
  - 40 test files / 297 tests, data validation passed, production build passed.
- `curl -I 'http://127.0.0.1:5201/?scenario=office-visuals'`
  - Passed
  - 200 OK.
- `curl -I 'http://127.0.0.1:5201/assets/sprites/v052-agents-event-poses.png'`
  - Passed
  - 200 OK.
- `curl -I 'http://127.0.0.1:5201/assets/sprites/source/v052-agents-event-poses-source.png'`
  - Passed
  - 200 OK.

## Remaining Risk

- The v0.52 source sheet is still a procedural high-resolution draft. The next art-quality pass should replace it with a final generated or hand-authored pixel-art source sheet.
- Browser screenshot automation was not available in this session, so visual QA used tests, asset dimensions, manifest validation, build, and HTTP checks.

## Recommended Next Step

Import a final AI-generated or external pixel-art source sheet into the v0.52 source path, regenerate the runtime atlas, and run screenshot-based office-visuals QA for feet anchors, silhouette drift, and pose readability.
