# v0.94 Office Comic Workloops QA

Date: 2026-06-01 18:50 KST

## Scope

- Goal: keep the office scene visually consistent as pixel art and make staff work feel more comic and lively, closer to a compact management sim office.
- Code path: visual-only `GameChrome` office scene markup and `App.css` animation rules.
- Added a `pixel-office-theater` scene class and per-actor workloop props: key clack, comic pop, and focus beam.
- No simulation, save, data, economy, or tick behavior changed.

## TDD Evidence

- RED: `npm test -- src/ui/layout-contract.test.ts`
  - Result: failed as expected.
  - Failure: `v0.94 keeps the office scene in a pixel-art comic workloop style` could not find `pixel-office-theater`.
- GREEN: `npm test -- src/ui/layout-contract.test.ts`
  - Result: passed.
  - Coverage: 1 test file / 118 tests.

## Browser Smoke

Command:

```sh
/Users/taewookkim/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node /private/tmp/check-v094-office-workloops.mjs
```

Scenario:

- `http://127.0.0.1:5222/?scenario=office-visuals`

Desktop metrics:

- Office root: `pixelated`, height 390px
- Actors: 6 visible / 6 workloop kits
- Workloop props: 6 key clacks, 6 comic pops, 6 focus beams
- Animations: `office-actor-key-clack`, `office-actor-comic-pop`, `office-actor-focus-beam`
- Objects: 10 visible
- Document overflow: 0

Mobile metrics:

- Office root: `pixelated`, height 230px
- Actors: 6 visible / 6 workloop kits
- Workloop props: 6 key clacks, 6 comic pops, 6 focus beams
- Animations: `office-actor-key-clack`, `office-actor-comic-pop`, `office-actor-focus-beam`
- Objects: 6 visible
- Document overflow: 0

Screenshots:

- `reports/qa/screenshots/v0_94_office_workloops_desktop.png`
- `reports/qa/screenshots/v0_94_office_workloops_mobile.png`

## Gate

Command:

```sh
npm run harness:gate < /dev/null
```

Result: PASS

- `npm test -- --maxWorkers=1`: 53 files / 641 tests passed
- `npm run validate:data`: passed
- `npm run qa:beta-readiness:check`: PASS, readiness 15/15, route coverage 4/4 axes and 40/40 options
- `npm run build`: passed
- Known note: Vite still reports the existing >500 kB chunk warning.

## Notes

- The new motion uses stepped CSS animations and participates in the existing reduced-motion block.
- Mobile scales the workloop kit down to keep the compact office scene legible.
