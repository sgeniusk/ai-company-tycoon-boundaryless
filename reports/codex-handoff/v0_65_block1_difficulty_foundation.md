# Codex CLI 인계 — v0.65 #1 난이도·도전 축 기반 (challenge tier)

작성일: 2026-05-30
작성자: Claude Code (기획/하네스/계약 트랙)
대상: Codex CLI (gpt-5.5, reasoning effort **xhigh** — RunModifiersState 신규 필드 + 세이브 마이그레이션 + 월간 tick 효과 + 밸런스, 정확성 치명적)
작업 디렉토리: `/Users/taewookkim/dev/ai-company-tycoon`
선행: v0.64(콘텐츠 깊이) 커밋 완료 후. 이 블록은 v0.65의 **기반(#1)** — 보상/UI는 #2.

## 한 줄 요약

"열린 도전"과 "긴장·해소" 레버. 런에 **도전 티어**(story / standard / hard / brutal)를 추가한다. 하드할수록 **월간 역풍(additive 음수 ResourceMap)**이 세지고, 클리어 시 메타 보상 배수가 커진다(#2). 표준 티어는 `{}` 무보정이라 회귀 없음. tag_effects를 스케일하지 않고(부호 혼재) **별도 headwind를 더하는** 방식이라 §5-안전하고 결정론적이다.

## 왜 headwind-additive인가 (설계 근거)

- 런 모디파이어 tag_effects는 양수(market_boom cash+100)와 음수(enterprise_winter cash-80)가 섞여 있다. 전체를 ×배수하면 호황 세계는 오히려 쉬워진다 — 난이도가 아니다.
- 그래서 난이도는 **티어별 일정한 역풍**(예: hard = 월 cash -60, brutal = 월 cash -140 + trust -1)을 `getMonthlyStrategicEffects`에 **additive로 추가**한다. v0.60 시너지·v0.63 #2 세계 효과와 동일한 2줄 훅 패턴.
- standard 티어 headwind = `{}` → `calculateMonthlyEconomy` 불변(회귀 가드). story 티어는 약한 순풍 또는 0.

## 정확한 미러링 대상 (이미 있는 패턴)

- `src/game/run-modifiers.ts` `getRunModifierMonthlyEffects(state): ResourceMap` + `getMonthlyStrategicEffects`의 2줄 훅(simulation.ts ~3890) — 난이도 headwind도 **같은 자리에 같은 패턴**으로 한 훅 추가.
- `RunModifiersState`(types.ts) + `sanitizeRunModifiersState`(run-modifiers.ts) + `createInitialState`/hydrate — `runModifiers`에 신규 서브필드를 더하는 패턴. challengeTier는 여기 얹는다.
- `GameState.runModifiers`는 이미 세이브 필드(블록 v0.63 #1). 구버전 세이브 = standard 티어 마이그레이션.

## 작업 내용

### 1. 데이터 — `data/difficulty_tiers.json`
티어 풀. 각 `id, name, description, monthly_headwind:ResourceMap, reward_multiplier:number`.
- `story` — 입문. headwind `{}` (또는 약한 순풍), reward_multiplier 0.75.
- `standard` — 기준. headwind `{}`, reward_multiplier 1.0. **무보정 디폴트**.
- `hard` — headwind `{ cash: -60, hype: -1 }`, reward_multiplier 1.5.
- `brutal` — headwind `{ cash: -140, trust: -1, hype: -1 }`, reward_multiplier 2.0.
(수치는 보수적 조정 가능. 10년 완주가 깨지지 않는 선에서.)

### 2. 타입·선택·세이브
- `RunModifiersState`에 `challengeTier: string` 추가(기본 "standard"). `RunModifierSelectionInput`에 `challengeTierId?` 추가.
- `selectRunModifierConfig`가 티어를 선택/기본 처리(시드 굴리기 대상 아님 — 티어는 **플레이어 선택**, 미지정 시 standard). `sanitizeRunModifiersState`가 알 수 없는/누락 티어를 standard로.
- 구버전 세이브 → standard 마이그레이션. round-trip 테스트.

### 3. 월간 효과
- `getDifficultyMonthlyEffects(state): ResourceMap` — 현재 티어의 monthly_headwind 반환(standard `{}`).
- `getMonthlyStrategicEffects`에 2줄 훅 추가(기존 run-modifier 훅 바로 옆). standard = no-op 회귀 가드.

### 4. 테스트 + 시뮬레이터
- 티어 개수/기본 standard/세이브 round-trip + 구버전 마이그레이션.
- standard 티어 = `getDifficultyMonthlyEffects` `{}` (회귀 가드, calculateMonthlyEconomy 불변).
- **표준(standard) 런 10년 완주 불변** — 기존 run-simulator 게이트.
- **hard 티어도 완주 가능** 한지 run-simulator로 1개 전략 확인(완주 불가면 headwind 완화). brutal은 "도전"이라 완주 보장 안 해도 되지만, auto-fail로 게이트를 깨면 안 됨 — 시뮬레이터 단언은 standard/hard 위주.
- `?scenario=difficulty-hard` 등.

## 절대 제약
- standard 티어 = 현재 동작(회귀 0). headwind는 additive, 부호 스케일 금지.
- 결정론(티어는 상태에 저장된 상수, tick RNG 금지). 10년 완주(standard) 불변.
- tick 변경은 difficulty 훅 2줄만. campaign_shocks/world_events/run-modifier 기존 효과 불변.
- `git commit` 금지. 계약 파일(`AGENTS.md`/`feature_list.json`/`progress.md`/`CLAUDE.md`/`docs/ROADMAP.md`) 편집 금지.

## 완료 기준
1. `difficulty_tiers.json` + `RunModifiersState.challengeTier`(세이브 마이그레이션) + `getDifficultyMonthlyEffects` + 2줄 훅.
2. standard 무보정 회귀 가드 + 세이브 round-trip + 구버전 마이그레이션 테스트.
3. standard 10년 완주 불변, hard 완주 가능 확인.
4. `npm run harness:gate` 통과.
5. `reports/qa/v0_65_block1_run.md` — 변경 파일, 티어/headwind, tick·세이브 영향, 완주 가드 결과, 게이트.

## v0.65 #2 (후속, 이 블록 아님)
메타 보상 배수 적용(클리어 시 reward_multiplier로 언락 포인트↑) + 런 셋업 티어 선택 UI + 세계 뽑기 리빌에 티어 표시. medium.

## 세션 종료 시
`git commit` 금지. 마지막 메시지에 변경 파일 + headwind 설계 + standard 무보정 + standard/hard 완주 + tick/세이브 영향 + 게이트. 계약 파일 편집 금지.
