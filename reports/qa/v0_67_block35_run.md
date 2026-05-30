# v0.67 Block 35 QA - Ending Codex Complete Replay State

## Scope
- Stopped `getEndingCollectionSummary` from recommending an already discovered replay target when all replayable endings are discovered.
- Added a Deck codex completion message for that state.
- Kept save, tick, economy, data, and simulation logic unchanged.

## RED
- `npm test -- src/game/campaign-ending.test.ts --maxWorkers=1 < /dev/null`
  - Failed before implementation because `nextReplayPlan` returned a discovered replay plan after every replayable ending had been discovered.
- `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
  - Failed before implementation because `MenuPanels` did not render `모든 목표 엔딩 발견`.

## GREEN
- `npm test -- src/game/campaign-ending.test.ts --maxWorkers=1 < /dev/null`
  - 1 file / 16 tests passed.
- `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
  - 1 file / 87 tests passed.

## Gate
- `npm run harness:gate < /dev/null`
  - 49 files / 541 tests passed.
  - `npm run validate:data` passed.
  - `npm run build` passed.

## Browser Smoke
- `npm run dev -- --host 127.0.0.1 --port 5176 < /dev/null`
- Chrome headless DOM smoke for `http://127.0.0.1:5176/?scenario=ending-replay&menu=deck`
  - Found `엔딩 도감`, `통찰 보상`, `남은 보상`, and `다음 추천 목표` in the normal incomplete codex path.

## Notes
- The complete replayable-ending branch is covered by the campaign-ending unit test; a dedicated browser QA scenario can cover the DOM branch if needed.
- No new persisted fields or migrations were introduced.
