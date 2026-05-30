# v0.67 Block 79 QA - Ending Route Quick Start

## Scope
- Aligned the next-run `recommended_unlock` quick start with the latest finale ending route recommendation when one is available.
- Reused the existing `NextRunRecommendedUnlock` metadata after matching by id, so quick-start labels, affordability, starter deck selection, reasons, and reset payloads keep the existing meta progression behavior.
- Kept the change derive-only in next-run planning; no `GameState`, save, tick, data, economy, or ending selector changes.

## RED
- `npm test -- src/game/meta-progression.test.ts --maxWorkers=1 < /dev/null`
- Result: failed before implementation.
- Expected failure:
  - San Francisco finale ending recommended `launch_playbook`, but the quick start chose the generic higher-scored `boundaryless_brand_memory`.

## GREEN
- `npm test -- src/game/meta-progression.test.ts --maxWorkers=1 < /dev/null`
- Result: 1 file / 10 tests passed.

## Targeted Regression
- `npm test -- src/game/campaign-ending.test.ts src/game/meta-progression.test.ts src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
- Result: 3 files / 122 tests passed.

## CLI QA
- `npm run qa:beta-readiness < /dev/null`
- Result: PASS.
- Evidence: 24 endings / 23 replayable / unlock guidance 23/23 / route coverage 4/4 axes and 40/40 options.

## Browser Smoke
- Dev server: `npm run dev -- --host 127.0.0.1 --port 5196 < /dev/null`
- URL: `http://127.0.0.1:5196/?scenario=ending-san-francisco-final&menu=deck`
- Browser note: the in-app Browser webview did not attach after retry, so the local smoke used headless Chrome DOM dump against the same Vite URL.
- DOM evidence:
  - `런칭 플레이북 해금` appeared 2 times.
  - `경계 없는 브랜드 기억 해금` appeared 0 times.
  - `엔딩 보상` appeared 2 times.
  - `런칭 플레이북 · 비용 4 · 해금 가능` appeared 8 times.
- Cleanup: stopped the temporary Vite server and killed the temporary Chrome profile.

## Full Gate
- `npm run harness:gate < /dev/null`
- Result: PASS.
- Tests: 51 files / 568 tests passed.
- Data validation: passed.
- Build: `tsc && vite build` passed.

## Changed Files
- `src/game/meta-progression.ts`
- `src/game/meta-progression.test.ts`
