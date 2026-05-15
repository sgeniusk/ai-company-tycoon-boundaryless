# Production Report — Alpha v0.9.5 Post-Release Growth Forks

Date: 2026-05-15

## Source Feedback

This milestone addresses the v0.9.1 10-expert direction playtest finding:

- P1: After the first release, immediately tease at least two next paths.
- P1: The first release should reveal the "boundaryless" expansion fantasy, not only startup cash burn.
- v0.9.4 follow-up: make the next growth fork clearer before adding more visual assets.

## Scope

Turn the first product release into a strategic fork. The player should see three next-company directions: expand the productivity product line, build trust for enterprise customers, or open code/vision research.

## Changes

- Added `data/growth_paths.json` with three strategic routes.
- Added `src/game/growth-paths.ts` to convert data definitions into release-facing cards.
- Extended release moments with `growthPaths`.
- Added save hydration support for older release moments.
- Updated post-release guidance to point toward `다음 성장 분기 선택`.
- Rendered growth path cards inside the release spotlight.
- Added validation and tests for references and QA scenario coverage.

## Agent Review

### Executive Producer Agent

Status: Passed

- This directly improves the 10-minute MVP path.
- It creates a clearer next task after the first emotional payoff.

### Game Designer Agent

Status: Passed

- The three routes express different fantasies: fast product line, enterprise trust, and capability expansion.
- No new economy numbers were changed, so balance risk is contained.

### Systems Architect Agent

Status: Passed

- Growth fork content is data-driven.
- Simulation owns the release moment, while React only renders the cards.
- Old saves are handled by hydration.

### QA Agent

Status: Passed With Environment Note

- TDD captured missing growth paths and old guidance behavior first.
- Automated tests, data validation, and build passed.
- Browser inspection timed out through Computer Use, and `curl` could not connect to the Vite server from this environment even after Vite reported ready.

### UX Agent

Status: Passed With P2

- The release card now tells the player what to do next.
- P2: once browser visual access is reliable, verify the cards do not make the side column too tall on smaller screens.

### Retention / LTV Agent

Status: Passed

- First 30 seconds: unchanged and still guided.
- First 5 minutes: the first release now creates a forward-looking choice.
- Session return: each path creates an unfinished plan.
- Long-term arc: paths point toward product line, enterprise, and new-domain growth.
- Share moment: the release card is closer to a screenshot-worthy result.
- Solo-dev fit: data-first implementation avoids large asset scope.

### Shareability Agent

Status: Passed

- The release card now reads more like a milestone moment.
- P3: future version should add a tiny launch headline or market reaction line.

### Solo Dev Scope Agent

Status: Passed

- High gameplay clarity gain with low implementation and art burden.

## Verdict

Ready to proceed. v0.9.6 should either improve the competition panel's readability or make one growth path mechanically selectable with a lightweight commitment bonus.
