# v0.67 Block 104 QA Run

Date: 2026-05-31

## Scope

- Added a stable `ten-year-next-run` browser QA scenario.
- The scenario opens the Deck view after a deterministic 10-year campaign reset, with ending discovery, run history, and reward delta carryover visible.
- Added the scenario to the beta readiness required QA scenario list.
- Refreshed `reports/qa/v0_67_beta_readiness.md` with the expanded scenario list.
- No gameplay tick, save version, monthly economy, or data content changes.

## TDD Evidence

- RED: `npm test -- src/game/qa-scenarios.test.ts --maxWorkers=1 < /dev/null`
  - Failed because `ten-year-next-run` was missing from stable IDs, URL parsing, and scenario creation.
- GREEN: `npm test -- src/game/qa-scenarios.test.ts --maxWorkers=1 < /dev/null`
  - 1 file / 71 tests passed.
- RED: `npm test -- src/game/beta-readiness-script.test.ts --maxWorkers=1 < /dev/null`
  - Failed because beta readiness still required only the two older QA scenarios.
- Intermediate: `npm test -- src/game/beta-readiness-script.test.ts --maxWorkers=1 < /dev/null`
  - Failed only while the committed beta readiness report was stale.
- GREEN: `npm test -- src/game/beta-readiness-script.test.ts --maxWorkers=1 < /dev/null`
  - 1 file / 5 tests passed.

## Related Verification

- `npm test -- src/game/qa-scenarios.test.ts src/game/beta-readiness-script.test.ts src/game/beta-readiness.test.ts src/ui/layout-contract.test.ts src/game/run-simulator.test.ts --maxWorkers=1 < /dev/null`
  - 5 files / 184 tests passed.
- `npm run qa:beta-readiness:check < /dev/null`
  - PASS; readiness 13/13 checks (100%); report PASS.

## Full Gate

- `npm run harness:gate < /dev/null`
  - 51 test files / 582 tests passed.
  - Data validation passed.
  - Beta readiness no-write check passed at 13/13 checks.
  - `tsc && vite build` passed.

## Changed Files

- `src/game/qa-scenarios.ts`
- `src/game/qa-scenarios.test.ts`
- `scripts/qa/check-v067-beta-readiness.mjs`
- `src/game/beta-readiness-script.test.ts`
- `reports/qa/v0_67_beta_readiness.md`
