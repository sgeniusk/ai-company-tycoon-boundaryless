# QA Report — v0.52 Source Sprite Replacement

Date: 2026-05-20

## Scope

Checked the `office-visuals` graphics path after switching priority actors to the v0.52 source-normalized event-pose sheet.

## Pass Criteria

- `office-visuals` uses the v0.52 QA label.
- Priority actors render from `agents_v052_source_event_poses`.
- The runtime sheet keeps card-use and alert pose rows visible through the existing office reaction logic.
- Source and runtime PNG dimensions match the manifest contract.
- Actor click, focus panel, and direct care actions stay covered by tests.
- Full harness gate passes.

## Results

| Check | Result |
|---|---|
| v0.52 manifest version and sheet contract | Passed |
| Source PNG 1152×9600 | Passed |
| Runtime PNG 576×4800 | Passed |
| `office-visuals` scenario label and timeline | Passed |
| `card_use` and `alert` actor poses | Passed |
| Actor focus and direct care regression tests | Passed |
| Full harness gate | Passed |
| HTTP route and asset responses | Passed |

## Evidence

- `npm run assets:v052`: passed.
- `file public/assets/sprites/source/v052-agents-event-poses-source.png`: 1152 x 9600 PNG.
- `file public/assets/sprites/v052-agents-event-poses.png`: 576 x 4800 PNG.
- `npm test -- src/game/asset-manifest.test.ts src/game/office-scene.test.ts src/game/qa-scenarios.test.ts src/ui/layout-contract.test.ts`: 4 files / 79 tests passed.
- `npm run harness:gate`: 40 files / 297 tests passed, data validation passed, production build passed.
- `curl -I 'http://127.0.0.1:5201/?scenario=office-visuals'`: 200 OK.
- `curl -I 'http://127.0.0.1:5201/assets/sprites/v052-agents-event-poses.png'`: 200 OK.
- `curl -I 'http://127.0.0.1:5201/assets/sprites/source/v052-agents-event-poses-source.png'`: 200 OK.

## Notes

The current source sheet is a high-resolution procedural draft. The next QA pass should use an actual final artwork source and include screenshot comparison for anchor drift, feet placement, and readability on desktop and mobile.
