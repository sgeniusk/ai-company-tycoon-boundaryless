# Progress - AI Company Tycoon: Boundaryless

Last Updated: 2026-05-26

## Current State

- Current version: `v0.55-alpha`
- Current objective: `v0.56-alpha-playtest-slice-lock`
- Latest implementation commit: `538c174 Refocus roadmap on playtest slice`
- Current branch: `main`
- Stack: Vite + React + TypeScript
- Local dev: `npm run dev -- --port 5201`
- Temporary remote playtest URL: `https://librarian-matches-engaged-compact.trycloudflare.com/?scenario=fresh`
- Main QA route: `http://127.0.0.1:5201/?scenario=office-visuals`
- Playtest observer route: append `?playtest=v056&session=1`
- Full verification gate: `npm run harness:gate`

## Current Objective

Close v0.56 with 5 AGY agent reviews (validation policy upgraded 2026-05-26 per user decision). AGY agent runs fill `reports/playtests/v0_56_blind_playtest_session_01.md` ~ `_05.md`; the 테스터 프로필 row must start with `AGY agent`. Real human playtests stay a P2 follow-up and do not block v0.57. Open P0 from AGY runs must close before claiming v0.56 done.

## What Changed

- v0.56 pre-art slice is code/QA-ready: first-screen fantasy signal, Mina welcome, a clickable guide-side 30-minute alpha-run roadmap plus office playfield focus strip with next reward previews, click feedback, state-aware step targets, safe direct fast actions for active early steps, a year-two directive/research/product-start roadmap chain, and a 100% alpha-run completion payoff panel that now follows through into the 2nd-year issue, launch, second reward pick, post-reward completion state, and alpha-run debrief visible from both guide and results with a four-beat run timeline, plus first-hire/project/issue/reward/growth fast-starts, annual-review fast-forward, starter product launchpad, first launch payoff, year-two research/product candidate/needed-research/ready/started/issue-result/launch-impact path, rival/staff incident moments, workforce mix panel/HUD, and playtest observer HUD.
- Blind-test operations are scaffolded: request packet, AGY outbox, dispatch log, URL sync, five-session link sheet, sandbox-safe live-link structure check, readiness/preflight reports, returned-session intake, issue queue, final art gate, final art handoff packet, and automatic rehearsal.
- A Cloudflare quick tunnel is active for the current local dev server, and the request packet/AGY outbox have been synced to the remote player/facilitator URLs.
- AGY agent reviews are now the formal validation method for v0.56 (policy upgraded 2026-05-26 per user decision). The prior `reports/playtests/v0_56_agy_agent_playtest_review.md` becomes the basis for session 01; four more AGY agent reviews will fill sessions 02-05.
- Project moved out of Downloads on 2026-05-26 to `/Users/taewookkim/dev/ai-company-tycoon`; `npm install` + `npm run harness:gate` reproduced 43 files / 406 tests, data validation, and production build (738ms) in the new location.
- `npm run harness:gate` now bounds Vitest to one worker to avoid local fork-worker startup stalls during full closeout verification.
- Harness context budget pass completed: root state files now summarize status and point to detailed reports instead of repeating every implementation and test event.

## Files

- Startup state: `AGENTS.md`, `feature_list.json`, `progress.md`, `session-handoff.md`
- Main handoff/docs: `docs/SESSION_HANDOFF.md`, `docs/ROADMAP.md`, `docs/QA_SCENARIOS.md`, `docs/BLIND_PLAYTEST_CHECKLIST.md`
- Art intake: `docs/ART_INTAKE.md`, `docs/ANTIGRAVITY_ART_BRIEF.md`
- Playtest reports: `reports/playtests/v0_56_*`, including `v0_56_blind_playtest_session_links.md`
- Daily closeout: `reports/production_v0_56_daily_closeout_2026_05_24.md`
- QA reports/screenshots: `reports/qa/v0_56_*`, including `reports/qa/v0_56_alpha_run_roadmap.md`, `reports/qa/v0_56_first_hire_fast_start.md`, `reports/qa/v0_56_first_project_fast_start.md`, `reports/qa/v0_56_first_issue_fast_start.md`, `reports/qa/v0_56_first_reward_growth_fast_start.md`, and `reports/qa/v0_56_annual_review_fast_forward.md`, plus `reports/qa/screenshots/v0_56_*`
- QA scripts: `scripts/qa/*v056*`

## Blockers

