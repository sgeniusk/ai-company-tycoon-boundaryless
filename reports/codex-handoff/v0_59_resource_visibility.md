# Codex CLI 인계 — v0.59-alpha-resource-visibility (Recursive 스타일 자원 가시화)

작성일: 2026-05-29
작성자: Claude Code (하네스/계약 트랙)
대상 에이전트: Codex CLI (gpt-5.5, reasoning effort xhigh) — 구현 트랙
작업 디렉토리: `/Users/taewookkim/dev/ai-company-tycoon`
현재 feature: `v0.59-alpha-resource-visibility` (이미 `feature_list.json`의 current_feature_id로 설정됨)

## 한 줄 요약

시뮬레이션이 이미 모델링하지만 화면에 드러내지 않는 AI 자원 경제를 연구 패널에 derive-only 인디케이터로 노출한다. 표시할 값은 (1) 현재 월간 compute 부하, (2) 월간 데이터 생성량, (3) 다음 출시 전까지 필요한 compute다. 시뮬레이션 tick 동작과 `GameState` 모델은 절대 바꾸지 않는다.

## 역할 분담 (중요)

- 이 트랙(Codex)은 **코드 구현만** 담당한다.
- **`git commit` 하지 않는다.** Claude Code가 diff를 리뷰하고 게이트를 독립 검증한 뒤 커밋한다.
- **`AGENTS.md` / `feature_list.json` / `progress.md` / `CLAUDE.md` 를 편집하지 않는다.** 이 계약 파일들은 Claude Code가 이미 v0.59 상태로 세팅했다. 되돌리지 말 것.
- 워킹 트리에 위 계약 파일들의 미커밋 변경이 이미 있다 (정상). 손대지 말고 그대로 둔다.
- 실행 증거는 `reports/qa/v0_59_resource_visibility_run.md`에만 남긴다.

## 작업 시작 전 필독

