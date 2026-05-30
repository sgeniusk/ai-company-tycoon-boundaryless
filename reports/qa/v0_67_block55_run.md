# v0.67 Block 55 QA Run - Final Discovery Codex Apply Copy

## Scope
- Added `codexApplyLabel` to final campaign ending discovery reports.
- Final results render the derived codex application guidance instead of inline repeated/new branching.
- Result-only endings tell the player they will be added as result records.
- Repeated endings keep the existing collected-copy path.

## RED
- `npm test -- src/game/campaign-ending.test.ts src/game/qa-scenarios.test.ts src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
  - Failed before implementation because `CampaignEndingDiscovery` did not expose `codexApplyLabel`.
  - Failed before implementation because the final results panel still used inline `alreadyDiscovered` branching for the codex apply copy.

## GREEN
- `npm test -- src/game/campaign-ending.test.ts src/game/qa-scenarios.test.ts src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
  - 3 files passed.
  - 171 tests passed.

## Gate
- `npm run harness:gate < /dev/null`
  - 49 files passed.
  - 550 tests passed.
  - Data validation passed.
  - Production build passed.

## Browser Smoke
- Scenario: `http://127.0.0.1:5176/?scenario=ending-fallback-final&menu=results`
- Confirmed DOM text:
  - `엔딩 도감 반영`
  - `도감 반영`
  - `결과 전용 기록`
  - `재시작하면 결과 기록으로 도감에 추가됩니다`
  - `다시 차고로`
- The smoke match did not return `재시작하면 엔딩 도감에 추가됩니다` for the fallback final results DOM.

## Notes
- Derive-only final discovery guidance copy alignment.
- No save, tick, economy, ending-selection, or meta-progression behavior changes.
