# QA Scenarios — AI Company Tycoon: Boundaryless

Date: 2026-05-21

## Purpose

Stable browser entry points for checking important UI states without manually playing into each state.

## Scenario URLs

Use the local app URL and append one of these query strings:

| Scenario | Query | Purpose |
|---|---|---|
| Fresh | `?scenario=fresh` | First screen, first objective, no hired agents |
| Staffing | `?scenario=staffing` | Two hired agents, no active project, explicit product team assignment UI |
| Project | `?scenario=project` | First product in development, progress UI, objective state |
| Release | `?scenario=release` | Release spotlight, growth fork cards, boundaryless expansion hint, office scene |
| Reward | `?scenario=reward` | Post-release card reward, first reward spotlight, deck edit tokens, card remove/upgrade UI |
| Reward Picked | `?scenario=reward-picked` | First reward choice completed, selected card confirmation, growth branch next step |
| Growth Picked | `?scenario=growth-picked` | First reward and growth branch completed, selected growth confirmation, annual-review next step |
| Shop | `?scenario=shop` | Post-release shop guidance and item-card scanability |
| Office | `?scenario=office` | Expanded office, placed decorations, decoration management, next office upgrade |
| Deck | `?scenario=deck` | Active project with strategy hand, first development issue launchpad, and meta unlock panel |
| Deck Result | `?scenario=deck-result` | First development issue solved with card impact result ribbon |
| Strategy | `?scenario=strategy` | Chosen growth path, competition signal badges, rival pressure |
| Counter | `?scenario=counter` | Chosen growth path with a claimed rival product, counter cards, and recommendation UI |
| Rivals | `?scenario=rivals` | Month-12 market with annual strong rivals already entered |
| Arc | `?scenario=arc` | Chosen strategy, 10-month MVP arc, follow-up objective checklist |
| Flow | `?scenario=flow` | v0.56 first 10-minute completion state with launch, office setup, rival counter, and annual-review runway guidance |
| Alpha | `?scenario=alpha` | 10-minute alpha completion with run result, insight reward, and next-run readiness |
| Next Run | `?scenario=next-run` | New run after accepting alpha insight, deck onboarding, run history, and meta unlock candidates |
| Finale | `?scenario=finale` | 10-year campaign ending, final rank, Seoul location, and campaign summary |
| Review | `?scenario=review` | Year-one annual review with passed goals, reward application, and recent review history |
| Annual Directed | `?scenario=annual-directed` | Year-one annual review after choosing the next-year directive, monthly bonus, and recommended menu |
| Year Two Plan | `?scenario=year-two-plan` | Month-13 year-two kickoff after the annual directive monthly bonus has applied |
| Year Two Research | `?scenario=year-two-research` | Month-13 research menu with the annual directive recommendation as a direct research launchpad |
| Year Two Research Complete | `?scenario=year-two-research-complete` | Month-13 research menu after the recommended research is completed, showing level gain, unlocked market, and product candidates |
| Year Two Product Candidate | `?scenario=year-two-product-candidate` | Month-13 products menu after research completion, showing the unlocked-market product candidate and missing research path |
| Year Two Product Ready | `?scenario=year-two-product-ready` | Month-13 products menu after the missing research is completed and the 2nd-year product can be started |
| Year Two Product Started | `?scenario=year-two-product-started` | Month-13 products menu after the 2nd-year product project is started, showing the project confirmation and next deck action |
| Year Two Product Issue Result | `?scenario=year-two-product-issue-result` | Month-13 deck menu after the 2nd-year product resolves its first development issue |
| Year Two Product Launch Impact | `?scenario=year-two-product-launch-impact` | Month-13 company menu after the 2nd-year product ships, showing release impact and pending card reward |
| Alpha Run Complete | `?scenario=alpha-run-complete` | Complete 30-minute roadmap state with first launch, card payoff, growth, annual directive, year-two product start, and guide payoff panel |
| Alpha Run Issue Complete | `?scenario=alpha-run-issue-complete` | Complete 30-minute roadmap after the guide payoff resolves the 2nd-year product's first development issue and retargets to launch |
| Alpha Run Second Launch | `?scenario=alpha-run-second-launch` | Complete 30-minute roadmap after the guide payoff launches the 2nd-year product and keeps the 100% state while the second reward is pending |
| Alpha Run Second Reward Picked | `?scenario=alpha-run-second-reward-picked` | Complete 30-minute roadmap after the second launch reward is picked and the guide retargets to final release/result review |
| Reward Bias | `?scenario=reward-bias` | Deck reward screen with an active annual directive biasing reward cards |
| Foundation | `?scenario=foundation` | Enterprise-stage content foundation, hiring recommendations, agent filters, item recommendations |
| Commercial | `?scenario=commercial` | 10-month commercial-readiness state, run result, achievements, strategy effect, two-product scan |
| Result | `?scenario=result` | Final run recap with representative product, card, rival pressure, and insight reward |
| Readiness | `?scenario=readiness` | v0.20 alpha readiness state from the integrated simulation harness |
| Persona 20 | `?scenario=persona20` | v0.50 alpha-candidate 20-person persona review, P0/P1 status, and first-screen signal QA |
| Launch Impact | `?scenario=launch-impact` | v0.56 card/rival/team launch payoff and reward-panel QA |
| Operations | `?scenario=operations` | v0.40 monthly operations command, office safeguards, staff risk, and zone-linked hiring QA |
| Office Visuals | `?scenario=office-visuals` | v0.55 screenshot QA plus v0.56 rival/staff incident screen-moment QA for the office frame |

Examples:

