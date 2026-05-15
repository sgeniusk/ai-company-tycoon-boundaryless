# Changelog — AI Company Tycoon: Boundaryless

All notable changes to this project will be documented in this file.

---

## [0.12.8-alpha] — 2026-05-16

### 첫 10분 행동 흐름 압축

**추가:**
- `getFirstTenMinutePlan` 행동 큐.
- 첫 10분 루프: `에이전트 고용 → 제품 시작 → 카드/이슈 대응 → 첫 출시 → 성장 선택 → 사무실 정비 → 경쟁 대응`.
- 첫 10분 진행률 계산 `getFirstTenMinuteProgress`.
- 가이드 카드 안의 `첫 10분 루프` 로드맵 UI.
- 상황별 우선순위 라벨과 보조 설명 문구.
- `?scenario=flow` 브라우저 QA 시나리오.

**변경:**
- 활성 프로젝트가 있을 때 바로 `다음 달`을 누르기보다 먼저 덱/개발 이슈 대응을 안내한다.
- 출시 후 성장 선택이 끝나면 상점/사무실 정비를 먼저 보여 준다.
- 사무실 정비 후에는 경쟁사 대응 플랜 확인으로 이어지게 했다.
- 이벤트가 열려 있어도 첫 10분 핵심 행동 큐가 계속 보이게 했다.

**검증:**
- `npm test -- src/game/guidance.test.ts src/game/qa-scenarios.test.ts` 통과, 25 tests
- `npm run harness:gate` 통과, 110 tests
- Headless Chrome DOM QA: `http://127.0.0.1:5173/?scenario=flow`에서 첫 10분 루프 렌더링 확인

---

## [0.12.7-alpha] — 2026-05-16

### 사무실 확장과 회사 꾸미기 효과

**추가:**
- `data/office_expansions.json` 데이터 파일.
- 사무실 단계: 차고형 연구실, 스타트업 스위트, 성장층 오피스, 캠퍼스 연구동.
- `GameState.office` 상태: 현재 사무실 확장 단계와 배치된 장식 아이템.
- 고용 한도: 사무실 단계에 따라 3명, 5명, 8명, 12명까지 확장.
- 장식 슬롯: 사무실 단계에 따라 3칸, 5칸, 7칸, 10칸까지 확장.
- 사무실/회사 아이템 자동 배치, 보관, 재배치 기능.
- 배치된 장식 아이템만 프로젝트 예측과 개발 품질에 글로벌 스탯 보너스로 반영.
- 상점의 `사무실 확장`, `배치된 장식`, `보관 중 장식` UI.
- 회사/사무실 화면의 사무실 이름, 고용 한도, 장식 슬롯 표시.
- `?scenario=office` 브라우저 QA 시나리오.

**변경:**
- 고용 가능 여부가 자원/해금 조건뿐 아니라 사무실 수용 인원도 확인한다.
- 저장 버전을 `6`으로 올리고, 기존 저장에는 기본 사무실과 배치 장식을 안전하게 보강한다.
- 사무실 무대가 확장 단계에 따라 더 넓은 높이와 더 많은 직원 위치를 지원한다.

**검증:**
- `npm test -- src/game/office.test.ts src/game/qa-scenarios.test.ts` 통과, 18 tests
- `npm run harness:gate` 통과, 104 tests
- Headless Chrome DOM QA: `http://127.0.0.1:5173/?scenario=office`에서 사무실 확장/장식 UI 렌더링 확인

---

## [0.12.6-alpha] — 2026-05-16

### 경쟁사 대응 플랜과 카운터 카드

**추가:**
- 경쟁사 압박을 점수화하는 `rival-counters` 모듈.
- 경쟁사별 추천 대응 카드, 추천 제품, 추천 연구 목록.
- 신규 전략 카드 3장: `경쟁사 벤치마크룸`, `시장 리포지셔닝`, `상호운용 방어막`.
- 전략 카드 효과 `rival_score_delta`, `rival_momentum_delta`.
- 카운터 카드 사용 시 가장 압박이 큰 경쟁사의 위협/모멘텀 감소.
- 경쟁 메뉴의 상위 대응 플랜, 랭킹 대응 힌트, 경쟁사 카드별 추천 대응 표시.
- 덱 메뉴의 최우선 경쟁 대응 추천 표시.
- `?scenario=counter` 브라우저 QA 시나리오.
- 경쟁 대응 순수 함수와 카드 실행 테스트.

