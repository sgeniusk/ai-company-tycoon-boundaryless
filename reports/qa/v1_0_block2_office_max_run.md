# v1.0 #2 Office Maximization QA

Date: 2026-06-02

## Scope

- Relocate the in-stage `stage-side` info column into a `현황/가이드` popup (game-stage becomes office-only full width); replace OfficeActionSlots + OperationCommandPanel with a `next-action-chip` (운영) + a distinct `office-decor-button` (꾸미기). visual/additive.
- No simulation, save, data, economy, tick, or RNG change.

## Implementation (Codex)

- `stage-side` JSX relocated INLINE (not extracted) into `.stage-status-popup-overlay` (role=dialog aria-modal, Esc/focus/reduced-motion, close button), toggled by local `statusPopupOpen` — all props/handlers stay in GameStage scope.
- `.game-stage` is now a single-column office-only grid (the office|side split removed).
- OfficeActionSlots + OperationCommandPanel removed (0 refs); `next-action-chip` (다음 행동, bottom-left, derives the top guided action) + `office-decor-button` (🎨, top-right, opens shop) added.

## TDD Evidence

- RED→GREEN on src/ui/layout-contract.test.ts (popup/chip/decor markers). Full suite 53 files / 650 tests. Build (tsc + vite) clean.

## Browser Verification (Claude, live :5222)

- `check-v096-first-screen`: officeVisibleFraction desktop **0.291 (up from 0.24)**, mobile 0.254; office now FULL stage width; 6 actors; surface overflow 0; office center uncovered; 0 errors.
- `check-v1_0-menu-popup`: 8/8 menus open + dismiss, 0 errors — no regression.
- `.next-action-chip` visible, `.office-decor-button` visible.

## Gate

`npm run harness:gate < /dev/null`: PASS — 53 files / 650 tests, build 1.05s, no chunk warning.

## Additive Proof

`git --no-pager diff --quiet -- src/game/simulation.ts src/game/types.ts data/`: empty.

## Notes — chrome height limits full dominance (block 3)

Element height measurement at 1366x768: **top bar renders 224px** (brand + status + pills + progress, ~29% of the viewport), office 244, resource 58, command 100, launcher 72. The office is now full-WIDTH but vertically short because the top bar and bottom rows eat the height. **Block 3 compacts the top bar + command row to reclaim office height and push officeVisibleFraction toward dominance (>=0.40).** This is a chrome-height concern orthogonal to the menu redesign.
