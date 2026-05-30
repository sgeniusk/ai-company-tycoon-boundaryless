# v0.67 Block 41 QA Run - Repeat Ending Completion Reward Notice

## Scope

- Added a derived `completionRewardNotice` to active ending replay briefs.
- Kept first-time target completions on the existing run reward message.
- Changed already-discovered target completions to say the codex insight is not added again and the record is refreshed.
- Added `ending-replay-known-final` browser QA scenario for the repeat-completion final result panel.

## RED

- `npm test -- src/game/campaign-ending.test.ts --maxWorkers=1 < /dev/null`
  - Failed on missing `completionRewardNotice` for first-time and already-discovered active target briefs.
- `npm test -- src/game/qa-scenarios.test.ts --maxWorkers=1 < /dev/null`
  - Failed on missing stable `ending-replay-known-final` scenario id and URL routing.
- `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
  - Failed because `GameChrome` did not use `activeEndingReplayBrief.completionRewardNotice`.

## GREEN

- `npm test -- src/game/campaign-ending.test.ts --maxWorkers=1 < /dev/null`
  - 1 file / 16 tests passed.
- `npm test -- src/game/qa-scenarios.test.ts --maxWorkers=1 < /dev/null`
  - 1 file / 64 tests passed.
- `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
  - 1 file / 87 tests passed.

## Gate

- `npm run harness:gate < /dev/null`
  - 49 files / 545 tests passed.
  - Data validation passed.
  - `tsc && vite build` passed.

## Browser Smoke

- Started Vite on `http://127.0.0.1:5176/`.
- Ran Chrome headless DOM smoke for `?scenario=ending-replay-known-final&menu=company`.
- Confirmed rendered DOM contains:
  - `반복 목표 엔딩 결과 QA`
  - `목표 엔딩 결과`
  - `목표 달성`
  - `프라이버시 신뢰 요새`
  - `이미 발견한 엔딩입니다`
  - `도감 통찰은 추가되지 않지만 기록은 갱신됩니다`
- Stopped the temporary Chrome and Vite processes after capture.

## Notes

- Derive-only UI/QA polish. No save, tick, economy, or campaign-ending selector changes.
- The wording separates codex discovery progress from repeat-run insight reward math.
