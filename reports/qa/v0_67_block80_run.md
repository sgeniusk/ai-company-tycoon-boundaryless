# v0.67 Block 80 QA - Ending Route Meta Unlock Badges

## Scope
- Added ending route recommendation badges to the concrete meta unlock list in the Deck panel.
- The badge derives from `nextRunSetupPlan.endingNudge.recommendedUnlocks`, so it mirrors the finale route guidance and current affordability status.
- Kept the change UI-only and derive-only; no `GameState`, save, tick, data, economy, selector, or meta reward changes.

## RED
- `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
- Result: failed before implementation.
- Expected failure:
  - Deck UI did not define `endingRouteUnlockIds`, render `ending-route-meta-badge`, or style the new badge.

## GREEN
- `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
- Result: 1 file / 90 tests passed.

## Targeted Regression
- `npm test -- src/game/campaign-ending.test.ts src/game/meta-progression.test.ts src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
- Result: 3 files / 122 tests passed.

## CLI QA
- `npm run qa:beta-readiness < /dev/null`
- Result: PASS.
- Evidence: 24 endings / 23 replayable / unlock guidance 23/23 / route coverage 4/4 axes and 40/40 options.

## Browser Smoke
- Dev server: `npm run dev -- --host 127.0.0.1 --port 5197 < /dev/null`
- URL: `http://127.0.0.1:5197/?scenario=ending-san-francisco-final&menu=deck`
- Browser note: the in-app Browser webview had failed to attach in the previous block after retry, so this local UI smoke used a headless Chrome DOM dump against the same Vite URL.
- DOM evidence:
  - `엔딩 루트 추천 · 해금 가능` appeared 2 times.
  - `<h3>런칭 플레이북</h3>` appeared 1 time.
  - `<h3>경계 없는 브랜드 기억</h3>` appeared 1 time.
  - `런칭 플레이북 해금` quick-start text appeared 2 times.
- Cleanup: stopped the temporary Vite server and killed the temporary Chrome profile.

## Full Gate
- `npm run harness:gate < /dev/null`
- Result: PASS.
- Tests: 51 files / 568 tests passed.
- Data validation: passed.
- Build: `tsc && vite build` passed.

## Changed Files
- `src/components/MenuPanels.tsx`
- `src/App.css`
- `src/ui/layout-contract.test.ts`