**변경:**
- 데이터 검증기가 경쟁사 카운터 카드 효과를 허용하고 검증한다.
- 카드 효과 표시가 경쟁 위협/경쟁 모멘텀을 한글 라벨로 보여준다.
- 경쟁사 압박이 단순 결과 요약을 넘어 다음 카드/제품/연구 선택으로 이어지게 했다.

**검증:**
- `npm test -- src/game/rival-counters.test.ts src/game/deckbuilding.test.ts src/game/qa-scenarios.test.ts` 통과, 25 tests
- `npm run harness:gate` 통과, 98 tests
- Headless Chrome DOM QA: `http://127.0.0.1:5173/?scenario=counter`에서 대응 플랜/추천 대응 렌더링 확인

---

## [0.12.5-alpha] — 2026-05-16

### 런 결과, 메타 진행, 제품 탐색 강화

**추가:**
- 런 결과 카드에 대표 제품, 대표 카드, 가장 큰 경쟁사 압박을 표시.
- 창업 통찰 보상과 산식 breakdown 표시.
- 실패/성공/10개월 종료 후 바로 `통찰 받고 새 런`을 시작하는 버튼.
- 새 런 시작 시 이전 런 기록을 `roguelite.runHistory`에 저장.
- 덱 메뉴의 로그라이트 해금 패널에 최근 런 기록 표시.
- 제품 메뉴 산업별 필터: 전체, 파운데이션 모델, 개인 생산성, 반도체, 로봇 등 제품 도메인별 탐색.
- `?scenario=result` 브라우저 QA 시나리오.
- 제품 필터 순수 함수와 테스트.

**변경:**
- 저장 버전을 `5`로 올리고, 기존 저장에는 빈 런 기록을 안전하게 보강.
- 런 요약이 단순 점수판이 아니라 “이번 회사의 이야기”를 보여주도록 확장.
- 제품 수가 늘어난 상태에서도 초반 제품과 후반 잠김 제품을 빠르게 구분할 수 있게 함.

**검증:**
- `npm test -- src/game/run-summary.test.ts src/game/product-filters.test.ts src/game/qa-scenarios.test.ts src/game/deckbuilding.test.ts src/game/save-integrity.test.ts` 통과, 32 tests
- `npm run build` 통과

---

## [0.12.4-alpha] — 2026-05-15

### AI 모델 출발과 경계 없는 산업 확장

**추가:**
- 첫 제품군으로 `파운데이션 모델 v0` 추가.
- 신규 도메인: 파운데이션 모델, AI 반도체, 모빌리티, 로봇, 기묘한 소비 산업, 장난감.
- 신규 제품: 프론티어 추론 모델, AI 학습 칩, 자율주행 AI 스택, 창고 로봇 플릿, AI 바리스타 카페 체인, 상상력 장난감 엔진.
- 신규 능력치 `로봇공학`.
- 로봇공학 Lv.1 이후 고용 가능한 `팩토리 로봇 유닛`.
- 초기 경쟁사 3개 추가: 모델포지, 칩스파크, 비전랩.
- 12개월차 강력 신규 경쟁사: 오토노바 모터스, 브루체인.
- 24개월차 강력 신규 경쟁사: 토이클라우드, 아이언오라클.
- `?scenario=rivals` 브라우저 QA 시나리오.
- 제품 화면의 산업 확장 지도와 경쟁 화면의 예정 경쟁사 표시.

**변경:**
- 개발 퍼즐 명칭을 `개발 이슈 대응`으로 낮춰, 직원/에이전트 배치가 기본 개발력이고 이슈 대응은 선택형 보너스임을 명확히 했다.
- 경쟁사 상태 생성이 `entry_month`를 지원해 매년 신규 경쟁사 등장을 표현할 수 있게 했다.
- 데이터 검증기가 경쟁사 등장 월, 경쟁사 티어, 등장 문구를 검증한다.

**검증:**
- `npm test -- src/game/boundaryless-expansion.test.ts src/game/simulation.test.ts src/game/qa-scenarios.test.ts` 통과, 42 tests
- `npm run validate:data` 통과

---

## [0.12.3-alpha] — 2026-05-15

### 카드 보상과 덱 편집

