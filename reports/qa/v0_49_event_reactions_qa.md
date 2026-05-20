# QA Report — v0.49 Office Event Reactions

Date: 2026-05-20

## Scope

Primary QA route: `http://127.0.0.1:5201/?scenario=office-visuals`

The scenario should show the high-density office scene, animated sprite-sheet actors, direct care candidates, and at least one event reaction generated from `프롬프트 스프린트`.

## Expected Checks

- QA pill says `v0.49 사무실 이벤트 리액션 QA`.
- `getOfficeScenePlan()` returns at least one `card_use` reaction.
- The office DOM includes `office-event-reaction-layer` and `office-event-reaction`.
- Reaction layer has `pointer-events: none`.
- Existing actor focus/direct care controls remain clickable.
- Reduced-motion disables reaction animation.

## Verification Evidence

- `npm test -- src/game/office-scene.test.ts src/ui/layout-contract.test.ts src/game/qa-scenarios.test.ts`
  - Result: Passed
  - Coverage: 3 files / 67 tests
- `npm run harness:gate`
  - Result: Passed
  - Coverage: 40 test files / 294 tests, data validation passed, production build passed
- `curl -I 'http://127.0.0.1:5201/?scenario=office-visuals'`
  - Result: Passed, 200 OK

## Residual Risk

- Browser screenshot QA has not yet been rerun through the in-app browser tool.
- Reactions are bubbles/flash overlays; character pose rows remain a v0.51 candidate.
