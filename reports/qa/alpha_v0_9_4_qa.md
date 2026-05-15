# QA Report — Alpha v0.9.4 Opening Competitor Pacing

Date: 2026-05-15

## Scope

Verified the new rival pacing rule: months 1-3 should show preparation only, while product-space claims begin from month 4 onward.

## TDD Record

- Added a failing simulation test for the first-three-month no-claim window.
- Confirmed the test failed because the old code allowed a rival claim on month 3.
- Implemented the month-gated preparation and claim behavior.
- Re-ran the targeted simulation test suite and confirmed it passed.

## Automated Checks

- `npm test src/game/simulation.test.ts`: Passed, 22 tests
- `npm test`: Passed
- `npm run validate:data`: Passed
- `npm run build`: Passed

## Browser / Local Preview

Not required for this slice because no layout or interaction component changed. The player-visible effect appears through existing timeline and competition-panel text. Stable manual QA URLs from v0.9.3 remain available:

- `http://localhost:5173/?scenario=fresh`
- `http://localhost:5173/?scenario=project`
- `http://localhost:5173/?scenario=release`
- `http://localhost:5173/?scenario=shop`

## Findings

- P0: None.
- P1: None.
- P2: Competition panel should eventually mark "preparing" rivals visually, not only in text.
- P3: Rival IDs in timeline are functional but should later display localized competitor names.

## Verdict

Pass. The old aggressive month-3 claim behavior is covered and fixed.
