# v0.56 Workforce Mix Readability QA

Date: 2026-05-22
Status: implemented, pending real blind-test validation

## Goal

Make the first 20 minutes communicate that the company is built from three different workforce lanes: human staff, AI agents, and robots.

This is a pre-final-asset lock item. It should work with the current draft graphics and remain valid after external pixel-art assets are imported.

## Implementation

- Added `getWorkforceMixSummary()` to summarize human, AI, and robot counts from `GameState`.
- Added a `WorkforceMixPanel` to the guide side panel with row-level status, operational impact, and active/next synergy labels.
- Updated the office wall HUD from 3 to 4 columns: location, `TEAM`, `AI OPS`, and `ROBOT`.
- Updated the v0.56 blind-test plan, checklist, session records, and automatic rehearsal to observe whether players understand the human/AI/robot distinction.

## Screenshot Evidence

- `reports/qa/screenshots/v0_56_workforce_mix_fresh_desktop.png` — 1366x768
- `reports/qa/screenshots/v0_56_workforce_mix_fresh_mobile.png` — 390x844
- `reports/qa/screenshots/v0_56_workforce_mix_office_visuals_desktop.png` — 1366x768
- `reports/qa/screenshots/v0_56_workforce_mix_office_visuals_mobile.png` — 390x844

## Verification

- `npm test -- src/game/simulation.test.ts src/ui/layout-contract.test.ts`
  - Passed: 2 files / 73 tests
- `npm test -- src/game/blind-playtest-records.test.ts`
  - Passed: 1 file / 3 tests
- `npm run qa:blind-rehearsal`
  - Passed: rehearsal report regenerated
- `npm test -- src/game/blind-playtest-rehearsal.test.ts src/game/blind-playtest-records.test.ts src/game/simulation.test.ts src/ui/layout-contract.test.ts`
  - Passed: 4 files / 79 tests
- `npm run build`
  - Passed: TypeScript and Vite production build
- `git diff --check`
  - Passed: no whitespace errors
- `npm run harness:gate`
  - Passed: 42 files / 339 tests, data validation, production build
- Headless Chrome screenshot capture
  - Passed: fresh and office-visuals desktop/mobile PNGs generated

## Remaining Risk

Automatic checks can prove the labels and routes exist, but only real blind testers can prove the difference feels meaningful. The five real session records remain `Status: 예정`.
