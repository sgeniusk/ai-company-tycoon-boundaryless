# Alpha v0.14.8 제작 보고서 — 연간 지시 보상 편향 QA 시나리오

작성일: 2026-05-16

## 요약

v0.14.8은 v0.14.7의 보상 편향 표시를 브라우저에서 바로 검증할 수 있게 만든 QA 진입점 버전이다. `?scenario=reward-bias`를 열면 신뢰형 연간 지시가 활성화된 덱 보상 화면으로 진입한다.

## 구현 내용

- QA 시나리오 ID에 `reward-bias` 추가.
- 1년차 연간 심사 통과 후 `신뢰 복리 프로그램`을 선택한 상태 생성.
- 해당 상태에서 `AI 글쓰기 비서` 출시 보상 3택1을 생성.
- 덱 메뉴로 바로 열리도록 active menu 설정.
- URL 파싱에서 `?scenario=reward-bias` 지원.

## 검증

- `npm test -- src/game/qa-scenarios.test.ts`: 통과, 20 tests.
- `npm run harness:gate`: 통과, 149 tests, 데이터 검증 통과, 프로덕션 빌드 통과.
- Headless Chrome screenshot QA: `http://127.0.0.1:5178/?scenario=reward-bias`에서 1366x768 렌더링 확인.

## 다음 액션

1. `reward-bias` 시나리오를 브라우저 스크린샷으로 확인한다.
2. 보상 카드에 지시 태그 일치 배지를 추가한다.
3. 장기 시뮬레이션에 지시별 보상 카드 분포를 기록한다.
