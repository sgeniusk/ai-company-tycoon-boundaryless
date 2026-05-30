# v0.67 Block 101 QA Run

Date: 2026-05-31

## Scope

- Added `nextRunPreview` to the 10-year campaign simulation result.
- The preview is derived by applying `resetRunWithMetaUnlocks` to the final campaign state.
- The long-run harness now exposes both selected ending discovery telemetry and the next-run carryover projection.
- Added a beta readiness check for the long-run carryover preview.
- Refreshed `reports/qa/v0_67_beta_readiness.md` from 10/10 to 11/11 checks.
- No gameplay tick, save version, monthly economy, or data content changes.

## TDD Evidence

- RED: `npm test -- src/game/run-simulator.test.ts --maxWorkers=1 < /dev/null`
  - Failed because `result.nextRunPreview` was `undefined`.
- GREEN: `npm test -- src/game/run-simulator.test.ts --maxWorkers=1 < /dev/null`
  - 1 file / 15 tests passed.
- RED: `npm test -- src/game/beta-readiness-script.test.ts --maxWorkers=1 < /dev/null`
  - Failed because readiness still reported 10 checks and lacked `long_run_carryover_preview`.
- Intermediate: `npm test -- src/game/beta-readiness-script.test.ts --maxWorkers=1 < /dev/null`
  - Failed only while the committed beta readiness report was stale.
- GREEN: `npm test -- src/game/beta-readiness-script.test.ts --maxWorkers=1 < /dev/null`
  - 1 file / 5 tests passed.

## Related Verification

- `npm test -- src/game/run-simulator.test.ts src/game/campaign-ending.test.ts src/game/run-summary.test.ts src/game/meta-progression.test.ts src/game/campaign.test.ts src/game/beta-readiness-script.test.ts src/game/beta-readiness.test.ts --maxWorkers=1 < /dev/null`
  - 7 files / 70 tests passed.
- `npm run qa:beta-readiness:check < /dev/null`
  - PASS; readiness 11/11 checks (100%); report PASS.

## Full Gate

- `npm run harness:gate < /dev/null`
  - 51 test files / 580 tests passed.
  - Data validation passed.
  - Beta readiness no-write check passed at 11/11 checks.
  - `tsc && vite build` passed.

## Changed Files

- `src/game/run-simulator.ts`
- `src/game/run-simulator.test.ts`
- `scripts/qa/check-v067-beta-readiness.mjs`
- `src/game/beta-readiness-script.test.ts`
- `reports/qa/v0_67_beta_readiness.md`
