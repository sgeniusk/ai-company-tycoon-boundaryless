# v0.67 Block 13 QA - Active Codex Target Guard

## Scope

- Deck panel now compares ending codex cards against the active `ending:<id>` target brief.
- The matching codex card shows `현재 목표 런` and disables its reset button.
- Other non-fallback ending cards remain available as direct target-run starts.

## TDD Evidence

- RED:
  - `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1`
  - Failed as expected because the Deck panel did not compare `activeEndingReplayBrief?.id` against codex entries.
- GREEN:
  - `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1`
  - Result: 1 test file passed, 78 tests passed.

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
- The guard is UI-only and derived from the active target-run seed.
- Contract files remained unchanged.
