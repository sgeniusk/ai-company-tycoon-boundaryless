# v0.74 Helper Portrait Art Polish Run

Date: 2026-05-31

## Scope

- Replace the tutorial helper's CSS block portrait with a deterministic final PNG portrait.
- Register the portrait through the asset manifest and package asset script.
- Preserve gameplay determinism: no save, tick, simulation, economy, or balance changes.

## RED

Command:

```bash
npm test -- src/game/asset-manifest.test.ts src/ui/layout-contract.test.ts < /dev/null
```

Expected failures:

- `asset-manifest.test.ts` rejected missing `helper_portraits_v074_atlas`.
- `layout-contract.test.ts` rejected missing `helper-portrait-art` / `--helper-portrait-image` UI wiring.

Result: 2 failed / 116 passed before implementation.

## GREEN

Commands:

```bash
node scripts/assets/generate-v074-helper-portrait-atlas.mjs
npm test -- src/game/asset-manifest.test.ts src/ui/layout-contract.test.ts < /dev/null
```

Results:

- Generated `public/assets/ui/v074-helper-portrait-atlas.png` at 96x96.
- Targeted tests passed: 2 files / 118 tests.

## Browser Smoke

Target:

```text
http://127.0.0.1:5222/?scenario=staff-incidents
```

Desktop 1366x768:

- `atlasStatus`: 200
- `helperPortraitCount`: 1
- `atlasLoaded`: true
- `tutorialVisible`: true
- `horizontalOverflow`: 0
- `tutorialTextFits`: true
- Console errors: []

Mobile 390x844:

- `atlasStatus`: 200
- `helperPortraitCount`: 1
- `atlasLoaded`: true
- `tutorialVisible`: true
- `horizontalOverflow`: 0
- `tutorialTextFits`: true
- Console errors: []

Screenshots:

- `reports/qa/screenshots/v0_74_helper_portrait_art_desktop.png`
- `reports/qa/screenshots/v0_74_helper_portrait_art_mobile.png`

## Full Gate

Command:

```bash
npm run harness:gate < /dev/null
```

Result: PASS

- Vitest: 53 files / 617 tests passed.
- Data validation: PASS.
- Beta readiness check: PASS, 15/15 checks, 23/23 unlock guidance, 4/4 route axes, 40/40 options.
- TypeScript + Vite production build: PASS.

## Notes

- The portrait generator is local and deterministic; it does not use network, random input, or runtime image dependencies.
- The old CSS portrait remains as a fallback only if the manifest-backed portrait image is unavailable.
- No protected contract files were modified.
