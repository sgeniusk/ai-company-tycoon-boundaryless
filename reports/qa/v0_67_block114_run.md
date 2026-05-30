# v0.67 Block 114 QA - Beta Gate Near-Miss Retry Scenario

## Scope
- Added `ending-nearmiss-retry-start` to the v0.67 beta readiness script's required QA scenarios.
- Regenerated `reports/qa/v0_67_beta_readiness.md` so the QA scenario row includes the near-miss retry-start URL.
- No save, tick, economy, data, UI, or simulation changes.

## RED
- `npm test -- src/game/beta-readiness-script.test.ts --maxWorkers=1 < /dev/null`
  - Failed before implementation because `result.scenarios` did not include `ending-nearmiss-retry-start`.

## GREEN
- `npm run qa:beta-readiness < /dev/null`
  - Wrote `reports/qa/v0_67_beta_readiness.md`.
  - Reported 15/15 readiness checks.
- `npm test -- src/game/beta-readiness-script.test.ts src/game/qa-scenarios.test.ts --maxWorkers=1 < /dev/null`
  - 2 files / 78 tests passed.
- `npm run qa:beta-readiness:check < /dev/null`
  - Status PASS, 15/15 readiness checks.

## Gate
- `npm run harness:gate < /dev/null`
  - 51 files / 589 tests passed.
  - `npm run validate:data` passed.
  - `npm run qa:beta-readiness:check -- --no-write` passed with 15/15 readiness checks.
  - `npm run build` passed.
