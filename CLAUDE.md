# CLAUDE.md - Claude Code Handoff

This repo is `AI Company Tycoon: Boundaryless`, a Vite + React + TypeScript browser game.

## Read First

1. `AGENTS.md` is the authoritative operating contract.
2. Then read `progress.md`, `feature_list.json`, `docs/SESSION_HANDOFF.md`, and `session-handoff.md`.
3. Check `git status --short` before editing. The worktree is expected to be dirty; do not reset, revert, or overwrite unrelated changes.

## Current Objective

- Current version: `v0.58-alpha` (closed; entering `v0.59-alpha`)
- Current feature: `v0.65-alpha-difficulty-challenge` (in progress — player-chosen challenge tiers, tier-scaled monthly headwind + reward multiplier; tension-relief + open-challenge lever). Prior `v0.64-alpha-content-depth` COMPLETED 2026-05-30 (data-only — #1 4-axis expansion 600->9,504 combos, #2 world-events 12->26 themed; 47 files / 472 tests). `v0.63-alpha-roguelike-run-modifiers` COMPLETED 2026-05-30 (4 blocks). Master plan `reports/v0_63_plus_content_roadmap.md`; post-1.0 vision `reports/v0_62_design_direction.md`.
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
- v0.62 closed 2026-05-29 — dopamine polish, 3 blocks (`29c2dc9` activation celebration / `a115131` discovery+collection / #3 milestone+near-miss closeout), 44 files / 448 tests. §5-safe (block #2 added a save-migrated field, block #3 added 2 conservative achievements; no tick behavior change).
- v0.63 closed 2026-05-30 — roguelike run modifiers (first post-1.0 big system, §5 hold lifted by user decision), 4 blocks (`c50fe56` foundation / `be44e4e` world tick effects / `91a3710` yearly world-events / `e79c5ba` roll+reveal+closeout), 46 files / 466 tests. simulation.ts touches were only the additive run-modifier monthly-effect hook (#2) + the one applyDueWorldEvents line (#3); #4 had empty simulation.ts/types.ts diffs. v0.64 #1 (content depth) ran in parallel in an isolated git worktree.
- v0.64 closed 2026-05-30 — content depth (data-only roguelike variety), 2 blocks (`48a4231` 4-axis expansion 600->9,504 combos / #2 world-events 12->26 themed + closeout), 47 files / 472 tests. No code changes — run_modifiers.json/world_events.json/validate-data + tests only; run-modifiers.ts/simulation.ts/types.ts untouched. Block #1 was coded by Codex in a parallel worktree alongside v0.63 #4.

## Next Useful Work

1. Beta prep (parallel) — real-human blind playtest + final source art (resolution up; AGY 5x already done). Calendar-bound gates toward v1.0. `reports/v0_61_public_alpha_intro.md` has the shot-list.
2. Continue the roguelike track per `reports/v0_63_plus_content_roadmap.md` — v0.65 difficulty/challenge axis (in progress; handoff reports/codex-handoff/v0_65_block1_difficulty_foundation.md), then v0.66 tag-derivation engine (decision A), v0.67 multi-ending (decision B). v0.63 run modifiers + v0.64 content depth already shipped.
3. Run `npm run harness:gate` baseline (47 files / 472 tests) before changes.
