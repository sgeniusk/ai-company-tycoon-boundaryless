# QA Report — Alpha v0.9.3 Browser QA Scenarios And Screen Polish

Date: 2026-05-15

## Scope

Verified stable QA scenario generation, URL query loading, and screen-polish changes for status wrapping, release spotlight emphasis, and narrow layout office object reduction.

## Automated Checks

- `npm test`: Passed, 41 tests
- `npm run validate:data`: Passed
- `npm run build`: Passed

## Browser / Local Preview Attempt

Attempted:

- Built production assets with `npm run build`.
- Started a static server from `dist` on `127.0.0.1:5180`.
- Tried `curl -I 'http://127.0.0.1:5180/?scenario=release'`.
- Tried Computer Use inspection of ChatGPT Atlas.

Result:

- The static server process was listening on `localhost:5180`, but this Codex environment could not connect to it with `curl`.
- Computer Use browser inspection timed out.
- The static server was terminated after the failed attempt.

## Scenario URLs For Manual QA

- `http://localhost:5173/?scenario=fresh`
- `http://localhost:5173/?scenario=project`
- `http://localhost:5173/?scenario=release`
- `http://localhost:5173/?scenario=shop`

## Findings

- P0: None.
- P1: None.
- P2: Actual screenshot review is still needed when local browser access works.
- P2: Need a reliable browser automation path, either through a working in-app browser connector or a local Playwright dependency.

## Verdict

Pass for automated validation and QA-scenario readiness. Browser visual verification remains environment-blocked but is now easier to run manually through stable scenario URLs.
