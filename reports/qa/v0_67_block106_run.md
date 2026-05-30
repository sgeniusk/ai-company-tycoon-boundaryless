# v0.67 Block 106 QA - Ending Route Quick Start

## Scope
- Added a one-click `ending_route` quick start to the Deck panel's next-run setup plan.
- The route is derive-only: it counts a just-completed final ending as discovered, selects the next undiscovered replayable ending, and carries that deterministic `ending:<id>` run modifier selection into `resetRunWithMetaUnlocks`.
- No save, tick, economy, or data-balance changes.

## RED
- `npm test -- src/game/meta-progression.test.ts src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
  - Failed before implementation because `getNextRunSetupPlan` did not expose an `ending_route` quick start and the Deck UI did not render `ending-route-quickstart-badge`.

## GREEN
- `npm test -- src/game/meta-progression.test.ts src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
  - 2 files / 104 tests passed.
- `npm test -- src/game/meta-progression.test.ts src/game/campaign-ending.test.ts src/game/qa-scenarios.test.ts src/game/run-simulator.test.ts src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
  - 5 files / 214 tests passed.

## Browser Smoke
- Started Vite at `http://127.0.0.1:5206/`.
- Ran local Chrome headless DOM smoke for `http://127.0.0.1:5206/?scenario=ten-year-next-run&menu=deck`.
- Confirmed DOM contains:
  - `next-run-command-panel`
  - `next-run-quick-start-grid`
  - `ending-route-quickstart-badge`
  - `엔딩 목표 런`
  - `엔딩 목표:`
- Captured snippet showed: `엔딩 목표: 프런티어 데모 제국` with `샌프란시스코 · 오픈소스 천국 · 엔지니어 창업자` route conditions.
- Stopped the Vite dev server after the smoke check.

## Gate
- `npm run harness:gate < /dev/null`
  - 51 files / 585 tests passed.
  - `npm run validate:data` passed.
  - `npm run qa:beta-readiness:check -- --no-write` passed with 13/13 readiness checks.
  - `npm run build` passed.

