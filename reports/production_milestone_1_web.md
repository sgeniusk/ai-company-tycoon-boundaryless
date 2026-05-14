# Production Report - Web Milestone 1: Playable Dashboard Shell

## Date

2026-05-14

## Summary

The active project direction is now a Korean-first web prototype benchmarked against the compact management loop of Game Dev Story iOS. Milestone 1 delivers a playable dashboard shell where the player can inspect company state, launch the first AI product, advance the month, see resource changes, read locked product requirements, and view company stage plus monthly performance.

The older Godot milestone reports remain as legacy reference. This report is the source of truth for the web restart.

## Delivered

- Vite + React + TypeScript dashboard remains the active runtime.
- Korean player-facing UI labels are in place.
- Product list supports launchable and locked product states.
- Locked products explain missing domains, capabilities, trust, or resources.
- `AI 글쓰기 비서` can be launched from the starting state.
- `다음 달` advances time and records monthly results.
- Company stage is calculated from data and shown on screen.
- Monthly report shows revenue, cost, new users, and compute pressure.
- Simulation tests cover company stage and monthly report behavior.

## Acceptance Criteria

| Criterion | Result |
|---|---|
| Web app launches at localhost | Passed |
| Resource strip displays Korean resource names | Passed |
| Product list has launch buttons | Passed |
| Locked products explain requirements | Passed |
| At least one product launches from starting state | Passed |
| Month advances through `다음 달` | Passed |
| Resource changes are visible | Passed |
| Company stage is visible | Passed |
| Monthly report appears after month advancement | Passed |
| Data validation, tests, and production build pass | Passed |

## Agent Review

### Executive Producer

Milestone 1 is complete for the web restart. The build now has a clear first action and demonstrates the smallest playable loop without expanding scope beyond dashboard shell work.

### Game Designer

The shell now points toward the intended Game Dev Story-style loop: small company, first product, monthly report, and company stage. The next design priority is making product launches feel more like product development outcomes, with market response and review-style feedback.

### Systems Architect

Simulation state remains outside the React components. Company stage calculation is data-driven through `company_stages.json`. Monthly report is stored in `GameState`, and UI only renders it.

### QA

Fresh verification commands pass. Browser flow was checked against the running local app. No console errors were found.

### Balance

Balance is only lightly testable at this milestone. The starting state supports one launchable product and produces early revenue plus cost pressure. Full balance review begins in Milestone 2.

### UX

Korean labels, first action, locked reasons, company stage, and monthly report are visible. The screen is still more dashboard-like than a finished Kairosoft-style game, so Milestone 2 should add more charm and feedback around launches.

## Issues

- P0: None.
- P1: None.
- P2: Product launch lacks review/score feedback.
- P2: Company stage is text-only; no office/team visual yet.
- P3: Resource changes do not animate.

## Next Step

Proceed to Milestone 2: Product Launch Loop.

Priority features:

- Product-level monthly revenue/users/data/compute contribution.
- Product performance or review score inspired by Game Dev Story's post-release feedback.
- Better monthly report copy with small narrative beats.
- First synthetic event or market reaction after launch.
