# v0.67 Block 14 QA - Active Ending Target Checklist

## Scope

- Added a derive-only `nextRequirements` checklist to active ending replay briefs.
- Surfaced the checklist in the company console for `ending:<id>` target runs.
- No `GameState` fields, save migration, monthly tick, or balance changes.

## RED

- `npm test -- src/game/campaign-ending.test.ts src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
- Failed as expected because `ActiveEndingReplayBrief.nextRequirements` and `.ending-replay-checklist` did not exist.

## GREEN

- `npm test -- src/game/campaign-ending.test.ts src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
- Passed: 2 files / 88 tests.

## Gate

- `npm run harness:gate < /dev/null`
- Passed: 49 files / 524 tests.
- Data validation passed.
- Production build passed.

## Browser Smoke

- Started Vite on `http://127.0.0.1:5176/`.
- Loaded `?scenario=ending-replay-active`.
- Headless Chrome DOM smoke confirmed `.ending-replay-checklist` rendered with:
  - `성장 경로 미선택 / 신뢰 기반 엔터프라이즈`
  - `출시 제품 0개 / 5개`
  - `신뢰 62 / 90`
  - `자동화 0 / 60`
- Stopped the dev server after smoke.

## Notes

- The checklist intentionally excludes long-run final-state receipts like `status` and `min_month` so active target runs show actionable next requirements.
