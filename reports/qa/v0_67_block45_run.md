# v0.67 Block 45 QA Run - World Reveal Target Reward Status

## Scope

- Added `rewardStatusLabel` to active ending replay briefs.
- First-time target runs keep showing the completion reward preview.
- Already discovered target runs show `도감 보상 수집 완료` in the world reveal target card.
- Updated `WorldRevealModal` to render the derived reward status label.

## RED

- `npm test -- src/game/campaign-ending.test.ts --maxWorkers=1 < /dev/null` failed before implementation because `ActiveEndingReplayBrief` did not include `rewardStatusLabel`.
- `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null` failed before implementation because `WorldRevealModal` did not reference `endingReplayBrief.rewardStatusLabel`.

## GREEN

- `npm test -- src/game/campaign-ending.test.ts --maxWorkers=1 < /dev/null`
  - 1 file passed, 17 tests passed.
- `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
  - 1 file passed, 87 tests passed.

## Gate

- `npm run harness:gate < /dev/null`
  - 49 files passed.
  - 547 tests passed.
  - Data validation passed.
  - Production build passed.

## Browser Smoke

- Scenario: `http://127.0.0.1:5176/?scenario=ending-replay-known&menu=company`
- Confirmed DOM text:
  - `세계 뽑기`
  - `목표 엔딩`
  - `프라이버시 신뢰 요새`
  - `도감 보상 수집 완료`
  - `발견 완료 · 도감 통찰`
  - `이 세계로 시작`

## Notes

- Derive-only UI polish.
- No save, tick, economy, or selector behavior changes.
