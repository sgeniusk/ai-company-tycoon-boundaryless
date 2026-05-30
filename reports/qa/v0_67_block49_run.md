# v0.67 Block 49 QA Run - Run Summary Ending Reward Status

## Scope

- Added `rewardStatusLabel` to `RunSpotlightEnding`.
- The run-summary ending spotlight now distinguishes repeatable run insight from one-time codex reward status.
- Already discovered final runs show `엔딩 보너스 +4 통찰 · 도감 보상 수집 완료`.
- New final runs show `엔딩 보너스 +N 통찰 · 신규 도감 보상`.

## RED

- `npm test -- src/game/run-summary.test.ts src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
  - Failed before implementation because `RunSpotlightEnding` did not expose `rewardStatusLabel`.
  - Failed before implementation because `GameChrome` did not render `runSummary.spotlight.ending.rewardStatusLabel`.

## GREEN

- `npm test -- src/game/run-summary.test.ts src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
  - 2 files passed, 95 tests passed.

## Gate

- `npm run harness:gate < /dev/null`
  - 49 files passed.
  - 547 tests passed.
  - Data validation passed.
  - Production build passed.

## Browser Smoke

- Scenario: `http://127.0.0.1:5176/?scenario=ending-replay-known-final&menu=results`
- Confirmed DOM text:
  - `ending-spotlight-card`
  - `발견 완료 엔딩`
  - `프라이버시 신뢰 요새`
  - `엔딩 보너스 +4 통찰 · 도감 보상 수집 완료`
  - `기록 갱신`
  - `+0 도감 통찰`

## Notes

- Derive-only results UI and run-summary label alignment.
- No save, tick, economy, or ending-selection behavior changes.
