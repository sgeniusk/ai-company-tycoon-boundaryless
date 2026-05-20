# QA Report — v0.53 Final Character Art Import

Date: 2026-05-20

## Scope

Checked the new v0.53 import path for character event-pose sheets and verified that the office scene still uses readable card-use and alert actor poses.

## Pass Criteria

- `npm run assets:v053` creates the canonical source and runtime PNGs.
- Manifest points priority actors to `agents_v053_final_art_import`.
- `office-visuals` shows the v0.53 QA label and keeps card-use/alert actor pose coverage.
- Runtime sheet dimensions remain 576×4800.
- Existing actor click, focus panel, and direct care tests remain covered.
- Full harness gate passes.

## Results

| Check | Result |
|---|---|
| v0.53 manifest version and imported sheet contract | Passed |
| Source candidate PNG 1152×9600 | Passed |
| Runtime PNG 576×4800 | Passed |
| `assets:v053` import command | Passed |
| `office-visuals` scenario label and timeline | Passed |
| `card_use` and `alert` actor poses | Passed |
| Actor focus and direct care regression tests | Passed |
| Full harness gate | Passed |
| HTTP route and asset responses | Passed |

## Evidence

- `npm run assets:v053`: passed.
- `file public/assets/sprites/source/v053-agents-event-poses-final-source.png`: 1152 x 9600 PNG.
- `file public/assets/sprites/v053-agents-event-poses-final.png`: 576 x 4800 PNG.
- `npm test -- src/game/asset-manifest.test.ts src/game/office-scene.test.ts src/game/qa-scenarios.test.ts src/ui/layout-contract.test.ts`: 4 files / 80 tests passed.
- `npm run harness:gate`: 40 files / 298 tests passed, data validation passed, production build passed.
- `curl -I 'http://127.0.0.1:5201/?scenario=office-visuals'`: 200 OK.
- `curl -I 'http://127.0.0.1:5201/assets/sprites/v053-agents-event-poses-final.png'`: 200 OK.
- `curl -I 'http://127.0.0.1:5201/assets/sprites/source/v053-agents-event-poses-final-source.png'`: 200 OK.

## Notes

- Playwright/browser screenshot automation was unavailable in this session. The Node REPL reported `Module not found: playwright`.
- The imported v0.53 source is still a draft candidate. The next QA pass should use actual final artwork and add screenshot comparison for desktop and mobile.
