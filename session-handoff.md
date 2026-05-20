# Session Handoff - AI Company Tycoon: Boundaryless

Last Updated: 2026-05-20

## Current State

- Current version: `v0.51-alpha`
- Latest implementation commit: `d4f59a4 Add v0.51 office event pose sheets`
- Current stack: Vite + React + TypeScript
- Local dev command: `npm run dev -- --port 5201`
- Asset generation: `npm run assets:v051`
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

Start `v0.52-alpha-source-sprite-replacement`: replace the generated v0.51 event-pose draft sheet with AI-generated high-resolution pixel art while preserving the row contract and actor anchor checks.

## Next Session

1. Read `AGENTS.md`, `feature_list.json`, and `progress.md`.
2. Confirm `git status --short`.
3. Start the requested feature only.
4. Before claiming done, run `npm run harness:gate` and update the relevant reports.
