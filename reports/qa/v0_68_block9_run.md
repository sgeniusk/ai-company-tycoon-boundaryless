# v0.68 Block 9 QA - Beta Candidate Failure Diagnostics

## Scope
- Strengthened `npm run qa:v068-beta-candidate` so each child check records `exitStatus` and a deterministic one-line `diagnostic`.
- Updated the Markdown beta-candidate report with `Exit` and `Diagnostic` columns.
- Updated the JSON beta-candidate summary so automation can read the same failure diagnostics without parsing console output.
- Prioritized TypeScript/build errors over upstream `Report: PASS` lines, so build failures do not collapse into misleading pass-adjacent diagnostics.
- No gameplay, save, tick, economy, UI runtime, simulation, or contract-file changes.

## RED
- `npm test -- src/game/v068-beta-candidate-script.test.ts --maxWorkers=1 < /dev/null`
  - Failed with a fake `npm` harness because child check results lacked `exitStatus` and `diagnostic`.
- `npm test -- src/game/v068-beta-candidate-script.test.ts --maxWorkers=1 < /dev/null`
  - Failed again after adding the first diagnostic path because a simulated TypeScript build error was still summarized as `Report: PASS`.

## GREEN
- `npm test -- src/game/v068-beta-candidate-script.test.ts --maxWorkers=1 < /dev/null`
  - 1 file / 5 tests passed.
- `npm run qa:v068-beta-candidate < /dev/null`
  - PASS, 2/2 checks.
  - Regenerated Markdown + JSON artifacts with exit status and diagnostic fields.
- `npm run qa:v068-beta-candidate:check < /dev/null`
  - PASS, 2/2 checks, `Report: PASS`, `Summary: PASS`.

## Gate
- `npm run harness:gate < /dev/null`
  - 53 files / 597 tests passed.
  - `npm run validate:data` passed.
  - `npm run qa:beta-readiness:check -- --no-write` passed with 15/15 readiness checks.
  - `npm run build` passed.
