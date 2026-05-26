# v0.56 Annual Review Fast-Forward QA

Date: 2026-05-23

## Scope

첫 10분 루프 완료 후 플레이어가 반복해서 `다음 달`을 누르지 않아도 1년차 연간 심사와 다음 해 지시 선택 상태까지 도달하게 했다.

## Changes

- `advanceToFirstAnnualReview()`가 첫 출시 이후 상태를 1년차 연간 심사까지 진행한다.
- `advance_annual_review` 가이드 액션은 `advanceMonth()` 대신 `advanceToFirstAnnualReview()`를 사용한다.
- 연간 심사 런웨이 가이드 버튼 문구를 `심사까지 진행`으로 바꿔 버튼의 실제 효과를 더 명확히 했다.
- `심사까지 진행` 후 우측 패널을 회사 메뉴로 자동 전환해 다음 해 지시 3택1을 바로 찾게 했다.
- 다음 해 지시 선택 완료 리본의 월 진행 버튼 문구를 `2년차 시작`으로 바꿨다.

## Verification

- `npm test -- src/game/simulation.test.ts` passed: 1 file / 38 tests.
- `npm test -- src/game/guidance.test.ts` passed: 1 file / 12 tests.
- `npm test -- src/ui/layout-contract.test.ts` passed: 1 file / 48 tests.
- `npm test -- src/game/blind-playtest-records.test.ts` passed: 1 file / 26 tests.
- `npm test -- src/ui/layout-contract.test.ts src/game/blind-playtest-records.test.ts src/game/qa-scenarios.test.ts` passed: 3 files / 119 tests.
- `npm test -- src/game/simulation.test.ts src/game/guidance.test.ts src/ui/layout-contract.test.ts src/game/qa-scenarios.test.ts` passed: 4 files / 143 tests.
- `npm run build` passed: TypeScript and Vite production build succeeded.
- `npm run harness:gate` passed: 43 files / 379 tests, data validation, and production build succeeded.
- `npm run qa:asset-handoff` passed and kept final art intake `대기` with send status `AGY 발송 금지`.
- Headless Chrome captured `?scenario=flow` at `/private/tmp/ai-company-v056-annual-review-fast-forward-flow.png`.
- Headless Chrome captured `?scenario=annual-directed` at `/private/tmp/ai-company-v056-annual-directed-year-two-start.png`.

## Gate Notes

This keeps v0.56 within the playtest-slice scope. It does not unlock final graphic asset intake; real blind sessions and P0/evidence gates still control that.
