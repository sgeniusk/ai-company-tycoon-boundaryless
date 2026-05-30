# v0.67 Beta Prep Block 3 QA Run

Date: 2026-05-31

Scope:
- Extended `getBetaReadinessSummary` with player-facing ending codex progress labels.
- Added codex progress and reward progress to the guide beta readiness panel.
- Kept the feature derive-only; no save, tick, monthly economy, or data file changes.

TDD evidence:
- RED: `npm test -- src/game/beta-readiness.test.ts < /dev/null`
  - Failed because `codexProgressLabel`, `rewardProgressLabel`, `codexStatusLabel`, and `lockedReplayableLabel` did not exist.
- GREEN: `npm test -- src/game/beta-readiness.test.ts src/ui/layout-contract.test.ts < /dev/null`
  - 2 files / 92 tests passed.
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
- Panel text included:
  - `준비 체크 4/4`
  - `도감 0/24`
  - `보상 0/81`
  - `다음 도감 목표: 프런티어 데모 제국`
- Layout check: beta readiness panel fully visible inside the guide side panel; horizontal overflow was false.

Changed files:
- `src/game/beta-readiness.ts`
- `src/game/beta-readiness.test.ts`
- `src/components/GameChrome.tsx`
- `src/ui/layout-contract.test.ts`
