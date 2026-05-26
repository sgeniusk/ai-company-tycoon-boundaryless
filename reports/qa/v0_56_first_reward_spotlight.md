# v0.56 플레이테스트 슬라이스 QA — 첫 보상 선택 스포트라이트

작성일: 2026-05-21

## 범위

- `reward` QA 시나리오에서 첫 출시 이후 카드 보상 선택이 명확한 선택 순간으로 보이는지 검수한다.
- 실제 블라인드 테스트 결과를 대체하지 않고, 덱 패널에서 3장 중 1장을 고르는 흐름이 보이는지만 확인한다.

## 변경 요약

- 덱 패널에 `first-reward-spotlight`를 추가했다.
- 첫 카드 보상이 대기 중이고 아직 보상 선택 기록이 없을 때 `첫 출시 보상 도착` 스포트라이트가 보인다.
- 스포트라이트는 제품명, `3장 중 1장`, 덱 추가, 성장 분기 확인으로 이어지는 3단계 흐름을 보여준다.
- 기존 카드 보상 로직은 유지하고, UI 안내만 강화했다.

## 검증

- `npm test -- src/ui/layout-contract.test.ts`
  - 결과: 통과
  - 요약: 1개 테스트 파일 / 34개 테스트 통과
- `npm test -- src/ui/layout-contract.test.ts src/game/qa-scenarios.test.ts src/game/blind-playtest-records.test.ts`
  - 결과: 통과
  - 요약: 3개 테스트 파일 / 73개 테스트 통과
- Headless Chrome desktop capture
  - URL: `http://127.0.0.1:5201/?scenario=reward`
  - 결과: 통과
  - 산출물: `/tmp/ai-company-v056-first-reward-spotlight.png`
- `npm run harness:gate`
  - 결과: 통과
  - 요약: 41개 테스트 파일 / 318개 테스트 통과, 데이터 검증 통과, production build 통과

## 남은 리스크

- 실제 플레이어가 출시 결과의 `보상 카드 선택` 리본에서 덱 패널로 이동한 뒤, 이 스포트라이트를 따라 자연스럽게 보상 카드를 고르는지는 블라인드 테스트로 확인해야 한다.