**추가:**
- 제품 출시 후 카드 보상 3택1 생성.
- 카드 보상 선택 시 선택 카드가 버림 더미에 추가되는 런 내 덱 성장 루프.
- 출시마다 덱 편집 토큰을 지급하는 구조.
- 덱 편집 토큰으로 카드 1장 제거 또는 카드 1종 강화.
- 강화 카드는 긍정 효과가 25% 상승하고, 카드 사용/퍼즐 보정에 반영.
- 덱 메뉴의 `카드 보상과 덱 편집` 패널.
- `?scenario=reward` 브라우저 QA 시나리오.

**변경:**
- 저장 버전을 `4`로 올리고, 기존 저장 데이터에는 덱 편집 토큰, 강화 카드, 보상 이력을 안전하게 보강.
- 상태 무결성 검증이 강화 카드와 대기 중인 카드 보상을 확인.
- 덱 메뉴 요약에 편집 토큰과 보상 대기 상태를 표시.

**검증:**
- `npm test -- src/game/deckbuilding.test.ts src/game/qa-scenarios.test.ts src/game/save-integrity.test.ts` 통과, 25 tests
- `npm run harness:gate` 통과, 88 tests
- `npm run validate:data` 통과
- `npm run build` 통과

---

## [0.12.2-alpha] — 2026-05-15

### 완성도 중심 출시와 직원 배치

**추가:**
- 제품 개발 시작 시 투입 에이전트를 플레이어가 직접 선택하는 UI.
- 선택 팀 기준 예상 개발 개월, 예상 완성도, 예상 리뷰 등급/점수, 월 완성도 상승 표시.
- 제품 프로젝트 예측 함수와 명시적 배치 검증.
- `?scenario=staffing` 브라우저 QA 시나리오.
- 상점 화면의 인벤토리 요약, 장착 대기 장비, 사무실 효과 목록.
- 사무실 화면의 실제 고용 에이전트 스프라이트, 이름표, 프로젝트 보드.

**변경:**
- 프로젝트 월간 진행도는 팀 능력치에 크게 흔들리지 않도록 고정하고, 팀 조합은 완성도와 출시 리뷰에 더 크게 반영.
- 출시 리뷰 산식에서 프로젝트 완성도 가중치를 강화.
- 제품 메뉴 설명을 “개발 기간 차이”보다 “팀 조합, 카드, 퍼즐 선택이 완성도를 가른다”는 방향으로 변경.

**검증:**
- `npm run harness:gate` 통과, 84 tests
- `npm test -- src/game/simulation.test.ts` 통과, 27 tests
- `npm test -- src/game/qa-scenarios.test.ts` 통과, 10 tests
- `npm test -- src/game/simulation.test.ts src/game/deckbuilding.test.ts` 통과, 34 tests
- `npm run build` 통과
- 브라우저 QA: `staffing`, `shop`, `deck`, `project` 시나리오 핵심 UI 확인

---

## [0.12.1-alpha] — 2026-05-15

### 카드와 퍼즐의 직접 조작

**추가:**
- 개발 퍼즐 칸을 직접 선택하고 해결하는 UI.
- 퍼즐 선택 제한 검증과 해결 가능 여부 안내.
- 카드가 다음 퍼즐의 점수, 난이도, 선택 가능 칸 수를 바꾸는 보정 시스템.
- 퍼즐 결과에 적용된 카드 보정 이름 표시.
- 카드-퍼즐 상호작용 테스트.

**변경:**
- `GPU 버스트`, `고객 인터뷰`, `세이프티 리뷰` 등 전략 카드에 퍼즐 보정 효과를 추가.
- `덱` 메뉴의 퍼즐 버튼을 `상위 이슈 해결`에서 `선택 이슈 해결`로 변경.
- 저장 상태에 활성 퍼즐 보정 목록을 포함하고, 오래된 저장은 빈 목록으로 복구.
- 데이터 검증기가 퍼즐 관련 카드 효과를 허용하고 검증.

**검증:**
- `npm test` 통과, 80 tests
- `npm run validate:data` 통과
- `npm run build` 통과
- `npm run harness:gate` 통과

**배포:**
- GitHub 공개 저장소 생성 및 `main` 푸시 완료: https://github.com/sgeniusk/ai-company-tycoon-boundaryless
- Vercel 프로덕션 배포 완료: https://ai-company-tycoon.vercel.app

---

