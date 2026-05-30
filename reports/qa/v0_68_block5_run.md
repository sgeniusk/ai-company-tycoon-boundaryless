# v0.68 Block 5 QA - Beta Candidate Local Gate

## Scope
- Added standalone `npm run qa:v068-beta-candidate` and `npm run qa:v068-beta-candidate:check` commands.
- The candidate gate aggregates the default `npm run harness:gate < /dev/null` and standalone `npm run qa:v068-flow-smoke:check < /dev/null`.
- Wrote `reports/qa/v0_68_beta_candidate.md` with the local beta-candidate evidence.
- Kept the Chrome-dependent candidate command outside `harness:gate`.
- No save, tick, economy, data, UI runtime, or simulation changes.

## RED
- `npm test -- src/game/v068-beta-candidate-script.test.ts --maxWorkers=1 < /dev/null`
  - Failed before implementation because `qa:v068-beta-candidate` was not registered and `scripts/qa/check-v068-beta-candidate.mjs` did not exist.

## GREEN
- `npm test -- src/game/v068-beta-candidate-script.test.ts --maxWorkers=1 < /dev/null`
  - 1 file / 3 tests passed.
- `npm run qa:v068-beta-candidate < /dev/null`
  - PASS, 2/2 checks passed.
  - Harness evidence: 53 files / 595 tests, 15/15 beta readiness, build passed.
  - Flow smoke evidence: 8/8 routes, `Report: PASS`.
  - Wrote `reports/qa/v0_68_beta_candidate.md`.

## Gate
- `npm run harness:gate < /dev/null`
  - 53 files / 595 tests passed.
  - `npm run validate:data` passed.
  - `npm run qa:beta-readiness:check -- --no-write` passed with 15/15 readiness checks.
  - `npm run build` passed.
