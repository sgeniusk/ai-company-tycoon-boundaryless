# Progress - AI Company Tycoon: Boundaryless

Last Updated: 2026-05-29

## Current State

- Current version: `v0.57-alpha` (entering `v0.58-alpha`)
- Current feature: `v0.58-alpha-market-season-strength` (CLOSED 2026-05-29; next milestone unselected)
- Latest implementation commits: `v0.58 closeout` (this commit), `72d5d3a v0.58 #4`, `8df6bde v0.58 #5`, `fb1abd6 v0.58 #3`, `f31088e v0.58 #2`, `9a5d493 v0.58 #1`
- Current branch: `main`
- Stack: Vite + React + TypeScript
- Local dev: `npm run dev -- --port 5201`
- Main QA route: `http://127.0.0.1:5201/?scenario=office-visuals`
- Market share QA route: `http://127.0.0.1:5201/?scenario=market-share`
- Big event QA route: `http://127.0.0.1:5201/?scenario=big-event`
- Full verification gate: `npm run harness:gate`

## Current Objective

`v0.58-alpha-market-season-strength` is **CLOSED** as of 2026-05-29. All 5 functional DoD bullets shipped as derive-only / queue-only blocks with no simulation tick behavior changes. The next milestone is unselected — pick one in the next session.

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
- v0.58 closeout (this commit): root state files synced to mark `v0.58-alpha-market-season-strength` completed and the next milestone unselected.

## Recommended Next Step

Pick the next milestone (current feature) in the next session. Candidates:

- **Recursive-inspired AI resource visualization** — `docs/ROADMAP.md` v0.58 후속 검토 block. Surface derive-only GPU hours, data freshness, next-launch compute requirement in the research panel. Optional 10-year campaign mega gauge. Small scope, fast win.
- **v0.59-alpha boundaryless industry expansion** — 3 new physical industries + robotics/manufacturing/logistics requirements + 10 cross-industry synergies + 10 high-risk/high-reward combos. Larger scope, fits the game's "boundaryless" identity.
- **v0.57 P2 Track C Phase 2** — pick one item from `reports/qa/v0_57_p2_mobile_backlog.md` 손댈 후보 (top candidate: 모바일 패널 접힘 요약 at `?scenario=office-visuals` 390×844). Smallest scope; clears mobile polish backlog.

## Next Session

1. Read `AGENTS.md`, `feature_list.json`, and this file first.
2. Check `git status --short`.
3. Pick the next current_feature_id from the candidate list above and update `feature_list.json` before touching code.
4. Run `npm run harness:gate` as the baseline before changes.
