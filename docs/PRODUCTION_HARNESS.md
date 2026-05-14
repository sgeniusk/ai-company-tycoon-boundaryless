# Production Harness — AI Company Tycoon: Boundaryless

## Purpose

The production harness defines the workflow, quality gates, and documentation standards used to build this game. It ensures every milestone is delivered with consistent quality, tested from multiple perspectives, and documented for future reference.

---

## Workflow

### Milestone-Based Development

The game is built in sequential milestones. Each milestone has:
- A clear goal
- Specific deliverables
- Acceptance criteria
- Synthetic playtesting
- Agent review

### Milestone Sequence

| # | Milestone | Goal |
|---|---|---|
| 0 | Harness Setup | Create production harness and docs |
| 1 | Empty Playable Shell | Launch Godot scene with UI and resources |
| 2 | Product Launch Loop | Player launches product and earns revenue |
| 3 | Capability and Domain Unlocks | AI capability upgrades unlock products and domains |
| 4 | Monthly Events | Events create strategic choices |
| 5 | Upgrades and Automation | Player can choose long-term investments |
| 6 | Save / Load | Game state persists |
| 7 | 10-Minute MVP Integration | Connect all systems into coherent playable loop |

---

## Quality Gates

Before advancing to the next milestone:

1. All acceptance criteria must pass.
2. DebugValidator must run without errors.
3. Synthetic playtest must be completed.
4. All P0 and P1 issues must be resolved.
5. Agent review must be documented.
6. Production report must be written.

---

## Data-Driven Architecture

All tunable values must be in JSON data files. Never hardcode:
- Product names, costs, or revenue
- Event text or effects
- Upgrade values
- Capability names
- Domain unlock requirements
- Balance coefficients

---

## File Organization

```
ai-company-tycoon/
├── AGENTS.md
├── docs/
│   ├── GAME_VISION.md
│   ├── PRODUCTION_HARNESS.md
│   ├── AGENT_ROLES.md
│   ├── QA_PROTOCOL.md
│   ├── SYNTHETIC_PLAYTEST_PROTOCOL.md
│   ├── ACCEPTANCE_CRITERIA.md
│   ├── BALANCE_PROTOCOL.md
│   ├── RETROSPECTIVE_LOG.md
│   ├── CHANGELOG.md
│   └── RISK_REGISTER.md
├── reports/
│   ├── qa/
│   ├── playtests/
│   ├── retrospectives/
│   ├── balance/
│   └── production_milestone_X.md
├── data/
│   ├── resources.json
│   ├── balance.json
│   ├── products.json
│   ├── capabilities.json
│   ├── domains.json
│   ├── events.json
│   ├── upgrades.json
│   ├── automation_upgrades.json
│   ├── company_stages.json
│   └── ui_text.json
├── scenes/
│   └── ui/
├── scripts/
│   ├── core/
│   ├── systems/
│   ├── ui/
│   └── debug/
└── tests/
```

---

## Communication Protocol

- Each milestone produces a production report.
- Issues are tracked with priority levels (P0-P3).
- Retrospectives are logged after every 2 milestones.
- Risk register is updated when new risks are identified.
- Changelog is updated with every milestone completion.

---

## Tools

- Engine: Godot 4.x
- Language: GDScript
- Data format: JSON
- Version control: Git (recommended)
- Testing: DebugValidator + Synthetic Playtesting
