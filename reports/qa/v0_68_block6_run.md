# v0.68 Block 6 QA - Route-Specific Flow Smoke Markers

## Scope
- Strengthened `npm run qa:v068-flow-smoke` so each reloadable beta QA route checks route-specific DOM text in addition to the shared app shell, title, and scenario label.
- Added per-route `requiredTexts` to the flow-smoke list contract and report checks.
- Regenerated `reports/qa/v0_68_flow_smoke.md` with 8/8 passing route evidence.
- No save, tick, economy, simulation, data, or contract-file changes.

## RED
- `npm test -- src/game/v068-flow-smoke-script.test.ts --maxWorkers=1 < /dev/null`
  - Failed before implementation because the route list did not expose `requiredTexts`.

## GREEN
- `npm test -- src/game/v068-flow-smoke-script.test.ts --maxWorkers=1 < /dev/null`
  - 1 file / 3 tests passed.
- `npm run qa:v068-flow-smoke < /dev/null`
  - First Chrome run passed the shell checks but failed 1 route because `beta-readiness-complete` used an unstable required text.
  - After tightening the expected marker to stable completion copy, PASS with 8/8 routes.
- `npm run qa:v068-flow-smoke:check < /dev/null`
  - PASS, 8/8 routes, `Report: PASS`.

## Gate
- `npm run harness:gate < /dev/null`
  - First sandboxed attempt failed with EPERM while a test restored `reports/qa/v0_67_beta_readiness.md`.
  - Escalated actual-repo rerun passed.
  - 53 files / 595 tests passed.
  - `npm run validate:data` passed.
  - `npm run qa:beta-readiness:check -- --no-write` passed with 15/15 readiness checks.
  - `npm run build` passed.
