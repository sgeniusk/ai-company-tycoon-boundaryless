# v0.67 Block 110 QA - Result Screen Ending Route Start

## Scope
- Added a finale/result-screen action for starting the next deterministic ending-route run.
- The action reuses `getNextRunSetupPlan` and passes the route quick start's `runModifierSelection` into `resetRunWithMetaUnlocks`.
- No save, tick, economy, data, or simulation changes.

## RED
- `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
  - Failed before implementation because `GameChrome` did not import `getNextRunSetupPlan`, compute `endingRouteQuickStart`, expose `ending-route-result-action`, or route via `routeQuickStart.runModifierSelection`.

## GREEN
- `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
  - 1 file / 94 tests passed.
- `npm test -- src/game/meta-progression.test.ts src/game/qa-scenarios.test.ts src/game/run-summary.test.ts --maxWorkers=1 < /dev/null`
  - 3 files / 93 tests passed.
- `npm run validate:data < /dev/null`
  - Data validation passed.

## Browser Smoke
- Started Vite at `http://127.0.0.1:5206/`.
- Ran local Chrome headless DOM smoke for `http://127.0.0.1:5206/?scenario=ten-year-sim`.
- Confirmed DOM contains:
  - `ending-route-result-action`
  - `엔딩 목표 런으로 새 런`
  - `다음 도감 목표`
- Captured snippet showed the result-screen button targeting `프런티어 데모 제국` with the deterministic world-roll condition text.

## Gate
- `npm run harness:gate < /dev/null`
  - 51 files / 588 tests passed.
  - `npm run validate:data` passed.
  - `npm run qa:beta-readiness:check -- --no-write` passed with 14/14 readiness checks.
  - `npm run build` passed.
