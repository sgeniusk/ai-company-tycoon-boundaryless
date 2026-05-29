# Codex CLI 인계 — v0.61 블록 #2 (10년 캠페인 완주 게이트)

작성일: 2026-05-29
작성자: Claude Code (하네스/계약/플래닝 트랙)
대상: Codex CLI (gpt-5.5, reasoning effort **xhigh** — 조사·소프트락 수정 가능성, fast 모드 아님)
작업 디렉토리: `/Users/taewookkim/dev/ai-company-tycoon`
현재 feature: `v0.61-alpha-public-web-alpha` (블록 #1 완료·커밋 후 시작, 이번은 **블록 #2만**)
선행 조건: **블록 #1(저장/불러오기)이 커밋된 뒤** 시작한다. 워킹 트리가 깨끗한 상태에서 진행.

## 한 줄 요약

공개 알파의 핵심 약속은 "10년 캠페인을 끝까지 할 수 있다"이다. 시뮬 하네스는 이미 있으나 전략 하나(`productivity_line`)로만 검증된다. **모든 전략 + 신규 물리 산업 확장 경로가 120개월까지 소프트락 없이 완주**함을 증명하고, 막히면 고친다.

## 역할 분담

- 블록 #2 구현만. **`git commit` 금지.** Claude Code가 검증·커밋한다.
- **`AGENTS.md`/`feature_list.json`/`progress.md`/`CLAUDE.md`/`docs/ROADMAP.md` 편집 금지.**
- 증거는 `reports/qa/v0_61_block2_run.md`에만.

## 이미 존재하는 것 (재작성 금지, 강화만)

- `src/game/run-simulator.ts`
  - `runTenYearCampaignSimulation(strategyId = "productivity_line")` (line ~346) — 120개월 캠페인 시뮬, yearlySnapshots/milestones/finale 반환
  - `evaluateAlphaReadiness()` (line ~126) — 게이트 4종(commercial_paths / ten_year_campaign / integrity / ending). **단 ten_year 게이트가 productivity_line 하나만 돌림** (line ~128)
  - `evaluateEndToEndCampaignCoverage(strategyId)` (line ~214)
  - `runAllCommercialSimulations()` — growthPaths 전 전략 상업 시뮬 (단 11개월 타깃)
- `src/game/campaign.ts` — `CAMPAIGN_FINAL_MONTH`, `getCampaignFinale`, `getCompanyStarRating`
- `src/game/run-simulator.test.ts` — 기존 테스트(여기 확장)
- `data/growth_paths.json` — 전략 id 목록 (전 전략 완주 검증 대상)

## 확인된 빈틈 (이번 블록의 타깃)

1. 10년 완주가 **`productivity_line` 한 전략으로만** 검증됨 → 전 전략 미검증
2. 신규 v0.60 물리 산업(manufacturing/logistics/energy)으로 확장하는 캠페인 완주 미검증
3. `AlphaReadinessReport.versionTarget = "v0.20-alpha"`, `EndToEndCampaignCoverageReport.versionTarget = "v0.25-alpha"` → **stale** (현재 v0.61)

## 작업 내용

### 1. 전 전략 10년 완주 테스트 (가장 중요)
`run-simulator.test.ts`에 추가. `growthPaths`의 **모든** 전략 id에 대해 `runTenYearCampaignSimulation(id)`를 돌리고 각각.
- `finalState.month >= CAMPAIGN_FINAL_MONTH` (120개월 완주)
- `finalState.status !== "failure"`
- `integrity.ok === true`
- `finale`가 존재 (엔딩 도달)
- `annualReviewCount`가 기대 수(10)에 도달

### 2. 물리 산업 확장 경로 완주
v0.60 신규 산업을 타는 캠페인이 소프트락 없이 완주하는지 확인. 기존 시뮬이 manufacturing/logistics/energy 도메인·제품·시너지·조합을 자연히 거치는지 보고, 안 거치면 그 경로를 강제하는 케이스를 하나 추가해 완주를 단언. (별도 전략 추가가 과하면, 기존 시뮬 경로에서 신규 산업이 등장하는지 점검 + 등장 시 완주 확인으로 충분.)

### 3. readiness 리포트 versionTarget 갱신
`AlphaReadinessReport`/`EndToEndCampaignCoverageReport`의 stale versionTarget을 현재값(`"v0.61-alpha"` 또는 공유 상수)으로 갱신. `evaluateAlphaReadiness`의 ten_year 게이트가 전 전략(또는 대표 다수)을 평가하도록 강화하는 것도 고려(과하면 #1 전략 유지 + 테스트로 전 전략 커버).

### 4. 소프트락/블로커 수정
완주 못 하는 전략이 있으면 **근본 원인을 진단**(자원 고갈로 더 진행 불가, 특정 월에 멈춤 등)하고 최소 수정. 이게 이 블록의 실제 안정화 가치다. tick 로직을 바꿔야 하면 결정론을 유지하고 회귀 테스트를 붙인다.

### 5. (선택) QA 스크립트
`package.json`에 `qa:alpha-readiness`(예: `node`로 `evaluateAlphaReadiness` 출력) 같은 수동 QA 훅 추가 고려. 과하면 생략.

## 제약

- 시뮬 엔진을 **재작성하지 않는다.** 커버리지 강화 + 필요한 최소 소프트락 수정만.
- 캠페인 시뮬은 **결정론적**이어야 한다 (테스트가 결정론에 의존). 난수 도입 금지.
- `simulation.ts` tick 변경은 실제 소프트락 수정에 한정하고, 회귀 테스트로 보호.
- 기존 밸런스를 임의로 바꾸지 않는다 (완주를 막는 명백한 블로커만 수정).
- `npm run harness:gate` 통과 (블록 #1 이후 테스트 수 기준 + 신규 테스트만큼 증가).

## 완료 기준

1. growthPaths 전 전략이 120개월 완주(status != failure, integrity ok, finale 존재)함을 테스트로 증명.
2. 신규 물리 산업 확장 경로의 완주(또는 등장+완주) 확인.
3. readiness versionTarget stale 값 갱신.
4. 발견된 소프트락이 있으면 수정 + 회귀 테스트.
5. `npm run harness:gate` 통과.
6. `reports/qa/v0_61_block2_run.md` — 전 전략 완주 결과 표(전략별 최종 월/상태/별점), 발견·수정한 블로커, simulation.ts 변경 여부와 이유, 최종 게이트 출력.

## 세션 종료 시

`git commit` 금지. 마지막 메시지에 변경 파일 + 전 전략 완주 요약 + simulation.ts 변경 여부 + 게이트 결과. 계약 파일 편집 금지.
