# v0.67 Block 60 QA - Final Repeat Discovery Status

## Scope
- Clarified final ending discovery status for already-discovered endings.
- Final repeated endings now report `도감 보상 수집 완료 · 추가 통찰 없음`.
- The existing zero delta label and repeated-copy details remain unchanged.
- No `GameState`, save, tick, selector, or economy changes.

## RED
Command:
```sh
npm test -- src/game/campaign-ending.test.ts src/game/qa-scenarios.test.ts --maxWorkers=1 < /dev/null
```

Expected failures:
- `getCampaignEndingDiscovery` still returned `rewardStatusLabel: "도감 보상 수집 완료"` for repeated final endings.
- The final known ending QA scenario still surfaced the shorter status label.

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
- 552 tests passed.
- Data validation passed.
- Production build passed.

## Browser Smoke
Server:
```sh
npm run dev -- --host 127.0.0.1 --port 5180 < /dev/null
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
  --user-data-dir=/tmp/final-repeat-discovery-label-smoke \
  --virtual-time-budget=5000 \
  --dump-dom "http://127.0.0.1:5180/?scenario=ending-replay-known-final&menu=results" \
  > /tmp/final-repeat-discovery-label-dom.html \
  2> /tmp/final-repeat-discovery-label-chrome.log
```

Checked DOM counts:
- `도감 보상 수집 완료 · 추가 통찰 없음`: 3
- `이미 획득한 도감 보상입니다`: 1
- `>도감 보상 수집 완료<`: 0

Cleanup:
- Killed the Vite process on port 5180.
- Removed the headless Chrome process tied to `/tmp/final-repeat-discovery-label-smoke`.
