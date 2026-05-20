# Progress - AI Company Tycoon: Boundaryless

Last Updated: 2026-05-21

## Current State

- Current version: `v0.55-alpha`
- Latest implementation commit: `df57811 Polish v0.55 mobile command hand QA`
- Current branch: `main`
- Stack: Vite + React + TypeScript
- Main local QA route: `http://127.0.0.1:5201/?scenario=office-visuals`
- Persona QA route: `http://127.0.0.1:5201/?scenario=persona20`
- Main verification gate: `npm run harness:gate`
- Asset generation: `npm run assets:v054`
- Screenshot QA: `npm run qa:office-visuals:screenshots`

## Current Objective

In progress on `v0.55-alpha-final-source-art-screenshot-qa`: add reproducible desktop/mobile screenshot QA for `office-visuals` and keep the actual final source-art replacement as the remaining art task.

## End-of-Day Snapshot

- Today's implementation work is pushed: v0.55 screenshot QA is reproducible and the mobile bottom strategy hand no longer clips in the 390×844 capture.
- The active feature remains `in_progress` only because actual final external/AI source art has not been supplied or generated into the required PNG contracts yet.
- No P0/P1 screenshot-QA blockers are open for the current draft-candidate game screen.

## What Changed

- Added `scripts/qa/capture-office-visuals-screenshots.mjs`.
- Added `npm run qa:office-visuals:screenshots`.
- Updated `asset_manifest.json` to `0.55-alpha`.
- Added `visual_qa.office_visuals_v055_screenshot_qa` with desktop/mobile viewport expectations.
- Captured `reports/qa/screenshots/v0_55_office_visuals_desktop.png` at 1366×768.
- Captured `reports/qa/screenshots/v0_55_office_visuals_mobile.png` at 390×844.
- Captured `reports/qa/screenshots/v0_55_office_visuals_screenshots.json`.
- Updated `office-visuals` to `v0.55 스크린샷 QA`.
- Fixed mobile headless left-crop by start-aligning the narrow app shell.
- Added `mobile_command_hand_fit` to the v0.55 visual QA manifest checks.
- Fixed the mobile bottom strategy hand so its counter and visible cards fit inside the 390px screenshot frame without right-edge clipping.
- Re-captured the v0.55 desktop/mobile screenshot QA artifacts after the mobile command-hand polish.
- Added v0.55 changelog, acceptance criteria, QA docs, production report, and QA report.

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
- `public/assets/backgrounds/source/v054-isometric-office-final-source.png`
- `public/assets/backgrounds/v054-isometric-office-final.png`
- `public/assets/sprites/source/v054-office-objects-final-source.png`
- `public/assets/sprites/v054-office-objects-final.png`
- `reports/production_alpha_v0_55_final_source_art_screenshot_qa.md`
- `reports/qa/screenshots/v0_55_office_visuals_desktop.png`
- `reports/qa/screenshots/v0_55_office_visuals_mobile.png`
- `reports/qa/screenshots/v0_55_office_visuals_screenshots.json`
- `reports/qa/v0_55_final_source_art_screenshot_qa.md`
- `scripts/assets/import-v054-office-art.mjs`
- `scripts/qa/capture-office-visuals-screenshots.mjs`
- `scripts/harness/validate-data.mjs`
- `session-handoff.md`
- `src/components/GameChrome.tsx`
- `src/App.css`
- `src/game/asset-manifest.test.ts`
- `src/game/qa-scenarios.ts`
- `src/game/qa-scenarios.test.ts`
- `src/game/types.ts`
- `src/ui/layout-contract.test.ts`

## Blockers

- Final external/AI-generated character, office object, and backdrop artwork is still pending. The current v0.53/v0.54 sources are draft candidates so the pipeline remains reproducible.
- Browser screenshot automation is unavailable in this environment because Playwright is not installed in the Node REPL runtime.
  - Workaround: v0.55 uses local headless Chrome through `npm run qa:office-visuals:screenshots`.

## Verification Evidence

- `npm run qa:office-visuals:screenshots`
  - Result: Passed
  - Output: desktop 1366×768 and mobile 390×844 screenshots generated
- `npm test -- src/game/asset-manifest.test.ts src/ui/layout-contract.test.ts`
  - Result: Passed
  - Output: 2 test files / 43 tests passed
- `file reports/qa/screenshots/v0_55_office_visuals_desktop.png`
  - Result: Passed
  - Output: PNG image data, 1366 x 768, 8-bit/color RGB
- `file reports/qa/screenshots/v0_55_office_visuals_mobile.png`
  - Result: Passed
  - Output: PNG image data, 390 x 844, 8-bit/color RGB
- `npm test -- src/game/asset-manifest.test.ts src/game/office-scene.test.ts src/game/qa-scenarios.test.ts src/ui/layout-contract.test.ts`
  - Result: Passed
  - Output: 4 test files / 84 tests passed
- `npm test -- src/game/qa-scenarios.test.ts src/game/asset-manifest.test.ts src/ui/layout-contract.test.ts`
  - Result: Passed
  - Output: 3 test files / 78 tests passed
- `npm run validate:data`
  - Result: Passed
  - Output: Data validation passed
- `npm run harness:gate`
  - Result: Passed
  - Output: 40 test files / 303 tests passed, data validation passed, production build passed
- `curl -I 'http://127.0.0.1:5201/?scenario=office-visuals'`
  - Result: Passed
  - Output: 200 OK
- `curl -I 'http://127.0.0.1:5201/assets/sprites/v054-office-objects-final.png'`
  - Result: Passed
  - Output: 200 OK
- `curl -I 'http://127.0.0.1:5201/assets/backgrounds/v054-isometric-office-final.png'`
  - Result: Passed
  - Output: 200 OK
- `curl -I 'http://127.0.0.1:5201/assets/sprites/source/v054-office-objects-final-source.png'`
  - Result: Passed
  - Output: 200 OK
- `curl -I 'http://127.0.0.1:5201/assets/backgrounds/source/v054-isometric-office-final-source.png'`
  - Result: Passed
  - Output: 200 OK
- Node REPL Playwright availability check
  - Result: Playwright unavailable
  - Output: `Module not found: playwright`
- `git diff --check`
  - Result: Passed

## Recommended Next Step

Start the next session with final source-art intake:

1. Prepare or collect final character source art at 1152×9600 RGBA PNG.
2. Prepare or collect final office object source art at 2560×1920 RGBA PNG and backdrop source art at 5120×2880 RGBA PNG.
3. Run `npm run assets:v053 -- --source <character-source>` and `npm run assets:v054 -- --objects-source <objects-source> --backdrop-source <backdrop-source>`.
4. Rerun `npm run qa:office-visuals:screenshots` and compare actor anchors, object depth, backdrop framing, command HUD fit, and text overlap against the v0.55 baseline.
5. If final art is still unavailable, do not mark v0.55 complete; either generate/collect source art first or branch into a documented v0.56 visual-polish task.

## Next Session

1. Read `AGENTS.md`.
2. Read `feature_list.json` and this `progress.md`.
3. Run `./init.sh` if dependencies and environment are ready.
4. Pick the current feature or follow the user's explicit request.
