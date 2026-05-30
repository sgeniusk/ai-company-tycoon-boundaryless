# v0.67 Block 15 QA - Active Ending Checklist Actions

## Scope

- Added derive-only action hints to active ending replay checklist items.
- Surfaced checklist buttons that jump to the relevant menu for the next requirement.
- No `GameState` fields, save migration, monthly tick, or balance changes.

## RED

- `npm test -- src/game/campaign-ending.test.ts src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
- Failed as expected because `nextRequirements` did not include `actionLabel` / `targetMenu`, and the company console did not render checklist action buttons.

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
- Headless Chrome DOM smoke confirmed `.ending-replay-checklist` rendered action buttons:
  - `제품/성장 선택`
  - `제품 출시`
  - `신뢰 카드/안전 운영`
  - `자동화 연구`
- Stopped the dev server after smoke.

## Notes

- Action targets are derived from requirement ids and remain non-persistent.
- Selection blockers fall back to `목표 런 다시 시작` in the deck panel, while resource/product/growth requirements point at the closest operational menu.
