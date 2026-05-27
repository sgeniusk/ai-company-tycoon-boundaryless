# CLAUDE.md - Claude Code Handoff

This repo is `AI Company Tycoon: Boundaryless`, a Vite + React + TypeScript browser game.

## Read First

1. `AGENTS.md` is the authoritative operating contract.
2. Then read `progress.md`, `feature_list.json`, `docs/SESSION_HANDOFF.md`, and `session-handoff.md`.
3. Check `git status --short` before editing. The worktree is expected to be dirty; do not reset, revert, or overwrite unrelated changes.

## Current Objective

- Current version: `v0.57-alpha` (entering `v0.58-alpha`)
- Current feature: `v0.58-alpha-market-season-strength` (in progress — Track A: market share visualization)
- Track allocation (2026-05-27): Track A (Claude Code direct), Track B (AGY 5x automation, Codex CLI), Track C (v0.57 P2 mobile backlog, Codex CLI). Handoff prompts in `reports/codex-handoff/`.
- Working directory: `/Users/taewookkim/dev/ai-company-tycoon`.

## Validation Policy (Updated 2026-05-26)

- v0.56 blind playtest slice closed. AGY 5x agent review and 5x real human blind sessions are P2 follow-up tracks, not blockers for v0.57+.
- v0.57 core fun polish closed at `6761c00 v0.57 closeout` (43 files / 410 tests).
- `qa:asset-handoff` still gates final art request — it must report `AGY 발송 가능` before sending art work to vendors. That gate stays `대기` until Track B (AGY 5x automation) lands.

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
- `http://127.0.0.1:5201/?scenario=reward` (rare/epic badge differentiation)
- `http://127.0.0.1:5201/?scenario=year-two-plan` (year-two kickoff entry animation + next-30min arrow flow)
- `http://127.0.0.1:5201/?scenario=deck-result` (release progress meter inside issue result ribbon)

## Latest Evidence

- Pre-v0.58 baseline (2026-05-27): `npm run harness:gate` passed with 43 files / 410 tests, data validation, and production build in 806ms.
- v0.57 closed at 43 files / 410 tests via `6761c00 v0.57 closeout`.
- Codex CLI handoff prompts for Track B/C live in `reports/codex-handoff/` and reference `AGENTS.md` + `CLAUDE.md` as required reads.

## Next Useful Work

1. Track A v0.58 #1 — `src/components/MarketSharePanel.tsx` (new) + `src/components/GameChrome.tsx` mount + `src/App.css` styles + `?scenario=market-share` registration + one layout-contract `it` block. Derive-only; sparkline deferred to v0.58 #2.
2. After Track A commit — hand Track B (AGY 5x automation) and Track C (P2 mobile backlog collection) off to Codex CLI using prompts in `reports/codex-handoff/`.
3. v0.58 #2 candidate — add `marketShareHistory` tracking to `simulation.ts` + sparkline visualization.
4. `npm run harness:gate` target after Track A — 43 files / 411 tests.
