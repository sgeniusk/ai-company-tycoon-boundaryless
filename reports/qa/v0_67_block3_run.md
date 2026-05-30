# v0.67 Block 3 QA Run

Date: 2026-05-30
Track: v0.67-alpha-multi-ending
Block: #3 ending content wave + current-run target tracker

## Scope

- Expanded `data/endings.json` from 6 to 12 deterministic campaign endings.
- Added `getEndingTargetPlans(state, limit)` to rank feasible current-run ending targets and explain missing requirements.
- Surfaced an `엔딩 목표` panel in the company console with progress bars and the top missing conditions.
- Added `RunRecord.endingId` so completed 10-year runs carry a stable ending id alongside the display name.

## Safety Notes

- No monthly economy, tick, balance, or RNG changes.
- Ending target plans are pure derive-only projections from current `GameState`.
- `src/game/simulation.ts` changes remain save/hydrate only: ending collection hydration and run-history `endingId` sanitization.
- No contract files changed: `AGENTS.md`, `feature_list.json`, `progress.md`, `CLAUDE.md`, `docs/ROADMAP.md`.

## Verification

- Red check before implementation:
  - `npm test -- src/game/campaign-ending.test.ts src/game/run-summary.test.ts src/ui/layout-contract.test.ts --maxWorkers=1`
  - Result: failed on missing 12-ending data, missing `getEndingTargetPlans`, missing run-history `endingId`, and missing UI contract.
- Targeted green:
  - `npm test -- src/game/campaign-ending.test.ts src/game/run-summary.test.ts src/ui/layout-contract.test.ts --maxWorkers=1`
  - Result: 3 files passed, 85 tests passed.
- Data validation:
  - `npm run validate:data`
  - Result: passed.
- Full gate:
  - `npm run harness:gate < /dev/null`
  - Result: 49 files passed, 511 tests passed; data validation passed; production build passed.

## Evidence Summary

- Every ending has a deterministic fixture that selects it.
- Standard no-arg 10-year campaign still maps to `standard_platform_compounder`.
- Current-run target plans rank the feasible ending for the run modifiers above immutable mismatches.
- Run history now records stable `endingId` plus the ending display name.
