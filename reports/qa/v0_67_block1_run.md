# v0.67 block #1 QA - multi-ending foundation

Date: 2026-05-30
Track: v0.67-alpha-multi-ending, block #1
Direction: decision B, multi-ending. Beta prep remains the alternate track.

## Summary

- Added `data/endings.json` with 6 deterministic campaign endings.
- Added pure selector `getCampaignEnding(finalState)` in `src/game/campaign-ending.ts`.
- Wired the existing campaign finale surface to show the selected ending title/flavor through `getCampaignFinale`.
- Added data validation for ending ids, priorities, resource thresholds, run-modifier ids, growth-path ids, difficulty ids, and derived-archetype ids.
- No new `GameState` field. No tick change. No save migration.

## Ending Coverage

- `frontier_demo_empire`: open-source + engineer + code/vision + frontier/OSS archetypes.
- `privacy_trust_bastion`: privacy/regulation + trust-enterprise + privacy archetype.
- `physical_ai_supply_chain`: Texas + robotics boom + operator + hardware frontier.
- `compute_siege_survivor`: GPU squeeze + operator efficiency + compute-siege archetype.
- `standard_platform_compounder`: standard no-arg run default.
- `garage_restart`: fallback/retry ending.

## Verification Evidence

- Red test observed first: `npm test -- src/game/campaign-ending.test.ts --maxWorkers=1` failed on missing `./campaign-ending`.
- Targeted green: `npm test -- src/game/campaign-ending.test.ts --maxWorkers=1` passed 1 file / 4 tests.
- Nearby regression: `npm test -- src/game/campaign-ending.test.ts src/game/campaign.test.ts src/game/run-simulator.test.ts src/game/shareable-moments.test.ts --maxWorkers=1` passed 4 files / 27 tests.
- Run history regression: `npm test -- src/game/run-summary.test.ts --maxWorkers=1` passed 1 file / 7 tests.
- Data validation: `npm run validate:data` passed.
- Build: `npm run build` passed after sandbox escalation for Vite temp-file write; 122 modules transformed.
- Full gate: `npm run harness:gate` passed 49 files / 504 tests, data validation, and build.
- Static diff check: `git diff --check` passed.

## Boundary Checks

- `src/game/simulation.ts`: empty diff.
- Save/state migration files: no changes.
- Contract files (`AGENTS.md`, `feature_list.json`, `progress.md`, `CLAUDE.md`, `docs/ROADMAP.md`): no changes.
- Determinism: selector is priority + data-order based, uses final state only, and does not call RNG.

## Notes

- `git status --short` was clean at start, but HEAD was `c401db6`, one resume-prompt commit above requested baseline `08f76fd`.
- Full gate baseline is now 49 test files / 504 tests because block #1 adds a new unit-test file and 4 tests.
