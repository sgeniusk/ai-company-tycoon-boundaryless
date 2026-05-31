# v0.70 Target Run World Reveal Guard QA

## Scope
- Strengthened target/retry-start browser smoke routes so they must prove the opening world reveal is present.
- Expanded the target-ending world reveal card with route labels and the first two deterministic opening moves.
- Preserved final-result overlay guards, save schema, monthly tick/economy, data files, and contract files.

## RED
- `npm test -- src/ui/layout-contract.test.ts < /dev/null`
  - Failed as expected because `WorldRevealModal` did not yet include `목표 루트`, target route labels, or `openingMoves.slice(0, 2)`.
- `npm test -- src/game/v068-flow-smoke-script.test.ts < /dev/null`
  - Failed in the parallel QA lane because start/retry-start routes did not yet require a world reveal/run briefing marker.

## GREEN
- `npm test -- src/ui/layout-contract.test.ts < /dev/null`
  - PASS, 96 tests.
- `npm test -- src/game/v068-flow-smoke-script.test.ts < /dev/null`
  - PASS, 5 tests.
- `npm run qa:v068-flow-smoke < /dev/null`
  - PASS, 8/8 routes, refreshed smoke artifacts.
- `npm run qa:v068-flow-smoke:check < /dev/null`
  - PASS, `Report: PASS`, `Summary: PASS`.
- `npm run qa:v068-beta-candidate < /dev/null`
  - PASS, 2/2 checks.
- `npm run harness:gate < /dev/null`
  - 53 files / 607 tests passed.
  - `npm run validate:data` passed.
  - `npm run qa:beta-readiness:check` passed with 15/15 readiness checks.
  - `npm run build` passed.

## Browser Evidence
- In-app browser: `http://127.0.0.1:5222/?scenario=ending-nearmiss-retry-start`
  - `이번 세계가 열렸습니다`: true.
  - `AGI 안전 협정`: true.
  - `목표 루트:`: true.
  - `이 세계로 시작`: true.
  - Target card text included route labels and first two opening moves.
- Screenshot: `reports/qa/screenshots/v0_70_target_run_world_reveal.png`.
