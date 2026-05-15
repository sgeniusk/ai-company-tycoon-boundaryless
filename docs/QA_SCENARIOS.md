# QA Scenarios — AI Company Tycoon: Boundaryless

Date: 2026-05-15

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
| Shop | `?scenario=shop` | Post-release shop guidance and item-card scanability |
| Deck | `?scenario=deck` | Active project with strategy hand, development puzzle, and meta unlock panel |
| Strategy | `?scenario=strategy` | Chosen growth path, competition signal badges, rival pressure |
| Arc | `?scenario=arc` | Chosen strategy, 10-month MVP arc, follow-up objective checklist |
| Commercial | `?scenario=commercial` | 10-month commercial-readiness state, run result, achievements, strategy effect, two-product scan |

Examples:

- `http://localhost:5173/?scenario=fresh`
- `http://localhost:5173/?scenario=staffing`
- `http://localhost:5173/?scenario=project`
- `http://localhost:5173/?scenario=release`
- `http://localhost:5173/?scenario=shop`
- `http://localhost:5173/?scenario=deck`
- `http://localhost:5173/?scenario=strategy`
- `http://localhost:5173/?scenario=arc`
- `http://localhost:5173/?scenario=commercial`

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

## Note

If local browser automation cannot connect from the Codex environment, still run:

- `npm test`
- `npm run validate:data`
- `npm run build`

Then record the browser limitation in the QA report.
