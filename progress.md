# Progress - AI Company Tycoon: Boundaryless

Last Updated: 2026-05-29

## Current State

- Current version: `v0.61-alpha` (closed); beta prep next toward v1.0
- Current feature: `v0.67-alpha-multi-ending` (PLANNED — awaiting user direction at checkpoint; decision B, alt = beta prep decision C). The ENTIRE roguelike track shipped this session: `v0.63` system spine -> `v0.64` content depth -> `v0.65` difficulty -> `v0.66` tag-derivation engine (decision A), all CLOSED 2026-05-30. Baseline 48 files / 500 tests. Master plan: `reports/v0_63_plus_content_roadmap.md`.
- Latest implementation commits: `v0.61 #1 save/load hardening` (this commit), `2f07287 v0.60 #4 + closeout`, `fba35f1 v0.60 #3`, `0da778a v0.60 #2`, `7ca1dba v0.60 #1`, `c89faae v0.59 resource visibility`
- Current branch: `main`
- Stack: Vite + React + TypeScript
- Local dev: `npm run dev -- --port 5201`
- Main QA route: `http://127.0.0.1:5201/?scenario=office-visuals`
- Other QA routes: `?scenario=market-share`, `?scenario=big-event`, `?scenario=resource-visibility`, `?scenario=physical-industries`
- Full verification gate: `npm run harness:gate` (current baseline 43 files / 431 tests)

## Current Objective

