# Progress - AI Company Tycoon: Boundaryless

Last Updated: 2026-05-29

## Current State

- Current version: `v0.58-alpha` (closed; entering `v0.59-alpha`)
- Current feature: `v0.60-alpha-boundaryless-industry-expansion` (COMPLETED 2026-05-29; all 4 blocks shipped, coded by Codex CLI, verified by Claude Code). Next milestone v0.61-alpha public web alpha — unselected.
- Latest implementation commits: `v0.60 #4 + closeout` (this commit), `fba35f1 v0.60 #3`, `0da778a v0.60 #2`, `7ca1dba v0.60 #1`, `c89faae v0.59 resource visibility`
- Current branch: `main`
- Stack: Vite + React + TypeScript
- Local dev: `npm run dev -- --port 5201`
- Main QA route: `http://127.0.0.1:5201/?scenario=office-visuals`
- Market share QA route: `http://127.0.0.1:5201/?scenario=market-share`
- Big event QA route: `http://127.0.0.1:5201/?scenario=big-event`
- Resource visibility QA route (v0.59, in progress): `http://127.0.0.1:5201/?scenario=resource-visibility`
- Full verification gate: `npm run harness:gate`

## Current Objective

`v0.60-alpha-boundaryless-industry-expansion` is **COMPLETE** as of 2026-05-29. It validated expanding beyond software into physical industries — 3 new domains (manufacturing, logistics, energy), the robot/manufacturing/logistics capability trio, 10 cross-industry synergies, and 10 high-risk/high-reward combos. Held to a controlled 3-industry slice per ROADMAP §5. Coded by Codex CLI (gpt-5.5; blocks #3-#4 in fast/medium mode per user request); Claude Code owned the harness/contract track + per-block verification. The only `simulation.ts` changes were two additive monthly-effects aggregation hooks (synergies, combos); no tick behavior rewrite.

Block status — all 4 DONE 2026-05-29. #1 (3 physical domains + 6 products, 7ca1dba), #2 (robot/manufacturing/logistics capability trio, 0da778a), #3 (10 cross-industry synergies, fba35f1), #4 (10 high-risk/high-reward combos with downside + risk_label, this commit). Final gate 43 files / 428 tests.

`v0.59-alpha-resource-visibility` closed 2026-05-29 (`c89faae`, 43 files / 417 tests, derive-only). The v0.58 block detail below is older history.

`v0.58-alpha-market-season-strength` is **CLOSED** as of 2026-05-29 (5 derive-only/queue-only blocks + closeout, harness:gate 43 files / 415 tests). The v0.58 block detail below is kept as recent history.

v0.58 block status (2026-05-29):

- v0.58 #1 — DONE at `9a5d493`. Derive-only stacked bar + top-pressure highlight + `?scenario=market-share`. No simulation changes.
- v0.58 #2 — DONE at `f31088e`. `MarketShareHistoryEntry` type, `GameState.marketShareHistory`, `advanceCompetitors` 24-month sliding window push, save migration, SVG sparkline.
- v0.58 #3 — DONE at `fb1abd6`. `RivalArchetypePanel` under `MarketSharePanel`. Top 3 rivals by `getRivalCounterPlans` pressureScore with archetype + weakness pills, severity color coding. Derive-only.
- v0.58 #4 — DONE (this commit). `isCounterCard` + `getRivalCounterSignal` exported from `rival-counters.ts`. `DeckPanel` injects a `압박 대응` badge + glow on counter-tagged or rival-targeting cards in hand and reward-choice UI when the rival pressure signal is non-zero. `high` signal pulses (with `prefers-reduced-motion` fallback). Derive-only.
- v0.58 #5 — DONE at `8df6bde`. `BigEventModal.tsx` shows annual_challenger / late_boss entry modal with archetype + weakness + dismiss. `pendingChallengerEntryIds: string[]` queue field in GameState; `addScheduledCompetitors` push; `dismissChallengerEntry` action. New `?scenario=big-event` QA route fast-forwards to month 13.

v0.57 P2 follow-up status (merged):

- Track B `91788a2` — AGY 5x agent review automation. `npm run qa:agy-review` writes 5 deterministic session files; `qa:asset-handoff` prints `AGY 발송 가능`.
- Track C Phase 1 `e81cf23` — `reports/qa/v0_57_p2_mobile_backlog.md` with 손댈 후보 3 / 다음 라운드 3 / 지금 손대지 않을 것 2.

## v0.57 Slice Summary (closed)

v0.57 stacked 9 polish `#N` commits + 4 P1 polish commits + closeout commit on top of the locked v0.56 slice, then v0.57 P2 Track B extended it at `91788a2`. Detailed change history lives in commits `87cd32c` ~ `bc75b7d` + closeout `6761c00` + Track B `91788a2`.

## Files

- Startup state: `AGENTS.md`, `feature_list.json`, `progress.md`, `session-handoff.md`
- v0.58 #1-#5 source files: `src/components/MarketSharePanel.tsx`, `src/components/RivalArchetypePanel.tsx`, `src/components/BigEventModal.tsx`, `src/components/GameChrome.tsx`, `src/components/MenuPanels.tsx`, `src/App.css`, `src/game/types.ts`, `src/game/simulation.ts`, `src/game/rival-counters.ts`, `src/game/qa-scenarios.ts`, `src/ui/layout-contract.test.ts`
- v0.58 derive-only data sources: `data/competitors.json` (`archetype_key`, `weakness_key`, `entry_announcement`, `rival_tier`), `data/locales/ko.json` + `en.json`
- Roadmap and handoff: `docs/ROADMAP.md`, `docs/SESSION_HANDOFF.md`, `session-handoff.md`

## Blockers

- No v0.57 or v0.58 blocking items.
- P2 follow-up: AGY 5x automated 5/5.
- Final graphic asset intake unlocked.

## Verification Evidence

- v0.58 #1 (9a5d493): `npm run harness:gate` 43 files / 411 tests / build 689ms.
- v0.58 #2 (f31088e): `npm run harness:gate` 43 files / 412 tests / build 720ms.
- v0.58 #3 (fb1abd6): `npm run harness:gate` 43 files / 413 tests.
- v0.58 #5 (8df6bde): `npm run harness:gate` 43 files / 414 tests.
- v0.58 #4 (72d5d3a): `npm run harness:gate` 43 files / 415 tests.
- v0.58 closeout (645eb2c): root state files synced to mark `v0.58-alpha-market-season-strength` completed.
- v0.59 (c89faae): `npm run harness:gate` 43 files / 417 tests, derive-only resource indicators.
- v0.60 #1 (7ca1dba): 43 files / 420 tests. domains.json +3, products.json +6 (gated), boundaryless-expansion.ts wiring, `?scenario=physical-industries`. simulation.ts untouched.
- v0.60 #2 (0da778a): 43 files / 421 tests. capabilities.json +2 (manufacturing, logistics), domains/products re-gated to the robot/manufacturing/logistics trio. simulation.ts untouched (data-driven).
- v0.60 #3 (fba35f1): 43 files / 425 tests. 10 cross-industry synergies (industry_synergies.json + industry-synergies.ts), minimal 2-line hook in getMonthlyStrategicEffects.
- v0.60 #4 + closeout (this commit): 43 files / 428 tests. 10 high-risk/high-reward combos (industry_combos.json + industry-combos.ts) with downside + risk_label, deterministic; same minimal 2-line hook. §5 product_ideas untouched. Milestone marked completed. Fast mode (Codex gpt-5.5 medium); verification by Claude Code.

## Recommended Next Step

`v0.60` is closed (4/4 blocks). Next milestone is **v0.61-alpha public web alpha candidate** — save/load stability, 10-year campaign completable end-to-end, tutorial flow cleanup, no major UI breaks, intro copy/screenshots. Stabilization (no new large systems), aligning with ROADMAP §5.

1. Pick v0.61 scope and set `feature_list.json` current_feature_id (it still points at the completed v0.60).
2. Before beta: refresh `reports/v0_60_status_and_promo.html` status/promo report (user request 2026-05-29).
3. Future depth idea (post-1.0, user raised 2026-05-29): tag-driven emergent combination engine + run modifiers, to make synergies/combos open-ended instead of hand-authored. Capture fuller note if pursued.

## Next Session

1. Read `AGENTS.md`, `feature_list.json`, and this file first.
2. Check `git status --short` — Codex may have an in-progress v0.60 block diff.
3. If a block is open, verify `npm run harness:gate` and commit it, then hand off the next block. Otherwise continue v0.60 blocks #2-#4.
4. Run `npm run harness:gate` as the baseline before changes.
