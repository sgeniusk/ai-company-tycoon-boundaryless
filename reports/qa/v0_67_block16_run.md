# v0.67 Block 16 QA - Active Ending Replay Deck State

## Scope

- Made the deck panel's ending replay cards recognize the currently active `ending:<id>` target run.
- Active target cards now show a distinct state and a `현재 목표 확인` button that returns to the company checklist.
- No `GameState` fields, save migration, monthly tick, or balance changes.

## RED

- `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
- Failed as expected because the deck replay panel did not compare `activeEndingReplayBrief?.id === plan.id`, did not render `ending-replay-active-card`, and did not expose a company-checklist CTA.

## GREEN

- `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
- Passed: 1 file / 78 tests.

## Gate

- `npm run harness:gate < /dev/null`
- Passed: 49 files / 524 tests.
- Data validation passed.
- Production build passed.

## Browser Smoke

- Started Vite on `http://127.0.0.1:5176/`.
- Loaded `?scenario=ending-replay-active&menu=deck`.
- Headless Chrome DOM smoke confirmed:
  - `ending-replay-active-card`
  - `현재 목표 확인`
  - `현재 목표 런 · 회사 체크리스트에서 다음 행동 확인`
- Stopped the dev server after smoke.

## Notes

- The active replay card routes back to `company` through the existing menu state setter.
- Starting a different target run still uses the existing `resetRunWithMetaUnlocks` path.
