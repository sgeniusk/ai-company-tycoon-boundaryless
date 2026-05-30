# v0.67 Block 77 QA - Ending Unlock Cost Details

## Scope
- Added derive-only detailed route unlock recommendations for campaign endings.
- Ending codex and next-run ending nudges now show each recommended meta unlock with title, cost, and affordability/status.
- Kept the existing `recommendedUnlockLabels` compatibility path for summary counts and prior tests.
- No `GameState`, save, tick, economy, ending data, or selector priority changes.

## RED
- `npm test -- src/game/campaign-ending.test.ts src/game/meta-progression.test.ts src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
- Expected failures before implementation:
  - `getEndingRouteUnlockRecommendations` missing.
  - `endingNudge.recommendedUnlocks` missing.
  - Deck UI did not render `비용 {unlock.cost}` or `unlock.statusLabel`.

## GREEN
- `npm test -- src/game/campaign-ending.test.ts src/game/meta-progression.test.ts src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
- Result: 3 files / 121 tests passed.

## CLI QA
- `npm run qa:beta-readiness < /dev/null`
- Result: PASS.
- Evidence: 24 endings / 23 replayable / unlock guidance 23/23 / route coverage 4/4 axes and 40/40 options.

## Browser Smoke
- Dev server: `npm run dev -- --host 127.0.0.1 --port 5194 < /dev/null`
- Codex URL: `http://127.0.0.1:5194/?scenario=ending-replay&menu=deck`
- Finale nudge URL: `http://127.0.0.1:5194/?scenario=ending-san-francisco-final&menu=deck`
- DOM evidence:
  - Codex DOM contained `추천 해금` 46 times and `해금 가능` 37 times.
  - Codex DOM contained `런칭 플레이북 · 비용 4 · 해금 가능` and `경계 없는 브랜드 기억 · 비용 8 · 해금 가능`.
  - Finale nudge DOM contained `추천 해금` 48 times and the same cost/status chips.
- Cleanup: stopped the temporary dev server and headless Chrome profiles.

## Full Gate
- `npm run harness:gate < /dev/null`
- Result: PASS.
- Tests: 51 files / 567 tests passed.
- Data validation: passed.
- Build: `tsc && vite build` passed.

## Changed Files
- `src/game/campaign-ending.ts`
- `src/game/meta-progression.ts`
- `src/components/MenuPanels.tsx`
- `src/game/campaign-ending.test.ts`
- `src/game/meta-progression.test.ts`
- `src/ui/layout-contract.test.ts`
