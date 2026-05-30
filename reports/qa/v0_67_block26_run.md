# v0.67 Block 26 QA - Ending Codex Current-Run Progress

## Scope
- Added a derive-only ending collection progress selector.
- Ending codex cards now show current-run progress, matched condition count, and the next missing condition.
- No save, tick, economy, or data-balance changes.

## RED
- `npm test -- src/game/campaign-ending.test.ts --maxWorkers=1 < /dev/null`
  - Failed before implementation because `getEndingCollectionProgressEntries` did not exist.
- `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
  - Failed before implementation because Deck UI did not render `ending-collection-progress` or `entry.nextRequirementLabel`.

## GREEN
- `npm test -- src/game/campaign-ending.test.ts --maxWorkers=1 < /dev/null`
  - 1 file / 14 tests passed.
- `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
  - 1 file / 84 tests passed.

## Gate
- `npm run harness:gate < /dev/null`
  - 49 files / 535 tests passed.
  - `npm run validate:data` passed.
  - `npm run build` passed.

## Browser Smoke
- Started Vite at `http://127.0.0.1:5176/`.
- Ran Chrome headless DOM smoke for `?scenario=ending-replay&menu=deck`.
- Confirmed DOM contains:
  - `ending-collection-progress`
  - `엔딩 도감`
  - `현재 런`
  - `조건 n/m`
  - `다음 조건`
- Vite dev server was stopped after the smoke check.

## Notes
- Incomplete codex progress is capped below 100%, so near-complete but missing-condition entries do not read as fully complete.
