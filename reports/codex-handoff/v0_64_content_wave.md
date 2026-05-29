# Codex CLI 인계 — v0.64 #1 콘텐츠 깊이 (런 모디파이어 대량 확장)

작성일: 2026-05-29
작성자: Claude Code (기획/하네스/계약 트랙)
대상: Codex CLI (gpt-5.5, reasoning effort **medium / fast** — 순수 데이터 추가 + 검증/테스트, tick·세이브 불변이라 빠른 모드로 충분)
작업 디렉토리: `/Users/taewookkim/dev/ai-company-tycoon`
선행: v0.63 (블록 #1~#4) 커밋 완료 후 진행. 이 블록은 **데이터 전용**.

## 한 줄 요약

런 모디파이어 시스템의 **콘텐츠 부피**를 키운다 — 세계관 5→12, 시작도시 6→11, 시장 4→8, 창업자 5→9. 조합 수 600 → **약 9,500**. 사용자 북극성 "풍성한 컨텐츠 · 무궁무진한 조합". **코드 변경 없음** — `data/run_modifiers.json` 항목 추가 + 새 태그의 `tag_effects` 정의 + 검증/테스트만.

## 왜 데이터 전용인가 (이미 확인된 사실)

- `src/game/run-modifiers.ts`의 `selectOption`은 **순수 데이터 주도** — 배열에 항목을 추가하면 시드 기반 선택 풀에 자동 편입(default 항목은 제외하고 `hashSeed(seed:salt) % pool`로 선택). 코드 수정 불필요.
- `getRunModifierMonthlyEffects`는 런 태그들의 `tag_effects`를 합산 — 새 태그를 `tag_effects`에 정의만 하면 월간 효과가 붙음.
- 따라서 `simulation.ts` tick, `types.ts`, 세이브 스키마 **전부 불변**. 회귀 위험이 가장 낮은 작업.

## 절대 제약 (가장 중요)

1. **default 항목 무보정 유지** — `default_city` / `standard` / `steady_market` / `no_founder`의 `starting_deltas`는 `{}` 그대로. 기본 런 = 무보정.
2. **표준 런 10년 완주 불변** — run-simulator 완주 게이트는 기본(무보정) 런을 돌리므로 콘텐츠 추가가 깨면 안 됨. 그래도 게이트로 재확인.
3. **효과는 보수적** — 새 항목의 `starting_deltas`와 `tag_effects`는 기존 항목 범위 안(자원은 대략 cash ±2500, users ±300, compute ±45, data ±40, talent ±2, hype/trust ±8 이내). 한 항목이 게임을 깨면 안 됨.
4. **태그는 전부 정의** — 새 항목이 다는 모든 태그는 `tag_effects`에 있거나(월간 효과를 의도) 의도적으로 시작 보정 전용(월간 효과 0이면 `tag_effects`에 안 넣어도 됨). 시작 전용 태그는 검증에서 통과하되 효과 0임을 테스트로 고정.
5. `simulation.ts` / `types.ts` / 세이브 / `run-modifiers.ts` **편집 금지** (데이터·검증·테스트만). 계약 파일(`AGENTS.md`, `feature_list.json`, `progress.md`, `CLAUDE.md`, `docs/ROADMAP.md`) 편집 금지. `git commit` 금지.

## 추가할 콘텐츠 (스펙 — 수치는 보수적으로 조정 가능, 컨셉/태그는 유지)

### 세계관 world_lore (+7 → 총 12)
대체 AI 역사 타임라인. 각 항목 `id/name/description/starting_deltas/tags`.

1. `agi_overhang` "AGI 임박" — 연구 가속, 안전 감시 혹독. deltas `{ data: 15, hype: 4, trust: -3 }` cap `{}`. tags `["research_fast","safety_scrutiny"]`
2. `data_drought` "데이터 고갈" — 공개 데이터 고갈·저작권 봉쇄. deltas `{ data: -25 }`. tags `["data_scarce","synthetic_premium"]`
3. `chip_war` "칩 전쟁" — 수출통제로 컴퓨트 분절. deltas `{ compute: -30, cash: -400 }`. tags `["export_controls","compute_regional"]`
4. `privacy_fortress` "프라이버시 요새" — 개인정보 철벽법. deltas `{ data: -12, trust: 6 }`. tags `["privacy_strict","consent_economy"]`
5. `bigtech_monopoly` "빅테크 독점" — 유통 장악. deltas `{ users: -120, hype: -3 }`. tags `["distribution_locked","platform_tax"]`
6. `ai_winter_redux` "AI 겨울 재림" — 투자 빙하·회의론. deltas `{ cash: -900, hype: -6 }`. tags `["funding_drought_world","skeptic_market"]`
7. `robotics_boom` "로보틱스 붐" — 체화 AI 급등(v0.60 물리 산업 연계). deltas `{ compute: 18, automation: 2 }` cap `{ optimization: 1 }`. tags `["embodied_demand","hardware_capital"]`

### 시작도시 start_cities (+5 → 총 11)
1. `beijing` "베이징" — 거대 내수, 서방 신뢰 페널티. deltas `{ users: 300, cash: 600, trust: -3 }`. tags `["city_beijing","domestic_scale","trust_west_penalty"]`
2. `london` "런던" — 금융+규제 균형. deltas `{ cash: 1500, trust: 1 }` cap `{ safety: 1 }`. tags `["city_london","finance_market","reg_balance"]`
3. `bengaluru` "벵갈루루" — 인재 저비용·스케일 저렴. deltas `{ talent: 2, cash: 400 }` cap `{ code: 1 }`. tags `["city_bengaluru","talent_cheap","low_burn"]`
4. `singapore` "싱가포르" — 게이트웨이·엔터프라이즈·신뢰. deltas `{ cash: 1000, trust: 3 }` cap `{ enterprise: 1 }`. tags `["city_singapore","gateway_market","trust_dense"]`
5. `berlin` "베를린" — 프라이버시·오픈소스 문화. deltas `{ data: 12, hype: -2 }` cap `{ safety: 1 }`. tags `["city_berlin","oss_culture","privacy_culture"]`

### 시장 market_conditions (+4 → 총 8)
1. `funding_drought` "투자 혹한" — 자금 빡빡, 규율이 이김. deltas `{ cash: -1200, trust: 3 }`. tags `["funding_drought","disciplined_market"]`
2. `platform_gold_rush` "플랫폼 골드러시" — 유통 쉬움·이탈 높음. deltas `{ users: 350, hype: 6, trust: -2 }`. tags `["distribution_easy","high_churn"]`
3. `regulation_crackdown` "규제 단속" — 신뢰 프리미엄·화제성 페널티. deltas `{ trust: 6, hype: -8 }`. tags `["reg_crackdown","trust_premium"]`
4. `talent_war` "인재 전쟁" — 인재 고가·산출 높음. deltas `{ cash: -800, talent: 2 }`. tags `["talent_war","output_dense"]`

### 창업자 founder_traits (+4 → 총 9)
1. `designer_founder` "디자이너 창업자" — UX/화제성 우위, 인프라 약함. deltas `{ users: 120, hype: 6, compute: -5 }`. tags `["designer_founder","ux_bias"]`
2. `operator_founder` "오퍼레이터 창업자" — 효율적 번·꾸준한 유입. deltas `{ cash: 1500, users: 80 }`. tags `["operator_founder","efficiency_bias"]`
3. `academic_founder` "아카데믹 창업자" — 언어/안전 깊음, 현금 느림. deltas `{ data: 45, cash: -500 }` cap `{ language: 1, safety: 1 }`. tags `["academic_founder","theory_bias"]`
4. `serial_founder` "연쇄창업가" — 자금+네트워크, 기대치 부담. deltas `{ cash: 2500, trust: 3, hype: 3 }`. tags `["serial_founder","network_bias"]`

### 새 태그의 tag_effects (월간 효과 — 보수적, 기존 패턴 범위)
시작 보정만 의도하는 태그(city_* 등 식별 태그)는 월간 효과 0 → `tag_effects` 미정의 OK. 아래는 **월간으로 작동시킬** 태그만 정의(예시 수치, 조정 가능):
- `research_fast: { data: 3 }`, `safety_scrutiny: { hype: -1 }`
- `data_scarce: { data: -3 }`, `synthetic_premium: { cash: -20 }`
- `export_controls: { compute: -3 }`, `compute_regional: { compute: -2 }`
- `privacy_strict: { data: -2 }`, `consent_economy: { trust: 1 }`
- `distribution_locked: { users: -30 }`, `platform_tax: { cash: -30 }`
- `funding_drought_world: { cash: -60 }`, `skeptic_market: { hype: -1 }`
- `embodied_demand: { users: 40 }`, `hardware_capital: { compute: 2 }`
- `funding_drought: { cash: -50 }`, `disciplined_market: { trust: 1 }`
- `distribution_easy: { users: 60 }`, `high_churn: { trust: -1 }`
- `reg_crackdown: { hype: -2 }`, `trust_premium: { trust: 1 }`
- `talent_war: { cash: -40 }`, `output_dense: { data: 2 }`
- `domestic_scale: { users: 50 }`, `trust_west_penalty: { trust: -1 }`
- `oss_culture: { data: 2 }`, `efficiency_bias: { cash: 30 }`, `embodied`/식별 태그는 생략

> 균형 주의 — 한 런이 받는 태그는 4축 합쳐 보통 6~10개. 합산 월간 효과가 한 자원을 폭주시키지 않게(특히 cash/users) 합이 기존 boom/winter 범위(±100 cash, ±100 users 월) 안에 들도록 보수적으로. 표준 런은 어차피 무보정.

## 검증 (`scripts/harness/validate-data.mjs`)
run_modifiers 검증을 확장 — 각 축 항목의 `id` 유니크, default 항목 존재 & `starting_deltas` 비어있음, 모든 항목 `tags` 비어있지 않음, 항목이 다는 태그 중 `tag_effects`에 없는 것은 "시작 전용 태그"로 허용하되 알 수 없는 자원 id를 effects에 쓰면 실패.

## 파일 소유권 (병렬 안전 — 반드시 지킬 것)
이 블록은 v0.63 블록 #4(리빌 UI 트랙)와 **병렬로 돌 수 있다**. 경계 엄수:
- 편집 가능 — `data/run_modifiers.json`, `scripts/harness/validate-data.mjs`, **신규** `src/game/run-modifiers-content.test.ts`(기존 `run-modifiers.test.ts`는 #4 소유이므로 건드리지 말고 새 파일에 작성).
- 편집 금지 — `src/game/run-modifiers.ts`(데이터만 추가, 코드 불필요), `simulation.ts`, `types.ts`, 세이브, `qa-scenarios.ts`, UI 컴포넌트, 계약 파일.

## 테스트 (`src/game/run-modifiers-content.test.ts` — 신규 파일)
- 각 축 개수(12/11/8/9)와 id 유니크.
- default 4종 무보정(`selectRunModifierConfig()` = 무보정, `getRunModifierMonthlyEffects(기본상태)` = `{}`) — **회귀 가드**.
- 새 세계관 몇 개에 대해 `selectRunModifierConfig({worldLoreId})`가 의도한 deltas/tags를 싣는지.
- 시드 결정론 유지(같은 시드=같은 4축 선택), 확장 후에도.
- 모든 `tag_effects` 자원 id가 `resources`에 존재.
- 표준 런 10년 완주 불변(기존 게이트로 충분하면 추가 테스트 생략 가능).

## 완료 기준
1. `data/run_modifiers.json` — 위 항목 추가(개수 12/11/8/9), default 무보정 유지, 새 태그 effects 정의.
2. `validate-data.mjs` run_modifiers 검증 확장.
3. `run-modifiers.test.ts` 확장 — 개수/유니크/default 무보정 회귀 가드/시드 결정론/effects 자원 유효성.
4. `npm run harness:gate` 통과(45 files / 기존+α tests, 표준 런 완주 유지).
5. `reports/qa/v0_64_block1_run.md` — 추가 항목 요약, 조합 수 계산, default 무보정 확인, 게이트 출력.

## 세션 종료 시
`git commit` 금지. 마지막 메시지에 변경 파일 + 추가 콘텐츠 개수 + default 무보정 확인 + 표준 런 완주 + 게이트 출력. 계약 파일 편집 금지.
