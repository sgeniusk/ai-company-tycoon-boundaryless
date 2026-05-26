# v0.56 Annual Directive Confirmation QA

작성일: 2026-05-21

## 목적

첫해 연간 심사를 통과한 뒤 플레이어가 다음 해 운영 지시를 선택했음을 즉시 이해하는지 검증한다.

## 대상

- URL: `http://127.0.0.1:5201/?scenario=annual-directed`
- 주요 UI: `annual-directive-confirmation`
- 상태: 1년차 12월, 연간 심사 통과, `신뢰 복리 프로그램` 지시 선택 완료

## 기대 동작

- 회사 패널 상단에 `다음 해 지시 선택 완료` 리본이 보인다.
- 리본은 선택한 지시명, 월간 보너스, 추천 메뉴, 적용 기간을 보여준다.
- 리본은 `추천 메뉴 열기`와 `2년차 시작` 버튼을 제공해 심사 이후 행동을 바로 이어준다.
- 튜토리얼 도움말 모달이 확인 리본을 가리지 않는다.
- 모바일 520px 이하에서는 리본 항목이 1열로 접힌다.
- 블라인드 플레이테스트 기록지는 선택한 연간 지시와 월간 보너스/추천 메뉴 이해 여부를 기록한다.
- 블라인드 플레이테스트 기록지는 `추천 메뉴 열기` 버튼 클릭 여부와 연간 지시 후 누른 다음 행동을 기록한다.

## 검증

- `npm test -- src/game/qa-scenarios.test.ts src/ui/layout-contract.test.ts`
  - 결과: 통과
  - 출력: 2 test files / 77 tests passed
- `npm test -- src/game/blind-playtest-records.test.ts`
  - 결과: 통과
  - 출력: 1 test file / 2 tests passed
- `npm test -- src/game/qa-scenarios.test.ts src/ui/layout-contract.test.ts src/game/blind-playtest-records.test.ts`
  - 결과: 통과
  - 출력: 3 test files / 79 tests passed
- `npm test -- src/ui/layout-contract.test.ts src/game/blind-playtest-records.test.ts`
  - 결과: 통과
  - 출력: 2 test files / 39 tests passed
- `npm run harness:gate`
  - 결과: 통과
  - 출력: 41 test files / 324 tests passed, data validation passed, production build passed
- `npm test -- src/game/qa-scenarios.test.ts src/ui/layout-contract.test.ts src/game/blind-playtest-records.test.ts`
  - 결과: 재통과
  - 출력: 3 test files / 79 tests passed
- `npm test -- src/ui/layout-contract.test.ts src/game/blind-playtest-records.test.ts src/game/qa-scenarios.test.ts`
  - 결과: 통과
  - 출력: 3 test files / 119 tests passed
- `npm run build`
  - 결과: 통과
  - 출력: TypeScript와 Vite production build 성공
- `npm run harness:gate`
  - 결과: 재통과
  - 출력: 41 test files / 324 tests passed, data validation passed, production build passed
- Headless Chrome desktop capture
  - 결과: 통과
  - 산출물: `/tmp/ai-company-v056-annual-directive-confirmation-v2.png`, `/tmp/ai-company-v056-annual-directive-actions.png`, `/private/tmp/ai-company-v056-annual-directed-year-two-start.png`
- Headless Chrome mobile capture
  - 결과: 통과
  - 산출물: `/tmp/ai-company-v056-annual-directive-confirmation-mobile.png`, `/tmp/ai-company-v056-annual-directive-actions-mobile.png`, `/tmp/ai-company-v056-annual-directive-actions-mobile-tall.png`

## 남은 리스크

- 실제 플레이어가 연간 심사에서 다음 해 지시 선택까지 설명 없이 이어지는지는 아직 블라인드 테스트 전이다.
- 모바일에서는 회사 패널 자체가 아래쪽에 위치하므로 실제 터치 흐름에서 확인 리본까지 스크롤이 자연스러운지 봐야 한다.