- `http://localhost:5173/?scenario=fresh`
- `http://localhost:5173/?scenario=staffing`
- `http://localhost:5173/?scenario=project`
- `http://localhost:5173/?scenario=release`
- `http://localhost:5173/?scenario=reward`
- `http://localhost:5173/?scenario=reward-picked`
- `http://localhost:5173/?scenario=growth-picked`
- `http://localhost:5173/?scenario=shop`
- `http://localhost:5173/?scenario=office`
- `http://localhost:5173/?scenario=deck`
- `http://localhost:5173/?scenario=deck-result`
- `http://localhost:5173/?scenario=strategy`
- `http://localhost:5173/?scenario=counter`
- `http://localhost:5173/?scenario=rivals`
- `http://localhost:5173/?scenario=arc`
- `http://localhost:5173/?scenario=flow`
- `http://localhost:5173/?scenario=alpha`
- `http://localhost:5173/?scenario=next-run`
- `http://localhost:5173/?scenario=finale`
- `http://localhost:5173/?scenario=review`
- `http://localhost:5173/?scenario=annual-directed`
- `http://localhost:5173/?scenario=year-two-plan`
- `http://localhost:5173/?scenario=year-two-research`
- `http://localhost:5173/?scenario=year-two-research-complete`
- `http://localhost:5173/?scenario=year-two-product-candidate`
- `http://localhost:5173/?scenario=year-two-product-ready`
- `http://localhost:5173/?scenario=year-two-product-started`
- `http://localhost:5173/?scenario=year-two-product-issue-result`
- `http://localhost:5173/?scenario=year-two-product-launch-impact`
- `http://localhost:5173/?scenario=alpha-run-complete`
- `http://localhost:5173/?scenario=alpha-run-issue-complete`
- `http://localhost:5173/?scenario=alpha-run-second-launch`
- `http://localhost:5173/?scenario=alpha-run-second-reward-picked`
- `http://localhost:5173/?scenario=reward-bias`
- `http://localhost:5173/?scenario=foundation`
- `http://localhost:5173/?scenario=commercial`
- `http://localhost:5173/?scenario=result`
- `http://localhost:5173/?scenario=readiness`
- `http://localhost:5173/?scenario=persona20`
- `http://localhost:5173/?scenario=launch-impact`
- `http://localhost:5173/?scenario=operations`
- `http://localhost:5173/?scenario=office-visuals`

## v0.55 Final Source Art Screenshot QA

URL:

- `?scenario=office-visuals`

Expected:

- The QA pill says `v0.55 스크린샷 QA`.
- The screenshot command is `npm run qa:office-visuals:screenshots`.
- The command writes `reports/qa/screenshots/v0_55_office_visuals_desktop.png` at 1366×768.
- The command writes `reports/qa/screenshots/v0_55_office_visuals_mobile.png` at 390×844.
- The command writes `reports/qa/screenshots/v0_55_office_visuals_screenshots.json` with the source URL, viewport sizes, and file sizes.
- The visual QA manifest status is `draft_candidates_pending_final_replacement`, so reports do not claim final external artwork exists yet.
- Desktop screenshot should show the full game shell, top QA pill, office playfield, management console, resource strip, and command row.
- Mobile screenshot should start at the left edge of the app shell and avoid headless viewport left-crop.
- Mobile command row should keep the strategy hand counter and visible cards inside the 390px game frame without right-edge clipping.
- The visual QA manifest includes `mobile_command_hand_fit` so future screenshot passes keep checking the bottom command HUD.
- Mobile screenshot may compress dense menu panel content, but the main app frame, office scene, resources, command row, and menu tabs remain visible.
- Any final-art replacement pass must rerun this command after `npm run assets:v053` and/or `npm run assets:v054`.

## v0.56 Playtest Slice QA (Planned)

Primary routes:

- `?scenario=staffing`
- `?scenario=project`
- `?scenario=deck`
- `?scenario=deck-result`
- `?scenario=flow`
- `?scenario=launch-impact`
- `?scenario=reward-picked`
- `?scenario=growth-picked`
- `?scenario=annual-directed`
- `?scenario=year-two-plan`
- `?scenario=year-two-research`
- `?scenario=year-two-research-complete`
- `?scenario=year-two-product-candidate`
- `?scenario=year-two-product-ready`
- `?scenario=year-two-product-started`
- `?scenario=year-two-product-issue-result`
- `?scenario=year-two-product-launch-impact`
- `?scenario=office-visuals`

Automation:

