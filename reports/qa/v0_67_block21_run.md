# v0.67 Block 21 QA Run

## Scope
- Added a derive-only ending collection summary selector with discovered count, locked count, completion percent, and the next recommended replay target.
- Surfaced the summary in the Deck ending codex with a direct recommended-target run button.
- No save, tick, monthly economy, or campaign finale judgement changes.

## RED
- Command: `npm test -- src/game/campaign-ending.test.ts --maxWorkers=1 < /dev/null`
- Result: failed as expected.
- Evidence: the new selector test failed because `getEndingCollectionSummary` was not implemented.
- Command: `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
- Result: failed as expected.
- Evidence: the Deck layout contract expected `getEndingCollectionSummary`, `ending-collection-summary`, `남은 엔딩`, and `다음 추천 목표` before the UI existed.

## GREEN
- Command: `npm test -- src/game/campaign-ending.test.ts --maxWorkers=1 < /dev/null`
- Result: passed.
- Evidence: 1 test file, 12 tests passed.
- Command: `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
- Result: passed.
- Evidence: 1 test file, 81 tests passed.

## Gate
- Command: `npm run harness:gate < /dev/null`
- Result: passed.
- Evidence: 49 test files, 530 tests passed; data validation passed; production build completed.

## Browser Smoke
- Command: headless Chrome DOM smoke against `http://127.0.0.1:5176/?scenario=ending-replay&menu=deck`.
- Result: found `ending-collection-summary`, `남은 엔딩`, and `다음 추천 목표`.
- Note: Chrome's updater kept the headless process alive after the DOM output, so the process was stopped after collecting the markers.

## Notes
- The recommended target derives from the same replay plan ordering used by the ending replay panel.
- The summary derives entirely from `roguelite.discoveredEndingIds` plus ending definitions.
