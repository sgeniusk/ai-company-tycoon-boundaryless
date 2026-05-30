# v0.67 Block 57 QA - Repeat Ending Result Label

## Scope
- Tightened the run-summary ending spotlight copy for already-discovered endings.
- Repeated reward endings now say the codex reward is collected and no additional ending bonus is granted.
- Repeated result-only endings now say the result-only record is collected and no additional ending bonus is granted.
- No `GameState`, save, tick, selector, or economy changes.

## RED
Command:
```sh
npm test -- src/game/run-summary.test.ts --maxWorkers=1 < /dev/null
```

Expected failures:
- Repeated `standard_platform_compounder` summary still returned `엔딩 보너스 +2 통찰 · 도감 보상 수집 완료`.
- Repeated `garage_restart` summary still returned `엔딩 보너스 없음 · 도감 보상 수집 완료`.

## GREEN
Command:
```sh
npm test -- src/game/run-summary.test.ts --maxWorkers=1 < /dev/null
```

Result:
- 1 file passed.
- 9 tests passed.

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
npm run dev -- --host 127.0.0.1 --port 5177 < /dev/null
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
  --user-data-dir=/tmp/repeat-ending-zero-label-smoke \
  --virtual-time-budget=5000 \
  --dump-dom "http://127.0.0.1:5177/?scenario=ending-replay-known-final&menu=results" \
  > /tmp/repeat-ending-zero-label-dom.html \
  2> /tmp/repeat-ending-zero-label-chrome.log
```

Checked DOM counts:
- `도감 보상 수집 완료 · 추가 엔딩 보너스 없음`: 1
- `창업 통찰 +171`: 1
- `이미 획득한 도감 보상입니다`: 1
- `엔딩 보너스 프라이버시 신뢰 요새 +4`: 0
- `엔딩 보너스 +4 통찰 · 도감 보상 수집 완료`: 0

Cleanup:
- Killed the Vite process on port 5177.
- Removed the headless Chrome process tied to `/tmp/repeat-ending-zero-label-smoke`.
