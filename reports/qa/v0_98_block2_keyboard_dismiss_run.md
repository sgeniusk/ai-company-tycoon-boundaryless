# v0.98 #2 Keyboard Escape Dismiss + Initial Focus QA

Date: 2026-06-02

## Scope

- Goal: make the sensitive overlays (big-event / payoff-celebration / world-reveal) operable by keyboard — Escape dismisses, and the dismiss button takes initial focus when the overlay opens. additive (reuses existing dismiss handlers).
- No simulation, save, data, economy, tick, or RNG change.

## Implementation (Codex)

- `useEffect` keydown(Escape) listener + `useRef` initial focus in all three modals, reusing the existing dismiss handler (`dismissChallengerEntry`, `queue.slice(1)`, `dismissedSeeds.add`).
- `BigEventModal` restructured: hooks moved to the top above the early `if (!pendingId) return null`, guarded by `if (!shown) return` inside the effect (rules-of-hooks). `WorldRevealModal`/`PayoffCelebrationModal` kept hook order, effect placed before their null returns.
- Each effect cleans up its listener; runs only when the overlay is shown.

## TDD Evidence

- RED: `npm test -- src/ui/layout-contract.test.ts` failed (no `addEventListener("keydown")` / `"Escape"` in the modals).
- GREEN: passed (124 in file). Full suite 53 files / 647 tests. `tsc + vite build` clean (rules-of-hooks held).
- Render test skipped: the repo runs Vitest in node mode with no jsdom/happy-dom or @testing-library — verified instead by the static contract + Claude's live browser check.

## Browser Verification (Claude, live dev server :5222)

`/tmp/v098_esc.mjs` (Escape-driven):
- big-event: overlay opened, initial focus on `.big-event-dismiss` = true, Escape drained the overlay (2 presses) → closed.
- payoff-juice: overlay opened, initial focus on `.payoff-celebration-dismiss` = true, Escape drained → closed.
- ESC_DISMISS_OK = true, INITIAL_FOCUS_OK = true.

## Gate

`npm run harness:gate < /dev/null`: PASS — 53 files / 647 tests, validate:data, beta-readiness 15/15, build 1.36s.

## Additive Proof

`git --no-pager diff --quiet -- src/game/simulation.ts src/game/types.ts data/`: empty.

## Notes

- Stacked overlays would each respond to Escape (rare; the single-overlay scenarios are the common case).
- Focus restoration to the previously focused element on close is a possible later follow-up.
- v0.98 interaction finish pass is now substantially complete (#1 affordance + reliability smoke, #2 keyboard dismiss + focus).
