# Balance Report — Alpha v0.11.0 Commercial Simulations

Date: 2026-05-15

## Purpose

Add repeatable balance coverage for the three post-release growth paths so the project does not rely only on manual tester prompts.

## Harness

Module: `src/game/run-simulator.ts`

The simulator:

- Starts a normal first-product project.
- Advances until first release.
- Commits to a selected growth path.
- Resolves events by weighted resource value.
- Attempts recommended products, upgrades, and capabilities.
- Advances to the 10-month MVP window.
- Returns final state, run summary, and integrity report.

## Findings

- All growth paths are covered by `runAllCommercialSimulations`.
- All simulated final states pass `validateGameStateIntegrity`.
- Productivity path now reaches at least two active products by the 10-month window.
- Cash pressure can remain negative even in otherwise successful growth runs; run summary now penalizes this and recommends recovery.

## Balance Adjustments

- Added `cash: 1800` to the productivity path commitment effect to make the second product branch viable after a project-based first release.
- Prioritized recommended product starts before capability upgrades in the scripted simulation, matching the desired Game Dev Story-style expansion fantasy.

## Remaining Balance Risks

- Automation is still underdeveloped as a recovery plan.
- Trust can stay very high while cash is negative; future work should add investor/debt pressure or financing tools.
- Product upgrades need differentiated cost curves per product category.
