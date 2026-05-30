# v0.67 Block 50 QA Run - Ending Codex Reward Status

## Scope
- Added a derived `rewardStatusLabel` to ending collection entries.
- Discovered codex cards show `도감 보상 수집 완료`.
- Locked reward-bearing codex cards show `+N 통찰 도감 보상`.
- Final-only zero-reward entries derive `결과 전용 기록`.

## RED
- `npm test -- src/game/campaign-ending.test.ts src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
  - Failed before implementation because collection entries did not expose `rewardStatusLabel`.
  - Failed before implementation because collection cards did not render `entry.rewardStatusLabel`.

## GREEN
- `npm test -- src/game/campaign-ending.test.ts src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
  - 2 files passed.
  - 104 tests passed.

## Gate
- `npm run harness:gate < /dev/null`
  - 49 files passed.
  - 547 tests passed.
  - Data validation passed.
  - Production build passed.

## Browser Smoke
- Scenario: `http://127.0.0.1:5176/?scenario=ending-replay&menu=deck`
- Confirmed DOM text:
  - `엔딩 도감`
  - `목표 엔딩 · 도감 보상 수집 완료`
  - `목표 엔딩 · +5 통찰 도감 보상`
  - `프라이버시 신뢰 요새`
  - `프런티어 데모 제국`
  - `도감 목표 런`

## Notes
- Derive-only ending codex UI label alignment.
- No save, tick, economy, or ending-selection behavior changes.
