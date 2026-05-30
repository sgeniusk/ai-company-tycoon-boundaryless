# v0.67 Block 28 QA - Active Codex Target Shortcut

## Scope
- Changed the active ending codex card button from a disabled target marker into a shortcut.
- When the codex card is already the active target run, the button now jumps to the company checklist.
- No save, tick, economy, or data-balance changes.

## RED
- `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
  - Initial broad contract was too loose and passed against the existing replay panel.
  - Tightened the contract to require `{isActiveTargetRun ? "현재 목표 확인" : "도감 목표 런"}` on the codex button.
  - Failed before implementation because the codex button still rendered `현재 목표 런`.

## GREEN
- `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1 < /dev/null`
  - 1 file / 86 tests passed.

## Gate
- `npm run harness:gate < /dev/null`
  - 49 files / 537 tests passed.
  - `npm run validate:data` passed.
  - `npm run build` passed.

## Browser Smoke
- Started Vite at `http://127.0.0.1:5176/`.
- Ran Chrome headless DOM smoke for `?scenario=ending-replay-active&menu=deck`.
- Confirmed DOM contains:
  - `엔딩 도감`
  - `ending-collection-run-button`
  - `현재 목표 확인`
  - `도감 목표 런`
  - `목표 엔딩 런`
- Vite dev server was stopped after the smoke check.

## Notes
- The button is only disabled when the codex entry is the active target and `setActiveMenu` is unavailable.
