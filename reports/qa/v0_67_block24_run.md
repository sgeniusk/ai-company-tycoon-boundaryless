# v0.67 Block 24 QA Run

## Scope
- Added Deck-panel filters for the expanded ending codex: 전체, 미발견, 발견 완료.
- Filtering is local UI state only; no save, tick, data, or economy changes.
- Added responsive styling for the filter controls and an empty filtered-state note.

## RED
- Command: `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
- Result: failed as expected.
- Evidence: the new layout contract expected `endingCollectionFilter`, `filteredEndingCollectionEntries`, `ending-collection-filter`, `미발견`, and `발견 완료` before the UI existed.

## GREEN
- Command: `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
- Result: passed.
- Evidence: 1 test file, 83 tests passed.

## Gate
- Command: `npm run harness:gate < /dev/null`
- Result: passed.
- Evidence: 49 test files, 533 tests passed; data validation passed; production build completed.

## Browser Smoke
- Command: headless Chrome DOM smoke against `http://127.0.0.1:5176/?scenario=ending-replay&menu=deck`.
- Result: found `ending-collection-filter`, `엔딩 도감 필터`, `미발견`, and `발견 완료`.

## Notes
- The filter uses the existing collection entry `discovered` flag.
- The default view remains all endings, preserving the previous deck panel behavior.
