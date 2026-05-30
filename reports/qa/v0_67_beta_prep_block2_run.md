# v0.67 Beta Prep Block 2 QA Run

Date: 2026-05-31

Scope:
- Added a pure `getBetaReadinessSummary` selector.
- Moved beta readiness checklist math out of `GameChrome`.
- Kept the guide panel backed by existing deterministic ending collection and route coverage summaries.
- No save, tick, monthly economy, or data file changes.

TDD evidence:
- RED: `npm test -- src/game/beta-readiness.test.ts < /dev/null`
  - Failed because `./beta-readiness` did not exist.
- GREEN: `npm test -- src/game/beta-readiness.test.ts < /dev/null`
  - 1 file / 2 tests passed.
- Related GREEN: `npm test -- src/game/beta-readiness.test.ts src/ui/layout-contract.test.ts src/game/qa-scenarios.test.ts < /dev/null`
  - 3 files / 161 tests passed.

Full gate:
- Command: `npm run harness:gate < /dev/null`
- Result: PASS
- Tests: 50 files / 565 tests passed.
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
  - `준비 체크 4/4`
  - `다음 도감 목표: 프런티어 데모 제국`
- Layout check: beta readiness panel fully visible inside the guide side panel; horizontal overflow was false.

Changed files:
- `src/game/beta-readiness.ts`
- `src/game/beta-readiness.test.ts`
- `src/components/GameChrome.tsx`
- `src/ui/layout-contract.test.ts`