- `npm run qa:blind-rehearsal` writes `reports/playtests/v0_56_blind_playtest_rehearsal.md`.
- Add `?playtest=v056&session=1` to any route to show the in-game blind-test observer HUD.
- `npm run qa:blind-summary` writes `reports/playtests/v0_56_blind_playtest_summary.md` and keeps final-art intake blocked until 5/5 real sessions are recorded with exact `Status: 완료`, open P0 is 0, P0 missing count is 0, unrecognized status count is 0, and required tester-profile, observation, and exit-interview evidence is present.
- The blind summary also reports `열린 P1` for triage; open P1 findings stay visible as tuning work but do not block final-art intake when the P0/evidence gate passes.
- `reports/playtests/v0_56_blind_playtest_request_packet.md` is the handoff packet for external facilitators or AGY: it includes request copy, player/facilitator URLs, session files, operating checklist, and the final-art gate.
- `reports/playtests/v0_56_blind_playtest_agy_outbox.md` is the copy-paste message for AGY. It remains `발송 준비 / 실제 발송 미확인` until a human confirms it was sent.
- `reports/playtests/v0_56_blind_playtest_dispatch_log.md` remains `발송 대기 / 실제 발송 미확인` until a human confirms the handoff happened.
- `npm run qa:blind-url-sync` updates the request packet and AGY outbox with `PLAYTEST_BASE_URL` player/facilitator URLs before external sessions.
- `npm run qa:blind-session-links` writes `reports/playtests/v0_56_blind_playtest_session_links.md` with the common player URL, session 01-05 observer URLs, record file names, and each session record status for facilitator handoff.
- `npm run qa:blind-live-check` writes `reports/playtests/v0_56_blind_playtest_live_check.md` and validates the generated link-sheet structure, non-local player/observer URLs, and `Status: 예정` session records; direct `curl -I` remains the HTTP evidence path in this sandbox.
- `npm run qa:blind-readiness` writes `reports/playtests/v0_56_blind_playtest_readiness.md` and confirms the request packet, AGY outbox, untouched `Status: 예정` session files, and waiting art gate before handoff.
- `npm run qa:blind-preflight` writes `reports/playtests/v0_56_blind_playtest_preflight.md` and checks whether `PLAYTEST_BASE_URL` provides a non-local player/facilitator URL, whether early idea/competition tutorials still wait until an active product exists, and whether real sessions/final art remain locked.
- `npm run qa:blind-intake -- --source <folder>` imports returned AGY/facilitator session files only when they use the expected `v0_56_blind_playtest_session_XX.md` names, exact `Status: 완료`, and a non-empty `P0:` line; it writes `reports/playtests/v0_56_blind_playtest_intake.md` and leaves missing sessions untouched.
- `npm run qa:blind-issues` writes `reports/playtests/v0_56_blind_playtest_issue_queue.md` and extracts completed-session P0/P1 findings, next fix candidates, and the most confusing moment for post-session triage.
- `npm run qa:art-gate` reruns `qa:blind-summary` and `qa:blind-issues`, then writes `reports/playtests/v0_56_final_art_intake_gate.md` as the single final graphic asset intake decision.
- `npm run qa:asset-handoff` reruns `qa:art-gate`, then writes `reports/playtests/v0_56_final_art_handoff_packet.md` with the AGY request copy, source-size checklist, import commands, and send/no-send status.
- The blind summary table includes a `증거` column so each session shows `OK`, `-`, or the concrete missing evidence labels.
- The rehearsal confirms QA route coverage only; it is not a substitute for the five real human session files.
- Rehearsal screenshots live under `reports/qa/screenshots/v0_56_blind_rehearsal_*.png`.

Expected:

