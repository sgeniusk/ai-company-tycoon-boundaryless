# v0.67 Block 69 QA - New Ending Browser Scenarios

## Scope
- Added stable browser QA scenarios for the two newly added endings:
  - `ending-san-francisco-final`
  - `ending-steady-operator-final`
- Each scenario builds a final-month success state that deterministically selects its target ending and shows the final campaign results panel.
- No save, tick, economy, or ending selector changes.

## RED
Command:
```sh
npm test -- src/game/qa-scenarios.test.ts --maxWorkers=1 < /dev/null
```

Expected failures:
- `qaScenarioIds` did not include the two new browser scenario IDs.
- URL lookup returned `undefined` for both new scenario names.
- Direct scenario creation fell through to an unrelated default scenario.

Result:
- 1 file failed.
- 64 tests passed, 4 tests failed.

## GREEN
Command:
```sh
npm test -- src/game/qa-scenarios.test.ts --maxWorkers=1 < /dev/null
```

Result:
- 1 file passed.
- 68 tests passed.

## Full Gate
Command:
```sh
npm run harness:gate < /dev/null
```

Result:
- 49 test files passed.
- 556 tests passed.
- Data validation passed.
- Production build passed.

## Browser Smoke
Server:
```sh
npm run dev -- --host 127.0.0.1 --port 5186 < /dev/null
```

San Francisco final DOM:
```sh
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new \
  --disable-gpu \
  --disable-background-networking \
  --disable-sync \
  --disable-component-update \
  --no-first-run \
  --no-default-browser-check \
  --user-data-dir=/tmp/ending-san-francisco-final-smoke \
  --virtual-time-budget=5000 \
  --dump-dom "http://127.0.0.1:5186/?scenario=ending-san-francisco-final&menu=results" \
  > /tmp/ending-san-francisco-final-dom.html \
  2> /tmp/ending-san-francisco-final-chrome.log
```

Steady operator final DOM:
```sh
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new \
  --disable-gpu \
  --disable-background-networking \
  --disable-sync \
  --disable-component-update \
  --no-first-run \
  --no-default-browser-check \
  --user-data-dir=/tmp/ending-steady-operator-final-smoke \
  --virtual-time-budget=5000 \
  --dump-dom "http://127.0.0.1:5186/?scenario=ending-steady-operator-final&menu=results" \
  > /tmp/ending-steady-operator-final-dom.html \
  2> /tmp/ending-steady-operator-final-chrome.log
```

Checked DOM evidence:
- `ending-san-francisco-final`: `샌프란시스코 AI 붐 런치패드`, `새 엔딩 발견`, `엔딩 도감 반영`, `+4 통찰`.
- `ending-steady-operator-final`: `꾸준한 운영 복리 회사`, `새 엔딩 발견`, `엔딩 도감 반영`, `+3 통찰`.

Cleanup:
- Killed the Vite process on port 5186.
- Removed the headless Chrome processes tied to the two `/tmp/ending-*-final-smoke` profiles.
