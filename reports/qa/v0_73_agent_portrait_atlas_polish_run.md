# v0.73 Agent Portrait Atlas Polish Run

Date: 2026-05-31

## Scope

- Replace block-built agent card portraits with character-sheet-backed portrait art.
- Use the existing v0.53 agent event-pose sheet for hired-agent and recruitment cards.
- Preserve gameplay determinism: no save, tick, simulation, economy, or data-balance changes.

## RED

Command:

```bash
npm test -- src/ui/layout-contract.test.ts < /dev/null
```

Expected failure:

- `layout-contract.test.ts` rejected missing `getAgentPortraitAtlasStyle`, `agent-portrait-atlas`, and atlas-backed portrait CSS.

Result: 1 failed / 100 passed before implementation.

## GREEN

Command:

```bash
npm test -- src/ui/layout-contract.test.ts < /dev/null
```

Result: PASS

- Layout contract: 1 file / 101 tests passed.

## Browser Smoke

Target:

```text
http://127.0.0.1:5222/?scenario=staff-incidents
```

Desktop 1366x768:

- `sheetStatus`: 200
- `portraitCount`: 3
- `compactCount`: 2
- `atlasLoaded`: true
- `hiddenFallbackParts`: true
- `horizontalOverflow`: 0
- `cardTextFitFailures`: []
- Console errors: []

Mobile 390x844:

- `sheetStatus`: 200
- `portraitCount`: 3
- `compactCount`: 2
- `atlasLoaded`: true
- `hiddenFallbackParts`: true
- `horizontalOverflow`: 0
- `cardTextFitFailures`: []
- Console errors: []

Screenshots:

- `reports/qa/screenshots/v0_73_agent_portrait_atlas_desktop.png`
- `reports/qa/screenshots/v0_73_agent_portrait_atlas_mobile.png`

## Full Gate

Command:

```bash
npm run harness:gate < /dev/null
```

Result: PASS

- Vitest: 53 files / 616 tests passed.
- Data validation: PASS.
- Beta readiness check: PASS, 15/15 checks, 23/23 unlock guidance, 4/4 route axes, 40/40 options.
- TypeScript + Vite production build: PASS.

## Notes

- The portrait style crops and scales the idle frame so characters read clearly inside the existing 72px and 58px card slots.
- Existing block portrait DOM remains as a fallback, but is hidden when a sprite sheet is available.
- No protected contract files were modified.
