# v1.0 #1 Popup Shell + Launcher + Office Width QA

Date: 2026-06-02

## Scope

- Remove the persistent right `menu-layout` column; menus open as dismissible popups from a bottom grouped launcher bar; office stage becomes full width by default. visual/additive.
- No simulation, save, data, economy, tick, or RNG change.

## Implementation (Codex)

- App.tsx: `isMenuPopupOpen` state + `openMenu` wrapper (`setActiveMenu` + open popup). All GameStage/EventPanels/tutorial menu-opens pass `openMenu` as the `setActiveMenu` prop, so the 61 downstream callsites (GameChrome/MenuPanels) are UNTOUCHED. menu-layout section removed.
- `MenuLauncherBar` (GameChrome) — grouped 운영/성장/시장, icon+label, click = openMenu.
- `MenuPopupModal` (new) — reuses the v0.98 overlay pattern (role=dialog aria-modal, dismiss button + Esc + initial focus + reduced-motion); body = renderMenuContent(activeMenu).
- App.css: single-column grid, office stage minmax(0,1fr) dominant, launcher bottom row, popup overlay/card styles, breakpoints fixed at 1100/700.

## TDD Evidence

- RED: `npm test -- src/ui/layout-contract.test.ts` failed on the old grid assertions + missing launcher/popup markers.
- GREEN: passed (125 in file). Full suite 53 files / 649 tests. Build (tsc) clean.

## Browser Verification (Claude, live dev server :5222)

- `node scripts/qa/check-v1_0-menu-popup.mjs`: all 8 menus (company/products/deck/agents/research/shop/competition/log) open from the launcher and dismiss (via button AND Esc), no lingering overlay, 0 console errors.
- `node scripts/qa/check-v096-first-screen.mjs`: office visible, 6 actors, surface overflow 0, office center uncovered, 0 errors. officeVisibleFraction desktop 0.24 / mobile 0.246.
- Screenshots eyeballed: popup = clean centered modal rendering the menu content, dismissible; launcher bar = grouped, bottom, icon+label (desktop + mobile). Menu column gone.

## Gate

`npm run harness:gate < /dev/null`: PASS — 53 files / 649 tests, validate:data, beta-readiness 15/15, build 920ms, no chunk warning.

## Additive Proof

`git --no-pager diff --quiet -- src/game/simulation.ts src/game/types.ts data/`: empty.

## Notes — office dominance is block 2

This block is the STRUCTURAL half: the always-on menu column is gone, the popup system + launcher are in place, with no regression. The office-scene fraction held at ~0.24 (slightly under the prior 0.26) because the freed column is reabsorbed by the still-present `stage-side` panel + the new launcher row. **Block 2 (remove/relocate stage-side, slim the office overlays via the "다음 행동" chip, split 꾸미기 out as an office button) delivers the actual office-dominance fraction gain.**
