# v0.67 Block 12 QA - Ending Codex Direct Target Runs

## Scope

- Added deterministic replay selections to non-fallback ending collection entries.
- Added a `도감 목표 런` button to each targetable ending codex card.
- Routed the button through `resetRunWithMetaUnlocks` with the same `ending:<id>` seed path used by replay plans.

## TDD Evidence

- RED:
  - `npm test -- src/game/campaign-ending.test.ts src/ui/layout-contract.test.ts --maxWorkers=1`
  - Failed as expected because collection entries had no `selection` and the Deck panel had no codex target-run button.
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
- Fallback endings stay non-targetable from the codex.
- Contract files remained unchanged.
