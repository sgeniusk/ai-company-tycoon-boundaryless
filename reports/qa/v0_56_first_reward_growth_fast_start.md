# v0.56 First Reward/Growth Fast-Start QA

Date: 2026-05-23

## Scope

첫 출시 이후 플레이어가 결과 탭이나 가이드에서 멈추지 않도록, 기존 보상 카드 선택과 성장 분기 선택 위에 빠른 선택 동선을 추가했다.

## Changes

- `getFirstRewardRecommendation()`이 첫 보상 대기 상태의 추천 카드와 선택 가능 여부를 계산한다.
- `getFirstGrowthRecommendation()`이 첫 보상 선택 직후 추천 성장 분기와 선택 가능 여부를 계산한다.
- 결과 탭과 가이드 카드에 `first-reward-fast-start`와 `first-growth-fast-start`를 노출한다.
- `첫 보상 바로 선택`은 기존 `chooseCardReward()`로 보상 카드를 덱에 넣는다.
- `성장 분기 바로 선택`은 기존 `chooseGrowthPath()`로 추천 성장 분기를 고르고 다음 행동 메뉴로 이동한다.
- `reward`, `reward-picked`, `growth-picked` QA 상태는 출시 이후 튜토리얼을 본 상태로 열어 첫 화면용 helper modal이 보상/성장 화면을 가리지 않는다.

## Verification

- `npm test -- src/game/simulation.test.ts` passed: 1 file / 37 tests.
- `npm test -- src/ui/layout-contract.test.ts` passed: 1 file / 48 tests.
- `npm test -- src/game/simulation.test.ts src/ui/layout-contract.test.ts src/game/guidance.test.ts src/game/deckbuilding.test.ts` passed: 4 files / 115 tests.
- `npm test -- src/game/qa-scenarios.test.ts src/game/simulation.test.ts src/ui/layout-contract.test.ts` passed: 3 files / 130 tests.
- `npm run build` passed: TypeScript and Vite production build succeeded.
- `npm run harness:gate` passed: 43 files / 378 tests, data validation, and production build succeeded.
- `npm run qa:asset-handoff` passed and kept final art intake `대기` with send status `AGY 발송 금지`.
- Headless Chrome captured `?scenario=reward` at `/private/tmp/ai-company-v056-first-reward-fast-start-no-modal.png`.
- Headless Chrome captured `?scenario=reward-picked` at `/private/tmp/ai-company-v056-first-growth-fast-start-no-modal.png`.

## Gate Notes

This does not unlock final graphic asset intake. The v0.56 blind-test and art gates still require five real completed sessions and P0/evidence clearance.
