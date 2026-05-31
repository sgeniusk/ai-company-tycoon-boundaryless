# v0.68 Flow Smoke World Reveal Guard Lane

Status: GREEN

## Scope
- Lane: QA/harness only.
- Files changed: `scripts/qa/check-v068-flow-smoke.mjs`, `src/game/v068-flow-smoke-script.test.ts`.
- Guard target: final-result smoke routes with `-final` paths currently covered by the flow smoke script.

## RED Evidence
- Command: `npm test -- src/game/v068-flow-smoke-script.test.ts --maxWorkers=1 < /dev/null`
- Result: FAIL before implementation.
- Failure: final-result routes `ending-fallback-final` and `ending-nearmiss-final` did not expose `forbiddenTexts`; the new guard test received `undefined`.

## GREEN Evidence
- Command: `npm test -- src/game/v068-flow-smoke-script.test.ts --maxWorkers=1 < /dev/null`
- Result: PASS after implementation.
- Evidence: `Test Files 1 passed (1)`, `Tests 4 passed (4)`.

## Notes
- The smoke route metadata now uses a shared final-result forbidden marker list: `이번 세계가 열렸습니다`, `이 세계로 시작`.
- Integration note: the class marker `world-reveal-overlay` was intentionally removed from the guard because Vite can expose CSS selector text in the DOM dump even when the modal element is absent.
- The runtime DOM inspection fails any guarded final-result route when those modal markers are present above the final result content.
- Full harness gate was not run, per lane instruction.
