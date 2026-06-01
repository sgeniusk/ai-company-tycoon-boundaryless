# v0.87 Office Controls Run

Date: 2026-06-01

Scope: Commercial-polish pass for office controls. Keep the existing content and simulation intact while making the office action slots and monthly operations panel read like compact pixel-game command consoles.

Benchmark anchors:
- Kairosoft iOS catalog: https://www.kairopark.jp/iphone/en/
- Kairosoft Android catalog: https://kairopark.jp/android/en/

## Changes

- Added atlas-backed pixel icons and status lights to the four office action slots.
- Added a scanning pixel signal strip to the operations panel.
- Added colored status pips to operations focus cards.
- Widened the desktop office action slot grid slightly so the new icon treatment stays readable.
- Added reduced-motion coverage for the new decorative control animations.
- No simulation, save, economy, or content data changed.

## RED Evidence

Initial contract RED:

```text
npm test -- src/ui/layout-contract.test.ts
FAIL skins office controls as toy-like pixel command consoles
Reason: GameChrome did not yet contain office-action-slot-icon.
```

## GREEN Evidence

Target contract:

```text
npm test -- src/ui/layout-contract.test.ts
Test Files 1 passed (1)
Tests 111 passed (111)
```

Local browser smoke:

```text
/Users/taewookkim/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node /private/tmp/check-v087-office-controls.mjs
Exit code: 0
Desktop: visibleSlotCount=4, visibleSlotIconCount=4, slotIconPixelatedCount=4,
visibleSlotLightCount=4, operationCardCount=3, operationPipCount=3,
operationSignalAnimation=operation-command-signal-scan, offstageControlCount=0,
visibleActorCount=6, visibleObjectCount=10, visibleWorkbeatCount=8.
Mobile: visibleSlotCount=4, visibleSlotIconCount=4, operationPanelHeight=74,
documentWidthOverflow=0, offstageControlCount=0, visibleActorCount=6,
visibleObjectCount=6, visibleWorkbeatCount=4.
```

Screenshots:
- `reports/qa/screenshots/v0_87_office_controls_desktop.png`
- `reports/qa/screenshots/v0_87_office_controls_mobile.png`

Full gate:

```text
npm run harness:gate < /dev/null
Test Files 53 passed (53)
Tests 634 passed (634)
Data validation passed.
qa:beta-readiness:check PASS
Build passed.
```

Known build warning: Vite still reports the existing >500 kB chunk warning.

## Visual Consistency Notes

- The action slots now use the same commercial UI atlas as the rest of the HUD, keeping icon language consistent.
- Control animations are small, step-based, and decorative: slot status lights blink; the operations panel signal scans.
- The office remains readable underneath: actors, objects, workbeats, and reactions remain visible in the smoke metrics.
