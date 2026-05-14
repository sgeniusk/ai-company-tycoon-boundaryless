# Acceptance Criteria — AI Company Tycoon: Boundaryless

## Purpose

This document defines the acceptance criteria for each milestone. A milestone is not considered complete until all its criteria are verified.

---

## Alpha v0.4.0: Prototype Systems Before Graphics Assets

| # | Criterion | Status |
|---|---|---|
| 1 | Player can hire at least one AI agent from the Agent menu | **Passed** |
| 2 | Agent hiring spends JSON-defined cost and increases team talent | **Passed** |
| 3 | Player can buy shop items and see owned/locked states | **Passed** |
| 4 | Player can equip an agent-targeted item to a hired agent | **Passed** |
| 5 | Product menu starts a development project using available agents | **Passed** |
| 6 | Month advancement progresses projects and releases completed products with reviews | **Passed** |
| 7 | Save/load preserves hired agents, owned items, and development projects | **Passed** |
| 8 | Starter product can release within 2 months with a suitable first agent | **Passed** |
| 9 | `npm test`, `npm run validate:data`, and `npm run build` pass | **Passed** |
| 10 | Browser hire → buy → equip → develop → release loop has no console errors | **Passed** |
| 11 | A 10-month prototype run completes without corrupting state | **Passed** |

---

## Alpha v0.3.0: Game-Like Playable Screen

| # | Criterion | Status |
|---|---|---|
| 1 | First screen reads as a game operation screen, not a generic dashboard | **Passed** |
| 2 | Office/lab playfield is visible with staff, server, and release board motifs | **Passed** |
| 3 | Product launch creates a review score and grade | **Passed** |
| 4 | Month advancement creates revenue, users, data, cost, and compute pressure | **Passed** |
| 5 | Eligible monthly event appears and choices apply effects | **Passed** |
| 6 | Upgrades and automation purchases enforce costs/requirements | **Passed** |
| 7 | Save/load serializes and hydrates runtime state | **Passed** |
| 8 | `npm test`, `npm run validate:data`, and `npm run build` pass | **Passed** |
| 9 | Browser alpha loop has no console errors | **Passed** |

---

## Alpha v0.3.1: Content And Menu Structure

| # | Criterion | Status |
|---|---|---|
| 1 | Menu is organized into Company, Products, Agents, Research, Shop, and Log | **Passed** |
| 2 | Agent roster includes at least 10 distinct AI agent types | **Passed** |
| 3 | Every agent has role, stats, upkeep, preferred items, and appearance traits | **Passed** |
| 4 | Item data includes office, equipment, research, safety, and marketing categories | **Passed** |
| 5 | Agent and item data are validated by automated tests and data validator | **Passed** |
| 6 | Browser menu navigation shows Agents and Shop content without console errors | **Passed** |

---

## Milestone 0: Harness Setup

| # | Criterion | Status |
|---|---|---|
| 1 | Repository has clear folder structure | **Passed** |
| 2 | AGENTS.md exists and defines all roles | **Passed** |
| 3 | All docs/ files are created | **Passed** |
| 4 | QA protocol is documented | **Passed** |
| 5 | Synthetic playtest protocol is documented | **Passed** |
| 6 | Retrospective loop is documented | **Passed** |
| 7 | Balance protocol is documented | **Passed** |
| 8 | Risk register is initialized | **Passed** |
| 9 | Godot folder structure is ready | **Passed** |
| 10 | Production report for Milestone 0 is written | **Passed** |

---

## Milestone 1: Empty Playable Shell

Legacy Godot result retained for reference. The active web restart criteria are below.

### Web Restart Milestone 1: Playable Dashboard Shell

| # | Criterion | Status |
|---|---|---|
| 1 | Web app launches at localhost without console errors | **Passed** |
| 2 | Resource strip displays Korean resource names and values | **Passed** |
| 3 | Product list renders launchable and locked products | **Passed** |
| 4 | Locked products explain requirements in Korean | **Passed** |
| 5 | At least one product can be launched from starting state | **Passed** |
| 6 | Next Month advances the month counter | **Passed** |
| 7 | Resource changes are visible after launching and advancing | **Passed** |
| 8 | Company stage is visible and updates from game state | **Passed** |
| 9 | Monthly report appears after month advancement | **Passed** |
| 10 | `npm test`, `npm run validate:data`, and `npm run build` pass | **Passed** |

### Legacy Godot Milestone 1

| # | Criterion | Status |
|---|---|---|
| 1 | Game launches in Godot without errors | **Passed** |
| 2 | Resources load from JSON | **Passed** |
| 3 | Next Month button advances the month counter | **Passed** |
| 4 | Resource panel updates on state change | **Passed** |
| 5 | DebugValidator runs and passes | **Passed** |

---

## Milestone 2: Product Launch Loop

| # | Criterion | Status |
|---|---|---|
| 1 | Product data loads from JSON | Pending |
| 2 | Locked products explain their requirements | Pending |
| 3 | Product launch spends correct resources | Pending |
| 4 | Active product generates revenue on month advance | Pending |
| 5 | Users create compute pressure | Pending |

---

## Milestone 3: Capability and Domain Unlocks

| # | Criterion | Status |
|---|---|---|
| 1 | Capability upgrade changes game state | Pending |
| 2 | Product requirements check capability levels | Pending |
| 3 | New domain unlocks with notification | Pending |
| 4 | Locked domain shows requirements | Pending |

---

## Milestone 4: Monthly Events

| # | Criterion | Status |
|---|---|---|
| 1 | Event triggers after month advance | Pending |
| 2 | Choices apply correct effects | Pending |
| 3 | Event conditions work correctly | Pending |
| 4 | Events do not crash with low resources | Pending |

---

## Milestone 5: Upgrades and Automation

| # | Criterion | Status |
|---|---|---|
| 1 | Upgrades load from JSON | Pending |
| 2 | Upgrade requirements are enforced | Pending |
| 3 | Automation affects monthly simulation | Pending |
| 4 | Automation creates visible benefits | Pending |
| 5 | Automation does not remove gameplay | Pending |

---

## Milestone 6: Save / Load

| # | Criterion | Status |
|---|---|---|
| 1 | Runtime state saves correctly | Pending |
| 2 | Runtime state loads correctly | Pending |
| 3 | Static data is not duplicated in save file | Pending |
| 4 | Missing save file is handled gracefully | Pending |

---

## Milestone 7: 10-Minute MVP Integration

| # | Criterion | Status |
|---|---|---|
| 1 | Player can play 10 months without crash | Pending |
| 2 | At least 3 events occur in 10 months | Pending |
| 3 | At least 1 capability can be upgraded | Pending |
| 4 | At least 1 new domain can unlock | Pending |
| 5 | At least 1 automation upgrade can be purchased | Pending |
| 6 | Game has visible success/failure trajectory | Pending |
| 7 | Monthly report shows meaningful data | Pending |
| 8 | Balance report confirms no dominant strategy | Pending |
