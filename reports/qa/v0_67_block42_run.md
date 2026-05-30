# v0.67 Block 42 QA Run - Repeat Ending Discovery Reward Delta

## Scope

- Added derived reward-delta copy to `CampaignEndingDiscovery`.
- Kept the raw ending reward label intact for systems that still need the ending bonus value.
- Updated the final discovery panel to show `+0 도감 통찰` when the ending was already discovered.
- Reused the `ending-replay-known-final` browser QA scenario from block 41.

## RED

- `npm test -- src/game/campaign-ending.test.ts --maxWorkers=1 < /dev/null`
  - Failed on missing `rewardDeltaLabel` and `rewardDeltaDescription`.
- `npm test -- src/game/qa-scenarios.test.ts --maxWorkers=1 < /dev/null`
  - Failed because the known-final scenario discovery summary had no repeat reward-delta copy.
- `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
  - Failed because `GameChrome` did not render `endingDiscovery.rewardDeltaLabel`.

## GREEN

- `npm test -- src/game/campaign-ending.test.ts --maxWorkers=1 < /dev/null`
  - 1 file / 17 tests passed.
- `npm test -- src/game/qa-scenarios.test.ts --maxWorkers=1 < /dev/null`
  - 1 file / 64 tests passed.
- `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
  - 1 file / 87 tests passed.

## Gate

- `npm run harness:gate < /dev/null`
  - 49 files / 546 tests passed.
  - Data validation passed.
  - `tsc && vite build` passed.

## Browser Smoke

- Started Vite on `http://127.0.0.1:5176/`.
- Ran Chrome headless DOM smoke for `?scenario=ending-replay-known-final&menu=company`.
- Confirmed rendered DOM contains:
  - `기록 갱신`
  - `+0 도감 통찰`
  - `이미 획득한 도감 보상입니다`
  - `도감 통찰 6/74`
  - `목표 달성`
  - `이미 발견한 엔딩입니다`
  - `도감 통찰은 추가되지 않지만 기록은 갱신됩니다`
- Stopped the temporary Chrome and Vite processes after capture.

## Notes

- Derive-only UI polish. No save, tick, economy, or final ending selector changes.
- Repeat-run insight reward math remains separate from codex discovery reward-delta copy.
