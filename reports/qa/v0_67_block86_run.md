# v0.67 Block 86 QA - Beta Route Check Result-Only Detail

## Scope
- Aligned the beta readiness `ending_routes` check detail with the route metric and QA report.
- The in-game check now reads `24 결말 · 23 목표 · 1 결과 전용`.
- Kept the change derive-only in `getBetaReadinessSummary`; no `GameState`, save, tick, data, economy, ending selector, or meta reward changes.

## RED
- `npm test -- src/game/beta-readiness.test.ts --maxWorkers=1 < /dev/null`
- Result: failed before implementation.
- Expected failure:
  - `ending_routes` still reported `24 결말 · 23 목표` without the result-only branch count.

## GREEN
- `npm test -- src/game/beta-readiness.test.ts --maxWorkers=1 < /dev/null`
- Result: 1 file / 2 tests passed.

## Targeted Regression
- `npm test -- src/game/beta-readiness.test.ts src/game/qa-scenarios.test.ts src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
- Result: 3 files / 162 tests passed.

## CLI QA
- `npm run qa:beta-readiness < /dev/null`
- Result: PASS.
- Evidence: 24 endings / 23 replayable / unlock guidance 23/23 / route coverage 4/4 axes and 40/40 options.

## Browser Smoke
- Dev server: `npm run dev -- --host 127.0.0.1 --port 5203 < /dev/null`
- URL: `http://127.0.0.1:5203/?scenario=beta-readiness`
- Browser note: local UI smoke used a headless Chrome DOM dump because the in-app Browser webview had failed to attach in the preceding smoke path.
- DOM evidence:
  - `24 결말 · 23 목표 · 1 결과 전용` appeared 1 time.
  - `결말 루트 · 결과 전용 1` appeared 1 time.
  - `준비도 100%` appeared 1 time.
  - Dump size: 274,472 bytes.
- Cleanup: stopped the temporary Vite server and killed the temporary Chrome profile.

## Full Gate
- `npm run harness:gate < /dev/null`
- Result: PASS.
- Tests: 51 files / 568 tests passed.
- Data validation: passed.
- Build: `tsc && vite build` passed.

## Changed Files
- `src/game/beta-readiness.ts`
- `src/game/beta-readiness.test.ts`
