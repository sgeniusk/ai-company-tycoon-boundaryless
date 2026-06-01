# v0.93 Command Console QA

Date: 2026-06-01 17:39 KST

## Scope

- Goal: make the bottom command row feel like a compact pixel control console while preserving the existing turn/card/save/load interactions.
- Code path: visual-only `CommandRow`, `StrategyHand`, and CSS.
- Added console signal lights, a turn meter, and tiny card-slot contacts.
- Mobile hides decorative lights and card contacts to preserve legibility.

## TDD Evidence

- RED: `npm test -- src/ui/layout-contract.test.ts`
  - Result: failed as expected.
  - Failure: `v0.93 turns the bottom command row into a pixel control console` could not find `pixel-command-console`.
- GREEN: `npm test -- src/ui/layout-contract.test.ts`
  - Result: passed.
  - Coverage: 1 test file / 117 tests.

## Browser Smoke

Command:

```sh
/Users/taewookkim/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node /private/tmp/check-v093-command-console.mjs
```

Scenario:

- `http://127.0.0.1:5222/?scenario=office-visuals`

Desktop metrics:

- Command buttons: 4, visible text overflow 0
- Command row height: 100px
- Resource/command overlap: 0
- Console lights: 1/1 visible and pixelated, `command-console-light-blip`
- Turn meter: 1/1 visible and pixelated, `command-turn-meter-scan`
- Strategy cards: 3 cards / 3 contacts / 3 visible contacts
- Strategy hand display: `flex`
- Office scene still visible: 6 actors / 10 objects
- Document overflow: 0

Mobile metrics:

- Command buttons: 4, visible text overflow 0
- Command row height: 138px
- Resource/command overlap: 0
- Console lights: hidden by mobile rule
- Turn meter: 1/1 visible and pixelated, `command-turn-meter-scan`
- Strategy cards: 3 cards / 3 contacts / 3 hidden contacts
- Strategy hand display: `grid`
- Office scene still visible: 6 actors / 6 objects
- Document overflow: 0

Screenshots:

- `reports/qa/screenshots/v0_93_command_console_desktop.png`
- `reports/qa/screenshots/v0_93_command_console_mobile.png`

## Gate

Command:

```sh
npm run harness:gate < /dev/null
```

Result: PASS

- `npm test -- --maxWorkers=1`: 53 files / 640 tests passed
- `npm run validate:data`: passed
- `npm run qa:beta-readiness:check`: PASS, readiness 15/15, route coverage 4/4 axes and 40/40 options
- `npm run build`: passed
- Known note: Vite still reports the existing >500 kB chunk warning.

## Notes

- This block is UI-only. No simulation, save, resource, data, or tick behavior changed.
- The primary turn button, strategy hand, save/load/new-game buttons, and active product summary remain in the same bottom command surface.
