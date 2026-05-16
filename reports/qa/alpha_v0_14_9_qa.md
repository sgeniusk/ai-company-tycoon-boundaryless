# Alpha v0.14.9 QA 보고서

작성일: 2026-05-16

## 범위

이번 QA는 보상 카드별 `지시 보너스` 배지가 활성 연간 지시의 보상 편향 태그와 맞게 표시되는지 확인한다.

## 자동 검증

| 항목 | 결과 |
|---|---|
| `상호운용 방어막`이 신뢰/안전/기업 태그와 매칭 | 통과 |
| `프롬프트 스프린트`처럼 매칭 없는 카드는 undefined 반환 | 통과 |
| 보상 편향 QA 시나리오 유지 | 통과 |
| 브라우저 보상 카드에 `지시 보너스` 배지 표시 | 통과 |

## 실행 명령

- `npm test -- src/game/deckbuilding.test.ts`: 통과, 14 tests.
- `npm test -- src/game/deckbuilding.test.ts src/game/qa-scenarios.test.ts`: 통과, 34 tests.
- `npm run harness:gate`: 통과, 150 tests, 데이터 검증 통과, 프로덕션 빌드 통과.
- Headless Chrome screenshot QA: `http://127.0.0.1:5178/?scenario=reward-bias` 1366x768 렌더링 확인.

## 이슈

- P0/P1 없음.
- P2: 보상 카드 배지는 표시되지만, 장기적으로 어떤 지시가 어떤 카드 풀을 자주 만드는지 통계는 아직 없다.

## 결론

v0.14.9는 자동 테스트와 브라우저 스크린샷 기준으로 카드별 지시 보너스 표시를 검증했다. 플레이어가 연간 지시의 카드 보상 편향을 카드 단위로 읽을 수 있다.
