# Progress - AI Company Tycoon: Boundaryless

Last Updated: 2026-05-29

## Current State

- Current version: `v0.61-alpha` (closed); beta prep next toward v1.0
- Current feature: `v0.61-alpha-public-web-alpha` (COMPLETED 2026-05-29; stabilization — all 4 blocks shipped). Next is beta prep toward v1.0.
- Latest implementation commits: `v0.61 #1 save/load hardening` (this commit), `2f07287 v0.60 #4 + closeout`, `fba35f1 v0.60 #3`, `0da778a v0.60 #2`, `7ca1dba v0.60 #1`, `c89faae v0.59 resource visibility`
- Current branch: `main`
- Stack: Vite + React + TypeScript
- Local dev: `npm run dev -- --port 5201`
- Main QA route: `http://127.0.0.1:5201/?scenario=office-visuals`
- Other QA routes: `?scenario=market-share`, `?scenario=big-event`, `?scenario=resource-visibility`, `?scenario=physical-industries`
- Full verification gate: `npm run harness:gate` (current baseline 43 files / 431 tests)

## Current Objective

`v0.61-alpha-public-web-alpha` is **COMPLETE** as of 2026-05-29 — the accumulated v0.56-v0.60 build is now a publicly testable web alpha. No new large systems (ROADMAP §5); this milestone hardened rather than built. Codex CLI coded blocks #1 save/load and #2 completability (xhigh) and #3 tutorial/UI (fast/medium); Claude Code owned the harness/contract track, per-block verification, and the docs block #4 directly. Next is beta prep (blind playtest + final art) toward v1.0.

Block status (4 blocks):

- #1 save/load migration hardening — DONE 2026-05-29 (this commit). +257 test lines in `save-integrity.test.ts` (late-game round-trip, legacy-save migration, malformed-capability hydration, offline settlement); `hydrateGameState` gains `sanitizeCapabilityMap` (clamps each capability to `[0,max_level]`, defaults missing) — a real raw-merge gap fix. SAVE_VERSION kept at 11 with rationale. Tick logic untouched. Gate 43 files / 431 tests.
- #2 10-year campaign completability — DONE 2026-05-29 (this commit). All 3 growth-path strategies complete to month 120 (success/integrity/finale/10 reviews); `evaluateAlphaReadiness` now requires all strategies (stricter); code_vision_lab auto-play exercises the v0.60 physical industries; stale versionTarget labels refreshed. simulation.ts tick untouched (changes in run-simulator.ts harness only). Gate 433 tests.
- #3 tutorial flow cleanup + UI-break audit — DONE 2026-05-29 (this commit). Reordered the 8-step tutorial (product_ideas now after the launch reward) + locked invariants; added mobile 390x844 contracts for the v0.60 physical-industries/synergy/combo UI + a minimal App.css overflow fix. simulation.ts + save path untouched. Gate 437 tests. (Pixel screenshot QA = manual follow-up.)
- #4 intro copy + report refresh — DONE 2026-05-29 (this commit, Claude Code direct). Refreshed reports/v0_60_status_and_promo.html to v0.61 + wrote reports/v0_61_public_alpha_intro.md (intro copy + screenshot shot-list). Screenshots = manual follow-up.

Recent milestone history — `v0.60-alpha-boundaryless-industry-expansion` CLOSED 2026-05-29 (4 blocks: 3 physical domains, robot/manufacturing/logistics capability trio, 10 synergies, 10 high-risk combos; gate 428 tests). `v0.59` resource visibility closed at `c89faae`. `v0.58` market-season-strength closed at 415 tests. Detailed history in `feature_list.json` and `docs/CHANGELOG.md`.

## Files

- Startup state: `AGENTS.md`, `feature_list.json`, `progress.md`, `session-handoff.md`
- Save/load: `src/game/simulation.ts` (`serializeGameState`, `hydrateGameState`, sanitizers, `SAVE_VERSION`), `src/game/state-integrity.ts`, `src/game/save-integrity.test.ts`, `src/App.tsx` (localStorage + offline settlement)
- 10-year sim: `src/game/run-simulator.ts` (+ `.test.ts`), `src/game/campaign.ts`
- v0.60 industry expansion: `data/domains.json`, `data/products.json`, `data/capabilities.json`, `data/industry_synergies.json`, `data/industry_combos.json`, `src/game/industry-synergies.ts`, `src/game/industry-combos.ts`
- Roadmap and handoff: `docs/ROADMAP.md`, `docs/SESSION_HANDOFF.md`, `session-handoff.md`, `reports/codex-handoff/`

## Blockers

- None. P2 follow-up: AGY 5x automated 5/5. Final graphic asset intake unlocked.

## Verification Evidence

- v0.59 (c89faae): 43 files / 417 tests, derive-only resource indicators.
- v0.60 #1-#4 (7ca1dba / 0da778a / fba35f1 / 2f07287): 420 → 428 tests. 3 physical domains, manufacturing/logistics capabilities, 10 synergies, 10 combos. Only simulation.ts touch was 2 additive monthly-effects aggregation hooks.
- v0.61 #1 (60bf736): 43 files / 431 tests. save-integrity.test.ts +257; hydrate path gains sanitizeCapabilityMap (tick untouched); SAVE_VERSION 11. Codex CLI (xhigh).
- v0.61 #2 (4dda739): 43 files / 433 tests. run-simulator.ts all-strategy 10-year completability gate (stricter) + physical-industry/portfolio auto-play (real game checks) + versionTarget -> v0.61-alpha. simulation.ts tick untouched.
- v0.61 #3 (6b3e8de): 43 files / 437 tests. tutorial reorder + audit invariants; mobile 390x844 contracts for v0.60 UI + minimal App.css fix. Codex CLI (fast/medium).
- v0.61 #4 + closeout (this commit): docs only — refreshed reports/v0_60_status_and_promo.html to v0.61 + wrote reports/v0_61_public_alpha_intro.md. No code change (gate stays 43 files / 437 tests). Claude Code direct. v0.61 milestone marked completed.

## Recommended Next Step

v0.61 is **CLOSED** (4/4 blocks). The build is a publicly testable web alpha. Next is beta prep toward v1.0:

1. Beta gates (calendar-bound) — run the AGY 5x + real-human blind playtest cycles and import the final source art. These are what actually unlock v1.0; code velocity no longer dominates the timeline.
2. Manual screenshot capture per `reports/v0_61_public_alpha_intro.md` shot-list (Playwright is unavailable for auto-capture here).
3. Future depth idea (post-1.0, user raised 2026-05-29): tag-driven emergent combination engine + run modifiers, to make synergies/combos open-ended instead of hand-authored.

## Next Session

1. Read `AGENTS.md`, `feature_list.json`, and this file first.
2. Check `git status --short`.
3. v0.61 is closed. Next is beta prep (blind playtest cycles + final art intake) toward v1.0, or pick a post-1.0 depth item.
4. Run `npm run harness:gate` as the baseline (43 files / 437 tests) before changes.
