# v0.67 Block 30 QA - Ending Codex Reward Totals

## Scope
- Added derive-only reward totals to `getEndingCollectionSummary`.
- Surfaced discovered / total / remaining ending insight reward totals in the Deck ending codex summary.
- Kept save, tick, economy, data, and simulation logic unchanged.

## RED
- `npm test -- src/game/campaign-ending.test.ts --maxWorkers=1 < /dev/null`
  - Failed before implementation because `getEndingCollectionSummary` did not expose `discoveredRewardBonus`, `lockedRewardBonus`, or `totalRewardBonus`.
- `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
  - Failed before implementation because `MenuPanels` did not render the reward-total fields / labels and `.ending-collection-summary` still used three columns.

## GREEN
- `npm test -- src/game/campaign-ending.test.ts --maxWorkers=1 < /dev/null`
  - 1 file / 14 tests passed.
- `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
  - 1 file / 87 tests passed.

## Gate
- `npm run harness:gate < /dev/null`
  - 49 files / 538 tests passed.
  - `npm run validate:data` passed.
  - `npm run build` passed.

## Browser Smoke
- `npm run dev -- --host 127.0.0.1 --port 5176 < /dev/null`
- Chrome headless DOM smoke for `http://127.0.0.1:5176/?scenario=ending-replay&menu=deck`
  - Found `엔딩 도감`, `6/74`, `통찰 보상`, and `남은 보상` in the rendered Deck DOM.

## Notes
- Reward totals are projections from `campaignEndings` and `roguelite.discoveredEndingIds`.
- No new `GameState` fields or persisted save migrations were introduced.
