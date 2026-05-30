# v0.68 Block 4 QA - Collection And Next-Run Flow Smoke

## Scope
- Expanded `npm run qa:v068-flow-smoke` from 6 to 8 reloadable browser QA URLs.
- Added `beta-readiness-complete` and `ten-year-next-run` coverage.
- Updated Chrome DOM capture to finish once the app shell, title, and scenario label markers are present, so large complete-codex DOMs do not wait for full HTML stream shutdown.
- Regenerated `reports/qa/v0_68_flow_smoke.md` with the 8/8 route matrix.
- No save, tick, economy, data, UI runtime, or simulation changes.

## RED
- `npm test -- src/game/v068-flow-smoke-script.test.ts --maxWorkers=1 < /dev/null`
  - Failed before implementation because the flow smoke route list did not include `beta-readiness-complete` or `ten-year-next-run`.

## GREEN
- `npm test -- src/game/v068-flow-smoke-script.test.ts --maxWorkers=1 < /dev/null`
  - 1 file / 3 tests passed.
- `npm run qa:v068-flow-smoke < /dev/null`
  - PASS, 8/8 routes rendered.
- `npm run qa:v068-flow-smoke:check < /dev/null`
  - PASS, 8/8 routes rendered.
  - `Report: PASS` confirmed the committed flow smoke report is fresh.

## Gate
- `npm run harness:gate < /dev/null`
  - 52 files / 592 tests passed.
  - `npm run validate:data` passed.
  - `npm run qa:beta-readiness:check -- --no-write` passed with 15/15 readiness checks.
  - `npm run build` passed.
