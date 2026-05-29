# Progress - AI Company Tycoon: Boundaryless

Last Updated: 2026-05-29

## Current State

- Current version: `v0.58-alpha` (closed; entering `v0.59-alpha`)
- Current feature: `v0.59-alpha-resource-visibility` (COMPLETED 2026-05-29; coded by Codex CLI gpt-5.5 xhigh, verified by Claude Code)
- Latest implementation commits: `v0.59 resource visibility` (this commit), `645eb2c v0.58 closeout`, `72d5d3a v0.58 #4`, `8df6bde v0.58 #5`, `fb1abd6 v0.58 #3`, `f31088e v0.58 #2`
- Current branch: `main`
- Stack: Vite + React + TypeScript
- Local dev: `npm run dev -- --port 5201`
- Main QA route: `http://127.0.0.1:5201/?scenario=office-visuals`
- Market share QA route: `http://127.0.0.1:5201/?scenario=market-share`
- Big event QA route: `http://127.0.0.1:5201/?scenario=big-event`
- Resource visibility QA route (v0.59, in progress): `http://127.0.0.1:5201/?scenario=resource-visibility`
- Full verification gate: `npm run harness:gate`

## Current Objective

`v0.59-alpha-resource-visibility` is **COMPLETE** as of 2026-05-29. It surfaces AI compute/data economics the simulation already models but never showed — active monthly compute load, monthly data generation, and compute needed before the next launch — as derive-only indicators in the research panel. Coded by Codex CLI (gpt-5.5, xhigh) per `reports/codex-handoff/v0_59_resource_visibility.md`; Claude Code owned the harness/contract track, verified `npm run harness:gate` (43 files / 417 tests), and confirmed `simulation.ts` / `types.ts` empty diff (derive-only). New pure helper `src/game/resource-visibility.ts`.

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
- v0.59 (this commit): `npm run harness:gate` 43 files / 417 tests, validate:data passed, build 106 modules. New `src/game/resource-visibility.ts` pure helper; `simulation.ts` / `types.ts` empty diff. Implementation by Codex CLI (gpt-5.5 xhigh); verification + closeout by Claude Code.

## Recommended Next Step

`v0.59-alpha-resource-visibility` is closed. Pick the next milestone:

- **v0.60-alpha boundaryless industry expansion** — 3 new physical industries + cross-industry synergies + high-risk/high-reward combos. Larger scope, fits the game's "boundaryless" identity.
- **v0.57 P2 Track C Phase 2** — one mobile polish item from `reports/qa/v0_57_p2_mobile_backlog.md` (top candidate: 모바일 패널 접힘 요약 at `?scenario=office-visuals` 390×844). Smallest scope.

## Next Session

1. Read `AGENTS.md`, `feature_list.json`, and this file first.
2. Check `git status --short`.
3. Pick the next milestone and update `feature_list.json` current_feature_id before touching code.
4. Run `npm run harness:gate` as the baseline before changes.
