# Visual / Interaction Smoke Index

Tracked browser smokes for the commercial-polish surfaces. Run these instead of one-off `/private/tmp` scripts.

## Prerequisites

- Playwright is NOT a repo dependency; the smokes resolve it from the Codex runtime cache by default and accept a `PW_NODE_MODULES` override:
  ```sh
  PW_NODE_MODULES=/path/to/node_modules/ node scripts/qa/<smoke>.mjs ...
  ```
- Start a server first (dev or preview), then point the smoke at it:
  ```sh
  npm run dev -- --port 5222          # source (HMR)
  npm run preview -- --port 5223      # built dist (use to verify production chunks)
  ```
- The Codex sandbox blocks Chromium localhost navigation (`ERR_ACCESS_DENIED`); the first-screen and overlay smokes fall back to `dist/index.html` there. Run them from a normal shell (Claude) for live-server coverage.

## Smokes

| Smoke | npm script | Scenario / URL | Checks | Exit |
|-------|-----------|----------------|--------|------|
| `scripts/qa/check-v096-first-screen.mjs` | `qa:v096-first-screen` | `?scenario=office-visuals` (desktop 1366×768 + mobile 390×844) | office visible fraction (≥0.23/0.21), 6 actors, surface text overflow = 0, office center uncovered, no document overflow | 0 pass; 2–8 per failed gate |
| `scripts/qa/check-v098-overlays.mjs` | `qa:v098-overlays` | `?scenario=payoff-juice` / `milestones` / `big-event` | each overlay opens, drain-dismisses to closed, no blocking overlay remains, no console error | 0 pass; 1 error / 2 incomplete |
| `scripts/qa/check-v095-event-sightline.mjs` | — | `?scenario=office-visuals` | event rail stays compact and does not bury the office sightline; actors visible | 0 pass; 1–9 per failed gate |

## Usage examples

```sh
# First-screen composition (desktop + mobile)
npm run dev -- --port 5222
node scripts/qa/check-v096-first-screen.mjs http://127.0.0.1:5222/?scenario=office-visuals

# Overlay dismiss reliability (3 sensitive overlays)
node scripts/qa/check-v098-overlays.mjs http://127.0.0.1:5222

# Verify the PRODUCTION build (chunk split) actually loads
npm run build
npm run preview -- --port 5223
node scripts/qa/check-v096-first-screen.mjs http://127.0.0.1:5223/?scenario=office-visuals
node scripts/qa/check-v098-overlays.mjs http://127.0.0.1:5223
```

## Screenshots

All smokes write PNGs to `reports/qa/screenshots/` (`v0_96_first_screen_*`, `v0_98_overlay_*`, `v0_97_resource_hud_*`, `v0_95_event_sightline_*`).

## Build chunks (v0.99)

`vite.config.ts` `manualChunks` splits `react-vendor`, `game-data` (data/*.json), and `game-logic` (src/game/*) so the entry chunk stays under the 500 kB Vite warning. After a build, no chunk should exceed 500 kB. `src/ui/build-config.test.ts` locks this.
