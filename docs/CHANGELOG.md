# Changelog — AI Company Tycoon: Boundaryless

All notable changes to this project will be documented in this file.

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
