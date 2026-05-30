# v0.67 Block 40 QA - Near-Miss Finale Scenario

## Scope
- Added `ending-nearmiss-final`, a browser QA scenario for the final-run near-miss replay loop.
- The scenario fixes a 120-month success state that narrowly misses `agi_safety_accord` on trust and exposes the immediate rematch card.
- Kept save, tick, economy, campaign-ending selection, and simulation logic unchanged.

## RED
- `npm test -- src/game/qa-scenarios.test.ts --maxWorkers=1 < /dev/null`
  - Failed before implementation because `ending-nearmiss-final` was missing from the stable QA id list, URL lookup returned `undefined`, and direct creation fell through to the release spotlight scenario.
- `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
  - Failed before implementation because `qa-scenarios.ts` did not contain `ending-nearmiss-final`.

## GREEN
- `npm test -- src/game/qa-scenarios.test.ts --maxWorkers=1 < /dev/null`
  - 1 file / 63 tests passed.
- `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
  - 1 file / 87 tests passed.

## Gate
- `npm run harness:gate < /dev/null`
  - 49 files / 544 tests passed.
  - `npm run validate:data` passed.
  - `npm run build` passed.

## Browser Smoke
- `npm run dev -- --host 127.0.0.1 --port 5176 < /dev/null`
- Chrome headless DOM smoke for `http://127.0.0.1:5176/?scenario=ending-nearmiss-final&menu=company`
  - Found `아쉬운 엔딩`, `거의 닿았던 다른 결말`, `AGI 안전 협정`, `새 도감 후보`, `+5 통찰`, and `신뢰`.
  - Chrome emitted only macOS task-policy warnings; the DOM dump was captured and matched the expected near-miss UI text.

## Notes
- This gives the finale rematch loop a direct QA URL next to target-result and fallback-result scenarios.
- No new persisted fields or migrations were introduced.
