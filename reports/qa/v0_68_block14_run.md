# v0.68 Block 14 QA - Ending Replay Route Refactor

## Scope
- Refactored ending replay route assembly into a shared `createEndingReplayRoute` helper.
- Reused the shared route for ending collection entries, replay plans, active replay briefs, and near-miss replay targets.
- Added a regression test that keeps replay route selection, target labels, and opening moves aligned across player-facing ending surfaces.
- No save, monthly tick, economy, data, UI layout, or contract-file changes.

## RED
- `npm test -- src/game/campaign-ending.test.ts --maxWorkers=1 < /dev/null`
  - Failed because `createEndingReplayRoute` did not exist yet.

## GREEN
- `npm test -- src/game/campaign-ending.test.ts --maxWorkers=1 < /dev/null`
  - 1 file / 24 tests passed.
- `npm test -- src/game/campaign-ending.test.ts src/game/beta-readiness.test.ts src/game/meta-progression.test.ts src/game/run-summary.test.ts src/game/run-simulator.test.ts --maxWorkers=1 < /dev/null`
  - 5 files / 64 tests passed.
- `npm run qa:beta-readiness:check < /dev/null`
  - PASS, 15/15 readiness checks.

## Gate
- `npm run harness:gate < /dev/null`
  - 53 files / 600 tests passed.
  - `npm run validate:data` passed.
  - `npm run qa:beta-readiness:check` passed with 15/15 readiness checks.
  - `npm run build` passed.
