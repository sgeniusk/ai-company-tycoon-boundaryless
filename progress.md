# Progress - AI Company Tycoon: Boundaryless

Last Updated: 2026-05-27

## Current State

- Current version: `v0.57-alpha` (entering `v0.58-alpha`)
- Current feature: `v0.58-alpha-market-season-strength` (v0.58 #1, #2, #3 complete; #4 and #5 pending)
- Latest implementation commits: `v0.58 #3 rival archetype/weakness panel` (this commit), `f31088e v0.58 #2 marketShareHistory + sparkline`, `78a816d docs annotation`, `e81cf23 v0.57 P2 Track C Phase 1`, `91788a2 v0.57 P2 Track B`, `9a5d493 v0.58 #1`
- Current branch: `main`
- Stack: Vite + React + TypeScript
- Local dev: `npm run dev -- --port 5201`
- Main QA route: `http://127.0.0.1:5201/?scenario=office-visuals`
- Market share QA route: `http://127.0.0.1:5201/?scenario=market-share` (now shows archetype/weakness panel under sparkline)
- Full verification gate: `npm run harness:gate`

## Current Objective

`v0.58-alpha-market-season-strength` is the active milestone. v0.58 #1 (visualization), #2 (history + sparkline), and #3 (rival archetype/weakness) are done. Remaining blocks are #4 (response card differentiation, touches deck system — lower isolation) and #5 (big event popup on annual challenger entry).

v0.58 block status (2026-05-27):

- v0.58 #1 — DONE at `9a5d493`. Derive-only stacked bar + top-pressure highlight + `?scenario=market-share`. No simulation changes.
- v0.58 #2 — DONE at `f31088e`. `MarketShareHistoryEntry` type, `GameState.marketShareHistory`, `advanceCompetitors` push (24-month sliding window), `sanitizeMarketShareHistory` migration, SVG sparkline (player solid + top rival dashed).
- v0.58 #3 — DONE (this commit). New `RivalArchetypePanel` mounted under `MarketSharePanel`. Top 3 rivals by `getRivalCounterPlans` pressureScore with archetype + weakness pills from `competitors[].archetype_key` / `weakness_key`, severity color coding (contested red / strategic orange / watch blue). Derive-only.
- v0.58 #4 — pending. Response card differentiation (touches deck system; lower isolation than #1-#3 + #5).
- v0.58 #5 — pending. Big event popup on annual challenger entry (`competitors[].entry_announcement`, `entry_month` 12 and 24 cohorts).

v0.57 P2 follow-up status (merged):

- Track B `91788a2` — AGY 5x agent review automation. `npm run qa:agy-review` writes 5 deterministic session files; `qa:asset-handoff` prints `AGY 발송 가능`.
- Track C Phase 1 `e81cf23` — `reports/qa/v0_57_p2_mobile_backlog.md` with 손댈 후보 3 / 다음 라운드 3 / 지금 손대지 않을 것 2.

## v0.57 Slice Summary (closed)

v0.57 stacked 9 polish `#N` commits + 4 P1 polish commits + closeout commit on top of the locked v0.56 slice, then v0.57 P2 Track B extended it at `91788a2`. Detailed change history lives in commits `87cd32c` ~ `bc75b7d` + closeout `6761c00` + Track B `91788a2`.

## Files

- Startup state: `AGENTS.md`, `feature_list.json`, `progress.md`, `session-handoff.md`
- v0.58 #1 files: `src/components/MarketSharePanel.tsx`, `src/components/GameChrome.tsx`, `src/App.css`, `src/game/qa-scenarios.ts`, `src/ui/layout-contract.test.ts`
- v0.58 #2 files: `src/game/types.ts`, `src/game/simulation.ts`, `src/components/MarketSharePanel.tsx`, `src/App.css`, `src/ui/layout-contract.test.ts`
- v0.58 #3 files: `src/components/RivalArchetypePanel.tsx` (new), `src/components/GameChrome.tsx` (mount), `src/App.css` (`.rival-archetype-*`), `src/ui/layout-contract.test.ts` (v0.58 #3 it block + readFileSync)
- v0.58 derive-only data sources: `data/competitors.json` (`archetype_key`, `weakness_key`, `color`), `src/game/rival-counters.ts` (`getRivalCounterPlans`), `src/game/competition-signals.ts`, `src/game/simulation.ts` (`getPlayerMarketShare`)
- i18n keys: `data/locales/ko.json`, `data/locales/en.json` — `competitors.X.archetype` and `competitors.X.weakness` for all 13 competitors
- Track B files: `scripts/qa/run-v057-agy-agent-review.mjs`, `data/agy_review_personas.json`, `package.json`, `reports/qa/v0_57_agy_agent_review_run.md`, `reports/playtests/v0_56_blind_playtest_session_01.md` ~ `_05.md`
- Track C file: `reports/qa/v0_57_p2_mobile_backlog.md`
- Roadmap and handoff: `docs/ROADMAP.md`, `docs/SESSION_HANDOFF.md`, `session-handoff.md`

## Blockers

- No v0.57 or v0.58 blocking items.
- P2 follow-up: AGY 5x automated 5/5. Real human blind sessions remain optional follow-up.
- Final graphic asset intake unlocked — `qa:asset-handoff` reports `AGY 발송 가능`.

## Verification Evidence

- v0.58 #1 (9a5d493): `npm run harness:gate` 43 files / 411 tests / build 689ms.
- v0.57 P2 Track B (91788a2): `qa:agy-review` succeeded; `qa:asset-handoff` printed `AGY 발송 가능`.
- v0.57 P2 Track C (e81cf23): single file added.
- v0.58 #2 (f31088e): `npm run harness:gate` 43 files / 412 tests / build 720ms.
- v0.58 #3 (this commit): `npm run harness:gate` 43 files / 413 tests; narrow `npx vitest run src/ui/layout-contract.test.ts` 1 file / 58 tests in 197ms.

## Recommended Next Step

Pick v0.58 #5 — big event popup on annual challenger entry. Use `competitors[].entry_announcement` and trigger on `entry_month` (12 and 24 month cohorts: autonovaMotors, brewchain, toycloud, ironoracle). New `src/components/BigEventModal.tsx`, hook into `advanceMonth` or detect via `competitorStates` diff. Stay close to derive-only — add minimal state field if necessary (e.g., `seenChallengerEntries: string[]` to prevent re-show). Alternative: v0.58 #4 response card differentiation (deck system change, lower isolation; defer until #5 lands).

## Next Session

1. Read `AGENTS.md`, `feature_list.json`, and this file first.
2. Check `git status --short`.
3. Pick v0.58 #4 or #5.
4. Run `npm run harness:gate` as the baseline before changes.
