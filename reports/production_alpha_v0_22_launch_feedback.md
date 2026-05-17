# v0.22-alpha 제작 보고서 — 출시 체감과 카드 영향 피드백

작성일: 2026-05-17

## 목표

20인 페르소나 보고서에서 반복적으로 나온 지적은 “첫 5분 보상이 조용하다”와 “카드가 실제 결과를 바꿨는지 체감이 약하다”였다. v0.22는 이 두 지점을 직접 겨냥했다.

## 구현

- `getReleaseImpactSummary()`를 추가했다.
- 출시 결과 탭 안에 `launch-impact-panel`을 추가했다.
- 첫 출시 여부, 카드 보상 수, 카드 영향 여부를 배지로 보여준다.
- 최근 사용 카드 중 개발 진행, 완성도, 퍼즐 점수, 신뢰, 화제성 등에 영향을 준 카드를 출시 결과에 표시한다.
- `?scenario=launch-impact` QA 시나리오를 추가했다.
- 시즌 과제 보상/압박을 검토하는 `evaluateSeasonChallengeBalance()`를 추가했다.

## 플레이 체감

이제 첫 제품을 출시하면 단순히 등급과 점수만 보이는 것이 아니라 다음을 함께 본다.

- 첫 5분 보상 배지
- 카드 보상 3장 배지
- 카드 영향 배지
- 화제성, 신뢰, 이용자 기대치
- 어떤 카드가 완성도나 개발 진행에 기여했는지
- 다음 행동: 보상 카드 선택과 성장 분기 확정

## 하네스 에이전트 판단

- Game Designer Agent: 카드가 제품 결과에 연결되는 피드백이 생겨 덱빌딩과 타이쿤 루프가 더 잘 붙었다.
- UX Agent: 결과 탭 안에 배치되어 화면을 크게 덮지 않는다.
- Retention / LTV Agent: 첫 출시 후 다음 행동이 더 명확해졌다.
- Balance Agent: 출시 보상 연출은 강화했지만 자원 보상 자체는 크게 올리지 않았다.
- Solo Dev Scope Agent: 저장 구조 변경 없이 계산 모듈과 UI만 추가해 유지 부담이 낮다.

## 검증

- `npm test -- src/game/release-impact.test.ts src/game/qa-scenarios.test.ts src/ui/layout-contract.test.ts src/game/run-simulator.test.ts` 통과
- `npm test -- src/game/release-impact.test.ts src/game/shareable-moments.test.ts src/game/qa-scenarios.test.ts src/ui/layout-contract.test.ts src/game/run-simulator.test.ts` 통과
- `npm run harness:gate` 통과
- Headless Chrome screenshot QA: `http://127.0.0.1:5180/?scenario=launch-impact`에서 출시 체감 패널 렌더링 확인
