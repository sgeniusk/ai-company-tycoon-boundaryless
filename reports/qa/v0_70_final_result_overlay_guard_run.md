# v0.70 Final Result Overlay Guard QA

## Scope
- Fixed final-result QA routes being blocked by the world reveal modal.
- Added a pure `shouldShowWorldReveal` selector so the reveal appears only for opening, active, non-standard runs.
- Strengthened flow smoke final-result routes with forbidden world-reveal copy.
- Preserved save schema, monthly tick/economy, data files, and contract files.

## RED
- `npm test -- src/game/run-modifiers.test.ts --maxWorkers=1 < /dev/null`
  - Failed before implementation because `shouldShowWorldReveal` did not exist.
- `npm test -- src/game/v068-flow-smoke-script.test.ts --maxWorkers=1 < /dev/null`
  - Failed in the harness lane because final-result routes had no forbidden world-reveal markers.
- `npm run qa:v068-flow-smoke < /dev/null`
  - Initially failed 6/8 after adding the guard because `world-reveal-overlay` matched CSS selector text in the DOM dump.

## GREEN
- `npm test -- src/game/run-modifiers.test.ts src/game/v068-flow-smoke-script.test.ts src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
  - 3 files / 118 tests passed.
- `npm run qa:v068-flow-smoke < /dev/null`
  - PASS, 8/8 routes, refreshed smoke artifacts.
- `npm run qa:v068-flow-smoke:check < /dev/null`
  - PASS, `Report: PASS`, `Summary: PASS`.
- `npm run qa:v068-beta-candidate < /dev/null`
  - PASS, 2/2 checks.
- `npm run harness:gate < /dev/null`
  - 53 files / 606 tests passed.
  - `npm run validate:data` passed.
  - `npm run qa:beta-readiness:check` passed with 15/15 readiness checks.
  - `npm run build` passed.
- In-app browser smoke: `http://127.0.0.1:5222/?scenario=ending-nearmiss-final`
  - Title loaded: `AI 컴퍼니 타이쿤: 바운더리리스`.
  - `이번 세계가 열렸습니다`: 0.
  - `이 세계로 시작`: 0.
  - `베타 클로징`: 1.
  - `.beta-completion-crest` visible: true.
  - Screenshot capture timed out in CDP, but DOM/visibility checks passed.
