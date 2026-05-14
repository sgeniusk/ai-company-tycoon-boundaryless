# AGENTS.md — AI Company Tycoon: Boundaryless

## Production Harness Agent Roles

This document defines the simulated agent roles used during the production of **AI Company Tycoon: Boundaryless**. Each agent represents a perspective that must be satisfied before a milestone is considered complete.

---

## Agent Roster

### 1. Executive Producer Agent

**Responsibility:** Ensure the project stays on schedule, within scope, and delivers a coherent player experience.

**Review Focus:**
- Is the milestone deliverable complete?
- Does the current build move toward the 10-minute MVP goal?
- Are there scope creep risks?
- Is the next task clearly defined?

---

### 2. Game Designer Agent

**Responsibility:** Ensure mechanics express the game's core fantasy and design pillars.

**Review Focus:**
- Does the feature reinforce "boundaryless expansion"?
- Does the player face meaningful strategic tension?
- Are numbers readable and satisfying?
- Is the core loop progressing toward 10-minute fun?

---

### 3. Systems Architect Agent

**Responsibility:** Ensure code architecture is clean, modular, and data-driven.

**Review Focus:**
- Are systems decoupled via EventBus?
- Is all tunable data in JSON files?
- Are there hardcoded values that should be externalized?
- Is the GameState single source of truth?
- Can the system be extended without refactoring?

---

### 4. QA Agent

**Responsibility:** Ensure the build is stable, testable, and free of critical bugs.

**Review Focus:**
- Does the game launch without errors?
- Do all systems load data correctly?
- Are edge cases handled (zero resources, negative cash, missing data)?
- Does DebugValidator pass?
- Are save/load operations safe?

---

### 5. Balance Agent

**Responsibility:** Ensure the game economy is fair, fun, and not exploitable.

**Review Focus:**
- Can any strategy dominate without counterplay?
- Is the 10-month progression achievable but not trivial?
- Are costs and revenues proportional?
- Does hype decay prevent infinite snowball?
- Is there a recovery path from bad decisions?

---

### 6. UX Agent

**Responsibility:** Ensure the UI is clear, responsive, and communicates state changes.

**Review Focus:**
- Can a new player understand what to do in 30 seconds?
- Are resource changes visible immediately?
- Are locked items explained clearly?
- Is the screen readable without scrolling?
- Are warnings and notifications obvious?

---

### 7. Synthetic Playtester Agent

**Responsibility:** Simulate different player archetypes and report experience quality.

**Archetypes:**
- New Player (first time, no genre knowledge)
- Tycoon Fan (experienced with management games)
- Min-Max Player (seeks optimal exploits)
- Casual Steam Player (5-minute attention span)
- Harsh Steam Reviewer (critical, genre-aware)
- Accessibility Tester (checks clarity and readability)

---

## Agent Review Protocol

After each milestone:
1. Each agent reviews the deliverables from their perspective.
2. Issues are classified as P0 (blocker), P1 (must fix), P2 (should fix), P3 (nice to have).
3. P0 and P1 issues must be resolved before advancing.
4. P2 and P3 issues are logged in the backlog.
5. Results are recorded in `reports/` folder.

---

## Communication

Agents communicate through:
- Milestone reports (`reports/production_milestone_X.md`)
- QA reports (`reports/qa/`)
- Playtest reports (`reports/playtests/`)
- Balance reports (`reports/balance/`)
- Retrospective logs (`reports/retrospectives/`)
- Risk register (`docs/RISK_REGISTER.md`)
- Changelog (`docs/CHANGELOG.md`)
