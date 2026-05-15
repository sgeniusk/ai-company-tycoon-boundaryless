# QA Report — Alpha v0.9.5 Post-Release Growth Forks

Date: 2026-05-15

## Scope

Verified data-driven post-release growth paths, release moment hydration, guidance changes, and release QA scenario coverage.

## TDD Record

- Added failing tests for missing `growthPaths` on release moments.
- Added failing guidance expectation for `choose_growth_path`.
- Added failing content-data coverage for `growth_paths`.
- Implemented data, simulation, hydration, UI rendering, and validation.

## Automated Checks

- `npm test`: Passed, 43 tests
- `npm run validate:data`: Passed
- `npm run build`: Passed

## Browser / Local Preview Attempt

Attempted:

- Started Vite dev server with `npm run dev -- --host 127.0.0.1 --port 5173`.
- Vite reported `http://127.0.0.1:5173/` ready.
- Tried Computer Use state inspection for `ChatGPT Atlas`.
- Tried `curl -I 'http://127.0.0.1:5173/?scenario=release'`.

Result:

- Computer Use timed out.
- `curl` could not connect from this Codex environment even though Vite reported ready.
- Manual check can use `http://127.0.0.1:5173/?scenario=release` in the in-app browser.

## Findings

- P0: None.
- P1: None.
- P2: Need visual verification of growth fork cards on narrow layouts when browser access works.
- P3: Growth path cards currently route to menus but do not persist a formal chosen strategy.

## Verdict

Pass for automated validation. Browser visual QA remains environment-limited.
