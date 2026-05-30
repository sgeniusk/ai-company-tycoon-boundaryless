# v0.67 Block 98 QA Run

Date: 2026-05-31

## Scope

- Hardened saved `roguelite.runHistory` campaign-ending fields.
- Hydration now removes malformed `campaignRank`, unknown `endingId`, invalid `endingName`, and invalid `survivedYears`.
- State integrity now reports unknown run-history ending ids, invalid campaign ranks, and invalid survived year values.
- No monthly tick, save version, data content, or beta readiness report changes.

## TDD Evidence

- RED: `npm test -- src/game/save-integrity.test.ts --maxWorkers=1 < /dev/null`
  - Hydration preserved malformed campaign ending fields.
  - State integrity did not report run-history ending/rank issues.
- GREEN: `npm test -- src/game/save-integrity.test.ts --maxWorkers=1 < /dev/null`
  - 1 file / 13 tests passed.

## Related Verification

- `npm test -- src/game/save-integrity.test.ts src/game/run-summary.test.ts src/game/meta-progression.test.ts src/game/campaign-ending.test.ts --maxWorkers=1 < /dev/null`
  - 4 files / 56 tests passed.
- `npm run qa:beta-readiness:check < /dev/null`
  - PASS; readiness 8/8 checks (100%); report PASS.

## Full Gate

- First `npm run harness:gate < /dev/null`
  - Tests/data/beta check passed, but `tsc` flagged the intentionally malformed `campaignRank` fixture.
- Final `npm run harness:gate < /dev/null`
  - 51 test files / 578 tests passed.
  - Data validation passed.
  - Beta readiness no-write check passed.
  - `tsc && vite build` passed.

## Changed Files

- `src/game/simulation.ts`
- `src/game/save-integrity.test.ts`
- `src/game/state-integrity.ts`
