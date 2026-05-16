# Alpha v0.15.2 QA 보고서

작성일: 2026-05-17

## 범위

이번 QA는 연간 전략실 추천이 제품, 연구, 경쟁 메뉴에서 상단 포커스와 카드 강조로 다시 표시되는지 확인한다.

## 자동 검증

| 항목 | 결과 |
|---|---|
| 제품 메뉴 포커스가 추천 제품 ID를 제공 | 통과 |
| 연구 메뉴 포커스가 추천 연구 ID를 제공 | 통과 |
| 경쟁 메뉴 포커스가 추천 경쟁사 ID를 제공 | 통과 |
| 추천 대상이 목록 첫 위치로 정렬 | 통과 |
| QA URL `menu` 파라미터가 초기 메뉴를 덮어씀 | 통과 |
| 브라우저 제품 메뉴에 전략실 포커스 표시 | 통과 |

## 실행 명령

- `npm test -- src/game/annual-strategy-advisor.test.ts src/game/qa-scenarios.test.ts`: 통과, 26 tests.
- `npm run harness:gate`: 통과, 156 tests, 데이터 검증 통과, 프로덕션 빌드 통과.
- Headless Chrome screenshot QA: `http://127.0.0.1:5178/?scenario=annual-strategy&menu=products` 1366x768 렌더링 확인.

## 이슈

- P0/P1 없음.
- P2: 브라우저 스크린샷은 제품 메뉴 중심으로 먼저 확인했고, 연구/경쟁 메뉴는 다음 QA 세트에서 묶어 확인한다.

## 결론

v0.15.2는 자동 테스트와 제품 메뉴 브라우저 스크린샷 기준으로 전략실 추천의 메뉴별 포커스 모델을 검증했다.
