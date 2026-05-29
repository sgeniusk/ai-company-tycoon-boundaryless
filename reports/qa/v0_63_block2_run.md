# v0.63 Block #2 QA - Run Modifier Monthly Tick Effects

작성일: 2026-05-29

## 범위

- 대상: `v0.63-alpha-roguelike-run-modifiers` 블록 #2만.
- 목표: 블록 #1이 저장한 `GameState.runModifiers.tags`를 월간 tick의 additive monthly effects로만 반영.
- 비범위: 비용 multiplier, 복수 cost site 수정, save schema 변경, run setup UI, yearly event mutator.

## 태그 -> 월간 효과 매핑

`data/run_modifiers.json`에 `tag_effects`를 추가했다. 기본/표준 태그(`default_city`, `standard_world`, `steady_market`, `no_founder`)는 매핑하지 않아 no-op으로 유지한다.

| tag | monthly effect |
| --- | --- |
| `compute_expensive` | `compute -8` |
| `gpu_scarcity` | `compute -4` |
| `research_slow` | `data -3`, `hype -1` |
| `alphago_stall` | `data -2` |
| `open_source_heaven` | `data +4` |
| `community_models` | `compute +2`, `data +2` |
| `regulation_heavy` | `hype -1` |
| `safety_first` | `trust +1` |
| `market_boom` | `cash +100`, `users +100`, `hype +1` |
| `demand_surge` | `users +80` |
| `enterprise_winter` | `cash -80`, `users -30`, `trust +1` |
| `long_sales_cycle` | `cash -40`, `users -20` |
| `consumer_hype` | `users +80`, `hype +2` |
| `volatile_demand` | `trust -1` |

밸런스는 v0.60 synergy 월간 효과 규모(대략 `cash 90-140`, `users 90-120`, `compute 4-6`)를 기준으로 보수적으로 잡았다.

## 구현 증거

- `src/game/run-modifiers.ts:78` `getRunModifierMonthlyEffects(state): ResourceMap`
  - `state.runModifiers.tags`가 없거나 빈 배열이면 `{}` 반환.
  - 태그별 `runModifiers.tag_effects[tag]`를 합산.
- `src/game/simulation.ts:3890`, `src/game/simulation.ts:3901`
  - 변경은 `getMonthlyStrategicEffects` 안의 2줄 hook뿐이다.
  - `const runModifierEffects = getRunModifierMonthlyEffects(state);`
  - `if (Object.keys(runModifierEffects).length > 0) effects.push(runModifierEffects);`
- `scripts/harness/validate-data.mjs`
  - `run_modifiers.tag_effects`가 object인지 검증.
  - 매핑 키가 실제 run modifier tag인지 검증.
  - 기본 no-op 태그가 매핑되지 않았는지 검증.
  - ResourceMap 키/숫자 타입/0이 아닌 효과를 검증.

## 테스트 증거

- Red 확인:
  - `npm test -- src/game/run-modifiers.test.ts --maxWorkers=1`
  - 결과: 3개 신규 테스트가 `getRunModifierMonthlyEffects is not a function`으로 실패, 기존 6개 테스트는 통과.
- Green 확인:
  - `npm test -- src/game/run-modifiers.test.ts --maxWorkers=1`
  - 결과: `1 passed`, `9 passed`.
- 표준 세계 회귀 가드:
  - `src/game/run-modifiers.test.ts:163`
  - `tags: []` -> `getRunModifierMonthlyEffects(noTags) === {}`
  - 기본 config -> `getRunModifierMonthlyEffects(standard) === {}`
  - `calculateMonthlyEconomy(noTags) === calculateMonthlyEconomy(standard)`
- `?scenario=run-modifiers` GPU 초고가 압박:
  - `src/game/run-modifiers.test.ts:178`
  - scenario tags에 `compute_expensive`, `gpu_scarcity` 포함.
  - 월간 modifier compute effect: `-12`.
  - `calculateMonthlyEconomy(...).resourceDelta.compute === -12`.
  - `advanceMonth(...).lastMonthReport.strategyEffects.compute === -12`.

## 최종 게이트

명령:

```bash
npm run harness:gate
```

결과:

```text
Test Files  45 passed (45)
Tests       457 passed (457)
Data validation passed.
build: tsc && vite build
114 modules transformed
built in 736ms
```

## 변경 파일

- `data/run_modifiers.json`
- `scripts/harness/validate-data.mjs`
- `src/game/run-modifiers.ts`
- `src/game/run-modifiers.test.ts`
- `src/game/simulation.ts`
- `src/game/types.ts`
- `reports/qa/v0_63_block2_run.md`

## 남은 리스크

- 없음. 기본/표준 config는 테스트로 no-op을 고정했고, tick 변경은 additive monthly-effects hook 2줄로 제한했다.