## [0.12.0-alpha] — 2026-05-15

### 로그라이트 덱빌딩 전환 기반

**추가:**
- 시작 덱, 손패, 드로우 더미, 버림 더미를 포함한 전략 덱 시스템.
- `data/strategy_cards.json`과 `data/meta_unlocks.json` 데이터 파일.
- 전략 카드 사용으로 자원, 개발 진행도, 완성도를 바꾸는 게임 로직.
- 3x3 개발 퍼즐 프로토타입과 프로젝트 진행/완성도 반영.
- 창업 통찰, 메타 해금, 새 런 시작 기능.
- 덱/퍼즐/메타 해금을 다루는 새 `덱` 메뉴.
- `?scenario=deck` 브라우저 QA 시나리오.
- 로그라이트 덱빌딩 전환 설계 문서와 제작 에이전트 조직도.

**변경:**
- 현재 장르 방향을 “카이로소프트식 AI 회사 경영 + 로그라이트 덱빌딩 + 개발 퍼즐”로 재정의.
- 상단 상태 영역에 런 번호와 창업 통찰을 표시.
- 저장 버전을 `3`으로 올리고 기존 저장에는 기본 로그라이트 상태를 보강.
- 데이터 검증기가 전략 카드와 메타 해금 참조를 검증.

**검증:**
- `npm test` 통과, 78 tests
- `npm run validate:data` 통과
- `npm run build` 통과

---

## [0.11.0-alpha] — 2026-05-15

### Commercial Readiness Systems Before Final Graphics

**Added:**
- Data-driven run achievements with one-time rewards and company-panel progress.
- Growth-path monthly strategy effects and monthly report/timeline surfacing.
- Run summary grading with rank, strengths, verdict, and next recommendation.
- Safe save hydration and `validateGameStateIntegrity` diagnostics.
- Scripted commercial balance simulator covering all growth paths.
- Product level upgrades for active products with level-scaled revenue, users, data, and compute pressure.
- `?scenario=commercial` browser QA scenario for final-summary and long-run checks.

**Updated:**
- Productivity growth path now gives enough early cash support to branch into a second product.
- Run summary scoring now penalizes heavy negative cash instead of over-rewarding growth alone.
- QA scenario docs include commercial readiness checks.

**Verification:**
- `npm test` passed, 72 tests
- `npm run validate:data` passed
- `npm run build` passed
- Chrome visual QA passed at `http://127.0.0.1:5178/?scenario=commercial`

---

## [0.10.1-alpha] — 2026-05-15

### Strategy And Arc QA Scenarios

**Added:**
- `?scenario=strategy` for chosen-path competition signal QA
- `?scenario=arc` for 10-month MVP arc and follow-up objective QA
- Tests for the new scenario IDs and URL parsing

**Updated:**
- QA scenario documentation now includes strategy and arc URLs/checklists

**Verification:**
- `npm test` passed
- `npm run validate:data` passed
- `npm run build` passed

---

## [0.10.0-alpha] — 2026-05-15

### Ten-Month MVP Arc

**Added:**
- 10-month MVP arc with five milestone checkpoints
- Progress percentage and milestone details in the company panel
- Tests for initial arc state and release/strategy progress

**Updated:**
- Company overview now shows both long-arc progress and chosen-strategy objectives

**Verification:**
- `npm test` passed, 52 tests
- `npm run validate:data` passed
- `npm run build` passed

---

## [0.9.9-alpha] — 2026-05-15

### Release Headlines And Market Reaction

**Added:**
- Release headline generation based on product and review score
- Market reaction copy for consumer, developer, and enterprise launches
- Release spotlight display for headline and reaction text
- Save hydration backfill for older release moments

**Updated:**
- Release moment tests now verify headline and market reaction presence

**Verification:**
- `npm test` passed, 50 tests
- `npm run validate:data` passed
- `npm run build` passed

---

## [0.9.8-alpha] — 2026-05-15

### Growth Path Follow-Up Objectives

**Added:**
- Three follow-up objectives for each chosen growth path
- `growth-objectives` module for evaluating objective completion from real game state
- Company panel strategy objective checklist
- Validation and tests for objective references and completion rules

**Updated:**
- Growth path data now includes `followup_objectives`
- Data validator checks objective product, capability, item, upgrade, resource, and menu references

**Verification:**
- `npm test` passed, 50 tests
- `npm run validate:data` passed
- `npm run build` passed

