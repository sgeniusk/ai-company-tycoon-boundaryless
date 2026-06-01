# Progress - AI Company Tycoon: Boundaryless

Last Updated: 2026-06-02

## Current State

- Current version: `v0.96-alpha` (closed); entering `v0.97-alpha`
- Current feature: `v0.97-alpha-pixel-art-consistency-sweep` (in progress) — remove remaining generic web-app visual language, tighten pixel tokens, and redesign the desktop resource HUD so pixel resource icons + deltas return without overflow (carried from v0.96).
- Latest commit: `d11eb13` (v0.96 first-screen composition). Branch `main`, synced with `origin/main`.
- Stack: Vite + React + TypeScript
- Local dev: `npm run dev -- --port 5201` (QA smokes have used `:5222`)
- Main QA route: `http://127.0.0.1:5201/?scenario=office-visuals`
- Full gate: `npm run harness:gate < /dev/null` (baseline 53 files / 643 tests)

## Shipped Tracks (history in git + reports/, not repeated here)

- Roguelike track v0.63-v0.67 (run modifiers -> content depth -> difficulty -> tag-derivation engine -> multi-ending). See `reports/v0_63_plus_content_roadmap.md`.
- Commercial pixel-art polish v0.68-v0.95 (UI/brand/logo/reaction atlases, pixel office event ribbons, workbeats, objects, menu cabinet, command console, comic workloops, event sightline). Prior autonomous Codex sessions; not re-verified this session.
- v0.96 first-screen composition (this session, verified). `reports/v0_96_plus_commercial_polish_roadmap.md` is the active roadmap.

## v0.96 Summary (verified 2026-06-01, commit d11eb13)

Visual-only first-screen composition pass. `first-screen-composition` marker on the app shell + scoped `App.css` rules that lock the office-dominant stage, keep the event rail overlaying the office (shared `grid-area: stage`), keep the five chrome surfaces distinct, and guard chrome text from overflow. New first-viewport browser smoke `scripts/qa/check-v096-first-screen.mjs` (desktop/mobile). New `it("v0.96 ...")` block in `src/ui/layout-contract.test.ts` (RED->GREEN).

- Files: `src/App.tsx` (+marker), `src/App.css` (+117 scoped), `src/ui/layout-contract.test.ts` (+v0.96 contract), `package.json` (+`qa:v096-first-screen`), `scripts/qa/check-v096-first-screen.mjs` (new), `reports/qa/v0_96_first_screen_run.md`, `reports/codex-handoff/v0_96_first_screen_composition.md`, 2 screenshots.
- Codex implemented (medium); Claude verified independently on the live dev server (Codex sandbox can only render the `dist` fallback - see Blockers).
- Carried to v0.97: desktop pixel resource icons/deltas are compacted (hidden) because the HUD layout is tight (restoring them on desktop caused 18 overflows incl. truncated resource values). Needs a HUD layout redesign.

## Files (v0.96 + v0.97 surfaces)

- First-screen composition: `src/App.tsx`, `src/App.css` (`.app-shell.v034-game-shell.first-screen-composition` + base breakpoints at `@media (max-width: 1100px/900px/700px)`), `src/ui/layout-contract.test.ts`
- Resource HUD (v0.97 target): `src/components/GameChrome.tsx` (`ResourceStrip` ~L505, `.resource-tile`/`.resource-icon`/`.resource-delta`; `CommandRow` `.command-action`)
- QA: `scripts/qa/check-v096-first-screen.mjs`, `reports/qa/v0_96_first_screen_run.md`
- Roadmap/handoff: `reports/v0_96_plus_commercial_polish_roadmap.md`, `reports/codex-handoff/`

## Blockers / Notes

- None blocking. Codex CLI runs in a sandbox that blocks Chromium localhost navigation (`ERR_ACCESS_DENIED`), so Codex cannot run the browser smokes itself and may hang on a spawned dev server. Hand Codex CSS + unit tests only; Claude runs the browser smoke + screenshots.

## Verification Evidence

- v0.96 (`d11eb13`): `npm run harness:gate < /dev/null` PASS - 53 files / 643 tests, validate:data, beta-readiness 15/15, build 1.33s. Live first-viewport smoke desktop/mobile exit 0, surface overflow 0, office fraction 0.26/0.246, 6 actors, office uncovered. Visual-only diff (`simulation.ts`/`types.ts`/`data/`) empty. Full record in `reports/qa/v0_96_first_screen_run.md`.

## Recommended Next Step

`v0.97-alpha-pixel-art-consistency-sweep`. Write `reports/codex-handoff/v0_97_*.md`, TDD-first with a layout-contract RED/GREEN. Priority item: redesign the desktop resource HUD so pixel resource icons + deltas show without overflow (the first-viewport smoke must stay exit 0). Then broaden to pixel-token consistency (shadows, radii, stepped animations) per the roadmap. Codex implements CSS + unit tests; Claude runs the browser smoke + verifies + commits.

## Next Session Start

1. Read `AGENTS.md`, `feature_list.json`, this file.
2. Check `git status --short` (expect clean on `main` unless mid-v0.97).
3. Run `npm run harness:gate` baseline (53 files / 643 tests) before changes.
4. Continue v0.97 from `reports/v0_96_plus_commercial_polish_roadmap.md` + the v0.97 handoff.
