# v0.75 Brand Crest Topbar Polish Run

Date: 2026-05-31

## Scope

- Add a final deterministic brand crest PNG to the first-screen command deck.
- Register the crest through `asset_manifest` and a reproducible package script.
- Wire the crest into the top brand panel without changing simulation, save, tick, or balance behavior.

## RED

Command:

```bash
npm test -- src/game/asset-manifest.test.ts src/ui/layout-contract.test.ts < /dev/null
```

Expected failures:

- `asset-manifest.test.ts` rejected missing `brand_crest_v075_atlas`.
- `layout-contract.test.ts` rejected missing `getBrandCrestStyle` / `top-brand-crest` UI wiring.

Result: 2 failed / 117 passed before implementation.

## GREEN

Commands:

```bash
node scripts/assets/generate-v075-brand-crest-atlas.mjs
npm test -- src/game/asset-manifest.test.ts src/ui/layout-contract.test.ts < /dev/null
```

Results:

- Generated `public/assets/ui/v075-brand-crest-atlas.png` at 128x96.
- Targeted tests passed: 2 files / 119 tests.

## Browser Smoke

Target:

```text
http://127.0.0.1:5222/?scenario=staff-incidents
```

Desktop 1366x768:

- `atlasStatus`: 200
- `crestCount`: 1
- `atlasLoaded`: true
- `panelTextFits`: true
- `topBarTextFits`: true
- `horizontalOverflow`: 0
- Console errors: []

Mobile 390x844:

- `atlasStatus`: 200
- `crestCount`: 1
- `atlasLoaded`: true
- `panelTextFits`: true
- `topBarTextFits`: true
- `horizontalOverflow`: 0
- Console errors: []

Screenshots:

- `reports/qa/screenshots/v0_75_brand_crest_topbar_desktop.png`
- `reports/qa/screenshots/v0_75_brand_crest_topbar_mobile.png`

## Full Gate

Command:

```bash
npm run harness:gate < /dev/null
```

Result: PASS

- Vitest: 53 files / 618 tests passed.
- Data validation: PASS.
- Beta readiness check: PASS, 15/15 checks, 23/23 unlock guidance, 4/4 route axes, 40/40 options.
- TypeScript + Vite production build: PASS.

## Notes

- The crest generator is local and deterministic; it does not use network, random input, or runtime image dependencies.
- The top brand panel now has a first-viewport brand/object signal while preserving the existing compact HUD layout.
- No protected contract files were modified.
