# Balance Report — Alpha v0.8.0 Competition Layer

Date: 2026-05-15

## Current Model

- Player score is derived from active products, projects, users, trust, hype, automation, and capability levels.
- Rival score grows every month from base growth, momentum, and contested domains.
- Market share is recalculated from player score plus rival scores.
- Rivals claim product spaces on a deterministic cadence.
- Claimed product spaces apply a review score penalty when the player enters late.

## Observed Strengths

- Competition now creates visible pressure without blocking the core loop.
- Product claims are understandable and appear in product cards.
- Rival events create simple but clear resource-vs-rival tradeoffs.

## Risks

- P2: Market share formula may undervalue high-quality but low-user strategies.
- P2: Rival claims are deterministic and may feel mechanical after repeated runs.
- P2: Competitor counterplay is still mostly event-based.

## Next Tuning Targets

- Run 10-month simulations for at least three strategies: hype, trust, automation.
- Add softer rubber-banding so rivals do not run away before the player understands the loop.
- Make specific rival weaknesses actionable through upgrades or products.

## Verdict

Good enough for v0.8 alpha. Needs multi-strategy balance testing before v1.0-alpha.
