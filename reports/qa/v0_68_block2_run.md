# v0.68 Block 2 QA - Flow Smoke Freshness Check

## Scope
- Added `npm run qa:v068-flow-smoke:check` as a no-write freshness check for the v0.68 browser flow smoke report.
- The check mode reruns the Chrome DOM smoke, compares the generated report with `reports/qa/v0_68_flow_smoke.md`, and prints `Report: PASS` or `Report: FAIL`.
- Kept the Chrome-dependent command outside `harness:gate`.
- No save, tick, economy, data, UI runtime, or simulation changes.

## RED
- `npm test -- src/game/v068-flow-smoke-script.test.ts --maxWorkers=1 < /dev/null`
  - Failed before implementation because `qa:v068-flow-smoke:check` was not registered and `--check` report freshness logic was absent.

## GREEN
- `npm test -- src/game/v068-flow-smoke-script.test.ts --maxWorkers=1 < /dev/null`
  - 1 file / 3 tests passed.
- `npm run qa:v068-flow-smoke:check < /dev/null`
  - PASS, 4/4 routes rendered.
  - `Report: PASS` confirmed the committed flow smoke report is fresh.

## Gate
- `npm run harness:gate < /dev/null`
  - 52 files / 592 tests passed.
  - `npm run validate:data` passed.
  - `npm run qa:beta-readiness:check -- --no-write` passed with 15/15 readiness checks.
  - `npm run build` passed.
