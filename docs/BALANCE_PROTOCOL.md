# Balance Protocol — AI Company Tycoon: Boundaryless

## Purpose

This document defines how game balance is tested, tuned, and maintained throughout development. All balance values live in JSON data files and can be adjusted without code changes.

---

## Balance Philosophy

The game economy must satisfy these principles:

1. **No dominant strategy.** All three player strategies (Hype Growth, Trust Enterprise, Automation Efficiency) must be viable paths to success.

2. **Pressure scales with growth.** As the company grows, costs and risks must grow proportionally. Unchecked growth must create visible consequences.

3. **Recovery is possible.** Bad decisions should hurt but never create an unrecoverable state (unless the game-over condition is met).

4. **10-month arc.** The MVP must feel like a complete arc in 10 months: small start, growth, pressure, adaptation, and either success or failure.

5. **Readable numbers.** Players must intuitively understand whether a number is good or bad without consulting documentation.

---

## Key Balance Parameters

All values are stored in `data/balance.json`.

| Parameter | Purpose | Tuning Notes |
|---|---|---|
| salary_per_talent | Monthly cost per employee | Must create pressure but not instant death |
| compute_cost_per_unit | Cost per compute unit consumed | Must scale with user growth |
| users_per_compute_cost_unit | How many users per compute cost tick | Controls compute pressure curve |
| hype_decay_rate | Monthly hype reduction | Must prevent infinite snowball |
| trust_recovery_rate | Monthly trust recovery | Must be slow enough to matter |
| growth_rate_base | Base user growth multiplier | Controls early game pacing |
| trust_multiplier_threshold | Trust level for enterprise bonus | Gates enterprise strategy |
| automation_cost_reduction | Cost reduction per automation level | Must not eliminate all costs |

---

## Balance Testing Process

### Step 1: Simulate Three Strategies

For each strategy, simulate a 10-month playthrough:

**Hype Growth Path:**
- Launch consumer products immediately
- Invest in marketing
- Expected: Fast user growth, compute pressure by month 4, trust issues by month 6

**Trust Enterprise Path:**
- Invest in safety upgrades early
- Target enterprise products
- Expected: Slow start, stable revenue by month 5, enterprise unlock by month 7

**Automation Path:**
- Invest in automation upgrades
- Optimize costs
- Expected: Low growth initially, compounding benefits by month 6, efficiency by month 8

### Step 2: Check Win/Loss Timing

Each strategy should be able to reach at least one success condition by month 10 if played well. No strategy should guarantee success without risk.

### Step 3: Check Failure States

Verify that reckless play leads to game over. Verify that cautious play does not lead to game over (unless extremely passive).

### Step 4: Check Event Impact

Events should be impactful (5-15% resource swing) but not game-ending on their own. Multiple bad events in a row should create serious pressure.

---

## Balance Report Format

```markdown
# Balance Report — Milestone X

## Date: YYYY-MM-DD

## Strategy Simulations

### Hype Growth
- Month 10 state: (resources)
- Success condition met: Yes / No
- Key pressure points: (months)

### Trust Enterprise
- Month 10 state: (resources)
- Success condition met: Yes / No
- Key pressure points: (months)

### Automation Efficiency
- Month 10 state: (resources)
- Success condition met: Yes / No
- Key pressure points: (months)

## Dominant Strategy Check
- Any strategy clearly superior: Yes / No
- Evidence: (explanation)

## Dead-End Check
- Any unrecoverable state found: Yes / No
- Evidence: (explanation)

## Tuning Changes Made
- (parameter): (old value) -> (new value), reason: (explanation)

## Open Issues
- (list of balance concerns for next milestone)
```

---

## Tuning Guidelines

When adjusting balance values:
- Change one parameter at a time
- Re-simulate all three strategies after each change
- Document the reason for every change
- Never change values in code; always update `data/balance.json`
- Keep a history of changes in `docs/CHANGELOG.md`
