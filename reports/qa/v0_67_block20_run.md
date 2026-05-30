# v0.67 Block 20 QA Run

## Scope
- Hardened `validate:data` for replay-safe ending additions.
- Added validation that ending priorities are unique, the fallback ending is the final zero-reward entry, and every non-fallback ending requires `status: success` plus `min_month: 120`.
- No gameplay, save, tick, or economy changes.

## RED
- Command: `npm test -- src/game/campaign-ending.test.ts --maxWorkers=1 < /dev/null`
- Result: failed as expected.
- Evidence: the new campaign-ending contract expected `validate-data.mjs` to include `priority must be unique`, `fallback ending must be the final entry`, `non-fallback ending must require status success`, and `non-fallback ending must require min_month 120`.

## GREEN
- Command: `npm test -- src/game/campaign-ending.test.ts --maxWorkers=1 < /dev/null`
- Result: passed.
- Evidence: 1 test file, 11 tests passed.
- Command: `npm run validate:data < /dev/null`
- Result: passed.

## Gate
- Command: `npm run harness:gate < /dev/null`
- Result: passed.
- Evidence: 49 test files, 529 tests passed; data validation passed; production build completed.

## Notes
- This block intentionally stays in the data validation lane.
- The standard/no-arg campaign path and all replay selectors are unchanged.
