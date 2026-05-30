# v0.67 Block 95 QA Run

Date: 2026-05-31

## Scope

- Hardened `createInitialRogueliteState` so cross-run collection inputs only keep known archetype and campaign-ending ids.
- This aligns roguelite construction with save/hydrate and state-integrity policy.
- No monthly tick, save version, campaign ending data, or beta readiness report shape changes.

## TDD Evidence

- RED: `npm test -- src/game/deckbuilding.test.ts --maxWorkers=1 < /dev/null`
  - Failed because `createInitialRogueliteState` retained `unknown_archetype`.
- GREEN: `npm test -- src/game/deckbuilding.test.ts --maxWorkers=1 < /dev/null`
  - 1 file / 19 tests passed.

## Related Verification

- `npm test -- src/game/deckbuilding.test.ts src/game/meta-progression.test.ts src/game/save-integrity.test.ts src/game/tag-derivation.test.ts --maxWorkers=1 < /dev/null`
  - 4 files / 52 tests passed.
- `npm run qa:beta-readiness:check < /dev/null`
  - PASS; readiness 8/8 checks (100%); report PASS.

## Full Gate

- `npm run harness:gate < /dev/null`
  - 51 test files / 575 tests passed.
  - Data validation passed.
  - Beta readiness no-write check passed.
  - `tsc && vite build` passed.

## Changed Files

- `src/game/deckbuilding.ts`
- `src/game/deckbuilding.test.ts`
