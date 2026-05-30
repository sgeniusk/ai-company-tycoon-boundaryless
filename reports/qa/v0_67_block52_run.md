# v0.67 Block 52 QA Run - Final Discovery Reward Status

## Scope
- Added `rewardStatusLabel` to final campaign ending discovery reports.
- Final results use the derived reward status as the reward headline.
- Newly discovered endings show `+N 통찰 신규 도감 보상`.
- Repeated endings show `도감 보상 수집 완료`.
- Final-only zero-reward endings show `결과 전용 기록`.

## RED
- `npm test -- src/game/campaign-ending.test.ts src/game/qa-scenarios.test.ts src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
  - Failed before implementation because `CampaignEndingDiscovery` did not expose `rewardStatusLabel`.
  - Failed before implementation because the final results panel still rendered `endingDiscovery.rewardDeltaLabel` as the headline.
  - Failed before implementation because the fallback final QA scenario had no result-only reward status.

## GREEN
- `npm test -- src/game/campaign-ending.test.ts src/game/qa-scenarios.test.ts src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
  - 3 files passed.
  - 170 tests passed.

## Gate
- `npm run harness:gate < /dev/null`
  - 49 files passed.
  - 548 tests passed.
  - Data validation passed.
  - Production build passed.

## Browser Smoke
- Scenario: `http://127.0.0.1:5176/?scenario=ending-replay-known-final&menu=results`
  - Confirmed `10년 엔딩`, `엔딩 도감 반영`, `기록 갱신`, `도감 보상 수집 완료`, `이미 획득한 도감 보상입니다`, and `도감 통찰 6/74`.
- Scenario: `http://127.0.0.1:5176/?scenario=ending-fallback-final&menu=results`
  - Confirmed `10년 엔딩`, `다시 차고로`, `새 엔딩 발견`, `결과 전용 기록`, and `도감 통찰 2/74`.

## Notes
- Derive-only final discovery reward headline alignment.
- No save, tick, economy, ending-selection, or meta-progression behavior changes.
