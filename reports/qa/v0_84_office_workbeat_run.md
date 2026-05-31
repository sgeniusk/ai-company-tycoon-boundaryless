# v0.84 Office Workbeat Run

Date: 2026-06-01
Track: commercial polish / Kairosoft-style office liveliness

## Goal

Push the first-screen office closer to a commercial pixel-art management game without changing simulation balance:

- Keep the office playfield protected.
- Add small deterministic workbeat signals so the office reads as an active company scene.
- Keep motion stepped, pixelated, and compatible with reduced-motion settings.

Benchmark reference:

- Kairosoft official iPhone catalogue: `https://www.kairopark.jp/iphone/en/`
- Kairosoft official Android catalogue: `https://kairopark.jp/android/en/`

## RED

Command:

```sh
npm test -- src/ui/layout-contract.test.ts
```

Expected failure before implementation:

- `adds small office workbeat signals so the scene reads as an active pixel sim`

Missing evidence at RED:

- No `OfficeWorkBeatLayer`.
- No `office-workbeat-node` surface.
- No stepped workbeat animation or mobile cap.

## GREEN

Command:

```sh
npm test -- src/ui/layout-contract.test.ts
```

Result:

- 1 test file passed.
- 108 tests passed.

Implementation notes:

- Added `OfficeWorkBeatLayer` above the office floor.
- Workbeat nodes are deterministic and derive their visible count from `officeScenePlan.activeObjectCount`.
- Desktop can show up to 8 small work signals; mobile caps at 4.
- Workbeat layer stays behind incident/care panels so it supports the scene instead of covering decisions.
- Reduced-motion media query disables workbeat animation.

## Local Browser Smoke

Command:

```sh
/Users/taewookkim/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node /private/tmp/check-v084-office-workbeat.mjs
```

Target:

- `http://127.0.0.1:5222/?scenario=office-visuals`

Screenshots:

- `reports/qa/screenshots/v0_84_office_workbeat_desktop.png`
- `reports/qa/screenshots/v0_84_office_workbeat_mobile.png`

Desktop metrics:

- `visibleWorkbeatCount`: 8
- `workbeatPixelatedCount`: 8
- `offstageWorkbeatCount`: 0
- `shellOverflowWorkbeatCount`: 0
- `documentWidthOverflow`: 0
- `visibleReactionCount`: 6
- `workPuffCount`: 1
- `animatedActorCount`: 6

Mobile metrics:

- `visibleWorkbeatCount`: 4
- `workbeatPixelatedCount`: 4
- `offstageWorkbeatCount`: 0
- `shellOverflowWorkbeatCount`: 0
- `documentWidthOverflow`: 0
- `visibleReactionCount`: 6
- `workPuffCount`: 1
- `animatedActorCount`: 6

## Gate

Command:

```sh
npm run harness:gate < /dev/null
```

Result:

- Test files: 53 passed.
- Tests: 631 passed.
- Data validation: passed.
- Beta readiness check: passed.
- Build: passed.

Build warning:

- Vite still reports the existing large chunk warning for the main game bundle.

