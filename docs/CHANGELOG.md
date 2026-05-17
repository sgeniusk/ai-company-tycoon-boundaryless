# Changelog — AI Company Tycoon: Boundaryless

이 파일은 최근 주요 변경만 축약해서 남긴다. 세부 검증 기록은 `reports/`의 버전별 보고서를 기준으로 한다.

---

## [0.30-alpha] — 2026-05-17

### 도우미 캐릭터 튜토리얼

**추가:**
- 도우미 캐릭터 `미나`가 첫 시작, 첫 고용, 제품 조합실, 개발 프로젝트, 카드 보상, 사무실 성장, 경쟁사 압박을 순차적으로 안내한다.
- 튜토리얼 안내는 `seenTutorials`로 저장되어 한 번 읽은 안내가 반복 노출되지 않는다.
- 안내 액션 버튼은 관련 메뉴로 이동하면서 해당 튜토리얼을 읽음 처리한다.
- 로그라이트 새 런을 시작해도 이미 본 튜토리얼은 유지되어 반복 플레이를 방해하지 않는다.
- 고정 게임 화면 안에 픽셀풍 도우미 말풍선을 추가해 새 기능을 웹페이지 설명문이 아니라 게임 내 안내로 전달한다.

**검증:**
- `npm test -- src/game/tutorial-guide.test.ts src/ui/layout-contract.test.ts` 통과, 2 files / 20 tests
- 전체 하네스와 브라우저 QA 결과는 `reports/qa/alpha_v0_30_qa.md`에 기록한다.

---

## [0.29-alpha] — 2026-05-17

### 사무실 성장 플래너와 공간 선택 강화

**추가:**
- `getOfficeGrowthPlan()`을 추가해 현재 사무실, 다음 확장, 다음 지역 이전, 활성/다음 장식 시너지를 한 번에 계산한다.
- 사무실 성장 플래너가 팀 수용 한도, 장식 슬롯, 다음 시너지에 따라 우선 행동을 추천한다.
- 다음 장식 시너지를 완성할 구매/배치 후보를 점수화하고 상점 콘솔에서 바로 실행할 수 있게 했다.
- 상점의 사무실 패널에 `사무실 확장 vs 지역 이전` 비교 카드를 추가했다.
- 배치된 장식이 활성 시너지에 어떻게 연결되는지 추적할 수 있는 기반 데이터를 추가했다.

**검증:**
- `npm test -- src/game/office-growth.test.ts src/ui/layout-contract.test.ts` 통과, 2 files / 18 tests
- `npm run harness:gate` 통과, 33 files / 208 tests, 데이터 검증 통과, 프로덕션 빌드 통과
- Headless Chrome screenshot QA: `http://127.0.0.1:5181/?scenario=office&menu=shop` 데스크톱/모바일 렌더링 확인

---

## [0.28-alpha] — 2026-05-17

### 조합형 제품과 리뉴얼의 실제 개발 루프 연결

**추가:**
- 아이디어 조합실 결과를 실제 `ProductDefinition`으로 변환해 개발 프로젝트를 시작할 수 있게 했다.
- 조합형 제품은 출시 전에는 개발 프로젝트로만 존재하고, 완성 후 정식 활성 제품/리뷰/카드 보상/월간 경제에 포함된다.
- 출시한 기존 제품은 `메이저 업데이트`, `리뉴얼 출시`, `파생 제품` 후보 중 하나를 골라 리뉴얼 개발 프로젝트로 진행할 수 있다.
- 리뉴얼 프로젝트는 즉시 레벨업이 아니라 개발 기간을 거친 뒤 `AI 글쓰기 비서 v2` 같은 출시명으로 시장 반응을 만든다.
- 생성 제품 저장/불러오기 호환을 위해 세이브 버전을 8로 올리고 `generatedProducts`를 정식 상태에 추가했다.
- 제품 메뉴, 사무실 HUD, 덱 퍼즐, 런 요약, 출시 충격 패널이 생성 제품을 정식 제품처럼 읽도록 연결했다.

