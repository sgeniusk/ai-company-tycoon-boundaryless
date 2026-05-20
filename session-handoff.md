# Session Handoff - AI Company Tycoon: Boundaryless

Last Updated: 2026-05-20

## Current State

- Current version: `v0.53-alpha`
- Latest implementation commit: `2dcd1e0 Add v0.53 character art import pipeline`
- Current stack: Vite + React + TypeScript
- Local dev command: `npm run dev -- --port 5201`
- Asset generation: `npm run assets:v053`
- Main visual QA URL: `http://127.0.0.1:5201/?scenario=office-visuals`
- Persona QA URL: `http://127.0.0.1:5201/?scenario=persona20`
- Full verification: `npm run harness:gate`

## Files

- Startup contract: `AGENTS.md`
- Feature tracker: `feature_list.json`
- Restart log: `progress.md`
- Detailed Korean handoff: `docs/SESSION_HANDOFF.md`
- Roadmap: `docs/ROADMAP.md`
- Changelog: `docs/CHANGELOG.md`
- QA scenarios: `docs/QA_SCENARIOS.md`

## Blockers

- Final external/AI-generated character artwork is still pending.
- Browser screenshot automation is unavailable in this environment because Playwright is not installed in the Node REPL runtime.

## Recommended Next Step

Start `v0.54-alpha-office-object-backdrop-art-import`: create import/normalization paths for office object sheets and the isometric office backdrop, then verify `office-visuals`.

## Next Session

1. Read `AGENTS.md`, `feature_list.json`, and `progress.md`.
2. Confirm `git status --short`.
3. Start the requested feature only.
4. Before claiming done, run `npm run harness:gate` and update the relevant reports.
