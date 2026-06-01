# Progress - AI Company Tycoon: Boundaryless

Last Updated: 2026-06-02

## Current State

- Current version: `v0.99-alpha` (closed); RC prep — `v1.0-beta-rc` (in progress, USER-GATED)
- Current feature: `v1.0-beta-rc` — freeze a coherent playable build for user review (deploy, final art, real-human playtest are user-gated). Awaiting user direction.
- Latest commit: `ab4e8cc` (v0.99 build readiness). Branch `main`, synced with `origin/main`.
- Stack: Vite + React + TypeScript
- Local dev: `npm run dev -- --port 5201`; preview built dist: `npm run preview -- --port 5223`
- Main QA route: `http://127.0.0.1:5201/?scenario=office-visuals`
- Full gate: `npm run harness:gate < /dev/null` (baseline 53 files / 648 tests)
- Smoke index: `reports/qa/SMOKE_INDEX.md`

## Shipped this session (commercial polish v0.96-v0.99; detail in git + reports/qa/)

- v0.96 first-screen composition (`d11eb13`) — office-dominant stage + event-rail overlay locked, crowding guard, first-viewport smoke.
- v0.97 pixel consistency — #1 desktop resource-HUD redesign (`4d0978b`), #2 pixel token unification radius+motion (`ba5b0b0`).
- v0.98 interaction finish — #1 overlay dismiss affordance + reliability smoke (`c2e1503`), #2 Escape-to-dismiss + initial focus (`f2b503e`).
- v0.99 build readiness (`ab4e8cc`) — game-logic manualChunk (entry 505->202 kB, chunk warning gone), SMOKE_INDEX.md.
- Earlier tracks (roguelike v0.63-v0.67, polish v0.68-v0.95) in git + reports/.

## RC Readiness (v1.0-beta gate)

- Clean main, pushed + synced with origin. ✅
- `npm run harness:gate` PASS (53 files / 648 tests, build clean, no chunk warning). ✅
- Desktop/mobile smoke screenshots in `reports/qa/screenshots/`. ✅
- Remaining (USER-GATED): deploy to Vercel, request final source art (`docs/ANTIGRAVITY_ART_BRIEF.md`; gate `npm run qa:asset-handoff`), real-human blind playtest, short release report.

## Blockers / Notes

- None blocking. Codex CLI sandbox blocks Chromium localhost (`ERR_ACCESS_DENIED`) and may hang on a spawned dev server — hand Codex CSS/TSX + unit tests only; Claude runs the browser smokes (see SMOKE_INDEX.md).

## Verification Evidence

- v0.96 `d11eb13` gate 53/643; v0.97 `4d0978b` 53/644, `ba5b0b0` 53/645; v0.98 `c2e1503` 53/646, `f2b503e` 53/647; v0.99 `ab4e8cc` 53/648 (entry chunk 202 kB, no >500 kB warning, dist smokes pass). All visual/additive — simulation.ts/types.ts/data unchanged across the v0.96-v0.99 polish track.

## Recommended Next Step

USER CHECKPOINT — v1.0-beta/RC is a freeze-for-review milestone. Options: (a) deploy current main to Vercel + write the release report; (b) request final source art (resolution up) per `docs/ANTIGRAVITY_ART_BRIEF.md`; (c) more polish (e.g. deferred v0.97 gradient flattening, focus-restoration follow-up). Awaiting direction.

## Next Session Start

1. Read `AGENTS.md`, `feature_list.json`, this file.
2. Check `git status --short`.
3. Run `npm run harness:gate` baseline (53 files / 648 tests).
4. v1.0-beta/RC is user-gated — confirm direction before deploy/final-art.
