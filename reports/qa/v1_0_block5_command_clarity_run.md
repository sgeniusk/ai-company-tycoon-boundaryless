# v1.0 #5 Command-row Clarity QA

Date: 2026-06-03

## Scope
Take the read-only StrategyHand out of the CommandRow so the four command controls (다음 달 / 새 게임 / 저장 / 불러오기) can show labels; preserve hand awareness via a 손패 count badge on the deck launcher (the deck popup already renders the hand). visual/additive — StrategyHand is display-only, no game logic change.

## Implementation (Claude — Codex hung at startup for 21 min and was cancelled)
- GameChrome CommandRow: removed `<StrategyHand gameState={gameState} />`.
- MenuLauncherBar: new optional `handCount` prop + a `hand-count-badge` on the deck button (gameState.roguelite.deck.hand.length).
- App.tsx: passes `handCount` to MenuLauncherBar.
- App.css: a `@media (min-width: 1101px)` rule shows `.command-row .secondary-action span` on desktop (the v0.93 base rule hid them); with the hand gone there is room for all four labels.

## Verification (Claude, live :5222)
- Command labels visible desktop: ["다음 달", "새 게임", "저장", "불러오기"]; command-row overflow 0; deck launcher 손패 badge renders "3".
- check-v096-first-screen: desktop overflow 0, officeVisibleFraction 0.376 -> 0.403 (the freed hand width grew the office past 0.40).
- check-v1_0-menu-popup: 8/8, 0 errors.
- Gate: 53 files / 652 tests, build 752ms. Additive diff empty.

## Notes
- StrategyHand function kept (still asserted by an existing contract) but unused in CommandRow; the deck popup (DeckPanel handCards) shows the hand.
- Secondary command labels are desktop-only (>1100px); mobile keeps the compact icon-first console.
