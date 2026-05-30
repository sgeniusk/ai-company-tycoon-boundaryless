# v0.67 Block 34 QA - Known Ending Replay Scenario

## Scope
- Added `ending-replay-known` browser QA scenario for already-discovered target ending replay runs.
- The scenario opens the company panel with `privacy_trust_bastion` already in the ending codex.
- Kept save, tick, economy, data, and simulation logic unchanged.

## RED
- `npm test -- src/game/qa-scenarios.test.ts --maxWorkers=1 < /dev/null`
  - Failed before implementation because `ending-replay-known` was missing from `qaScenarioIds`, URL search resolution, and scenario factory handling.
- `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
  - Failed before implementation because `qa-scenarios.ts` did not expose the new scenario id.

## GREEN
- `npm test -- src/game/qa-scenarios.test.ts --maxWorkers=1 < /dev/null`
  - 1 file / 60 tests passed.
- `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
  - 1 file / 87 tests passed.

## Gate
- `npm run harness:gate < /dev/null`
  - 49 files / 540 tests passed.
  - `npm run validate:data` passed.
  - `npm run build` passed.

## Browser Smoke
- `npm run dev -- --host 127.0.0.1 --port 5176 < /dev/null`
- Chrome headless DOM smoke for `http://127.0.0.1:5176/?scenario=ending-replay-known&menu=company`
  - Found `발견 완료 목표`, `발견 완료`, `도감 통찰`, `6/74`, and `목표 엔딩 런` in the rendered DOM.

## Notes
- This closes the manual smoke gap from block #33 for the already-discovered target branch.
- No new persisted fields or migrations were introduced.
