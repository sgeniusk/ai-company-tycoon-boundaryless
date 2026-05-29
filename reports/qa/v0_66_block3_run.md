# v0.66 #3 아키타입 월간 효과 QA

작성일: 2026-05-30

## 변경 요약

- `data/derivation_rules.json`: `yields.kind === "bonus"` 아키타입에 보수적 `monthly_effect`를 추가했다.
- `src/game/tag-derivation.ts`: 순수 함수 `getArchetypeMonthlyEffects(state)`를 추가해 현재 런의 파생 bonus 아키타입 효과만 합산한다.
- `src/game/simulation.ts`: `getMonthlyStrategicEffects`에 아키타입 효과를 기존 runModifier/difficulty와 같은 2줄 additive 패턴으로 연결했다.
- `src/game/types.ts`: `DerivationRuleDefinition.yields.monthly_effect?: ResourceMap` 타입을 추가했다.
- `src/game/tag-derivation.test.ts`, `src/game/run-simulator.test.ts`: 효과 합산, 표준 `{}` 회귀, 자원 id 유효성, 월간 훅, 비표준 아키타입 런 완주 테스트를 추가했다.

## 효과 페이로드

- `compute_siege_survivor`: `{ "compute": 2 }`
- `data_alchemist`: `{ "data": 3 }`
- `frontier_garage`: `{ "compute": 3 }`
- `gateway_operator`: `{ "users": 25, "cash": 20 }`
- `hype_machine`: `{ "users": 30, "hype": 1 }`
- `lab_in_winter`: `{ "data": 2, "cash": -10 }`
- `privacy_compact`: `{ "trust": 1 }`
- `trust_bastion`: `{ "trust": 1 }`

`chip_war_localizer`, `frontier_demo_loop`, `hardware_frontier`, `oss_evangelist`는 product/event 계열로 남겨 이번 블록의 월간 효과 대상에서 제외했다.

## Tick 훅

`src/game/simulation.ts:3900`, `src/game/simulation.ts:3913`

```ts
const archetypeEffects = getArchetypeMonthlyEffects(state);
if (Object.keys(archetypeEffects).length > 0) effects.push(archetypeEffects);
```

곱셈/비용 배수/RNG 없이 `ResourceMap`을 더하는 방식만 사용했다.

## 완주 결과

- 표준 런: `productivity_line`, month `120`, status `success`, integrity `true`, annual reviews `10`, finale rank `S`, derived archetypes `[]`.
- 아키타입 보유 비표준 런: `productivity_line` + `san_francisco/open_source_heaven/ai_boom/engineer_founder`, month `120`, status `success`, integrity `true`, annual reviews `10`, finale rank `S`, derived archetypes `frontier_demo_loop`, `frontier_garage`, `oss_evangelist`.

## 검증

- TDD red: `npm test -- src/game/tag-derivation.test.ts src/game/run-simulator.test.ts` 실패 확인.
  - bonus rule `monthly_effect` 누락
  - `getArchetypeMonthlyEffects` 미구현
- Targeted green: `npm test -- src/game/tag-derivation.test.ts src/game/run-simulator.test.ts`
  - `2 passed`, `23 passed`
- Full gate: `npm run harness:gate`
  - `Test Files 48 passed (48)`
  - `Tests 498 passed (498)`
  - `Data validation passed.`
  - `tsc && vite build` 통과, `120 modules transformed`, `built in 2.38s`
- `git diff --check`: 통과

## 상태/스키마 확인

- 새 `GameState` 필드 없음.
- save schema / `SAVE_VERSION` 변경 없음.
- 효과는 `state.runModifiers.tags` -> `getDerivedArchetypes` -> `monthly_effect`로 매월 순수 파생한다.
- 기존 runModifier/synergy/combo/difficulty/world-event 효과 로직은 변경하지 않았다.
- 금지 파일(`AGENTS.md`, `feature_list.json`, `progress.md`, `CLAUDE.md`, `docs/ROADMAP.md`)은 편집하지 않았다.
