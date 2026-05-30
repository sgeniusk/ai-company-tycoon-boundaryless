# v0.67 Block 65 QA - Next-Run Ending Reward Nudge

## Scope
- Added a derive-only `endingNudge` to `getNextRunSetupPlan` for campaign finale states.
- Surfaced the nudge in the Deck panel's next-run command room.
- Newly discovered endings explain that their concrete reward delta feeds the next-run unlock plan.
- Repeated endings show the collected/no-extra-reward branch and say the run updates records only.
- No `GameState`, save, tick, ending selector priority, or economy changes.

## RED
Command:
```sh
npm test -- src/game/meta-progression.test.ts src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null
```

Expected failures:
- `getNextRunSetupPlan` did not expose `endingNudge`.
- `MenuPanels` did not render `nextRunSetupPlan.endingNudge` or `.ending-nudge-panel`.

Result:
- 2 files failed.
- 94 tests passed, 2 tests failed.

## GREEN
Command:
```sh
npm test -- src/game/meta-progression.test.ts src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null
```

Result:
- 2 files passed.
- 96 tests passed.

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
npm run dev -- --host 127.0.0.1 --port 5184 < /dev/null
```

New final ending deck DOM smoke:
```sh
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new \
  --disable-gpu \
  --disable-background-networking \
  --disable-sync \
  --disable-component-update \
  --no-first-run \
  --no-default-browser-check \
  --user-data-dir=/tmp/ending-nudge-panel-smoke-new \
  --virtual-time-budget=5000 \
  --dump-dom "http://127.0.0.1:5184/?scenario=ending-replay-final&menu=deck" \
  > /tmp/ending-nudge-panel-new-dom.html \
  2> /tmp/ending-nudge-panel-new-chrome.log
```

Checked DOM counts:
- `ending-nudge-panel`: 13
- `엔딩 보상`: 2
- 신규 보상/해금 후보 patterns: 3

Known final ending deck DOM smoke:
```sh
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new \
  --disable-gpu \
  --disable-background-networking \
  --disable-sync \
  --disable-component-update \
  --no-first-run \
  --no-default-browser-check \
  --user-data-dir=/tmp/ending-nudge-panel-smoke-known \
  --virtual-time-budget=5000 \
  --dump-dom "http://127.0.0.1:5184/?scenario=ending-replay-known-final&menu=deck" \
  > /tmp/ending-nudge-panel-known-dom.html \
  2> /tmp/ending-nudge-panel-known-chrome.log
```

Checked DOM counts:
- `ending-nudge-panel known`: 1
- `+0 도감 통찰`: 2
- `이미 도감에 있어 이번 런은 기록만 갱신됩니다`: 1

Cleanup:
- Killed the Vite process on port 5184.
- Removed the headless Chrome processes tied to `/tmp/ending-nudge-panel-smoke-new` and `/tmp/ending-nudge-panel-smoke-known`.
