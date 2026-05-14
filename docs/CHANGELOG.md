# Changelog — AI Company Tycoon: Boundaryless

All notable changes to this project will be documented in this file.

---

## [0.8.0-alpha] — 2026-05-15

### Competition And I18n Foundation

**Added:**
- 5 fictional AI competitors: 챗지오디, 클로이, 제미있니, 노바런, 오토마루
- Competition menu with market ranking, rival profiles, market share, research level, and claimed product spaces
- Monthly rival growth and deterministic product-space claiming
- Rival events with player choices and competitor score/momentum effects
- Save/load support for competitor state and rival event history
- Korean/English locale dictionaries and `t()` translation helper for new competitor/event content
- Data validation for competitors, rival events, and locale keys

**Updated:**
- Top status now shows player market share
- Product cards show when competitors have claimed the same product space
- Product review scoring now takes competitor product claims into account
- Menu structure now includes 경쟁

**Verification:**
- `npm test` passed
- `npm run validate:data` passed
- `npm run build` passed

---

## [0.4.0-alpha] — 2026-05-15

### Prototype Systems Before Graphics Assets

**Added:**
- Agent hiring flow with data-driven hire costs, duplicate prevention, and talent growth
- Owned item flow with shop purchases and agent equipment slots
- Product development projects that assign available agents, advance monthly, generate quality, and release with review grades
- Effective agent stats from base archetype plus equipped items
- Save/load coverage for hired agents, owned items, and active development projects
- 10-month prototype regression test

**Updated:**
- Product menu now starts development projects instead of instant-launching from the UI
- Agent menu now includes hired team management, equipment display, and equip actions
- Shop menu now has purchase buttons and locked/owned states for items

**Verification:**
- `npm test` passed
- `npm run validate:data` passed
- `npm run build` passed
- Browser flow verified: hire agent, buy item, equip item, start product project, advance 2 months, release product, console errors 0

---

## [0.3.1-alpha] — 2026-05-15

### Content And Menu Structure

**Added:**
- 10 AI agent archetypes with Korean names, roles, stats, upkeep, preferred items, quirks, and pixel-art appearance notes
- 20 shop items across office, equipment, research, safety, and marketing categories
- Menu structure: 회사, 제품, 에이전트, 연구, 상점, 기록
- Agent compendium screen with stat grid and appearance hooks
- Item shop screen with costs, effects, rarity, and flavor text
- Content validation tests for agent and item data

**Updated:**
- Data validator now checks agent stats, appearance palettes, preferred item references, item costs, and item effect keys
- The alpha UI now uses a menu panel instead of showing every system at once

**Verification:**
- `npm test` passed
- `npm run validate:data` passed
- `npm run build` passed
- Browser checked: menu navigation, agent screen, shop screen, console errors 0

---

## [0.3.0-alpha] — 2026-05-15

### Alpha: Game-Like Playable Screen

**Added:**
- Game-like office/lab screen with staff sprites, server rack, launch board, and compact tycoon UI frame
- Product release review score, grade, and quote
- Monthly event surfacing and event choice resolution
- Upgrade purchase flow with requirement and cost checks
- Automation purchase flow with compounding automation gains
- Save/load through serialized runtime state and local storage buttons
- Alpha simulation tests for release reviews, events, upgrades, automation, and save/load
- Alpha production, QA, and synthetic playtest reports

**Updated:**
- First event and visible upgrade/automation labels are Korean-first
- Simulation state now tracks product reviews, current events, event history, purchased upgrades, and purchased automations
- Data validator already covers product/event/upgrade references and remains part of the gate

**Verification:**
- `npm test` passed
- `npm run validate:data` passed
- `npm run build` passed
- Browser flow verified: launch product, advance month, view event, resolve event, save run

---

## [0.2.0] — 2026-05-14

### Web Restart Milestone 1: Playable Dashboard Shell

**Added:**
- Korean-first playable dashboard shell
- Company stage display based on `data/company_stages.json`
- Monthly report summary after advancing time
- Vitest test harness for core simulation expectations
- Web-specific production, QA, and synthetic playtest reports

**Updated:**
- Runtime direction is now Vite + React + TypeScript
- UI text, resources, products, domains, capabilities, and company stages use Korean player-facing names
- Agent review and acceptance criteria include Game Dev Story-style compact management loop checks

**Verification:**
- `npm test` passed
- `npm run validate:data` passed
- `npm run build` passed
- Browser flow verified: launch AI 글쓰기 비서, advance to next month, monthly report appears

---

## [0.1.0] — 2026-05-14

### Milestone 1: Empty Playable Shell

**Added:**
- data/resources.json — 8 resource definitions with initial values
- data/balance.json — monthly cost parameters and game thresholds
- scripts/core/EventBus.gd — global signal bus singleton
- scripts/core/DataLoader.gd — JSON loading and validation utility
- scripts/core/GameState.gd — central game state singleton
- scripts/systems/ResourceSystem.gd — resource mutation and clamping
- scripts/systems/MonthSystem.gd — monthly advancement and cost application
- scripts/ui/MainScreen.gd — main UI controller
- scripts/ui/ResourcePanel.gd — dynamic resource display
- scenes/main.tscn — main game scene with three-panel layout
- Autoload configuration in project.godot

**Updated:**
- scripts/debug/debug_validator.gd — full validation for M1 data files
- project.godot — autoload singletons and main scene configured

**Functionality:**
- Game loads and displays 8 resources from JSON
- Next Month button advances time and applies costs
- Monthly salary, compute, and base costs deducted
- Hype decays monthly; trust recovers if below threshold
- All values clamped to configured min/max
- Game over and win conditions checked each month
- Event log provides feedback on monthly changes
- DebugValidator runs at startup and reports issues

---

## [0.0.1] — 2026-05-14

### Milestone 0: Harness Setup

**Added:**
- Project folder structure (docs/, reports/, data/, scenes/, scripts/, tests/)
- AGENTS.md with all agent role definitions
- 10 documentation files in docs/
- reports/ folder structure
- Godot project configuration
- DebugValidator skeleton script
- README.md

**Status:** Complete.
