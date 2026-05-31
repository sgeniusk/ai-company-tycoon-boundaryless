# v0.71 Milestone Modal Dismiss Fix QA Run

Date: 2026-05-31

## Bug

- User report: the "마일스톤 달성" window did not disappear after pressing "확인".
- Reproduction: `?scenario=milestones` opened the payoff celebration modal, but Playwright click timed out because `.office-actor-focus-panel` intercepted pointer events over the button.

## Root Cause

- `EventPanels` renders modal overlays inside `.event-stack`.
- `.event-stack` intentionally has `pointer-events: none` so non-modal event cards do not block the game stage.
- Fixed overlays inside that stack inherited `pointer-events: none`, so the visible modal button was not actually the pointer target.

## Fix

- Added `pointer-events: auto` to:
  - `.big-event-overlay`
  - `.payoff-celebration-overlay`
  - `.world-reveal-overlay`
- Added layout-contract coverage so all event-stack modal overlays must opt back into pointer events.

## TDD Evidence

- RED: `npm test -- src/ui/layout-contract.test.ts < /dev/null`
  - Failed 3 assertions for missing `pointer-events: auto` on world reveal, big event, and payoff celebration overlays.
- GREEN: `npm test -- src/ui/layout-contract.test.ts < /dev/null`
  - Result: 1 file passed / 97 tests passed.

## Browser Smoke

Scenario: `http://127.0.0.1:5222/?scenario=milestones`

- Before click:
  - Title: `『첫 제품 출시』 달성!`
  - Pill: `마일스톤 달성`
  - Overlay pointer events: `auto`
  - Button pointer events: `auto`
  - Top element at button center: `.payoff-celebration-dismiss`
- After click:
  - Modal visible: false.
  - Console/page errors: none.
  - Screenshot: `reports/qa/screenshots/v0_71_milestone_modal_dismissed.png`

## Gate

Command: `npm run harness:gate < /dev/null`

- `npm test -- --maxWorkers=1`: 53 files passed / 611 tests passed.
- `npm run validate:data`: Data validation passed.
- `npm run qa:beta-readiness:check`: PASS, 15/15 readiness checks.
- `npm run build`: PASS, Vite production build completed.

## Protected Files

- No diff in `AGENTS.md`, `feature_list.json`, `progress.md`, `CLAUDE.md`, or `docs/ROADMAP.md`.
