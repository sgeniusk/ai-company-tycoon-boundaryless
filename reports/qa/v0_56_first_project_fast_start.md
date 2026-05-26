# v0.56 첫 제품 빠른 개발 QA

Status: 구현 완료 / 실제 블라인드 검증 대기

## 목적

첫 팀원을 고용한 뒤 플레이어가 다시 메뉴를 해석하지 않아도 첫 제품 개발을 바로 시작하게 만든다. 첫 3분 목표는 `첫 팀원 바로 고용` 다음에 `첫 제품 바로 개발`까지 이어지는 것이다.

## 변경 요약

- `getFirstProjectRecommendation()`을 추가해 고용은 되었지만 프로젝트/출시 제품이 없는 상태에서 추천 첫 제품을 계산한다.
- 추천 제품은 우선 `AI 글쓰기 비서`이며, 자동 투입 팀과 예상 개발 기간/리뷰/팀 규모를 함께 계산한다.
- 가이드 카드의 메인 버튼이 고용 후에는 `첫 제품 바로 개발`로 바뀐다.
- 가이드 카드 안에 `first-project-fast-start` 패널을 추가해 추천 첫 제품과 예상 결과를 보여준다.
- 버튼을 누르면 `startProductProject()`로 프로젝트를 만들고 `deck` 메뉴로 이동해 첫 개발 이슈/카드 체감 단계로 바로 이어진다.

## 확인 결과

- `?scenario=staffing` 데스크톱 1366x768 headless Chrome 스크린샷에서 `첫 제품 바로 개발` 메인 버튼과 `첫 제품 러시` 패널이 첫 화면에 보임.
- 제품 메뉴의 기존 `first-project-launchpad`도 유지되어, 가이드 버튼과 제품 패널 버튼 중 어느 쪽으로도 첫 제품 개발을 시작할 수 있음.

## 검증

- `npm test -- src/game/simulation.test.ts`: 통과, 33 tests
- `npm test -- src/ui/layout-contract.test.ts`: 통과, 45 tests
- `npm test -- src/game/simulation.test.ts src/ui/layout-contract.test.ts src/game/blind-playtest-records.test.ts`: 통과, 3 files / 104 tests
- `npm run build`: 통과, TypeScript와 Vite production build 성공
- `npm run harness:gate`: 통과, 43 files / 370 tests, 데이터 검증 통과, production build 통과
- `npm run qa:asset-handoff`: final art intake `대기`, Send status `AGY 발송 금지`
- Headless Chrome desktop capture: `/private/tmp/ai-company-v056-first-project-fast-start.png`

## 남은 검증

- 실제 5명 블라인드 테스트에서 첫 팀원 고용 후 `첫 제품 바로 개발`을 누르는지 확인해야 한다.
- 이 변경은 최종 그래픽 에셋 투입 게이트를 열지 않는다. 실제 세션은 여전히 0/5다.
