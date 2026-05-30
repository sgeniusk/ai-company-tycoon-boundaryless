# v0.67 Block 33 QA - Known Ending Replay Label

## Scope
- Changed active ending reward preview labels for already discovered target endings.
- Added a company-panel note for repeated target ending runs.
- Kept save, tick, economy, data, and simulation logic unchanged.

## RED
- `npm test -- src/game/campaign-ending.test.ts --maxWorkers=1 < /dev/null`
  - Failed before implementation because an already discovered target still used the `완주 시 도감 통찰` preview label.
- `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
  - Failed before implementation because `MenuPanels` did not reference `activeEndingReplayBrief.alreadyDiscovered` or render `발견 완료 목표`.

## GREEN
- `npm test -- src/game/campaign-ending.test.ts --maxWorkers=1 < /dev/null`
  - 1 file / 15 tests passed.
- `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
  - 1 file / 87 tests passed.

## Gate
- `npm run harness:gate < /dev/null`
  - 49 files / 539 tests passed.
  - `npm run validate:data` passed.
  - `npm run build` passed.

## Browser Smoke
- `npm run dev -- --host 127.0.0.1 --port 5176 < /dev/null`
- Chrome headless DOM smoke for `http://127.0.0.1:5176/?scenario=ending-replay-active&menu=company`
  - Found `목표 엔딩 런`, `완주 시 도감 통찰`, and `6/74` in the rendered active target path.

## Notes
- The already-discovered branch is covered by the campaign-ending unit test because the existing browser QA scenario intentionally represents a new target completion path.
- No new persisted fields or migrations were introduced.
