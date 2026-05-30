# v0.67 Block 73 QA — Ending Codex Unlock Hint Filter

## Scope
- Added an ending codex filter for entries with remaining route-based meta unlock recommendations.
- Kept the feature derive-only from ending collection entries and `recommendedUnlockLabels`.
- No save, tick, economy, or data schema changes.

## RED
- `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
- Expected failure before implementation:
  - Ending codex filter union did not include `unlockHints`.
  - `해금 추천`, `unlockHintEndingCount`, and filter predicate were absent.

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
- Dev server: `npm run dev -- --host 127.0.0.1 --port 5190 < /dev/null`
- URL: `http://127.0.0.1:5190/?scenario=ending-replay&menu=deck`
- In-app browser click smoke:
  - Initial active filter: `전체24`
  - Filter buttons included `해금 추천21`
  - After clicking `해금 추천21`:
    - Active filter: `해금 추천21`
    - Visible ending cards: 21
    - Unlock hint panels: 21
    - No empty state
  - DOM retained `추천 해금`, `런칭 플레이북`, `경계 없는 브랜드 기억`.

## Notes
- Filter count derives from `entry.recommendedUnlockLabels.length > 0`.
- The filter naturally drops to zero as a player unlocks all matching meta upgrades.
