# Session Handoff - AI Company Tycoon: Boundaryless

Last Updated: 2026-05-20

## Current State

- Current version: `v0.52-alpha`
- Latest implementation commit: `20c6f38 Add v0.52 source sprite replacement pipeline`
- Current stack: Vite + React + TypeScript
- Local dev command: `npm run dev -- --port 5201`
- Asset generation: `npm run assets:v052`
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

- None known.

## Recommended Next Step

Start `v0.53-alpha-final-character-art-import`: replace the procedural v0.52 high-resolution source draft with final AI-generated or external pixel-art source art, regenerate the runtime sheet, and run screenshot-based office-visuals QA.

## Next Session

1. Read `AGENTS.md`, `feature_list.json`, and `progress.md`.
2. Confirm `git status --short`.
3. Start the requested feature only.
4. Before claiming done, run `npm run harness:gate` and update the relevant reports.
