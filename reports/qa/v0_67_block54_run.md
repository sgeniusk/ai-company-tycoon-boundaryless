# v0.67 Block 54 QA Run - Result-Only Run Summary Spotlight

## Scope
- Run summary ending spotlights now treat zero-reward final-only endings as result records.
- Newly discovered fallback endings show `엔딩 보너스 없음 · 결과 전용 기록`.
- Repeated fallback endings show `엔딩 보너스 없음 · 도감 보상 수집 완료`.

## RED
- `npm test -- src/game/run-summary.test.ts --maxWorkers=1 < /dev/null`
  - Failed before implementation because fallback ending spotlights still showed `엔딩 보너스 없음 · 신규 도감 보상`.

## GREEN
- `npm test -- src/game/run-summary.test.ts --maxWorkers=1 < /dev/null`
  - 1 file passed.
  - 9 tests passed.

## Gate
- `npm run harness:gate < /dev/null`
  - 49 files passed.
  - 550 tests passed.
  - Data validation passed.
  - Production build passed.

## Browser Smoke
- Scenario: `http://127.0.0.1:5176/?scenario=ending-fallback-final&menu=results`
- Confirmed DOM text:
  - `다시 차고로`
  - `결과 전용 기록`
  - `결과 전용 엔딩이 도감에 기록됩니다`
  - `신규 엔딩 발견`
  - `엔딩 보너스 없음 · 결과 전용 기록`
- The smoke match did not return `엔딩 보너스 없음 · 신규 도감 보상` for the fallback final results DOM.

## Notes
- Derive-only run summary spotlight label correction.
- No save, tick, economy, ending-selection, or meta-progression behavior changes.
