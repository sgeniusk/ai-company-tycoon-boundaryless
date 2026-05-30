# v0.67 Block 66 QA - Ending Codex Reward Filters

## Scope
- Added two derive-only Deck-panel ending codex filters:
  - `보상 남음`: undiscovered endings with positive insight rewards.
  - `결과 전용`: final-only/result-record endings.
- Reused the existing ending collection entries, sorting, and card rendering.
- No `GameState`, save, tick, ending selector, meta reward, or economy changes.

## RED
Command:
```sh
npm test -- src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null
```

Expected failure:
- `MenuPanels` did not include the extended filter union, reward/final-only filter branches, or the `보상 남음` / `결과 전용` filter labels.

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
- 554 tests passed.
- Data validation passed.
- Production build passed.

## Browser Smoke
Server:
```sh
npm run dev -- --host 127.0.0.1 --port 5185 < /dev/null
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
  --user-data-dir=/tmp/ending-codex-filter-smoke \
  --virtual-time-budget=5000 \
  --dump-dom "http://127.0.0.1:5185/?scenario=ending-replay&menu=deck" \
  > /tmp/ending-codex-filter-dom.html \
  2> /tmp/ending-codex-filter-chrome.log
```

Checked DOM counts:
- `ending-collection-filter`: 9
- `보상 남음`: 1
- `결과 전용`: 4
- `발견 완료`: 1

Cleanup:
- Killed the Vite process on port 5185.
- Removed the headless Chrome process tied to `/tmp/ending-codex-filter-smoke`.
