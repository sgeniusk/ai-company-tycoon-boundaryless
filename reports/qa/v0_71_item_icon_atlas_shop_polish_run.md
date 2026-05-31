# v0.71 Item Icon Atlas Shop Polish QA Run

Date: 2026-05-31

## Scope

- Promoted the first-shop item icon set from CSS placeholder glyphs to atlas-backed final UI art.
- Reused the deterministic `commercial_ui_v071_atlas` sheet so item cards, shop recommendations, and inventory-adjacent surfaces share the same visual language as the polished HUD.
- Kept the change visual/data-contract-only: no economy, shop pricing, item effects, save migration, or simulation logic changes.
- Preserved protected contract files: `AGENTS.md`, `feature_list.json`, `progress.md`, `CLAUDE.md`, and `docs/ROADMAP.md` have no diff.

## TDD Evidence

- RED: Added `src/game/asset-manifest.test.ts` coverage requiring every item icon to be `final`, atlas-backed, and within the atlas frame bounds; added `src/ui/layout-contract.test.ts` coverage requiring `getItemIconAtlasStyle`, `item-icon-atlas`, and CSS atlas background positioning. The layout test initially failed because MenuPanels still rendered CSS placeholder glyphs.
- GREEN: `npm test -- src/game/asset-manifest.test.ts src/ui/layout-contract.test.ts < /dev/null`
  - Result: 2 files passed / 115 tests passed.

## Browser Smoke

Scenario: `http://127.0.0.1:5222/?scenario=beta-readiness`, shop menu opened.

- Desktop 1366x768:
  - Item atlas icons: 18 visible/loaded in shop DOM.
  - Atlas request: 200.
  - Atlas backgrounds loaded from `/assets/ui/v071-commercial-ui-atlas.png`: yes.
  - Visible shop cards: 45.
  - Text fit failures: none.
  - Horizontal overflow: none.
  - Console/page errors: none.
  - Screenshots:
    - `reports/qa/screenshots/v0_71_item_icon_atlas_shop_desktop.png`
    - `reports/qa/screenshots/v0_71_item_icon_atlas_cards_desktop.png`
- Mobile 390x844:
  - Item atlas icons: 18 visible/loaded in shop DOM.
  - Atlas request: 200.
  - Atlas backgrounds loaded from `/assets/ui/v071-commercial-ui-atlas.png`: yes.
  - Visible shop cards: 45.
  - Text fit failures: none.
  - Horizontal overflow: none.
  - Console/page errors: none.
  - Screenshots:
    - `reports/qa/screenshots/v0_71_item_icon_atlas_shop_mobile.png`
    - `reports/qa/screenshots/v0_71_item_icon_atlas_cards_mobile.png`

## Gate

Command: `npm run harness:gate < /dev/null`

- `npm test -- --maxWorkers=1`: 53 files passed / 614 tests passed.
- `npm run validate:data`: Data validation passed.
- `npm run qa:beta-readiness:check`: PASS, 15/15 readiness checks.
- `npm run build`: PASS, Vite production build completed.

## Notes

- `ItemIconDefinition` now supports optional `sheet_id` and `sheet_index` so future item-specific art sheets can replace the shared commercial atlas without changing shop rendering.
- This finishes one more visible placeholder removal pass; remaining art debt is mostly competitor logos and deeper panel composition.