- The first 10 seconds read as AI company management, not a generic dashboard.
- The fresh route should show an `opening-fantasy-signal` with garage, AI agents, first product launch, rival pressure, and 10-year growth cues.
- The guide tab should show an `alpha-run-roadmap` with the full 30-minute alpha arc: first product launch, card payoff, reward/growth choice, annual directive, and year-two product start.
- The alpha-run roadmap should mark the active milestone, show percentage progress, preview the next reward, and let each milestone act as a click target into the relevant menu or result/company tab.
- The first-launch roadmap milestone should retarget as the player progresses: `팀원 고용`, `제품 개발`, `카드/이슈`, `출시 진행`, then `출시 확인`.
- The office playfield should also show an `alpha-run-focus-strip` with the active alpha-run milestone, percentage progress, next reward preview, and the same state-aware step action button so the goal remains visible outside the guide tab.
- The active alpha-run step action should show `alpha-run-feedback` after click so the player can see which action just advanced and what the next reward is.
- The active alpha-run step action should directly run safe fast-start actions when available: first hire, first project, first issue, first launch, first reward, first growth, first annual review, and the year-two product chain.
- The year-two alpha-run milestone should retarget through `지시 선택`, `엔터프라이즈 연구`, `에이전트 연구`, then `신제품 개발` instead of remaining a generic research/products link.
- The 100% alpha-run completion panel should continue through `다음 개발 이슈`, `출시까지 진행`, `두 번째 보상 고르기`, then `디브리프 보기` without dropping roadmap completion.
- After the second reward is picked, the guide tab should show an `alpha-run-debrief-panel` with products, rewards, year-two outcome, and blind-test readiness highlights.
- The alpha-run debrief should include an `alpha-run-debrief-timeline` for first release, card payoff, annual directive, and second reward.
- The fresh route should show a `첫 팀원 바로 고용` primary guide action before the player has hired anyone.
- The fresh route should show a `first-hire-fast-start` panel with the recommended first teammate, hire cost, and quality/risk badges.
- Clicking the first-hire fast-start action should hire the recommendation through `open_recruiting` and move the player to the products menu.
- After the first hire, the guide should expose a `첫 제품 바로 개발` primary action and a `first-project-fast-start` panel before any project exists.
- Clicking the first-project fast-start action should start the recommended `AI 글쓰기 비서` project with the automatic team and move the player to the deck menu.
- The fresh route's first Mina tutorial should explicitly frame the game as a garage AI company, connect people with AI agents, and push toward first product launch.
- The fresh route should show an `인력 조합` panel that distinguishes `사람 직원`, `AI 에이전트`, and `로봇 인력` before final art is imported.
- The workforce mix panel should show short role badges and core metrics for each lane so the player can scan `감독`, `자동화`, and `현장` roles without reading only long text.
- On 520px-and-under mobile widths, each workforce row should split the role area from status/metric/impact text to reduce line density.
- The office wall HUD should show `TEAM`, `AI OPS`, and `ROBOT` as separate workforce counters.
- The staffing route should show a product-menu `first-project-launchpad` with a recommended first product, automatic team, forecast, and `첫 제품 개발 시작` button.
- The staffing route should also show the guide-side `first-project-fast-start` so the player can start the first product from either the guide or product panel.
- The staffing route should not be covered by idea-composer or competition tutorial modals before the first project starts.
- The project route should show the guide-side `first-issue-fast-start` with `추천 첫 개발 이슈`, `고객 인터뷰`, recommended issue count, and `첫 이슈 바로 해결`.
- Clicking the first-issue fast-start action should use the recommended card before resolving the recommended development issue so `고객 인터뷰` appears in the result impact.
- The `출시까지 진행` guidance action after the first issue should advance to the first release milestone instead of requiring repeated one-month clicks.
- The deck route should show a `첫 개발 이슈` launchpad at the top of the strategy deck panel.
- The deck route should show current project progress, quality, recommended issue tiles, and an `자동 선택 이슈 해결` button.
- The first development issue launchpad should explain that this is the first moment where cards change the result.
- The deck-result route should show a solved `이슈 해결 결과` ribbon with verdict, score, progress gain, quality gain, card impact, solved issue labels, and next goal.
- The deck-result route should include `고객 인터뷰` as the card impact so the result has a concrete card cause.
- The flow route supports first-product-development readability and opens after the first launch, office setup, and rival counter moment.
- The flow route should show the first ten-minute loop at 100% and guide the player toward the year-one annual review.
- The flow route should show `심사까지 진행`, and that guide action should advance directly to the year-one annual review, then route the menu panel to company so the next-year directive choices are immediately visible.
- Advancing the flow route to month 12 should create the first annual review history entry and annual directive choices.
- The launch-impact route must make product name, review/result, resource changes, card influence, rival reaction, and team reaction easy to scan.
- The launch-impact route should show a short event strip for card combo, rival pressure, and team reaction before the deeper result details.
- The launch-impact state includes three launch review snippets for early user, local owner, and market watcher flavor.
- The launch-impact route should show a `launch-next-action-ribbon` with `보상 카드 선택`, `성장 분기 선택`, and `다음 달 진행`.
- The launch-impact next-action ribbon entries should act as buttons that route to the deck menu, results tab, and company menu targets.
- The launch-impact route should keep tutorial helper modals hidden so the launch result panel is not covered during screenshot QA.
- The reward route should show `first-reward-spotlight` before the normal reward choice list when the first post-launch reward is pending.
- The reward route should make `첫 출시 보상 도착`, `3장 중 1장`, and the reward-to-growth flow visible in the deck panel.
- The reward route should show `first-reward-fast-start` in the result/guide surface with `첫 보상 바로 선택` so the first card reward can be accepted without menu hunting.
- The reward route should keep helper tutorial modals hidden so the first reward fast-start and result panel are not covered during screenshot QA.
- The reward-picked route should show `reward-choice-confirmation` with `보상 선택 완료`, the selected card name, `덱에 들어갔습니다`, and `다음은 성장 분기`.
- The reward-picked route should show `first-growth-fast-start` in the result/guide surface with `성장 분기 바로 선택` so the first growth branch can be committed without searching the fork list.
- The reward-picked and growth-picked routes should keep helper tutorial modals hidden so the post-choice confirmations are not covered during screenshot QA.
- The growth-picked route should show `growth-choice-confirmation` with `성장 분기 선택 완료`, the selected branch name, `다음 달부터 월간 보너스`, and `연간 심사까지`.
- The annual-directed route should show `annual-directive-confirmation` with `다음 해 지시 선택 완료`, selected directive title, monthly bonus, recommended menu, duration, `추천 메뉴 열기`, and `2년차 시작`.
- The annual-directed route should open on the company menu after the year-one annual review, hide helper tutorial modals, and keep the confirmation near the top of the company panel for screenshot QA.
- The year-two-plan route should show `year-two-kickoff` with `2년차 운영 시작`, `이번 달 보너스`, `연간 지시 효과`, recommended menu, `추천 메뉴 열기`, and `한 달 더 운영`.
- The year-two-plan route should be month 13 after the year-one annual directive starts paying monthly strategic effects.
- The year-two-research route should open on the research menu and show `annual-research-launchpad` with `연간 지시 추천 연구`, the recommended capability, and `바로 연구`.
- The year-two-research-complete route should show `research-completion-ribbon` with `연구 완료`, level gain, spent resources, `해금 시장`, `제품 후보`, and `제품 후보 보기`.
- The year-two-research-complete mobile screenshot should at least expose the top of `연구 완료` in the first 390×844 viewport so the player sees the reward before scrolling.
- The year-two-product-candidate route should open on the products menu and show `research-product-launchpad` with `연구가 연 제품 후보`, `해금 시장`, `다음 제품 후보`, product forecast, and `필요 연구 보기` when requirements remain.
- The year-two-product-candidate route with `&menu=research` should show `product-candidate-requirement-launchpad` with `제품 후보 필요 연구`, current/needed level, and `바로 연구` for the exact missing capability.
- The year-two-product-ready route should open on the products menu after 에이전트 Lv.2 and 엔터프라이즈 Lv.1 are ready, and the product candidate should show `신제품 개발 시작`.
- The year-two-product-started route should show `research-product-started-ribbon` with `신제품 개발 시작`, product name, progress, quality/trust baseline, assigned team, `다음 개발 이슈`, and `덱 열기`.
- The year-two-product-started route with `&menu=deck` should show the deck launchpad as `신제품 개발 이슈` so the post-start issue step does not read like the first product tutorial.
- The year-two-product-issue-result route should open on the deck menu and show the issue-result ribbon after the 2nd-year product's first development issue raises progress and quality.
- The year-two-product-launch-impact route should open on the company menu after `기업 업무 에이전트` ships, remove its active project, show it in active products, and keep its pending card reward visible.
- The office-visuals route remains the visual reference for rival/staff incidents and office screen readability.
- The office-visuals route should keep the top LED `office-scoreboard` visible with time, team, AI, `ROBOT`, market share, and trust signals above the lower office floor.
- The office-visuals route should show a readable `직원 화면 사건` panel and `경쟁사 화면 사건` panel in the main stage event stack.
- The staff incident panel should expose direct resolution choices, and the rival incident panel should identify the competitor pressure.
- Real-user results should be recorded with `docs/BLIND_PLAYTEST_CHECKLIST.md`, not replaced by AI persona QA.
- The automatic rehearsal report should say `실제 사람 5명 블라인드 테스트가 아님`.
- The observer HUD should say `블라인드 테스트 관찰`, show the session record path, and keep `?playtest=v056` visible.
- The summary report should show `아트 투입 판정: 대기` until the five real sessions are recorded with exact `Status: 완료`, open P0 is 0, P0 missing count is 0, unrecognized status count is 0, and required tester-profile, observation, and exit-interview evidence is present.
- The summary report should expose a `증거` table column; pending rows show `-`, complete rows with full evidence show `OK`, and incomplete complete rows list the missing fields.
- The issue queue report should show `Status: 실제 세션 대기`, `실제 세션: 0/5`, `P0 큐: 0`, and `P1 큐: 0` before real sessions are filled.
- After real sessions are filled, any P0 queue item must be closed before final graphic asset intake; P1 queue items can remain as tuning backlog if the summary gate passes.
- The final art intake gate report should show `Status: 실제 세션 대기`, `실제 세션: 0/5`, and `최종 그래픽 에셋 투입: 대기` before real sessions are filled.
- Final graphic asset intake should only start when `npm run qa:art-gate` reports `최종 그래픽 에셋 투입: 가능`.
- The final art handoff packet should show `Status: 아트 요청 대기` and `AGY 발송 금지` until the final art intake gate is possible.
- The preflight report should show `Status: 원격 URL 필요` until a real tunnel or preview URL is provided through `PLAYTEST_BASE_URL`; with a non-local base URL it should verify the player/facilitator URLs and report whether the request packet/AGY outbox are `동기화 완료` or still need `qa:blind-url-sync`.
- The preflight report should keep `튜토리얼 딜레이: OK`, confirming that idea-composer and competition tutorial prompts do not appear before the first product/project moment.
- Once the final art gate is possible, the handoff packet should switch to `Status: 아트 요청 가능` and include the required 1152×9600, 2560×1920, and 5120×2880 RGBA PNG source specs.
- Five prepared real-user session files live under `reports/playtests/v0_56_blind_playtest_session_01.md` through `session_05.md`.
- Prepared session files must remain `Status: 예정` until a real observed session happens.

