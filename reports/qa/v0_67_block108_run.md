# v0.67 Block 108 QA - Ending Route Quick-Start Scenario

## Scope
- Added stable browser QA scenario `ten-year-ending-route-start`.
- The scenario starts from the 10-year campaign final state, applies the derived `ending_route` quick start, and opens the Deck panel on the active target-ending run.
- Added the new URL to beta readiness required QA scenarios.
- No save, tick, economy, or data-balance changes.

## RED
- `npm test -- src/game/qa-scenarios.test.ts --maxWorkers=1 < /dev/null`
  - Failed before implementation because `ten-year-ending-route-start` was missing from stable ids, URL parsing, and scenario creation.
- `npm test -- src/game/beta-readiness-script.test.ts --maxWorkers=1 < /dev/null`
  - Failed before implementation because beta readiness did not require the new scenario URL.

## GREEN
- `npm test -- src/game/qa-scenarios.test.ts --maxWorkers=1 < /dev/null`
  - 1 file / 72 tests passed.
- `npm run qa:beta-readiness < /dev/null`
  - Refreshed `reports/qa/v0_67_beta_readiness.md`.
  - PASS; readiness 14/14 checks.
- `npm test -- src/game/qa-scenarios.test.ts src/game/beta-readiness-script.test.ts --maxWorkers=1 < /dev/null`
  - 2 files / 77 tests passed.
- `npm test -- src/game/qa-scenarios.test.ts src/game/beta-readiness-script.test.ts src/game/meta-progression.test.ts src/game/campaign-ending.test.ts src/game/run-simulator.test.ts src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
  - 6 files / 220 tests passed.

## Browser Smoke
- Started Vite at `http://127.0.0.1:5206/`.
- Ran local Chrome headless DOM smoke for `http://127.0.0.1:5206/?scenario=ten-year-ending-route-start&menu=deck`.
- Confirmed DOM contains:
  - `ending-replay-active-summary`
  - `현재 목표 진행`
  - `프런티어 데모 제국`
  - `엔딩 목표 런`
  - `완주 시 도감 통찰`
- Captured snippet showed the active target summary: `조건 3/11 · 39%` and `완주 시 도감 통찰 7/81`.
- Stopped the Vite dev server after the smoke check.

## Gate
- `npm run harness:gate < /dev/null`
  - 51 files / 586 tests passed.
  - `npm run validate:data` passed.
  - `npm run qa:beta-readiness:check -- --no-write` passed with 14/14 readiness checks.
  - `npm run build` passed.

