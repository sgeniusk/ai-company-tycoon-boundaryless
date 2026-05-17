# Changelog — AI Company Tycoon: Boundaryless

이 파일은 최근 주요 변경만 축약해서 남긴다. 세부 검증 기록은 `reports/`의 버전별 보고서를 기준으로 한다.

---

## [0.4.2-alpha] — 2026-05-17

### 사무실 확장 월간 효과

**추가:**
- 사무실 확장 단계별 `monthly_effects`를 추가했다.
- 현재 사무실 단계의 월간 효과를 계산하는 `getOfficeMonthlyEffects`를 추가했다.
- 월간 진행 시 사무실 효과가 `strategyEffects`에 합산된다.
- 상점/인벤토리 패널에서 현재 사무실과 다음 확장의 월간 효과를 표시한다.

**검증:**
- `npm test -- src/game/office.test.ts src/game/qa-scenarios.test.ts` 통과, 31 tests
- `npm run validate:data` 통과
- `npm run build` 통과
- Headless Chrome screenshot QA: `http://127.0.0.1:5178/?scenario=office` 렌더링 확인

---

## [0.4.1-alpha] — 2026-05-17

### 사람/AI/로봇 인력 조합 시너지

**추가:**
- 인력 조합 시너지 데이터 `data/workforce_synergies.json`를 추가했다.
- 사람 직원, AI 에이전트, 로봇 인력 조합에 따라 프로젝트 진행/완성도 보너스를 계산한다.
- 제품 개발 예측과 실제 월간 개발 진행에 인력 조합 보너스를 반영했다.
- 에이전트 화면에 `팀 조합` 패널과 다음 후보를 표시했다.

**검증:**
- `npm test -- src/game/simulation.test.ts` 통과, 28 tests
- `npm test -- src/game/simulation.test.ts src/game/content-foundation.test.ts src/game/qa-scenarios.test.ts` 통과, 56 tests
- `npm run validate:data` 통과
- `npm run build` 통과
- Headless Chrome screenshot QA: `http://127.0.0.1:5178/?scenario=staffing&menu=agents` 렌더링 확인

---

## [0.4.0-alpha] — 2026-05-17

### 사무실 장식 조합 시너지

**추가:**
- 사무실 시너지 데이터 `data/office_synergies.json`를 추가했다.
- 배치된 장식 기준으로 활성 시너지와 다음 후보를 계산하는 `getOfficeSynergySummary`를 추가했다.
- 활성 사무실 시너지의 월간 효과가 운영 진행에 반영된다.
- 상점 상단과 인벤토리/투자 패널에 사무실 시너지 상태를 표시했다.

**검증:**
- `npm test -- src/game/office.test.ts` 통과, 7 tests
- `npm test -- src/game/office.test.ts src/game/qa-scenarios.test.ts` 통과, 30 tests
- `npm run validate:data` 통과
- `npm run build` 통과
- Headless Chrome screenshot QA: `http://127.0.0.1:5178/?scenario=office` 렌더링 확인

---

## [0.3-alpha completion] — 2026-05-17

### 덱빌딩과 로그라이트 깊이

**추가:**
- 덱 아키타입 데이터 `data/deck_archetypes.json`를 추가했다.
- 시작 덱 데이터 `data/starter_decks.json`를 추가했다.
- 현재 덱을 `신뢰 하네스`, `런칭 과열`, `자동화 운영`, `라이벌 카운터`, `연구 복리` 빌드로 평가하는 아키타입 요약을 추가했다.
- 메타 해금에 따라 다음 런의 시작 덱을 선택할 수 있게 했다.
- 덱 화면에 현재 빌드 패널과 다음 런 시작 덱 선택 영역을 추가했다.

**검증:**
- `npm test -- src/game/deckbuilding.test.ts` 통과, 16 tests
- `npm run validate:data` 통과
- `npm run build` 통과
- Headless Chrome screenshot QA: `http://127.0.0.1:5178/?scenario=deck` 렌더링 확인

---

## [0.15.3-playtest] — 2026-05-17

### 20인 페르소나 실제 실행 플레이테스트

**추가:**
- `reports/playtests/alpha_v0_15_3_persona20_playtest.md`에 실제 브라우저 렌더링 기반 20인 페르소나 플레이테스트 보고서를 추가했다.
- 첫 진입, 연간 전략 제품 메뉴, 10년 압축 캠페인 엔딩 상태를 각각 확인했다.
- 다음 개발 우선순위를 첫 30초 안내, 직원/에이전트 배치감, 출시 보상 연출, 우측 UI 압축, 덱 아키타입 표시로 정리했다.

**검증:**
- `npm run harness:gate` 통과, 158 tests, 데이터 검증 통과, 프로덕션 빌드 통과
- Headless Chrome screenshot QA 3종 통과: 첫 진입, 연간 전략 제품 메뉴, 10년 캠페인 엔딩

