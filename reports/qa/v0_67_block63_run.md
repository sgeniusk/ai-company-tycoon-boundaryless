# v0.67 Block 63 QA - Final Ending Reward Delta Labels

## Scope
- Surfaced the deterministic final-ending reward delta label in the campaign finale discovery panel.
- Newly discovered endings now show the concrete `+N 통찰` label next to the reward description.
- Already discovered endings now show `+0 도감 통찰` next to the no-extra-reward description.
- No `GameState`, save, tick, selector priority, or economy changes.

## RED
Command:
```sh
npm test -- src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null
```

Expected failure:
- `GameChrome` did not render `endingDiscovery.rewardDeltaLabel` in the final discovery panel.

Result:
- 1 file failed.
- 87 tests passed, 1 test failed.

## GREEN
Command:
```sh
npm test -- src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null
```

Result:
- 1 file passed.
- 88 tests passed.

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
Server:
```sh
npm run dev -- --host 127.0.0.1 --port 5183 < /dev/null
```

Known final ending DOM smoke:
```sh
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new \
  --disable-gpu \
  --disable-background-networking \
  --disable-sync \
  --disable-component-update \
  --no-first-run \
  --no-default-browser-check \
  --user-data-dir=/tmp/final-ending-delta-label-smoke-known \
  --virtual-time-budget=5000 \
  --dump-dom "http://127.0.0.1:5183/?scenario=ending-replay-known-final&menu=results" \
  > /tmp/final-ending-delta-label-known-dom.html \
  2> /tmp/final-ending-delta-label-known-chrome.log
```

Checked DOM counts:
- `+0 도감 통찰`: 1
- `도감 보상 수집 완료 · 추가 통찰 없음`: 4

New final ending DOM smoke:
```sh
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new \
  --disable-gpu \
  --disable-background-networking \
  --disable-sync \
  --disable-component-update \
  --no-first-run \
  --no-default-browser-check \
  --user-data-dir=/tmp/final-ending-delta-label-smoke-new \
  --virtual-time-budget=5000 \
  --dump-dom "http://127.0.0.1:5183/?scenario=ending-replay-final&menu=results" \
  > /tmp/final-ending-delta-label-new-dom.html \
  2> /tmp/final-ending-delta-label-new-chrome.log
```

Checked DOM counts:
- `+4 통찰`: 4
- `신규 도감 보상`: 3
- `새 엔딩 발견`: 1
- `도감 반영 2/22`: 1

Cleanup:
- Killed the Vite process on port 5183.
- Removed the headless Chrome processes tied to `/tmp/final-ending-delta-label-smoke-known` and `/tmp/final-ending-delta-label-smoke-new`.
