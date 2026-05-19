# Pixel Asset Plan — Alpha v0.9 Prep

## Purpose

Prepare the prototype for Kairosoft-style pixel assets without generating final graphics yet.

## Visual Direction

- Compact management-sim screen.
- Small but expressive pixel characters.
- Warm office/lab palette with readable UI panels.
- Characters should be distinctive by silhouette, hair, outfit, and signature prop before facial detail.

## Asset Groups

### Agent Sprites

Each agent needs:

- Idle 3-frame loop.
- Work 3-frame loop.
- Tiny portrait bust.
- 4-direction body can wait until the office becomes navigable.

Priority agents:

1. 프롬프트 설계가
2. 코드 스미스
3. 데이터 큐레이터
4. 인프라 오퍼레이터
5. 그로스 해커

### Competitor Identity

Each competitor needs:

- 32x32 logo mark.
- Small representative mascot or CEO bust.
- Ranking color swatch.

Priority competitors:

1. 챗지오디
2. 클로이
3. 제미있니
4. 노바런
5. 오토마루

### Office Objects

Initial tiles/objects:

- Work desk
- GPU rack
- Launch board
- Research whiteboard
- Item shelf
- Meeting table
- Server cooling wall

### Item Icons

Use 16x16 or 24x24 icons first:

- 프롬프트 노트
- 기계식 키보드
- 미니 GPU 랙
- 텐서 화이트보드
- 레드팀 키트
- 바이럴 카메라

## Implementation Notes

- Keep CSS placeholder sprites until final PNG sprites are available.
- Add asset metadata JSON before importing images into the runtime.
- Prefer one sprite sheet per category after the first batch stabilizes.
- Preserve accessible text labels; images should enhance, not replace, readable UI.

## v0.9 Scaffold Status

Implemented:

- `data/asset_manifest.json` defines the current 16px tile grid, 32px character frame grid, 48px portrait size, 24px item icon size, and 32px competitor logo size.
- Priority agent placeholders now have palette, silhouette class, idle/work animation rows, portrait hints, and prop hints.
- All five fictional competitors have logo identity hooks.
- The first six shop items have icon hooks.
- Office objects have tile footprints so the later office-layout pass can place real tiles without inventing new IDs.

Still pending before final art generation:

- Approve one seed frame per priority agent.
- Choose whether the first batch is generated as mock sprite sheets or drawn manually after prompt drafts.
- Add actual PNG paths only after preview sheets pass in-engine inspection.

## Next Gate

Before generating assets:

1. Confirm sprite size grid.
2. Confirm palette constraints.
3. Decide whether assets are generated first as mock sheets or drawn manually after prompt drafts.

## v0.45 Generated Sheet Pipeline

Implemented:

- `npm run assets:v045` regenerates the current draft PNG assets.
- `public/assets/sprites/v045-agents.png` is a 96×96 frame sheet with 3 columns and 10 rows.
- Agent rows are ordered as idle/work pairs: prompt architect rows 0/1, code smith 2/3, data curator 4/5, infra operator 6/7, growth hacker 8/9.
- `public/assets/sprites/v045-office-objects.png` is a 128×96 frame sheet with row-major office object frames.
- `public/assets/backgrounds/v045-isometric-office.png` is the first 1280×720 isometric office backdrop.
- `data/asset_manifest.json` now owns the sheet paths, dimensions, row/column counts, and scene backdrop path.

Generation handoff:

- AI-generated character sheets can replace `v045-agents.png` if they keep the same 96×96 slot size, 3 columns, 10 rows, transparent background, and idle/work row order.
- AI-generated object sheets can replace `v045-office-objects.png` if they keep the same 128×96 slot size, 5 columns, row-major object order, and transparent background.
- The first production prompt should ask for one full sheet at once, not separate per-frame generations, to reduce drift.
- If true transparency is not available, generate against a flat chroma-key background and remove it before committing the PNG.

Still pending:

- Replace the deterministic draft sheets with approved AI-generated or hand-polished production sheets.
- Add walking, emotion, and event rows after the idle/work rows stabilize.
- Add a small preview sheet QA page so every slot can be checked outside the main game screen.
