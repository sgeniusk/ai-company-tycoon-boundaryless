# v0.67 Block 64 QA - Final Discovery Reward Label Delta Semantics

## Scope
- Aligned `CampaignEndingDiscovery.rewardLabel` with the actual final reward delta.
- Repeated reward endings now return `+0 도감 통찰` instead of the original collectible bonus amount.
- Result-only endings now return the same `+0 도감 통찰` reward label used by `rewardDeltaLabel`.
- No `GameState`, save, tick, selector priority, UI layout, or economy changes.

## RED
Command:
```sh
npm test -- src/game/campaign-ending.test.ts src/game/qa-scenarios.test.ts --maxWorkers=1 < /dev/null
```

Expected failures:
- Repeated `privacy_trust_bastion` final discovery still returned `rewardLabel: "+4 통찰"`.
- New `garage_restart` result-only final discovery still returned `rewardLabel: "+0 통찰"`.
- QA scenario coverage exposed the same mismatch on `ending-replay-known-final` and `ending-fallback-final`.

Result:
- 2 files failed.
- 81 tests passed, 4 tests failed.

## GREEN
Command:
```sh
npm test -- src/game/campaign-ending.test.ts src/game/qa-scenarios.test.ts --maxWorkers=1 < /dev/null
```

Result:
- 2 files passed.
- 85 tests passed.

## Full Gate
Command:
```sh
npm run harness:gate < /dev/null
```

Result:
- 49 test files passed.
- 553 tests passed.
- Data validation passed.
- Production build passed.

## Browser Smoke
- Not run for this block because no rendered UI surface changed.
- The changed selector output is covered by direct campaign-ending tests plus QA scenario fixtures.
