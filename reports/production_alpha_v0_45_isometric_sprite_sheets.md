# v0.45-alpha 제작 보고서 — 고해상도 픽셀 시트 기반 사무실

작성일: 2026-05-19

## 목표

첨부 레퍼런스처럼 사무실 화면이 한눈에 게임 스크린샷으로 보이도록, 고해상도 픽셀아트 시트를 잘라 쓰는 렌더링 경로를 만든다.

## 구현

- `scripts/assets/generate-v045-isometric-sheets.mjs`를 추가해 PNG 시트 3종을 생성한다.
- `public/assets/sprites/v045-agents.png`: 96×96 프레임, 3열×10행 캐릭터 시트.
- `public/assets/sprites/v045-office-objects.png`: 128×96 프레임, 5열 오브젝트 시트.
- `public/assets/backgrounds/v045-isometric-office.png`: 1280×720 아이소메트릭 사무실 배경.
- `asset_manifest.json`에 `sprite_sheets`와 `scene_backdrops`를 추가해 시트 경로와 슬라이스 규격을 데이터화했다.
- `GameChrome`은 `getAssetSheet`, `getAgentSpriteFrameStyle`, `getOfficeObjectSpriteFrameStyle`로 시트를 잘라 액터와 장식을 표시한다.
- 기존 액터 클릭, 포커스 패널, 직접 케어 액션은 유지했다.

## 에이전트 리뷰

- Executive Producer: P1 없음. 그래픽 방향이 실제 게임 화면 쪽으로 크게 이동했다.
- Game Designer: P1 없음. 사무실이 단순 UI 패널이 아니라 경영 공간으로 읽히기 시작한다.
- Systems Architect: P1 없음. 이미지 경로와 슬라이스 규격은 manifest에 있고, 교체 가능한 데이터 계약으로 유지된다.
- QA Agent: P1. Playwright 런치 타임아웃으로 브라우저 DOM 스크린샷 자동 검증은 보류했다. 데이터/빌드/정적 에셋 응답은 통과했다.
- Balance Agent: 영향 없음. 경제/진행 수치는 변경하지 않았다.
- UX Agent: P2. 실제 AI 생성 시트로 교체하면 액터 실루엣과 배경 대비를 다시 확인해야 한다.
- Shareability Agent: P1 없음. 스크린샷에서 사무실 공간성이 이전보다 강해졌다.
- Solo Dev Scope Agent: P1 없음. 외부 에셋 구매 없이도 시트 교체 파이프라인을 먼저 확보했다.

## 다음 작업

1. 실제 이미지 생성 모델로 `v045-agents.png`와 `v045-office-objects.png`를 같은 규격으로 교체한다.
2. 걷기, 감정, 사건 리액션 행을 캐릭터 시트에 추가한다.
3. 사무실 배치 좌표를 아이소메트릭 바닥 그리드 기준으로 정렬한다.
