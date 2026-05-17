# Alpha v0.4.1 QA — 인력 조합 시너지

작성일: 2026-05-17

## 검증 명령

- `npm test -- src/game/simulation.test.ts`
- `npm test -- src/game/simulation.test.ts src/game/content-foundation.test.ts src/game/qa-scenarios.test.ts`
- `npm run validate:data`
- `npm run build`
- Headless Chrome screenshot: `http://127.0.0.1:5178/?scenario=staffing&menu=agents`

## 결과

- 시뮬레이션 테스트: 통과, 28 tests.
- 관련 회귀 테스트: 통과, 56 tests.
- 데이터 검증: 통과.
- 프로덕션 빌드: 통과.
- 브라우저 렌더링: 통과. 에이전트 화면에서 `팀 조합` 패널과 다음 후보 표시를 확인했다.

## 발견 이슈

- P0: 없음.
- P1: 없음.
- P2: 팀 조합 후보 진행 라벨의 내부 인력 키를 한국어 라벨로 바꾸면 이해도가 올라간다.
- P2: 로봇 조합은 후반 콘텐츠라 실제 플레이에서 노출 시점이 늦다. 향후 QA 시나리오에 로봇 조합 전용 상태를 추가하는 것이 좋다.

## 판정

0.4 인력 역할 차별화 1차 기능은 다음 개발로 넘어가도 된다.
