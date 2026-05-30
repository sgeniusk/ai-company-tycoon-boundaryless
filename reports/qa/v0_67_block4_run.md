# v0.67 Block 4 QA - Ending Replay Targets

## Scope

- Added deterministic ending replay plans derived from ending conditions.
- Surfaced target-run buttons in the ending codex without adding GameState fields or monthly tick changes.
- Added an `ending-replay` browser QA scenario for the deck panel.

## TDD Evidence

- RED:
  - `npm test -- src/game/campaign-ending.test.ts src/game/qa-scenarios.test.ts src/ui/layout-contract.test.ts --maxWorkers=1`
  - Failed as expected because `getEndingReplayPlans`, the replay panel, and the QA scenario did not exist.
- GREEN:
  - `npm test -- src/game/campaign-ending.test.ts src/game/qa-scenarios.test.ts src/ui/layout-contract.test.ts --maxWorkers=1`
  - Result: 3 test files passed, 137 tests passed.

## Gate Evidence

- Command: `npm run harness:gate < /dev/null`
- Result:
  - 49 test files passed.
  - 514 tests passed.
  - Data validation passed.
  - Production build passed.

## Safety Notes

- No save-version or persisted state change.
- No simulation tick or monthly economy change.
- Replay selections use explicit `RunModifierSelectionInput` seeds such as `ending:<endingId>`.
- Contract files remained unchanged.
