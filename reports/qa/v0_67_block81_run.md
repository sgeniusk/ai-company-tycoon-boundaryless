# v0.67 Block 81 QA - Beta Readiness Check List

## Scope
- Added a visible per-check beta readiness list to the in-game guide panel.
- The list renders `summary.checks` with complete/partial styling so failures are diagnosable without reading aggregate text.
- Kept the change UI-only and derive-only; no `GameState`, save, tick, data, economy, selector, or QA script logic changes.

## RED
- `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
- Result: failed before implementation.
- Expected failure:
  - `BetaReadinessPanel` did not render `beta-readiness-check-list` from `summary.checks`.

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
- Dev server: `npm run dev -- --host 127.0.0.1 --port 5198 < /dev/null`
- URL: `http://127.0.0.1:5198/?scenario=beta-readiness`
- Browser note: local UI smoke used a headless Chrome DOM dump because the in-app Browser webview had failed to attach in the preceding smoke path.
- DOM evidence:
  - `베타 준비 체크` appeared 4 times.
  - `엔딩 루트` appeared 2 times.
  - `해금 안내` appeared 3 times.
  - `루트 커버리지` appeared 2 times.
  - `목표 런` appeared 1 time.
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
