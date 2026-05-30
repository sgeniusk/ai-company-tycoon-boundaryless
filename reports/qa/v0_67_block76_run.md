# v0.67 Block 76 QA — Ending Guidance Coverage Summary

## Scope
- Added ending codex summary fields for route unlock guidance coverage.
- Rendered `해금 안내 current/eligible (percent)` in the ending codex summary.
- No save, tick, economy, or data schema changes.

## RED
- `npm test -- src/game/campaign-ending.test.ts src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
- Expected failures before implementation:
  - `EndingCollectionSummary` lacked unlock guidance coverage fields.
  - Ending codex summary UI lacked `해금 안내` coverage text.

## GREEN
- `npm test -- src/game/campaign-ending.test.ts src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
- Result: 2 files passed, 111 tests passed.

## Full Gate
- `npm run harness:gate < /dev/null`
- Result:
  - 49 test files passed.
  - 561 tests passed.
  - `validate:data` passed.
  - `tsc && vite build` passed.

## Browser Smoke
- Dev server: `npm run dev -- --host 127.0.0.1 --port 5193 < /dev/null`
- URL: `http://127.0.0.1:5193/?scenario=ending-replay&menu=deck`
- In-app browser DOM confirmed within `.ending-collection-summary`:
  - `해금 안내`
  - `23/23`
  - `100%`
  - `결과 전용 잠김 1`

## Notes
- Coverage derives from replayable reward endings with non-empty `recommendedUnlockLabels`.
- This makes route-guidance completeness visible in-game as well as regression-tested.
