# QA Scenarios — AI Company Tycoon: Boundaryless

Date: 2026-05-15

## Purpose

Stable browser entry points for checking important UI states without manually playing into each state.

## Scenario URLs

Use the local app URL and append one of these query strings:

| Scenario | Query | Purpose |
|---|---|---|
| Fresh | `?scenario=fresh` | First screen, first objective, no hired agents |
| Project | `?scenario=project` | First product in development, progress UI, objective state |
| Release | `?scenario=release` | Release spotlight, growth fork cards, boundaryless expansion hint, office scene |
| Shop | `?scenario=shop` | Post-release shop guidance and item-card scanability |

Examples:

- `http://localhost:5173/?scenario=fresh`
- `http://localhost:5173/?scenario=project`
- `http://localhost:5173/?scenario=release`
- `http://localhost:5173/?scenario=shop`

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

## Note

If local browser automation cannot connect from the Codex environment, still run:

- `npm test`
- `npm run validate:data`
- `npm run build`

Then record the browser limitation in the QA report.
