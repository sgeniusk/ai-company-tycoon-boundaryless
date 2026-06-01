# Claude Handoff — AI Company Tycoon Commercial Polish

Date: 2026-06-01
Current branch: `main`
Current head before handoff-doc commit: `9236c96`

## Summary

Codex completed the current autonomous polish run through v0.95. The active product direction has shifted from adding more content to making the existing game look and feel like a commercial pixel-art management sim.

User priority:
- Keep pixel-art style consistent across the whole game.
- The game is turn-based, but the office foreground should look alive and comic, like a compact Kairosoft-style management scene.
- Fill graphics/assets and polish existing surfaces before adding more content.

## Recent Commits

- `8f14da7` — Make the turn controls read as a pixel console.
- `5513e95` — Make the office read as a comic pixel workloop.
- `9236c96` — Keep event panels from hiding the pixel office.

## v0.95 Evidence

QA report:
- `reports/qa/v0_95_event_sightline_run.md`

Tracked smoke:
- `scripts/qa/check-v095-event-sightline.mjs`

Screenshots:
- `reports/qa/screenshots/v0_95_event_sightline_desktop.png`
- `reports/qa/screenshots/v0_95_event_sightline_mobile.png`

Gate:
- `npm run harness:gate < /dev/null`
- PASS: 53 test files / 642 tests
- `validate:data`: PASS
- `qa:beta-readiness:check`: PASS, readiness 15/15, route coverage 4/4 axes and 40/40 options
- `build`: PASS
- Known warning: Vite still reports an existing >500 kB chunk warning.

## Files Changed In v0.95

- `src/App.tsx`
  - Adds `office-sightline-event-rail` to the event stack.
- `src/App.css`
  - Adds compact sightline-preserving event rail overrides.
  - Adds desktop pixel dialogue tail and mobile hiding rule.
- `src/ui/layout-contract.test.ts`
  - Adds v0.95 contract test for the sightline event rail.
- `scripts/qa/check-v095-event-sightline.mjs`
  - Reproducible browser smoke for office/event overlap.

## Active Roadmap

Read:
- `reports/v0_63_plus_content_roadmap.md` for shipped roguelike history and the 2026-06-01 status addendum.
- `reports/v0_96_plus_commercial_polish_roadmap.md` for the next active plan.

Recommended next block:
- v0.96 First-Screen Composition Pass.
- Keep it visual-only.
- Start with a RED layout contract.
- Use browser smoke on `?scenario=office-visuals`.
- Gate with `npm run harness:gate < /dev/null`.

## Constraints

- Preserve determinism.
- Avoid simulation/tick/save rewrites for visual polish blocks.
- Keep contract files untouched unless the user explicitly asks otherwise.
- Prefer derive-only/additive visual work and existing CSS/React patterns.
- Keep mobile usable and reduced-motion covered.

## Claude Prompt

```text
You are Claude, taking over planning/verification for AI Company Tycoon: Boundaryless.

Workspace: /Users/taewookkim/Downloads/ai-company-tycoon/worktree-main
Secondary sync dir: /Users/taewookkim/dev/ai-company-tycoon
Current target: commercial pixel-art polish, not new content bulk.

Start by reading:
1. AGENTS.md
2. reports/v0_63_plus_content_roadmap.md
3. reports/v0_96_plus_commercial_polish_roadmap.md
4. reports/codex-handoff/v0_95_session_end_claude_handoff.md
5. reports/qa/v0_95_event_sightline_run.md

Current shipped polish commits:
- 8f14da7 v0.93 command console
- 5513e95 v0.94 office comic workloops
- 9236c96 v0.95 event sightline rail

User direction:
- Keep the whole game visually consistent as pixel art.
- The game is turn-based, but the office scene must stay alive and comic, like a compact Kairosoft-style management sim.
- Prioritize existing-game polish and graphics/assets over more content.

Next recommended block:
v0.96 First-Screen Composition Pass.
- Visual-only.
- Protect the office playfield.
- TDD-first with layout-contract RED/GREEN.
- Add or reuse browser smoke for desktop/mobile first viewport.
- Run npm run harness:gate < /dev/null.
- Write reports/qa/v0_96_* evidence.
- Commit with Lore protocol and push.

Do not restart the old v0.63 roguelike queue. Treat it as shipped history.
```
