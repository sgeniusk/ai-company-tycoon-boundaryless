# v0.83 Pixel HUD Consistency Run

Date: 2026-05-31
Track: commercial polish / pixel-art consistency

## Goal

Make the first-screen office read more like a compact pixel-art management game:

- Mobile economy HUD should show all 8 resources as a complete 4x2 pixel board, not a clipped horizontal strip.
- Office actors should keep comic stepped work motion across both sprite-sheet actors and fallback actors.
- The office panorama should preserve pixelated atlas rendering while keeping the playfield visible.

## RED

Command:

```sh
npm test -- src/ui/layout-contract.test.ts
```

Expected failures before implementation:

- `keeps the mobile bottom economy HUD as a complete two-row pixel board`
- `keeps office actors moving in stepped comic pixel loops`

Initial evidence:

- Mobile CSS still used horizontal resource scrolling.
- Fallback office actors disabled animation.
- Sprite-sheet office actors only cycled frames and did not keep the shared comic work bob.

## GREEN

Command:

```sh
npm test -- src/ui/layout-contract.test.ts
```

Result:

- 1 test file passed.
- 107 tests passed.

Implementation notes:

- Mobile `.resource-strip` now uses `repeat(4, minmax(0, 1fr))` by `repeat(2, minmax(42px, 1fr))`.
- Mobile resource deltas are hidden in the compact board to avoid clipped text.
- Office actor transform keyframes now honor `--actor-base-y`, so normal and sprite-sheet actors share the same stepped motion language.
- Fallback actors regained idle/work/rest/warning animation.
- Working actors now emit an additional pixel spark from the work puff.

## Local Browser Smoke

Command:

```sh
/Users/taewookkim/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node /private/tmp/check-v083-pixel-hud.mjs
```

Target:

- `http://127.0.0.1:5222/?scenario=office-visuals`

Screenshots:

- `reports/qa/screenshots/v0_83_pixel_hud_desktop.png`
- `reports/qa/screenshots/v0_83_pixel_hud_mobile.png`

Desktop metrics:

- `documentWidthOverflow`: 0
- `officeHeight`: 412
- `pixelatedAssetCount`: 55
- `visibleReactionCount`: 6
- `workingActorCount`: 1
- `workPuffCount`: 1
- `actorAnimationNames`: `pixel-actor-work`, `pixel-warning-pop`, `sprite-sheet-frame-cycle, pixel-actor-rest`, `pixel-actor-idle`, `sprite-sheet-frame-cycle, pixel-actor-work`, `pixel-actor-idle`

Mobile metrics:

- `resourceTileCount`: 8
- `visibleResourceTileCount`: 8
- `partialResourceTileCount`: 0
- `resourceRows`: 2
- `resourceDeltaVisibleCount`: 0
- `documentWidthOverflow`: 0
- `officeHeight`: 230
- `pixelatedAssetCount`: 55
- `visibleReactionCount`: 6
- `workingActorCount`: 1
- `workPuffCount`: 1

## Gate

Command:

```sh
npm run harness:gate < /dev/null
```

Result:

- Test files: 53 passed.
- Tests: 630 passed.
- Data validation: passed.
- Beta readiness check: passed.
- Build: passed.

Build warning:

- Vite still reports the existing large chunk warning for the main game bundle.

