# v0.71 Command Deck Visual Polish QA Run

Date: 2026-05-31

## Scope

- Reworked the persistent top HUD into a commercial command-deck layout with a brand panel, grouped run metrics, campaign progress rail, secondary status cluster, and market intelligence suite.
- Kept the change UI-only: no save, tick, economy, or data-path changes.
- Preserved protected contract files: `AGENTS.md`, `feature_list.json`, `progress.md`, `CLAUDE.md`, and `docs/ROADMAP.md` have no diff.

## TDD Evidence

- RED: Added `src/ui/layout-contract.test.ts` coverage expecting `top-brand-panel`, `top-command-center`, `top-run-metrics`, `top-progress-rail`, `top-secondary-status`, `top-market-suite`, responsive grid rules, and the campaign progress label. The new test initially failed because the old top bar was still an ungrouped pill cluster.
- GREEN: `npm test -- src/ui/layout-contract.test.ts < /dev/null`
  - Result: 1 file passed / 97 tests passed.

## Browser Smoke

Scenario: `http://127.0.0.1:5222/?scenario=beta-readiness`

- Desktop 1366x768:
  - Command-deck selectors present: yes.
  - Modal visible: no.
  - Top-bar child overlaps: none.
  - Horizontal overflow: none (`scrollWidth` 1366 / viewport 1366).
  - Top HUD height: 223.78px, 29.14% of viewport.
  - Stage height remains 436.22px.
  - Console/page errors: none.
  - Screenshot: `reports/qa/screenshots/v0_71_command_deck_beta_readiness_desktop.png`
- Mobile 390x844:
  - Command-deck selectors present: yes.
  - Market suite collapsed by CSS: yes (`display: none`).
  - Modal visible: no.
  - Top-bar child overlaps: none.
  - Horizontal overflow: none (`scrollWidth` 390 / viewport 390).
  - Top HUD height: 141.81px, 16.80% of viewport.
  - Stage height remains 250px.
  - Console/page errors: none.
  - Screenshot: `reports/qa/screenshots/v0_71_command_deck_beta_readiness_mobile.png`

## Gate

Command: `npm run harness:gate < /dev/null`

- `npm test -- --maxWorkers=1`: 53 files passed / 611 tests passed.
- `npm run validate:data`: Data validation passed.
- `npm run qa:beta-readiness:check`: PASS, 15/15 readiness checks.
- `npm run build`: PASS, Vite production build completed.

## Notes

- The visual change is intentionally scoped to the first persistent chrome layer so it can be verified without rebalancing gameplay or touching save state.
- Next appearance pass should target the lower command controls and right-side dossier panels so the rest of the first viewport matches the new command-deck treatment.
