# QA Report — Alpha v0.11.0

Date: 2026-05-15

## Automated Verification

- `npm test`: passed, 72 tests.
- `npm run validate:data`: passed.
- `npm run build`: passed.

## Covered Areas

- Achievement unlocks, rewards, and save persistence.
- Growth-path monthly effects.
- Run summary ranking and negative-cash penalty.
- Corrupt save recovery and resource sanitization.
- Runtime state integrity diagnostics.
- Product upgrades and level-scaled monthly output.
- Commercial QA scenario URL generation.

## Browser QA

Checked in Chrome:

- URL: `http://127.0.0.1:5178/?scenario=commercial`
- Result: commercial scenario rendered.
- Observed: `런 결과 A`, two active products, monthly strategy effect row, achievement progress, and event panel.
- Layout: no major text overlap observed at the inspected desktop viewport.

## Notes

- Playwright was unavailable in the Node REPL environment, so Chrome Computer Use was used for visual QA.
- The scenario intentionally shows negative cash pressure; run summary now labels it as a recovery priority.
