# Acceptance Criteria — AI Company Tycoon: Boundaryless

## Purpose

This document defines the acceptance criteria for each milestone. A milestone is not considered complete until all its criteria are verified.

---

## Alpha v0.12.0: Roguelite Deckbuilding Pivot Foundation

| # | Criterion | Status |
|---|---|---|
| 1 | New runs create a deterministic starter deck, opening hand, draw pile, and discard pile | **Passed** |
| 2 | Strategy cards are data-driven and validated against known resources, effects, requirements, and meta unlocks | **Passed** |
| 3 | Playing a card spends costs, moves the card to discard, and changes active project progress or quality | **Passed** |
| 4 | Development puzzle generation creates a 3x3 issue board for an active project | **Passed** |
| 5 | Resolving a development puzzle changes project progress and quality and records a result | **Passed** |
| 6 | Completed or failed runs generate founder insight | **Passed** |
| 7 | Founder insight can unlock meta upgrades and carry unlocked cards into the next run | **Passed** |
| 8 | Save/load hydration preserves or backfills roguelite state safely | **Passed** |
| 9 | UI includes a new `덱` menu for hand cards, puzzle state, and meta unlocks | **Passed** |
| 10 | Browser QA supports `?scenario=deck` | **Passed** |
| 11 | `npm test`, `npm run validate:data`, and `npm run build` pass | **Passed** |

---

## Alpha v0.11.0: Commercial Readiness Systems

| # | Criterion | Status |
|---|---|---|
| 1 | Run achievements are data-driven, unlock once, apply rewards, and persist through save/load | **Passed** |
| 2 | Growth paths define monthly effects and month reports surface strategy effects | **Passed** |
| 3 | Final or 10-month runs show a rank, verdict, strengths, and next recommendation | **Passed** |
| 4 | Corrupt save data recovers to a playable state and invalid resources are sanitized | **Passed** |
| 5 | Runtime state integrity validator reports malformed snapshots | **Passed** |
| 6 | Scripted commercial simulations cover all growth paths and keep integrity clean | **Passed** |
| 7 | Productivity commercial simulation reaches the 10-month window with at least two active products | **Passed** |
| 8 | Active products can be upgraded and upgraded products increase monthly output | **Passed** |
| 9 | Browser QA supports `?scenario=commercial` | **Passed** |
| 10 | `npm test`, `npm run validate:data`, and `npm run build` pass | **Passed** |
| 11 | Chrome visual QA confirms the commercial scenario renders run result, two products, achievements, and strategy effects | **Passed** |

---

## Alpha v0.10.1: Strategy And Arc QA Scenarios

| # | Criterion | Status |
|---|---|---|
| 1 | QA scenario IDs include `strategy` and `arc` | **Passed** |
| 2 | Strategy scenario opens the competition menu with a chosen growth path | **Passed** |
| 3 | Arc scenario opens the company menu with a chosen growth path and later month state | **Passed** |
| 4 | URL parsing supports `?scenario=strategy` and `?scenario=arc` | **Passed** |
| 5 | QA scenario docs include new URLs and visual checklist | **Passed** |
| 6 | `npm test`, `npm run validate:data`, and `npm run build` pass | **Passed** |

---

## Alpha v0.10.0: Ten-Month MVP Arc

| # | Criterion | Status |
|---|---|---|
| 1 | Game exposes a five-step 10-month MVP progress arc | **Passed** |
| 2 | Arc starts at 0% for a new game | **Passed** |
| 3 | First release and strategy commitment advance the arc | **Passed** |
| 4 | Company panel renders arc summary, meter, and milestone details | **Passed** |
| 5 | `npm test`, `npm run validate:data`, and `npm run build` pass | **Passed** |

---

## Alpha v0.9.9: Release Headlines And Market Reaction

| # | Criterion | Status |
|---|---|---|
| 1 | Release moments include a product-specific headline | **Passed** |
| 2 | Release moments include market reaction copy with expected user signal | **Passed** |
| 3 | Release spotlight renders headline and market reaction text | **Passed** |
| 4 | Older release saves are hydrated with fallback headline/reaction copy | **Passed** |
| 5 | `npm test`, `npm run validate:data`, and `npm run build` pass | **Passed** |

---

## Alpha v0.9.8: Growth Path Follow-Up Objectives