**검증:**
- `npm test -- src/game/product-concept-projects.test.ts src/ui/layout-contract.test.ts` 통과, 2 files / 18 tests
- `npm run validate:data` 통과
- `npm run harness:gate` 통과, 32 files / 205 tests, 데이터 검증 통과, 프로덕션 빌드 통과
- Headless Chrome screenshot QA: `http://172.20.10.3:5180/?scenario=launch-impact&menu=products` 데스크톱/모바일 렌더링 확인

---

## [0.27-alpha] — 2026-05-17

### 제품 아이디어 조합실과 리뉴얼 출시 기반

**추가:**
- `data/product_ideas.json`을 추가해 소재/산업 24개, 제품 타입 12개, 파격 옵션 18개, 특수 궁합 규칙 36개를 데이터화했다.
- `createProductConcept()` 조합 엔진을 추가해 모든 소재 × 타입 × 옵션 조합이 제목, 피치, 궁합 점수, 비용, 필요 역량, 강점/위험을 생성한다.
- 기존 제품을 `메이저 업데이트`, `리뉴얼 출시`, `파생 제품`으로 다시 출시할 수 있는 후보 모델을 추가했다.
- 제품 메뉴 상단에 `아이디어 조합실`과 `기존 제품 리뉴얼 후보` 패널을 추가했다.
- 데이터 검증 하네스가 제품 아이디어 데이터의 도메인, 역량, 조합 수, 궁합 규칙 수를 검사한다.

**검증:**
- `npm test -- src/game/product-ideas.test.ts src/ui/layout-contract.test.ts` 통과, 2 files / 19 tests
- `npm run validate:data` 통과
- `npm run harness:gate` 통과, 31 files / 202 tests, 데이터 검증 통과, 프로덕션 빌드 통과
- Headless Chrome screenshot QA: `http://127.0.0.1:5180/?scenario=launch-impact&menu=products` 데스크톱/모바일 렌더링 확인

---

## [0.26-alpha] — 2026-05-17

### 게임 화면 프레임 2차 압축

**변경:**
- 전체 기준 폭을 1366px 게임 화면 프레임으로 조정하고 우측 상시 콘솔 폭을 줄였다.
- 중앙 사무실 영역을 더 넓히고, 사무실 안에 월/운영/사무실/프로젝트 상태 HUD를 직접 얹었다.
- 사무실 하단에 현재 운영 알림 스트립을 추가해 다음 행동과 이슈가 화면 안에서 보이게 했다.
- 우측 메뉴를 웹페이지형 패널이 아니라 어두운 관리 콘솔 프레임으로 재정리했다.
- 모바일 폭에서 상단 상태바를 4개 핵심 값으로 압축해 사무실 장면이 보이도록 했다.

**검증:**
- `npm test -- src/ui/layout-contract.test.ts` 통과, 1 file / 14 tests
- `npm run harness:gate` 통과, 30 files / 197 tests, 데이터 검증 통과, 프로덕션 빌드 통과
- Headless Chrome screenshot QA: `http://127.0.0.1:5180/?scenario=launch-impact` 데스크톱/모바일 렌더링 확인

---

## [0.25-alpha] — 2026-05-17

### 콘텐츠 가속과 엔딩 커버리지

**추가:**
- `evaluateEndToEndCampaignCoverage()`를 추가해 10년 엔딩, 카드 보상 선택, 사무실 성장 커버리지를 함께 검증한다.
- 전략 카드 풀을 19장으로 확장했다.
- 로그라이트 메타 해금을 8개로 확장했다.
- 시작 덱을 7개로 확장했다.
- 사무실 확장 단계를 6단계로 확장했다.
- 사무실 장식 시너지를 8개로 확장했다.
- 아이템 풀을 45개로 확장했다.

