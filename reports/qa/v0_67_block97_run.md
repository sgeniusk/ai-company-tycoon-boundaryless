# v0.67 Block 97 QA Run

Date: 2026-05-31

## Scope

- Hardened `roguelite.starterDeckId` in save hydration and state integrity validation.
- Unknown starter deck ids now fall back to `balanced_founder`.
- Integrity validation now reports unknown starter decks and meta-locked starter decks without the required unlock.
- No monthly tick, save version, data content, or beta readiness report changes.

## TDD Evidence

- RED: `npm test -- src/game/save-integrity.test.ts --maxWorkers=1 < /dev/null`
  - Hydration kept `unknown_starter_deck`.
  - State integrity did not report the unknown starter deck id.
- GREEN: `npm test -- src/game/save-integrity.test.ts --maxWorkers=1 < /dev/null`
  - 1 file / 12 tests passed.

## Related Verification

- `npm test -- src/game/save-integrity.test.ts src/game/deckbuilding.test.ts src/game/meta-progression.test.ts src/game/run-modifiers.test.ts src/game/campaign-ending.test.ts --maxWorkers=1 < /dev/null`
  - 5 files / 82 tests passed.
- `npm run qa:beta-readiness:check < /dev/null`
  - PASS; readiness 8/8 checks (100%); report PASS.

## Full Gate

- `npm run harness:gate < /dev/null`
  - 51 test files / 577 tests passed.
  - Data validation passed.
  - Beta readiness no-write check passed.
  - `tsc && vite build` passed.

## Changed Files

- `src/game/simulation.ts`
- `src/game/save-integrity.test.ts`
- `src/game/state-integrity.ts`
