# Progress - AI Company Tycoon: Boundaryless

Last Updated: 2026-06-05

## Current State

- Current version: `v1.0` track — `v1.0-office-first-menu-redesign` (in progress; **code-side RC polish + mobile hard-reset feedback redo complete**).
- Current feature: office-first menu popup redesign. First-screen shell #1-#5, mobile popup sheet/launcher, #6 shop/decor split, #7 log subtabs, #8 popup clarity/mobile/pixel polish, 2026-06-04 virtual beta P1 polish, 2026-06-05 standalone mobile restoration, top-scoreboard/click-speech-bubble pass, low-chrome redo, and follow-up mobile hard reset are implemented in the working tree.
- Latest commit: `a2836ac` (v1.0 completion plan + Codex handoffs). Branch `main`, synced with `origin/main`; current working tree also includes pre-existing QA screenshot diffs.
- Stack: Vite + React + TypeScript.
- Local dev: `npm run dev -- --port 5201`.
- Main gate: `npm run harness:gate`.
- Latest preview: `https://ai-company-tycoon-2g7zgvqcu-gomgomee-s-projects.vercel.app`.

## Key Reports

- RC polish QA: `reports/qa/v1_0_rc_polish_run.md`.
- Mobile chrome compression QA: `reports/qa/v1_0_mobile_chrome_compression_run.md`.
- Standalone mobile first-screen QA: `reports/qa/v1_0_mobile_standalone_first_screen_run.md`.
- Game-screen scoreboard/speech-bubble QA: `reports/qa/v1_0_game_screen_scoreboard_bubble_run.md`.
- Mobile feedback low-chrome redo QA: `reports/qa/v1_0_mobile_feedback_low_chrome_redo.md`.
- Mobile hard-reset feedback redo QA: `reports/qa/v1_0_mobile_hard_reset_after_feedback.md`.
- Virtual beta playtest: `reports/playtests/virtual_beta_2026_06_04/report.md`.
- Master completion plan: `reports/v1_0_completion_plan.md`.
- Approved menu design: `reports/v1_0_menu_uiux_design_review.md`.

## What Changed

- First 5 minutes: product/shop/deck popups now lead with recommended action briefs, blockers, and next steps before deep catalogs.
- Finale: final states now open a campaign result/payoff report and suppress early-game tutorial/helper signals in late-game/finale QA routes.
- Rival/world causality: competition, counter cards, campaign shocks, big-event, and world reveal surfaces now explain why pressure changed, next threat, and recommended response.
- Office/mobile decision focus: office scene carries persistent product/reward/strategy/directive/rival/crisis markers; reward/growth/event choices get `decision-primary` mobile emphasis; `reward-picked` next-action opens the growth decision layer in viewport.
- Mobile first screen: after two rounds of user feedback that the UI still looked button-heavy and messy, the mobile first screen was hard-reset to a sparse game view: a 250x42 in-world LED board, office floor, bottom dock (`운영/회사/성장/메뉴`), central 78px next-action FAB, and click-triggered actor speech bubbles. Top brand/resources, goal chip, decor chip, helper tutorial, office labels, workbeat labels, and task links are hidden on the default mobile first screen.
- Numeric formatting: raw float tails are removed from effect text, monthly deltas, rival momentum alerts, and staff poaching stakes labels.

## Verification Evidence

- `npm test -- src/ui/formatters.test.ts --maxWorkers=1`: 1/1 passed.
- `npm test -- src/ui/layout-contract.test.ts -t "v1.0 rc" --maxWorkers=1`: 5 targeted tests passed.
- `npx tsc --noEmit --pretty false`: passed.
- `npm test -- src/ui/layout-contract.test.ts -t "v1.0" --maxWorkers=1`: 15 targeted v1.0 tests passed after mobile chrome compression contract update.
- Browser/mobile smoke for standalone first screen at 390x844: office scene 390x844 / visible fraction 1.000, horizontal overflow 0, `더보기` does not overlap launch LED, duplicate alpha/turn/rival strips display none, drawer opens with `제품/덱/에이전트/연구/상점/경쟁/기록`.
- Browser/CDP mobile 390x844 smoke after hard reset: document scrollWidth 390, scoreboard 250x42 at x=70/y=34, dock x=10/y=772/w=370/right=380, bottom menu button x=307/w=67/right=373, command FAB x=156/w=78, visible helper/goal/decor/workbeat/task-link/labels 0, dock text `운영/회사/성장/메뉴`.
- Screenshot evidence: `reports/qa/screenshots/v1_0_mobile_hard_reset_after_feedback_2.png`; previous low-chrome/game-scoreboard screenshots kept for comparison.
- `npm test -- src/ui/layout-contract.test.ts -t "v1.0" --maxWorkers=1`: 15 passed / 125 skipped. `npm run build`: passed.
- `npm run harness:gate`: passed after the hard-reset feedback redo — 54 files / 665 tests, data validation passed, beta readiness 15/15, route coverage 40/40, production build passed.

## Remaining

1. **RC track (USER-GATED)** — production promote (`vercel deploy --prod`), final source art (`npm run qa:asset-handoff`), real-human playtest, v1.0 release report/tag.
2. Optional visual archive step — intentionally regenerate desktop/mobile popup screenshots if updated screenshot artifacts are wanted. Existing `reports/qa/screenshots/v1_0_menu_popup_*.png` diffs were preserved.

## Workflow / Blockers

- No known P0/P1 code blockers after RC polish.
- All major RC polish work stayed UI/formatting focused; no new simulation system was added.
- Dev server may be running on port 5201 for local smoke.

## Recommended Next Step

Review the mobile game-screen first screen locally at `http://127.0.0.1:5201/`: sparse office view, 250x42 in-world scoreboard, bottom dock labels `운영/회사/성장/메뉴`, central next-action FAB, and actor click speech bubble. If accepted, proceed with the user-gated RC track: production deploy, final art handoff, real-human playtest, release report/tag.

## Next Session Start

1. Read `AGENTS.md`, `feature_list.json`, and this file.
2. Check `git status --short`; preserve pre-existing screenshot diffs.
3. Run the narrow check needed for the next gate, or `npm run harness:gate` before release-facing claims.
