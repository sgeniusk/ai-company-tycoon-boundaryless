# v0.66 #1 태그 파생 엔진 QA

작성일: 2026-05-30

## 범위

Block #1은 derive-only 기반만 구현했다. 새 `GameState` 필드, tick 변경, 저장 스키마 변경, 효과 적용은 없다. `yields`는 후속 #3에서 적용할 메타데이터로만 보관한다.

## 구현 파일

- `data/derivation_rules.json`
- `src/game/tag-derivation.ts`
- `src/game/tag-derivation.test.ts`
- `src/game/types.ts`
- `src/game/data.ts`
- `src/game/qa-scenarios.ts`

## 평가기 시그니처

```ts
getDerivedArchetypes(state: Pick<GameState, "runModifiers">): DerivationRuleDefinition[]
runHasTags(tags: Set<string>, requires: string[]): boolean
```

`getDerivedArchetypes`는 `state.runModifiers.tags`만 읽고, 각 규칙의 `requires`가 모두 포함된 경우만 반환한다. 반환값은 `id` 기준으로 결정론적으로 정렬한다.

## 규칙 목록

- `chip_war_localizer` — 칩 전쟁 현지화팀 — requires: `[export_controls, compute_regional, builder_bias]` — yields: `product`
- `compute_siege_survivor` — 컴퓨트 포위 생존자 — requires: `[compute_expensive, efficiency_bias]` — yields: `bonus`
- `data_alchemist` — 데이터 연금술사 — requires: `[data_scarce, synthetic_premium]` — yields: `product`
- `frontier_demo_loop` — 프런티어 데모 루프 — requires: `[frontier_cluster, demand_surge, builder_bias]` — yields: `event`
- `frontier_garage` — 프런티어 차고 — requires: `[frontier_cluster, builder_bias]` — yields: `bonus`
- `gateway_operator` — 게이트웨이 오퍼레이터 — requires: `[gateway_market, efficiency_bias]` — yields: `bonus`
- `hardware_frontier` — 하드웨어 프런티어 — requires: `[embodied_demand, hardware_capital, compute_infra]` — yields: `product`
- `hype_machine` — 하이프 머신 — requires: `[consumer_hype, growth_bias]` — yields: `event`
- `lab_in_winter` — 혹한기 연구소 — requires: `[funding_drought, lab_bias]` — yields: `bonus`
- `oss_evangelist` — 오픈소스 전도사 — requires: `[open_source_heaven, community_models, builder_bias]` — yields: `event`
- `privacy_compact` — 프라이버시 협약 — requires: `[privacy_strict, consent_economy, trust_premium]` — yields: `bonus`
- `trust_bastion` — 신뢰 요새 — requires: `[regulation_heavy, trust_premium]` — yields: `bonus`

## QA 시나리오

`?scenario=tag-derivation`은 다음 조합으로 시작한다.

- 도시: `san_francisco`
- 세계관: `open_source_heaven`
- 시장: `ai_boom`
- 창업자: `engineer_founder`

파생 결과는 `frontier_demo_loop`, `frontier_garage`, `oss_evangelist` 3개다. 결과는 상태 변화 없이 timeline 안내로만 노출한다.

## Derive-only 증거

- `git diff --exit-code -- src/game/simulation.ts src/App.tsx src/game/state-integrity.ts src/game/save-integrity.test.ts`
- 결과: 출력 없음, exit 0. tick/save/localStorage/state-integrity/save-integrity diff가 비어 있다.
- `types.ts` 변경은 `DerivationRuleDefinition` 신규 정의 타입 추가뿐이며 `GameState`는 변경하지 않았다.

## 검증

- `npm test -- src/game/tag-derivation.test.ts`
  - 1 files passed / 7 tests passed
- `npm test -- src/game/qa-scenarios.test.ts`
  - 1 files passed / 55 tests passed
- `npm run validate:data`
  - Data validation passed
- `npm run build`
  - `tsc && vite build` passed, 120 modules transformed
- `npm run harness:gate`
  - 48 files passed / 488 tests passed
  - Data validation passed
  - Production build passed, 120 modules transformed

## 결론

v0.66 #1 태그 파생 엔진 기반은 순수 평가기 + 규칙 데이터 + QA 시나리오 + 회귀 테스트로 닫을 수 있다. 효과 적용, 발견 지속, 저장 필드는 후속 블록 범위다.
