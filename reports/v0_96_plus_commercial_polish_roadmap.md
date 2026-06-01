# v0.96+ Commercial Polish Roadmap

Date: 2026-06-01
Owner handoff: Codex -> Claude planning/verification track

## Current State

The roguelike/content spine is shipped through v0.67, and the commercial-polish sequence has advanced through v0.95.

Recent polish commits:
- `8f14da7` — v0.93 command console: bottom command row now reads as pixel hardware.
- `5513e95` — v0.94 office comic workloops: staff actors gained key-clack, comic-pop, and focus-beam work props.
- `9236c96` — v0.95 event sightline rail: incident panels preserve the office view instead of hiding animated staff.

Current visual direction:
- Pixel-art consistency across office, HUD, event rail, menus, icons, and feedback effects.
- Turn-based business sim, but the main office must feel alive: compact, comic, busy, and readable.
- Preserve playfield visibility. UI should support the office scene, not replace it with dashboard panels.

## Release Target

Reach a beta/RC-quality web build that looks like a commercial pixel management game on first load.

Non-goals for the next stretch:
- No new economy/tick/save systems unless a visual polish change exposes a real bug.
- No broad balance rewrites.
- No content-bulk expansion until the current surfaces feel finished.

## v0.96 — First-Screen Composition Pass

Goal: make the first viewport read as a game scene first, UI second.

> Status: CLOSED 2026-06-01 (commit `d11eb13`, verified). harness:gate 53 files / 643 tests; live first-viewport smoke desktop/mobile exit 0; visual-only diff empty. Evidence `reports/qa/v0_96_first_screen_run.md`. Carried to v0.97: desktop pixel resource icons/deltas were compacted because the HUD layout is tight (restoring on desktop caused 18 overflows incl. truncated values) — needs a HUD layout redesign.

Planned work:
- Audit desktop and mobile first screen with screenshots.
- Reduce any remaining panel crowding around the office.
- Keep top brand/status, office stage, event rail, command console, and menu cabinet visually distinct.
- Add or update a browser smoke that measures office visible height, actor count, overflow, and panel overlap.

Acceptance:
- Office scene remains visible and nonblank on desktop and mobile.
- Event, resource, command, and menu surfaces have zero text overflow.
- `npm run harness:gate < /dev/null` passes.

## v0.97 — Pixel-Art Consistency Sweep

> Status: CLOSED 2026-06-02. #1 desktop resource-HUD redesign (`4d0978b`) + #2 pixel token unification radius/motion (`ba5b0b0`). Gate 53/645. Soft shadows were already pixel-hard (0/125 blurred); gradient flattening deferred as optional low-value follow-up. Evidence `reports/qa/v0_97_block1_resource_hud_run.md`, `reports/qa/v0_97_block2_pixel_tokens_run.md`.

Goal: remove remaining generic web-app visual language.

Planned work:
- Redesign the desktop resource HUD so pixel resource icons + deltas return without surface overflow (carried from v0.96; the first-screen smoke must stay exit 0).
- Audit CSS for non-pixel materials: soft SaaS shadows, card-like panels, inconsistent radii, non-stepped animations.
- Tighten visual tokens: borders, pixel shadows, palette accents, `image-rendering: pixelated`, reduced-motion coverage.
- Keep cards only where they represent discrete game objects or menu entries.

Acceptance:
- Layout contract locks the pixel treatment for major shells: topbar, resource HUD, office, event rail, command console, menu cabinet.
- Browser screenshots show coherent pixel materials on desktop/mobile.

## v0.98 — Interaction Finish Pass

Goal: make important flows feel intentionally game-like.

Planned work:
- Re-check modals and confirmations, especially milestone/reward/world reveal flows.
- Ensure every dismiss/confirm button actually closes its surface and does not trap input.
- Add focused smoke checks for currently known sensitive surfaces.
- Improve button affordance and state feedback without adding tutorials.

Acceptance:
- Milestone/reward/world reveal surfaces are dismissible.
- Keyboard/touch target behavior remains usable.
- Regression tests cover known stuck-overlay bugs.

## v0.99 — Performance and Build Readiness

Goal: prepare for an RC build without visual regressions.

Planned work:
- Address or document the persistent Vite >500 kB chunk warning.
- Consider manual chunking if it can be done without destabilizing routing or data loading.
- Add a compact visual smoke index so future agents do not rely on one-off `/private/tmp` scripts.

Acceptance:
- Build still passes.
- Either chunk warning is reduced or a clear report explains why it is deferred.
- Browser smoke scripts are reproducible from tracked repo files.

## v1.0-beta / RC

Goal: freeze a coherent playable build for user review.

Release criteria:
- Clean `main`, pushed and deployed.
- `npm run harness:gate < /dev/null` PASS.
- Desktop and mobile smoke screenshots stored under `reports/qa/screenshots/`.
- Short release report with known issues and next DLC/content candidates.

## Handoff Notes

Do not restart from the old v0.63 plan. Treat it as shipped history. The active lane is commercial polish and first-screen game feel.

Best next block: v0.97 pixel-art consistency sweep (v0.96 CLOSED 2026-06-01, commit `d11eb13`). Priority: redesign the desktop resource HUD so pixel resource icons + deltas return without overflow (carried from v0.96), then broaden to pixel-token consistency. Visual-only, TDD-first, browser-smoke verified.