**검증:**
- `npm test -- src/game/run-simulator.test.ts src/game/content-expansion.test.ts` 통과, 2 files / 9 tests
- `npm run validate:data` 통과
- `npm run harness:gate` 통과, 30 files / 193 tests, 데이터 검증 통과, 프로덕션 빌드 통과

---

## [0.24-alpha] — 2026-05-17

### 게임 화면형 레이아웃 압축

**변경:**
- 왼쪽 세로 자원판을 하단 자원 HUD로 옮겼다.
- 명령 버튼을 하단 고정 컨트롤 스트립으로 압축했다.
- 데스크톱 그리드를 `상단 HUD / 중앙 사무실 / 우측 메뉴 / 하단 HUD` 구조로 재배치했다.
- 태블릿/모바일 폭에서도 페이지 전체 스크롤이 아니라 내부 패널 스크롤을 우선하도록 조정했다.
- 좁은 화면 가로 잘림을 막기 위해 주요 그리드 자식의 `min-width` 계약을 추가했다.

**검증:**
- `npm test -- src/ui/layout-contract.test.ts` 통과, 1 file / 10 tests
- `npm run harness:gate` 통과, 29 files / 190 tests, 데이터 검증 통과, 프로덕션 빌드 통과
- Headless Chrome screenshot QA: `http://127.0.0.1:5180/?scenario=launch-impact` 데스크톱/모바일 렌더링 확인

---

## [0.23-alpha] — 2026-05-17

### 출시 체감과 공유 가능한 사건

**추가:**
- `v0.22` 출시 체감 패널을 추가했다.
- 출시 결과에 첫 5분 보상, 카드 보상, 카드 영향 배지를 표시한다.
- 최근 사용 카드가 개발 진행/완성도/신뢰 등에 준 영향을 출시 결과에서 보여준다.
- `?scenario=launch-impact` QA 시나리오를 추가했다.
- `evaluateSeasonChallengeBalance`로 시즌 과제 보상/압박 가드레일을 점검한다.
- `v0.23` 회사 기록 메뉴에 공유 가능한 하이라이트 카드를 추가했다.

**검증:**
- `npm test -- src/game/release-impact.test.ts src/game/shareable-moments.test.ts src/game/qa-scenarios.test.ts src/ui/layout-contract.test.ts src/game/run-simulator.test.ts` 통과, 5 files / 42 tests
- `npm run harness:gate` 통과, 29 files / 186 tests, 데이터 검증 통과, 프로덕션 빌드 통과
- Headless Chrome screenshot QA: `http://127.0.0.1:5180/?scenario=launch-impact` 렌더링 확인, `/tmp/ai-company-v023-launch-impact.png`

---

## [0.21-alpha] — 2026-05-17

### 20인 검증과 보조 패널 압축

**추가:**
- 20인 페르소나 데이터를 남성 10명, 여성 10명 구성으로 확장했다.
- 각 페르소나에 벤치마크와 우려점을 추가했다.
- `runPersonaPlaytestReview` 하네스를 추가해 평가 점수, 판정, 우선순위, 페르소나별 메모를 생성한다.
- `?scenario=persona20` QA 시나리오를 추가했다.
- 우측 보조 패널을 `목표 / 회사 / 월간 / 결과` 탭으로 압축했다.
- Vite `manualChunks`로 `react-vendor`, `game-data` 청크 분리를 시작했다.

**검증:**
- `npm test -- src/game/content.test.ts src/game/persona-playtest.test.ts src/game/qa-scenarios.test.ts src/ui/layout-contract.test.ts src/ui/build-config.test.ts` 통과, 5 files / 39 tests
- `npm run harness:gate` 통과, 27 files / 178 tests, 데이터 검증 통과, 프로덕션 빌드 통과
- Headless Chrome screenshot QA: `http://127.0.0.1:5179/?scenario=persona20` 렌더링 확인

---

## [0.20-alpha] — 2026-05-17

