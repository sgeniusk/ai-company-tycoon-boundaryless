# Milestone Plan

## Milestone 0 - Web Restart Setup

Goal: establish the web-native project foundation.

Deliverables:

- PRD.
- Production prep harness.
- Synthetic playtest harness.
- Agent review protocol.
- Implementation strategy.
- Vite/React/TypeScript scaffold.
- Data validation script.

Acceptance:

- `npm run validate:data` passes.
- `npm run build` passes.
- README points to the new web direction.

GitHub/Vercel:

- Initialize Git if needed.
- Commit as `Milestone 0: web restart setup`.
- Push once a remote is configured.
- Vercel deployment optional until Milestone 1.

## Milestone 1 - Playable Dashboard Shell

Goal: the player can see company state and perform the first meaningful action.

Deliverables:

- Resource strip.
- Month indicator.
- Product list with launch buttons.
- Locked product explanations.
- Timeline.
- Next Month button.

Acceptance:

- At least one product can be launched from starting state.
- Locked products explain why.
- Month can advance.
- Resource changes are visible.
- Build and data validation pass.

GitHub/Vercel:

- Commit and push.
- Deploy first public Vercel prototype.

## Milestone 2 - Product Launch Loop

Goal: launched products generate revenue, users, data, and compute pressure.

Deliverables:

- Monthly revenue/cost calculation.
- User growth.
- Compute pressure.
- Hype decay.
- Trust recovery.
- Win/loss trajectory indicators.

Acceptance:

- A 10-month run works without crash.
- Growth produces both benefit and pressure.
- No negative resources break the UI.
- Synthetic playtest report exists.

## Milestone 3 - Capabilities And Domains

Goal: reusable AI capability upgrades unlock new product space.

Deliverables:

- Capability upgrade actions.
- Domain unlock logic.
- New products become available.
- Unlock notifications.

Acceptance:

- At least one capability unlocks one new domain.
- At least one previously locked product becomes launchable.
- Player understands why the unlock happened.

## Milestone 4 - Monthly Events

Goal: monthly events create narrative and strategic pressure.

Deliverables:

- Event eligibility.
- Event choice UI.
- Effects application.
- Event history.

Acceptance:

- At least 3 events can occur in a 10-month run.
- Choices have visible trade-offs.
- Events cannot crash with low resources.

## Milestone 5 - Automation And Upgrades

Goal: the company starts compounding through automation and investments.

Deliverables:

- General upgrades.
- Automation upgrades.
- Automation effect on monthly simulation.
- Visible automation benefits.

Acceptance:

- At least one automation purchase changes monthly results.
- Automation helps but does not remove decision-making.
- Balance review finds no trivial snowball.

## Milestone 6 - Save And Load

Goal: game progress persists safely.

Deliverables:

- Save runtime state.
- Load runtime state.
- Reset save.
- Versioned save shape.

Acceptance:

- Save/load works after reload.
- Static data is not duplicated in save.
- Missing or corrupted save is handled gracefully.

## Milestone 7 - 10-Minute MVP

Goal: complete the first playable promise.

Deliverables:

- Integrated 10-month arc.
- Success/failure states.
- Balance pass.
- Synthetic playtest pass.
- Public Vercel link.

Acceptance:

- New player can understand first action in 30 seconds.
- A full 10-month run takes about 10 minutes.
- At least 2 viable strategies exist.
- No P0/P1 issues remain.
