# Progress - AI Company Tycoon: Boundaryless

Last Updated: 2026-05-27

## Current State

- Current version: `v0.57-alpha` (entering `v0.58-alpha`)
- Current feature: `v0.58-alpha-market-season-strength` (v0.58 #1 and #2 complete; v0.57 P2 Track B and Track C also merged)
- Latest implementation commits: `v0.58 #2 marketShareHistory + sparkline` (this commit), `78a816d docs: defer Recursive-inspired review`, `e81cf23 v0.57 P2 Track C Phase 1`, `91788a2 v0.57 P2 Track B`, `9a5d493 v0.58 #1 market share visualization`
- Current branch: `main`
- Stack: Vite + React + TypeScript
- Local dev: `npm run dev -- --port 5201`
- Main QA route: `http://127.0.0.1:5201/?scenario=office-visuals`
- Market share QA route: `http://127.0.0.1:5201/?scenario=market-share` (now shows sparkline once history accumulates via `advanceToFirstAnnualReview`)
- Full verification gate: `npm run harness:gate`

## Current Objective

`v0.58-alpha-market-season-strength` is the active milestone. Of 4 DoD bullets, #1 (market share visualization) and #2 (history + sparkline) are done. Remaining blocks are #3 (rival archetype/weakness surfacing), #4 (response card differentiation), and #5 (big event popup on annual challenger entry). Each new block adds one `layout-contract` `it` block per project convention.

v0.58 block status (2026-05-27):

- v0.58 #1 — DONE at `9a5d493`. Derive-only stacked bar + top-pressure highlight + `?scenario=market-share`. No simulation changes.
- v0.58 #2 — DONE (this commit). `MarketShareHistoryEntry` type, `GameState.marketShareHistory` field, `pushMarketShareHistory` helper in `advanceCompetitors`, `sanitizeMarketShareHistory` migration, sparkline SVG polylines for player vs top rival, 24-month sliding window.
- v0.58 #3 — pending. Surfacing rival archetype/weakness near the panel. Stay derive-only; reuse `competitors[].archetype_key` / `weakness_key`.
- v0.58 #4 — pending. Response card differentiation (touches deck system; not isolated like #1-#3).
- v0.58 #5 — pending. Big event popup on annual challenger entry, using `competitors[].entry_announcement`.

v0.57 P2 follow-up status (merged):

- Track B `91788a2` — AGY 5x agent review automation. `npm run qa:agy-review` writes 5 deterministic session files with `source: AGY agent auto-run` marker, then chains through `qa:asset-handoff` which now prints `AGY 발송 가능`.
- Track C Phase 1 `e81cf23` — `reports/qa/v0_57_p2_mobile_backlog.md` collected. Counts: 손댈 후보 3 / 다음 라운드 3 / 지금 손대지 않을 것 2.

## v0.57 Slice Summary (closed)

v0.57 stacked 9 polish `#N` commits + 4 P1 polish commits + closeout commit on top of the locked v0.56 slice, then v0.57 P2 Track B extended it as a follow-up track at `91788a2`. Detailed change history lives in commits `87cd32c` ~ `bc75b7d` + closeout `6761c00` + Track B `91788a2`. The shared `card-impact-arrow-pulse` keyframe unifies card visual language across launch-impact, reward-choice preview, and year-two next-flow.

## Files

- Startup state: `AGENTS.md`, `feature_list.json`, `progress.md`, `session-handoff.md`
- v0.58 #1 files: `src/components/MarketSharePanel.tsx`, `src/components/GameChrome.tsx`, `src/App.css`, `src/game/qa-scenarios.ts`, `src/ui/layout-contract.test.ts`
- v0.58 #2 files: `src/game/types.ts` (new `MarketShareHistoryEntry` + `GameState.marketShareHistory`), `src/game/simulation.ts` (`pushMarketShareHistory`, `sanitizeMarketShareHistory`, `advanceCompetitors` push, initial state, load migration), `src/components/MarketSharePanel.tsx` (sparkline SVG), `src/App.css` (`.market-share-sparkline` + mobile media), `src/ui/layout-contract.test.ts` (v0.58 #2 `it` block)
- v0.58 derive-only data sources: `data/competitors.json`, `src/game/competition-signals.ts` (`getCompetitionSeasonBrief().topPressure`), `src/game/simulation.ts` (`getPlayerMarketShare`)
- Track B files: `scripts/qa/run-v057-agy-agent-review.mjs`, `data/agy_review_personas.json`, `package.json` (`qa:agy-review`), `reports/qa/v0_57_agy_agent_review_run.md`, `reports/playtests/v0_56_blind_playtest_session_01.md` ~ `_05.md`
- Track C file: `reports/qa/v0_57_p2_mobile_backlog.md`
- Roadmap and handoff: `docs/ROADMAP.md`, `docs/SESSION_HANDOFF.md`, `session-handoff.md`

## Blockers

- No v0.57 or v0.58 blocking items.
- P2 follow-up: AGY 5x automated 5/5. Real human blind sessions remain optional follow-up.
- Final graphic asset intake unlocked — `qa:asset-handoff` reports `AGY 발송 가능`.

## Verification Evidence

- v0.58 #1 (9a5d493): `npm run harness:gate` 43 files / 411 tests / build 689ms.
- v0.57 P2 Track B (91788a2): `qa:agy-review` succeeded end-to-end; `qa:asset-handoff` printed `AGY 발송 가능`.
- v0.57 P2 Track C (e81cf23): single file added, no code changes.
- v0.58 #2 (this commit): `npm run harness:gate` 43 files / 412 tests / build 720ms (+1 layout-contract block, +103 modules transformed).
- Narrow tests `npx vitest run src/ui/layout-contract.test.ts src/game/simulation.test.ts src/game/qa-scenarios.test.ts`: 3 files / 149 tests pass in 760ms.

## Recommended Next Step

Pick v0.58 #3 — rival archetype/weakness surfacing near the market share panel. Stay derive-only; reuse `competitors[].archetype_key` and `competitors[].weakness_key` from `data/competitors.json` with `t()` for i18n. Add one `layout-contract` `it` block (target 43 files / 413 tests). Alternative: jump to v0.58 #5 (big event popup) if rival archetype copy isn't ready.

## Next Session

1. Read `AGENTS.md`, `feature_list.json`, and this file first.
2. Check `git status --short`.
3. Pick v0.58 #3, #4, or #5.
4. Run `npm run harness:gate` as the baseline before changes.
