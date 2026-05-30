# v0.67 Block 56 QA Run - Repeat Ending Reward Deduplication

## Scope
- Ending meta reward bonuses now apply only when the final ending is newly discovered.
- Repeated endings keep their collection status but no longer add duplicate founder insight.
- Run summary insight breakdown omits the ending bonus line for repeated endings.

## RED
- `npm test -- src/game/meta-progression.test.ts src/game/run-summary.test.ts --maxWorkers=1 < /dev/null`
  - Failed before implementation because repeated `standard_platform_compounder` still rewarded 144 instead of 142 insight.
  - Failed before implementation because repeated run-summary insight reward still matched the first-clear reward.

## GREEN
- `npm test -- src/game/meta-progression.test.ts src/game/run-summary.test.ts --maxWorkers=1 < /dev/null`
  - 2 files passed.
  - 16 tests passed.

## Gate
- `npm run harness:gate < /dev/null`
  - 49 files passed.
  - 551 tests passed.
  - Data validation passed.
  - Production build passed.

## Browser Smoke
- Scenario: `http://127.0.0.1:5176/?scenario=ending-replay-known-final&menu=results`
- Confirmed DOM text:
  - `프라이버시 신뢰 요새`
  - `발견 완료 엔딩`
  - `도감 보상 수집 완료`
  - `이미 획득한 도감 보상입니다`
  - `도감 통찰 6/74`
  - `창업 통찰 +171`
- Confirmed absent from DOM:
  - `엔딩 보너스 프라이버시 신뢰 요새 +4`

## Notes
- This changes meta reward math for repeated endings to match the collection-aware UI copy.
- No save, tick, economy, ending-selection, or collection persistence behavior changes.
