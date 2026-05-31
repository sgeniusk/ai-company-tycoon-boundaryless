# v0.70 Campaign Aftermath Polish Run

Date: 2026-05-31
Branch: main
Base: 314aba1

## Scope

- Added a derive-only `CampaignFinale.aftermath` model for the 11th-year epilogue.
- Surfaced the epilogue in the final result flow:
  - compact headline in the beta completion crest
  - detailed `11년차 후일담` signal panel in the final run summary
- Fixed the results tab layout so result articles use content-height rows and the panel owns scrolling, preventing stacked ending cards from overlapping.

## TDD Evidence

RED:

- `npm test -- src/game/campaign.test.ts < /dev/null`
  - Failed as expected because `finale.aftermath` was `undefined`.

GREEN:

- `npm test -- src/game/campaign.test.ts < /dev/null`
  - 1 file passed, 6 tests passed.
- `npm test -- src/game/campaign-ending.test.ts src/game/run-summary.test.ts src/game/shareable-moments.test.ts < /dev/null`
  - 3 files passed, 38 tests passed.
- `npm run build < /dev/null`
  - Production build passed.

## Browser Smoke

Target:

- `http://127.0.0.1:5222/?scenario=ending-nearmiss-final`

Evidence:

- Screenshot: `reports/qa/screenshots/v0_70_campaign_aftermath_result_panel.png`
- The browser smoke found `11년차 후일담` in the crest/result DOM.
- Result article overlap check: PASS.
- Console/page errors: none.

## Full Gate

Command:

```bash
npm run harness:gate < /dev/null
```

Result:

- Test suite: 53 files passed, 610 tests passed.
- Data validation: PASS.
- Beta-readiness check: PASS, 15/15 readiness checks, 23/23 replayable ending guidance, 4/4 route axes, 40/40 options.
- Production build: PASS.

## Guardrails

- No save schema or tick changes.
- The aftermath is pure derived finale output from the final campaign state.
- No protected contract files changed.
