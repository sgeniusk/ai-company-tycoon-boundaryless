# Progress - AI Company Tycoon: Boundaryless

Last Updated: 2026-05-20

## Current State

- Current version: `v0.50-alpha`
- Latest implementation commit at audit time: `d816814 Add v0.50 alpha candidate review`
- Working tree before this v0.50 handoff pass: clean after the implementation commit
- Stack: Vite + React + TypeScript
- Main local QA route: `http://127.0.0.1:5201/?scenario=office-visuals`
- Persona QA route: `http://127.0.0.1:5201/?scenario=persona20`
- Main verification gate: `npm run harness:gate`

## Current Objective

Completed `v0.50-alpha-candidate`: rerun 20-person persona QA against the latest office screen, confirm no unresolved P0/P1 findings, and lock first-30-second screen signals.

## What Changed

- Updated `runPersonaPlaytestReview()` to target `v0.50-alpha`.
- Added persona report fields for unresolved P0/P1 findings and first-screen signals.
- Updated `persona20` QA to show `v0.50`, `P0/P1: 없음`, and first-30-second signals.
- Removed stale v0.21 right-side support-panel compression from current alpha-candidate blockers.
- Added v0.50 changelog, QA scenario docs, acceptance criteria, production report, QA report, and playtest report.
- Moved the current feature pointer to `v0.51-alpha-event-pose-sheets`.

## Files

- `AGENTS.md`
- `feature_list.json`
- `progress.md`
- `session-handoff.md`
- `src/game/persona-playtest.ts`
- `src/game/persona-playtest.test.ts`
- `src/game/qa-scenarios.ts`
- `src/game/qa-scenarios.test.ts`
- `docs/SESSION_HANDOFF.md`
- `docs/ACCEPTANCE_CRITERIA.md`
- `docs/CHANGELOG.md`
- `docs/QA_SCENARIOS.md`
- `docs/ROADMAP.md`
- `reports/production_alpha_v0_50_candidate.md`
- `reports/qa/v0_50_alpha_candidate_qa.md`
- `reports/playtests/v0_50_persona20_playtest.md`

## Blockers

- None known.

## Verification Evidence

- `npm test -- src/game/persona-playtest.test.ts src/game/qa-scenarios.test.ts`
  - Result: Passed
  - Output: 2 test files / 36 tests passed
- `npm run harness:gate`
  - Result: Passed
  - Output: 40 test files / 294 tests passed, data validation passed, production build passed
- `curl -I 'http://127.0.0.1:5201/?scenario=persona20'`
  - Result: Passed
  - Output: 200 OK
- `curl -I 'http://127.0.0.1:5201/?scenario=office-visuals'`
  - Result: Passed
  - Output: 200 OK

## Recommended Next Step

Start `v0.51-alpha-event-pose-sheets`: add cheer, alert, and card-use pose rows so office event reactions change actor body language as well as speech bubbles.

## Next Session

1. Read `AGENTS.md`.
2. Read `feature_list.json` and this `progress.md`.
3. Run `./init.sh` if dependencies and environment are ready.
4. Pick the current feature or follow the user's explicit request.
