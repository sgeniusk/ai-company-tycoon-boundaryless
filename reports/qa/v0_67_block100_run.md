# v0.67 Block 100 QA Run

Date: 2026-05-31

## Scope

- Added `endingDiscovery` to the 10-year campaign simulation result.
- The field is derived from the final state via the existing campaign ending discovery selector.
- Added a beta readiness check that verifies long-run ending discovery telemetry remains wired.
- Refreshed `reports/qa/v0_67_beta_readiness.md` from 9/9 to 10/10 checks.
- No gameplay tick, save version, monthly economy, or data content changes.

## TDD Evidence

- RED: `npm test -- src/game/run-simulator.test.ts --maxWorkers=1 < /dev/null`
  - Failed because `result.endingDiscovery` was `undefined`.
- GREEN: `npm test -- src/game/run-simulator.test.ts --maxWorkers=1 < /dev/null`
  - 1 file / 14 tests passed.
- RED: `npm test -- src/game/beta-readiness-script.test.ts --maxWorkers=1 < /dev/null`
  - Failed because readiness still reported 9 checks and lacked `long_run_ending_telemetry`.
- Intermediate: `npm test -- src/game/beta-readiness-script.test.ts --maxWorkers=1 < /dev/null`
  - Failed only while the committed beta readiness report was stale.
- GREEN: `npm test -- src/game/beta-readiness-script.test.ts --maxWorkers=1 < /dev/null`
  - 1 file / 5 tests passed.

## Related Verification

- `npm test -- src/game/run-simulator.test.ts src/game/campaign-ending.test.ts src/game/run-summary.test.ts src/game/meta-progression.test.ts src/game/campaign.test.ts --maxWorkers=1 < /dev/null`
  - 5 files / 62 tests passed.
- `npm test -- src/game/run-simulator.test.ts src/game/campaign-ending.test.ts src/game/run-summary.test.ts src/game/meta-progression.test.ts src/game/campaign.test.ts src/game/beta-readiness-script.test.ts src/game/beta-readiness.test.ts --maxWorkers=1 < /dev/null`
  - 7 files / 69 tests passed.
- `npm run qa:beta-readiness:check < /dev/null`
  - PASS; readiness 10/10 checks (100%); report PASS.

## Full Gate

- `npm run harness:gate < /dev/null`
  - 51 test files / 579 tests passed.
  - Data validation passed.
  - Beta readiness no-write check passed at 10/10 checks.
  - `tsc && vite build` passed.

## Changed Files

- `src/game/run-simulator.ts`
- `src/game/run-simulator.test.ts`
- `scripts/qa/check-v067-beta-readiness.mjs`
- `src/game/beta-readiness-script.test.ts`
- `reports/qa/v0_67_beta_readiness.md`
