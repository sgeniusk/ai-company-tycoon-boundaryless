# v0.67 Block 36 QA - Completed Ending Codex Browser Scenario

## Scope
- Added a dedicated `ending-replay-complete` QA scenario for the completed replayable-ending codex branch.
- The scenario derives discovered ending ids from `campaignEndings` and marks every non-fallback ending as discovered.
- Kept save, tick, economy, campaign-ending selection, and simulation logic unchanged.

## RED
- `npm test -- src/game/qa-scenarios.test.ts --maxWorkers=1 < /dev/null`
  - Failed before implementation because `ending-replay-complete` was missing from the stable QA id list, URL lookup returned `undefined`, and direct creation fell through to the default company scenario.
- `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
  - Failed before implementation because `qa-scenarios.ts` did not contain `ending-replay-complete`.

## GREEN
- `npm test -- src/game/qa-scenarios.test.ts --maxWorkers=1 < /dev/null`
  - 1 file / 61 tests passed.
- `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
  - 1 file / 87 tests passed.

## Gate
- `npm run harness:gate < /dev/null`
  - 49 files / 542 tests passed.
  - `npm run validate:data` passed.
  - `npm run build` passed.

## Browser Smoke
- `npm run dev -- --host 127.0.0.1 --port 5176 < /dev/null`
- Chrome headless DOM smoke for `http://127.0.0.1:5176/?scenario=ending-replay-complete&menu=deck`
  - Found `목표 엔딩 완료`, `모든 목표 엔딩 발견`, `엔딩 도감`, and `통찰 보상` in the completed codex path.
  - Chrome emitted only background allocator/GCM warnings; the DOM dump was captured and matched the expected UI text.

## Notes
- This closes the block 35 browser-smoke gap for the completed replayable-ending branch.
- No new persisted fields or migrations were introduced.
