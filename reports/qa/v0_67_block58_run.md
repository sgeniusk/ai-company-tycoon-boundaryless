# v0.67 Block 58 QA - Active Repeat Ending Labels

## Scope
- Clarified active ending replay labels for already-discovered target endings.
- Active repeated targets now expose `rewardLabel: "추가 통찰 없음"`.
- Active repeated target status now says `도감 보상 수집 완료 · 추가 통찰 없음`.
- Undiscovered target runs keep the existing `완주 보너스 +N 통찰` copy and meta reward behavior.
- No `GameState`, save, tick, selector, or economy changes.

## RED
Command:
```sh
npm test -- src/game/campaign-ending.test.ts src/game/qa-scenarios.test.ts --maxWorkers=1 < /dev/null
```

Expected failures:
- `getActiveEndingReplayBrief` still returned `rewardLabel: "완주 보너스 +4 통찰"` for an already-discovered target.
- `getActiveEndingReplayBrief` still returned `rewardStatusLabel: "도감 보상 수집 완료"` without the zero-additional-insight qualifier.
- Known active/final QA scenarios still expected the shorter status label.

## GREEN
Command:
```sh
npm test -- src/game/campaign-ending.test.ts src/game/qa-scenarios.test.ts --maxWorkers=1 < /dev/null
```

Result:
- 2 files passed.
- 84 tests passed.

## Full Gate
Command:
```sh
npm run harness:gate < /dev/null
```

Result:
- 49 test files passed.
- 551 tests passed.
- Data validation passed.
- Production build passed.

## Browser Smoke
Server:
```sh
npm run dev -- --host 127.0.0.1 --port 5178 < /dev/null
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
  --user-data-dir=/tmp/active-repeat-ending-label-smoke \
  --virtual-time-budget=5000 \
  --dump-dom "http://127.0.0.1:5178/?scenario=ending-replay-known" \
  > /tmp/active-repeat-ending-label-dom.html \
  2> /tmp/active-repeat-ending-label-chrome.log
```

Checked DOM counts:
- `도감 보상 수집 완료 · 추가 통찰 없음`: 2
- `발견 완료 · 도감 통찰 6/74`: 2
- `프라이버시 협약 · 도감 보상 수집 완료 · 발견 완료`: 0
- `완주 보너스 +4 통찰`: 0

Cleanup:
- Killed the Vite process on port 5178.
- Removed the headless Chrome process tied to `/tmp/active-repeat-ending-label-smoke`.
