# Progress - AI Company Tycoon: Boundaryless

Last Updated: 2026-05-20

## Current State

- Current version: `v0.52-alpha`
- Latest implementation commit: `20c6f38 Add v0.52 source sprite replacement pipeline`
- Current branch: `main`
- Stack: Vite + React + TypeScript
- Main local QA route: `http://127.0.0.1:5201/?scenario=office-visuals`
- Persona QA route: `http://127.0.0.1:5201/?scenario=persona20`
- Main verification gate: `npm run harness:gate`
- Asset generation: `npm run assets:v052`

## Current Objective

Completed `v0.52-alpha-source-sprite-replacement`: split the event-pose character atlas into a high-resolution source sheet and a normalized runtime sheet while preserving the v0.51 row contract.

## What Changed

- Added `agents_v052_source_event_poses` to `data/asset_manifest.json`.
- Kept the 3-column, 25-row, 75-frame event-pose contract for `idle`, `work`, `card_use`, `cheer`, and `alert`.
- Generated `public/assets/sprites/source/v052-agents-event-poses-source.png` at 1152×9600.
- Generated `public/assets/sprites/v052-agents-event-poses.png` at 576×4800.
- Added source metadata for `source_path`, `source_scale`, source frame size, normalized source id, anchor reference, anchor tolerance, and silhouette drift tolerance.
- Updated `GameChrome` to use the v0.52 event-pose sheet.
- Updated the QA sprite-sheet inspector to show source frame size and game frame size.
- Updated `office-visuals` to `v0.52 사무실 원본 시트 QA`.
- Added v0.52 changelog, acceptance criteria, QA docs, production report, and QA report.
- Moved the current feature pointer to `v0.53-alpha-final-character-art-import`.

## Files

- `AGENTS.md`
- `data/asset_manifest.json`
- `docs/ACCEPTANCE_CRITERIA.md`
- `docs/CHANGELOG.md`
- `docs/QA_SCENARIOS.md`
- `docs/ROADMAP.md`
- `docs/SESSION_HANDOFF.md`
- `feature_list.json`
- `package.json`
- `progress.md`
- `public/assets/sprites/source/v052-agents-event-poses-source.png`
- `public/assets/sprites/v052-agents-event-poses.png`
- `reports/production_alpha_v0_52_source_sprite_replacement.md`
- `reports/qa/v0_52_source_sprite_replacement_qa.md`
- `scripts/assets/generate-v046-hires-pixel-sheets.mjs`
- `scripts/harness/validate-data.mjs`
- `session-handoff.md`
- `src/components/GameChrome.tsx`
- `src/game/asset-manifest.test.ts`
- `src/game/qa-scenarios.ts`
- `src/game/qa-scenarios.test.ts`
- `src/game/types.ts`
- `src/ui/layout-contract.test.ts`

## Blockers

- None known.

## Verification Evidence

- `npm run assets:v052`
  - Result: Passed
  - Output: generated v0.52 source and runtime event-pose sheets
- `file public/assets/sprites/source/v052-agents-event-poses-source.png`
  - Result: Passed
  - Output: PNG image data, 1152 x 9600, 8-bit/color RGBA
- `file public/assets/sprites/v052-agents-event-poses.png`
  - Result: Passed
  - Output: PNG image data, 576 x 4800, 8-bit/color RGBA
- `npm test -- src/game/asset-manifest.test.ts src/game/office-scene.test.ts src/game/qa-scenarios.test.ts src/ui/layout-contract.test.ts`
  - Result: Passed
  - Output: 4 test files / 79 tests passed
- `npm run validate:data`
  - Result: Passed
  - Output: Data validation passed
- `npm run harness:gate`
  - Result: Passed
  - Output: 40 test files / 297 tests passed, data validation passed, production build passed
- `curl -I 'http://127.0.0.1:5201/?scenario=office-visuals'`
  - Result: Passed
  - Output: 200 OK
- `curl -I 'http://127.0.0.1:5201/assets/sprites/v052-agents-event-poses.png'`
  - Result: Passed
  - Output: 200 OK
- `curl -I 'http://127.0.0.1:5201/assets/sprites/source/v052-agents-event-poses-source.png'`
  - Result: Passed
  - Output: 200 OK
- `git diff --check`
  - Result: Passed
- Browser screenshot automation
  - Result: Not run
  - Note: Browser automation was not available in this session, so visual verification used tests, image dimensions, HTTP checks, and build validation.

## Recommended Next Step

Start `v0.53-alpha-final-character-art-import`: replace the procedural high-resolution source draft with final AI-generated or external pixel-art source art, regenerate the runtime sheet, and run screenshot-based QA for anchor drift, feet placement, and pose readability.

## Next Session

1. Read `AGENTS.md`.
2. Read `feature_list.json` and this `progress.md`.
3. Run `./init.sh` if dependencies and environment are ready.
4. Pick the current feature or follow the user's explicit request.
