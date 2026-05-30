# v0.67 Block 9 QA - Ending Replay Opening Preview

## Scope

- Extended ending replay plans with derived opening moves from each ending condition.
- Surfaced the first two opening moves directly on Deck panel ending target-run cards.
- Reused `getReplayOpeningMoves(condition)` so replay cards, active target briefs, and target-run launch context stay deterministic.

## TDD Evidence

- RED:
  - `npm test -- src/game/campaign-ending.test.ts src/ui/layout-contract.test.ts --maxWorkers=1`
  - Failed as expected because `privacyPlan.openingMoves` was absent and `MenuPanels.tsx` did not render `plan.openingMoves`.
- GREEN:
  - `npm test -- src/game/campaign-ending.test.ts src/ui/layout-contract.test.ts --maxWorkers=1`
  - Result: 2 test files passed, 86 tests passed.

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
- Replay guidance is derive-only from ending definitions and run-modifier targets.
- Contract files remained unchanged.