### 플레이테스트 후보 슬라이스

**추가:**
- `v0.15.7` 시즌 과제 보상/압박을 월간 진행에 연결했다.
- `v0.16.0` 중앙 보조 패널 카드에 높이 제한과 내부 스크롤을 추가했다.
- `v0.17.0` 10년 엔딩 랭크/엔딩명/생존 연수를 런 기록에 저장한다.
- `v0.18.0` 제품 메뉴에 `경계 확장 목표`를 추가했다.
- `v0.19.0` `evaluateAlphaReadiness` 통합 준비도 하네스를 추가했다.
- `v0.20` `?scenario=readiness` 브라우저 QA 시나리오를 추가했다.

**검증:**
- `npm run harness:gate` 통과, 25 files / 173 tests
- 데이터 검증 통과
- `npm run build` 통과
- Headless Chrome screenshot QA: `http://127.0.0.1:5178/?scenario=readiness` 렌더링 확인

---

## [0.15.6-alpha] — 2026-05-17

### 시즌 대응 과제

**추가:**
- 경쟁사 시즌을 행동 목표로 바꾸는 `getCompetitionSeasonChallenges`를 추가했다.
- 최대 압박 경쟁사 대응 과제와 신규 경쟁자 파동 대응 과제를 생성한다.
- 각 과제에 보상 예상, 방치 위험, 추천 제품, 추천 대응 카드를 표시한다.
- 회사 현황의 시장 시즌 패널에서 첫 대응 과제로 이동할 수 있다.
- 경쟁 메뉴 상단에 시즌 대응 과제 목록을 추가했다.

**검증:**
- `npm test -- src/game/competition-signals.test.ts` 통과, 4 tests
- `npm test -- src/game/competition-signals.test.ts src/game/qa-scenarios.test.ts` 통과, 27 tests
- `npm run build` 통과
- Headless Chrome screenshot QA: `http://127.0.0.1:5178/?scenario=ten-year-sim&menu=competition` 렌더링 확인

---

## [0.15.5-alpha] — 2026-05-17

### 경쟁사 시즌 브리프

**추가:**
- 현재 연차의 경쟁 상황을 요약하는 `getCompetitionSeasonBrief`를 추가했다.
- 올해 등장한 신규 경쟁사, 다음 예정 경쟁사, 최대 압박 경쟁사를 계산한다.
- 회사 현황 메뉴에 `시장 시즌` 패널을 추가했다.
- 경쟁 메뉴 상단에 `경쟁 시즌` 요약과 최대 압박 경쟁사를 표시한다.

**검증:**
- `npm test -- src/game/competition-signals.test.ts` 통과, 3 tests
- `npm test -- src/game/competition-signals.test.ts src/game/qa-scenarios.test.ts` 통과, 26 tests
- `npm run build` 통과
- Headless Chrome screenshot QA: `http://127.0.0.1:5178/?scenario=ten-year-sim&menu=competition` 렌더링 확인

---

## [0.15.4-alpha] — 2026-05-17

### 회사 승급 트랙

**추가:**
- 현재 회사 단계와 다음 단계 조건을 계산하는 `getCompanyStageProgress`를 추가했다.
- 메인 사무실 옆 회사 단계 카드에 `다음 승급` 미니 체크리스트를 표시한다.
- 회사 현황 메뉴에 `회사 승급 트랙` 패널을 추가했다.
- 다음 별 등급까지 필요한 출시 제품, 이용자, 신뢰, 자동화, 해금 분야 등을 읽기 쉬운 값으로 표시한다.

**검증:**
- `npm test -- src/game/campaign.test.ts` 통과, 5 tests
- `npm test -- src/game/campaign.test.ts src/ui/layout-contract.test.ts` 통과, 7 tests
- `npm run validate:data` 통과
- `npm run build` 통과
- Headless Chrome screenshot QA: `http://127.0.0.1:5178/?scenario=growth` 렌더링 확인

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
