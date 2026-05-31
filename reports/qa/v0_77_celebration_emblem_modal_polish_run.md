# v0.77 Celebration Emblem Modal Polish Run

Date: 2026-05-31
Branch: main
Block: v0.77 commercial polish, payoff and milestone popup emblem art

## Goal

Make payoff and milestone celebration popups read less like generic CSS modals and more like game reward surfaces by adding manifest-backed emblem art.

## RED

Command:

```bash
npm test -- src/game/asset-manifest.test.ts src/ui/layout-contract.test.ts < /dev/null
```

Expected failure before implementation:

- `assetManifest.sprite_sheets.celebration_emblems_v077_atlas` was missing.
- `PayoffCelebrationModal.tsx` did not reference `celebration_emblems_v077_atlas`, `getCelebrationEmblemStyle`, or `payoff-celebration-emblem`.

## Implementation

- Added `scripts/assets/generate-v077-celebration-emblem-atlas.mjs`.
- Generated `public/assets/ui/v077-celebration-emblem-atlas.png` at `240x80`.
- Added `celebration_emblems_v077_atlas` to `data/asset_manifest.json`.
- Added `assets:v077` to `package.json`.
- Wired `PayoffCelebrationModal.tsx` to render a pixel emblem for synergy, combo, and achievement tones.
- Added `.payoff-celebration-emblem` CSS for atlas positioning, pixel rendering, and compact modal header layout.

## GREEN

Targeted command:

```bash
npm test -- src/game/asset-manifest.test.ts src/ui/layout-contract.test.ts < /dev/null
```

Result:

- 2 files passed.
- 121 tests passed.

## Browser Smoke

Local URLs:

```text
http://127.0.0.1:5222/?scenario=payoff-juice
http://127.0.0.1:5222/?scenario=milestones
```

Screenshots:

```text
reports/qa/screenshots/v0_77_celebration_emblem_payoff_desktop.png
reports/qa/screenshots/v0_77_celebration_emblem_milestone_mobile.png
```

Observed metrics:

- Payoff desktop: atlas `200`, dialog `1`, emblem `1`, atlas loaded `true`, image rendering `pixelated`, emblem `64x64`, horizontal overflow `0`, console/page errors `0`.
- Payoff queue drain: 2 clicks closed all celebration dialogs, active dialog count `0`, console errors `0`.
- Milestone mobile: atlas `200`, dialog `1`, emblem `1`, atlas loaded `true`, image rendering `pixelated`, emblem `64x64`, horizontal overflow `0`, console/page errors `0`.
- Milestone dismiss: 1 click closed the dialog, active dialog count `0`.

## Full Gate

Command:

```bash
npm run harness:gate < /dev/null
```

Result:

- Tests: 53 files passed, 620 tests passed.
- Data validation: PASS.
- Beta readiness check: PASS, 15/15 checks, 24 endings total, 23 replayable.
- Build: PASS.

## Notes

- No `GameState`, save, tick, or balance changes.
- No contract files edited.
