# Synthetic Playtest Protocol — AI Company Tycoon: Boundaryless

## Purpose

Synthetic playtesting simulates different player archetypes to evaluate the game experience without requiring human testers. Each archetype asks specific questions that reveal design strengths and weaknesses.

---

## When to Run

Synthetic playtests are required after every milestone from Milestone 2 onward. Results are recorded in `reports/playtests/`.

---

## Player Archetypes

### New Player Tester

Simulates a first-time player with no genre knowledge.

**Questions:**
- Did I understand what to click first?
- Did I understand why a product was locked?
- Did I understand what changed after Next Month?
- Was the UI overwhelming or confusing?
- Did I know what success looks like?

**Pass Criteria:** A new player can complete their first 3 months without confusion.

---

### Tycoon Fan Tester

Simulates an experienced management game player.

**Questions:**
- Did growth feel satisfying?
- Did I have at least one meaningful optimization decision?
- Did the company feel larger over time?
- Were there interesting trade-offs?
- Did I want to keep playing after 10 minutes?

**Pass Criteria:** An experienced player finds at least 2 interesting decisions per session.

---

### Min-Max Tester

Simulates a player seeking optimal exploits.

**Questions:**
- Can I exploit free launches?
- Can I ignore trust forever?
- Can I snowball hype without consequences?
- Can I get stuck with no recovery path?
- Is there a dominant strategy that makes all others irrelevant?

**Pass Criteria:** No single strategy dominates; all exploits have consequences.

---

### Casual Steam Tester

Simulates a player with a 5-minute attention span.

**Questions:**
- Was the first 5 minutes engaging?
- Would I keep playing?
- Would I wishlist this?
- Did I feel progress quickly?
- Was there too much reading?

**Pass Criteria:** Player feels engaged within 2 minutes and sees progress within 5.

---

### Harsh Steam Reviewer

Simulates a critical, genre-aware reviewer.

**Questions:**
- Does this feel like a spreadsheet?
- Is there too little feedback?
- Does it feel generic?
- Is the AI company theme actually expressed by mechanics?
- Is there anything unique here?

**Pass Criteria:** The game has at least 2 mechanics that feel unique to the AI company theme.

---

### Accessibility Tester

Simulates a player checking clarity and readability.

**Questions:**
- Are resource names clear?
- Are buttons obvious?
- Is the screen too crowded?
- Are important warnings visible?
- Is text legible at default size?
- Are color contrasts sufficient?

**Pass Criteria:** All critical information is readable and actionable without confusion.

---

## Report Format

```markdown
# Synthetic Playtest Report — Milestone X

## Date: YYYY-MM-DD

## New Player Tester
- First click clarity: Pass / Fail
- Lock explanation: Pass / Fail
- Month advance understanding: Pass / Fail
- Notes: (observations)

## Tycoon Fan Tester
- Growth satisfaction: Pass / Fail
- Meaningful decisions: Pass / Fail
- Progression feel: Pass / Fail
- Notes: (observations)

## Min-Max Tester
- Free exploit found: Yes / No
- Dominant strategy: Yes / No
- Dead-end state: Yes / No
- Notes: (observations)

## Casual Steam Tester
- 5-minute engagement: Pass / Fail
- Wishlist likelihood: High / Medium / Low
- Notes: (observations)

## Harsh Steam Reviewer
- Theme expression: Pass / Fail
- Uniqueness: Pass / Fail
- Notes: (observations)

## Accessibility Tester
- Readability: Pass / Fail
- Button clarity: Pass / Fail
- Warning visibility: Pass / Fail
- Notes: (observations)

## Issues Found
- P0: (list)
- P1: (list)
- P2: (list)
- P3: (list)

## Recommendations
- (actionable improvements)
```

---

## Post-Playtest Actions

1. Fix all P0 and P1 issues immediately.
2. Log P2 and P3 issues in the backlog.
3. Update `reports/playtests/` with the full report.
4. Update `docs/RISK_REGISTER.md` if new risks are identified.
5. Inform the next milestone plan of any design changes needed.
