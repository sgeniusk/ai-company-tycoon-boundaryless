# Production Report — Alpha v0.9.4 Opening Competitor Pacing

Date: 2026-05-15

## Source Feedback

This milestone addresses the v0.9.1 10-expert direction playtest finding:

- P2: Competitors are thematically good but too aggressive-looking in the first three months.
- Recommendation: use rival claims as foreshadowing before turning them into pressure.

## Scope

Make early competitors feel like visible market threats, not immediate punishment. The first-session learning window should let the player hire, build, and release before rival product claims start taking space.

## Changes

- Rival companies now prepare market entries during months 2-3.
- Rival product-space claims now begin from month 4 onward.
- Timeline entries distinguish preparation from claims with `경쟁사 ... 예고`.
- Early contested-domain movement uses softer observation wording before direct pressure appears.
- Simulation tests now cover both the first-three-month no-claim window and post-window claiming.

## Agent Review

### Executive Producer Agent

Status: Passed

- The milestone is tightly scoped and directly connected to tester feedback.
- It improves first-session pacing without adding new UI or asset dependencies.

### Game Designer Agent

Status: Passed

- The competitive fantasy remains visible.
- The player now gets a warning beat before losing product-space opportunity.

### Systems Architect Agent

Status: Passed

- The behavior stays in the simulation layer.
- No new persistent state is required; `lastMove`, claimed products, and timeline entries remain the source of feedback.

### QA Agent

Status: Passed

- A failing test captured the old behavior before implementation.
- The new behavior is covered by deterministic month-advance tests.

### Balance Agent

Status: Passed

- Early pressure is softened without changing rival growth numbers or market-share math.
- Rival claims still create strategic tension from month 4 onward.

### UX Agent

Status: Passed With P2

- `예고` wording is easier to understand than silent pressure.
- P2: future UI should give rival preparation a small icon or marker in the competition panel.

### Synthetic Playtester Agent

Status: Passed

- New players should feel less punished before they understand counterplay.
- Tycoon and min-max players still see the competitive clock.

### Retention / LTV Agent

Status: Passed

- First 30 seconds: no extra pressure is introduced.
- First 5 minutes: the player sees a rival threat after learning the first actions.
- Session return: rival claims still create an unfinished strategic problem.
- Long-term arc: competitors remain a readable world simulation layer.
- Share moment: rival claim logs are not yet screenshot-worthy; keep as P3.
- Solo-dev fit: high impact for low asset and code cost.

## Verdict

Ready to proceed. v0.9.5 should make the next growth fork clearer or improve the visible competition panel affordance for rival preparation.