---

## [0.9.7-alpha] — 2026-05-15

### Competition Strategy Signals

**Added:**
- Growth-path competition signal calculator for rival overlap, watch states, and claimed-space conflicts
- Competition ranking and rival cards now show `전략 충돌`, `선점 충돌`, `관찰 필요`, or `간접 경쟁`
- Tests for chosen-strategy overlap and claim escalation

**Updated:**
- Competition panel copy now reflects the chosen growth strategy when one exists
- Rival cards visually distinguish strategic and contested pressure

**Verification:**
- `npm test` passed
- `npm run validate:data` passed
- `npm run build` passed

---

## [0.9.6-alpha] — 2026-05-15

### Commit To Growth Path

**Added:**
- One-time post-release growth path commitment action
- `chosenGrowthPath` runtime/save state with path id, title, chosen month, bonus description, and applied effects
- Data-driven `commitment_effects` and `bonus_description` for each growth path
- Selected growth path display in the company stage card
- Tests for selection gating, persistence, duplicate prevention, and guidance completion

**Updated:**
- Growth path cards now choose the path on first click, then route to their target menu
- The opening objective `다음 성장 선택` now completes after committing to a growth path
- Data validator now checks growth path commitment effects

**Verification:**
- `npm test` passed, 46 tests
- `npm run validate:data` passed
- `npm run build` passed

---

## [0.9.5-alpha] — 2026-05-15

### Post-Release Growth Forks

**Added:**
- Data-driven `growth_paths.json` with three post-release routes: 생산성 제품 라인, 신뢰 기반 엔터프라이즈, 코드/비전 연구소
- Release moments now carry actionable growth path cards with target menu, action label, payoff, and recommended references
- Release spotlight UI now shows the three next-growth choices as clickable cards
- Data validation and tests for growth path references

**Updated:**
- Post-release guidance now points the player toward choosing a growth path instead of only buying an item
- QA release scenario now verifies that growth paths appear after first release
- Old saves with a release moment are hydrated with derived growth paths

**Verification:**
- `npm test` passed, 43 tests
- `npm run validate:data` passed
- `npm run build` passed
- Vite dev server started at `http://127.0.0.1:5173/`; Computer Use browser inspection timed out and `curl` could not connect from this environment

---

## [0.9.4-alpha] — 2026-05-15

### Opening Competitor Pacing

**Added:**
- Early rival foreshadowing during months 2-3 before any product-space claims happen
- Timeline entries for rival preparation, using `경쟁사 ... 예고` wording
- Simulation tests that lock the opening learning window and post-window rival claims

**Updated:**
- Rival product-space claims now begin from month 4 instead of appearing during the first three months
- Early contested-domain copy now reads as observation before it becomes direct pressure
- v0.9.1 10-expert P2 competitor pacing feedback is recorded as addressed for this slice

**Verification:**
- `npm test` passed
- `npm run validate:data` passed
- `npm run build` passed

---

## [0.9.3-alpha] — 2026-05-15

### Browser QA Scenarios And Screen Polish

**Added:**
- `qa-scenarios` module for stable first-screen, project, release, and shop QA states
- URL query scenario loading via `?scenario=fresh`, `?scenario=project`, `?scenario=release`, and `?scenario=shop`
- QA scenario status pill in the top bar
- `docs/QA_SCENARIOS.md` with scenario URLs and visual QA checklist
- Tests for QA scenario generation and URL parsing

**Updated:**
- Top status pills now wrap to reduce overflow risk
- Release spotlight has a small reduced-motion-safe emphasis animation
- Office scene hides extra decorative objects on narrow screens
- Mobile guidance card/objective strip layout is tighter

**Verification:**
- `npm test` passed, 41 tests
- `npm run build` passed
- Static server and Computer Use browser checks were attempted, but local browser access timed out or could not connect from the Codex environment; this is recorded in the QA report

---

## [0.9.2-alpha] — 2026-05-15

### Game Dev Harness Skill Draft

**Added:**
- Draft `ai-game-dev-harness` skill under `docs/skills/ai-game-dev-harness/SKILL.md`
- Versioned production workflow for each game improvement
- Question card protocol for direction choices
- Retention/LTV, shareability, and solo-dev scope gates
- Report and commit requirements for future milestones

