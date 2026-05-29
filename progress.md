# Progress - AI Company Tycoon: Boundaryless

Last Updated: 2026-05-29

## Current State

- Current version: `v0.58-alpha` (closed; entering `v0.59-alpha`)
- Current feature: `v0.60-alpha-boundaryless-industry-expansion` (in progress; block #1 of 4 delegated to Codex CLI gpt-5.5 xhigh). Prior `v0.59-alpha-resource-visibility` closed at 417 tests.
- Latest implementation commits: `c89faae v0.59 resource visibility`, `645eb2c v0.58 closeout`, `72d5d3a v0.58 #4`, `8df6bde v0.58 #5`, `fb1abd6 v0.58 #3`
- Current branch: `main`
- Stack: Vite + React + TypeScript
- Local dev: `npm run dev -- --port 5201`
- Main QA route: `http://127.0.0.1:5201/?scenario=office-visuals`
- Market share QA route: `http://127.0.0.1:5201/?scenario=market-share`
- Big event QA route: `http://127.0.0.1:5201/?scenario=big-event`
- Resource visibility QA route (v0.59, in progress): `http://127.0.0.1:5201/?scenario=resource-visibility`
- Full verification gate: `npm run harness:gate`

## Current Objective

`v0.60-alpha-boundaryless-industry-expansion` is the current milestone (selected 2026-05-29). It validates the fun of going beyond software into physical industries — 3 new domains (manufacturing, logistics, energy) on top of the existing 12, robot/manufacturing/logistics requirement wiring, 10 cross-industry synergies, and 10 high-risk/high-reward combos. ROADMAP §5 forbids mass expansion, so this stays a controlled 3-industry slice. Multi-session; decomposed into 4 blocks (see `feature_list.json`). Coding delegated to Codex CLI (gpt-5.5, xhigh); Claude Code owns the harness/contract track + per-block verification.

Block status — #1 (manufacturing/logistics/energy domains + 6 gated products + boundaryless-expansion wiring + `?scenario=physical-industries`) and #2 (manufacturing + logistics capabilities completing the robot/manufacturing/logistics trio, 3 physical domains re-gated) DONE 2026-05-29 (gate 43 files / 421 tests, simulation.ts untouched in both). #3 synergies → #4 combos queued.

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
- v0.60 #2 (this commit): 43 files / 421 tests. capabilities.json +2 (manufacturing, logistics), domains/products re-gated to the robot/manufacturing/logistics trio. simulation.ts untouched (data-driven). Implementation by Codex CLI (gpt-5.5 xhigh); verification by Claude Code.

## Recommended Next Step

`v0.60` blocks #1-#2 are done and committed. Next on Claude Code's track:

1. Hand block #3 (10 cross-industry synergies) to Codex CLI — mirror the office_synergies / deck_synergies data + derive/display pattern.
2. Verify `npm run harness:gate`, commit block #3, then block #4 (10 high-risk/high-reward combos).

## Next Session

1. Read `AGENTS.md`, `feature_list.json`, and this file first.
2. Check `git status --short` — Codex may have an in-progress v0.60 block diff.
3. If a block is open, verify `npm run harness:gate` and commit it, then hand off the next block. Otherwise continue v0.60 blocks #2-#4.
4. Run `npm run harness:gate` as the baseline before changes.
