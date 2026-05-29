# CLAUDE.md - Claude Code Handoff

This repo is `AI Company Tycoon: Boundaryless`, a Vite + React + TypeScript browser game.

## Read First

1. `AGENTS.md` is the authoritative operating contract.
2. Then read `progress.md`, `feature_list.json`, `docs/SESSION_HANDOFF.md`, and `session-handoff.md`.
3. Check `git status --short` before editing. The worktree is expected to be dirty; do not reset, revert, or overwrite unrelated changes.

## Current Objective

- Current version: `v0.58-alpha` (closed; entering `v0.59-alpha`)
- Current feature: `v0.59-alpha-resource-visibility` (completed 2026-05-29 — Recursive-style derive-only AI resource indicators in the research panel)
- Track allocation (2026-05-29): v0.59 coded by Codex CLI (gpt-5.5, xhigh) per `reports/codex-handoff/v0_59_resource_visibility.md`; Claude Code owned the harness/contract track, gate verification, and the closeout commit.
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
- v0.59 closed at 43 files / 417 tests. Coded by Codex CLI; new `src/game/resource-visibility.ts` pure helper; `simulation.ts` / `types.ts` empty diff (derive-only). Verified + committed by Claude Code.

## Next Useful Work

1. Pick the next milestone — v0.60-alpha boundaryless industry expansion, or v0.57 P2 Track C Phase 2 mobile polish backlog. Update `feature_list.json` current_feature_id before coding.
2. Run `npm run harness:gate` as the baseline (43 files / 417 tests) before changes.
