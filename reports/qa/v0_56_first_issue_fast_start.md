# v0.56 First Issue Fast-Start QA

Date: 2026-05-23

## Summary

첫 제품 개발을 시작한 뒤 가이드 패널에서 곧바로 `첫 이슈 바로 해결`을 누를 수 있게 했다. 이 액션은 추천 카드 `고객 인터뷰`를 먼저 사용하고, 추천 개발 이슈 4개를 해결해 카드 영향이 `이슈 해결 결과`에 남도록 만든다.

`출시까지 진행` 가이드 버튼도 한 달만 넘기지 않고 첫 제품이 출시될 때까지 짧게 진행하도록 바꿨다. 첫 3분의 `첫 팀원 바로 고용` → `첫 제품 바로 개발` 뒤에, 첫 10분 안의 카드/이슈/출시 루프가 더 직접적으로 이어진다.

## Changed

- `getFirstDevelopmentIssueRecommendation()` 추가
  - 첫 프로젝트가 있고 아직 개발 이슈 결과가 없을 때 추천 제품, 추천 카드, 추천 이슈 타일을 계산한다.
  - 초기 손패에서는 `고객 인터뷰`를 우선 추천해 카드 보정이 결과 리본에 남게 한다.
- 가이드 패널에 `first-issue-fast-start` 추가
  - 카드, 추천 이슈 수, 추천 이슈 이름을 보여준다.
  - `첫 이슈 바로 해결` 버튼은 추천 카드를 먼저 사용하고 `resolveDevelopmentPuzzle()`을 실행한다.
- `advanceToFirstLaunch()` 추가
  - `출시까지 진행` 가이드 액션이 첫 제품 출시 시점까지 최대 6개월만 진행한다.
  - 출시가 완료되면 기존 출시 결과, 보상 카드, 성장 분기 흐름을 그대로 사용한다.

## Verification

- `npm test -- src/game/simulation.test.ts`: passed, 1 file / 35 tests
- `npm test -- src/ui/layout-contract.test.ts`: passed, 1 file / 47 tests
- `npm test -- src/game/simulation.test.ts src/ui/layout-contract.test.ts src/game/guidance.test.ts src/game/deckbuilding.test.ts`: passed, 4 files / 112 tests
- `npm run build`: passed, TypeScript and Vite production build succeeded
- `npm run harness:gate`: passed, 43 files / 374 tests, data validation, and production build
- `npm run qa:asset-handoff`: passed, final art intake `대기`, send status `AGY 발송 금지`
- Headless Chrome captured `?scenario=project` at `/private/tmp/ai-company-v056-first-issue-fast-start.png`

## Gate Notes

This does not unblock final graphic asset intake. Real blind sessions remain required before `qa:asset-handoff` can report art request possible.
