# Codex CLI 인계 — v0.66 #4 밸런스 스윕 (로그라이크 합산 점검) + v0.66 종료

작성일: 2026-05-30
작성자: Claude Code (기획/하네스/계약 트랙)
대상: Codex CLI (gpt-5.5, reasoning effort **xhigh** — 밸런스 판단 + 완주 가드 종합, 게임 균형 치명적)
작업 디렉토리: `/Users/taewookkim/dev/ai-company-tycoon`
선행: v0.66 #1~#3 커밋 완료. 이번이 v0.66 **마지막 블록 #4**.

## 한 줄 요약

로그라이크 레이어들이 이제 다 합쳐진다 — 세계관 tick 효과(v0.63 #2) + 연중 이벤트(v0.63 #3) + 난이도 역풍(v0.65) + 아키타입 보너스(v0.66 #3)가 한 런에서 동시에 월간 경제에 더해진다. #4는 **대표 조합들을 10년 시뮬레이터로 스윕**해 (1) 완주가 깨지지 않고 (2) 난이도가 의도대로(쉬움<표준<하드<브루탈) 인지 검증하고, 깨는 이상치만 보수적으로 튜닝한다. 주로 **하네스 강화(스윕 테스트) + 필요 시 데이터 수치 미세 조정**.

## 배경 (합산되는 월간 효과 소스)

`getMonthlyStrategicEffects`(simulation.ts ~3894)가 push하는 additive 레이어 — growthPath / annualDirective / industrySynergy / industryCombo / runModifier(세계·시장 태그) / difficulty(티어 역풍) / archetype(아키타입 보너스). 한 비표준 런은 이들을 동시에 받는다. 개별 블록은 각자 보수적이었으나 **합산 상호작용**은 아직 종합 점검 안 됨.

## 작업 내용

### 1. 밸런스 스윕 테스트 (run-simulator 활용 — 하네스)
`run-simulator.ts`/`.test.ts`에 대표 조합 스윕 추가. `runTenYearCampaignSimulation(strategyId, runModifierSelection)`는 이미 selection 인자를 받는다(v0.65 #1). 대표 조합 예:
- 표준(무보정) — 기존 게이트(불변 확인).
- 가혹 조합 — 예 `{ worldLoreId: "bitcoin_gpu_squeeze", marketConditionId: "enterprise_winter", challengeTierId: "hard" }` (역풍 큰 세계+시장+하드).
- 아키타입 보유 조합 — 예 `{ startCityId: "san_francisco", founderTraitId: "engineer_founder" }`(frontier_garage 파생) 등 보너스가 붙는 런.
- 혼합 — 비표준 세계 + 하드 + 아키타입.
각 조합에 대해 단언 — month 120 도달, status !== "failure", integrity ok. (가능하면 여러 growthPath로.)

### 2. 난이도 단조성(선택, 가능하면)
같은 세계/창업자에서 story ≤ standard ≤ hard ≤ brutal로 **어려움이 단조 증가**하는지 가벼운 지표(예 최종 cash 또는 생존 여유)로 확인. 엄밀한 수치 단언이 어려우면 "표준 완주 + 하드 완주 + 브루탈은 auto-fail 아님" 수준으로.

### 3. 이상치 튜닝 (필요 시에만, 보수적)
스윕에서 완주가 깨지거나 난이도가 역전되면, **데이터만** 미세 조정 — difficulty_tiers.json headwind 완화, derivation_rules.json monthly_effect 축소, 또는 run_modifiers.json tag_effects 미세 조정. tick 로직/구조는 건드리지 말 것. 조정했으면 QA 리포트에 근거 명시.

### 4. v0.66 종료 준비
- `reports/qa/v0_66_block4_run.md` — 스윕한 조합 표(조합 → 완주/최종 지표), 튜닝 내역(있으면)과 근거, 게이트.

## 절대 제약
- 가능하면 **데이터만** 조정(보수적). tick 구조·세이브·타입 불변. 새 시스템 금지.
- 결정론(시뮬레이터는 결정론적이어야 — RNG 금지). 표준 10년 완주 **반드시** 유지.
- 기존 테스트 깨지 않기(수치 조정 시 영향받는 기존 단언은 함께 갱신하되, 표준 경로 회귀는 만들지 말 것).
- `git commit` 금지. 계약 파일(`AGENTS.md`/`feature_list.json`/`progress.md`/`CLAUDE.md`/`docs/ROADMAP.md`) 편집 금지.

## 완료 기준
1. run-simulator 밸런스 스윕(대표 조합 — 표준/가혹/아키타입/혼합) 완주 단언.
2. (가능 시) 난이도 단조성 가벼운 확인.
3. 이상치 있으면 데이터만 보수적 튜닝 + 근거 기록.
4. `npm run harness:gate` 통과(표준 완주 불변).
5. `reports/qa/v0_66_block4_run.md` — 조합 표 + 튜닝 내역 + 게이트.

## 세션 종료 시
`git commit` 금지. 마지막 메시지에 스윕 조합·완주 결과, 튜닝 내역(있으면)과 근거, tick/세이브 불변 확인, 게이트 출력. 계약 파일 편집 금지. (v0.66 종료 bookkeeping은 Claude가 처리.)
