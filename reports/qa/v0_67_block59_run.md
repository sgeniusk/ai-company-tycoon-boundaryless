# v0.67 Block 59 QA - Deterministic UI Restart Seeds

## Scope
- Removed `crypto.randomUUID`, `Date.now`, and `Math.random` from UI restart seed helpers.
- `GameChrome` next-run restarts now seed `rollRunModifierSelection` from `source + nextRunSeedCounter`.
- `MenuPanels` quick-start/deck/unlock restarts now seed `rollRunModifierSelection` from `source + menuRunSeedCounter`.
- Added a static layout contract to prevent time/random fallback from returning to UI restart seed generation.
- No `GameState`, save, tick, selector, or economy changes.

## RED
Command:
```sh
npm test -- src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null
```

Expected failure:
- New `keeps UI restart seeds deterministic` contract failed because `GameChrome.tsx` and `MenuPanels.tsx` still contained `Math.random`, `Date.now`, and `randomUUID` restart-seed fallbacks.

## GREEN
Command:
```sh
npm test -- src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null
```

Result:
- 1 file passed.
- 88 tests passed.

Additional source check:
```sh
rg -n "Math\\.random|Date\\.now|randomUUID" src/components src/game src/ui || true
```

Result:
- Only the new static-test expectation strings remain.

## Full Gate
Command:
```sh
npm run harness:gate < /dev/null
```

Result:
- 49 test files passed.
- 552 tests passed.
- Data validation passed.
- Production build passed.

## Browser Smoke
Server:
```sh
npm run dev -- --host 127.0.0.1 --port 5179 < /dev/null
```

DOM smoke:
```sh
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new \
  --disable-gpu \
  --disable-background-networking \
  --disable-sync \
  --disable-component-update \
  --no-first-run \
  --no-default-browser-check \
  --user-data-dir=/tmp/deterministic-ui-seed-smoke \
  --virtual-time-budget=5000 \
  --dump-dom "http://127.0.0.1:5179/?scenario=ending-replay&menu=deck" \
  > /tmp/deterministic-ui-seed-dom.html \
  2> /tmp/deterministic-ui-seed-chrome.log
```

Checked DOM counts:
- `엔딩 목표 런`: 2
- `엔딩 도감`: 5
- `엔딩 목표`: 5

Cleanup:
- Killed the Vite process on port 5179.
- Removed the headless Chrome process tied to `/tmp/deterministic-ui-seed-smoke`.
