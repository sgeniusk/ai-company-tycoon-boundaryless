# v0.67 Block 75 QA — Complete Reward Ending Unlock Guidance

## Scope
- Added regression coverage requiring every replayable reward ending to derive at least one meta unlock recommendation.
- Expanded route tag derivation for:
  - AI winter / funding drought / research lab routes.
  - Standard no-founder baseline platform routes.
- No save, tick, economy, or data schema changes.

## RED
- `npm test -- src/game/campaign-ending.test.ts --maxWorkers=1 < /dev/null`
- Expected failure before implementation:
  - Missing recommendation ids: `ai_winter_profitable_lab`, `standard_platform_compounder`.

## GREEN
- `npm test -- src/game/campaign-ending.test.ts src/game/meta-progression.test.ts --maxWorkers=1 < /dev/null`
- Result: 2 files passed, 31 tests passed.

## Full Gate
- `npm run harness:gate < /dev/null`
- Result:
  - 49 test files passed.
  - 561 tests passed.
  - `validate:data` passed.
  - `tsc && vite build` passed.

## Browser Smoke
- Dev server: `npm run dev -- --host 127.0.0.1 --port 5192 < /dev/null`
- URL: `http://127.0.0.1:5192/?scenario=ending-replay&menu=deck`
- In-app browser DOM confirmed:
  - Filter buttons included `해금 추천23`.
  - `.ending-collection-unlock-hints` count: 23.
  - `.ending-collection-unlock-hints span` count: 46.
  - New coverage labels rendered: `합성 사용자 실험실`, `평가 하네스 기억`, `런칭 플레이북`, `자동화 기억`.

## Notes
- Result-only fallback ending remains intentionally recommendation-free.
- The new invariant prevents future reward endings from silently shipping without next-run meta guidance.
