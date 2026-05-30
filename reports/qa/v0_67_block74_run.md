# v0.67 Block 74 QA — Ending Codex Unlock Hint Sort

## Scope
- Added an ending codex sort mode for route unlock recommendation density.
- Sort order: remaining recommendation label count, reward bonus, ending priority, id.
- No save, tick, economy, or data schema changes.

## RED
- `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
- Expected failure before implementation:
  - `해금 순` sort option missing.
  - `unlockHints` sort union and branch missing.
  - Recommendation-count sort expression missing.

## GREEN
- `npm test -- src/ui/layout-contract.test.ts src/game/campaign-ending.test.ts --maxWorkers=1 < /dev/null`
- Result: 2 files passed, 110 tests passed.

## Full Gate
- `npm run harness:gate < /dev/null`
- Result:
  - 49 test files passed.
  - 560 tests passed.
  - `validate:data` passed.
  - `tsc && vite build` passed.

## Browser Smoke
- Dev server: `npm run dev -- --host 127.0.0.1 --port 5191 < /dev/null`
- URL: `http://127.0.0.1:5191/?scenario=ending-replay&menu=deck`
- In-app browser click smoke:
  - Sort buttons: `추천 순`, `가까운 순`, `보상 순`, `해금 순`
  - Initial active sort: `추천 순`
  - After clicking `해금 순`:
    - Active sort: `해금 순`
    - First visible card had 2 recommendation chips.
    - Sort labels remained present.

## Notes
- This pairs with the block 73 filter so players can either narrow or rank codex routes by remaining meta unlock guidance.
