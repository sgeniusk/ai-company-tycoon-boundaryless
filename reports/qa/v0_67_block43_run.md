# v0.67 Block 43 QA Run - Ending Replay Reward Status Labels

## Scope

- Added a derived `rewardStatusLabel` to ending replay plans.
- Locked or undiscovered replay targets now preview the completion reward.
- Already discovered replay targets now say `도감 보상 수집 완료` instead of repeating a fresh-looking reward bonus.
- Updated the deck ending replay cards to render the derived label.

## RED

- `npm test -- src/game/campaign-ending.test.ts --maxWorkers=1 < /dev/null`
  - Failed because replay plans did not expose `rewardStatusLabel`.
- `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
  - Failed because the deck UI did not render `plan.rewardStatusLabel`.

## GREEN

- `npm test -- src/game/campaign-ending.test.ts --maxWorkers=1 < /dev/null`
  - 1 file / 17 tests passed.
- `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
  - 1 file / 87 tests passed.

## Gate

- `npm run harness:gate < /dev/null`
  - 49 files / 546 tests passed.
  - Data validation passed.
  - `tsc && vite build` passed.

## Browser Smoke

- Started Vite on `http://127.0.0.1:5176/`.
- Ran Chrome headless DOM smoke for `?scenario=ending-replay-complete&menu=deck`.
- Confirmed rendered DOM contains:
  - `목표 엔딩 완료`
  - `모든 목표 엔딩 발견`
  - `엔딩 목표 런`
  - `발견 완료`
  - `도감 보상 수집 완료`
  - `도감 목표 런`
- Stopped the temporary Chrome and Vite processes after capture.

## Notes

- Derive-only UI polish. No save, tick, economy, or final selector changes.
- This keeps first-time target reward previews visible while completed replay cards read as collection-complete.