| # | Criterion | Status |
|---|---|---|
| 1 | Each growth path defines exactly three follow-up objectives | **Passed** |
| 2 | Follow-up objectives are validated against real product/capability/item/upgrade/resource IDs | **Passed** |
| 3 | Objective completion is calculated from current game state | **Passed** |
| 4 | Company panel shows the chosen strategy's follow-up checklist | **Passed** |
| 5 | Completed objectives receive a distinct visual state | **Passed** |
| 6 | `npm test`, `npm run validate:data`, and `npm run build` pass | **Passed** |

---

## Alpha v0.9.7: Competition Strategy Signals

| # | Criterion | Status |
|---|---|---|
| 1 | Competition signals classify rivals against the chosen growth path | **Passed** |
| 2 | Competitors with overlapping target domains show `전략 충돌` | **Passed** |
| 3 | Competitors that claim products in the chosen path show `선점 충돌` | **Passed** |
| 4 | Competition ranking cards show strategy signal badges | **Passed** |
| 5 | Rival profile cards explain the signal reason | **Passed** |
| 6 | `npm test`, `npm run validate:data`, and `npm run build` pass | **Passed** |

---

## Alpha v0.9.6: Commit To Growth Path

| # | Criterion | Status |
|---|---|---|
| 1 | Growth paths define data-driven commitment effects and bonus descriptions | **Passed** |
| 2 | Player cannot choose a growth path before the first product release | **Passed** |
| 3 | Player can choose exactly one growth path after release | **Passed** |
| 4 | Choosing a growth path applies its immediate resource bonus | **Passed** |
| 5 | Chosen growth path persists through save/load | **Passed** |
| 6 | Duplicate or alternate path choices do not reapply bonuses | **Passed** |
| 7 | The company stage card shows the chosen strategy | **Passed** |
| 8 | The first-session objective for next growth completes after commitment | **Passed** |
| 9 | `npm test`, `npm run validate:data`, and `npm run build` pass | **Passed** |

---

## Alpha v0.9.5: Post-Release Growth Forks

| # | Criterion | Status |
|---|---|---|
| 1 | A data-driven growth path file defines three post-release strategic routes | **Passed** |
| 2 | Growth paths reference valid products, capabilities, items, upgrades, and menu targets | **Passed** |
| 3 | First release moments include three actionable growth paths | **Passed** |
| 4 | Save/load hydration preserves or backfills release growth paths | **Passed** |
| 5 | Post-release guidance tells the player to choose a growth path | **Passed** |
| 6 | Release spotlight renders growth path cards that route to the relevant menu | **Passed** |
| 7 | QA release scenario includes growth path coverage | **Passed** |
| 8 | `npm test`, `npm run validate:data`, and `npm run build` pass | **Passed** |

---

## Alpha v0.9.4: Opening Competitor Pacing

| # | Criterion | Status |
|---|---|---|
| 1 | Rival companies do not claim product spaces during months 1-3 | **Passed** |
| 2 | Rival companies can foreshadow market entry during months 2-3 | **Passed** |
| 3 | Foreshadowing appears in the timeline with clear `예고` wording | **Passed** |
| 4 | Rival product-space claims resume from month 4 onward | **Passed** |
| 5 | Early contested-domain copy is softer than direct pressure | **Passed** |
| 6 | The v0.9.1 10-expert P2 competitor pacing issue is referenced in the production report | **Passed** |
| 7 | `npm test`, `npm run validate:data`, and `npm run build` pass | **Passed** |

---

## Alpha v0.9.3: Browser QA Scenarios And Screen Polish

| # | Criterion | Status |
|---|---|---|
| 1 | QA scenarios exist for fresh, project, release, and shop states | **Passed** |
| 2 | URL query loading supports `?scenario=` and `?qa=` scenario IDs | **Passed** |
| 3 | Scenario-loaded builds show a QA status pill in the top bar | **Passed** |
| 4 | QA scenario documentation lists URLs and visual checklist | **Passed** |
| 5 | Top status pills wrap instead of forcing horizontal overflow | **Passed** |
| 6 | Release spotlight uses reduced-motion-safe visual emphasis | **Passed** |
| 7 | Narrow layouts hide extra office objects to reduce overlap risk | **Passed** |
| 8 | `npm test`, `npm run validate:data`, and `npm run build` pass | **Passed** |
| 9 | Browser QA attempt outcome is recorded in QA report | **Passed** |

