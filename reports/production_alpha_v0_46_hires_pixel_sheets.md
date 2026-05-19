# v0.46-alpha 제작 보고서 — 고밀도 픽셀 시트 기반 사무실

작성일: 2026-05-19

## 목표

v0.45 초안이 너무 낮은 해상도로 보인다는 피드백을 반영해, 화면 크기는 크게 무너뜨리지 않으면서 원본 픽셀 시트 밀도와 표시 크기를 함께 올린다.

## 구현

- `scripts/assets/generate-v046-hires-pixel-sheets.mjs`를 추가해 PNG 시트 3종을 2x 밀도로 생성한다.
- `public/assets/sprites/v046-agents-hires.png`: 192×192 프레임, 3열×10행 캐릭터 시트.
- `public/assets/sprites/v046-office-objects-hires.png`: 256×192 프레임, 5열 오브젝트 시트.
- `public/assets/backgrounds/v046-isometric-office-hires.png`: 2560×1440 아이소메트릭 사무실 배경.
- `asset_manifest.json`의 현재 시트 계약을 v0.46 고밀도 ID와 경로로 교체했다.
- `GameChrome`은 같은 slicing 경로를 유지하되 액터 표시 크기를 76px, 오브젝트 표시 크기를 최대 116×92px로 키운다.
- 기존 액터 클릭, 포커스 패널, 직접 케어 액션은 유지했다.

## 에이전트 리뷰

- Executive Producer: P1 없음. 낮은 해상도 피드백을 짧은 v0.46 패스로 바로 반영했다.
- Game Designer: P1 없음. 액터와 가구가 더 큰 실루엣으로 보여 사무실 경영 공간성이 강해졌다.
- Systems Architect: P1 없음. 이미지 경로와 슬라이스 규격은 manifest에 있고, 교체 가능한 데이터 계약으로 유지된다.
- QA Agent: P1. 현재 Node REPL 런타임에 `playwright` 모듈이 없어 브라우저 스크린샷 자동 검증은 보류했다. 데이터/빌드/정적 에셋 응답은 통과했다.
- Balance Agent: 영향 없음. 경제/진행 수치는 변경하지 않았다.
- UX Agent: P2. 실제 AI 생성 시트로 교체하면 액터 실루엣과 배경 대비를 다시 확인해야 한다.
- Shareability Agent: P1 없음. 스크린샷에서 사무실 공간성이 이전보다 강해졌다.
- Solo Dev Scope Agent: P1 없음. 외부 에셋 구매 없이도 시트 교체 파이프라인을 먼저 확보했다.

## 다음 작업

1. 실제 이미지 생성 모델로 `v046-agents-hires.png`와 `v046-office-objects-hires.png`를 같은 규격으로 교체한다.
2. 걷기, 감정, 사건 리액션 행을 캐릭터 시트에 추가한다.
3. 사무실 배치 좌표를 아이소메트릭 바닥 그리드 기준으로 정렬한다.
