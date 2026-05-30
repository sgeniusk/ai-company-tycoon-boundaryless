# v0.67 Block 44 QA Run - Near-Miss Reward Status Labels

## Scope

- Added a derived `rewardStatusLabel` to ending near-miss plans.
- New near-misses now show a fresh codex reward preview.
- Already discovered near-misses now show `도감 보상 수집 완료`.
- Added `ending-nearmiss-known-final` browser QA scenario for the discovered near-miss branch.

## RED

- `npm test -- src/game/campaign-ending.test.ts --maxWorkers=1 < /dev/null`
  - Failed because near-miss plans did not expose `rewardStatusLabel`.
- `npm test -- src/game/qa-scenarios.test.ts --maxWorkers=1 < /dev/null`
  - Failed because `ending-nearmiss-known-final` was not in the stable scenario list or URL routing.
- `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
  - Failed because `GameChrome` did not render `nearMiss.rewardStatusLabel`.

## GREEN

- `npm test -- src/game/campaign-ending.test.ts --maxWorkers=1 < /dev/null`
  - 1 file / 17 tests passed.
- `npm test -- src/game/qa-scenarios.test.ts --maxWorkers=1 < /dev/null`
  - 1 file / 65 tests passed.
- `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
  - 1 file / 87 tests passed.

## Gate

- `npm run harness:gate < /dev/null`
  - 49 files / 547 tests passed.
  - Data validation passed.
  - `tsc && vite build` passed.

## Browser Smoke

- Started Vite on `http://127.0.0.1:5176/`.
- Ran Chrome headless DOM smoke for `?scenario=ending-nearmiss-known-final&menu=company`.
- Confirmed rendered DOM contains:
  - `발견 완료 아쉬운 엔딩 재도전 QA`
  - `아쉬운 엔딩`
  - `거의 닿았던 다른 결말`
  - `AGI 안전 협정`
  - `발견 완료`
  - `도감 보상 수집 완료`
  - `신뢰`
- Stopped the temporary Chrome and Vite processes after capture.

## Notes

- Derive-only UI/QA polish. No save, tick, economy, or ending selector changes.
- The raw near-miss reward label remains available, but final UI now uses the contextual status label.
