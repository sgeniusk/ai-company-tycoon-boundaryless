# v0.67 Block 93 QA Run

Date: 2026-05-31

## Scope

- Hardened runtime ending-codex carryover against unknown `roguelite.discoveredEndingIds`.
- Added shared `sanitizeCampaignEndingIds` usage for final ending discovery projection and next-run reset carryover.
- No `GameState` schema, save version, monthly tick, ending data, or balance changes.

## TDD Evidence

- RED: `npm test -- src/game/campaign-ending.test.ts src/game/meta-progression.test.ts --maxWorkers=1 < /dev/null`
  - `getCampaignEndingDiscovery` counted `unknown_ending_id` in final codex progress.
  - `resetRunWithMetaUnlocks` carried `unknown_ending_id` into the next run.
- GREEN: `npm test -- src/game/campaign-ending.test.ts src/game/meta-progression.test.ts --maxWorkers=1 < /dev/null`
  - 2 files / 34 tests passed.

## Related Verification

- `npm test -- src/game/campaign-ending.test.ts src/game/meta-progression.test.ts src/game/save-integrity.test.ts src/game/run-summary.test.ts src/game/beta-readiness.test.ts --maxWorkers=1 < /dev/null`
  - 5 files / 55 tests passed.
- `npm run qa:beta-readiness:check < /dev/null`
  - PASS; readiness 7/7 checks (100%); guide PASS.

## Full Gate

- `npm run harness:gate < /dev/null`
  - 51 test files / 573 tests passed.
  - Data validation passed.
  - Beta readiness no-write check passed.
  - `tsc && vite build` passed.

## Changed Files

- `src/game/campaign-ending.ts`
- `src/game/campaign-ending.test.ts`
- `src/game/meta-progression.ts`
- `src/game/meta-progression.test.ts`
