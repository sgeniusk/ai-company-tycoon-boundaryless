# Agent Review Protocol

## Purpose

Agent review is the self-checking layer of the production harness. Each milestone is reviewed from multiple perspectives before the project advances.

## Review Roles

### Executive Producer

Focus:

- Is the milestone complete?
- Does it move toward the 10-minute MVP?
- Is scope controlled?
- Is the next task clear?

Blocks on:

- Missing deliverable.
- Unclear milestone target.
- Scope creep that threatens the MVP.

### Game Designer

Focus:

- Does the feature express boundaryless AI expansion?
- Are there meaningful trade-offs?
- Are numbers readable and satisfying?
- Does the feature make the 10-minute loop more fun?

Blocks on:

- Feature feels generic.
- No strategic tension.
- Player cannot feel consequence.

### Systems Architect

Focus:

- Is simulation separate from UI?
- Is GameState the source of truth?
- Are tunable values in JSON?
- Can systems be extended without refactoring?
- Are validation scripts updated?

Blocks on:

- Hardcoded balance/content values.
- UI owning gameplay state.
- Data references that validator does not check.

### QA

Focus:

- Does the app launch?
- Does data validation pass?
- Does the build pass?
- Are edge cases handled?
- Are save/load boundaries safe when present?

Blocks on:

- Build failure.
- Data validation failure.
- Crash or broken core action.

### Balance

Focus:

- Is progression achievable but not trivial?
- Does compute pressure matter?
- Does hype decay prevent runaway snowball?
- Is there a recovery path from bad decisions?

Blocks on:

- Dominant strategy without counterplay.
- Dead-end state too easy to enter.
- Success impossible in intended run length.

### UX

Focus:

- Can a new player understand the first click in 30 seconds?
- Are resource changes visible immediately?
- Are locked items explained?
- Is the screen readable without scrolling?
- Are warnings obvious?

Blocks on:

- Unclear primary action.
- Critical information hidden.
- Locked states with no explanation.

### Synthetic Playtest Lead

Focus:

- Did the tester panel produce useful findings?
- Are repeated issues synthesized?
- Are recommendations concrete?
- Are P0/P1 issues routed into fixes?

Blocks on:

- Missing synthetic report.
- Vague recommendations.
- Unresolved P0/P1 issues.

## Review Cadence

Run full review at the end of every milestone.

For small code/data changes, run:

- Systems Architect
- QA
- Balance if numbers changed
- UX if UI changed

## Issue Priority

- P0: milestone cannot be played or validated.
- P1: core feature is broken, misleading, or strategically harmful.
- P2: important improvement, not blocking.
- P3: polish.

## Milestone Gate

A milestone may advance only when:

- All acceptance criteria pass.
- `npm run validate:data` passes.
- `npm run build` passes.
- Synthetic playtest report exists.
- Agent review report exists.
- P0/P1 issues are fixed or explicitly waived by the human owner.
