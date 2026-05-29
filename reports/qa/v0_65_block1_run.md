# v0.65 block #1 QA - difficulty challenge foundation

작성일: 2026-05-30

## 범위

- 블록: `v0.65-alpha-difficulty-challenge` #1
- 목표: 플레이어 선택 도전 티어의 데이터/상태/세이브 마이그레이션/월간 역풍 기반 추가
- 제약: 보상 배수 적용과 선택 UI는 #2로 보류. `campaign_shocks`, `world_events`, 기존 run-modifier `tag_effects`는 변경하지 않음.

## 구현 요약

- `data/difficulty_tiers.json`: `story`, `standard`, `hard`, `brutal` 4티어 추가.
- `standard`: `monthly_headwind: {}`, `reward_multiplier: 1`로 기존 동작 무보정.
- `hard`: `monthly_headwind: { cash: -60, hype: -1 }`, `reward_multiplier: 1.5`.
- `brutal`: `monthly_headwind: { cash: -140, trust: -1, hype: -1 }`, `reward_multiplier: 2`.
- `RunModifiersState.challengeTier` 기본값은 `standard`; `RunModifierSelectionInput.challengeTierId?`로 명시 선택 가능.
- `sanitizeRunModifiersState`가 누락/알 수 없는 티어를 `standard`로 마이그레이션.
- `?scenario=difficulty-hard`는 하드 티어 상태를 회사 패널에서 연다.

## Tick 변경

`src/game/simulation.ts`의 `getMonthlyStrategicEffects`에 기존 run-modifier 훅 바로 옆으로 아래 2줄만 추가했다.

```ts
const difficultyEffects = getDifficultyMonthlyEffects(state);
if (Object.keys(difficultyEffects).length > 0) effects.push(difficultyEffects);
```

난이도는 run-modifier `tag_effects`를 스케일하지 않고 별도 `monthly_headwind`를 더한다.

## 회귀 가드

- `standard` 티어의 `getDifficultyMonthlyEffects(state)`는 `{}`.
- `calculateMonthlyEconomy`는 standard/no-tag 기준에서 기존 결과와 동일하도록 테스트했다.
- 하드 티어 테스트는 같은 run-modifier 태그 효과를 유지한 채 `cash -60`, `hype -1`만 추가되는지 확인했다.
- 저장 round-trip은 `hard`를 보존하고, 구버전 save의 누락된 `challengeTier`는 `standard`로 마이그레이션된다.

## 10년 런 결과

- Standard: 기존 run-simulator 게이트가 계속 통과했다. `runTenYearCampaignSimulation` 표준 경로는 month 120+, non-failure, 10개 yearly snapshot, integrity OK를 유지한다.
- Hard: 신규 `productivity_line` 하드 티어 테스트가 통과했다. 검증 조건은 `challengeTier: "hard"`, month 120+, non-failure, finale final, annual review 10개 이상, yearly snapshot 10개, integrity OK.
- 현재 hard headwind는 완주 가능하므로 완화하지 않았다. Brutal은 완주 보장 대상으로 단언하지 않았다.

## 실행 결과

### `npm test -- src/game/run-modifiers.test.ts src/game/run-simulator.test.ts src/game/qa-scenarios.test.ts --maxWorkers=1`

- 결과: 통과
- 요약: 3 files / 80 tests passed

### `npm run validate:data`

- 결과: 통과
- 요약: `Data validation passed.`

### `npm run harness:gate`

- 결과: 통과
- 테스트: 47 files / 477 tests passed
- 데이터 검증: `Data validation passed.`
- 빌드: `tsc && vite build` 통과, 118 modules transformed, built in 835ms
