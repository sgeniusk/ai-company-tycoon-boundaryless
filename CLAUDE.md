# CLAUDE.md - Claude Code Handoff

This repo is `AI Company Tycoon: Boundaryless`, a Vite + React + TypeScript browser game.

## Read First

1. `AGENTS.md` is the authoritative operating contract.
2. Then read `progress.md`, `feature_list.json`, `docs/SESSION_HANDOFF.md`, and `session-handoff.md`.
3. Check `git status --short` before editing. The worktree is expected to be dirty; do not reset, revert, or overwrite unrelated changes.

## Current Objective

- Current version: `v0.55-alpha`
- Current objective: `v0.56-alpha-playtest-slice-lock`
- Goal: close the 20-30 minute pre-art web alpha slice with AGY agent verification (5 sessions) so v0.57 core fun work can start.
- Current playable slice: first-screen AI company fantasy, first hire, first product, first development issue, first launch, first reward/growth, annual review, year-two directive/research/product candidate, second product issue/launch/reward, and alpha-run debrief.
- New cwd (2026-05-26): `/Users/taewookkim/dev/ai-company-tycoon` (moved out of Downloads).

## Validation Policy (Updated 2026-05-26)

- Blind playtest slice is validated by **AGY agent reviews**, not real human sessions, per user decision on 2026-05-26.
- Five session files (`reports/playtests/v0_56_blind_playtest_session_01.md` ~ `_05.md`) are filled with AGY agent runs; the 테스터 프로필 row MUST start with `AGY agent` and name the scenario focus.
- Real human playtests remain a P2 follow-up track and do not block v0.57 entry.
- `qa:asset-handoff` still gates the final art request — it must report `AGY 발송 가능` before sending art work to vendors.

## Do Not Unlock

- Do not request final graphic assets or send final art work to AGY/external vendors until `npm run qa:asset-handoff` reports final art request possible.
- Do not edit session files with anything other than a real AGY agent run output; each `Status: 완료` must be backed by either an AGY agent transcript in this repo or a returned real-human session bundle imported via `qa:blind-intake`.
- Do not skip P0 findings raised by AGY agent runs. Close them before claiming v0.56 done.

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
- `http://127.0.0.1:5201/?scenario=alpha-run-second-reward-picked`
- `http://127.0.0.1:5201/?playtest=v056&session=1`

## Latest Evidence

- Latest full gate passed in new cwd (2026-05-26): 43 test files / 406 tests, data validation, production build (738ms).
- Latest alpha-run/debrief focused check passed: `npm test -- src/game/guidance.test.ts src/game/qa-scenarios.test.ts src/ui/layout-contract.test.ts`, 3 files / 123 tests.
- Validation policy upgraded 2026-05-26: AGY agent reviews now formally count as v0.56 blind validation.

## Next Useful Work

1. Run 5 AGY agent reviews covering: first 10 minutes, first launch, card impact, year-two new product, 30-minute alpha-run debrief.
2. Fill `reports/playtests/v0_56_blind_playtest_session_01.md` ~ `_05.md` with each review, declaring `AGY agent` in the 테스터 프로필 row.
3. Run `npm run qa:blind-summary`, `npm run qa:blind-issues`, then `npm run qa:asset-handoff`.
4. Close any P0 findings, then proceed to v0.57 core-fun work (Codex CLI can take parallel implementation tasks).
