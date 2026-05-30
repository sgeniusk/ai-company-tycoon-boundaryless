# v0.67 Block 62 QA - Discovered Replayable Ending Labels

## Scope
- Aligned discovered replayable ending reward labels across selector surfaces.
- Collection entries, current-run target plans, replay plans, and near-miss rematches now use:
  - `도감 보상 수집 완료 · 추가 통찰 없음`
- Result-only discovered entries keep the record-specific label from block #61.
- No `GameState`, save, tick, selector priority, or economy changes.

## RED
Command:
```sh
npm test -- src/game/campaign-ending.test.ts src/game/qa-scenarios.test.ts --maxWorkers=1 < /dev/null
```

Expected failures:
- Discovered replayable collection entries still returned `도감 보상 수집 완료`.
- Discovered current-run target plans still returned `도감 보상 수집 완료`.
- Discovered replay plans still returned `도감 보상 수집 완료`.
- Discovered near-miss rematches still returned `도감 보상 수집 완료`.

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
Server:
```sh
npm run dev -- --host 127.0.0.1 --port 5182 < /dev/null
```

Completed replayable codex/deck DOM smoke:
```sh
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new \
  --disable-gpu \
  --disable-background-networking \
  --disable-sync \
  --disable-component-update \
  --no-first-run \
  --no-default-browser-check \
  --user-data-dir=/tmp/discovered-replayable-label-smoke \
  --virtual-time-budget=5000 \
  --dump-dom "http://127.0.0.1:5182/?scenario=ending-replay-complete&menu=deck" \
  > /tmp/discovered-replayable-label-dom.html \
  2> /tmp/discovered-replayable-label-chrome.log
```

Checked DOM counts:
- `도감 보상 수집 완료 · 추가 통찰 없음`: 24
- `목표 엔딩 완료`: 3
- `>도감 보상 수집 완료<`: 0

Discovered near-miss DOM smoke:
```sh
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new \
  --disable-gpu \
  --disable-background-networking \
  --disable-sync \
  --disable-component-update \
  --no-first-run \
  --no-default-browser-check \
  --user-data-dir=/tmp/discovered-nearmiss-label-smoke \
  --virtual-time-budget=5000 \
  --dump-dom "http://127.0.0.1:5182/?scenario=ending-nearmiss-known-final&menu=results" \
  > /tmp/discovered-nearmiss-label-dom.html \
  2> /tmp/discovered-nearmiss-label-chrome.log
```

Checked DOM counts:
- `도감 보상 수집 완료 · 추가 통찰 없음`: 1
- `발견 완료 아쉬운 엔딩`: 2
- `>도감 보상 수집 완료<`: 0

Cleanup:
- Killed the Vite process on port 5182.
- Removed the headless Chrome processes tied to `/tmp/discovered-replayable-label-smoke` and `/tmp/discovered-nearmiss-label-smoke`.
