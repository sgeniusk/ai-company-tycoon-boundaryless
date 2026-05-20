# QA Report — v0.54 Office Object and Backdrop Art Import

Date: 2026-05-21

## Scope

Checked the new v0.54 import path for office object sheets and the isometric office backdrop, then verified that `office-visuals` still exposes placed decor props, v0.53 character poses, reactions, actor focus, and direct care behavior.

## Pass Criteria

- `npm run assets:v054` creates canonical source and runtime PNGs for objects and backdrop.
- Manifest defines `office_objects_v054_final_art_import` and `office_isometric_v054_final_art_import`.
- Runtime object and backdrop paths are used by the first-screen game surface.
- Object and backdrop source dimensions are covered by tests or validation.
- Existing actor click, focus panel, reactions, and direct care tests remain covered.
- Full harness gate passes.

## Results

| Check | Result |
|---|---|
| v0.54 manifest version and office art contracts | Passed |
| Object source PNG 2560×1920 | Passed |
| Object runtime PNG 1280×960 | Passed |
| Backdrop source PNG 5120×2880 | Passed |
| Backdrop runtime PNG 2560×1440 | Passed |
| `assets:v054` import command | Passed |
| `office-visuals` scenario label and timeline | Passed |
| Placed decor props use the v0.54 object sheet | Passed |
| Isometric backdrop uses the v0.54 backdrop asset | Passed |
| Actor focus, direct care, and event reaction regression tests | Passed |
| Full harness gate | Passed |
| HTTP route and v0.54 asset responses | Passed |

## Evidence

- `npm run assets:v054`: passed.
- `file public/assets/sprites/source/v054-office-objects-final-source.png`: 2560 x 1920 PNG.
- `file public/assets/sprites/v054-office-objects-final.png`: 1280 x 960 PNG.
- `file public/assets/backgrounds/source/v054-isometric-office-final-source.png`: 5120 x 2880 PNG.
- `file public/assets/backgrounds/v054-isometric-office-final.png`: 2560 x 1440 PNG.
- `npm test -- src/game/asset-manifest.test.ts src/game/office-scene.test.ts src/game/qa-scenarios.test.ts src/ui/layout-contract.test.ts`: 4 files / 82 tests passed.
- `npm run validate:data`: passed.
- `npm run harness:gate`: 40 files / 300 tests passed, data validation passed, production build passed.
- `curl -I 'http://127.0.0.1:5201/?scenario=office-visuals'`: 200 OK.
- `curl -I` for v0.54 source/runtime assets: all 200 OK.

## Notes

- Playwright/browser screenshot automation was unavailable in this session. The Node REPL reported `Module not found: playwright`.
- The v0.54 files are high-resolution draft candidates, not final external artwork. The next QA pass should use actual final art and add screenshot comparison for desktop and mobile.
