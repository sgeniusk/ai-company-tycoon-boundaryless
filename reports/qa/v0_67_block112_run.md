# v0.67 Block 112 QA - Ending Retry Focus

## Scope
- Moved the active target-ending retry button into `handleRetryActiveEndingReplay`.
- Moved near-miss retry buttons into `handleStartNearMissRun`.
- Both paths keep their deterministic replay selections and now focus the new run on the Deck menu with the Guide tab active.
- No save, tick, economy, data, or simulation changes.

## RED
- `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
  - Failed before implementation because `GameChrome` still used inline reset handlers and did not expose `handleRetryActiveEndingReplay` or `handleStartNearMissRun` with Deck/Guide focus.

## GREEN
- `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
  - 1 file / 94 tests passed.
- `npm test -- src/game/campaign-ending.test.ts src/game/qa-scenarios.test.ts --maxWorkers=1 < /dev/null`
  - 2 files / 95 tests passed.

## Browser Smoke
- Started Vite at `http://127.0.0.1:5207/`.
- Used local Chrome headless with DevTools Protocol on `http://127.0.0.1:5207/?scenario=ending-nearmiss-final`.
- Clicked the first `.ending-nearmiss-grid button`.
- Confirmed before click:
  - near-miss panel present
  - active menu `회사|회사`
  - active side tab `결과`
- Confirmed after click:
  - near-miss panel absent
  - active menu `덱|덱`
  - active side tab `목표`

## Gate
- `npm run harness:gate < /dev/null`
  - 51 files / 588 tests passed.
  - `npm run validate:data` passed.
  - `npm run qa:beta-readiness:check -- --no-write` passed with 15/15 readiness checks.
  - `npm run build` passed.
