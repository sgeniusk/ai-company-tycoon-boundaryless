# QA Report - Alpha v0.3.0

## Date

2026-05-15

## Automated Verification

| Check | Command | Result |
|---|---|---|
| Simulation tests | `npm test` | Passed |
| Data validation | `npm run validate:data` | Passed |
| Production build | `npm run build` | Passed |

## Browser Smoke Test

Target: `http://localhost:5173/`

| Scenario | Result |
|---|---|
| Alpha title and game-like lab screen appear | Passed |
| Product launch creates market response | Passed |
| Next month advances to event state | Passed |
| Viral event appears with Korean choices | Passed |
| Event choice applies and records decision | Passed |
| Save button records local save | Passed |
| Browser console errors | None found |

## Issues

- P0: None.
- P1: None.
- P2: Need full Korean pass for all non-visible event/upgrade data.
- P2: Need balance test for 10-month run.
- P3: Screenshot capture via standard Playwright had timed out earlier, but in-app visible screenshot succeeded with CUA.

## Verdict

Alpha v0.3.0 is stable enough for continued feature work and visual polish.
