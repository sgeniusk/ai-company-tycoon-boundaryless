# Codex CLI 인계 — v0.63 블록 #2 (세계관/시장 tick 효과)

작성일: 2026-05-29
작성자: Claude Code (하네스/계약/플래닝 트랙)
대상: Codex CLI (gpt-5.5, reasoning effort **xhigh** — 월간 tick/밸런스를 건드림, 정확성 치명적)
작업 디렉토리: `/Users/taewookkim/dev/ai-company-tycoon`
현재 feature: `v0.63-alpha-roguelike-run-modifiers` (블록 #1 완료·커밋, 이번은 **블록 #2만**)

## 한 줄 요약

블록 #1이 저장만 해둔 `GameState.runModifiers.tags`를 **월간 tick에서 실제로 발동**시킨다 (예: GPU 초고가 세계 → 월간 compute 압박, 연구 느린 세계 → 연구 페널티, 호황/불황 → 매출/유저 가감). **v0.60 시너지/조합의 검증된 monthly-effects 훅을 그대로 미러링**해 additive로 안전하게 한다.

## 핵심 안전 원칙 (반드시)

- **태그 없으면 no-op.** 표준 세계(tags=[])는 효과 0 → tick이 현재와 완전히 동일. 회귀 가드 테스트 필수.
- **additive monthly-effects로 모델링** (비용 곱셈으로 여러 cost site를 수술하지 말 것). 즉 cost-multiplier 대신 **월간 자원 가감**으로 세계를 표현. (예: compute_expensive → 월 compute -X, research_slow → 월 talent/data -X 또는 연구 진행 소폭 페널티.) cost-multiplier 시맨틱은 후속 정제 과제로 남긴다.
- **결정론적** (RNG 금지). 효과 크기는 **보수적**(밸런스 폭주 금지) — v0.60 시너지/조합 monthly_effects 스케일 참고.

## 정확한 미러링 대상 (이미 있는 안전 패턴)

- `src/game/simulation.ts`의 `getMonthlyStrategicEffects` — v0.60에서 `officeSynergyEffects`/`industrySynergyEffects`/`industryComboEffects`를 월간 효과 배열에 push 하는 그 지점. 여기에 `runModifierEffects = getRunModifierMonthlyEffects(state)` 한 줄 + push 가드 한 줄을 **동일 패턴으로** 추가한다. **그 외 tick 로직 불변.**
- 효과 계산 함수는 신규 `src/game/run-modifiers.ts`(블록 #1)에 `getRunModifierMonthlyEffects(state): ResourceMap`로 추가 — `state.runModifiers.tags`를 읽어 태그별 월간 ResourceMap을 합산. 순수 함수.
- 태그→효과 매핑은 `data/run_modifiers.json`의 각 world_lore/market 항목에 이미 있는 `tags`(블록 #1) 기준. 매핑 테이블은 데이터(run_modifiers.json에 `tag_effects` 추가) 또는 run-modifiers.ts 상수로. **데이터에 두는 걸 권장**(밸런스 조정 쉬움) + validate-data 규칙 추가.

## 작업 내용

1. **태그→월간효과 매핑** — run_modifiers.json(또는 run-modifiers.ts)에 `compute_expensive`, `research_slow`, market boom/bust 등 핵심 태그의 보수적 월간 ResourceMap을 정의. validate-data로 자원 키 검증.
2. **derive** — `getRunModifierMonthlyEffects(state)`가 active tags의 효과를 합산 (태그 없으면 `{}`).
3. **tick 연결** — `getMonthlyStrategicEffects`에 v0.60 시너지와 동일한 2줄(계산 + push 가드)로 연결. 그 외 tick 불변.
4. **(선택) 표시** — 현재 세계가 월간 경제에 주는 영향을 어딘가 가볍게 노출(연구/회사 패널). 과한 신규 UI 금지.
5. **테스트** — 태그별 효과 합산 단위 테스트 + **표준 세계 회귀 가드**(tags=[] → 효과 {} → 월간 결과 불변) + `?scenario=run-modifiers`(GPU 초고가)에서 compute 압박이 실제로 반영되는지. 목표 454 → 457+.

## 제약

- 표준/기본 config는 **반드시 no-op** (회귀 0). 회귀 가드 테스트 필수.
- additive only — cost-multiplier로 여러 cost site를 건드리지 말 것 (이번 블록 범위 밖).
- `getMonthlyStrategicEffects` 외 tick 로직, 저장 스키마(블록 #1 runModifiers 필드)는 불변.
- 결정론적, 보수적 밸런스. 모바일/저장 round-trip 영향 없음.
- `npm run harness:gate` 통과.

## 완료 기준

1. `getRunModifierMonthlyEffects` + `getMonthlyStrategicEffects` 2줄 훅으로 태그가 월간 경제에 반영.
2. 표준 세계 회귀 가드 통과 (no-op).
3. `?scenario=run-modifiers`(GPU 초고가)에서 compute 압박이 월간에 실제 반영됨을 테스트로 확인.
4. tick 그 외 불변, 결정론적, 보수적 밸런스.
5. `npm run harness:gate` 통과 (45 files / 457+ tests).
6. `reports/qa/v0_63_block2_run.md` — 태그→효과 매핑, getMonthlyStrategicEffects 변경 라인, 회귀 가드 결과, 게이트 출력.

## 세션 종료 시

`git commit` 금지. 마지막 메시지에 변경 파일 + tick 변경 라인 + 회귀 가드 결과 + 게이트. 계약 파일 편집 금지.
