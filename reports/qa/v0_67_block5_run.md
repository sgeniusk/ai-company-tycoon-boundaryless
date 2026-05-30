# v0.67 Block 5 QA - Ending Reward Payoff

## Scope

- Added a 10-year ending spotlight to the run summary.
- Exposed whether the ending is newly discovered before the next-run reset records it.
- Added the ending meta-reward bonus to the visible founder-insight breakdown.
- Surfaced the ending bonus card in the results panel.

## TDD Evidence

- RED:
  - `npm test -- src/game/run-summary.test.ts src/ui/layout-contract.test.ts --maxWorkers=1`
  - Failed as expected because `summary.spotlight.ending`, the UI card, and CSS contract did not exist.
- GREEN:
  - `npm test -- src/game/run-summary.test.ts src/ui/layout-contract.test.ts --maxWorkers=1`
  - Result: 2 test files passed, 82 tests passed.

## Gate Evidence

- Command: `npm run harness:gate < /dev/null`
- Result:
  - 49 test files passed.
  - 516 tests passed.
  - Data validation passed.
  - Production build passed.

## Safety Notes

- No save-version or persisted state change.
- No simulation tick, balance, or monthly economy change.
- Reward transparency derives from final state and existing ending definitions.
- Contract files remained unchanged.
