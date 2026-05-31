# v0.68 Block 12 QA - Shared QA Artifact Helper Refactor

## Scope
- Refactored duplicated Markdown/JSON artifact manifest, write, and freshness-check logic into `scripts/qa/report-artifacts.mjs`.
- Updated `check-v068-beta-candidate.mjs` and `check-v068-flow-smoke.mjs` to use the shared helper.
- Preserved the existing artifact formats and command outputs.
- No gameplay, save, tick, economy, UI runtime, simulation, or contract-file changes.

## RED
- `npm test -- src/game/v068-beta-candidate-script.test.ts src/game/v068-flow-smoke-script.test.ts --maxWorkers=1 < /dev/null`
  - Failed because both scripts still owned their artifact manifest/freshness/write logic locally instead of using the shared helper.

## GREEN
- `npm test -- src/game/v068-beta-candidate-script.test.ts src/game/v068-flow-smoke-script.test.ts --maxWorkers=1 < /dev/null`
  - 2 files / 9 tests passed.
- `npm run qa:v068-flow-smoke < /dev/null`
  - PASS, 8/8 routes.
- `npm run qa:v068-flow-smoke:check < /dev/null`
  - PASS, 8/8 routes, `Report: PASS`, `Summary: PASS`.
- `npm run qa:v068-beta-candidate < /dev/null`
  - PASS, 2/2 checks.
- `npm run qa:v068-beta-candidate:check < /dev/null`
  - First run saw a transient flow-smoke child failure (`unknown; Report: FAIL; Summary: unknown`).
  - Immediate isolated `npm run qa:v068-flow-smoke:check < /dev/null` passed, and the rerun of beta-candidate check passed with `Report: PASS`, `Summary: PASS`.

## Gate
- `npm run harness:gate < /dev/null`
  - 53 files / 598 tests passed.
  - `npm run validate:data` passed.
  - `npm run qa:beta-readiness:check -- --no-write` passed with 15/15 readiness checks.
  - `npm run build` passed.