## v0.54 Office Object and Backdrop Art Import QA (Historical)

URL:

- `?scenario=office-visuals`

Expected:

- Historical baseline only. The current active visual QA entry is the v0.55 section above.
- The old QA pill said `v0.54 오브젝트/배경 임포트 QA`.
- The current agent sheet is `agents_v053_final_art_import`.
- The current office object sheet is `office_objects_v054_final_art_import`.
- The current office backdrop is `office_isometric_v054_final_art_import`.
- The object source sheet points to `source/v054-office-objects-final-source.png` and is 2560×1920.
- The object runtime sheet points to `v054-office-objects-final.png` and is 1280×960.
- The backdrop source points to `source/v054-isometric-office-final-source.png` and is 5120×2880.
- The backdrop runtime asset points to `v054-isometric-office-final.png` and is 2560×1440.
- `npm run assets:v054` regenerates the source candidates and normalized runtime assets.
- `npm run assets:v054 -- --objects-source <원본PNG> --backdrop-source <원본PNG>` can replace both high-resolution source candidates and regenerate runtime art.
- The manifest includes `source_path`, `source_scale`, `normalized_from`, `source_origin`, `import_pipeline`, and `normalization_method` for the v0.54 office object sheet.
- The manifest includes `source_path`, `source_width`, `source_height`, `source_scale`, `normalized_from`, `source_origin`, `import_pipeline`, and `normalization_method` for the v0.54 backdrop.
- The source sheet points to `source/v053-agents-event-poses-final-source.png` and is 1152×9600.
- The runtime sheet points to `v053-agents-event-poses-final.png` and is 576×4800.
- Source frames are 384×384, game frames are 192×192, and the sheet keeps the 3-column, 25-row, 75-frame event-pose layout.
- The manifest includes `source_path`, `source_scale`, `normalized_from`, `source_origin`, `import_pipeline`, `normalization_method`, `anchor_reference`, `anchor_tolerance_px`, and `silhouette_drift_tolerance_px`.
- `npm run assets:v053 -- --source <원본PNG>` can replace the source candidate and regenerate the runtime atlas.
- Priority actors can use `card_use`, `cheer`, and `alert` pose rows in addition to idle/work.
- The office scene plan exposes at least one `card_use` actor pose from `프롬프트 스프린트`.
- The office scene plan exposes at least one `alert` actor pose from a care-risk actor.
- The office playfield includes `office-event-reaction-layer` and at least one `card_use` reaction from `프롬프트 스프린트`.
- Reaction bubbles use `office_reactions.json` position, tone, and duration metadata.
- The reaction layer does not intercept clicks on office actors or direct care buttons.
- The office playfield shows the `v054-isometric-office-final.png` pixel-art backdrop.
- Human/AI priority actors render with `v053-agents-event-poses-final.png` sprite-sheet frames rather than CSS-only body blocks.
- Human/AI priority actors include `sprite-sheet-animated` and cycle through their 3-frame idle/work rows.
- Placed office items render with `v054-office-objects-final.png` sprite-sheet frames.
- The in-scene `sprite-sheet-inspector` shows representative character and object atlas frames plus source/game frame sizes.
- Actors, decor props, and office objects keep stable front/back ordering as their y positions change.
- The actor focus panel and direct care actions from v0.44 still work.
- Browser console has no runtime errors and narrow/mobile view does not create horizontal page overflow.

## v0.53 Final Character Art Import QA (Historical)

URL:

- `?scenario=office-visuals`

Expected:

- Historical baseline only. The current active visual QA entry is the v0.54 section above.
- The old QA pill said `v0.53 최종 아트 임포트 QA`.
- The old current object sheet was `office_objects_v046_hires_isometric`.
- The old current backdrop was `office_isometric_v046_hires`.
- Character import expectations still apply through the current `agents_v053_final_art_import` sheet.

## v0.52 Source Sprite Replacement QA (Historical)

URL:

- `?scenario=office-visuals`

Expected:

