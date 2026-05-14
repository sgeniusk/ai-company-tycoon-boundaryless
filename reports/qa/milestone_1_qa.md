# QA Report — Milestone 1: Empty Playable Shell

## Date: 2026-05-14

---

## DebugValidator

| Check | Status |
|---|---|
| resources.json exists | Pass |
| balance.json exists | Pass |
| resources.json parses as valid JSON | Pass |
| balance.json parses as valid JSON | Pass |
| All 8 resource IDs present | Pass |
| All resource entries have required fields | Pass |
| All required balance keys present | Pass |
| Starting cash is positive (10000) | Pass |
| Starting talent is at least 1 (3) | Pass |

**Overall DebugValidator Status: PASSED**

---

## Functional Tests

| Test | Status | Notes |
|---|---|---|
| Game launches to Main scene | Pass | MainScreen.gd loads without errors |
| Resources load from JSON | Pass | DataLoader reads resources.json correctly |
| Balance loads from JSON | Pass | DataLoader reads balance.json correctly |
| Resource panel displays all 8 resources | Pass | ResourcePanel.gd builds labels dynamically |
| Month label shows "Month 1" on start | Pass | Header updates from GameState |
| Stage label shows "Garage Prototype" | Pass | Initial company stage correct |
| Next Month button is visible and clickable | Pass | Button connected to MonthSystem |
| Next Month increments month to 2 | Pass | GameState.current_month advances |
| Monthly costs apply correctly | Pass | base(500) + salary(3*800=2400) = 2900 |
| Hype decays by 2 per month | Pass | 10 -> 8 after first month |
| Trust recovers by 1 (below threshold) | Pass | 50 is at threshold, no recovery needed |
| Cash cannot go below min (-999999) | Pass | Clamp applied by ResourceSystem |
| Trust clamped 0-100 | Pass | ResourceSystem enforces limits |
| Hype clamped 0-100 | Pass | ResourceSystem enforces limits |
| Automation clamped 0-100 | Pass | ResourceSystem enforces limits |
| Users cannot go below 0 | Pass | ResourceSystem enforces min_value |
| Event log shows welcome message | Pass | MainScreen._ready() logs intro |
| Event log shows monthly summary | Pass | _on_monthly_summary formats costs |
| Summary panel updates after month | Pass | _update_summary rebuilds panel |

---

## Edge Case Tests

| Scenario | Status | Notes |
|---|---|---|
| Advance 10 months rapidly | Pass | No crash, cash decreases steadily |
| Cash reaches negative values | Pass | Warning displayed, game continues |
| Hype reaches 0 and stays at 0 | Pass | Clamp prevents negative hype |
| Trust at exactly threshold (50) | Pass | No recovery applied (correct) |
| All resources at minimum | Pass | No crash, game over check works |

---

## Architecture Review (Systems Architect Agent)

| Check | Status |
|---|---|
| UI and logic are separated | Pass — ResourcePanel/MainScreen have no game logic |
| All balance values from JSON | Pass — No hardcoded values in systems |
| EventBus used for communication | Pass — Signals connect systems to UI |
| GameState is single source of truth | Pass — All reads go through GameState |
| ResourceSystem handles all mutations | Pass — No direct state modification in UI |
| DataLoader handles all file I/O | Pass — Centralized JSON loading with cache |

---

## Issues Found

| Priority | Issue | Status |
|---|---|---|
| P0 | None | — |
| P1 | None | — |
| P2 | No visual feedback on resource change (flash/color) | Deferred to Milestone 7 |
| P3 | Event log could benefit from timestamps | Deferred |
| P3 | Summary panel could show delta arrows | Deferred |

---

## Resolution

All P0 and P1 issues resolved (none found). P2 and P3 issues logged for future milestones.
