# v0.67 Block 29 QA - Ending Content Wave

## Scope
- Expanded campaign endings from 17 to 22.
- Added five deterministic endings:
  - `berlin_privacy_commons`
  - `beijing_domestic_platform_stack`
  - `alphago_slow_science_compound`
  - `texas_energy_compute_grid`
  - `tokyo_hype_companion_studio`
- Added fixture coverage so each new ending selects deterministically.
- Updated data validation ending count from 17 to 22.
- No save, tick, economy, or simulation logic changes.

## RED
- `npm test -- src/game/campaign-ending.test.ts --maxWorkers=1 < /dev/null`
  - Failed before data implementation because the expected 22-ending fixture list did not match the 17-ending data file.
  - Failed before validation update because `validate-data.mjs` still expected exactly 17 endings.

## GREEN
- `npm test -- src/game/campaign-ending.test.ts --maxWorkers=1 < /dev/null`
  - 1 file / 14 tests passed.
- `npm run validate:data < /dev/null`
  - Data validation passed.

## Gate
- `npm run harness:gate < /dev/null`
  - 49 files / 537 tests passed.
  - `npm run validate:data` passed.
  - `npm run build` passed.

## Notes
- The standard no-arg campaign path remains guarded by the existing selector and run-simulator tests.
- New endings use existing run-modifier axes and derivation archetypes only; no new schema fields were added.