- Historical baseline only. The current active visual QA entry is the v0.54 section above.
- The old QA pill said `v0.52 사무실 원본 시트 QA`.
- The old current agent sheet was `agents_v052_source_event_poses`.
- The old source sheet pointed to `source/v052-agents-event-poses-source.png`.
- The old runtime sheet pointed to `v052-agents-event-poses.png`.

## v0.51 Office Event Pose QA (Historical)

URL:

- `?scenario=office-visuals`

Expected:

- Historical baseline only. The current active visual QA entry is the v0.54 section above.
- The old QA pill said `v0.51 사무실 이벤트 포즈 QA`.
- The old agent sheet was `agents_v051_event_poses` and pointed to `v051-agents-event-poses.png`.
- Priority actors could use `card_use`, `cheer`, and `alert` pose rows in addition to idle/work.

## v0.49 Office Event Reaction QA (Historical)

URL:

- `?scenario=office-visuals`

Expected:

- Historical baseline only. The current active visual QA entry is the v0.54 section above.
- The old QA pill said `v0.49 사무실 이벤트 리액션 QA`.
- The office playfield included `office-event-reaction-layer` and at least one `card_use` reaction from `프롬프트 스프린트`.

## v0.50 Alpha Candidate Persona QA

URL:

- `?scenario=persona20`

Expected:

- The top QA pill says `v0.50 알파 후보 20인 페르소나 QA`.
- The active menu is `회사 기록`.
- The first timeline entry includes `v0.50 20인 페르소나`.
- The timeline lists `P0/P1: 없음`.
- The timeline includes first-30-second signals for `사무실 판타지`, `이번 달 목표`, and `다음 행동`.
- The timeline lists current v0.50 priorities, including event pose-sheet expansion and latest-screen retest records.
- The old v0.21 right-side support-panel compression priority is not shown as an active alpha-candidate blocker.

## v0.44 Office Actor Care QA

URL:

- `?scenario=office-visuals`

Expected:

- The QA pill says `v0.44 액터 케어/사무실 액터 QA`.
- The default focus panel selects a care-risk actor.
- The focus panel can show `즉시 휴식` and `연봉 협상` direct action buttons with costs.
- Clicking `연봉 협상` immediately updates the timeline with an `연봉 협상` entry and keeps the player on the office screen.
- Clicking `즉시 휴식` immediately updates the timeline with a `유급 휴식` entry and keeps the player on the office screen.
- Browser console has no runtime errors and narrow/mobile view does not create horizontal page overflow.

## v0.43 Graphic Asset Game Screen QA

URL:

- `?scenario=office-visuals`

Expected:

- The QA pill says `v0.44 액터 케어/사무실 액터 QA`.
- The office playfield shows the graphic asset wall sourced from `asset_manifest.json`.
- The asset wall includes agent, competitor, item, and office object miniatures.
- Placed office items render as visible pixel decor props in the office.
- The top rival HUD includes competitor logo miniatures, not only text labels.
- The screen still shows human, AI, and robot actors plus the actor focus panel.
- Browser console has no runtime errors and narrow/mobile view does not create horizontal page overflow.

## v0.42 Office Actor Interaction QA

URL:

- `?scenario=office-visuals`
- `?scenario=office-visuals&menu=agents`

Expected:

- The QA pill says `v0.42 사무실 액터 QA`.
- The office playfield shows data-driven zone objects such as compute bay, launch stage, robot bay, and chip lab.
- Human, AI, and robot actors are visible as distinct pixel actors.
- Actor bubbles show project assignment, recovery, warning, or idle state.
- Clicking an actor selects it and opens the compact actor focus panel.
- The focus panel shows energy/loyalty meters and routes working actors to Products or care-risk actors to Agents.
- The office alert strip includes the active zone/activity ticker.
- Browser console has no runtime errors and narrow/mobile view does not create horizontal page overflow.

## v0.40 Operations Command QA

URL:

- `?scenario=operations`
- `?scenario=operations&menu=agents`
- `?scenario=operations&menu=shop`

Expected:

- The QA pill says `v0.40 운영 의제 QA`.
- The office playfield shows an `운영 의제` panel without covering the bottom turn goal.
- The command panel lists three immediate priorities such as staff care, product development, and office zone growth.
- The company side tab mentions active office zones and operating safeguards.
- Agents menu still shows the staff incident panel for the exhausted key worker.
- Shop menu shows active office zones, including robotics or chip-related next goals when conditions are near completion.
- Browser console has no runtime errors and narrow/mobile view does not create horizontal page overflow.

## v0.22 Launch Impact QA

URL:

- `?scenario=launch-impact`
- `?scenario=launch-impact&menu=log`

Expected:

- The QA pill says `v0.22 출시 체감 QA`.
- The result tab shows a launch impact panel under the release headline.
- The impact panel includes `첫 5분 보상`, `카드 보상 3장`, and `카드 영향`.
- The panel names recently used cards such as `프롬프트 스프린트` and `고객 인터뷰`.
- The log menu shows compact highlight moment cards for launch, rival pressure, or deck reward.

## v0.21 Persona 20 QA (Historical)

URL:

- `?scenario=persona20`

Expected:

- Historical baseline only. The current active persona QA entry is the v0.50 section above.
- The old top QA pill said `v0.21 20인 페르소나 QA`.
- The active menu is `회사 기록`.
- The first timeline entry includes `v0.21 20인 페르소나`.
- The timeline lists improvement priorities, including right-side panel compression.
- The right-side stage area uses `목표 / 회사 / 월간 / 결과` tabs instead of always showing every support card.

## v0.20 Alpha Readiness QA

URL:

- `?scenario=readiness`

Expected:

- The top QA pill says `v0.20 알파 준비도 QA`.
- The company state is at the 10-year ending window.
- The timeline includes `v0.20 알파 준비도`.
- The company panel shows annual review, run result, and campaign progress without blocking the office scene.
- This scenario is the default visual entry point before a v0.20 playtest pass.

## v0.14.7 Visual QA Checklist

