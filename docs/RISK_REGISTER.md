# Risk Register — AI Company Tycoon: Boundaryless

## Purpose

This document tracks identified risks to the project, their severity, likelihood, and mitigation plans. Updated after every milestone and whenever new risks are identified.

---

## Risk Classification

| Severity | Definition |
|---|---|
| P0 | Project-blocking, must resolve immediately |
| P1 | High impact, must resolve before next milestone |
| P2 | Medium impact, should resolve within 2 milestones |
| P3 | Low impact, resolve when convenient |

| Likelihood | Definition |
|---|---|
| High | Very likely to occur (>70%) |
| Medium | Possible (30-70%) |
| Low | Unlikely (<30%) |

---

## Active Risks

| ID | Risk | Severity | Likelihood | Mitigation | Status |
|---|---|---|---|---|---|
| R001 | Balance may favor one strategy too strongly | P1 | Medium | Run balance simulations after Milestone 2; tune via data/balance.json | Open |
| R002 | 10-minute MVP scope may be too ambitious | P1 | Medium | Prioritize core loop; cut automation features if needed | Open |
| R003 | UI may become too crowded with all panels | P2 | Medium | Design modular panels; allow collapsing; test with UX agent | Open |
| R004 | Event system may feel random rather than strategic | P2 | Medium | Use condition-based events; ensure player can prepare | Open |
| R005 | Compute pressure curve may be too punishing early | P2 | Low | Tune users_per_compute_cost_unit in balance.json | Open |
| R006 | Save/Load may corrupt state if systems change between milestones | P2 | Low | Version save files; validate on load | Open |
| R007 | Alpha screen can still feel too panel-heavy compared with Kairosoft-style playfulness | P2 | Medium | Add release animations, product review ceremony, and collapsible panels in the next polish pass | Open |

---

## Resolved Risks

| ID | Risk | Resolution | Date |
|---|---|---|---|
| R003 | UI may become too crowded with all panels | Alpha introduced a game-like office screen and stronger grouping; still monitor as features grow | 2026-05-15 |

---

## Review Schedule

The risk register is reviewed and updated after every milestone completion and after every synthetic playtest that reveals new concerns.