---

## [0.15.3-alpha] — 2026-05-17

### 10년 캠페인 압축 플레이 하네스

**추가:**
- `runTenYearCampaignSimulation` 장기 캠페인 하네스를 추가했다.
- 120개월 진행 결과, 연간 스냅샷, 연간 심사 통과 수, 운영 지시 선택 수, 주요 마일스톤을 기록한다.
- `?scenario=ten-year-sim` 브라우저 QA 시나리오를 추가했다.

**검증:**
- `npm test -- src/game/run-simulator.test.ts src/game/qa-scenarios.test.ts` 통과, 27 tests
- `npm run harness:gate` 통과, 158 tests, 데이터 검증 통과, 프로덕션 빌드 통과
- Headless Chrome screenshot QA: `http://127.0.0.1:5178/?scenario=ten-year-sim` 1366x768 렌더링 확인, 10년차 엔딩 화면 표시 확인

---

## [0.15.2-alpha] — 2026-05-17

### 전략실 추천 실행감

**추가:**
- 제품, 연구, 경쟁 메뉴에 `전략실 추천` 상단 포커스 스트립을 추가했다.
- 추천 대상 제품/연구/경쟁사 카드에 강조 스타일을 적용했다.
- QA URL에서 `menu` 파라미터로 초기 메뉴를 덮어쓸 수 있게 했다.

**검증:**
- `npm test -- src/game/annual-strategy-advisor.test.ts src/game/qa-scenarios.test.ts` 통과, 26 tests
- `npm run harness:gate` 통과, 156 tests, 데이터 검증 통과, 프로덕션 빌드 통과
- Headless Chrome screenshot QA: `http://127.0.0.1:5178/?scenario=annual-strategy&menu=products` 1366x768 렌더링 확인, 제품 메뉴 전략실 포커스 표시 확인

---

## [0.15.1-alpha] — 2026-05-16

### 연간 전략실 액션화와 문서 정리

**추가:**
- 연간 전략실 추천에 `제품 후보 보기`, `연구 후보 보기`, `경쟁 대응 보기` 액션을 추가했다.
- 회사 화면의 전략실 액션 버튼이 해당 메뉴로 이동한다.

**문서:**
- 로드맵을 현재 상태와 앞으로의 계획 중심으로 재작성했다.
- 변경 기록은 최근 주요 버전 중심으로 축약했다.

**검증:**
- `npm test -- src/game/annual-strategy-advisor.test.ts src/game/qa-scenarios.test.ts` 통과, 23 tests
- `npm run harness:gate` 통과, 153 tests, 데이터 검증 통과, 프로덕션 빌드 통과
- Headless Chrome screenshot QA: `http://127.0.0.1:5178/?scenario=annual-strategy` 1366x768 렌더링 확인, 전략실 액션 버튼 3종 표시 확인

---

## [0.15.0-alpha] — 2026-05-16

### 연간 전략실

활성 연간 운영 지시를 제품, 연구, 경쟁 대응 추천으로 확장했다. `?scenario=annual-strategy` QA 시나리오에서 회사 화면의 `연간 전략실`을 바로 확인할 수 있다.

**검증:**
- `npm run harness:gate` 통과, 153 tests, 데이터 검증 통과, 프로덕션 빌드 통과
- Headless Chrome screenshot QA 통과

---

## [0.14.9-alpha] — 2026-05-16

### 보상 카드 지시 보너스 배지

보상 카드별로 현재 연간 지시와 일치하는 태그를 보여 주는 `지시 보너스` 배지를 추가했다.

**검증:**
- `npm run harness:gate` 통과, 150 tests, 데이터 검증 통과, 프로덕션 빌드 통과
- Headless Chrome screenshot QA 통과

---

## [0.14.x-alpha] — 2026-05-16

### 연간 심사와 운영 지시 기반

10년 캠페인용 연간 심사, 통과/미달 보상, 다음 해 운영 지시, 연간 지시 3택1, 카드 보상 편향을 추가했다.

세부 기록:

- `reports/production_alpha_v0_14_3_annual_reviews.md`
- `reports/production_alpha_v0_14_4_annual_directives.md`
- `reports/production_alpha_v0_14_5_annual_directive_choices.md`
- `reports/production_alpha_v0_14_6_directive_card_rewards.md`
- `reports/production_alpha_v0_14_7_reward_bias_visibility.md`
- `reports/production_alpha_v0_14_8_reward_bias_qa.md`

---

## 이전 기록

`v0.13.x` 이전의 상세 로그는 `reports/`, `reports/qa/`, `reports/balance/`, `reports/playtests/` 폴더를 기준 기록으로 둔다.
