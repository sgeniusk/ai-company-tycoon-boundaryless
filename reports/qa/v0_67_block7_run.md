# v0.67 Block 7 QA - Near-Missed Ending Rematch

## Scope

- Added `getEndingNearMisses(state, limit)` for final-run near-missed ending candidates.
- Ranked near misses by current final-state progress and missing requirement count.
- Surfaced an `아쉬운 엔딩` panel in the final results view.
- Added one-click rematch buttons that restart into each near-missed ending's replay selection.

## TDD Evidence

- RED:
  - `npm test -- src/game/campaign-ending.test.ts src/ui/layout-contract.test.ts --maxWorkers=1`
  - Failed as expected because near-miss ranking and result-screen rematch UI did not exist.
- GREEN:
  - `npm test -- src/game/campaign-ending.test.ts src/ui/layout-contract.test.ts --maxWorkers=1`
  - Result: 2 test files passed, 85 tests passed.

## Gate Evidence

- Command: `npm run harness:gate < /dev/null`
- Result:
  - 49 test files passed.
  - 521 tests passed.
  - Data validation passed.
  - Production build passed.

## Safety Notes

- No save-version or persisted state change.
- No simulation tick, balance, or monthly economy change.
- Rematch buttons reuse existing `resetRunWithMetaUnlocks` with explicit replay selections.
- Contract files remained unchanged.
