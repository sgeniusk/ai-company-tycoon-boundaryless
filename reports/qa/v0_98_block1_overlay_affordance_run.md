# v0.98 #1 Overlay Dismiss Affordance + Reliability QA

Date: 2026-06-02

## Scope

- Goal: give the sensitive overlay dismiss buttons consistent hover/active/focus-visible affordance, and lock a drain-dismiss reliability smoke so overlays can't trap input. additive/visual.
- No simulation, save, data, economy, tick, or RNG change.

## Audit (no bug found)

- `WorldRevealModal`, `PayoffCelebrationModal`, `BigEventModal` (mounted `GameChrome.tsx:2870-2872`) all dismiss correctly and return null. PayoffCelebration is a queue (one dismiss advances to the next).
- Affordance gap: only `.big-event-dismiss` had a `:hover`; none had `:focus-visible` (keyboard gap).

## Implementation (Codex)

- `:hover` (lift + brighten), `:active` (press), `:focus-visible` (outline + ring) on `.world-reveal-dismiss`, `.payoff-celebration-dismiss`, `.big-event-dismiss`. `--pixel-steps` timing; hover/active transforms guarded under `@media (prefers-reduced-motion: reduce)`.

## TDD Evidence

- RED: `npm test -- src/ui/layout-contract.test.ts` failed (`.world-reveal-dismiss:focus-visible` missing).
- GREEN: passed (123 in file). Full suite 53 files / 646 tests.

## Browser Verification (Claude, live dev server :5222)

`node scripts/qa/check-v098-overlays.mjs`:
- payoff-juice → `.payoff-celebration-overlay` opened, drain-dismissed, gone, no blocking overlay.
- milestones → `.payoff-celebration-overlay` opened, dismissed, gone.
- big-event → `.big-event-overlay` opened, dismissed, gone.
- 3/3 ok, 0 console errors. Screenshots `reports/qa/screenshots/v0_98_overlay_{payoff-juice,milestones,big-event}.png` (post-dismiss office).

Regression: `check-v096-first-screen.mjs` desktop/mobile overflow 0 — no first-screen regression.

### Smoke hardening (Claude, during verification)

Codex's first smoke draft failed two real ways, fixed by Claude:
1. It clicked dismiss once and expected the overlay gone — but payoff-juice queues multiple celebrations, so one dismiss advances. Fix: drain-dismiss loop (click until the overlay clears), which is the true no-input-trap guarantee.
2. It reused one `--single-process` browser across 3 checks and crashed on the 2nd `newPage`. Fix: fresh browser per check (the v0.96 smoke pattern).

## Gate

`npm run harness:gate < /dev/null`: PASS — 53 files / 646 tests, validate:data, beta-readiness 15/15, build 1.05s.

## Additive Proof

`git --no-pager diff --quiet -- src/game/simulation.ts src/game/types.ts data/`: empty.

## Notes

- v0.98 #2 follow-up: ESC-to-dismiss + initial focus / focus restoration for the modals (React hooks).
