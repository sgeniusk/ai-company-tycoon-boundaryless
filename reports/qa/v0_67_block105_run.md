# v0.67 Block 105 QA - Next-Run Ending Brief

## Scope
- Surfaced the latest 10-year campaign ending in the Deck panel's next-run briefing.
- Kept the feature derive-only from `latestRunRecord`; no `GameState`, save, tick, economy, or data changes.
- Preserved the existing `ten-year-next-run` browser QA scenario as the visible carryover entry point.

## RED
- `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
  - Failed before implementation because `MenuPanels.tsx` did not contain `latestRunRecord.endingName` or `next-run-ending-brief`.

## GREEN
- `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
  - 1 file / 91 tests passed.
- `npm test -- src/ui/layout-contract.test.ts src/game/qa-scenarios.test.ts src/game/beta-readiness-script.test.ts src/game/run-simulator.test.ts --maxWorkers=1 < /dev/null`
  - 4 files / 183 tests passed.

## Browser Smoke
- Started Vite at `http://127.0.0.1:5206/`.
- Ran local Chrome headless DOM smoke for `http://127.0.0.1:5206/?scenario=ten-year-next-run&menu=deck`.
- Confirmed DOM contains:
  - `next-run-onboarding`
  - `next-run-ending-brief`
  - `10년 엔딩`
  - `새 런 브리핑`
- Captured snippet showed: `10년 엔딩 S · 표준 세계의 복리 플랫폼 · 10년 생존`.
- Stopped the Vite dev server after the smoke check.

## Gate
- `npm run harness:gate < /dev/null`
  - 51 files / 583 tests passed.
  - `npm run validate:data` passed.
  - `npm run qa:beta-readiness:check -- --no-write` passed with 13/13 readiness checks.
  - `npm run build` passed.