---

## Alpha v0.9.2: Game Dev Harness Skill Draft

| # | Criterion | Status |
|---|---|---|
| 1 | A reusable game development harness skill draft exists in `docs/skills/` | **Passed** |
| 2 | The skill defines versioning rules for future improvements | **Passed** |
| 3 | The skill defines a question-card protocol for major direction choices | **Passed** |
| 4 | The skill includes Retention/LTV, shareability, and solo-dev scope gates | **Passed** |
| 5 | The skill requires changelog, acceptance criteria, reports, verification, and commit records | **Passed** |
| 6 | `AGENTS.md` includes Retention/LTV, Shareability, and Solo Dev Scope agents | **Passed** |
| 7 | `npm test`, `npm run validate:data`, and `npm run build` pass | **Passed** |

---

## Alpha v0.9.1: Tester-Driven Office And Release Polish

| # | Criterion | Status |
|---|---|---|
| 1 | New players see a clear next-goal card before any menu decision | **Passed** |
| 2 | The guidance flow covers hiring, first product development, month advancement, and first item purchase | **Passed** |
| 3 | Product project completion stores the latest release moment for UI reward feedback | **Passed** |
| 4 | Save/load preserves the latest release moment | **Passed** |
| 5 | Office object metadata is represented as visible placeholder tiles in the office scene | **Passed** |
| 6 | Opening objective strip shows first-session progress states | **Passed** |
| 7 | Starter product revenue is tuned to at least `₩1,400` monthly revenue | **Passed** |
| 8 | First release shows a boundaryless expansion hint | **Passed** |
| 9 | v0.9 synthetic and 10-expert playtest findings are referenced in the production report | **Passed** |
| 10 | `npm test`, `npm run validate:data`, and `npm run build` pass | **Passed** |

---

## Alpha v0.9.0: Pixel Asset Manifest Scaffold

| # | Criterion | Status |
|---|---|---|
| 1 | `asset_manifest.json` defines fixed sprite grid sizes for tiles, character frames, portraits, icons, and competitor logos | **Passed** |
| 2 | Priority agent sprite hooks cover 프롬프트 설계가, 코드 스미스, 데이터 큐레이터, 인프라 오퍼레이터, 그로스 해커 | **Passed** |
| 3 | Agent sprite hooks include placeholder status, 3-frame idle/work animation metadata, portrait hints, prop hints, and hex palettes | **Passed** |
| 4 | Every competitor has a logo identity hook and 32x32 logo size | **Passed** |
| 5 | First item icon batch maps to existing shop item IDs | **Passed** |
| 6 | Data validator rejects broken asset references and invalid palettes | **Passed** |
| 7 | Agent, competitor, and item UI surfaces consume manifest hooks without replacing readable text | **Passed** |
| 8 | `npm test`, `npm run validate:data`, and `npm run build` pass | **Passed** |

---

## Alpha v0.8.1: UI Structure Prep For Pixel Assets

| # | Criterion | Status |
|---|---|---|
| 1 | `App.tsx` is reduced to state orchestration and shell composition | **Passed** |
| 2 | Game chrome UI is isolated from menu panel UI | **Passed** |
| 3 | Menu panel rendering is isolated in a dedicated component module | **Passed** |
| 4 | Shared formatters and menu definitions are extracted | **Passed** |
| 5 | Existing gameplay tests still pass | **Passed** |
| 6 | Production build still passes | **Passed** |

---

## Alpha v0.8.0: Competition And I18n Foundation

| # | Criterion | Status |
|---|---|---|
| 1 | At least 5 fictional AI competitors are defined in JSON | **Passed** |
| 2 | Competitors have localizable name/tagline/archetype/weakness keys | **Passed** |
| 3 | Initial game state includes competitor runtime state | **Passed** |
| 4 | Month advancement grows rivals and recalculates market share | **Passed** |
| 5 | Rivals can claim product spaces over time | **Passed** |
| 6 | Rival events appear and choices affect resources and rival momentum | **Passed** |
| 7 | Save/load preserves competitor state and rival event state | **Passed** |
| 8 | Competition menu shows ranking, profiles, market share, and claimed products | **Passed** |
| 9 | Korean and English locale dictionaries include competitor and rival event keys | **Passed** |
| 10 | `npm test`, `npm run validate:data`, and `npm run build` pass | **Passed** |

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
