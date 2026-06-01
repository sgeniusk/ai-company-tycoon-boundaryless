# v0.92 Event Ribbon Hardware QA

Date: 2026-06-01 17:19 KST

## Scope

- Goal: keep the office playfield readable while making incident/event panels feel like compact game HUD hardware instead of web cards.
- Code path: visual-only `EventPanels` markup and CSS.
- Added pixel signal lights and a subtle scanline strip to event ribbons.
- Desktop keeps the signal lights visible; mobile hides the signal column to preserve office space.

## TDD Evidence

- RED: `npm test -- src/ui/layout-contract.test.ts`
  - Result: failed as expected.
  - Failure: `v0.92 gives event ribbons compact pixel signal hardware` could not find `EventPanelSignal`.
- GREEN: `npm test -- src/ui/layout-contract.test.ts`
  - Result: passed.
  - Coverage: 1 test file / 116 tests.

## Browser Smoke

Command:

```sh
/Users/taewookkim/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node /private/tmp/check-v092-event-ribbon.mjs
```

Scenario:

- `http://127.0.0.1:5222/?scenario=office-visuals`

Desktop metrics:

- Event panels: 2 total / 2 renderable
- Pixel signal hardware: 2 total / 1 exposed in visible rail window / 2 pixelated
- Event panel pixelated count: 2/2
- Signal animations: 2/2 `event-panel-signal-blip`
- Scanline animations: 2/2 `event-panel-scanline`
- Event stack height: 96px
- Office/event overlap ratio: 0.206
- Office scene: 6 actors, 10 objects, 8 workbeats, 5 task links still visible
- Overflow/off-shell: document overflow 0, signal off-shell 0

Mobile metrics:

- Event panels: 2 total / 2 renderable
- Pixel signal hardware: 2 total / 2 hidden by mobile rule
- Event stack height: 108px
- Office/event overlap ratio: 0.43
- Office scene: 6 actors, 6 objects, 4 workbeats, 4 task links still visible
- Overflow/off-shell: document overflow 0, signal off-shell 0

Screenshots:

- `reports/qa/screenshots/v0_92_event_ribbon_hardware_desktop.png`
- `reports/qa/screenshots/v0_92_event_ribbon_hardware_mobile.png`

## Gate

Command:

```sh
npm run harness:gate < /dev/null
```

Result: PASS

- `npm test -- --maxWorkers=1`: 53 files / 639 tests passed
- `npm run validate:data`: passed
- `npm run qa:beta-readiness:check`: PASS, readiness 15/15, route coverage 4/4 axes and 40/40 options
- `npm run build`: passed
- Known note: Vite still reports the existing >500 kB chunk warning.

## Notes

- This is visual/HUD-only. No simulation, save, resource, data, or tick behavior changed.
- The office scene now keeps the live actor/object motion visible while incident moments read more like in-world game alerts.
