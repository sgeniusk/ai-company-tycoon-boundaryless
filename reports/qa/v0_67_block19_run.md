# v0.67 Block 19 QA Run

## Scope
- Added a final-results panel for active ending target runs.
- Added deterministic replay `selection` to `ActiveEndingReplayBrief` so missed targets can restart the same target run.
- Added `ending-replay-final` browser QA scenario for the target result panel.
- No `GameState` field, save migration, monthly tick, or simulation economy changes.

## RED
- `npm test -- src/game/campaign-ending.test.ts --maxWorkers=1 < /dev/null`
  - Failed as expected because active ending briefs did not expose replay `selection`.
- `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
  - Failed as expected because `ending-target-result-panel`, `목표 엔딩 결과`, and `목표 다시 도전` did not exist.
- `npm test -- src/game/qa-scenarios.test.ts --maxWorkers=1 < /dev/null`
  - Failed as expected because `ending-replay-final` fell through to the default QA branch.

## GREEN
- `npm test -- src/game/campaign-ending.test.ts src/game/qa-scenarios.test.ts src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
- Result: passed.
- Evidence: 3 test files, 150 tests passed.

## Gate
- Command: `npm run harness:gate < /dev/null`
- Result: passed.
- Evidence: 49 test files, 528 tests passed; data validation passed; production build completed.

## Browser Smoke
- Dev server: `npm run dev -- --host 127.0.0.1 --port 5176 < /dev/null`
- Scenario: `http://127.0.0.1:5176/?scenario=ending-replay-final`
- Command: headless Chrome DOM dump filtered for `class="ending-target-result-panel`, `목표 엔딩 결과`, and `목표 다시 도전`.
- Result: passed.
- Evidence: DOM contained `class="ending-target-result-panel missed`, `목표 엔딩 결과`, and `목표 다시 도전`.

## Notes
- The retry button calls `resetRunWithMetaUnlocks` with `activeEndingReplayBrief.selection`.
- The result panel summarizes the target ending, missing requirements, and completion percentage without persisting new state.
