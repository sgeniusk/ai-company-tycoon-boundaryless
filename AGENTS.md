# AGENTS.md - AI Company Tycoon: Boundaryless

This is the root startup contract for coding agents. Keep it short, follow it before touching code, and use the linked docs for detail.

## Startup Workflow

Before writing code:

1. Read `progress.md` for the current state, current objective, blockers, and latest verification evidence.
2. Read `feature_list.json` and pick only the feature marked as current or explicitly requested by the user.
3. Read only the relevant slice of project docs:
   - `docs/ROADMAP.md`
   - `docs/QA_SCENARIOS.md`
   - `docs/ACCEPTANCE_CRITERIA.md`
   - `docs/SESSION_HANDOFF.md`
4. Read `docs/CHANGELOG.md` only when you need version history or release notes; otherwise use `progress.md`.
5. Check `git status --short` and do not overwrite unrelated user changes.
6. For UI work, use the QA scenario that matches the feature, usually `?scenario=office-visuals`.

## Context Budget

Keep startup context lean:

- Treat `AGENTS.md`, `feature_list.json`, and `progress.md` as the mandatory startup set.
- Prefer the first 120-180 lines of large docs before reading deeper.
- Read reports, screenshots, and long changelog history only for the feature you are actively touching.
- Keep `progress.md` under about 1,000 words and `feature_list.json` to current, next, and recently completed items.
- Move detailed evidence to `reports/` and leave only summaries plus paths in root state files.

## Current Source Of Truth

- Current version: `v0.96-alpha` (closed at `d11eb13`); entering `v0.97-alpha`
- Current feature: `v0.97-alpha-pixel-art-consistency-sweep` (in progress) — pixel-token consistency + a desktop resource-HUD redesign so pixel icons/deltas return without overflow (carried from v0.96). Roguelike v0.63–v0.67 and commercial polish v0.68–v0.95 shipped (history in git + reports/). Baseline 53 files / 643 tests. Active roadmap: reports/v0_96_plus_commercial_polish_roadmap.md.
- Current stack: Vite + React + TypeScript
- Working directory: `/Users/taewookkim/dev/ai-company-tycoon` (moved from Downloads on 2026-05-26)
- Main gate: `npm run harness:gate`
- Local dev: `npm run dev -- --port 5201`
- Asset generation: `npm run assets:v054`
- Screenshot QA: `npm run qa:office-visuals:screenshots`
- QA URL: `http://127.0.0.1:5201/?scenario=office-visuals`
- Persona QA URL: `http://127.0.0.1:5201/?scenario=persona20`
- State tracker: `feature_list.json`
- Restart log: `progress.md`
- Human-readable handoff: `docs/SESSION_HANDOFF.md` and root `session-handoff.md`

## Validation Policy (Updated 2026-05-29)

- v0.56 blind playtest slice is closed (validation policy upgrade 2026-05-26). AGY 5x agent review and 5x real human blind sessions are P2 follow-up tracks, not milestone blockers.
- v0.57 core fun polish (`v0.57-alpha-core-fun-polish`) closed 2026-05-27 via 9 `#N` commits + 4 P1 polish commits; harness:gate carried 43 files / 410 tests at closure.
- v0.58 market season strength (`v0.58-alpha-market-season-strength`) closed 2026-05-29 across 5 derive-only/queue-only blocks + a closeout commit; harness:gate carried 43 files / 415 tests at closure.
- AGY 5x agent review automation (v0.57 P2 Track B, commit `91788a2`) landed, so `npm run qa:asset-handoff` now reports `AGY 발송 가능` and final source art intake is unlocked.
- Coding agents downstream of this contract (Claude Code as harness, Codex CLI for parallel implementation, AGY CLI for art/playtest) share this validation contract.

## Verification Commands

Run the narrowest useful checks while developing, then run the full gate before claiming done.

```bash
npm test
npm run validate:data
npm run build
npm run qa:office-visuals:screenshots
npm run harness:gate
```

`./init.sh` is the restartable one-command harness check. It fails fast and ends by running `npm run harness:gate`.

## One Feature At A Time

Work on one feature at a time unless the user explicitly asks for parallel work. Stay in scope:

- Use `feature_list.json` for feature status, dependencies, done criteria, and next step.
- Do not start a new milestone while P0/P1 issues from the current milestone remain unresolved.
- Keep tunable game content in JSON data files when feasible.
- Keep `GameState` as the source of truth for gameplay state.
- Record deferred P2/P3 issues in reports or `progress.md`.

## Definition Of Done

A change is done only when:

1. The requested behavior is implemented.
2. Relevant tests or validation commands pass.
3. `npm run harness:gate` passes, or the reason it could not run is documented.
4. Changelog, acceptance criteria, QA/report files, and progress state are updated when the change affects a milestone or harness behavior.
5. Verification Evidence includes command names and summarized output.
6. The next recommended step is clear.

## Reporting

- Write user-facing reports in Korean by default.
- Production reports live in `reports/production_<version_topic>.md`.
- QA reports live in `reports/qa/`.
- Playtest reports live in `reports/playtests/`.
- Balance reports live in `reports/balance/`.
- Detailed review roles and gates live in `docs/AGENT_REVIEW_PROTOCOL.md` and `docs/skills/ai-game-dev-harness/SKILL.md`.

## End Of Session

Before ending:

1. Update `progress.md` with Last Updated, Current Objective, Files, Blockers, Verification Evidence, and Recommended Next Step.
2. Update `feature_list.json` feature status/evidence if the active feature changed.
3. Update `docs/SESSION_HANDOFF.md` if the current version, commit, QA entry point, or next milestone changed.
4. Leave the project restartable from a clean checkout plus `./init.sh`.
