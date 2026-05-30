# v0.67 Block 8 QA - Target Ending World Reveal

## Scope

- Added target-ending context to `WorldRevealModal` for runs seeded as `ending:<endingId>`.
- Reused `getActiveEndingReplayBrief(state)` so world reveal and company brief share the same target run source.
- Displayed target ending title, reward preview, and first opening move alongside world/difficulty reveal.

## TDD Evidence

- RED:
  - `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1`
  - Failed as expected because the world reveal target-ending badge did not exist.
- GREEN:
  - `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1`
  - Result: 1 test file passed, 77 tests passed.

## Gate Evidence

- Command: `npm run harness:gate < /dev/null`
- Result:
  - 49 test files passed.
  - 522 tests passed.
  - Data validation passed.
  - Production build passed.

## Safety Notes

- No save-version or persisted state change.
- No simulation tick, balance, or monthly economy change.
- Standard/no-target runs do not show the ending target badge.
- Contract files remained unchanged.
