# QA Scenarios — AI Company Tycoon: Boundaryless

Date: 2026-05-16

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
| Reward | `?scenario=reward` | Post-release card reward, deck edit tokens, card remove/upgrade UI |
| Shop | `?scenario=shop` | Post-release shop guidance and item-card scanability |
| Office | `?scenario=office` | Expanded office, placed decorations, decoration management, next office upgrade |
| Deck | `?scenario=deck` | Active project with strategy hand, development puzzle, and meta unlock panel |
| Strategy | `?scenario=strategy` | Chosen growth path, competition signal badges, rival pressure |
| Counter | `?scenario=counter` | Chosen growth path with a claimed rival product, counter cards, and recommendation UI |
| Rivals | `?scenario=rivals` | Month-12 market with annual strong rivals already entered |
| Arc | `?scenario=arc` | Chosen strategy, 10-month MVP arc, follow-up objective checklist |
| Flow | `?scenario=flow` | First 10-minute loop with growth choice, office setup, and next rival counter guidance |
| Alpha | `?scenario=alpha` | 10-minute alpha completion with run result, insight reward, and next-run readiness |
| Next Run | `?scenario=next-run` | New run after accepting alpha insight, deck onboarding, run history, and meta unlock candidates |
| Finale | `?scenario=finale` | 10-year campaign ending, final rank, Seoul location, and campaign summary |
| Review | `?scenario=review` | Year-one annual review with passed goals, reward application, and recent review history |
| Foundation | `?scenario=foundation` | Enterprise-stage content foundation, hiring recommendations, agent filters, item recommendations |
| Commercial | `?scenario=commercial` | 10-month commercial-readiness state, run result, achievements, strategy effect, two-product scan |
| Result | `?scenario=result` | Final run recap with representative product, card, rival pressure, and insight reward |

Examples:

- `http://localhost:5173/?scenario=fresh`
- `http://localhost:5173/?scenario=staffing`
- `http://localhost:5173/?scenario=project`
- `http://localhost:5173/?scenario=release`
- `http://localhost:5173/?scenario=reward`
- `http://localhost:5173/?scenario=shop`
- `http://localhost:5173/?scenario=office`
- `http://localhost:5173/?scenario=deck`
- `http://localhost:5173/?scenario=strategy`
- `http://localhost:5173/?scenario=counter`
- `http://localhost:5173/?scenario=rivals`
- `http://localhost:5173/?scenario=arc`
- `http://localhost:5173/?scenario=flow`
- `http://localhost:5173/?scenario=alpha`
- `http://localhost:5173/?scenario=next-run`
- `http://localhost:5173/?scenario=finale`
- `http://localhost:5173/?scenario=review`
- `http://localhost:5173/?scenario=foundation`
- `http://localhost:5173/?scenario=commercial`
- `http://localhost:5173/?scenario=result`

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