- AGY agent sessions are 0/5 of the new validation policy (upgraded 2026-05-26). Session files `session_01.md` ~ `_05.md` still hold `Status: 예정`.
- Final graphic asset intake is blocked until `qa:asset-handoff` reports `최종 그래픽 에셋 투입: 가능` and `AGY 발송 가능`, which requires the 5 AGY agent sessions filled and any P0 closed.
- Real human playtests (5/5) are now a P2 follow-up track, not a v0.56 blocker; pursue them after v0.57 ships.
- Final external/AI-generated art remains a P2 Art Intake track, not the current v0.56 P0.

## Verification Evidence

- Latest full gate: `npm run harness:gate` passed with 43 test files / 406 tests, data validation, and production build.
- Latest 30-minute alpha-run roadmap/focus-strip check: active step buttons now run safe early fast actions, click feedback, the year-two directive/research/product-start chain, a 100% completion payoff panel, and completion follow-through into 2nd-year issue resolution, launch, second reward pick, post-reward completion state, and alpha-run debrief with product/reward/year-two/readiness highlights plus first release/card payoff/annual directive/second reward timeline in both guide and results; final completion action is `디브리프 보기`; `npm test -- src/game/guidance.test.ts src/game/qa-scenarios.test.ts src/ui/layout-contract.test.ts` passed with 3 files / 123 tests; `npm run build` passed; `npm run harness:gate` passed with 43 files / 406 tests; `npm run qa:asset-handoff` kept final art intake `대기` and send status `AGY 발송 금지`; `curl -I 'http://127.0.0.1:5201/?scenario=alpha-run-second-reward-picked'` returned 200 OK.
- Latest first-hire fast-start check: `npm test -- src/game/simulation.test.ts src/ui/layout-contract.test.ts` passed with 2 files / 76 tests; `npm test -- src/game/blind-playtest-records.test.ts` passed with 1 file / 26 tests after updating the first-3-minute session checkpoint; `npm run build` passed; headless Chrome captured `?scenario=fresh` at `/private/tmp/ai-company-v056-first-hire-fast-start-v5.png`.
- Latest first-project fast-start check: `npm test -- src/game/simulation.test.ts` passed with 1 file / 33 tests; `npm test -- src/ui/layout-contract.test.ts` passed with 1 file / 45 tests; focused combined check passed with 3 files / 104 tests; `npm run build` passed; headless Chrome captured `?scenario=staffing` at `/private/tmp/ai-company-v056-first-project-fast-start.png`.
- Latest first-issue fast-start check: `npm test -- src/game/simulation.test.ts` passed with 1 file / 35 tests; `npm test -- src/ui/layout-contract.test.ts` passed with 1 file / 47 tests; focused combined check passed with 4 files / 112 tests; `npm run build` passed; `npm run harness:gate` passed with 43 files / 374 tests; `npm run qa:asset-handoff` kept final art intake `대기` and send status `AGY 발송 금지`; headless Chrome captured `?scenario=project` at `/private/tmp/ai-company-v056-first-issue-fast-start.png`.
- Latest first reward/growth fast-start check: `npm test -- src/game/simulation.test.ts` passed with 1 file / 37 tests; `npm test -- src/ui/layout-contract.test.ts` passed with 1 file / 48 tests; focused simulation/layout/guidance/deckbuilding check passed with 4 files / 115 tests; focused QA-scenario/simulation/layout check passed with 3 files / 130 tests; `npm run build` passed; `npm run harness:gate` passed with 43 files / 378 tests; `npm run qa:asset-handoff` kept final art intake `대기` and send status `AGY 발송 금지`; headless Chrome captured `?scenario=reward` at `/private/tmp/ai-company-v056-first-reward-fast-start-no-modal.png` and `?scenario=reward-picked` at `/private/tmp/ai-company-v056-first-growth-fast-start-no-modal.png`.
- Latest annual-review/annual-directive clarity check: `npm test -- src/game/simulation.test.ts` passed with 1 file / 38 tests; `npm test -- src/game/guidance.test.ts` passed with 1 file / 12 tests; `npm test -- src/ui/layout-contract.test.ts` passed with 1 file / 48 tests; `npm test -- src/game/blind-playtest-records.test.ts` passed with 1 file / 26 tests; focused simulation/guidance/layout/QA-record/QA-scenario check passed with 5 files / 169 tests; `npm run build` passed; `npm run harness:gate` passed with 43 files / 379 tests; `npm run qa:asset-handoff` kept final art intake `대기` and send status `AGY 발송 금지`; headless Chrome captured `?scenario=flow` at `/private/tmp/ai-company-v056-annual-review-fast-forward-flow.png` and `?scenario=annual-directed` at `/private/tmp/ai-company-v056-annual-directed-year-two-start.png`.
- Latest product-candidate needed-research check: `npm test -- src/ui/layout-contract.test.ts` passed with 1 file / 49 tests; `npm test -- src/ui/layout-contract.test.ts src/game/qa-scenarios.test.ts` passed with 2 files / 94 tests; focused layout/QA-scenario/blind-record check passed with 3 files / 120 tests; `npm run build` passed; `npm run harness:gate` passed with 43 files / 380 tests; `npm run qa:asset-handoff` kept final art intake `대기` and send status `AGY 발송 금지`; `curl -I` for `?scenario=year-two-product-candidate&menu=research` returned 200 OK; headless Chrome captured desktop and mobile at `/private/tmp/ai-company-v056-product-candidate-needed-research.png` and `/private/tmp/ai-company-v056-product-candidate-needed-research-mobile.png`.
- Earlier 2년차 product-start/issue-result/launch-impact check: `npm test -- src/game/qa-scenarios.test.ts` passed with 1 file / 49 tests; focused QA-scenario/layout/blind-record/rehearsal check passed with 4 files / 128 tests; `npm run qa:blind-rehearsal` regenerated the automatic rehearsal report without touching real sessions; that stage's full gate passed with 43 files / 391 tests and is now superseded by the latest 406-test gate above; `npm run qa:asset-handoff` kept final art intake `대기` and send status `AGY 발송 금지`; `curl -I` for `?scenario=year-two-product-started`, `?scenario=year-two-product-started&menu=deck`, `?scenario=year-two-product-issue-result`, and `?scenario=year-two-product-launch-impact` returned 200 OK; product-start desktop/mobile captures remain at `/private/tmp/ai-company-v056-year-two-product-started.png` and `/private/tmp/ai-company-v056-year-two-product-started-mobile.png`.
- Latest URL/tunnel check: `npm test -- src/game/blind-playtest-records.test.ts` passed with 1 file / 32 tests; the expired Cloudflare URL was replaced with `https://librarian-matches-engaged-compact.trycloudflare.com`; `npm run qa:blind-session-links` wrote five session-specific observer URLs with all session files still `Status: 예정`; `npm run qa:blind-live-check` reported `링크 구조 준비`; direct `curl -I` for player, observer session 1, and observer session 5 returned 200; `PLAYTEST_BASE_URL=https://librarian-matches-engaged-compact.trycloudflare.com npm run qa:blind-preflight` reported `원격 테스트 준비`, current request packet URL `동기화 완료`, tutorial delay OK.
- Latest focused preflight check: `npm test -- src/game/tutorial-guide.test.ts src/game/blind-playtest-records.test.ts` passed with 2 files / 32 tests.
- Latest blind gate checks: `npm run qa:blind-readiness` reported Ready to send yes, Sessions untouched yes, Real sessions 0/5, Art gate `대기`; latest `npm run qa:asset-handoff` reported Final art intake `대기` and Send status `AGY 발송 금지`.
- Latest preflight check: `PLAYTEST_BASE_URL=https://librarian-matches-engaged-compact.trycloudflare.com npm run qa:blind-preflight` wrote `reports/playtests/v0_56_blind_playtest_preflight.md` with Status `원격 테스트 준비`, request packet URL `동기화 완료`, tutorial delay OK, real sessions 0/5, and final art request `대기`.
- Latest screenshot QA: `npm run qa:office-visuals:screenshots` passed after approved external headless Chrome execution, generating desktop 1366x768 and mobile 390x844 captures.
- Harness context-budget pass: `harness-creator` validation passed at 100/100.
- Startup word count dropped from 35,226 words to 15,903 words across the measured harness/doc set; the mandatory startup trio is now about 1,483 words.

## Recommended Next Step

Run 5 AGY agent reviews (covering first 10 minutes, first launch, card impact, year-two new product, 30-minute alpha-run debrief) and fill `session_01.md` ~ `_05.md` with `Status: 완료`. Then run `npm run qa:blind-summary`, `npm run qa:blind-issues`, and `npm run qa:asset-handoff`. Request final graphics only when `qa:asset-handoff` reports `AGY 발송 가능`. After v0.56 closes, start v0.57 core-fun work; Codex CLI can take parallel implementation tasks while Claude Code remains the harness.

## Next Session

1. Read `AGENTS.md`, `feature_list.json`, and this file first.
2. Check `git status --short`.
3. If continuing v0.56, inspect only the relevant `reports/playtests/v0_56_*` and QA scripts.
4. Before claiming done, run the narrowest useful checks and then `npm run harness:gate` when code changed.
