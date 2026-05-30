# v0.67 Block 84 QA - Beta Readiness Reward Pool Check

## Scope
- Added a derived `reward_pool` beta readiness check.
- The in-game beta readiness checklist now surfaces the codex reward pool alongside route count, unlock guidance, route coverage, and target replay readiness.
- Kept the change selector/UI-only; no `GameState`, save, tick, data, economy, ending selector, or meta reward changes.

## RED
- `npm test -- src/game/beta-readiness.test.ts src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
- Result: failed before implementation.
- Expected failure:
  - `summary.checks` did not include `reward_pool`.
  - `beta-readiness.ts` did not contain the `도감 보상` readiness check.

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
- Dev server: `npm run dev -- --host 127.0.0.1 --port 5201 < /dev/null`
- URL: `http://127.0.0.1:5201/?scenario=beta-readiness`
- Browser note: local UI smoke used a headless Chrome DOM dump because the in-app Browser webview had failed to attach in the preceding smoke path.
- DOM evidence:
  - `도감 보상` appeared 1 time.
  - `0/81 통찰 · 목표 엔딩 23개 남음` appeared 1 time.
  - `준비도 100%` appeared 1 time.
  - Dump size: 274,434 bytes.
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
- `src/ui/layout-contract.test.ts`
