# v0.70 World Reveal Tutorial Overlap Guard QA

## Scope
- Prevented helper tutorial panels from mounting while the world reveal modal is visible.
- Lifted world reveal visibility to `App` through `EventPanels` so dismissal restores normal tutorial behavior.
- Strengthened start/retry-start browser smoke routes with a forbidden helper tutorial marker.
- Preserved save schema, monthly tick/economy, data files, and contract files.

## RED
- `npm test -- src/ui/layout-contract.test.ts < /dev/null`
  - Failed as expected because `App` did not yet import `shouldShowWorldReveal`, track `worldRevealVisible`, or gate helper tutorials on it.
- `npm test -- src/game/v068-flow-smoke-script.test.ts < /dev/null`
  - Failed as expected because start/retry-start routes did not yet include `미나의 안내` as forbidden text.

## GREEN
- `npm test -- src/ui/layout-contract.test.ts < /dev/null`
  - PASS, 96 tests.
- `npm test -- src/game/v068-flow-smoke-script.test.ts < /dev/null`
  - PASS, 6 tests.
- `npm run qa:v068-flow-smoke < /dev/null`
  - PASS, 8/8 routes, refreshed smoke artifacts.
- `npm run qa:v068-flow-smoke:check < /dev/null`
  - PASS, `Report: PASS`, `Summary: PASS`.
- `npm run qa:v068-beta-candidate < /dev/null`
  - PASS, 2/2 checks.
- `npm run harness:gate < /dev/null`
  - 53 files / 608 tests passed.
  - `npm run validate:data` passed.
  - `npm run qa:beta-readiness:check` passed with 15/15 readiness checks.
  - `npm run build` passed.

## Browser Evidence
- In-app browser: `http://127.0.0.1:5222/?scenario=ending-nearmiss-retry-start`
  - `이번 세계가 열렸습니다`: true.
  - `목표 루트:`: true.
  - `미나의 안내`: false.
  - `.helper-tutorial` mounted: false.
- Screenshot: `reports/qa/screenshots/v0_70_world_reveal_no_tutorial_overlap.png`.
