# v0.67 Beta Prep Block 1 QA Run

Date: 2026-05-31

Scope:
- Added a derive-only beta readiness panel to the in-game guide.
- Added a stable `?scenario=beta-readiness` QA URL for browser verification.
- No save, tick, monthly economy, or data-generation logic changed.

TDD evidence:
- RED: `npm test -- src/ui/layout-contract.test.ts < /dev/null`
  - Failed because `GameChrome.tsx` did not yet import or render `getEndingCollectionSummary` / `BetaReadinessPanel`.
- RED: `npm test -- src/game/qa-scenarios.test.ts < /dev/null`
  - Failed because `beta-readiness` was not registered in `qaScenarioIds`, URL parsing returned `undefined`, and `createQaScenario("beta-readiness")` fell through.
- GREEN: `npm test -- src/ui/layout-contract.test.ts src/game/qa-scenarios.test.ts < /dev/null`
  - 2 files / 159 tests passed.

Full gate:
- Command: `npm run harness:gate < /dev/null`
- Result: PASS
- Tests: 49 files / 563 tests passed.
- Data validation: passed.
- Build: `tsc && vite build` passed.

Browser smoke:
- URL: `http://127.0.0.1:5176/?scenario=beta-readiness`
- QA pill: `베타 준비 체크 QA`
- Panel text included:
  - `베타 준비 체크`
  - `v0.67 멀티 엔딩 준비도`
  - `24` 결말 루트
  - `23` 목표 엔딩
  - `23/23` 해금 안내 `100%`
  - `4/4` 루트 축, `40/40` covered route options
  - `다음 도감 목표: 프런티어 데모 제국`
- Layout check: beta readiness panel fully visible inside the guide side panel; horizontal overflow was false.

Changed files:
- `src/components/GameChrome.tsx`
- `src/App.css`
- `src/game/qa-scenarios.ts`
- `src/game/qa-scenarios.test.ts`
- `src/ui/layout-contract.test.ts`
