# Balance Report — Alpha v0.9.4 Competitor Pacing

Date: 2026-05-15

## Current Model Change

This version changes timing and feedback, not economy numbers:

- Rival score growth remains unchanged.
- Rival market-share recalculation remains unchanged.
- Product-space claims are delayed until month 4.
- Months 2-3 can show preparation warnings instead of claims.

## Balance Impact

- Opening punishment is reduced: the player cannot lose product space before month 4.
- Strategic tension is preserved: prepared rivals can still claim soon after the first product-development cycle.
- The warning beat gives the player a clearer reason to care about competitors before penalties apply.

## Risks

- P2: If the first product releases around month 3, the first rival claim at month 4 may still feel abrupt without a stronger visual cue.
- P2: Rival preparation is deterministic; repeated runs may reveal the pattern too quickly.
- P3: Rival IDs in logs are less satisfying than localized competitor display names.

## Next Tuning Targets

- Test three opening routes: rush product, hire second agent, save cash.
- Add counterplay for prepared rival markets, such as acceleration, differentiation, or PR response.
- Consider showing a preparation countdown in the competition menu once visual polish begins.

## Verdict

Good for v0.9.4. The change addresses early pressure without weakening the midgame competitive premise.
