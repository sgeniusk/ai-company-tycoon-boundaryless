# v0.67 Block 85 QA - Beta Readiness Result-Only Count

## Scope
- Added a derived `resultOnlyTotal` field to the beta readiness summary.
- Surfaced the result-only ending count in the beta readiness guide's route metric.
- Kept the change derive-only and UI-only; no `GameState`, save, tick, data, economy, ending selector, or meta reward changes.

## RED
- `npm test -- src/game/beta-readiness.test.ts src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
- Result: failed before implementation.
- Expected failure:
  - `summary.resultOnlyTotal` was `undefined`.
  - `BetaReadinessPanel` did not render `결과 전용 {summary.resultOnlyTotal}`.

## GREEN
- `npm test -- src/game/beta-readiness.test.ts src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
- Result: 2 files / 92 tests passed.

## Targeted Regression
- `npm test -- src/game/beta-readiness.test.ts src/game/qa-scenarios.test.ts src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
- Result: 3 files / 162 tests passed.

## CLI QA
- `npm run qa:beta-readiness < /dev/null`
- Result: PASS.
- Evidence: 24 endings / 23 replayable / unlock guidance 23/23 / route coverage 4/4 axes and 40/40 options.

## Browser Smoke
- Dev server: `npm run dev -- --host 127.0.0.1 --port 5202 < /dev/null`
- URL: `http://127.0.0.1:5202/?scenario=beta-readiness`
- Browser note: local UI smoke used a headless Chrome DOM dump because the in-app Browser webview had failed to attach in the preceding smoke path.
- DOM evidence:
  - `결말 루트 · 결과 전용 1` appeared 1 time.
  - `도감 보상` appeared 1 time.
  - `준비도 100%` appeared 1 time.
  - Dump size: 274,453 bytes.
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
- `src/components/GameChrome.tsx`
- `src/ui/layout-contract.test.ts`
