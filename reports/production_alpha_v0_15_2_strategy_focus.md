# Alpha v0.15.2 제작 보고서 — 전략실 추천 실행감

작성일: 2026-05-17

## 요약

v0.15.2는 연간 전략실 추천을 각 메뉴의 실제 행동 준비 상태로 연결한 버전이다. 이제 전략실에서 제품, 연구, 경쟁 대응 버튼을 누른 뒤 해당 메뉴로 이동하면, 같은 추천 대상이 상단 포커스 스트립과 카드 강조로 다시 보인다.

## 구현 내용

- `getAnnualStrategyMenuFocus` 읽기 모델 추가.
- 제품 메뉴에 전략실 추천 제품 포커스 스트립 추가.
- 연구 메뉴에 전략실 추천 연구 포커스 스트립 추가.
- 경쟁 메뉴에 전략실 추천 경쟁사 포커스 스트립 추가.
- 추천 대상 카드에 `strategy-focus` 강조 스타일 적용.
- 추천 대상이 목록에 있을 경우 첫 위치로 정렬.
- `?scenario=annual-strategy&menu=products`처럼 QA URL에서 초기 메뉴를 덮어쓸 수 있게 했다.

## 하네스 관점 리뷰

- UX Agent: 추천 버튼을 누른 뒤 메뉴 안에서 무엇을 봐야 하는지 놓치지 않는다.
- Game Designer Agent: 연간 지시 선택이 실제 다음 행동으로 이어지는 감각이 강해졌다.
- Systems Architect Agent: UI별 계산을 직접 흩뿌리지 않고 전략실 읽기 모델을 재사용했다.
- Solo Dev Scope Agent: 별도 라우팅 상태 저장 없이 현재 게임 상태에서 추천을 재계산해 구현 범위를 줄였다.

## 검증

- `npm test -- src/game/annual-strategy-advisor.test.ts src/game/qa-scenarios.test.ts`: 통과, 26 tests.
- `npm run harness:gate`: 통과, 156 tests, 데이터 검증 통과, 프로덕션 빌드 통과.
- Headless Chrome screenshot QA: `http://127.0.0.1:5178/?scenario=annual-strategy&menu=products` 1366x768에서 제품 메뉴 전략실 포커스 표시 확인.

## 다음 액션

1. 연구/경쟁 메뉴 스크린샷 QA도 묶어서 추가한다.
2. 추천에 리스크와 대안 후보를 추가한다.
3. 120개월 장기 캠페인 하네스에서 전략실 추천이 실제로 유효한지 기록한다.