- Card reward panel shows the current annual directive bias while a reward choice is pending.
- The bias strip names the directive and explains the favored card tags.
- The strip appears above the three reward card choices and does not push buttons out of view.
- `?scenario=reward-bias` opens directly on this state.
- Reward cards matching the annual directive show a `지시 보너스` badge.

## v0.15.0 Annual Strategy Room QA

URL:

- `?scenario=annual-strategy`

Expected:

- The company menu opens directly.
- The annual directive is `신뢰 복리 프로그램`.
- The `연간 전략실` panel is visible in the annual review area.
- Product recommendations include a trust/enterprise-aligned product such as `고객지원 챗봇`.
- Research recommendations include safety or enterprise-aligned capabilities.
- Rival counter recommendations show the pressured competitor when one has claimed a matching product space.

## v0.14.6 Functional QA Checklist

- Choose `신뢰 복리 프로그램` after an annual review.
- Release a product while that directive is active.
- Card reward choices should favor trust/safety/enterprise cards such as `세이프티 리뷰` or `상호운용 방어막`.
- Save and reload should preserve the active directive's reward bias tags.
- Data validation should fail if an annual directive choice has no `reward_bias_tags`.

## v0.14.5 Visual QA Checklist

- Review scenario shows `다음 해 운영 지시 3택1` inside the annual review card.
- Three directive choices are visible after the year-one review.
- Each directive choice shows title, description, monthly effects, recommended menu, and a `선택` button.
- Choosing a directive replaces the active `다음 해 지시` and clears the pending choice list.
- The chosen directive remains compact enough to fit in the company panel without page-level scrolling.

## v0.14.4 Visual QA Checklist

- Review scenario shows `다음 해 지시` inside the annual review card.
- The directive shows monthly effects, recommended menu, and expiry month.
- Month-12 review scenario creates the passed directive `지역 투자자 모멘텀`.
- Timeline keeps the annual review result readable before the directive entry.
- Competition movement after a review has a visible benchmark or pressure signal.

## v0.14.3 Visual QA Checklist

- Company menu shows the `연간 심사` card under the 10-year campaign card.
- Annual review card shows title, description, percent meter, countdown, reward, and goal progress.
- `?scenario=review` opens directly on the company menu at month 12.
- Review scenario shows a passed recent result for `지역 AI 데모데이`.
- Advancing from month 11 to 12 records an `연간 심사` timeline entry.

## v0.14.2 Visual QA Checklist

- Company menu shows the `기반 다지기` card with current content phase.
- Agents menu shows current foundation phase, recommendation reasons, and people/AI/robot filters.
- Shop menu shows item recommendation reasons and category filters.
- `?scenario=foundation` opens directly on the agent menu in an enterprise-stage company.
- Recommended enterprise-stage content includes robot or hardware/manufacturing/mobility foundations.

## v0.14.0 Visual QA Checklist

- Fresh scenario starts in `강원 산골 차고` with a 1-star company.
- Top HUD shows campaign year/month, company stars, day/night phase, and region.
- Advancing a month alternates the office mood between day and night.
- Company menu shows 10-year campaign progress and regional relocation cards.
- Agent menu shows AI operation capacity and human staff guidance.
- `?scenario=finale` shows a 10-year ending card with rank and final score.
- Loading a saved game after at least one real day shows the offline settlement popup.

## v0.9.3 Visual QA Checklist

- Top status pills wrap instead of overflowing.
- QA scenario pill appears when a scenario URL is loaded.
- Office objects do not hide the primary staff sprite or launch screen.
- Objective strip fits in the guidance card.
- Release spotlight shows grade, score, quote, expansion hint, and three growth fork cards.
- Mobile/narrow layout hides extra office objects and keeps the launch screen readable.

## v0.9.5 Visual QA Checklist

- Release growth fork cards are visible without hiding the release grade.
- Growth path titles, descriptions, and payoff lines fit inside each card.
- Clicking each growth path card routes to its target menu.
- The post-release guidance card says `다음 성장 분기 선택`.

## v0.9.6 Visual QA Checklist

- Clicking one growth path marks it as selected and does not apply alternate bonuses.
- The company stage card shows `전략: ...` after choosing a path.
- Non-selected growth path cards visibly read as lower priority after commitment.
- The objective strip marks `다음 성장 선택` complete after commitment.

## v0.10.1 Visual QA Checklist

- Strategy scenario opens on the competition menu with signal badges visible.
- Arc scenario opens on the company menu with 10-month MVP progress visible.
- Strategy objective checklist and 10-month arc do not overflow the company panel.
- QA scenario pill appears for `strategy` and `arc`.

## v0.11.0 Visual QA Checklist

- Commercial scenario opens with a visible `런 결과` card.
- Commercial scenario shows at least two active products in the command row.
- Run summary rank penalizes heavy negative cash and recommends a cash/automation recovery action.
- Company panel shows `상용 런 목표`, achievement progress, and strategy monthly effects.
- Monthly report includes the strategy effect row.
- Open event panel and run summary can coexist without overlapping the office scene.

## v0.12.0 Visual QA Checklist

- Deck scenario opens on the `덱` menu.
- Strategy hand shows at least four cards with cost, effect, and use button.
- Active project puzzle shows a 3x3 issue board.
- `선택 이슈 해결` updates the recent puzzle result without layout shift.
- Meta unlock cards show founder insight cost and unlocked card names.
- Top status bar shows run number and founder insight without overflow.

## v0.12.1 Visual QA Checklist

- Puzzle board tiles are buttons and show selected/unselected state.
- Selection counter shows the current selected count and the current limit.
- Playing a puzzle-modifying card shows a visible card modifier row.
- A modified tile shows the source card name under the tile.
- The solve button is disabled when no tile is selected or too many tiles are selected.
- Recent puzzle result shows the applied card modifier name.

## v0.12.2 Visual QA Checklist

