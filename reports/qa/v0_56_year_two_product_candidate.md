# v0.56 Year-Two Product Candidate QA

작성일: 2026-05-21

## 목적

연간 지시 추천 연구를 완료한 뒤 보상이 연구 패널에서 끝나지 않고 제품 메뉴의 다음 후보와 필요한 연구 경로로 이어지는지 확인한다.

## 대상 URL

- `http://127.0.0.1:5201/?scenario=year-two-product-candidate`

## 기대 동작

- 제품 메뉴 상단에 `연구가 연 제품 후보` 런치패드가 보인다.
- 런치패드는 해금 시장, 다음 제품 후보, 예상 결과를 한 화면에서 보여준다.
- 현재 후보가 아직 잠겨 있으면 부족한 조건을 `필요 조건`으로 보여준다.
- 부족한 조건이 있을 때 `필요 연구 보기` 버튼이 연구 메뉴로 돌아가는 다음 행동으로 보인다.
- 연구 메뉴로 돌아오면 `제품 후보 필요 연구` 카드가 정확한 부족 연구, 현재/필요 레벨, `바로 연구` 버튼을 보여준다.
- 데스크톱 1366x768 화면에서 제품 후보 런치패드가 첫 제품 패널 상단에 보인다.
- 모바일 390x844 화면에서는 제품 패널이 아래로 이어지되 런치패드 내부 그리드와 액션은 1열로 접힌다.

## 검증

- `npm test -- src/game/qa-scenarios.test.ts src/ui/layout-contract.test.ts`
  - 결과: 통과
  - 요약: 2개 테스트 파일 / 85개 테스트 통과
- `npm run build`
  - 결과: 통과
  - 요약: TypeScript와 Vite production build 통과
- `npm test -- src/ui/layout-contract.test.ts src/game/qa-scenarios.test.ts`
  - 결과: 통과
  - 요약: 2개 테스트 파일 / 94개 테스트 통과
- `npm test -- src/ui/layout-contract.test.ts src/game/qa-scenarios.test.ts src/game/blind-playtest-records.test.ts`
  - 결과: 통과
  - 요약: 3개 테스트 파일 / 120개 테스트 통과
- `npm run harness:gate`
  - 결과: 통과
  - 요약: 43개 테스트 파일 / 380개 테스트 통과, 데이터 검증 통과, production build 통과
- `npm run qa:asset-handoff`
  - 결과: 통과
  - 요약: final art intake `대기`, Send status `AGY 발송 금지`
- `npm run harness:gate`
  - 결과: 통과
  - 요약: 41개 테스트 파일 / 333개 테스트 통과, 데이터 검증 통과, production build 통과
- `curl -I 'http://127.0.0.1:5201/?scenario=year-two-product-candidate'`
  - 결과: 통과
  - 요약: 200 OK
- Headless Chrome desktop capture
  - 결과: 통과
  - 산출물: `/tmp/ai-company-v056-year-two-product-candidate.png`
- Headless Chrome mobile capture
  - 결과: 통과
  - 산출물: `/tmp/ai-company-v056-year-two-product-candidate-mobile.png`
- Headless Chrome needed-research capture
  - 결과: 통과
  - 산출물: `/private/tmp/ai-company-v056-product-candidate-needed-research.png`, `/private/tmp/ai-company-v056-product-candidate-needed-research-mobile.png`

## 남은 확인

- 실제 블라인드 테스트에서 `필요 연구 보기`와 `바로 연구`가 막힌 상태가 아니라 다음 목표로 읽히는지 확인한다.
