# v0.67 Block 39 QA - Fallback Final Ending Scenario

## Scope
- Added `ending-fallback-final`, a browser QA scenario for the result-only fallback ending path.
- The scenario fixes a 120-month failure state that deterministically selects `garage_restart` / `다시 차고로`.
- Kept save, tick, economy, campaign-ending selection, and simulation logic unchanged.

## RED
- `npm test -- src/game/qa-scenarios.test.ts --maxWorkers=1 < /dev/null`
  - Failed before implementation because `ending-fallback-final` was missing from the stable QA id list, URL lookup returned `undefined`, and direct creation fell through to the release spotlight scenario.
- `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
  - Failed before implementation because `qa-scenarios.ts` did not contain `ending-fallback-final`.

## GREEN
- `npm test -- src/game/qa-scenarios.test.ts --maxWorkers=1 < /dev/null`
  - 1 file / 62 tests passed.
- `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
  - 1 file / 87 tests passed.

## Gate
- `npm run harness:gate < /dev/null`
  - 49 files / 543 tests passed.
  - `npm run validate:data` passed.
  - `npm run build` passed.

## Browser Smoke
- `npm run dev -- --host 127.0.0.1 --port 5176 < /dev/null`
- Chrome headless DOM smoke for `http://127.0.0.1:5176/?scenario=ending-fallback-final&menu=company`
  - Found `10년 엔딩`, `다시 차고로`, `새 엔딩 발견`, `+0 통찰`, `엔딩 조건 리포트`, and `기본 결말`.
  - Chrome emitted only macOS task-policy warnings; the DOM dump was captured and matched the expected finale UI text.

## Notes
- This gives the final-only fallback ending a direct QA URL alongside the replay target and completed codex scenarios.
- No new persisted fields or migrations were introduced.
