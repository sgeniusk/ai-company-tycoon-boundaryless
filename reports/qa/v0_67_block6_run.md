# v0.67 Block 6 QA - Active Ending Replay Brief

## Scope

- Added `getActiveEndingReplayBrief(state)` for runs started from an `ending:<endingId>` replay seed.
- Surfaced a `목표 엔딩 런` briefing in the company console with target labels, reward preview, and opening moves.
- Added `ending-replay-active` browser QA scenario for the active target-run state.

## TDD Evidence

- RED:
  - `npm test -- src/game/campaign-ending.test.ts src/game/qa-scenarios.test.ts src/ui/layout-contract.test.ts --maxWorkers=1`
  - Failed as expected because the active replay brief API, UI panel, and QA scenario did not exist.
- GREEN:
  - `npm test -- src/game/campaign-ending.test.ts src/game/qa-scenarios.test.ts src/ui/layout-contract.test.ts --maxWorkers=1`
  - Result: 3 test files passed, 141 tests passed.

## Gate Evidence

- Command: `npm run harness:gate < /dev/null`
- Result:
  - 49 test files passed.
  - 519 tests passed.
  - Data validation passed.
  - Production build passed.

## Safety Notes

- No save-version or persisted state change.
- No simulation tick, balance, or monthly economy change.
- Active replay detection derives only from the existing run modifier seed.
- Contract files remained unchanged.
