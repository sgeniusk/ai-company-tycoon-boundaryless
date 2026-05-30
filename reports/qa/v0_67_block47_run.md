# v0.67 Block 47 QA Run - Deck Active Target Reward Status

## Scope

- Updated the deck `현재 목표 진행` summary to include `rewardStatusLabel`.
- Already discovered active target runs now show `현재 목표 진행 · 도감 보상 수집 완료`.
- Kept the existing requirement progress and codex progress labels unchanged.

## RED

- `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
  - Failed before implementation because the deck active summary did not include `현재 목표 진행 ·`.
  - Failed before implementation because the deck active summary did not reference `activeEndingReplayBrief.rewardStatusLabel`.

## GREEN

- `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
  - 1 file passed, 87 tests passed.

## Gate

- `npm run harness:gate < /dev/null`
  - 49 files passed.
  - 547 tests passed.
  - Data validation passed.
  - Production build passed.

## Browser Smoke

- Scenario: `http://127.0.0.1:5176/?scenario=ending-replay-known&menu=deck`
- Confirmed DOM text:
  - `엔딩 목표 런`
  - `현재 목표 진행 · 도감 보상 수집 완료`
  - `프라이버시 신뢰 요새`
  - `조건 3/11`
  - `발견 완료 · 도감 통찰`

## Notes

- Derive-only deck UI copy alignment.
- No save, tick, economy, or target-selection behavior changes.
