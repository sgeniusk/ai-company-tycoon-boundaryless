# v0.56 첫 팀원 빠른 고용 QA

Status: 구현 완료 / 실제 블라인드 검증 대기

## 목적

초기 플레이어가 첫 화면에서 `에이전트` 메뉴를 찾아 들어가는 시간을 줄이고, 첫 제품 개발 화면까지 더 빠르게 도달하게 한다.

## 변경 요약

- 초기 상태에서 `getFirstHireRecommendation()`이 `프롬프트 설계가`를 추천 첫 팀원으로 계산한다.
- 가이드 카드의 메인 버튼이 초기 상태에서는 `첫 팀원 바로 고용`으로 바뀐다.
- 같은 가이드 카드 안에 `first-hire-fast-start` 패널을 추가해 추천 팀원, 추천 이유, 품질/위험, 영입 비용을 보여준다.
- 버튼을 누르면 `hireAgentViaChannel(..., "open_recruiting")`으로 즉시 고용하고 `products` 메뉴로 이동한다.
- 한 명이라도 고용되면 추천 빠른 고용 패널은 사라진다.

## 확인 결과

- `?scenario=fresh` 데스크톱 1366x768 headless Chrome 스크린샷에서 `첫 팀원 바로 고용` 메인 버튼과 `추천 첫 팀원: 프롬프트 설계가` 패널이 첫 화면에 보임.
- 첫 화면 설명 텍스트가 버튼에 눌려 세로로 깨지는 문제를 확인했고, 가이드 버튼을 전체 폭으로 내려 재검수했다.

## 검증

- `npm test -- src/game/simulation.test.ts`: 통과, 32 tests
- `npm test -- src/ui/layout-contract.test.ts`: 통과, 44 tests
- `npm test -- src/game/simulation.test.ts src/ui/layout-contract.test.ts`: 통과, 2 files / 76 tests
- `npm run build`: 통과, TypeScript와 Vite production build 성공
- `npm run harness:gate`: 통과, 43 files / 368 tests, 데이터 검증 통과, production build 통과
- `npm test -- src/game/blind-playtest-records.test.ts`: 통과, 1 file / 26 tests
- `npm run qa:blind-readiness`: Ready to send yes, Sessions untouched yes, Real sessions 0/5, Art gate `대기`
- `npm run qa:asset-handoff`: final art intake `대기`, Send status `AGY 발송 금지`
- Headless Chrome desktop capture: `/private/tmp/ai-company-v056-first-hire-fast-start-v5.png`

## 남은 검증

- 실제 5명 블라인드 테스트에서 첫 3분 안에 첫 제품 개발로 도달하는지 확인해야 한다.
- 이 변경은 최종 그래픽 에셋 투입 게이트를 열지 않는다. 실제 세션은 여전히 0/5다.
