# Alpha v0.15.3 QA 보고서

작성일: 2026-05-17

## 범위

이번 QA는 10년 캠페인을 압축 진행하는 장기 하네스와 브라우저 QA 진입점을 확인한다.

## 자동 검증

| 항목 | 결과 |
|---|---|
| 120개월 이상 진행 | 통과 |
| 최종 상태가 playing이 아님 | 통과 |
| 연간 스냅샷 10개 기록 | 통과 |
| 연간 심사 10회 이상 기록 | 통과 |
| 운영 지시 선택 5회 이상 기록 | 통과 |
| 승급/제품 확장 마일스톤 기록 | 통과 |
| 상태 무결성 검사 통과 | 통과 |
| `ten-year-sim` QA 시나리오 생성 | 통과 |
| 브라우저에서 10년차 엔딩 화면 표시 | 통과 |

## 실행 명령

- `npm test -- src/game/run-simulator.test.ts`: 통과, 4 tests.
- `npm test -- src/game/run-simulator.test.ts src/game/qa-scenarios.test.ts`: 통과, 27 tests.
- `npm run harness:gate`: 통과, 158 tests, 데이터 검증 통과, 프로덕션 빌드 통과.
- Headless Chrome screenshot QA: `http://127.0.0.1:5178/?scenario=ten-year-sim` 1366x768 렌더링 확인.

## 이슈

- P0/P1 없음.
- P2: 장기 하네스는 관측 목적이라, 아직 전략별 밸런스 리포트 파일을 자동 생성하지는 않는다.

## 결론

v0.15.3은 자동 테스트와 브라우저 스크린샷 기준으로 10년 캠페인 압축 진행과 QA 진입점을 검증했다.