**Updated:**
- `AGENTS.md` now includes Retention/LTV Agent, Shareability Agent, and Solo Dev Scope Agent
- Production communication list now references the game development harness skill draft

**Verification:**
- `npm test` passed
- `npm run validate:data` passed
- `npm run build` passed

---

## [0.9.1-alpha] — 2026-05-15

### Tester-Driven Office And Release Polish

**Added:**
- Player guidance system for the first 60 seconds: hire agent → start product → advance month → buy first item
- Opening objective strip with completion states for the first-session path
- Release moment state for the latest product launch, including product name, month, grade, score, and review quote
- Boundaryless expansion hint after product release
- Release spotlight card in the office stage
- Manifest-driven office object placeholders placed directly on the office floor
- Tests for guidance steps and latest release spotlight state

**Updated:**
- `AI 글쓰기 비서` monthly revenue increased from `₩800` to `₩1,600` based on the 10-expert direction playtest P1 economy finding
- Game stage now has an actionable "다음 목표" card informed by synthetic playtest feedback
- Product project releases now preserve the latest release moment through save/load
- Office scene now uses the v0.9 asset manifest beyond metadata-only planning

**Verification:**
- `npm test` passed, 35 tests
- `npm run validate:data` passed
- `npm run build` passed

---

## [0.9.0-alpha] — 2026-05-15

### Pixel Asset Manifest Scaffold

**Added:**
- `data/asset_manifest.json` for sprite grid, priority agent sprites, competitor logos, office objects, and first item icons
- TypeScript asset manifest types and loader export
- Vitest coverage for v0.9 pixel asset manifest requirements
- Data validator checks for asset references, sprite grid sizes, placeholder status, animation rows, and hex palettes

**Updated:**
- Agent portraits now consume manifest palettes and body classes
- Competitor profile cards now show placeholder logo identities
- Shop item cards now show placeholder item icons for the first asset batch
- Pixel asset plan now records the scaffolded manifest gate

**Verification:**
- `npm test` passed
- `npm run validate:data` passed
- `npm run build` passed

---

## [0.8.1-alpha] — 2026-05-15

### UI Structure Prep For Pixel Assets

**Added:**
- Dedicated `components/GameChrome.tsx` for top bar, resources, office scene, events, command row, and menu nav
- Dedicated `components/MenuPanels.tsx` for company, product, agent, research, shop, competition, and log panels
- Shared `ui/formatters.ts` and `ui/menu.ts`

**Updated:**
- Reduced `src/App.tsx` from a large all-in-one UI file to a compact state orchestration shell
- Preserved existing gameplay behavior while making v0.9 pixel asset work safer

**Verification:**
- `npm test` passed
- `npm run validate:data` passed
- `npm run build` passed

---

## [0.8.0-alpha] — 2026-05-15

### Competition And I18n Foundation

**Added:**
- 5 fictional AI competitors: 챗지오디, 클로이, 제미있니, 노바런, 오토마루
- Competition menu with market ranking, rival profiles, market share, research level, and claimed product spaces
- Monthly rival growth and deterministic product-space claiming
- Rival events with player choices and competitor score/momentum effects
- Save/load support for competitor state and rival event history
- Korean/English locale dictionaries and `t()` translation helper for new competitor/event content
- Data validation for competitors, rival events, and locale keys

**Updated:**
- Top status now shows player market share
- Product cards show when competitors have claimed the same product space
- Product review scoring now takes competitor product claims into account
- Menu structure now includes 경쟁

**Verification:**
- `npm test` passed
- `npm run validate:data` passed
- `npm run build` passed

---

## [0.4.0-alpha] — 2026-05-15

### Prototype Systems Before Graphics Assets

**Added:**
- Agent hiring flow with data-driven hire costs, duplicate prevention, and talent growth
- Owned item flow with shop purchases and agent equipment slots
- Product development projects that assign available agents, advance monthly, generate quality, and release with review grades
- Effective agent stats from base archetype plus equipped items
- Save/load coverage for hired agents, owned items, and active development projects
- 10-month prototype regression test

**Updated:**
- Product menu now starts development projects instead of instant-launching from the UI
- Agent menu now includes hired team management, equipment display, and equip actions
- Shop menu now has purchase buttons and locked/owned states for items

**Verification:**
- `npm test` passed
- `npm run validate:data` passed
- `npm run build` passed
- Browser flow verified: hire agent, buy item, equip item, start product project, advance 2 months, release product, console errors 0

