# v0.97 #2 Pixel Token Unification QA (radius + stepped motion)

Date: 2026-06-02

## Scope

- Goal: fix inconsistent radii (4/5/6/8/9/10/12px scattered) and inconsistent motion timing (smooth ease vs steps) by unifying to single tokens. visual-only `App.css` + the layout contract.
- No simulation, save, data, economy, tick, or RNG behavior changed.

## Implementation

- `--pixel-radius: 3px` token; 35 single-value square radii unified to `var(--pixel-radius)`.
- `--pixel-steps: steps(6)` token; 19 game-surface transform/movement/pop/enter timings converted from `ease`/`cubic-bezier` to the stepped token.

## Preserved (confirmed untouched)

- `border-radius: 50%` (circles/avatars): 8 — unchanged.
- `border-radius: 999px` (badge pills): 4 — unchanged.
- Asymmetric multi-value radii (speech bubbles `5px 5px 2px 5px`, `12px 12px 4px 4px`, `9px 9px 4px 9px`, `2px 2px 8px 8px`): 5 — unchanged.
- Opacity fades and background/border-color transitions kept smooth `ease`; soft glow pulses (`reward-rarity-*-glow`) kept `ease-in-out`.
- `@media (prefers-reduced-motion: reduce)`: 10 blocks — unchanged.
- No leftover non-tokenized single-value 4-12px radii (grep empty).

## TDD Evidence

- RED: `npm test -- src/ui/layout-contract.test.ts` failed on the new `v0.97 unifies pixel radius and stepped motion tokens` test before the change.
- GREEN: passed. The existing `.workforce-mix-badge` contract was updated from hardcoded `border-radius: 4px` to `var(--pixel-radius)` to track the tokenization.

## Browser Verification (Claude, live dev server :5222)

- First-screen smoke `node scripts/qa/check-v096-first-screen.mjs`: desktop/mobile exit 0, surface overflow 0, office fraction 0.26 / 0.246, 6 actors — no layout regression.
- Desktop screenshot eyeballed: corners read consistent; speech-bubble callout, circular icons, and badges preserved; nothing broken. (`reports/qa/screenshots/v0_96_first_screen_desktop.png` regenerated.)

## Gate

`npm run harness:gate < /dev/null`: PASS — 53 files / 645 tests, validate:data, beta-readiness 15/15, build 1.15s.

## Visual-Only Proof

`git --no-pager diff --quiet -- src/game/simulation.ts src/game/types.ts data/`: empty.

## Notes

- Motion is temporal and cannot be fully verified from a still screenshot; verified by diff review (selective conversion, fades/reduced-motion preserved) + gate. Physical-device motion feel is a follow-up.
- This completes the two scoped v0.97 sweep items chosen by the user (radius + stepped motion). Soft shadows were already pixel-hard (0 of 125 blurred). Gradient flattening was deferred as lower value.
