# Progress - AI Company Tycoon: Boundaryless

Last Updated: 2026-06-02

## Current State

- Current version: `v0.97-alpha` (closed); entering `v0.98-alpha`
- Current feature: `v0.98-alpha-interaction-finish-pass` (in progress) — re-check modals/confirmations (milestone/reward/world-reveal dismissibility + no input traps), add focused overlay smoke checks, improve button affordance without tutorials.
- Latest commit: `ba5b0b0` (v0.97 #2 pixel tokens). Branch `main`, synced with `origin/main`.
- Stack: Vite + React + TypeScript
- Local dev: `npm run dev -- --port 5201` (QA smokes have used `:5222`)
- Main QA route: `http://127.0.0.1:5201/?scenario=office-visuals`
- Full gate: `npm run harness:gate < /dev/null` (baseline 53 files / 645 tests)

## Shipped Tracks (history in git + reports/, not repeated here)

- Roguelike v0.63-v0.67, commercial pixel-art polish v0.68-v0.95 (prior autonomous Codex sessions).
- v0.96 first-screen composition (`d11eb13`).
- v0.97 pixel-art consistency: #1 desktop resource-HUD redesign (`4d0978b`), #2 pixel token unification radius+motion (`ba5b0b0`). Gradient flattening deferred as optional. Active roadmap `reports/v0_96_plus_commercial_polish_roadmap.md`.

## Active Surfaces

- Overlays / dismiss paths (v0.98 target): `src/App.tsx` (offline-modal, helper-tutorial, world-reveal gate), `src/components/*Modal.tsx` (`BigEventModal`, `PayoffCelebrationModal`, `WorldRevealModal`), `MenuPanels.tsx`.
- First-screen composition: `src/App.tsx`, `src/App.css` (`.app-shell.v034-game-shell.first-screen-composition`; tokens `--pixel-radius`, `--pixel-steps`), `src/ui/layout-contract.test.ts`.
- QA: `scripts/qa/check-v096-first-screen.mjs`, `reports/qa/v0_96_*`, `reports/qa/v0_97_*`.

## Blockers / Notes

- None blocking. Codex CLI sandbox blocks Chromium localhost (`ERR_ACCESS_DENIED`) and may hang on a spawned dev server — hand Codex CSS/TSX + unit tests only; Claude runs the browser smoke + screenshots + gate.

## Verification Evidence

- v0.96 (`d11eb13`): gate 53/643; live first-viewport smoke desktop/mobile exit 0; visual-only.
- v0.97 #1 (`4d0978b`): gate 53/644; live verify desktop 8/8 resource icons + 8/8 deltas visible, overflow 0; mobile compaction preserved; visual-only.
- v0.97 #2 (`ba5b0b0`): gate 53/645; --pixel-radius (35) + --pixel-steps (19); preserve list intact (50% x8, 999px x4, asymmetric x5, reduced-motion x10); smoke no regression; visual-only. reports/qa/v0_97_block2_pixel_tokens_run.md.

## Recommended Next Step

`v0.98-alpha-interaction-finish-pass`. Audit the overlay dismiss paths (App.tsx modals + *Modal.tsx) for stuck-overlay / input-trap bugs, add a focused browser smoke that opens and dismisses each sensitive overlay (milestone/reward/world-reveal), and add regression tests. TDD-first. Codex does TSX/CSS + unit tests; Claude runs the browser smoke + verifies + commits.

## Next Session Start

1. Read `AGENTS.md`, `feature_list.json`, this file.
2. Check `git status --short`.
3. Run `npm run harness:gate` baseline (53 files / 645 tests) before changes.
4. Continue v0.98 from `reports/v0_96_plus_commercial_polish_roadmap.md` + the v0.98 handoff.
