# v0.67 Block 32 QA - Active Ending Reward Preview

## Scope
- Added derive-only reward preview fields to `getActiveEndingReplayBrief`.
- Surfaced the target ending's post-completion codex insight progress in the company active-target panel, Deck active summary, and world reveal target card.
- Kept save, tick, economy, data, and simulation logic unchanged.

## RED
- `npm test -- src/game/campaign-ending.test.ts --maxWorkers=1 < /dev/null`
  - Failed before implementation because active replay briefs did not expose before / after / total reward progress or `rewardProgressLabel`.
- `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
  - Failed before implementation because `MenuPanels` and `WorldRevealModal` did not render the active ending reward progress label.

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
- Chrome headless DOM smoke for `http://127.0.0.1:5176/?scenario=ending-replay-active&menu=company`
  - Found `목표 엔딩 런`, `완주 시 도감 통찰`, and `6/74` in the rendered DOM.

## Notes
- Reward preview is calculated from `campaignEndings`, current discovered ending ids, and the active target ending id.
- No new persisted fields or migrations were introduced.
