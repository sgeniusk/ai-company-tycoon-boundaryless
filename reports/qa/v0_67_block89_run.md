# v0.67 Block 89 QA - Beta Readiness Guide Gate

## Scope
- Added an `in_game_guide` check to `qa:beta-readiness`.
- The CLI beta readiness gate now verifies the in-game guide source is wired to the status badge, checklist, and CSS surface.
- Kept the change in QA/report automation only; no runtime game state, save, tick, data, economy, ending selector, UI behavior, or meta reward changes.

## RED
- `npm test -- src/game/beta-readiness-script.test.ts --maxWorkers=1 < /dev/null`
- Result: failed before implementation.
- Expected failure:
  - `totalCheckCount` was still 6 instead of 7.

## GREEN
- `npm test -- src/game/beta-readiness-script.test.ts --maxWorkers=1 < /dev/null`
- Result: 1 file / 1 test passed.

## Targeted Regression
- `npm test -- src/game/beta-readiness-script.test.ts src/game/beta-readiness.test.ts src/game/qa-scenarios.test.ts src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
- Result: 4 files / 163 tests passed.

## CLI QA
- `npm run qa:beta-readiness < /dev/null`
- Result: PASS and rewrote `reports/qa/v0_67_beta_readiness.md`.
- Evidence:
  - `Readiness: 7/7 checks (100%)`.
  - `게임 내 가이드 | status badge + checklist | PASS`.
  - 24 endings / 23 replayable / 1 result-only fallback.
  - Unlock guidance 23/23.
  - Route coverage 4/4 axes and 40/40 options.

## JSON Smoke
- `npm run --silent qa:beta-readiness -- --json --no-write < /dev/null`
- Result: `completeCheckCount: 7`, `totalCheckCount: 7`, `readinessPercent: 100`, and `in_game_guide` complete.

## Full Gate
- `npm run harness:gate < /dev/null`
- Result: PASS.
- Tests: 51 files / 568 tests passed.
- Data validation: passed.
- Build: `tsc && vite build` passed.

## Changed Files
- `scripts/qa/check-v067-beta-readiness.mjs`
- `src/game/beta-readiness-script.test.ts`
- `reports/qa/v0_67_beta_readiness.md`
