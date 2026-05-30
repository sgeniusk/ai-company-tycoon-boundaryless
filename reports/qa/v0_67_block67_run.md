# v0.67 Block 67 QA - Ending Data Coverage

## Scope
- Added two derive-only campaign endings:
  - `san_francisco_ai_boom_launchpad`: San Francisco + open-source world + AI boom launch loop.
  - `steady_operator_compounder`: steady-market operator founder baseline coverage.
- Increased ending data invariant from 22 to 24 entries.
- No `GameState`, save, tick, economy, finale selector, or monthly simulation changes.

## RED
Command:
```sh
npm test -- src/game/campaign-ending.test.ts --maxWorkers=1 < /dev/null
```

Expected failures:
- `campaignEndings.map((ending) => ending.id)` did not include the two new ending IDs.
- `validate:data` source still required exactly 22 campaign endings.

Result:
- 1 file failed.
- 17 tests passed, 2 tests failed.

## GREEN
Commands:
```sh
npm test -- src/game/campaign-ending.test.ts --maxWorkers=1 < /dev/null
npm run validate:data < /dev/null
```

Result:
- `src/game/campaign-ending.test.ts`: 19 tests passed.
- Data validation passed.

## Full Gate
Command:
```sh
npm run harness:gate < /dev/null
```

Result:
- 49 test files passed.
- 554 tests passed.
- Data validation passed.
- Production build passed.

## Data Coverage Check
Command:
```sh
node - <<'NODE'
const fs = require('node:fs');
const endings = JSON.parse(fs.readFileSync('data/endings.json', 'utf8')).endings;
console.log(`ending_count=${endings.length}`);
for (const id of ['san_francisco_ai_boom_launchpad', 'steady_operator_compounder']) {
  const ending = endings.find((entry) => entry.id === id);
  console.log(`${id}: priority=${ending.priority}, reward=${ending.meta_reward_bonus}, title=${ending.title}`);
}
const cityIds = ['default_city', 'san_francisco'];
const marketIds = ['steady_market', 'ai_boom'];
for (const city of cityIds) console.log(`city_${city}=${endings.filter((ending) => ending.condition.start_city_ids?.includes(city)).length}`);
for (const market of marketIds) console.log(`market_${market}=${endings.filter((ending) => ending.condition.market_condition_ids?.includes(market)).length}`);
NODE
```

Result:
- `ending_count=24`
- `san_francisco_ai_boom_launchpad`: priority 94, reward 4.
- `steady_operator_compounder`: priority 68, reward 3.
- `city_default_city=1`
- `city_san_francisco=1`
- `market_steady_market=1`
- `market_ai_boom=1`

## Browser Smoke
- Skipped for this data-only block; campaign selector and data invariants are covered by targeted tests plus the full harness gate.
