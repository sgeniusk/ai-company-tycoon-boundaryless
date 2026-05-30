# v0.67 Block 83 QA - Beta Readiness Percent Badge

## Scope
- Added the already-derived beta readiness percent to the beta readiness guide heading.
- Kept the change UI-only and sourced from `BetaReadinessSummary.readinessPercent`.
- No `GameState`, save, tick, data, economy, ending selector, or meta reward changes.

## RED
- `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
- Result: failed before implementation.
- Expected failure:
  - `BetaReadinessPanel` did not render `준비도 {summary.readinessPercent}%`.
  - `.beta-readiness-heading b` had no badge styling contract.

## GREEN
- `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
- Result: 1 file / 90 tests passed.

## Targeted Regression
- `npm test -- src/game/beta-readiness.test.ts src/game/qa-scenarios.test.ts src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
- Result: 3 files / 162 tests passed.

## CLI QA
- `npm run qa:beta-readiness < /dev/null`
- Result: PASS.
- Evidence: 24 endings / 23 replayable / unlock guidance 23/23 / route coverage 4/4 axes and 40/40 options.

## Browser Smoke
- Dev server: `npm run dev -- --host 127.0.0.1 --port 5200 < /dev/null`
- URL: `http://127.0.0.1:5200/?scenario=beta-readiness`
- Browser note: local UI smoke used a headless Chrome DOM dump because the in-app Browser webview had failed to attach in the preceding smoke path.
- DOM evidence:
  - `준비도 100%` appeared 1 time.
  - Beta readiness check labels (`베타 준비 항목`, `엔딩 루트`, `목표 런`) appeared 4 times total.
  - Dump size: 274,318 bytes.
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