- Staffing scenario opens on the `제품` menu with at least two hired agents.
- Product cards show explicit agent selection buttons.
- Selected team forecast shows estimated months, expected quality, review grade/score, and monthly quality gain.
- Starting a project assigns only the selected agents.
- Office scene shows hired agent sprites with name tags and a project board.
- Shop scenario shows inventory counts for owned items, unequipped gear, and office effects.
- Deck scenario still shows card hand, puzzle board, and selected puzzle solve button after the staffing UI changes.

## v0.12.3 Visual QA Checklist

- Reward scenario opens on the `덱` menu.
- The `카드 보상과 덱 편집` panel is visible.
- Pending release reward shows three card choices and a `덱에 추가` button for each valid choice.
- Deck summary shows edit token count and reward pending state.
- Deck edit list shows each current card count, effect text, and `강화`/`제거` buttons.
- Removing is disabled for last copies or when no edit token remains.
- Upgraded cards show stronger positive effects and a visible upgraded state.
- Narrow layout stacks reward choices and deck edit rows without text overlap.

## v0.12.4 Visual QA Checklist

- Products menu shows the expansion map for foundation models, chips, mobility, robotics, odd industries, and toys.
- `파운데이션 모델 v0` appears as an early launchable model product.
- Products include far expansion targets such as AI training chips, autonomous vehicles, robot fleets, AI cafe chain, and toys.
- Competition menu starts with at least eight active rivals.
- Rivals scenario opens on month 12+ and shows AutoNova Motors and BrewChain as active competitors.
- Competition profile panel shows upcoming annual challengers before they enter.
- Agent menu includes a locked robot-style development worker until robotics capability is researched.
- Deck menu copy frames the 3x3 board as optional issue response, not the main development loop.

## v0.12.5 Visual QA Checklist

- Result scenario opens on the company menu with a visible `런 결과` card.
- Run result card shows rank, score, representative product, representative card, and rival pressure.
- Insight reward card shows `창업 통찰 +N` and the reward breakdown.
- `통찰 받고 새 런` starts a new run and increments the run number.
- After starting a new run, deck menu shows `최근 런 기록`.
- Products menu shows a domain filter row and a filter summary.
- Clicking locked domains still shows their product candidates and locked product reasons.
- Narrow layout stacks result spotlight and product filters without text overlap.

## v0.12.6 Visual QA Checklist

- Counter scenario opens on the `경쟁` menu.
- QA pill shows `경쟁 대응 QA`.
- Ranking cards show `대응` hints for the highest-pressure rivals.
- Competition profile panel shows `대응 플랜` cards with card/research recommendations.
- Competitor cards show `추천 대응` with recommended cards, products, and research.
- Deck menu shows the most urgent rival counter advice above the hand.
- Playing `시장 리포지셔닝` lowers the top rival's pressure and records the rival name in the timeline.

## v0.12.7 Visual QA Checklist

- Office scenario opens on the `상점` menu.
- QA pill shows `사무실 확장 QA`.
- Office scene wall shows the current office name, team capacity, and decoration slots.
- Inventory panel shows current office, next office expansion, hire capacity, and decoration capacity.
- Placed decorations list shows active decoration effects and `보관` buttons.
- Stored decorations list shows unplaced decor or an empty state.
- Company summary shows office name, hire capacity, and active decoration count.
- Narrow layout stacks office expansion and decoration rows without button/text overlap.

## v0.12.8 Visual QA Checklist

- Fresh scenario guidance shows `1단계` and the active `에이전트 고용` roadmap item.
- Project scenario guidance points to `카드와 개발 이슈로 품질 올리기`.
- Guidance card shows the full `첫 10분 루프` roadmap.
- Completed roadmap items use a different state from the current active item.
- Flow scenario opens on the `회사` menu with QA pill `첫 10분 흐름 QA`.
- Flow scenario shows `사무실 정비` complete and `경쟁 대응` as the next visible objective.
- Roadmap stacks cleanly on narrow layouts without text overlap.

## v0.13.0 Visual QA Checklist

- Alpha scenario opens on the `회사` menu.
- QA pill shows `10분 알파 완주 QA`.
- Run result card is visible.
- Run result card shows rank, score, representative product, representative card, rival pressure, and insight reward.
- `통찰 받고 새 런` button is visible.
- Company timeline includes `10분 알파 완주 QA`.
- The first 10-minute roadmap is fully complete or points to the post-run action.

## v0.13.1 Visual QA Checklist

- Alpha scenario result card shows `다음 런 브리핑`.
- Next-run briefing shows projected run number and founder insight.
- Next-run briefing lists carryovers and unlock candidates before the button.
- Next-run briefing lists three opening moves for the next run.
- `통찰 받고 새 런` remains visible after the briefing.
- Narrow layout stacks the briefing grid without text overlap.
- Narrow layout keeps run result, insight card, and roadmap readable.

## v0.13.2 Visual QA Checklist

- Next Run scenario opens on the `덱` menu.
- QA pill shows `새 런 진입 QA`.
- Deck menu shows `새 런 브리핑`.
- New run briefing shows run 2, current founder insight, and previous run score/product/card.
- New run briefing lists three first actions for the new run.
- `최근 런 기록` and `로그라이트 해금` remain visible below the briefing.

## v0.13.3 Visual QA Checklist

- Desktop 1366x768 shows top status, left resource rail, center office scene, and right menu panel in one viewport.
- Page body does not become a long web document on desktop.
- Right menu panel scrolls internally when deck/product content is long.
- `다음 달` remains the largest persistent command in the left rail.
- Menu rail shows grouped sections: `운영`, `성장`, `시장`.
- Mobile width hides secondary status chips and keeps the office scene readable.

## Note

If local browser automation cannot connect from the Codex environment, still run:

- `npm test`
- `npm run validate:data`
- `npm run build`

Then record the browser limitation in the QA report.
