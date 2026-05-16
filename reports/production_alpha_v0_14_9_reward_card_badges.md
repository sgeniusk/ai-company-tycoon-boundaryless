# Alpha v0.14.9 제작 보고서 — 보상 카드 지시 보너스 배지

작성일: 2026-05-16

## 요약

v0.14.9는 카드 보상 후보가 현재 연간 운영 지시와 왜 맞는지 카드 단위로 보여 주는 버전이다. 이제 `신뢰 복리 프로그램`이 활성화된 상태에서 `상호운용 방어막`, `세이프티 리뷰` 같은 카드가 보상 후보로 뜨면, 카드 안에 `지시 보너스` 배지가 붙는다.

## 구현 내용

- `getAnnualDirectiveRewardBiasMatch` 읽기 모델 추가.
- 카드 태그와 활성 연간 지시의 `rewardBiasTags` 교집합 계산.
- 일치 태그를 한글 라벨로 변환.
- 보상 카드에 `지시 보너스: ...` 배지 표시.
- 일치하지 않는 카드에는 배지를 표시하지 않는 테스트 추가.

## 하네스 관점 리뷰

- UX Agent: 보상 후보의 이유가 카드 단위로 보여 선택 이해도가 올라갔다.
- Deck System Engineer: 덱 보상 편향이 단순 숨은 점수에서 명시적 카드 피드백으로 전환됐다.
- Retention / LTV Agent: 연간 지시 선택이 다음 보상 카드에 영향을 줬다는 즉시 피드백이 생겼다.
- Solo Dev Scope Agent: 보상 카드 컴포넌트 안의 작은 배지로 해결해 새 화면이나 복잡한 튜토리얼을 만들지 않았다.

## 검증

- `npm test -- src/game/deckbuilding.test.ts`: 통과, 14 tests.
- `npm test -- src/game/deckbuilding.test.ts src/game/qa-scenarios.test.ts`: 통과, 34 tests.
- `npm run harness:gate`: 통과, 150 tests, 데이터 검증 통과, 프로덕션 빌드 통과.
- Headless Chrome screenshot QA: `http://127.0.0.1:5178/?scenario=reward-bias` 1366x768에서 보상 카드 `지시 보너스` 배지 확인.

## 다음 액션

1. 장기 시뮬레이션에 카드 보상 태그 분포를 기록한다.
2. 연간 지시 태그가 연구 추천과 경쟁 대응 추천에도 영향을 주도록 확장한다.
3. 보상 후보가 왜 정렬됐는지 디버그 패널에 간단히 노출한다.
