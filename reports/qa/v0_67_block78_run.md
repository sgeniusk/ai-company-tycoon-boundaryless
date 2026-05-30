# v0.67 Block 78 QA - Affordable Ending Unlock Filter

## Scope
- Added an `affordableUnlocks` ending codex filter that shows endings with at least one currently affordable recommended route unlock.
- Updated the ending codex `unlockHints` sort to prefer endings with more affordable recommended unlocks before total recommendation count, reward, priority, and id.
- Kept the change derive-only inside the Deck UI; no `GameState`, save, tick, data, economy, selector, or meta reward changes.

## RED
- `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
- Result: failed before implementation.
- Expected failures:
  - Deck filter union did not include `affordableUnlocks`.
  - UI did not expose `해금 가능` / `affordableUnlockHintEndingCount`.
  - Unlock hint sort did not count `unlock.affordable`.

## GREEN
- `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
- Result: 1 file / 90 tests passed.

## Targeted Regression
- `npm test -- src/game/campaign-ending.test.ts src/game/meta-progression.test.ts src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
- Result: 3 files / 121 tests passed.

## CLI QA
- `npm run qa:beta-readiness < /dev/null`
- Result: PASS.
- Evidence: 24 endings / 23 replayable / unlock guidance 23/23 / route coverage 4/4 axes and 40/40 options.

## Browser Smoke
- Dev server: `npm run dev -- --host 127.0.0.1 --port 5195 < /dev/null`
- URL: `http://127.0.0.1:5195/?scenario=ending-replay&menu=deck`
- In-app Browser DOM evidence:
  - `해금 추천 23` and `해금 가능 23` filter buttons were visible.
  - After clicking `해금 가능 23`, the button was active in the DOM snapshot.
  - Body evidence contained `추천 해금` 23 times and `해금 가능` 50 times.
- Cleanup: stopped the temporary Vite server and closed the smoke tab.

## Full Gate
- `npm run harness:gate < /dev/null`
- Result: PASS.
- Tests: 51 files / 567 tests passed.
- Data validation: passed.
- Build: `tsc && vite build` passed.

## Changed Files
- `src/components/MenuPanels.tsx`
- `src/ui/layout-contract.test.ts`
