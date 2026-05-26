# v0.56 Year-Two Kickoff QA

작성일: 2026-05-21

## 목적

1년차 연간 심사 이후 선택한 운영 지시가 다음 달에 실제 월간 보너스로 적용됐음을 플레이어가 이해하는지 검증한다.

## 대상

- URL: `http://127.0.0.1:5201/?scenario=year-two-plan`
- 주요 UI: `year-two-kickoff`
- 상태: 2년차 1월, `신뢰 복리 프로그램` 지시 적용 중, 지난 달 전략 효과에 신뢰/자금 보너스 포함

## 기대 동작

- 회사 패널 상단에 `2년차 운영 시작` 카드가 보인다.
- 카드는 `이번 달 보너스`, `연간 지시 효과`, `추천 메뉴`를 보여준다.
- `추천 메뉴 열기`와 `한 달 더 운영` 버튼으로 다음 행동이 이어진다.
- 12개월차의 `다음 해 지시 선택 완료` 리본과 13개월차의 `2년차 운영 시작` 카드는 서로 겹치지 않는다.
- 블라인드 플레이테스트 기록지는 2년차 운영 시작 카드 인지 여부와 이번 달 보너스 이해 여부를 기록한다.

## 검증

- `npm test -- src/game/qa-scenarios.test.ts`
  - 결과: 통과
  - 출력: 1 test file / 41 tests passed
- `npm test -- src/ui/layout-contract.test.ts src/game/qa-scenarios.test.ts`
  - 결과: 통과
  - 출력: 2 test files / 79 tests passed
- `npm test -- src/game/blind-playtest-records.test.ts src/game/qa-scenarios.test.ts src/ui/layout-contract.test.ts`
  - 결과: 통과
  - 출력: 3 test files / 81 tests passed
- `npm run harness:gate`
  - 결과: 통과
  - 출력: 41 test files / 326 tests passed, data validation passed, production build passed
- Headless Chrome desktop capture
  - 결과: 통과
  - 산출물: `/tmp/ai-company-v056-year-two-kickoff.png`
- Headless Chrome mobile capture
  - 결과: 통과
  - 산출물: `/tmp/ai-company-v056-year-two-kickoff-mobile.png`

## 남은 리스크

- 실제 플레이어가 `이번 달 보너스`를 숫자 보상으로 이해하는지는 아직 블라인드 테스트 전이다.
- 모바일 첫 화면에서는 회사 패널까지 스크롤해야 하므로, 실제 터치 흐름에서 `2년차 운영 시작` 카드까지 자연스럽게 도달하는지 확인해야 한다.
