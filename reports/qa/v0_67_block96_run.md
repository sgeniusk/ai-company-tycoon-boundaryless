# v0.67 Block 96 QA Run

Date: 2026-05-31

## Scope

- Hardened `roguelite.unlockedMetaIds` against unknown ids in three paths:
  - `createInitialRogueliteState`
  - save hydration
  - state integrity validation
- This matches the existing allowed-id policy used for archetype and ending collection ids.
- No monthly tick, save version, data content, beta readiness shape, or economy changes.

## TDD Evidence

- RED: `npm test -- src/game/deckbuilding.test.ts src/game/save-integrity.test.ts --maxWorkers=1 < /dev/null`
  - Constructor retained `unknown_meta_unlock`.
  - Hydration retained duplicate/unknown meta unlock ids.
  - State integrity did not report `unknown_meta_unlock`.
- GREEN: `npm test -- src/game/deckbuilding.test.ts src/game/save-integrity.test.ts --maxWorkers=1 < /dev/null`
  - 2 files / 30 tests passed.

## Related Verification

- `npm test -- src/game/deckbuilding.test.ts src/game/save-integrity.test.ts src/game/meta-progression.test.ts src/game/run-modifiers.test.ts src/game/campaign-ending.test.ts --maxWorkers=1 < /dev/null`
  - 5 files / 81 tests passed.
- `npm run qa:beta-readiness:check < /dev/null`
  - PASS; readiness 8/8 checks (100%); report PASS.

## Full Gate

- `npm run harness:gate < /dev/null`
  - 51 test files / 576 tests passed.
  - Data validation passed.
  - Beta readiness no-write check passed.
  - `tsc && vite build` passed.

## Changed Files

- `src/game/deckbuilding.ts`
- `src/game/deckbuilding.test.ts`
- `src/game/simulation.ts`
- `src/game/save-integrity.test.ts`
- `src/game/state-integrity.ts`
