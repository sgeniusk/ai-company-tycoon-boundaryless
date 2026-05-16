# Alpha v0.14.3 제작 보고서 — 연간 심사와 10년 캠페인 중간 목표

작성일: 2026-05-16

## 요약

v0.14.3은 10년 캠페인에 매년 도달할 목표를 넣은 버전이다. 플레이어는 시골 차고에서 시작해 제품, 이용자, 신뢰, 자동화, 산업 확장 조건을 매년 심사받고, 통과하면 보상을 받아 다음 해의 성장 동력을 얻는다.

## 구현 내용

- `annual_reviews.json` 추가.
- 1년차 지역 AI 데모데이부터 10년차 최종 세계 엑스포까지 10개 심사 정의.
- 연간 심사 현재 목표, 진행도, 달성률, 카운트다운 계산.
- 월 진행 중 심사 월에 자동으로 통과/미달 결과 적용.
- 통과 보상과 위로 보상 적용.
- `annualReviewHistory` 저장 필드와 레거시 저장 복구.
- 회사 화면의 `연간 심사` 카드.
- 데이터 검증 하네스의 연간 심사 검사.
- `?scenario=review` QA 시나리오.

## 하네스 관점

- Executive Producer: 120개월 캠페인의 중간 목표가 생겨 엔딩까지 가는 이유가 선명해졌다.
- Game Designer: 매년 요구 조건이 제품, 이용자, 신뢰, 산업 확장으로 바뀌어 장기 전략 압박을 만든다.
- Systems Architect: 목표와 보상은 JSON에 두고, 계산은 `annual-review` 순수 모듈로 분리했다.
- QA Agent: 저장 복구, 월 진행 자동 적용, QA URL 진입을 테스트했다.
- Balance Agent: 미달해도 위로 보상이 있어 실패 런의 회복 경로가 유지된다.
- Retention / LTV Agent: 다음 해 목표가 보이므로 플레이어가 장기 목표를 잡기 쉽다.

## 검증

- `npm test -- src/game/annual-review.test.ts src/game/qa-scenarios.test.ts src/game/save-integrity.test.ts`: 통과, 29 tests.
- `npm run harness:gate`: 통과, 139 tests, 데이터 검증 통과, 프로덕션 빌드 통과.
- Headless Chrome screenshot QA: `http://127.0.0.1:5173/?scenario=review`에서 1366x768 렌더링 확인.

## 배포 정책

이번 버전은 기반 증분이므로 Vercel 배포는 하지 않는다. 큰 버전업 때만 공개 배포한다.

## 다음 액션

1. 연간 심사 결과를 회사 승급, 지역 대회, 경쟁사 반응과 연결한다.
2. 연간 심사 통과 보상이 카드 보상이나 메타 통찰 후보를 열도록 확장한다.
3. 2년차 이후 QA 시나리오를 추가해 장기 캠페인 균형을 더 자주 검증한다.