---

## [0.3.1-alpha] — 2026-05-15

### Content And Menu Structure

**Added:**
- 10 AI agent archetypes with Korean names, roles, stats, upkeep, preferred items, quirks, and pixel-art appearance notes
- 20 shop items across office, equipment, research, safety, and marketing categories
- Menu structure: 회사, 제품, 에이전트, 연구, 상점, 기록
- Agent compendium screen with stat grid and appearance hooks
- Item shop screen with costs, effects, rarity, and flavor text
- Content validation tests for agent and item data

**Updated:**
- Data validator now checks agent stats, appearance palettes, preferred item references, item costs, and item effect keys
- The alpha UI now uses a menu panel instead of showing every system at once

**Verification:**
- `npm test` passed
- `npm run validate:data` passed
- `npm run build` passed
- Browser checked: menu navigation, agent screen, shop screen, console errors 0

---

## [0.3.0-alpha] — 2026-05-15

### Alpha: Game-Like Playable Screen

**Added:**
- Game-like office/lab screen with staff sprites, server rack, launch board, and compact tycoon UI frame
- Product release review score, grade, and quote
- Monthly event surfacing and event choice resolution
- Upgrade purchase flow with requirement and cost checks
- Automation purchase flow with compounding automation gains
- Save/load through serialized runtime state and local storage buttons
- Alpha simulation tests for release reviews, events, upgrades, automation, and save/load
- Alpha production, QA, and synthetic playtest reports

**Updated:**
- First event and visible upgrade/automation labels are Korean-first
- Simulation state now tracks product reviews, current events, event history, purchased upgrades, and purchased automations
- Data validator already covers product/event/upgrade references and remains part of the gate

**Verification:**
- `npm test` passed
- `npm run validate:data` passed
- `npm run build` passed
- Browser flow verified: launch product, advance month, view event, resolve event, save run

---

## [0.2.0] — 2026-05-14

### Web Restart Milestone 1: Playable Dashboard Shell

**Added:**
- Korean-first playable dashboard shell
- Company stage display based on `data/company_stages.json`
- Monthly report summary after advancing time
- Vitest test harness for core simulation expectations
- Web-specific production, QA, and synthetic playtest reports

**Updated:**
- Runtime direction is now Vite + React + TypeScript
- UI text, resources, products, domains, capabilities, and company stages use Korean player-facing names
- Agent review and acceptance criteria include Game Dev Story-style compact management loop checks

**Verification:**
- `npm test` passed
- `npm run validate:data` passed
- `npm run build` passed
- Browser flow verified: launch AI 글쓰기 비서, advance to next month, monthly report appears

---

## [0.1.0] — 2026-05-14

### Milestone 1: Empty Playable Shell

**Added:**
- data/resources.json — 8 resource definitions with initial values
- data/balance.json — monthly cost parameters and game thresholds
- scripts/core/EventBus.gd — global signal bus singleton
- scripts/core/DataLoader.gd — JSON loading and validation utility
- scripts/core/GameState.gd — central game state singleton
- scripts/systems/ResourceSystem.gd — resource mutation and clamping
- scripts/systems/MonthSystem.gd — monthly advancement and cost application
- scripts/ui/MainScreen.gd — main UI controller
- scripts/ui/ResourcePanel.gd — dynamic resource display
- scenes/main.tscn — main game scene with three-panel layout
- Autoload configuration in project.godot

**Updated:**
- scripts/debug/debug_validator.gd — full validation for M1 data files
- project.godot — autoload singletons and main scene configured

**Functionality:**
- Game loads and displays 8 resources from JSON
- Next Month button advances time and applies costs
- Monthly salary, compute, and base costs deducted
- Hype decays monthly; trust recovers if below threshold
- All values clamped to configured min/max
- Game over and win conditions checked each month
- Event log provides feedback on monthly changes
- DebugValidator runs at startup and reports issues

---

## [0.0.1] — 2026-05-14

### Milestone 0: Harness Setup

**Added:**
- Project folder structure (docs/, reports/, data/, scenes/, scripts/, tests/)
- AGENTS.md with all agent role definitions
- 10 documentation files in docs/
- reports/ folder structure
- Godot project configuration
- DebugValidator skeleton script
- README.md

**Status:** Complete.
