# Session Handoff - AI Company Tycoon: Boundaryless

Last Updated: 2026-05-21

## Current State

- Current version: `v0.55-alpha`
- Latest implementation commit: `fb0a6fc Add v0.55 office visuals screenshot QA`
- Current stack: Vite + React + TypeScript
- Local dev command: `npm run dev -- --port 5201`
- Asset generation: `npm run assets:v054`
- Screenshot QA: `npm run qa:office-visuals:screenshots`
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

- Final external/AI-generated character, office object, and backdrop artwork is still pending.
- Playwright is unavailable in the Node REPL runtime, but v0.55 uses local headless Chrome for screenshot QA.
- The mobile bottom strategy hand clipping found in v0.55 screenshots is fixed; final-art replacement still needs a fresh screenshot comparison.

## Recommended Next Step

Continue `v0.55-alpha-final-source-art-screenshot-qa`: screenshot QA is implemented; next replace draft source candidates with actual final art through the import commands, then rerun desktop/mobile screenshot comparison.

## Next Session

1. Read `AGENTS.md`, `feature_list.json`, and `progress.md`.
2. Confirm `git status --short`.
3. Start the requested feature only.
4. Before claiming done, run `npm run harness:gate` and update the relevant reports.
