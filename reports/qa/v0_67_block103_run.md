# v0.67 Block 103 QA Run

Date: 2026-05-31

## Scope

- Added an `ending_carryover` gate to `evaluateAlphaReadiness`.
- The gate verifies that each 10-year campaign result carries the selected ending into both next-run discovered endings and run history.
- Added a beta readiness check for the high-level ending carryover readiness gate.
- Refreshed `reports/qa/v0_67_beta_readiness.md` from 12/12 to 13/13 checks.
- No gameplay tick, save version, monthly economy, or data content changes.

## TDD Evidence

- RED: `npm test -- src/game/run-simulator.test.ts --maxWorkers=1 < /dev/null`
  - Failed because `evaluateAlphaReadiness` did not include `ending_carryover`.
- GREEN: `npm test -- src/game/run-simulator.test.ts --maxWorkers=1 < /dev/null`
  - 1 file / 16 tests passed.
- RED: `npm test -- src/game/beta-readiness-script.test.ts --maxWorkers=1 < /dev/null`
  - Failed because readiness still reported 12 checks and lacked `alpha_readiness_ending_carryover`.
- Intermediate: `npm test -- src/game/beta-readiness-script.test.ts --maxWorkers=1 < /dev/null`
  - Failed only while the committed beta readiness report was stale.
- GREEN: `npm test -- src/game/beta-readiness-script.test.ts --maxWorkers=1 < /dev/null`
  - 1 file / 5 tests passed.

## Related Verification

- `npm test -- src/game/run-simulator.test.ts src/game/campaign-ending.test.ts src/game/run-summary.test.ts src/game/meta-progression.test.ts src/game/campaign.test.ts src/game/beta-readiness-script.test.ts src/game/beta-readiness.test.ts --maxWorkers=1 < /dev/null`
  - 7 files / 71 tests passed.
- `npm run qa:beta-readiness:check < /dev/null`
  - PASS; readiness 13/13 checks (100%); report PASS.

## Full Gate

- `npm run harness:gate < /dev/null`
  - 51 test files / 581 tests passed.
  - Data validation passed.
  - Beta readiness no-write check passed at 13/13 checks.
  - `tsc && vite build` passed.

## Changed Files

- `src/game/run-simulator.ts`
- `src/game/run-simulator.test.ts`
- `scripts/qa/check-v067-beta-readiness.mjs`
- `src/game/beta-readiness-script.test.ts`
- `reports/qa/v0_67_beta_readiness.md`
