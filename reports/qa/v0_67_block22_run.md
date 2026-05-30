# v0.67 Block 22 QA Run

## Scope
- Added a derive-only final ending discovery selector for result-screen collection feedback.
- Surfaced "새 엔딩 발견" / "기록 갱신", after-run codex progress, and ending meta reward in the final results tab.
- No save, tick, monthly economy, or campaign finale judgement changes.

## RED
- Command: `npm test -- src/game/campaign-ending.test.ts --maxWorkers=1 < /dev/null`
- Result: failed as expected.
- Evidence: the new discovery test failed because `getCampaignEndingDiscovery` was not implemented.
- Command: `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
- Result: failed as expected.
- Evidence: the new layout contract expected `getCampaignEndingDiscovery`, `ending-discovery-panel`, `새 엔딩 발견`, and `도감 반영` before the UI existed.

## GREEN
- Command: `npm test -- src/game/campaign-ending.test.ts --maxWorkers=1 < /dev/null`
- Result: passed.
- Evidence: 1 test file, 13 tests passed.
- Command: `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
- Result: passed.
- Evidence: 1 test file, 82 tests passed.

## Gate
- Command: `npm run harness:gate < /dev/null`
- Result: passed.
- Evidence: 49 test files, 532 tests passed; data validation passed; production build completed.

## Browser Smoke
- Command: headless Chrome DOM smoke against `http://127.0.0.1:5176/?scenario=ending-replay-final`.
- Result: found `ending-discovery-panel`, `새 엔딩 발견`, `도감 반영`, and `다음 런 메타 보상`.

## Notes
- The panel previews the codex state after the current final ending is added on restart.
- Discovery state still persists only through the existing `resetRunWithMetaUnlocks` path.
