# v0.56 Growth Choice Confirmation QA

작성일: 2026-05-21

## 목적

첫 출시 이후 성장 분기를 고른 순간이 명확히 보이고, 다음 달부터 월간 보너스와 연간 심사 방향으로 이어지는지 확인한다.

## 변경 요약

- `?scenario=growth-picked` QA 경로를 추가했다.
- 출시 결과 패널 상단에 `growth-choice-confirmation` 리본을 추가했다.
- 보상 카드 선택 완료 상태에서 `productivity_line` 성장 분기를 선택한 상태를 고정한다.
- 선택 완료 리본은 출시 제목 바로 아래에 배치해 캡처 첫 화면에서도 보이게 했다.
- 모바일 520px 이하에서는 확인 리본의 3단계 안내가 1열로 접힌다.

## 확인 포인트

- 상단 QA pill이 `성장 분기 선택 완료 QA`로 표시된다.
- 출시 결과 패널에 `성장 분기 선택 완료`가 보인다.
- 선택한 성장 분기 이름과 `다음 달부터 월간 보너스` 문구가 보인다.
- 다음 목표로 `연간 심사까지` 이어지는 안내가 보인다.

## 검증

- `npm test -- src/game/qa-scenarios.test.ts src/ui/layout-contract.test.ts`
  - Result: Passed
  - Output: 2 files / 75 tests passed
- `curl -I 'http://127.0.0.1:5201/?scenario=growth-picked'`
  - Result: Passed
  - Output: 200 OK
- Headless Chrome desktop capture
  - Result: Passed
  - URL: `http://127.0.0.1:5201/?scenario=growth-picked`
  - Output: `/tmp/ai-company-v056-growth-choice-confirmation-v3.png`
- `npm run harness:gate`
  - Result: Passed
  - Output: 41 files / 322 tests passed, data validation passed, production build passed
