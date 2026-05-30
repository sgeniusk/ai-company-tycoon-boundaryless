# v0.67 Block 109 QA - Active Ending Action Target Labels

## Scope
- Added visible target-menu labels to active ending target action buttons.
- Added matching `aria-label` text so browser QA and assistive tech can tell where each action routes.
- No save, tick, economy, data, or route-selection changes.

## RED
- `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
  - Failed before implementation because active ending action buttons did not expose `targetMenuLabel`, `ending-replay-action-target`, or menu destination copy.

## GREEN
- `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
  - 1 file / 93 tests passed.
- `npm test -- src/ui/layout-contract.test.ts src/game/qa-scenarios.test.ts src/game/campaign-ending.test.ts --maxWorkers=1 < /dev/null`
  - 3 files / 188 tests passed.

## Browser Smoke
- Started Vite at `http://127.0.0.1:5206/`.
- Ran local Chrome headless DOM smoke for `http://127.0.0.1:5206/?scenario=ten-year-ending-route-start&menu=deck`.
- Confirmed DOM contains:
  - `ending-replay-action-target`
  - `제품 메뉴로 이동`
  - `상점 메뉴로 이동`
  - `aria-label="제품/성장 선택 · 제품 메뉴로 이동"`
  - `aria-label="수익/확장 점검 · 상점 메뉴로 이동"`
- Captured snippet showed all three active target buttons with destination labels.
- Stopped the Vite dev server after the smoke check.

## Gate
- `npm run harness:gate < /dev/null`
  - 51 files / 587 tests passed.
  - `npm run validate:data` passed.
  - `npm run qa:beta-readiness:check -- --no-write` passed with 14/14 readiness checks.
  - `npm run build` passed.

