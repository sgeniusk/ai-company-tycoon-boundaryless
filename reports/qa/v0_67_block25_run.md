# v0.67 Block 25 QA - Near-Miss Ending Labels

## Scope
- Added derive-only near-miss metadata for final campaign results.
- Final-result near-miss cards now show whether the ending is already discovered and the meta insight reward.
- No save, tick, economy, or data-balance changes.

## RED
- `npm test -- src/game/campaign-ending.test.ts --maxWorkers=1 < /dev/null`
  - Failed before implementation because `EndingNearMissPlan` did not expose `discovered` or `rewardLabel`.
- `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
  - Failed before implementation because the final-result UI did not render `nearMiss.discovered` / `nearMiss.rewardLabel`.

## GREEN
- `npm test -- src/game/campaign-ending.test.ts --maxWorkers=1 < /dev/null`
  - 1 file / 13 tests passed.
- `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
  - 1 file / 83 tests passed.

## Gate
- `npm run harness:gate < /dev/null`
  - 49 files / 533 tests passed.
  - `npm run validate:data` passed.
  - `npm run build` passed.

## Browser Smoke
- Started Vite at `http://127.0.0.1:5176/`.
- Ran Chrome headless DOM smoke for `?scenario=ending-replay-final`.
- Confirmed DOM contains:
  - `ending-nearmiss-grid`
  - `아쉬운 엔딩`
  - `새 도감 후보`
  - `통찰`

## Notes
- Playwright was not installed as a direct repo dependency, so the browser smoke used local Chrome headless instead.
- Vite dev server was stopped after the smoke check.
