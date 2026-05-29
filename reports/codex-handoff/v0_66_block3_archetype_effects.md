# Codex CLI 인계 — v0.66 #3 아키타입 창발 효과 (additive 훅)

작성일: 2026-05-30
작성자: Claude Code (기획/하네스/계약 트랙)
대상: Codex CLI (gpt-5.5, reasoning effort **xhigh** — 월간 tick 경제 효과 + 밸런스, 완주 가드 치명적)
작업 디렉토리: `/Users/taewookkim/dev/ai-company-tycoon`
선행: v0.66 #1(엔진 getDerivedArchetypes) + #2(발견/도감) 커밋 완료. 이번은 #3.

## 한 줄 요약

#1이 파생하고 #2가 발견·수집한 아키타입을 **기계적으로 의미 있게** 만든다 — 런이 보유한 아키타입이 **월간 보너스**(additive ResourceMap)를 준다. "프런티어 차고"면 매월 약간의 compute, "데이터 연금술사"면 약간의 data 같은 식. 기존 검증된 2줄 훅(run-modifier/시너지/난이도와 동일)으로 `getMonthlyStrategicEffects`에 더한다. 보수적·additive·결정론 — 표준 런 완주 불변.

## 정확한 미러링 대상 (이미 있는 패턴 — 4번째 적용)

- `simulation.ts` `getMonthlyStrategicEffects` (~3894) — 이미 growthPath/annualDirective/industrySynergy/industryCombo/runModifier/difficulty 효과를 push한다. **여기에 archetype 효과를 같은 2줄로 추가**:
  ```ts
  const archetypeEffects = getArchetypeMonthlyEffects(state);
  ...
  if (Object.keys(archetypeEffects).length > 0) effects.push(archetypeEffects);
  ```
- `getDifficultyMonthlyEffects`(v0.65 #1)·`getRunModifierMonthlyEffects`(v0.63 #2) — 순수 ResourceMap 반환 + 2줄 훅의 정확한 본보기.
- `getDerivedArchetypes(state)`(#1) — 런이 보유한 아키타입 목록(효과의 소스).

## 작업 내용

### 1. 효과 데이터 — `data/derivation_rules.json` yields 확장
각 규칙 yields에 효과 페이로드 추가. `kind: "bonus"`면 `monthly_effect: ResourceMap`(보수적). 예 — frontier_garage `{ compute: 3 }`, data_alchemist `{ data: 3 }`, hype_machine `{ users: 30, hype: 1 }`, trust_bastion `{ trust: 1 }`, lab_in_winter `{ data: 2, cash: -10 }`. `kind: "event"`/`"product"`는 이번엔 monthly_effect 없이 메타만(후속), 또는 가벼운 1회 timeline 노출만 — **이번 #3 핵심은 bonus 월간 효과**.
- 수치는 보수적(한 자원을 폭주시키지 않게, 기존 tag_effects/시너지 범위 내). 한 런이 보유하는 아키타입은 보통 1~4개라 합산도 작게.

### 2. 순수 효과 함수 — tag-derivation.ts
`getArchetypeMonthlyEffects(state: Pick<GameState,"runModifiers">): ResourceMap` — `getDerivedArchetypes(state)` 중 `yields.kind === "bonus"`인 것들의 `monthly_effect`를 합산(mergeMaps 식). 순수·결정론. 아키타입 0개거나 표준 런이면 `{}`.

### 3. tick 훅
`getMonthlyStrategicEffects`에 위 2줄 추가(기존 difficulty/runModifier 훅 바로 옆). 그 외 tick 로직 **불변**.

### 4. 테스트 + 완주
- `getArchetypeMonthlyEffects` 정확/결정론, 아키타입 없으면 `{}`(회귀 가드), 표준 런 `{}`.
- 효과 자원 id가 모두 `resources`에 존재.
- **표준 10년 완주 불변**(run-simulator 기존 게이트). 추가로 아키타입이 활성인 비표준 런(예 frontier 조합)도 완주 가능 1개 확인(과보정으로 깨지면 수치 완화).
- `?scenario` — 아키타입 보유 런에서 월간 효과가 반영되는 상태.

## 절대 제약
- additive only(곱셈·비용 배수 금지). 보수적 — 완주 불변이 최우선.
- 결정론(시드/태그 파생, tick RNG 금지). tick 변경은 archetype 훅 2줄만. 세이브 스키마 불변(효과는 derive, 새 필드 없음).
- 기존 효과(run-modifier/시너지/combo/difficulty/world-event) 불변.
- `git commit` 금지. 계약 파일(`AGENTS.md`/`feature_list.json`/`progress.md`/`CLAUDE.md`/`docs/ROADMAP.md`) 편집 금지.

## 완료 기준
1. derivation_rules.json yields에 bonus monthly_effect(보수적) + `getArchetypeMonthlyEffects` 순수 함수 + 2줄 훅.
2. 효과/결정론/표준 `{}` 회귀 가드 + 자원 id 유효성 테스트.
3. 표준 10년 완주 불변 + 비표준(아키타입 보유) 완주 1개 확인.
4. `npm run harness:gate` 통과. simulation.ts diff = archetype 훅 2줄만.
5. `reports/qa/v0_66_block3_run.md` — 변경 파일, 효과 페이로드, 훅 위치, 완주 결과, 게이트.

## 후속(이 블록 아님)
- #4 밸런스 — 아키타입 효과 × 난이도 티어 × 세계관 합산이 완주/난도에 미치는 영향 종합 점검, 필요 시 수치 튜닝. v0.66 종료.

## 세션 종료 시
`git commit` 금지. 마지막 메시지에 변경 파일 + 훅 위치 + 표준 완주 불변 + tick(그 2줄 외) 불변 + 게이트. 계약 파일 편집 금지.
