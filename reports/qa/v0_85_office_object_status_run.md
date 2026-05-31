# v0.85 Office Object Status Run

Date: 2026-06-01

Scope: Commercial-polish pass for the office scene. The turn-based game should still read as a coherent pixel-art management sim, while the office foreground and working state move comically like a compact Kairosoft-style workfloor.

Benchmark anchors:
- Kairosoft iOS catalog: https://www.kairopark.jp/iphone/en/
- Kairosoft Android catalog: https://kairopark.jp/android/en/

## Changes

- Added decorative pixel status lights and status dots to each office object in `GameChrome`.
- Active office objects now combine the existing screen pulse with a small two-step busy loop.
- Locked office objects keep dim, non-animated status hardware so inactive zones still read as part of the same office set.
- The long route/floor object now uses left-origin placement so it stays inside the office shell during animation.
- Reduced-motion mode disables the new decorative object animations.

## RED Evidence

Initial contract RED:

```text
npm test -- src/ui/layout-contract.test.ts
FAIL src/ui/layout-contract.test.ts > gives active office objects their own pixel status lights and busy loops
Reason: GameChrome did not yet contain office-object-activity-light.
```

Follow-up regression RED from browser smoke:

```text
/Users/taewookkim/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node /private/tmp/check-v085-office-objects.mjs
Exit code: 6
Reason: desktop offstageObjectCount=1 and shellOverflowObjectCount=1.
Fix: route object received --object-base-x: 0 and the busy keyframe now respects --object-base-x.
```

## GREEN Evidence

Target contract:

```text
npm test -- src/ui/layout-contract.test.ts
Test Files 1 passed (1)
Tests 109 passed (109)
```

Local browser smoke:

```text
/Users/taewookkim/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node /private/tmp/check-v085-office-objects.mjs
Exit code: 0
Desktop: visibleObjectCount=10, visibleActiveObjectCount=9, visibleLightCount=10, visibleDotCount=10,
offstageObjectCount=0, shellOverflowObjectCount=0, visibleWorkbeatCount=8, workPuffCount=1.
Mobile: visibleObjectCount=6, visibleActiveObjectCount=6, visibleLightCount=6, visibleDotCount=6,
documentWidthOverflow=0, offstageObjectCount=0, visibleWorkbeatCount=4, workPuffCount=1.
```

Screenshots:
- `reports/qa/screenshots/v0_85_office_object_status_desktop.png`
- `reports/qa/screenshots/v0_85_office_object_status_mobile.png`

Full gate:

```text
npm run harness:gate < /dev/null
Test Files 53 passed (53)
Tests 632 passed (632)
Data validation passed.
qa:beta-readiness:check PASS
Build passed.
```

Known build warning: Vite still reports the existing >500 kB chunk warning.

## Visual Consistency Notes

- New motion is decorative and uses step timing, hard pixel borders, and existing object palette variables.
- The office now has three synchronized pixel motion tiers: actors working, reaction/workbeat bursts, and object hardware lights.
- No simulation, save, or economy state changed.
