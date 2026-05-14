# Implementation Strategy

## Stack

Use a web-native stack:

- Vite
- React
- TypeScript
- CSS modules or plain scoped CSS to start
- JSON data files for all tunable content
- Vercel for public prototype deployment
- GitHub for milestone history

## Why This Stack

The game is a dashboard-first tycoon simulation. The core work is state, data, UI clarity, validation, and fast iteration. A web-native stack makes it easier to:

- Deploy publicly on Vercel.
- Run automated data/build checks.
- Build readable dashboard UI.
- Iterate on balance data quickly.
- Share playable links after each milestone.

The older Godot prototype is not the source of truth for new implementation.

## Architecture

### State Boundary

`GameState` is the source of truth for runtime state:

- Month
- Resources
- Capability levels
- Active products
- Unlocked domains
- Purchased upgrades
- Event history
- Current event
- Win/loss status

React components display and dispatch actions. They do not own simulation rules.

### Simulation Boundary

Simulation modules own:

- Product launch rules.
- Monthly advancement.
- Revenue and cost calculation.
- Capability upgrades.
- Domain unlocks.
- Event eligibility and effects.
- Success/failure checks.

### Data Boundary

JSON files own:

- Product names, costs, revenues, requirements.
- Capability names, max levels, upgrade costs, unlocks.
- Domain unlock requirements.
- Event choices and effects.
- Balance coefficients.
- Starting state.
- Playtest personas.

No tunable balance number should be hidden in a component.

### UI Boundary

The first screen is the playable dashboard:

- Resource strip.
- Company status.
- Product launch panel.
- Capability panel.
- Monthly timeline.
- Event modal/panel.
- Warning area.

Avoid landing-page structure. The player should start inside the game.

## Directory Shape

```text
src/
  main.tsx
  App.tsx
  App.css
  game/
    data.ts
    simulation.ts
    types.ts
scripts/
  harness/
    validate-data.mjs
data/
  *.json
docs/
  *.md
```

## Validation

Required local commands:

```bash
npm run validate:data
npm run build
```

`validate:data` must catch:

- Invalid JSON.
- Duplicate IDs.
- Missing product domains.
- Missing product capabilities.
- Invalid cost/effect resource IDs.
- Starting state references unknown capabilities or domains.
- No launchable starting product.

## Deployment

Vercel should build with:

```bash
npm run build
```

Output directory:

```text
dist
```

Each public prototype milestone should be:

1. Committed locally.
2. Pushed to GitHub.
3. Deployed to Vercel.
4. Linked in the milestone report.

## Branching

Recommended branch flow:

- `main`: stable playable prototype.
- `milestone/X-description`: work branch for a milestone.

For very early development, direct milestone commits to `main` are acceptable if every commit passes validation.

## Definition Of Done

A feature is done when:

- It works in the browser.
- The data validator passes.
- The production build passes.
- Locked/unavailable states explain why.
- Resource changes are visible.
- Agent review finds no P0/P1 issues.
- Synthetic playtest report is written for playable milestones.
