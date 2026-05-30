# v0.67 Block 71 QA — Ending Route Unlock Recommendations

## Scope
- Added derive-only next-run meta unlock recommendations to the ending nudge.
- Rendered recommended unlock labels in the next-run command panel after campaign finale.
- Kept save shape, tick logic, and campaign determinism unchanged.

## RED
- `npm test -- src/game/meta-progression.test.ts src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
- Expected failures before implementation:
  - `recommendedUnlockLabels` missing from `endingNudge`.
  - `ending-nudge-unlocks` UI/CSS contract missing.

## GREEN
- `npm test -- src/game/meta-progression.test.ts src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
- Result: 2 files passed, 97 tests passed.

## Full Gate
- `npm run harness:gate < /dev/null`
- Result:
  - 49 test files passed.
  - 558 tests passed.
  - `validate:data` passed.
  - `tsc && vite build` passed.

## Browser Smoke
- Dev server: `npm run dev -- --host 127.0.0.1 --port 5188 < /dev/null`
- URL: `http://127.0.0.1:5188/?scenario=ending-san-francisco-final&menu=deck`
- In-app browser DOM confirmed:
  - `엔딩 보상`
  - `추천 해금`
  - `런칭 플레이북`
  - `경계 없는 브랜드 기억`
  - `샌프란시스코 AI 붐 런치패드`
- `.ending-nudge-unlocks span` count: 2.

## Notes
- Recommendations derive from ending condition tags and existing `metaUnlocks` tags.
- Already unlocked meta upgrades are filtered out.
- Fallback/result-only endings return no recommendation chips.
