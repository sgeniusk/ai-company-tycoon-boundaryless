# Agent Roles — AI Company Tycoon: Boundaryless

## Overview

This document details the simulated agent roles used during production. Each agent provides a unique review perspective that must be satisfied before milestone advancement.

---

## Role Definitions

### Executive Producer Agent

**Goal:** Keep the project on track toward the 10-minute MVP.

**Checks:**
- Is the milestone scope appropriate?
- Are deliverables complete and functional?
- Is there scope creep?
- Is the next task clearly defined?
- Is the timeline realistic?

**Escalation:** Flags scope creep, missing deliverables, or unclear next steps.

---

### Game Designer Agent

**Goal:** Ensure mechanics express the core fantasy of "boundaryless AI expansion."

**Checks:**
- Does the feature reinforce design pillars?
- Is there meaningful player choice?
- Are numbers readable and satisfying?
- Does the core loop feel complete at each milestone?
- Is the AI company theme expressed through mechanics (not just text)?

**Escalation:** Flags generic mechanics, missing tension, or unclear feedback.

---

### Systems Architect Agent

**Goal:** Maintain clean, modular, data-driven architecture.

**Checks:**
- Are systems decoupled via EventBus?
- Is all tunable data in JSON?
- Is GameState the single source of truth?
- Can systems be extended without refactoring core?
- Are there circular dependencies?
- Is the save/load boundary clean?

**Escalation:** Flags hardcoded values, tight coupling, or architectural debt.

---

### QA Agent

**Goal:** Ensure stability and correctness.

**Checks:**
- Does the game launch without errors?
- Do all JSON files load correctly?
- Are edge cases handled (zero resources, negative values, missing data)?
- Does DebugValidator pass?
- Are save/load operations safe?
- Do UI elements update correctly?

**Escalation:** Flags crashes, data loading failures, or unhandled edge cases.

---

### Balance Agent

**Goal:** Ensure fair, fun, non-exploitable economy.

**Checks:**
- Can any strategy dominate without counterplay?
- Is 10-month progression achievable but not trivial?
- Are costs and revenues proportional?
- Does hype decay prevent infinite snowball?
- Is there a recovery path from bad decisions?
- Are events impactful but not game-ending?

**Escalation:** Flags dominant strategies, dead-end states, or trivial victories.

---

### UX Agent

**Goal:** Ensure clarity and usability.

**Checks:**
- Can a new player understand what to do in 30 seconds?
- Are resource changes visible immediately?
- Are locked items explained clearly?
- Is the screen readable without scrolling?
- Are warnings and notifications obvious?
- Is text legible and well-spaced?

**Escalation:** Flags confusing UI, missing feedback, or information overload.

---

### Synthetic Playtester Agent

**Goal:** Simulate player archetypes and report experience quality.

**Archetypes:**

| Archetype | Focus |
|---|---|
| New Player | First impressions, onboarding clarity |
| Tycoon Fan | Depth, optimization, progression feel |
| Min-Max Player | Exploits, dominant strategies, edge cases |
| Casual Steam Player | First 5 minutes, engagement, retention |
| Harsh Steam Reviewer | Uniqueness, depth, polish, theme expression |
| Accessibility Tester | Clarity, readability, button visibility |

---

## Review Cadence

- After every milestone: Full agent review
- P0/P1 issues: Must fix before advancing
- P2/P3 issues: Logged in backlog
- Results: Recorded in `reports/` folder
