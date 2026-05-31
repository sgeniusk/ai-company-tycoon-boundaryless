# v0.78 World Reveal Stamp Polish Run

Date: 2026-05-31
Branch: main
Block: v0.78 commercial polish, world reveal axis stamp art

## Goal

Make the run/world reveal modal feel more like a game reveal screen by giving each run modifier axis a manifest-backed pixel stamp.

## RED

Command:

```bash
npm test -- src/game/asset-manifest.test.ts src/ui/layout-contract.test.ts < /dev/null
```

Expected failure before implementation:

- `assetManifest.sprite_sheets.world_reveal_stamps_v078_atlas` was missing.
- `WorldRevealModal.tsx` did not reference `world_reveal_stamps_v078_atlas`, `getWorldRevealStampStyle`, or `world-reveal-axis-stamp`.

## Implementation

- Added `scripts/assets/generate-v078-world-reveal-stamp-atlas.mjs`.
- Generated `public/assets/ui/v078-world-reveal-stamp-atlas.png` at `256x64`.
- Added `world_reveal_stamps_v078_atlas` to `data/asset_manifest.json`.
- Added `assets:v078` to `package.json`.
- Wired `WorldRevealModal.tsx` so `city`, `world`, `market`, and `founder` axes render atlas-backed stamps.
- Updated `.world-reveal-axis` CSS to make room for a compact pixel stamp without changing reveal logic.

## GREEN

Targeted command:

```bash
npm test -- src/game/asset-manifest.test.ts src/ui/layout-contract.test.ts < /dev/null
```

Result:

- 2 files passed.
- 122 tests passed.

## Browser Smoke

Local URL:

```text
http://127.0.0.1:5222/?scenario=world-reveal
```

Screenshots:

```text
reports/qa/screenshots/v0_78_world_reveal_stamps_desktop.png
reports/qa/screenshots/v0_78_world_reveal_stamps_mobile.png
```

Observed metrics:

- Desktop: atlas `200`, axes `4`, revealed axes `4`, stamps `4`, atlas loaded `true`, image rendering `pixelated`, horizontal overflow `0`, console/page errors `0`.
- Mobile: atlas `200`, axes `4`, revealed axes `4`, stamps `4`, atlas loaded `true`, image rendering `pixelated`, horizontal overflow `0`, console/page errors `0`.
- Dismiss: `world-reveal-overlay` count moved from `1` to `0` after `이 세계로 시작`.

## Full Gate

Command:

```bash
npm run harness:gate < /dev/null
```

Result:

- Tests: 53 files passed, 621 tests passed.
- Data validation: PASS.
- Beta readiness check: PASS, 15/15 checks, 24 endings total, 23 replayable.
- Build: PASS.

## Notes

- No `GameState`, save, tick, or balance changes.
- No contract files edited.
