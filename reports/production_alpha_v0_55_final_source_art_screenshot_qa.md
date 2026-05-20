# Production Report — v0.55-alpha Final Source Art Screenshot QA Harness

Date: 2026-05-21

## Summary

v0.55-alpha adds a reproducible screenshot QA path for the current `office-visuals` game screen. It does not claim that final external art has landed. Instead, it makes the next final-art replacement pass inspectable: after replacing character, office object, or backdrop source files, the team can run one command and preserve desktop/mobile screenshots as evidence.

This pass also fixed the first issue caught by the new screenshot loop: the mobile headless capture was left-cropping the app shell because narrow layouts stayed centered in a wider layout viewport. Narrow screens now start-align the shell so the 390×844 capture begins at the game frame.

A follow-up screenshot pass fixed the next visible mobile issue: the bottom strategy hand now uses a compact fixed grid, so the command cards fit inside the 390px game frame instead of clipping at the right edge.

## Implemented

- Added `scripts/qa/capture-office-visuals-screenshots.mjs`.
- Added `npm run qa:office-visuals:screenshots`.
- Added `visual_qa.office_visuals_v055_screenshot_qa` to `data/asset_manifest.json`.
- Updated `asset_manifest.json` to `0.55-alpha`.
- Updated `office-visuals` label and timeline to `v0.55 스크린샷 QA`.
- Added screenshot artifacts under `reports/qa/screenshots/`.
- Adjusted mobile CSS alignment for headless narrow viewport capture.
- Adjusted the mobile strategy hand into a fixed grid HUD.
- Added `mobile_command_hand_fit` to the v0.55 visual QA manifest checks.

## Screenshot Contract

```bash
npm run qa:office-visuals:screenshots
```

The command expects the local dev server to be serving `http://127.0.0.1:5201/?scenario=office-visuals`.

| Artifact | Size | Purpose |
|---|---:|---|
| `reports/qa/screenshots/v0_55_office_visuals_desktop.png` | 1366×768 | Full desktop game shell check |
| `reports/qa/screenshots/v0_55_office_visuals_mobile.png` | 390×844 | Narrow mobile framing check |
| `reports/qa/screenshots/v0_55_office_visuals_screenshots.json` | n/a | Captured URL, viewport sizes, paths, and file sizes |

## Verification

- `npm test -- src/game/qa-scenarios.test.ts src/game/asset-manifest.test.ts src/ui/layout-contract.test.ts`
  - Passed
  - 3 test files / 78 tests.
- `npm test -- src/game/asset-manifest.test.ts src/ui/layout-contract.test.ts`
  - Passed
  - 2 test files / 43 tests.
- `npm run qa:office-visuals:screenshots`
  - Passed
  - Desktop 1366×768 and mobile 390×844 screenshots generated.
- `npm run validate:data`
  - Passed
  - Data validation passed.

## Visual QA Notes

- Desktop: full game shell is visible, including top QA pill, office playfield, resource strip, command row, and right management console.
- Mobile: app shell now starts at the left edge instead of being cropped by headless capture.
- Mobile: the bottom strategy hand fits inside the fixed game frame without right-edge clipping.

## Remaining Risk

- Final external character, office object, and backdrop art is still pending.
- The current screenshots validate the draft candidate art and layout behavior, not final-art quality.
- The next pass should rerun this command after `npm run assets:v053 -- --source <원본PNG>` and `npm run assets:v054 -- --objects-source <원본PNG> --backdrop-source <원본PNG>`.

## Recommended Next Step

Replace the draft source candidates with actual final source art, regenerate runtime assets, rerun `npm run qa:office-visuals:screenshots`, and compare the new desktop/mobile screenshots against the v0.55 baseline.
