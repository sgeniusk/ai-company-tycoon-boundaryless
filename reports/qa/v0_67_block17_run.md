# v0.67 Block 17 QA - Deck Active Ending Action Summary

## Scope

- Added a current target progress summary to the deck panel's ending replay section.
- Surfaced the first three active ending requirements as menu-jump action buttons.
- No `GameState` fields, save migration, monthly tick, or balance changes.

## RED

- `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
- Failed as expected because the deck panel did not render `ending-replay-active-summary` or active requirement action buttons.

## GREEN

- `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
- Passed: 1 file / 79 tests.

## Gate

- `npm run harness:gate < /dev/null`
- Passed: 49 files / 525 tests.
- Data validation passed.
- Production build passed.

## Browser Smoke

- Started Vite on `http://127.0.0.1:5176/`.
- Loaded `?scenario=ending-replay-active&menu=deck`.
- Headless Chrome DOM smoke confirmed:
  - `ending-replay-active-summary`
  - `현재 목표 진행`
  - `제품/성장 선택`
  - `신뢰 카드/안전 운영`
- Stopped the dev server after smoke.

## Notes

- The summary uses the already-derived `activeEndingReplayBrief.nextRequirements`.
- Buttons reuse existing menu state navigation and do not mutate campaign state.
