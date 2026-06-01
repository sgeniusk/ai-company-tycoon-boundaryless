# Session Handoff - AI Company Tycoon: Boundaryless

Last Updated: 2026-06-02

## Current State

- Current version: `v0.96-alpha` (closed at `d11eb13`); `v0.97-alpha-pixel-art-consistency-sweep` in progress.
- Branch `main`, synced with `origin/main`.
- Stack: Vite + React + TypeScript.
- Local dev: `npm run dev -- --port 5201`. Visual QA: `http://127.0.0.1:5201/?scenario=office-visuals`.
- First-screen smoke: `node scripts/qa/check-v096-first-screen.mjs http://127.0.0.1:5222/?scenario=office-visuals` (run by Claude; the Codex sandbox blocks Chromium localhost navigation).
- Full gate: `npm run harness:gate < /dev/null` (baseline 53 files / 643 tests).
- Entry docs: `AGENTS.md`, `feature_list.json`, `progress.md`, `CLAUDE.md`.

## Shipped Tracks (detail in git + reports/)

Roguelike v0.63-v0.67, commercial pixel-art polish v0.68-v0.95 (prior autonomous Codex sessions), v0.96 first-screen composition (this session, verified).

## v0.96 (verified, commit d11eb13)

Visual-only first-screen composition pass: a `first-screen-composition` marker + scoped `App.css` lock the office-dominant stage and the event-rail overlay, keep the five chrome surfaces distinct, and guard chrome text overflow. New first-viewport smoke `scripts/qa/check-v096-first-screen.mjs`. harness:gate 53 files / 643 tests; visual-only diff empty. Record: `reports/qa/v0_96_first_screen_run.md`.

Carried to v0.97: desktop pixel resource icons/deltas are compacted because the HUD layout is tight; restoring them needs a HUD layout redesign.

## Files

- `src/App.tsx`, `src/App.css` (`.app-shell.v034-game-shell.first-screen-composition`), `src/ui/layout-contract.test.ts`, `scripts/qa/check-v096-first-screen.mjs`, `package.json`.
- Roadmap: `reports/v0_96_plus_commercial_polish_roadmap.md`. Handoffs: `reports/codex-handoff/`.

## Recommended Next Step

`v0.97-alpha-pixel-art-consistency-sweep`. Write `reports/codex-handoff/v0_97_*.md`, TDD-first (layout-contract RED/GREEN). Priority: redesign the desktop resource HUD so pixel resource icons + deltas show without overflow (the first-screen smoke must stay exit 0); then broaden to pixel-token consistency (shadows, radii, stepped animations). Codex implements CSS + unit tests; Claude runs the browser smoke + verifies + commits.

## Next Session Start

1. Read `AGENTS.md`, `feature_list.json`, `progress.md`.
2. Check `git status --short`.
3. Run `npm run harness:gate` baseline (53 files / 643 tests).
4. Continue v0.97 from the roadmap + the v0.97 handoff.
