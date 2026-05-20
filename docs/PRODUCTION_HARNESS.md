# Production Harness - AI Company Tycoon: Boundaryless

## Purpose

This production harness keeps the solo-dev game loop restartable for coding agents. It defines where state lives, how scope is chosen, which gates prove work, and what must be recorded before a milestone advances.

## Current Stack

- Runtime: Vite + React + TypeScript
- Game data: JSON files in `data/`
- Tests: Vitest
- Data validation: `scripts/harness/validate-data.mjs`
- Build: TypeScript + Vite production build
- Primary browser QA scenario: `?scenario=office-visuals`

Legacy Godot files remain as reference material only. New implementation work should target the Vite/React stack unless the user explicitly asks otherwise.

## Startup Workflow

Every new coding-agent session should start from the root harness files:

1. Read `AGENTS.md` for startup rules and Definition of Done.
2. Read `feature_list.json` for the current feature, dependencies, and done criteria.
3. Read `progress.md` for the current state, blockers, touched files, and latest verification evidence.
4. Read `docs/SESSION_HANDOFF.md`, `docs/ROADMAP.md`, `docs/CHANGELOG.md`, and `docs/QA_SCENARIOS.md` for project context.
5. Run `git status --short` before editing.

## One-Feature Scope Rule

Use one active feature at a time unless the user explicitly asks for a broader pass. The active feature must have:

- A stable id
- A plain-language scope statement
- Dependencies
- Status
- Definition of Done
- Verification evidence
- Next step

`feature_list.json` is the structured tracker. `progress.md` is the restart log.

## Quality Gates

Before advancing a feature or milestone:

1. Acceptance criteria for the version must be listed in `docs/ACCEPTANCE_CRITERIA.md`.
2. Relevant unit, data, layout, or simulation tests must pass.
3. `npm run validate:data` must pass for data/content changes.
4. `npm run build` must pass for UI/runtime changes.
5. `npm run harness:gate` must pass before claiming full completion.
6. Browser QA should be recorded for visible UI changes when tooling is available.
7. P0/P1 issues must be fixed or explicitly waived by the human owner.
8. Production/QA/playtest/balance reports must be updated when the change affects their area.

## Verification Commands

```bash
npm test
npm run validate:data
npm run build
npm run harness:gate
./init.sh
```

`./init.sh` is the restartable harness entrypoint. It installs dependencies only when `node_modules` is missing, then runs `npm run harness:gate`.

## Data-Driven Architecture

Prefer data files over hardcoded tunables for:

- Product names, costs, revenue, and requirements
- Card definitions, costs, effects, and tags
- Events, rival moves, and incident text/effects
- Upgrade values and unlock requirements
- Office zones, decor, sprites, and asset manifest entries
- Balance coefficients and simulation thresholds

Gameplay state should flow through `GameState` and typed simulation helpers rather than UI-only state.

## Report Requirements

For meaningful player-facing or harness milestones, update the relevant set:

- `docs/CHANGELOG.md`
- `docs/ACCEPTANCE_CRITERIA.md`
- `docs/SESSION_HANDOFF.md`
- `progress.md`
- `feature_list.json`
- `reports/production_<version_topic>.md`
- `reports/qa/<version_topic>_qa.md`
- `reports/playtests/<version_topic>_synthetic_playtest.md` when player feel changed
- `reports/balance/<version_topic>_balance.md` when economy changed

Reports should be Korean by default. Keep commands, code identifiers, and file paths in their original spelling when helpful.

## File Organization

```text
ai-company-tycoon/
├── AGENTS.md
├── feature_list.json
├── progress.md
├── session-handoff.md
├── init.sh
├── data/
├── docs/
├── public/
├── reports/
├── scripts/
│   ├── assets/
│   └── harness/
├── src/
└── tests/
```

## Lifecycle

At the end of a session:

1. Update `progress.md` with Last Updated, Current Objective, Files, Blockers, Verification Evidence, and Recommended Next Step.
2. Update `feature_list.json` status/evidence for the active feature.
3. Update `docs/SESSION_HANDOFF.md` if the version, commit, QA route, or next milestone changed.
4. Leave the project restartable from `AGENTS.md` plus `./init.sh`.
