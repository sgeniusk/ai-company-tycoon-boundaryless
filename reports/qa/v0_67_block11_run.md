# v0.67 Block 11 QA - Ending Codex Target Hints

## Scope

- Added derived target labels to ending collection entries.
- Surfaced compact target hints on ending codex cards, including locked endings, without revealing the locked title.
- Reused replay-selection label derivation so codex hints stay aligned with target-run seeding.

## TDD Evidence

- RED:
  - `npm test -- src/game/campaign-ending.test.ts src/ui/layout-contract.test.ts --maxWorkers=1`
  - Failed as expected because collection entries had no `targetLabels` and the Deck panel did not render `entry.targetLabels`.
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
- Hints are derived from existing ending conditions and deterministic replay-selection helpers.
- Contract files remained unchanged.
