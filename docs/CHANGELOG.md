# Changelog — AI Company Tycoon: Boundaryless

이 파일은 최근 주요 변경만 축약해서 남긴다. 세부 검증 기록은 `reports/`의 버전별 보고서를 기준으로 한다.

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
