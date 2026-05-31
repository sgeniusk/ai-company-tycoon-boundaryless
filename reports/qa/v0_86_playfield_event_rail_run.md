# v0.86 Playfield Event Rail Run

Date: 2026-06-01

Scope: Commercial-polish pass for event moments. Keep the existing simulation/content intact while making urgent event UI read like a compact pixel-game rail that protects the office playfield.

Benchmark anchors:
- Kairosoft iOS catalog: https://www.kairopark.jp/iphone/en/
- Kairosoft Android catalog: https://kairopark.jp/android/en/

## Changes

- Added `playfield-event-rail` to the event stack so desktop event moments no longer stretch across the full stage width.
- Added pixel-art rail accents to event panels via per-panel `--event-rail-accent` variables.
- Kept event panels readable with the existing hover/focus expansion path.
- Reduced the mobile event rail height and hid mobile-only metadata lines so the animated office remains more visible.
- No simulation, save, economy, or content data changed.

## RED Evidence

Initial contract RED:

```text
npm test -- src/ui/layout-contract.test.ts
FAIL docks event moments in a playfield-safe pixel rail instead of stretching across the office
Reason: App.tsx did not yet contain "event-stack playfield-event-rail".
```

Mobile refinement RED:

```text
npm test -- src/ui/layout-contract.test.ts
FAIL docks event moments in a playfield-safe pixel rail instead of stretching across the office
Reason: mobile override did not yet clamp playfield-event-rail to clamp(72px, 13dvh, 108px).
```

## GREEN Evidence

Target contract:

```text
npm test -- src/ui/layout-contract.test.ts
Test Files 1 passed (1)
Tests 110 passed (110)
```

Local browser smoke:

```text
/Users/taewookkim/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node /private/tmp/check-v086-event-rail.mjs
Exit code: 0
Desktop: eventPanelCount=2, eventPanelPixelatedCount=2, eventPanelRailAccentCount=2,
railWidth=760, stageWidth=960, railWidthRatio=0.792, railHeight=96, officeOverlapRatio=0.206,
visibleActorCount=6, visibleObjectCount=10, visibleWorkbeatCount=8.
Mobile: eventPanelCount=2, eventPanelPixelatedCount=2, eventPanelRailAccentCount=2,
railHeight=108, officeOverlapRatio=0.43, documentWidthOverflow=0,
visibleActorCount=6, visibleObjectCount=6, visibleWorkbeatCount=4.
```

Screenshots:
- `reports/qa/screenshots/v0_86_event_rail_desktop.png`
- `reports/qa/screenshots/v0_86_event_rail_mobile.png`

Full gate:

```text
npm run harness:gate < /dev/null
Test Files 53 passed (53)
Tests 633 passed (633)
Data validation passed.
qa:beta-readiness:check PASS
Build passed.
```

Known build warning: Vite still reports the existing >500 kB chunk warning.

## Visual Consistency Notes

- Event UI now uses hard pixel borders, step-safe compact sizing, and color-coded pixel rail accents.
- The office still shows actor/object/workbeat motion underneath the turn-based UI layer.
- Mobile sacrifices extra incident metadata in the transient rail to keep the office scene visible; detailed event text remains available through the event title/description and button titles.
