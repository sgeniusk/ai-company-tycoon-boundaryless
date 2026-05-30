# v0.67 Block 46 QA Run - Company Target Reward Status

## Scope

- Updated the active company `목표 엔딩 런` brief to use `rewardStatusLabel`.
- Already discovered target runs now show `도감 보상 수집 완료` instead of implying another fresh completion bonus.
- Changed the repeat-target hint from `반복 완주 보상` to `기록 갱신 런`.

## RED

- `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
  - Failed before implementation because `MenuPanels` did not reference `activeEndingReplayBrief.rewardStatusLabel`.
  - Failed because the company brief did not include the `기록 갱신 런` repeat-target copy.

## GREEN

- `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
  - 1 file passed, 87 tests passed.
- `npm test -- src/game/qa-scenarios.test.ts --maxWorkers=1 < /dev/null`
  - 1 file passed, 65 tests passed.

## Gate

- `npm run harness:gate < /dev/null`
  - 49 files passed.
  - 547 tests passed.
  - Data validation passed.
  - Production build passed.

## Browser Smoke

- Scenario: `http://127.0.0.1:5176/?scenario=ending-replay-known&menu=company`
- Confirmed DOM text:
  - `목표 엔딩 런`
  - `프라이버시 신뢰 요새`
  - `도감 보상 수집 완료`
  - `발견 완료 · 도감 통찰`
  - `발견 완료 목표 · 기록 갱신 런`

## Notes

- Derive-only UI copy alignment.
- No save, tick, economy, or ending-selection behavior changes.
