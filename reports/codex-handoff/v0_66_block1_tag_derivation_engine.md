# Codex CLI 인계 — v0.66 #1 태그 파생 엔진 (순수 평가기, derive-only)

작성일: 2026-05-30
작성자: Claude Code (기획/하네스/계약 트랙)
대상: Codex CLI (gpt-5.5, reasoning effort **xhigh** — 대형 시스템의 기반 아키텍처, #2~#4가 이 위에 쌓임. 순수성·결정론 치명적)
작업 디렉토리: `/Users/taewookkim/dev/ai-company-tycoon`
선행: v0.65 커밋 완료. 이 블록은 v0.66의 **기반(#1)** — derive-only 엔진. 효과 적용·연출은 #2~#4.

## 한 줄 요약

"무궁무진한 조합"의 엔진(사용자 결정 A). 런의 **태그 집합**에서 **아키타입을 파생/발견**한다 — 특정 태그 조합이 모이면 숨은 아키타입(예: "프런티어 차고", "혹한기 연구소")이 "발견" 대상이 된다. 이번 블록 #1은 **순수 평가기 + 규칙 데이터만** (derive-only) — 게임 효과 적용도, 새 GameState 필드도, tick 변경도 없다. v0.59 resource-visibility처럼 "계산만 하고 read-only로 노출". 발견 연출·지속·효과는 #2~#4.

## 왜 derive-only #1인가

- 대형 시스템이라 기반을 먼저 깨끗이 — 순수 함수 + 데이터 스키마를 확정하고, 그 위에 #2(연출/지속), #3(창발 효과), #4(밸런스)를 얹는다.
- derive-only면 tick·세이브·밸런스 회귀가 원천적으로 없다. 가장 안전한 첫 슬라이스(v0.59 패턴).

## 입력 — 런의 태그 풀

- 1차 입력은 `state.runModifiers.tags` (4축 태그 — 아래 어휘). 평가기는 이 집합에 대한 **순수 부분집합 매칭**.
- 스키마는 미래 확장(보유 도메인/제품/역량 태그)을 허용하되, **이번 #1 규칙은 run-modifier 태그만** 참조해 테스트 가능하게.

### 실제 run-modifier 태그 어휘 (data/run_modifiers.json, v0.64 확장 포함 — 규칙은 반드시 이 중에서)
- 도시 — city_seoul, enterprise_access, talent_dense / city_tokyo, consumer_hardware, design_market / city_new_york, finance_market, media_pressure / city_san_francisco, frontier_cluster, talent_expensive / city_texas, energy_infra, compute_infra / city_beijing, domestic_scale, trust_west_penalty / city_london, reg_balance / city_bengaluru, talent_cheap, low_burn / city_singapore, gateway_market, trust_dense / city_berlin, oss_culture, privacy_culture
- 세계 — alphago_stall, research_slow / compute_expensive, gpu_scarcity / open_source_heaven, community_models / regulation_heavy, safety_first / research_fast, safety_scrutiny / data_scarce, synthetic_premium / export_controls, compute_regional / privacy_strict, consent_economy / distribution_locked, platform_tax / funding_drought_world, skeptic_market / embodied_demand, hardware_capital
- 시장 — market_boom, demand_surge / enterprise_winter, long_sales_cycle / consumer_hype, volatile_demand / funding_drought, disciplined_market / distribution_easy, high_churn / reg_crackdown, trust_premium / talent_war, output_dense
- 창업자 — engineer_founder, builder_bias / marketer_founder, growth_bias / research_founder, lab_bias / capitalist_founder, fundraising_bias / designer_founder, ux_bias / operator_founder, efficiency_bias / academic_founder, theory_bias / serial_founder, network_bias

## 작업 내용

### 1. 데이터 — `data/derivation_rules.json`
아키타입 규칙 풀(~12개). 각 규칙:
- `id` (유니크), `title`, `description` (발견 시 보여줄 텍스트, 한국어),
- `requires: string[]` — 모두 충족돼야 발동하는 태그 조합(2~3개 권장),
- `discovery_id` — 발견 추적/연출용 식별자(#2에서 사용),
- `yields` — **#1에서는 메타데이터만**(예: `{ "kind": "bonus"|"event"|"product", "summary": "..." }`). 실제 효과 적용은 #3. #1은 yields를 저장만 하고 적용하지 않는다.

seed 예시(나머지는 위 어휘로 창의적으로 채울 것, 조합이 흥미롭고 세계관적으로 말이 되게):
- `frontier_garage` "프런티어 차고" — requires [frontier_cluster, builder_bias]
- `compute_siege_survivor` "컴퓨트 포위 생존자" — requires [compute_expensive, efficiency_bias]
- `oss_evangelist` "오픈소스 전도사" — requires [open_source_heaven, community_models, builder_bias]
- `trust_bastion` "신뢰 요새" — requires [regulation_heavy, trust_premium]
- `hype_machine` "하이프 머신" — requires [consumer_hype, growth_bias]
- `lab_in_winter` "혹한기 연구소" — requires [funding_drought, lab_bias]
- `data_alchemist` "데이터 연금술사" — requires [data_scarce, synthetic_premium]
- `gateway_operator` "게이트웨이 오퍼레이터" — requires [gateway_market, efficiency_bias]

### 2. 순수 평가기 — `src/game/tag-derivation.ts` (신규)
- `DerivationRuleDefinition` 타입(types.ts) + data.ts export(derivationRules).
- `getDerivedArchetypes(state: Pick<GameState,"runModifiers">): DerivationRuleDefinition[]` — 런 태그 집합이 `requires`를 모두 포함하는 규칙들을 반환. **순수**(RNG 금지, 부수효과 금지). 결정론적 정렬(id 기준).
- 보조 `runHasTags(tags: Set<string>, requires: string[]): boolean`.

### 3. read-only 노출 + QA
- `?scenario=tag-derivation` — 특정 시드/세계 조합으로 진입해 몇 개 아키타입이 파생되는 상태(예: SF+엔지니어 → frontier_garage). 효과 적용은 없고, 평가기가 매칭을 반환하는 걸 확인.
- (선택) 연구 패널 등 기존 UI에 read-only "파생 아키타입" 목록을 가볍게 노출(없어도 #1 통과 가능 — 핵심은 엔진).

### 4. 테스트 — `src/game/tag-derivation.test.ts`
- 규칙 개수/ id 유니크 / 모든 requires 태그가 실제 run-modifier 어휘에 존재(오타 가드).
- 알려진 조합이 기대 아키타입을 파생(예 frontier_cluster+builder_bias → frontier_garage), 비충족 시 미발동.
- 결정론(같은 상태 = 같은 결과, 정렬 안정).
- 표준 런(기본 태그)에서 과도하게 많은 아키타입이 터지지 않음(스팸 가드).

## 절대 제약 (derive-only)
- **새 GameState 필드 금지, tick·세이브 스키마 불변, 게임 효과 적용 금지** — #1은 순수 계산 + read-only. (yields는 데이터로 저장만, 적용은 #3.)
- 결정론(시드/상태 파생, RNG 금지 — 하네스 의존). 표준 10년 완주 불변(효과 미적용이라 자동).
- `simulation.ts` tick, 세이브 경로 편집 금지. `types.ts`는 신규 정의 타입 추가만(GameState 변경 금지).
- `git commit` 금지. 계약 파일(`AGENTS.md`/`feature_list.json`/`progress.md`/`CLAUDE.md`/`docs/ROADMAP.md`) 편집 금지.

## 완료 기준
1. `derivation_rules.json`(~12, run-modifier 어휘만) + `DerivationRuleDefinition` + data export.
2. `tag-derivation.ts` 순수 평가기 `getDerivedArchetypes` + 보조.
3. `?scenario=tag-derivation` 진입 시 아키타입 파생 확인.
4. 테스트 — 매칭/결정론/태그 어휘 유효성/스팸 가드.
5. `npm run harness:gate` 통과. simulation.ts·세이브 diff 비어있음(derive-only 증명).
6. `reports/qa/v0_66_block1_run.md` — 규칙 목록, 평가기 시그니처, derive-only 증거(빈 tick/세이브 diff), 게이트.

## 후속(이 블록 아님)
- #2 발견 연출 — v0.62 `discoveredPayoffIds` + `PayoffCelebrationModal` 재사용해 새 아키타입 발견 시 "발견!" + 도감. (지속 필드는 #2에서.)
- #3 창발 효과 — yields를 실제 보너스/이벤트/제품으로 연결(additive 훅, §5).
- #4 밸런스 — 완주·난이도 영향 점검.

## 세션 종료 시
`git commit` 금지. 마지막 메시지에 변경 파일 + 평가기 시그니처 + derive-only(빈 simulation.ts/세이브 diff) 확인 + 게이트. 계약 파일 편집 금지.
