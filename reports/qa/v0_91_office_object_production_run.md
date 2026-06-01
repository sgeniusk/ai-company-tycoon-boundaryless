# v0.91 Office Object Production Feedback QA

Date: 2026-06-01 16:50 KST

## Scope

- Goal: keep the office scene consistent with the pixel-art direction while making active office machines read as busy, comic, Kairosoft-like work objects.
- Code path: visual-only UI layer in `GameChrome` + `App.css`; no simulation, save, tick, or data changes.
- Added active object production meters and small packet sparks.
- Mobile and reduced-motion paths remain explicitly guarded.

## TDD Evidence

- RED: `npm test -- src/ui/layout-contract.test.ts`
  - Result: failed as expected.
  - Failure: `v0.91 gives active office objects production meters and packet sparks` could not find `office-object-production-meter`.
- GREEN: `npm test -- src/ui/layout-contract.test.ts`
  - Result: passed.
  - Coverage: 1 test file / 115 tests.

## Browser Smoke

Command:

```sh
/Users/taewookkim/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node /private/tmp/check-v091-office-object-production.mjs
```

Scenario:

- `http://127.0.0.1:5222/?scenario=office-visuals`

Desktop metrics:

- Objects: 10 total / 10 visible
- Production meters: 10 total / 10 visible / 10 pixelated
- Packet sparks: 10 total / 10 visible / 10 pixelated
- Active meter animations: 9/9 `office-object-production-meter`
- Active fill animations: 9/9 `office-object-production-fill`
- Active spark animations: 9/9 `office-object-packet-spark`
- Actors: 6 visible, with `pixel-actor-work` present
- Workbeats: 8 visible, all `office-workbeat-pop`
- Task links: 5 visible, all `office-task-link-pulse`
- Pixel consistency: 49 visible pixel targets / 0 unpixelated
- Overflow/off-scene: document overflow 0, spark off-shell 0, spark off-office 0

Mobile metrics:

- Objects: 10 total / 6 visible
- Production meters: 10 total / 6 visible / 10 pixelated
- Packet sparks: 10 total / 0 visible / 10 hidden by mobile rule
- Actors: 6 visible
- Task links: 4 visible
- Pixel consistency: 26 visible pixel targets / 0 unpixelated
- Overflow: 0

Screenshots:

- `reports/qa/screenshots/v0_91_office_object_production_desktop.png`
- `reports/qa/screenshots/v0_91_office_object_production_mobile.png`

## Gate

Command:

```sh
npm run harness:gate < /dev/null
```

Result: PASS

- `npm test -- --maxWorkers=1`: 53 files / 638 tests passed
- `npm run validate:data`: passed
- `npm run qa:beta-readiness:check`: PASS, readiness 15/15, route coverage 4/4 axes and 40/40 options
- `npm run build`: passed
- Known note: Vite still reports the existing >500 kB chunk warning.

## Notes

- This block is derive/visual-only. No `GameState`, save migration, monthly tick, balance, or data contract changes.
- The office scene now has three simultaneous pixel motion layers: actor work/bustle, actor-object task routes, and object-local production feedback.
