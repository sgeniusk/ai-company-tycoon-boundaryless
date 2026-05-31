# v0.68 Block 8 QA - Beta Candidate Artifact Manifest

## Scope
- Extended `npm run qa:v068-beta-candidate -- --list-json` with an `artifacts` array so follow-up automation can discover every generated beta-candidate evidence file without hardcoded paths.
- Added the same artifact metadata to `reports/qa/v0_68_beta_candidate.json`.
- Kept the existing Markdown report and command set unchanged.
- No gameplay, save, tick, economy, UI runtime, simulation, or contract-file changes.

## RED
- `npm test -- src/game/v068-beta-candidate-script.test.ts --maxWorkers=1 < /dev/null`
  - Failed because `--list-json` did not expose the expected `artifacts` array.

## GREEN
- `npm test -- src/game/v068-beta-candidate-script.test.ts --maxWorkers=1 < /dev/null`
  - 1 file / 3 tests passed.
- `npm run qa:v068-beta-candidate < /dev/null`
  - PASS, 2/2 checks.
  - Regenerated Markdown + JSON artifacts with artifact metadata.
- `npm run qa:v068-beta-candidate:check < /dev/null`
  - PASS, 2/2 checks, `Report: PASS`, `Summary: PASS`.

## Gate
- `npm run harness:gate < /dev/null`
  - 53 files / 595 tests passed.
  - `npm run validate:data` passed.
  - `npm run qa:beta-readiness:check -- --no-write` passed with 15/15 readiness checks.
  - `npm run build` passed.
