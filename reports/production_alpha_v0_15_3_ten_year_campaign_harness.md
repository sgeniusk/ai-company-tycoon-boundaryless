# Alpha v0.15.3 제작 보고서 — 10년 캠페인 압축 플레이 하네스

작성일: 2026-05-17

## 요약

v0.15.3은 10년 캠페인을 자동으로 끝까지 굴리고 결과를 요약하는 장기 하네스를 추가한 버전이다. 이제 120개월 진행, 연간 심사, 운영 지시 선택, 회사 승급, 제품 확장, 엔딩 결과를 한 번에 검증할 수 있다.

## 구현 내용

- `runTenYearCampaignSimulation` 추가.
- 10년 캠페인 `yearlySnapshots` 기록.
- 연간 심사 수, 통과 수, 운영 지시 선택 수 기록.
- 승급, 제품 확장, 산업 해금, 지역 이전, 엔딩 마일스톤 기록.
- `?scenario=ten-year-sim` QA 시나리오 추가.

## 하네스 관점 리뷰

- Executive Producer Agent: 이제 10년 엔딩까지의 진행 상태를 자동으로 확인할 수 있다.
- Balance Simulation Engineer: 연간 심사 통과율과 제품 확장 도달 시점을 장기 밸런스 자료로 쓸 수 있다.
- QA Agent: 120개월 진행 후 상태 무결성 검사를 실행할 수 있다.
- Retention / LTV Agent: 장기 목표가 실제로 엔딩까지 이어지는지 관측하는 기반이 생겼다.
- Solo Dev Scope Agent: 장기 밸런스 전체 해결이 아니라 관측 하네스부터 구축해 범위를 통제했다.

## 검증

- `npm test -- src/game/run-simulator.test.ts`: 통과, 4 tests.
- `npm test -- src/game/run-simulator.test.ts src/game/qa-scenarios.test.ts`: 통과, 27 tests.
- `npm run harness:gate`: 통과, 158 tests, 데이터 검증 통과, 프로덕션 빌드 통과.
- Headless Chrome screenshot QA: `http://127.0.0.1:5178/?scenario=ten-year-sim` 1366x768에서 10년차 엔딩 화면 표시 확인.

## 다음 액션

1. 장기 하네스 결과를 별도 밸런스 리포트로 요약한다.
2. 전략별 10년 캠페인 결과를 비교한다.
3. 연간 심사 미달이 너무 잦거나 너무 적은지 밸런스 조정한다.
