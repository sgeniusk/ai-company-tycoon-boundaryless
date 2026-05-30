# v0.67 Block 113 QA - Near-Miss Retry Scenario

## Scope
- Added `ending-nearmiss-retry-start` as a stable browser QA scenario.
- The scenario derives the first near-miss target from the final near-miss state and starts the next run with that deterministic replay selection.
- The scenario opens on the Deck menu with an active ending replay brief.
- No save, tick, economy, data, or simulation changes.

## RED
- `npm test -- src/game/qa-scenarios.test.ts --maxWorkers=1 < /dev/null`
  - Failed before implementation because `ending-nearmiss-retry-start` was missing from `qaScenarioIds`, URL parsing returned undefined, and direct creation fell back to a company-menu state.

## GREEN
- `npm test -- src/game/qa-scenarios.test.ts --maxWorkers=1 < /dev/null`
  - 1 file / 73 tests passed.
- `npm test -- src/ui/layout-contract.test.ts src/game/qa-scenarios.test.ts src/game/campaign-ending.test.ts --maxWorkers=1 < /dev/null`
  - 3 files / 190 tests passed.

## Browser Smoke
- Started Vite at `http://127.0.0.1:5208/`.
- Ran local Chrome headless DOM smoke for `http://127.0.0.1:5208/?scenario=ending-nearmiss-retry-start`.
- Confirmed DOM contains:
  - `아쉬운 엔딩 목표 런 QA`
  - `목표 엔딩`
  - `AGI 안전 협정`
  - `ending-target-pill`
- Captured snippet showed run 2, target ending progress 38%, and the QA label in the HUD.

## Gate
- `npm run harness:gate < /dev/null`
  - 51 files / 589 tests passed.
  - `npm run validate:data` passed.
  - `npm run qa:beta-readiness:check -- --no-write` passed with 15/15 readiness checks.
  - `npm run build` passed.
