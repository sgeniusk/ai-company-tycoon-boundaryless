# v0.79 Product Domain Icon Polish Run

Date: 2026-05-31

## Scope

- Commercial-polish block for the existing products menu.
- Added a deterministic product-domain icon atlas and connected it to domain filters plus product cards.
- No simulation, save, economy, or balance code changed.
- Protected contract files were not edited.

## TDD Evidence

RED:

- `npm test -- src/game/asset-manifest.test.ts src/ui/layout-contract.test.ts < /dev/null`
- Expected failures:
  - missing `assetManifest.sprite_sheets.product_domain_v079_atlas`
  - missing products-menu atlas-backed `product-domain-icon` contract

GREEN:

- `npm run assets:v079 < /dev/null`
  - Wrote `public/assets/ui/v079-product-domain-atlas.png` at 240x144.
- `npm test -- src/game/asset-manifest.test.ts src/ui/layout-contract.test.ts < /dev/null`
  - 2 files passed.
  - 124 tests passed.

## Browser Smoke

Local URL:

- `http://127.0.0.1:5222/?scenario=physical-industries`

Process:

- Dismissed the scenario reward queue.
- Scrolled the products menu to the domain filter and card area.
- Captured desktop and mobile screenshots.

Results:

- Desktop 1366x768:
  - atlas request: 200
  - console/page errors: 0
  - product-domain icons: 51
  - domain-filter icons: 15
  - product-card icons: 36
  - visible reward modal after dismissal: false
  - horizontal overflow: 0
  - screenshot: `reports/qa/screenshots/v0_79_product_domain_icons_desktop.png`
- Mobile 390x844:
  - atlas request: 200
  - console/page errors: 0
  - product-domain icons: 51
  - domain-filter icons: 15
  - product-card icons: 36
  - visible reward modal after dismissal: false
  - horizontal overflow: 0
  - screenshot: `reports/qa/screenshots/v0_79_product_domain_icons_mobile.png`

## Gate

- `npm run harness:gate < /dev/null`
  - PASS
  - Vitest: 53 files passed / 623 tests passed
  - Data validation: PASS
  - Beta readiness: PASS, 15/15 checks, 24 endings total / 23 replayable
  - Build: PASS

## Notes

- The domain atlas covers all 15 product domains in `data/domains.json`.
- The `ALL` filter intentionally remains text-only while every concrete domain receives art.
- The block is derive/UI-only and does not affect determinism.
