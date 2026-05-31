# v0.76 Workforce Actor Fallback Polish Run

Date: 2026-05-31
Branch: main
Block: v0.76 commercial polish, workforce actor fallback atlas

## Goal

Replace unmapped office actor CSS body-part placeholders with a deterministic manifest-backed sprite atlas while preserving simulation, save, balance, and seeded determinism.

## RED

Command:

```bash
npm test -- src/game/asset-manifest.test.ts src/ui/layout-contract.test.ts < /dev/null
```

Expected failure before implementation:

- `assetManifest.sprite_sheets.workforce_actor_v076_atlas` was missing.
- `GameChrome.tsx` did not reference `workforce_actor_v076_atlas`, `getFallbackActorSpriteFrameStyle`, or `actor-fallback-sheet`.

## Implementation

- Added `scripts/assets/generate-v076-workforce-actor-atlas.mjs`.
- Generated `public/assets/sprites/v076-workforce-actor-atlas.png` at `228x76`.
- Added `workforce_actor_v076_atlas` to `data/asset_manifest.json`.
- Added `assets:v076` to `package.json`.
- Wired `GameChrome.tsx` so actors without a mapped agent sprite use the fallback atlas frame for `human`, `ai_agent`, or `robot`.
- Added `.actor-fallback-sheet` CSS to keep fallback actors pixelated and out of the animated character-sheet cycle.

## GREEN

Targeted command:

```bash
npm test -- src/game/asset-manifest.test.ts src/ui/layout-contract.test.ts < /dev/null
```

Result:

- 2 files passed.
- 120 tests passed.

## Browser Smoke

Local URL:

```text
http://127.0.0.1:5222/?scenario=staff-incidents
```

Desktop screenshot:

```text
reports/qa/screenshots/v0_76_workforce_actor_fallback_desktop.png
```

Mobile screenshot:

```text
reports/qa/screenshots/v0_76_workforce_actor_fallback_mobile.png
```

Observed metrics:

- Desktop: atlas `200`, actors `3`, fallback actors `1`, animated fallback actors `0`, atlas loaded `true`, horizontal overflow `0`, console/page errors `0`.
- Mobile: atlas `200`, actors `3`, fallback actors `1`, animated fallback actors `0`, atlas loaded `true`, horizontal overflow `0`, console/page errors `0`.

## Full Gate

Command:

```bash
npm run harness:gate < /dev/null
```

Result:

- Tests: 53 files passed, 619 tests passed.
- Data validation: PASS.
- Beta readiness check: PASS, 15/15 checks, 24 endings total, 23 replayable.
- Build: PASS.

## Notes

- No `GameState`, save, tick, or balance changes.
- No contract files edited.
