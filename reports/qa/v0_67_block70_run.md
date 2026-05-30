# v0.67 Block 70 QA - Ending Route Coverage Surface

## Scope
- Added derive-only `getEndingAxisCoverageSummary()` for campaign ending coverage across run modifier axes.
- Surfaced the coverage in the Deck ending codex as four compact route-coverage chips:
  - 도시 `11/11`
  - 세계 `12/12`
  - 시장 `8/8`
  - 창업자 `9/9`
- No save, tick, economy, selector priority, or persisted state changes.

## RED
Command:
```sh
npm test -- src/game/campaign-ending.test.ts src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null
```

Expected failures:
- `getEndingAxisCoverageSummary` was not exported.
- Deck UI did not import/render `ending-axis-coverage`.

Result:
- 2 files failed.
- 106 tests passed, 2 tests failed.

## GREEN
Command:
```sh
npm test -- src/game/campaign-ending.test.ts src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null
```

Result:
- 2 files passed.
- 108 tests passed.

## Full Gate
Command:
```sh
npm run harness:gate < /dev/null
```

Result:
- 49 test files passed.
- 557 tests passed.
- Data validation passed.
- Production build passed.

## Browser Smoke
Server:
```sh
npm run dev -- --host 127.0.0.1 --port 5187 < /dev/null
```

Deck ending codex DOM smoke:
```sh
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new \
  --disable-gpu \
  --disable-background-networking \
  --disable-sync \
  --disable-component-update \
  --no-first-run \
  --no-default-browser-check \
  --user-data-dir=/tmp/ending-axis-coverage-smoke \
  --virtual-time-budget=5000 \
  --dump-dom "http://127.0.0.1:5187/?scenario=ending-replay&menu=deck" \
  > /tmp/ending-axis-coverage-dom.html \
  2> /tmp/ending-axis-coverage-chrome.log
```

Checked DOM evidence:
- `엔딩 루트 커버리지`
- `도시 11/11`
- `세계 12/12`
- `시장 8/8`
- `창업자 9/9`
- `전체 커버`

Cleanup:
- Killed the Vite process on port 5187.
- Removed the headless Chrome process tied to `/tmp/ending-axis-coverage-smoke`.
