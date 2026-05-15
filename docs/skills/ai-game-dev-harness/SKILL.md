---
name: ai-game-dev-harness
description: Use when building or improving an indie game through versioned milestones, tester reports, agent reviews, retention/LTV checks, TDD, browser playtests, changelog updates, and git commits.
---

# AI Game Dev Harness

Use this skill to run a repeatable solo-dev game production loop. It is for making a game better in small, versioned steps while keeping proof: tests, reports, logs, and commits.

## Core Rule

Every meaningful improvement gets a version, a gate, and a record.

- Small polish, report, harness, or UI pass: bump patch, for example `v0.9.2-alpha`.
- New player-facing system: bump minor, for example `v0.10.0-alpha`.
- Major loop or architecture shift: bump the next larger milestone and document why.
- Do not call work complete until verification and reports are updated.

## Default Workflow

1. Inspect the current request, latest changelog, acceptance criteria, reports, git status, and relevant code.
2. Extract P0/P1/P2/P3 issues from recent tester, QA, balance, and production reports.
3. Choose the next version and write a one-line scope statement.
4. If there is a real fork, present one question card before implementation.
5. Write failing tests first for gameplay logic, data contracts, save/load, economy, or guidance changes.
6. Implement the smallest change that satisfies the version scope.
7. Run the relevant gates.
8. Update changelog, acceptance criteria, and reports.
9. Commit with a concise version-oriented message.
10. End with the next recommended question card or build queue.

## Question Cards

Use question cards for decisions that affect direction, scope, monetizable appeal, or player feel.

When an interactive card tool is available, use it. Otherwise write a compact text card:

```markdown
**Question Card — vX.Y.Z Next Step**
A. Label (Recommended)
One sentence tradeoff.

B. Label
One sentence tradeoff.

C. Label
One sentence tradeoff.
```

Keep cards objective. Offer 2-3 mutually exclusive choices. Put the recommendation first unless the user already chose a path.

## Agent Review Roster

Use the project roster when present. Add or simulate these lenses when missing:

- Executive Producer: scope, schedule, milestone completeness.
- Game Designer: fantasy, core loop, strategic tension.
- Systems Architect: data-driven architecture, state ownership, extensibility.
- QA Agent: stability, edge cases, test coverage, save/load safety.
- Balance Agent: economy fairness, recovery path, exploit risk.
- UX Agent: readability, first 30 seconds, visible feedback.
- Synthetic Playtester: player archetypes and qualitative experience.
- Retention/LTV Agent: first-session motivation, replay reason, long-term goals, return hooks.
- Shareability Agent: screenshot moments, streamer-readable events, memorable stories.
- Solo Dev Scope Agent: maximum player value for minimum asset/code burden.
- Deck System Engineer: card costs, effects, hand flow, rewards, and deck readability.
- Roguelite Meta Engineer: failure rewards, permanent unlocks, and next-run motivation.
- Puzzle Mechanics Engineer: short interaction loops that affect product quality.
- Balance Simulation Engineer: card/meta/economy exploit checks.

## Retention/LTV Gate

For every player-facing milestone, answer briefly:

- First 30 seconds: does the player know what to do?
- First 5 minutes: is there a satisfying payoff before a harsh setback?
- Session return: what unfinished goal makes the player want to come back?
- Long-term arc: what grows over multiple sessions?
- Share moment: what would be worth screenshotting or telling a friend?
- Solo-dev fit: is this achievable without exploding content or asset scope?

If the answer is weak, log a P1 or P2 depending on severity.

## Verification Gates

Run the narrowest useful checks, then broaden if risk is high.

- Data/content changes: data validator and content tests.
- Gameplay logic changes: unit tests around the affected loop.
- UI changes: build plus browser or screenshot QA when available.
- Save/load changes: explicit serialization/hydration tests.
- Economy changes: at least one short-path simulation test or balance note.
- Commercial-readiness changes: add or update a scripted run simulator that reaches the target session window and records integrity/rank outcomes.
- Roguelite/deckbuilding changes: verify card data references, save/load state, at least one card action, at least one next-run meta effect, and a deck QA scenario.
- Asset pipeline changes: manifest validation before importing final images.

Common web commands:

```bash
npm test
npm run validate:data
npm run build
```

Browser QA should inspect first screen, primary action path, a success/reward state, and one narrow/mobile viewport when tooling is available.

## Report Requirements

For each version, update or create:

- `docs/CHANGELOG.md`
- `docs/ACCEPTANCE_CRITERIA.md`
- `reports/production_<version_topic>.md`
- `reports/qa/<version_topic>_qa.md`
- `reports/playtests/<version_topic>_synthetic_playtest.md` when player feel changed
- `reports/balance/<version_topic>_balance.md` when economy changed

User-facing reports, roadmap notes, QA summaries, balance summaries, and playtest summaries should be written in Korean by default. Keep code identifiers, commands, file paths, and exact UI keys in their original spelling when useful.

Production reports should map changes back to tester findings when applicable.

## Commit Rule

Before committing:

1. Check `git status --short`.
2. Confirm only intended files are staged.
3. Commit with a clear message, for example:
   - `Add v0.9.2 game dev harness skill draft`
   - `Tune v0.10 starter retention loop`
   - `Add v0.11 competitor pacing pass`

Never hide failed verification. If a browser check cannot run, say so in QA and final response.

## Completion Shape

Final response should include:

- version completed
- main changes
- verification results
- commit hash, if committed
- next recommended question card
