# v0.67 Block 91 QA - Harness Includes Beta Readiness Check

## Scope
- Added `npm run qa:beta-readiness:check` to `npm run harness:gate`.
- The main gate now verifies the v0.67 beta readiness data, scenarios, guide wiring, and report automation without writing files.
- Kept the change in tooling only; no runtime game state, save, tick, data, economy, ending selector, UI behavior, or meta reward changes.

## RED
- `npm test -- src/game/beta-readiness-script.test.ts --maxWorkers=1 < /dev/null`
- Result: failed before implementation.
- Expected failure:
  - `package.json` `harness:gate` did not include `npm run qa:beta-readiness:check`.

## GREEN
- `npm test -- src/game/beta-readiness-script.test.ts --maxWorkers=1 < /dev/null`
- Result: 1 file / 3 tests passed.

## Targeted Regression
- `npm test -- src/game/beta-readiness-script.test.ts src/game/beta-readiness.test.ts src/game/qa-scenarios.test.ts src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
- Result: 4 files / 165 tests passed.

## CLI QA
- `npm run --silent qa:beta-readiness:check -- --json < /dev/null`
- Result: PASS JSON with `completeCheckCount: 7`, `totalCheckCount: 7`, `readinessPercent: 100`.

## Full Gate
- `npm run harness:gate < /dev/null`
- Result: PASS.
- Tests: 51 files / 570 tests passed.
- Data validation: passed.
- Beta readiness check: PASS.
- Build: `tsc && vite build` passed.

## Changed Files
- `package.json`
- `src/game/beta-readiness-script.test.ts`
