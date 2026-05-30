# v0.67 Block 68 QA - Ending Axis Coverage Gate

## Scope
- Added a `validate:data` guard that requires every run modifier option in these axes to appear in at least one campaign-ending condition:
  - `start_city_ids`
  - `world_lore_ids`
  - `market_condition_ids`
  - `founder_trait_ids`
- This locks the v0.67 ending table against silently dropping a city, world, market, or founder route from the codex target surface.
- No game runtime, UI, save, tick, economy, or ending-selection changes.

## RED
Command:
```sh
npm test -- src/game/campaign-ending.test.ts --maxWorkers=1 < /dev/null
```

Expected failure:
- The validate:data source did not yet contain `validateEndingAxisCoverage`.

Result:
- 1 file failed.
- 18 tests passed, 1 test failed.

## GREEN
Commands:
```sh
npm test -- src/game/campaign-ending.test.ts --maxWorkers=1 < /dev/null
npm run validate:data < /dev/null
```

Result:
- `src/game/campaign-ending.test.ts`: 19 tests passed.
- Data validation passed with the new axis coverage guard.

## Full Gate
Command:
```sh
npm run harness:gate < /dev/null
```

Result:
- 49 test files passed.
- 554 tests passed.
- Data validation passed.
- Production build passed.

## Browser Smoke
- Skipped for this validator-only block; no browser-facing code changed.
