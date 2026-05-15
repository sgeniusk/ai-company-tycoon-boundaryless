# QA Report — Alpha v0.9.6 Commit To Growth Path

Date: 2026-05-15

## Scope

Verified one-time growth path commitment after first release, immediate bonuses, duplicate prevention, save/load persistence, and guidance completion.

## Automated Checks

- `npm test`: Passed, 46 tests
- `npm run validate:data`: Passed
- `npm run build`: Passed

## Coverage

- Pre-release path choice is blocked.
- Post-release path choice is allowed.
- Choosing `신뢰 기반 엔터프라이즈` increases trust and saves the chosen identity.
- Attempting a second different path does not change the chosen path or reapply bonuses.
- Save/load preserves `chosenGrowthPath`.
- Guidance objective `다음 성장 선택` completes after commitment.

## Browser / Local Preview

Browser visual QA remains environment-limited in this Codex session. v0.9.6 should be manually checked at:

- `http://127.0.0.1:5173/?scenario=release`

## Findings

- P0: None.
- P1: None.
- P2: Need visual confirmation of selected and locked growth cards in browser.
- P2: Need a future month-10 balance comparison across all three growth paths.

## Verdict

Pass for automated QA. Visual QA is pending due to browser access limitations.
