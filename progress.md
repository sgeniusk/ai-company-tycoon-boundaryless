# Progress - AI Company Tycoon: Boundaryless

Last Updated: 2026-05-29

## Current State

- Current version: `v0.61-alpha` (closed); beta prep next toward v1.0
- Current feature: `v0.63-alpha-roguelike-run-modifiers` (in progress; first post-1.0 big system, started by user decision — §5 hold lifted; block #1 foundation delegated to Codex CLI xhigh). Prior `v0.62-alpha-payoff-juice` completed 2026-05-29 (44 files / 448 tests). Design: `reports/v0_62_design_direction.md` §3.
- Latest implementation commits: `v0.61 #1 save/load hardening` (this commit), `2f07287 v0.60 #4 + closeout`, `fba35f1 v0.60 #3`, `0da778a v0.60 #2`, `7ca1dba v0.60 #1`, `c89faae v0.59 resource visibility`
- Current branch: `main`
- Stack: Vite + React + TypeScript
- Local dev: `npm run dev -- --port 5201`
- Main QA route: `http://127.0.0.1:5201/?scenario=office-visuals`
- Other QA routes: `?scenario=market-share`, `?scenario=big-event`, `?scenario=resource-visibility`, `?scenario=physical-industries`
- Full verification gate: `npm run harness:gate` (current baseline 43 files / 431 tests)

## Current Objective

`v0.63-alpha-roguelike-run-modifiers` is the current milestone — the first post-1.0 big system, started early by user decision (ROADMAP §5 hold lifted for this system; design in `reports/v0_62_design_direction.md` §3). A run is seeded from start city × world-lore × market × founder, with yearly events mutating it. **Block #1 (foundation — run_modifiers.json + run-start application + GameState.runModifiers, default no-op, tick untouched) DONE 2026-05-29.** 4 blocks, coded by Codex CLI (foundation + tick at xhigh; UI at fast). Prior `v0.62-alpha-payoff-juice` CLOSED 2026-05-29 (dopamine polish); the v0.56-v0.62 detail below is recent history.

v0.61 block status (recent history):

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
- v0.61 #4 + closeout (645eb2c era): docs only — refreshed reports/v0_60_status_and_promo.html to v0.61 + wrote reports/v0_61_public_alpha_intro.md. v0.61 milestone marked completed.
- v0.62 #1 (29c2dc9): 44 files / 439 tests (new test file shifts the file baseline 43→44). Pure-derive combo/synergy activation celebration (payoff-activation.ts + PayoffCelebrationModal + ?scenario=payoff-juice); no GameState field, simulation.ts + save path untouched. Companion: review deck + reports/v0_62_design_direction.md (224fcb6).
- v0.62 #2 (a115131): 44 files / 444 tests. Discovery "신규 발견!" + collection-lite + ?scenario=collection; new persisted GameState.discoveredPayoffIds (seenTutorials pattern, save round-trip + old-save migration tested); simulation.ts = initialState default + hydrate sanitizer only.
- v0.62 #3 + closeout (d742c46): 44 files / 448 tests. Milestone fanfare (achievements reuse + 2 conservative achievements) + getAnnualReviewNearMissSignal derive; simulation.ts/types.ts/save schema untouched. v0.62 completed.
- v0.63 #1 (this commit): 45 files / 454 tests. Run-modifier FOUNDATION — run_modifiers.json + run-modifiers.ts (pure) + GameState.runModifiers (save-migrated, old saves→standard); createInitialState(selection?)/resetRunWithMetaUnlocks integrate; monthly tick UNTOUCHED, default config = no regression (tested). ?scenario=run-modifiers. Codex CLI (xhigh); verification by Claude Code.

## Recommended Next Step

`v0.63` block #1 (run-modifier foundation) is done and committed (v0.62 dopamine polish closed before it). Next on the track:

1. v0.63 block #2 (world-lore/market tick effects, Codex xhigh) — wire stored `runModifiers.tags` into the monthly tick (e.g. compute_expensive raises compute cost), minimal + deterministic + balance-bounded. Then #3 (yearly events) → #4 (세계 뽑기 reveal UI).
2. Or pause v0.63 for beta prep (real-human playtest + final art) toward v1.0 — both tracks are open.

(Earlier forward options, still valid:)

1. Beta prep (parallel, calendar-bound) — AGY 5x done; real-human playtest + final art (resolution↑) unlock v1.0.
2. post-1.0 big systems per `reports/v0_62_design_direction.md` — tag-derivation engine, roguelike run modifiers (도시×세계관×시장×창업자 + 연중 이벤트), multi-ending.

## Next Session

1. Read `AGENTS.md`, `feature_list.json`, and this file first.
2. Check `git status --short`.
3. v0.62 is closed (dopamine polish). Next is beta prep (real-human playtest + final art) or a post-1.0 system (`reports/v0_62_design_direction.md`).
4. Run `npm run harness:gate` as the baseline (45 files / 454 tests) before changes.
