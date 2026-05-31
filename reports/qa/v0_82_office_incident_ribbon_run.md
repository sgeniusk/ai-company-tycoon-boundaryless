# v0.82 Office Incident Ribbon QA

Timestamp: 2026-05-31 23:40 KST

## Scope

- Compressed staff/rival/monthly incident panels into a compact bottom office ribbon.
- Added explicit `event-panel-copy` and `event-choice-summary` structure so incident copy and choices can be tuned separately.
- Kept the office actors and v0.81 comic reaction sprites visible while incidents are present.
- UI-only change: no simulation, save, economy, data, or tick changes.

## Benchmark Note

- Kairosoft's public catalogue frames the reference genre as compact pixel-art management simulation. The implementation keeps that direction by using dense but readable bottom ribbons instead of large web-style cards over the playfield.

## TDD

- RED: `npm test -- src/ui/layout-contract.test.ts < /dev/null`
  - Failed as expected because `event-panel-copy`, `event-choice-summary`, compact event-stack height, and mobile ribbon rules did not exist.
- GREEN: `npm test -- src/ui/layout-contract.test.ts < /dev/null`
  - Passed: 1 file / 105 tests.

## Local Browser Smoke

Scenario: `http://127.0.0.1:5222/?scenario=office-visuals`

- Desktop 1366x768:
  - event stack height: 112px
  - office height: 412px
  - event stack coverage: 0.272
  - max-height: `clamp(112px, 22%, 168px)`
  - overflow-y: `hidden`
  - visible reaction sprites: 6
  - event-panel-copy count: 2
  - event-choice-summary count: 4
  - document width overflow: 0
  - payoff modal visible after dismiss: false
  - console errors: 0
- Mobile 390x844:
  - event stack height: 138px
  - office height: 230px
  - max-height: `138px`
  - overflow-y: `hidden`
  - visible reaction sprites: 6
  - event-panel-copy count: 2
  - event-choice-summary count: 4
  - document width overflow: 0
  - payoff modal visible after dismiss: false
  - console errors: 0

Screenshots:

- `reports/qa/screenshots/v0_82_office_incident_ribbon_desktop.png`
- `reports/qa/screenshots/v0_82_office_incident_ribbon_mobile.png`

## Full Gate

Command: `npm run harness:gate < /dev/null`

- Tests: 53 files / 628 tests passed.
- Data validation: passed.
- Beta readiness: PASS, 15/15 checks, 24 endings / 23 replayable.
- Build: passed.

## Notes

- Mobile hides event choice summaries so the two choice buttons remain fully visible inside the compact ribbon.
- The event stack can expand on hover/focus for desktop inspection without permanently covering the office.
