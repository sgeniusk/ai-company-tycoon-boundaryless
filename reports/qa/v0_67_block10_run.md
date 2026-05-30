# v0.67 Block 10 QA - Final Ending Requirement Report

## Scope

- Added `getCampaignEndingReport(finalState)` as a derive-only report for the selected final ending.
- Reused the existing ending requirement progress engine so the finale can explain which conditions were satisfied.
- Surfaced a compact ending-condition receipt in the Results tab without adding save fields or changing tick behavior.

## TDD Evidence

- RED:
  - `npm test -- src/game/campaign-ending.test.ts src/ui/layout-contract.test.ts --maxWorkers=1`
  - Failed as expected because `getCampaignEndingReport` did not exist and the Results tab had no ending report panel.
- GREEN:
  - `npm test -- src/game/campaign-ending.test.ts src/ui/layout-contract.test.ts --maxWorkers=1`
  - Result: 2 test files passed, 88 tests passed.

## Gate Evidence

- Command: `npm run harness:gate < /dev/null`
- Result:
  - 49 test files passed.
  - 524 tests passed.
  - Data validation passed.
  - Production build passed.

## Safety Notes

- No save-version or persisted state change.
- No simulation tick, balance, or monthly economy change.
- The report is derived from `getCampaignEnding(finalState)` and existing ending requirement logic.
- Contract files remained unchanged.
