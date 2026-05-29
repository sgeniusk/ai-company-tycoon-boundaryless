# CLAUDE.md - Claude Code Handoff

This repo is `AI Company Tycoon: Boundaryless`, a Vite + React + TypeScript browser game.

## Read First

1. `AGENTS.md` is the authoritative operating contract.
2. Then read `progress.md`, `feature_list.json`, `docs/SESSION_HANDOFF.md`, and `session-handoff.md`.
3. Check `git status --short` before editing. The worktree is expected to be dirty; do not reset, revert, or overwrite unrelated changes.

## Current Objective

- Current version: `v0.58-alpha` (closed; entering `v0.59-alpha`)
- Current feature: `v0.61-alpha-public-web-alpha` (COMPLETED 2026-05-29 — stabilization, all 4 blocks: save/load hardening, all-strategy 10-year completability, tutorial + mobile UI, intro materials). Next is beta prep toward v1.0.
- Track allocation (2026-05-29): v0.61 — Codex CLI coded blocks #1 save/load + #2 completability (xhigh) and #3 tutorial/UI (fast/medium); Claude Code owned the harness/contract track, per-block verification, commits, and the docs block #4 directly. Handoffs in `reports/codex-handoff/v0_61_block*.md`.
- Working directory: `/Users/taewookkim/dev/ai-company-tycoon`.

## Validation Policy (Updated 2026-05-29)

- v0.56 blind playtest slice closed. AGY 5x agent review and 5x real human blind sessions are P2 follow-up tracks, not milestone blockers.
- v0.57 core fun polish closed at `6761c00 v0.57 closeout` (43 files / 410 tests).
- v0.58 market season strength closed at `645eb2c v0.58 closeout` (43 files / 415 tests).
- Track B (AGY 5x automation) landed at `91788a2`, so `npm run qa:asset-handoff` now reports `AGY 발송 가능` and final source art intake is unlocked.

## Do Not Unlock

- Do not request final graphic assets or send final art work to AGY/external vendors until `npm run qa:asset-handoff` reports final art request possible.
- Do not retroactively edit `reports/playtests/v0_56_blind_playtest_session_01.md` ~ `_05.md` unless filling them with a real AGY agent run output (Track B automation) or a returned real-human session bundle imported via `qa:blind-intake`.

## Useful Local Commands

```bash
npm run dev -- --port 5201
npm run harness:gate
npm run qa:blind-readiness
npm run qa:asset-handoff
```

Use targeted tests for touched code first, then run `npm run harness:gate` before claiming code completion.

## Useful QA Routes

- `http://127.0.0.1:5201/?scenario=fresh`
- `http://127.0.0.1:5201/?scenario=office-visuals`
- `http://127.0.0.1:5201/?scenario=market-share` (v0.58 #1 market share visualization, Track A)
- `http://127.0.0.1:5201/?scenario=resource-visibility` (v0.59 AI resource indicators, in progress via Codex)
- `http://127.0.0.1:5201/?scenario=reward` (rare/epic badge differentiation)
- `http://127.0.0.1:5201/?scenario=year-two-plan` (year-two kickoff entry animation + next-30min arrow flow)
- `http://127.0.0.1:5201/?scenario=deck-result` (release progress meter inside issue result ribbon)

## Latest Evidence

- v0.58 closed at 43 files / 415 tests via `645eb2c v0.58 closeout`.
- Pre-v0.59 baseline (2026-05-29): `npm run harness:gate` passed with 43 files / 415 tests, data validation, and production build in 715ms.
- v0.59 closed at `c89faae` — 43 files / 417 tests, derive-only resource indicators.
- v0.60 closed 2026-05-29 — 4 blocks (`7ca1dba` / `0da778a` / `fba35f1` + #4 closeout), 43 files / 428 tests. Only `simulation.ts` touch was 2 additive synergy/combo aggregation hooks.
- v0.61 closed 2026-05-29 — stabilization, 4 blocks (`60bf736` save/load / `4dda739` 10-year completability / `6b3e8de` tutorial+UI / #4 docs closeout), 43 files / 437 tests. No tick/balance changes.

## Next Useful Work

1. Beta prep — run the AGY 5x + real-human blind playtest cycles and import final source art (the calendar-bound gates that unlock v1.0). `reports/v0_61_public_alpha_intro.md` has the intro copy + screenshot shot-list (manual capture).
2. Optional post-1.0 depth idea (user raised 2026-05-29): tag-driven emergent combination engine + run modifiers, to make synergies/combos open-ended instead of hand-authored.
3. Run `npm run harness:gate` baseline (43 files / 437 tests) before changes.
