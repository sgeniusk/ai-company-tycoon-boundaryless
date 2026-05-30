# v0.67 Block 2 QA Run

Date: 2026-05-30
Track: v0.67-alpha-multi-ending
Block: #2 ending collection + per-ending meta nudge

## Scope

- Added cross-run ending discovery to `roguelite.discoveredEndingIds`.
- Added `meta_reward_bonus` to each ending definition and applied it only to final 10-year campaign rewards.
- Surfaced an `엔딩 도감` collection in the roguelite/deck panel.
- Extended save hydration and state integrity for old saves with no ending collection field.

## Safety Notes

- No monthly economy or tick rewrite.
- `src/game/simulation.ts` change is limited to importing ending data and hydrating `roguelite.discoveredEndingIds`.
- No contract files changed: `AGENTS.md`, `feature_list.json`, `progress.md`, `CLAUDE.md`, `docs/ROADMAP.md`.
- No git commit made.

## Verification

- Targeted red-to-green:
  - `npm test -- src/game/campaign-ending.test.ts src/game/meta-progression.test.ts src/game/save-integrity.test.ts src/ui/layout-contract.test.ts --maxWorkers=1`
  - Result: 4 files passed, 92 tests passed.
- Data validation:
  - `npm run validate:data`
  - Result: passed.
- Full gate:
  - `npm run harness:gate < /dev/null`
  - Result: 49 files passed, 509 tests passed; data validation passed; production build passed.
- Diff hygiene:
  - `git diff --check`
  - Result: passed.
- Contract-file guard:
  - `git diff -- AGENTS.md feature_list.json progress.md CLAUDE.md docs/ROADMAP.md`
  - Result: empty.

## Evidence Summary

- Standard 10-year campaign still maps to `standard_platform_compounder`.
- Final standard campaign insight reward now receives that ending's +2 bonus.
- Repeated resets keep ending discoveries unique.
- Old saves without `discoveredEndingIds` migrate to an empty array and pass integrity checks.
