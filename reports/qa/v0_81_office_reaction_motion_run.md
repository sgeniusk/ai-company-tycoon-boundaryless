# v0.81 Office Reaction Motion QA

Timestamp: 2026-05-31 22:52 KST

## Scope

- Added a deterministic final pixel atlas for comic office work reactions.
- Wired office actor state/kind/pose to atlas-backed reaction bubbles and a small working puff loop.
- Kept the block UI/asset-only: no simulation, save, economy, or campaign tick changes.

## TDD

- RED: `npm test -- src/game/asset-manifest.test.ts src/ui/layout-contract.test.ts < /dev/null`
  - Failed as expected because `office_reactions_v081_atlas`, `assets:v081`, and office reaction DOM/CSS hooks did not exist.
- GREEN: `npm test -- src/game/asset-manifest.test.ts src/ui/layout-contract.test.ts < /dev/null`
  - Passed: 2 files / 128 tests.

## Local Browser Smoke

Scenario: `http://127.0.0.1:5222/?scenario=office-visuals`

- Desktop 1366x768:
  - v081 atlas status: 200
  - visible actors: 6 / reactions: 6
  - reaction `image-rendering`: `pixelated`
  - reaction animation: `office-actor-reaction-bounce`
  - working puff animation: `office-actor-work-puff`
  - payoff modal visible after dismiss: false
  - document width overflow: 0
  - console errors: 0
- Mobile 390x844:
  - v081 atlas status: 200
  - visible actors: 6 / reactions: 6
  - reaction `image-rendering`: `pixelated`
  - reaction animation: `office-actor-reaction-bounce`
  - working puff animation: `office-actor-work-puff`
  - payoff modal visible after dismiss: false
  - document width overflow: 0
  - console errors: 0

Screenshots:

- `reports/qa/screenshots/v0_81_office_reaction_motion_desktop.png`
- `reports/qa/screenshots/v0_81_office_reaction_motion_mobile.png`

## Full Gate

Command: `npm run harness:gate < /dev/null`

- Tests: 53 files / 627 tests passed.
- Data validation: passed.
- Beta readiness: PASS, 15/15 checks, 24 endings / 23 replayable.
- Build: passed.

## Notes

- The office motion stays deterministic and atlas-backed; no `Math.random()` or tick-time mutation was added.
- The reduced-motion contract disables both the actor reaction sprite and the working puff.