`v0.63-alpha-roguelike-run-modifiers` is the current milestone — the first post-1.0 big system, started early by user decision (ROADMAP §5 hold lifted for this system; design in `reports/v0_62_design_direction.md` §3). A run is seeded from start city × world-lore × market × founder, with yearly events mutating it. **Blocks #1 (foundation) + #2 (world-lore/market tick effects) DONE 2026-05-29 — the run-modifier system is now functional end-to-end (run setup applies start deltas + worlds bite the monthly economy via a v0.60-style additive hook; standard world is a no-op).** 4 blocks, coded by Codex CLI (foundation + tick at xhigh; UI at fast). Prior `v0.62-alpha-payoff-juice` CLOSED 2026-05-29 (dopamine polish); the v0.56-v0.62 detail below is recent history.

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
- v0.63 #1 (c50fe56): 45 files / 454 tests. Run-modifier FOUNDATION — run_modifiers.json + run-modifiers.ts (pure) + GameState.runModifiers (save-migrated, old saves→standard); monthly tick UNTOUCHED, default = no regression.
- v0.63 #2 (be44e4e): 45 files / 457 tests. World-lore/market tick effects — getRunModifierMonthlyEffects + a 2-line getMonthlyStrategicEffects hook (v0.60 synergy pattern); conservative tag_effects; standard-world no-op regression guard. System now functional (worlds bite). Codex CLI (xhigh); verification by Claude Code.
- v0.63 #3 (91a3710): 46 files / 464 tests. Yearly world-events as a PARALLEL layer mirroring campaign_shocks (campaign-shocks.ts untouched). data/world_events.json (10-event pool) + WorldEventDefinition; deterministic seed-derived schedule (no RNG) + applyDueWorldEvents dedup via new GameState.worldEventHistory (save-migrated, old saves -> []); simulation.ts diff = exactly the one applyDueWorldEvents line after applyDueCampaignShocks + the field default + hydrate sanitizer; state-integrity validates history. Standard productivity_line 10-year run still completes (month 120, non-failure, events recorded). Codex CLI (xhigh); verification by Claude Code.
- v0.63 #4 + closeout (this commit): 46 files / 466 tests. 세계 뽑기 roll + reveal UI — the payoff that makes the run-modifier system engage in normal play. New pure rollRunModifierSelection(seed); new-run UI callsites pass a rolled seed while the first onboarding run + all no-arg resets stay standard (regression-tested → run-simulator 10-year gate unaffected). New WorldRevealModal (mirrors PayoffCelebrationModal), once-per-run via ephemeral React state. simulation.ts + types.ts diffs EMPTY (no tick/save/field change). v0.63 CLOSED (tests 448 -> 466 across the milestone). Codex CLI (medium/fast); verification by Claude Code. Block #1 of v0.64 ran in parallel in an isolated worktree.
- v0.64 #1 (48a4231): 47 files / 471 tests. Content depth — run-modifier 4-axis expansion (world_lore 5->12, start_cities 6->11, market_conditions 4->8, founder_traits 5->9 = 9,504 combos, was 600) + tag_effects for new monthly tags. DATA-ONLY (run_modifiers.json + validate-data.mjs + new run-modifiers-content.test.ts; run-modifiers.ts/simulation.ts/types.ts untouched). Default entries stay zero-delta no-ops (regression-guarded). Ran on Codex CLI (medium) in a parallel isolated worktree alongside v0.63 #4, then landed into main (disjoint files) and union-gated by Claude Code.
- v0.64 #2 + closeout (this commit): 47 files / 472 tests. world_events.json 12->26 (14 new events, 2 per new world, themed via world_lore_tags so the v0.63 #3 selector biases them into that world's run — no selector code change). world-events.test.ts pool bound raised + chip_war theming-bias test; validate-data.mjs bound updated. DATA-ONLY (world-events.ts/simulation.ts/types.ts/run_modifiers.json/run-modifiers.ts diffs empty). Standard 10-year run still completes. v0.64 CLOSED. Codex CLI (medium); verification by Claude Code.
- v0.65 #1 (this commit): 47 files / 477 tests. Difficulty foundation — data/difficulty_tiers.json (story/standard/hard/brutal); RunModifiersState.challengeTier (save-migrated, old/unknown -> standard); getDifficultyMonthlyEffects + a 2-line additive getMonthlyStrategicEffects hook (simulation.ts diff = exactly that hook). Difficulty = additive tier headwind (NOT sign-scaling tag_effects); standard tier {} = no-op (regression-guarded). run-simulator gained an optional selection arg (default no-arg = standard, existing gate unchanged) + a hard-tier 10-year completability test (passes). Codex CLI (xhigh); verification by Claude Code.
- v0.65 #2 + closeout (this commit): 47 files / 481 tests. Difficulty rewards + UI — getRunInsightReward multiplies the founder-insight reward by the tier reward_multiplier (central, so reset/projection/runHistory all reflect it; standard x1.0 = unchanged reward 13, hard x1.5 -> 20, regression-guarded). Run-setup tier selector passes challengeTierId into the new-run selection; WorldRevealModal shows the tier + multiplier. NO new GameState field (challengeTier already in runModifiers); simulation.ts/types.ts/save/data-JSON diffs empty. v0.65 CLOSED. Codex CLI (medium); verification by Claude Code.
- v0.66 #1 (this commit): 48 files / 488 tests. Tag-derivation ENGINE (decision A), DERIVE-ONLY. data/derivation_rules.json (~12 archetype rules: requires:[run-modifier tags] -> yields metadata + discovery_id) + DerivationRuleDefinition + new pure tag-derivation.ts (getDerivedArchetypes returns rules whose requires all match state.runModifiers.tags). NO GameState field, NO tick/save/effect (git diff --exit-code on simulation.ts/App.tsx/state-integrity/save empty — derive-only proven). ?scenario=tag-derivation + tag-vocab/determinism/spam-guard tests. Codex CLI (xhigh); verification by Claude Code. Next: #2 discovery celebration (v0.62 pattern) -> #3 effects -> #4 balance.
- v0.66 #2 (this commit): 48 files / 493 tests. Archetype DISCOVERY + cross-run 도감. New RogueliteState.discoveredArchetypeIds (META, cross-run — accumulates via resetRunWithMetaUnlocks: uniqueStrings([...prev, ...getNewlyDiscoveredArchetypes(prev, getDerivedArchetypes(nextRun))]), preserving founderInsight/unlockedMetaIds/runHistory). createInitialRogueliteState (deckbuilding.ts) defaults []; hydrateRogueliteState sanitizes vs rule ids (old saves -> []); state-integrity validates; no SAVE_VERSION bump. '발견' in WorldRevealModal + collection-lite (MenuPanels). TICK UNTOUCHED (advanceMonth diff empty; simulation.ts = derivationRules import + roguelite hydrate sanitizer only). Codex CLI (xhigh); verification by Claude Code.
- v0.66 #3 (this commit): 48 files / 498 tests. Archetype EMERGENT EFFECTS. DerivationRuleDefinition.yields gains optional monthly_effect:ResourceMap (conservative); getArchetypeMonthlyEffects sums derived bonus archetypes' effects; hooked into getMonthlyStrategicEffects via the same 2-line additive pattern (simulation.ts diff = exactly that hook). Additive, deterministic, NO new GameState field / save change (derives from runModifiers.tags; types.ts = yields.monthly_effect type only). Standard run completes (derived []) AND an archetype-bearing run (frontier_garage/oss_evangelist) completes. Codex CLI (xhigh); verification by Claude Code.
- v0.66 #4 + closeout (this commit): 48 files / 500 tests. Balance sweep (run-simulator.test.ts, test-only) over standard/harsh(GPU+winter+hard)/archetype(SF+engineer)/mixed combos — ALL reach month 120 success/integrity; difficulty monotonicity held (story==standard>=hard>=brutal); NO tuning needed (combined world+events+difficulty+archetype layers stack without breaking completability), so data/simulation.ts untouched. v0.66 CLOSED — tag-derivation engine (decision A) complete. The whole roguelike track (v0.63->v0.66) shipped this session. Codex CLI (xhigh); verification by Claude Code.

## Recommended Next Step

`v0.63` blocks #1-#2 are done and committed — the run-modifier system is functional (worlds bite). Next on the track:

1. v0.63 block #3 (yearly world-event mutators) — extend campaign_shocks into a continuously-mutating run-event system (the "매년 변수"). Then #4 (세계 뽑기 reveal UI, fast).
2. Or pause v0.63 for beta prep (real-human playtest + final art) toward v1.0 — both tracks are open.

(Earlier forward options, still valid:)

1. Beta prep (parallel, calendar-bound) — AGY 5x done; real-human playtest + final art (resolution↑) unlock v1.0.
2. post-1.0 big systems per `reports/v0_62_design_direction.md` — tag-derivation engine, roguelike run modifiers (도시×세계관×시장×창업자 + 연중 이벤트), multi-ending.

## Next Session

1. Read `AGENTS.md`, `feature_list.json`, and this file first.
2. Check `git status --short`.
3. v0.62 is closed (dopamine polish). Next is beta prep (real-human playtest + final art) or a post-1.0 system (`reports/v0_62_design_direction.md`).
4. Run `npm run harness:gate` as the baseline (45 files / 457 tests) before changes.
