# v0.68 Block 1 QA - Local Browser Flow Smoke

## Scope
- Added standalone `npm run qa:v068-flow-smoke` local QA command.
- The script starts a local Vite server, loads four core reloadable QA URLs with Chrome `--dump-dom`, checks the app shell/title/scenario label, and writes `reports/qa/v0_68_flow_smoke.md`.
- Kept the command outside `harness:gate` because it depends on local Chrome/Chromium availability.
- No save, tick, economy, data, UI runtime, or simulation changes.

## RED
- `npm test -- src/game/v068-flow-smoke-script.test.ts --maxWorkers=1 < /dev/null`
  - Failed before implementation because `qa:v068-flow-smoke` was not registered and `scripts/qa/check-v068-flow-smoke.mjs` did not exist.

## GREEN
- `npm test -- src/game/v068-flow-smoke-script.test.ts --maxWorkers=1 < /dev/null`
  - 1 file / 3 tests passed.
- `npm run qa:v068-flow-smoke < /dev/null`
  - PASS, 4/4 routes rendered.
  - Routes: `fresh`, `beta-readiness`, `ten-year-ending-route-start`, `ending-nearmiss-retry-start`.
  - Wrote `reports/qa/v0_68_flow_smoke.md`.

## Gate
- `npm run harness:gate < /dev/null`
  - 52 files / 592 tests passed.
  - `npm run validate:data` passed.
  - `npm run qa:beta-readiness:check -- --no-write` passed with 15/15 readiness checks.
  - `npm run build` passed.
