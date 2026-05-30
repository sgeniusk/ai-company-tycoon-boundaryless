# v0.67 Block 48 QA Run - Top HUD Target Collected Cue

## Scope

- Added a compact collected-state cue to the top HUD ending target pill.
- Already discovered active target runs now show `목표 엔딩 39% · 수집 완료`.
- First-time target runs keep the existing compact progress-only pill.

## RED

- `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
  - Failed before implementation because `GameChrome` did not read `activeEndingReplayBrief.alreadyDiscovered`.
  - Failed before implementation because the top HUD did not contain the `수집 완료` cue.

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

- Scenario: `http://127.0.0.1:5176/?scenario=ending-replay-known&menu=company`
- Confirmed DOM text:
  - `status-pill ending-target-pill`
  - `목표 엔딩 39% · 수집 완료`
  - `도감 보상 수집 완료`
  - `발견 완료 목표 · 기록 갱신 런`

## Notes

- Derive-only top HUD copy alignment.
- No save, tick, economy, or target-selection behavior changes.
