# AGENTS.md - AI Company Tycoon: Boundaryless

This is the root startup contract for coding agents. Keep it short, follow it before touching code, and use the linked docs for detail.

## Startup Workflow

Before writing code:

1. Read `progress.md` for the current state, current objective, blockers, and latest verification evidence.
2. Read `feature_list.json` and pick only the feature marked as current or explicitly requested by the user.
3. Read the relevant project docs:
   - `docs/ROADMAP.md`
   - `docs/CHANGELOG.md`
   - `docs/QA_SCENARIOS.md`
   - `docs/ACCEPTANCE_CRITERIA.md`
   - `docs/SESSION_HANDOFF.md`
4. Check `git status --short` and do not overwrite unrelated user changes.
5. For UI work, use the QA scenario that matches the feature, usually `?scenario=office-visuals`.

## Current Source Of Truth

- Current version: `v0.54-alpha`
- Current stack: Vite + React + TypeScript
- Main gate: `npm run harness:gate`
- Local dev: `npm run dev -- --port 5201`
- Asset generation: `npm run assets:v054`
- QA URL: `http://127.0.0.1:5201/?scenario=office-visuals`
- Persona QA URL: `http://127.0.0.1:5201/?scenario=persona20`
- State tracker: `feature_list.json`
- Restart log: `progress.md`
- Human-readable handoff: `docs/SESSION_HANDOFF.md` and root `session-handoff.md`

## Verification Commands

Run the narrowest useful checks while developing, then run the full gate before claiming done.

```bash
npm test
npm run validate:data
npm run build
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
