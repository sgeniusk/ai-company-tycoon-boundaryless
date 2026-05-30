# v0.67 Block 61 QA - Repeated Result-Only Ending Records

## Scope
- Split repeated result-only ending copy away from reward-collection language.
- `garage_restart` repeated final discovery now uses result-record copy:
  - `결과 전용 기록 수집 완료 · 추가 통찰 없음`
  - `이미 기록한 결과 전용 엔딩입니다.`
  - `이미 도감에 있는 결과 기록입니다.`
- Discovered final-only codex entries now show `결과 전용 기록 수집 완료`.
- Added stable browser QA scenario `ending-fallback-known-final`.
- No `GameState`, save, tick, selector, or economy changes.

## RED
Command:
```sh
npm test -- src/game/campaign-ending.test.ts src/game/qa-scenarios.test.ts --maxWorkers=1 < /dev/null
```

Expected failures:
- Repeated `garage_restart` discovery still returned generic reward/codex copy.
- Discovered `garage_restart` collection card still returned `도감 보상 수집 완료`.
- `ending-fallback-known-final` was not a stable browser QA id and URL lookup fell through.

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
npm run dev -- --host 127.0.0.1 --port 5181 < /dev/null
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
  --user-data-dir=/tmp/fallback-known-record-label-smoke \
  --virtual-time-budget=5000 \
  --dump-dom "http://127.0.0.1:5181/?scenario=ending-fallback-known-final&menu=results" \
  > /tmp/fallback-known-record-label-dom.html \
  2> /tmp/fallback-known-record-label-chrome.log
```

Checked DOM counts:
- `결과 전용 기록 수집 완료 · 추가 통찰 없음`: 1
- `이미 기록한 결과 전용 엔딩입니다`: 1
- `이미 도감에 있는 결과 기록입니다`: 1
- `이미 획득한 도감 보상입니다`: 0

Cleanup:
- Killed the Vite process on port 5181.
- Removed the headless Chrome process tied to `/tmp/fallback-known-record-label-smoke`.
