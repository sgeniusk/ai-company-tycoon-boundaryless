# v0.67 Block 31 QA - Finale Ending Reward Progress

## Scope
- Added derive-only ending reward progress fields to `getCampaignEndingDiscovery`.
- Surfaced post-run ending codex insight progress in the campaign finale discovery panel.
- Kept save, tick, economy, data, and simulation logic unchanged.

## RED
- `npm test -- src/game/campaign-ending.test.ts --maxWorkers=1 < /dev/null`
  - Failed before implementation because `CampaignEndingDiscovery` did not expose discovered / total reward progress fields.
- `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
  - Failed before implementation because `GameChrome` did not render the reward progress fields or `도감 통찰` / `보상 완성률` labels.

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
- Chrome headless DOM smoke for `http://127.0.0.1:5176/?scenario=ending-replay-final&menu=results`
  - Found `엔딩 도감 반영`, `도감 통찰`, `2/74`, and `보상 완성률` in the rendered results DOM.

## Notes
- Reward progress is calculated from `campaignEndings` and the before/after discovered ending id sets.
- No new persisted fields or migrations were introduced.
