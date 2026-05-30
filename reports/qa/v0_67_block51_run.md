# v0.67 Block 51 QA Run - Ending Target Reward Status

## Scope
- Added `rewardStatusLabel` to current-run ending target plans.
- Company-panel ending target cards use the derived status label when an ending condition is complete.
- Discovered completed targets show `도감 보상 수집 완료`.
- Undiscovered completed targets derive `+N 통찰 신규 도감 보상`.

## RED
- `npm test -- src/game/campaign-ending.test.ts src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
  - Failed before implementation because ending target plans did not expose `rewardStatusLabel`.
  - Failed before implementation because the company-panel ending target card still rendered raw `통찰 보너스 +${plan.meta_reward_bonus}` copy.

## GREEN
- `npm test -- src/game/campaign-ending.test.ts src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
  - 2 files passed.
  - 105 tests passed.

## Gate
- `npm run harness:gate < /dev/null`
  - 49 files passed.
  - 548 tests passed.
  - Data validation passed.
  - Production build passed.

## Browser Smoke
- Scenario: `http://127.0.0.1:5176/?scenario=ending-replay-known-final&menu=company`
- Confirmed DOM text:
  - `엔딩 목표`
  - `목표 엔딩 런`
  - `프라이버시 신뢰 요새`
  - `발견 완료 목표`
  - `완성 조건 충족 · 도감 보상 수집 완료`

## Notes
- Derive-only label alignment for the current-run company console.
- No save, tick, economy, selector, or meta-progression behavior changes.
