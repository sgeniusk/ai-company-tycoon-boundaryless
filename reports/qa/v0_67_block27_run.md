# v0.67 Block 27 QA - Ending Codex Sorting

## Scope
- Added local Deck-panel sorting for the ending codex.
- Sort modes:
  - `추천 순`: preserves existing codex priority order.
  - `가까운 순`: sorts by current-run progress.
  - `보상 순`: sorts by ending meta reward.
- No save, tick, economy, or data-balance changes.

## RED
- `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
  - Failed before implementation because `endingCollectionSort`, `sortedEndingCollectionEntries`, and `ending-collection-sort` did not exist.

## GREEN
- `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
  - 1 file / 85 tests passed.

## Gate
- `npm run harness:gate < /dev/null`
  - 49 files / 536 tests passed.
  - `npm run validate:data` passed.
  - `npm run build` passed.

## Browser Smoke
- Started Vite at `http://127.0.0.1:5176/`.
- Ran Chrome headless DOM smoke for `?scenario=ending-replay&menu=deck`.
- Confirmed DOM contains:
  - `ending-collection-sort`
  - `엔딩 도감 정렬`
  - `추천 순`
  - `가까운 순`
  - `보상 순`
- Vite dev server was stopped after the smoke check.

## Notes
- Default `추천 순` keeps the previous display order, minimizing regression risk.
