# v0.56 Reward Choice Confirmation QA

작성일: 2026-05-21

## 목적

첫 출시 보상 카드를 고른 직후 플레이어가 선택 결과를 놓치지 않고, 다음 목표가 성장 분기 선택이라는 것을 이해하는지 확인한다.

## 변경 요약

- `?scenario=reward-picked` QA 경로를 추가했다.
- 덱 패널에 `reward-choice-confirmation` 리본을 추가했다.
- 보상 선택 후 pending reward는 사라지고, 선택한 카드가 reward history와 discard pile에 반영된 상태로 고정된다.
- 모바일 520px 이하에서는 확인 리본의 3단계 안내가 1열로 접힌다.

## 확인 포인트

- 상단 QA pill이 `보상 선택 완료 QA`로 표시된다.
- 덱 패널이 `보상 선택 완료`를 보여준다.
- 선택한 카드 이름과 `덱에 들어갔습니다` 문구가 보인다.
- 다음 행동으로 `다음은 성장 분기`가 보인다.

## 검증

- `npm test -- src/game/qa-scenarios.test.ts src/ui/layout-contract.test.ts`
  - Result: Passed
  - Output: 2 files / 75 tests passed
- Headless Chrome desktop capture
  - Result: Passed
  - URL: `http://127.0.0.1:5201/?scenario=reward-picked`
  - Output: `/tmp/ai-company-v056-reward-choice-confirmation-v2.png`
- Headless Chrome mobile capture
  - Result: Passed
  - URL: `http://127.0.0.1:5201/?scenario=reward-picked`
  - Output: `/tmp/ai-company-v056-reward-choice-confirmation-mobile-v2.png`
- `npm run harness:gate`
  - Result: Passed
  - Output: 41 files / 322 tests passed, data validation passed, production build passed
