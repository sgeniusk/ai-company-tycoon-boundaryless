# v0.70 Parallel Content Lane QA - Annual Directive Depth

## Scope
- Expanded the reusable annual directive choice pool from 8 to 10 choices.
- Added one mid/late operator-scale directive and one late ending-route postmortem directive.
- Kept the change data-only plus tests; no save schema, monthly tick, economy code, UI, or contract-file changes.

## RED
- `npm test -- src/game/annual-review.test.ts --maxWorkers=1 < /dev/null`
  - Failed because the annual directive choice pool still had 8 entries instead of the newly locked 10-choice floor.

## GREEN
- `npm test -- src/game/annual-review.test.ts src/game/annual-strategy-advisor.test.ts src/game/deckbuilding.test.ts --maxWorkers=1 < /dev/null`
  - 3 files / 36 tests passed.
- `npm run validate:data < /dev/null`
  - Data validation passed.
