# v0.68 Block 10 QA - Flow Smoke JSON Summary

## Scope
- Strengthened `npm run qa:v068-flow-smoke` so the browser route smoke writes both the existing Markdown report and a deterministic JSON summary.
- Added `reports/qa/v0_68_flow_smoke.json` with route-level status, DOM byte counts, required text markers, and failed check ids.
- Updated `qa:v068-flow-smoke:check` so freshness requires both the Markdown report and JSON summary to match the current Chrome DOM run.
- Confirmed the upstream beta-candidate aggregate still passes after the flow-smoke summary output changed.
- No gameplay, save, tick, economy, UI runtime, simulation, or contract-file changes.

## RED
- `npm test -- src/game/v068-flow-smoke-script.test.ts --maxWorkers=1 < /dev/null`
  - Failed because `--list-json` did not expose `summaryPath`/`artifacts` and the script did not reference `reports/qa/v0_68_flow_smoke.json`.

## GREEN
- `npm test -- src/game/v068-flow-smoke-script.test.ts --maxWorkers=1 < /dev/null`
  - 1 file / 3 tests passed.
- `npm run qa:v068-flow-smoke < /dev/null`
  - PASS, 8/8 routes.
  - Regenerated Markdown + JSON route-smoke artifacts.
- `npm run qa:v068-flow-smoke:check < /dev/null`
  - PASS, 8/8 routes, `Report: PASS`, `Summary: PASS`.
- `npm run qa:v068-beta-candidate < /dev/null`
  - PASS, 2/2 checks.
- `npm run qa:v068-beta-candidate:check < /dev/null`
  - PASS, 2/2 checks, `Report: PASS`, `Summary: PASS`.

## Gate
- `npm run harness:gate < /dev/null`
  - 53 files / 597 tests passed.
  - `npm run validate:data` passed.
  - `npm run qa:beta-readiness:check -- --no-write` passed with 15/15 readiness checks.
  - `npm run build` passed.
