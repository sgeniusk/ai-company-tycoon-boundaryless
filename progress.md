# Progress - AI Company Tycoon: Boundaryless

Last Updated: 2026-06-03

## Current State

- Current version: `v1.0` track — `v1.0-office-first-menu-redesign` (in progress)
- Current feature: office-first menu popup redesign. First-screen shell DONE; popup-interior / 기록 / 꾸미기 / mobile / polish REMAINING.
- Latest commit: `dc615eb` (command-row clarity). Branch `main`, synced with `origin/main`.
- Stack: Vite + React + TypeScript
- Local dev: `npm run dev -- --port 5201`; preview built dist: `npm run preview -- --port 5223`
- Full gate: `npm run harness:gate < /dev/null` (baseline 53 files / 652 tests, no chunk warning)
- Smoke index: `reports/qa/SMOKE_INDEX.md` (Claude runs the browser smokes — Codex sandbox blocks Chromium localhost)
- Latest preview: `https://ai-company-tycoon-2g7zgvqcu-gomgomee-s-projects.vercel.app`

## Master plan

- Completion plan + remaining block queue: **`reports/v1_0_completion_plan.md`**
- Approved design: `reports/v1_0_menu_uiux_design_review.md`
- Earlier roadmap: `reports/v0_96_plus_commercial_polish_roadmap.md`

## Redesign blocks shipped (this session, detail in reports/qa/v1_0_block*_run.md)

- #1 `deb7c9d` — menu column removed → grouped bottom launcher + popup shell (MenuPopupModal, activePopupMenu, openMenu wrapper).
- #2 `64b5321` — stage-side → status popup, office full stage width, OfficeActionSlots+OperationCommandPanel → "다음 행동" chip, 꾸미기 office button.
- #3 `ecc48ed` — market suite → competition popup, top bar 224→147px (officeVisibleFraction 0.29→0.376).
- #4 `8c77563` — desktop "다음 달" label restored.
- #5 `dc615eb` — command 4 buttons labeled + strategy hand → deck popup + 손패 count badge (officeVisibleFraction → 0.403).
- (Earlier: v0.96–v0.99 commercial polish + v1.0-beta preview/release report `397ba67`.)

## REMAINING (Codex handoffs ready)

1. **Block 6** `reports/codex-handoff/v1_0_block6_decor_split.md` — split ShopPanel into 상점(buy) vs 꾸미기(office decoration) views.
2. **Block 7** `reports/codex-handoff/v1_0_block7_log_subtabs.md` — 기록 popup → 타임라인/도감/업적 subtabs.
3. **Block 8** `reports/codex-handoff/v1_0_block8_popup_polish_mobile.md` — popup-interior clarity sweep + mobile full-sheet + pixel polish + reduced-motion.
4. **RC track (USER-GATED)** — production promote (`vercel deploy --prod`), final source art (`qa:asset-handoff`), real-human playtest, v1.0 release report/tag.

## Workflow / Blockers

- None blocking. **Codex CLI sandbox blocks Chromium localhost and sometimes hangs at `phase: starting` (21–33 min seen this session).** Hand Codex CSS/TSX + unit tests ONLY; Claude runs all browser smokes + screenshots. If Codex hangs, cancel via the companion and have Claude implement directly.
- All redesign work is visual/additive — simulation.ts/types.ts/data unchanged.

## Recommended Next Step

Next session: pick up Block 6 (꾸미기/shop split) from its handoff. Drive Codex (medium, CSS/TSX+tests only) → Claude verifies on the live server (smokes in SMOKE_INDEX.md) → Lore commit → continue blocks 7, 8. Then surface the RC track to the user.

## Next Session Start

1. Read `AGENTS.md`, `feature_list.json`, this file, `reports/v1_0_completion_plan.md`.
2. `git status --short`; `npm run harness:gate` baseline (53 files / 652 tests).
3. Start Block 6 handoff. Codex codes CSS/TSX+tests; Claude runs browser smokes + commits.
