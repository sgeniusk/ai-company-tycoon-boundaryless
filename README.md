# AI Company Tycoon: Boundaryless

AI Company Tycoon: Boundaryless is a browser-based tycoon simulation about growing a tiny AI startup into a boundaryless AI company that expands across industries through reusable AI capabilities.

The project is restarting on a web-native stack so the prototype can be shipped through GitHub and Vercel in small, verified milestones.

## Current Direction

- Runtime: Vite + React + TypeScript
- Deployment target: Vercel
- Source control target: GitHub, with milestone commits and pushes
- Game format: dashboard-first 2D tycoon / management simulation
- Production method: PRD-driven milestones, data validation, synthetic playtests, and agent review gates

The older Godot files in this folder are kept as reference material only. New work should follow the web implementation strategy in `docs/IMPLEMENTATION_STRATEGY.md`.

## Quick Start

```bash
npm install
npm run dev
```

Validation:

```bash
npm run validate:data
npm run build
```

## Key Docs

- `docs/PRD.md` - product requirements and MVP definition
- `docs/GAME_PRODUCTION_PREP_HARNESS.md` - reusable preparation process for future game projects
- `docs/SYNTHETIC_PLAYTEST_HARNESS.md` - 12-person synthetic testing protocol
- `docs/AGENT_REVIEW_PROTOCOL.md` - self-review roles and gates
- `docs/IMPLEMENTATION_STRATEGY.md` - architecture, stack, and deployment plan
- `docs/MILESTONE_PLAN.md` - staged production roadmap

## Core Promise

One AI capability should unlock many products, many markets, and many new pressures. The player should feel the thrill of compounding growth and the danger of runaway compute cost, hype, trust loss, and organizational complexity.
