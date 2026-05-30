# v0.67 Multi-ending Closeout

Date: 2026-05-31

## Status
- Implementation track status: complete enough for verification-track close.
- Tracker files were not edited by this track; `feature_list.json` still needs the verification track to mark `v0.67-alpha-multi-ending`.
- Latest full gate: `npm run harness:gate < /dev/null`
  - 49 test files passed.
  - 561 tests passed.
  - `validate:data` passed.
  - `tsc && vite build` passed.

## Delivered
- `data/endings.json` defines 24 deterministic campaign endings.
- `getCampaignEnding(finalState)` selects the highest-priority matching ending deterministically.
- Final results reveal the selected ending, codex discovery delta, reward delta, target-run result, ending report, and near-miss rematches.
- Cross-run ending collection lives in `roguelite.discoveredEndingIds`.
- Ending codex supports collection summary, route coverage, progress annotations, filtering, sorting, replay starts, and active-target state.
- Ending rewards are one-time meta insight bonuses.
- Next-run setup and codex cards derive route-specific meta unlock recommendations from ending conditions and existing meta unlock tags.
- Every replayable reward ending now has at least one derived unlock recommendation.

## Safety
- Monthly economy hooks were not rewritten for v0.67.
- Ending selection and codex surfaces are derive-only except for cross-run discovery persistence during reset.
- Save persistence is limited to `roguelite.discoveredEndingIds` sanitation/integrity/migration paths.
- Standard ten-year simulation remains on the standard/no-arg path and maps to `standard_platform_compounder`.
- Data validator guards ending count, priority uniqueness, fallback placement, replay-safe required fields, and run-axis coverage.

## QA Evidence
- `reports/qa/v0_67_block67_run.md` — underrepresented axis ending coverage.
- `reports/qa/v0_67_block68_run.md` — run-axis coverage validator.
- `reports/qa/v0_67_block69_run.md` — final QA URLs for new endings.
- `reports/qa/v0_67_block70_run.md` — route coverage in codex.
- `reports/qa/v0_67_block71_run.md` — next-run ending unlock recommendations.
- `reports/qa/v0_67_block72_run.md` — codex unlock hint chips.
- `reports/qa/v0_67_block73_run.md` — unlock hint filter.
- `reports/qa/v0_67_block74_run.md` — unlock hint sort.
- `reports/qa/v0_67_block75_run.md` — every reward ending has unlock guidance.
- `reports/qa/v0_67_block76_run.md` — unlock guidance coverage summary.

## Browser Smokes
- Final result routes:
  - `?scenario=ending-san-francisco-final&menu=results`
  - `?scenario=ending-steady-operator-final&menu=results`
- Deck/codex routes:
  - `?scenario=ending-replay&menu=deck`
  - `?scenario=ending-san-francisco-final&menu=deck`
- Verified rendered strings include:
  - `새 엔딩 발견`
  - `엔딩 도감 반영`
  - `엔딩 루트 커버리지`
  - `추천 해금`
  - `해금 추천23`
  - `해금 안내 23/23 (100%)`

## Residual Risk
- No pixel-diff visual regression was captured; DOM smoke covered labels, counts, active filters, and active sorts.
- `feature_list.json` / `progress.md` closeout is intentionally left to the verification track.
- Ending content can continue scaling, but new reward endings should keep the `getEndingRouteUnlockLabels` invariant green.
