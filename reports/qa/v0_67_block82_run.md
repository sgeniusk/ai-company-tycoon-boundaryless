# v0.67 Block 82 QA - Finale Ending Unlock Chips

## Scope
- Added route unlock recommendation chips directly to the final ending discovery panel.
- The panel reuses `getEndingRouteUnlockRecommendations` with projected founder insight, so cost/status text matches the next-run nudge and codex guidance.
- Kept the change derive-only and UI-only; no `GameState`, save, tick, data, economy, selector priority, or meta reward changes.

## RED
- `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
- Result: failed before implementation.
- Expected failure:
  - Final result UI did not import `getEndingRouteUnlockRecommendations`, define `endingDiscoveryUnlocks`, or render `ending-discovery-unlocks`.

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
- Dev server: `npm run dev -- --host 127.0.0.1 --port 5199 < /dev/null`
- URL: `http://127.0.0.1:5199/?scenario=ending-san-francisco-final`
- Browser note: local UI smoke used a headless Chrome DOM dump because the in-app Browser webview had failed to attach in the preceding smoke path.
- DOM evidence:
  - `다음 런 추천 해금` appeared 1 time.
  - `런칭 플레이북 · 비용 4 · 해금 가능` appeared 1 time.
  - `경계 없는 브랜드 기억 · 비용 8 · 해금 가능` appeared 1 time.
  - Ending discovery text (`새 엔딩 발견` or `기록 갱신`) appeared 1 time.
- Cleanup: stopped the temporary Vite server and killed the temporary Chrome profile.

## Full Gate
- `npm run harness:gate < /dev/null`
- Result: PASS.
- Tests: 51 files / 568 tests passed.
- Data validation: passed.
- Build: `tsc && vite build` passed.

## Changed Files
- `src/components/GameChrome.tsx`
- `src/App.css`
- `src/ui/layout-contract.test.ts`
