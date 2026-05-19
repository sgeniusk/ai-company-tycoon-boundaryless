# v0.48-alpha 제작 보고서 — 시트 기반 액터 프레임 애니메이션

작성일: 2026-05-19

## 목표

고밀도 캐릭터 atlas가 정적인 한 프레임으로 멈춰 보이지 않도록, 사무실 액터가 idle/work 상태별 3프레임을 실제로 순환하게 만든다.

## 구현

- `asset_manifest.json` 버전을 `0.48-alpha`로 올렸다.
- 에이전트 idle/work 애니메이션에 `duration_ms`를 추가했다.
- `getAnimatedSpriteSheetFrameStyle`을 추가해 atlas 행 시작 프레임과 종료 위치를 CSS custom property로 넘긴다.
- 사무실 액터에 `sprite-sheet-animated` 클래스를 붙여 `@keyframes sprite-sheet-frame-cycle`로 background-position을 순환한다.
- work loop는 idle loop보다 빠르게 설정해 작업 중인 액터가 더 활동적으로 보이게 했다.

## 에이전트 리뷰

- Executive Producer: P1 없음. 그래픽 자산이 실제 게임 화면에서 살아 움직이는 단계로 진입했다.
- Game Designer: P1 없음. 작업 중인 직원/에이전트가 즉시 읽히는 피드백이 강화됐다.
- Systems Architect: P1 없음. 속도는 manifest 데이터에 있고, 렌더링은 기존 atlas slicing 경로를 확장한다.
- QA Agent: P1 없음. layout contract와 asset manifest contract가 애니메이션 경로를 고정한다.
- UX Agent: P1 없음. reduced-motion 사용자는 기존 규칙대로 애니메이션이 꺼진다.
- Solo Dev Scope Agent: P1 없음. 새 이미지 없이 atlas 활용도를 높였다.

## 다음 작업

1. 실제 AI 생성 시트의 idle/work 3프레임을 같은 기준점으로 교체한다.
2. 걷기, 감정, 사건 리액션 행을 atlas에 추가한다.
3. 제품 출시/카드 사용 순간에 액터 주변 이펙트 프레임을 연결한다.
