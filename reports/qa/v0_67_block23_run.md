# v0.67 Block 23 QA Run

## Scope
- Added five data-only campaign endings:
  - `chip_war_local_compute_pact`
  - `singapore_gateway_trust_mesh`
  - `new_york_hype_exchange`
  - `bengaluru_frugal_research_lab`
  - `london_ai_audit_exchange`
- Updated fixture coverage so every ending has a deterministic final-state selector test.
- Updated `validate:data` to guard the new 17-ending content count.
- No save, tick, monthly economy, or UI logic changes.

## RED
- Command: `npm test -- src/game/campaign-ending.test.ts --maxWorkers=1 < /dev/null`
- Result: failed as expected.
- Evidence: the fixture coverage test expected the five new ending IDs before they existed in `data/endings.json`, and the validator-source check expected the 17-ending count before the harness was updated.

## GREEN
- Command: `npm test -- src/game/campaign-ending.test.ts --maxWorkers=1 < /dev/null`
- Result: passed.
- Evidence: 1 test file, 13 tests passed.
- Command: `npm run validate:data < /dev/null`
- Result: passed.

## Gate
- Command: `npm run harness:gate < /dev/null`
- Result: passed.
- Evidence: 49 test files, 532 tests passed; data validation passed; production build completed.

## Notes
- Existing standard/no-arg ten-year campaign still maps to `standard_platform_compounder`.
- New endings are specific combinations over run modifiers, growth paths, resources, and derived archetypes.
