# v0.67 Block 38 QA - Final-Only Ending Codex Card Copy

## Scope
- Marked fallback/final-only ending cards in the ending codex as `결과 전용 엔딩`.
- Changed locked final-only copy to `캠페인 결과에서만 공개되는 엔딩입니다.` so it is not confused with replay-target conditions.
- Kept save, tick, economy, campaign-ending selection, and simulation logic unchanged.

## RED
- `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
  - Failed before implementation because `MenuPanels` did not branch on `entry.condition.fallback === true` or contain the final-only card copy.

## GREEN
- `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
  - 1 file / 87 tests passed.

## Gate
- `npm run harness:gate < /dev/null`
  - 49 files / 542 tests passed.
  - `npm run validate:data` passed.
  - `npm run build` passed.

## Browser Smoke
- `npm run dev -- --host 127.0.0.1 --port 5176 < /dev/null`
- Chrome headless DOM smoke for `http://127.0.0.1:5176/?scenario=ending-replay-complete&menu=deck`
  - Found `결과 전용 엔딩`, `캠페인 결과에서만 공개되는 엔딩입니다.`, `남은 목표`, `결과 전용 잠김`, and `목표 엔딩 완료`.
  - Chrome emitted only macOS task-policy warnings; the DOM dump was captured and matched the expected UI text.

## Notes
- The fallback ending remains part of total collection progress but is visually separated from replay targets.
- No new persisted fields or migrations were introduced.
