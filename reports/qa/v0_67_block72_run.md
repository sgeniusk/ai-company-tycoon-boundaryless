# v0.67 Block 72 QA — Ending Codex Unlock Hints

## Scope
- Promoted ending-route unlock recommendation derivation into `campaign-ending`.
- Reused the same derive-only labels in both next-run ending nudges and ending codex entries.
- Rendered recommended unlock chips on ending codex cards.
- Kept save shape, tick logic, and run simulation behavior unchanged.

## RED
- `npm test -- src/game/campaign-ending.test.ts src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
- Expected failures before implementation:
  - `getEndingRouteUnlockLabels` missing.
  - `recommendedUnlockLabels` missing from ending collection entries.
  - `ending-collection-unlock-hints` UI/CSS contract missing.

## GREEN
- `npm test -- src/game/campaign-ending.test.ts src/game/meta-progression.test.ts src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
- Result: 3 files passed, 119 tests passed.

## Full Gate
- `npm run harness:gate < /dev/null`
- Result:
  - 49 test files passed.
  - 560 tests passed.
  - `validate:data` passed.
  - `tsc && vite build` passed.

## Browser Smoke
- Dev server: `npm run dev -- --host 127.0.0.1 --port 5189 < /dev/null`
- URL: `http://127.0.0.1:5189/?scenario=ending-replay&menu=deck`
- In-app browser DOM confirmed:
  - `엔딩 도감`
  - `추천 해금`
  - `런칭 플레이북`
  - `경계 없는 브랜드 기억`
- `.ending-collection-unlock-hints` count: 21.
- `.ending-collection-unlock-hints span` count: 42.

## Notes
- `getEndingRouteUnlockLabels` filters already unlocked meta upgrades.
- Fallback/result-only endings surface no recommendation chips.
- Next-run ending nudge and codex cards now share one recommendation path.