1. `AGENTS.md` — operating contract, Definition Of Done, One Feature At A Time, 검증 명령
2. `feature_list.json` — `v0.59-alpha-resource-visibility` 항목의 definition_of_done과 next_step
3. `progress.md` — Current Objective (이 feature 설명)와 Verification Evidence
4. `docs/ROADMAP.md` line 214-216 — "후속 검토" 블록. 본 feature의 출처 정의
5. `src/components/MarketSharePanel.tsx` — v0.58 #1 derive-only HUD 패널의 정본 템플릿. derive 패턴을 그대로 미러링할 것
6. `src/components/RivalArchetypePanel.tsx` — 다른 패널 아래 derive-only 서브패널을 붙이는 패턴 (v0.58 #3)
7. `src/components/MenuPanels.tsx` — 연구(research) 패널이 여기 있다. 정확한 함수명/위치를 확인할 것
8. `src/game/qa-scenarios.ts` — line 80 부근 시나리오 id 배열 등록, line 114 부근 `if (id === "market-share")` 핸들러. 새 시나리오를 같은 패턴으로 추가
9. `src/ui/layout-contract.test.ts` — layout-contract `it` 블록 패턴
10. `data/products.json` — 각 product의 `compute_per_1000_users`, `data_generated_per_month` 필드 (이미 존재)
11. `data/locales/ko.json`, `data/locales/en.json` — 인디케이터 라벨 i18n 키

## 작업 내용

### 1. derive 헬퍼

현재 `GameState`에서 활성(출시된) product 목록과 각 product의 사용자 수를 어떻게 읽는지 `src/game/types.ts`와 기존 패널(MarketSharePanel 등)을 보고 확인한다. 그 위에 derive 함수를 만든다. 새 데이터 파일이나 새 `GameState` 필드는 만들지 않는다.

세 가지 값을 derive한다.

- **월간 compute 부하** — 활성 product마다 `compute_per_1000_users * (사용자수 / 1000)` 의 합
- **월간 데이터 생성량** — 활성 product의 `data_generated_per_month` 합 (사용자 스케일을 곱할지는 기존 시뮬레이션 모델과 일관되게 결정. 결정 근거를 run 보고서에 적는다)
- **다음 출시 전 필요 compute** — 현재 개발 중이거나 다음에 출시 가능한 product의 compute 요구량. 개발 큐가 없으면 합리적 fallback (예: 0 또는 "출시 대기 없음" 표시)

derive 로직 위치는 재량이되, 가능하면 패널 컴포넌트 안의 `useMemo` 또는 `src/game/` 쪽 순수 함수로 둔다. 순수 함수면 단위 테스트가 쉬워진다.

### 2. 연구 패널 UI

ROADMAP대로 **연구 패널 안에** derive-only 인디케이터 블록을 추가한다. 별도 거대 HUD가 아니라 연구 패널 내부 섹션이다. MarketSharePanel의 시각 언어(라벨 + 수치 + 단위, 과한 애니메이션 없음)를 따른다. 스타일은 `src/App.css`에 추가하고 기존 클래스 네이밍 컨벤션을 따른다.

### 3. QA 시나리오 등록

`src/game/qa-scenarios.ts`에 `resource-visibility` 시나리오를 `market-share` 패턴 그대로 추가한다. 이 시나리오는 연구 메뉴로 진입하고, 활성 product + 사용자 수가 충분히 있어서 세 인디케이터가 모두 0이 아닌 상태여야 한다. 진입 URL은 `?scenario=resource-visibility`.

### 4. 테스트

`src/ui/layout-contract.test.ts`에 `it` 블록 하나를 추가한다 (테스트 수 415 → 416). derive 헬퍼를 순수 함수로 뺐다면 그 함수의 단위 테스트를 추가해도 좋다(그 경우 목표 테스트 수는 416 이상).

### 5. i18n

인디케이터 라벨/단위를 `data/locales/ko.json` + `en.json`에 키로 추가하고 하드코딩 문자열을 피한다 (기존 패널 방식 확인).

## 제약

- **Derive-only.** `src/game/simulation.ts`의 tick 동작을 바꾸지 않는다. 새 `GameState` 필드를 추가하지 않는다 (표시 전용). 시계열/히스토리가 필요해 보이면 v0.58 #1이 sparkline을 미룬 것처럼 **미룬다**.
- 모바일 390×844가 깨지지 않아야 한다.
- 튜닝 가능한 임계값이 생기면 JSON 데이터로 뺀다 (가능하면 순수 derive로 임계값 자체를 피한다).
- 계약 파일(`AGENTS.md`, `feature_list.json`, `progress.md`, `CLAUDE.md`)과 무관한 기존 변경을 건드리지 않는다.
- `npm run harness:gate`가 끝까지 통과해야 한다.

## 완료 기준

1. 연구 패널이 세 derive-only 인디케이터를 렌더링하고, `?scenario=resource-visibility`에서 모두 0이 아니다.
2. `npm run harness:gate` 통과 (43 files / 416+ tests).
3. derive 로직이 `simulation.ts` tick과 `GameState` 모델을 바꾸지 않았다 (diff로 확인 가능).
4. `reports/qa/v0_59_resource_visibility_run.md`에 실행 증거가 있다 — 변경 파일 목록, derive 공식과 그 근거, 최종 `harness:gate` 출력(파일/테스트 수, build 시간).

## 세션 종료 시 (Codex)

1. `npm run harness:gate` 최종 실행 결과를 `reports/qa/v0_59_resource_visibility_run.md`에 기록한다.
2. `git commit` 하지 않는다. 워킹 트리를 그대로 두고 마지막 메시지에 변경 파일 목록과 게이트 결과를 요약한다.
3. `feature_list.json` / `progress.md` / `AGENTS.md` / `CLAUDE.md`는 편집하지 않는다 (Claude Code가 closeout에서 처리).

## 관련 문서

- `AGENTS.md`
- `feature_list.json` (`v0.59-alpha-resource-visibility`)
- `progress.md` (Current Objective)
- `docs/ROADMAP.md` (line 214-216 후속 검토 블록)
- `src/components/MarketSharePanel.tsx` (derive-only 정본 템플릿)
