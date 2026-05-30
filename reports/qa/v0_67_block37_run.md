# v0.67 Block 37 QA - Replayable Ending Summary Counts

## Scope
- Split ending collection summary counts into total endings, replayable target endings, and final-only locked endings.
- Changed the Deck codex summary from `남은 엔딩` to `남은 목표 · 결과 전용 잠김 N` so the fallback ending no longer conflicts with the completed replay-target state.
- Kept save, tick, economy, campaign-ending selection, and simulation logic unchanged.

## RED
- `npm test -- src/game/campaign-ending.test.ts --maxWorkers=1 < /dev/null`
  - Failed before implementation because `replayableCount`, `discoveredReplayableCount`, `lockedReplayableCount`, and `finalOnlyLockedCount` were missing from `getEndingCollectionSummary`.
- `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
  - Failed before implementation because `MenuPanels` did not use the replayable/final-only summary fields or the new `남은 목표` / `결과 전용 잠김` copy.

## GREEN
- `npm test -- src/game/campaign-ending.test.ts --maxWorkers=1 < /dev/null`
  - 1 file / 16 tests passed.
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
  - Found `남은 목표`, `결과 전용 잠김`, `목표 엔딩 완료`, `모든 목표 엔딩 발견`, and `엔딩 도감`.
  - Chrome emitted only background allocator/GCM/app-install warnings; the DOM dump was captured and matched the expected UI text.

## Notes
- This keeps the fallback `garage_restart` ending visible in total collection progress while making clear it is not another replay target.
- No new persisted fields or migrations were introduced.
