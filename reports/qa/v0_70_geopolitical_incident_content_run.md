# v0.70 Geopolitical Incident Content Run

Date: 2026-05-31
Branch: main
Base: 9f041d0

## Scope

- Added two yearly world events that frame defense/geopolitical AI as safety and neutrality pressure:
  - `autonomous_weapons_hearing`
  - `border_drone_contracts`
- Added two rival events with localized Korean/English decision text:
  - `defense_procurement_bid`
  - `autonomous_safety_leak`
- Updated the data validator's `world_events` count guard from 28 to 32 so the new content wave is accepted without engine changes.

## TDD Evidence

RED:

- `npm test -- src/game/content.test.ts < /dev/null`
  - Failed as expected while `rivalEvents.length` was still 3 and the new rival event ids did not exist.
- `npm test -- src/game/world-events.test.ts < /dev/null`
  - Failed as expected while `worldEvents.length` was still 28 and the new geopolitical event ids did not exist.

GREEN:

- `npm test -- src/game/world-events.test.ts < /dev/null`
  - 1 file passed, 9 tests passed.
- `npm test -- src/game/content.test.ts < /dev/null`
  - 1 file passed, 8 tests passed.
- `npm run validate:data < /dev/null`
  - Data validation passed.

## Full Gate

Command:

```bash
npm run harness:gate < /dev/null
```

Result:

- Test suite: 53 files passed, 609 tests passed.
- Data validation: PASS.
- Beta-readiness check: PASS, 15/15 readiness checks, 23/23 replayable ending guidance, 4/4 route axes, 40/40 options.
- Production build: PASS.

## Guardrails

- No save schema, tick, monthly economy, or run simulator logic changes.
- No protected contract files changed.
- The defense/geopolitical content is modeled as tradeoffs with safety, trust, and rival pressure rather than direct war victory rewards.
