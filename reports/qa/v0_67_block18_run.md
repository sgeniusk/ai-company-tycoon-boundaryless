# v0.67 Block 18 QA Run

## Scope
- Surface active ending replay progress in the global top HUD.
- Keep the signal derive-only via `getActiveEndingReplayBrief`; no save, tick, or simulation changes.

## RED
- Command: `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
- Result: failed as expected.
- Evidence: the new layout contract expected `GameChrome.tsx` to include `getActiveEndingReplayBrief`, `activeEndingReplayBrief.progressPercent`, `ending-target-pill`, and `목표 엔딩`; the implementation had not been added yet.

## GREEN
- Command: `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
- Result: passed.
- Evidence: 1 test file, 80 tests passed.

## Gate
- Command: `npm run harness:gate < /dev/null`
- Result: passed.
- Evidence: 49 test files, 526 tests passed; data validation passed; production build completed.

## Browser Smoke
- Dev server: `npm run dev -- --host 127.0.0.1 --port 5176 < /dev/null`
- Scenario: `http://127.0.0.1:5176/?scenario=ending-replay-active`
- Command: headless Chrome DOM dump filtered for `ending-target-pill|목표 엔딩 39%`
- Result: passed.
- Evidence: DOM contained `<span class="status-pill ending-target-pill">목표 엔딩 39%</span>` and the CSS rule `.status-pill.ending-target-pill`.

## Notes
- No `GameState` field was added.
- No simulation or save migration files changed.
