# Alpha v0.15.1 QA 보고서

작성일: 2026-05-16

## 범위

이번 QA는 연간 전략실 추천이 메뉴 이동 액션으로 만들어지는지 확인한다.

## 자동 검증

| 항목 | 결과 |
|---|---|
| 제품 추천 액션이 `products` 메뉴와 추천 제품 ID를 제공 | 통과 |
| 연구 추천 액션이 `research` 메뉴와 추천 연구 ID를 제공 | 통과 |
| 경쟁 대응 액션이 `competition` 메뉴와 추천 경쟁사 ID를 제공 | 통과 |
| 연간 전략실 QA 시나리오 유지 | 통과 |
| 브라우저 화면에서 전략실 액션 버튼 3종 표시 | 통과 |

## 실행 명령

- `npm test -- src/game/annual-strategy-advisor.test.ts src/game/qa-scenarios.test.ts`: 통과, 23 tests.
- `npm run harness:gate`: 통과, 153 tests, 데이터 검증 통과, 프로덕션 빌드 통과.
- Headless Chrome screenshot QA: `http://127.0.0.1:5178/?scenario=annual-strategy` 1366x768 렌더링 확인.

## 이슈

- P0/P1 없음.
- P2: 메뉴 이동 후 추천 대상 자체를 상단 고정하거나 강조하는 기능은 다음 버전에 남긴다.

## 결론

v0.15.1은 자동 테스트와 브라우저 스크린샷 기준으로 전략실 추천 액션 생성을 검증했다. 다음 단계는 메뉴 이동 후 추천 대상 자체를 상단에 고정하거나 강조하는 것이다.
