# Game Production Prep Harness

This is the reusable preparation process for starting a game project before implementation. It is intentionally genre-agnostic, but this project uses it for AI Company Tycoon: Boundaryless.

## Purpose

Before building features, define the game promise, marketable hook, implementation route, validation system, and milestone gates. The goal is to keep creative ambition high while preventing scope collapse.

## Prep Sequence

### 1. Game Promise

Write the one-sentence promise:

> A player who likes [genre/audience] will play this because [distinctive fantasy] creates [specific repeated feeling].

For this project:

> Tycoon players will play AI Company Tycoon because reusable AI capabilities let one company cross many industries while growth creates compute, trust, and automation pressure.

### 2. Hit-Factor Scan

Identify why the idea could be compelling:

- Clear fantasy.
- Strong first 5 minutes.
- Repeatable decisions.
- Escalating pressure.
- Visual/readable progression.
- Differentiation from comparable games.
- Streamable or shareable moments.

For each factor, name how the game will prove it in the MVP.

### 3. Core Loop

Define the loop in 5-7 verbs. If the loop cannot be described simply, the MVP is too large.

For this project:

Inspect, launch, advance, react, upgrade, unlock, automate.

### 4. Boundaries

Define what is in scope, what is out of scope, and what will be saved for expansion.

The first version should prove the smallest loop that contains the game's unique promise.

### 5. Implementation Route

Choose the stack based on the experience, not habit:

- Web dashboard/management games: Vite, React, TypeScript.
- 2D action/sprite games: Phaser.
- 3D browser games: Three.js or React Three Fiber.
- Engine-heavy desktop games: Godot or Unity.

For this project, the route is Vite + React + TypeScript because the core experience is dashboard strategy, data-driven simulation, and Vercel deployment.

### 6. Harness Definition

Define quality gates before code:

- Data validator.
- Build validator.
- Playtest protocol.
- Agent review protocol.
- Balance review protocol.
- Release checklist.

### 7. Milestone Plan

Break production into pushable milestones. Each milestone must have:

- Player-facing result.
- Acceptance criteria.
- Validation commands.
- Required reports.
- GitHub push target.
- Vercel deployment expectation.

## Required Prep Artifacts

Every serious game project should start with:

- PRD.
- Implementation strategy.
- Milestone plan.
- Agent review protocol.
- Synthetic playtest harness.
- Data validation plan.
- Risk register.

## Completion Gate

The prep phase is done only when a new contributor can answer:

- What is the game?
- Why could it be commercially interesting?
- What is the first playable target?
- What stack is being used?
- What files own the data?
- What validates progress?
- What blocks a milestone from advancing?
