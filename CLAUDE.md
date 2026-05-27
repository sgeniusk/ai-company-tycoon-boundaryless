# CLAUDE.md - Claude Code Handoff

This repo is `AI Company Tycoon: Boundaryless`, a Vite + React + TypeScript browser game.

## Read First

1. `AGENTS.md` is the authoritative operating contract.
2. Then read `progress.md`, `feature_list.json`, `docs/SESSION_HANDOFF.md`, and `session-handoff.md`.
3. Check `git status --short` before editing. The worktree is expected to be dirty; do not reset, revert, or overwrite unrelated changes.

## Current Objective

- Current version: `v0.57-alpha`
- Current feature: `v0.57-alpha-core-fun-polish` (completed 2026-05-27)
- Next milestone: unselected — pick in the next session (candidates: `v0.58-alpha-market-season-strength`, P2 AGY/real-human playtest track, v0.57 P2 mobile backlog).
- Working directory: `/Users/taewookkim/dev/ai-company-tycoon`.

## Validation Policy (Updated 2026-05-26)

- v0.56 blind playtest slice closed. AGY 5x agent review and 5x real human blind sessions are P2 follow-up tracks, not blockers for v0.57+.
- v0.57 core fun polish closed across 9 `#N` polish commits + 4 P1 polish commits (latest `bc75b7d`).
- `qa:asset-handoff` still gates final art request — it must report `AGY 발송 가능` before sending art work to vendors. That gate stays `대기` until the P2 follow-up track lands.

## Do Not Unlock

- Do not request final graphic assets or send final art work to AGY/external vendors until `npm run qa:asset-handoff` reports final art request possible.
- Do not retroactively edit `reports/playtests/v0_56_blind_playtest_session_01.md` ~ `_05.md` unless filling them with a real AGY agent run output or a returned real-human session bundle imported via `qa:blind-intake`.

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
- `http://127.0.0.1:5201/?scenario=reward` (rare/epic badge differentiation)
- `http://127.0.0.1:5201/?scenario=year-two-plan` (year-two kickoff entry animation + next-30min arrow flow)
- `http://127.0.0.1:5201/?scenario=deck-result` (release progress meter inside issue result ribbon)
- `http://127.0.0.1:5201/?scenario=alpha-run-second-reward-picked`

## Latest Evidence

- Latest full gate (after v0.57 #9, 2026-05-27): `npm run harness:gate` passed with 43 files / 410 tests, data validation, and production build in 699ms.
- v0.57 #6 → #7 → #8 → #9 each added one layout-contract `it` block (407 → 408 → 409 → 410 tests).
- Card visual language consistent across launch-impact, reward-choice preview, and year-two next-flow via the shared `card-impact-arrow-pulse` keyframe with `prefers-reduced-motion` handling.

## Next Useful Work

1. Decide the next current feature before touching code; update `feature_list.json` accordingly.
2. If `v0.58-alpha-market-season-strength`, scope from `docs/ROADMAP.md` section 4 (rival presence, market share visualization, response cards, big event popup).
3. If P2 follow-up track, route AGY agent reviews through `reports/playtests/v0_56_blind_playtest_session_links.md` and rerun `npm run qa:asset-handoff` once 5/5 lands.
4. Codex CLI can take a parallel implementation task while Claude Code remains the harness.
