# v0.95 Event Sightline QA

Date: 2026-06-01 21:54 KST

## Scope

- Goal: keep incident/event panels readable while preserving the pixel office sightline so staff workloops remain visible.
- Code path: visual-only `App` event stack class and `App.css` event-rail overrides.
- Added `office-sightline-event-rail` as a narrower, lower pixel dialogue rail above the office scene.
- Added a small pixel dialogue tail on desktop and kept it hidden on mobile.
- No simulation, save, data, economy, or tick behavior changed.

## TDD Evidence

- RED: `npm test -- src/ui/layout-contract.test.ts`
  - Result: failed as expected.
  - Failure: `v0.95 keeps incident panels in a sightline-preserving pixel dialogue rail` could not find `office-sightline-event-rail`.
- GREEN: `npm test -- src/ui/layout-contract.test.ts`
  - Result: passed.
  - Coverage: 1 test file / 119 tests.

## Browser Smoke

Command:

```sh
/Users/taewookkim/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/qa/check-v095-event-sightline.mjs
```

Scenario:

- `http://127.0.0.1:5222/?scenario=office-visuals`

Desktop metrics:

- Event panels: 2
- Event stack height: 82px
- Office height: 390px
- Office/event overlap ratio: 0.182
- Actors visible: 6
- Button text overflow: 0
- Document overflow: 0
- Dialogue tail: visible

Mobile metrics:

- Event panels: 2
- Event stack height: 92px
- Office height: 230px
- Office/event overlap ratio: 0.361
- Actors visible: 6
- Button text overflow: 0
- Document overflow: 0
- Dialogue tail: hidden

Screenshots:

- `reports/qa/screenshots/v0_95_event_sightline_desktop.png`
- `reports/qa/screenshots/v0_95_event_sightline_mobile.png`

## Gate

Command:

```sh
npm run harness:gate < /dev/null
```

Result: PASS

- `npm test -- --maxWorkers=1`: 53 files / 642 tests passed
- `npm run validate:data`: passed
- `npm run qa:beta-readiness:check`: PASS, readiness 15/15, route coverage 4/4 axes and 40/40 options
- `npm run build`: passed
- Known note: Vite still reports the existing >500 kB chunk warning.

## Notes

- This continues the commercial-polish pass after v0.94 by protecting the office playfield and keeping the comic staff motion visible under incidents.
- The reusable browser check is now tracked at `scripts/qa/check-v095-event-sightline.mjs`.
