# Codex CLI 인계 — v0.62 블록 #2 (발견 모먼트 + 도감-lite)

작성일: 2026-05-29
작성자: Claude Code (하네스/계약/플래닝 트랙)
대상: Codex CLI (gpt-5.5, reasoning effort medium = fast 모드)
작업 디렉토리: `/Users/taewookkim/dev/ai-company-tycoon`
현재 feature: `v0.62-alpha-payoff-juice` (블록 #1 완료·커밋, 이번은 **블록 #2만**)

## 한 줄 요약

도파민의 "발견" 레버. 조합/시너지를 **처음 발동**하면 "신규 발견!" 모먼트를 띄우고, **도감(수집) 뷰**에서 발견한 것 / 미발견(???)을 보여준다. 블록 #1의 payoff-activation/PayoffCelebrationModal을 확장한다.

## 역할 분담

- 블록 #2 구현만. **`git commit` 금지.** Claude Code가 검증·커밋한다.
- **`AGENTS.md`/`feature_list.json`/`progress.md`/`CLAUDE.md`/`docs/ROADMAP.md` 편집 금지.**
- 증거는 `reports/qa/v0_62_block2_run.md`에만.

## 블록 #1과의 차이 (중요)

- 블록 #1 "활성화 셀러브레이션" = 발동할 **때마다** (이전 활성 집합을 React 상태로 비교, GameState 무변경).
- 블록 #2 "발견" = **최초 1회 + 영속**. 따라서 **persisted GameState 필드가 필요**하다. 이게 둘의 핵심 차이.

## 정확한 미러링 대상

- **영속 필드 패턴** → `GameState.seenTutorials`(string-array)와 `hydrateGameState`의 `sanitizeStringArray(rawState.seenTutorials)`(simulation.ts ~3236). 신규 필드도 **정확히 이 패턴**으로.
- **저장 round-trip 테스트** → `src/game/save-integrity.test.ts`(v0.61 #1). 신규 필드 round-trip 케이스 추가.
- **모먼트 데이터/안정 id** → 블록 #1 `src/game/payoff-activation.ts`의 `getPayoffCelebrationMoments`가 `combo:<id>` / `synergy:<id>` 안정 id를 이미 제공. 발견 추적에 이 id를 재사용.
- **셀러브레이션 UI** → 블록 #1 `src/components/PayoffCelebrationModal.tsx`에 "신규 발견!" 변형(배지/문구) 추가.
- **전체 목록(도감)** → `data/industry_combos.json` + `data/industry_synergies.json` (발견 진행도 분모).
- **패널 마운트** → `src/components/MenuPanels.tsx` (기존 패널 패턴).

## 작업 내용

### 1. 영속 발견 상태 (GameState)
`GameState`에 `discoveredPayoffIds: string[]` 추가 (combo/synergy 안정 id 저장). `createInitialState`에서 `[]`. `hydrateGameState`에 `discoveredPayoffIds: sanitizeStringArray(rawState.discoveredPayoffIds)` 추가 (기본 []). **저장 하위호환 유지** — 구버전 세이브엔 이 필드가 없으니 []로 안전히 채워져야 함.

### 2. 발견 마킹 + "신규 발견!" 모먼트
조합/시너지가 active인데 id가 `discoveredPayoffIds`에 없으면 → 발견으로 추가하고 "신규 발견!" 셀러브레이션을 띄운다. **마킹은 additive 상태 업데이트만** (자원/tick 행동 변경 금지 — discoveredPayoffIds에 push만). 월간 진행(advanceMonth) 경로에서 신규 활성 id를 discoveredPayoffIds에 합치는 방식을 권장하되, **밸런스/자원 계산에는 일절 영향 없게**.

### 3. 도감-lite 뷰
발견 진행도(예: "7 / 20 발견")와 함께, 전체 조합/시너지를 **발견=공개 / 미발견=???(잠김)** 로 보여주는 뷰. derive (discoveredPayoffIds + 전체 데이터). 대형 신규 UI 금지 — 기존 패널/모달 톤으로 가볍게.

### 4. QA 시나리오
`?scenario=collection`(또는 기존 `payoff-juice` 확장)에서 일부는 발견됨, 일부는 미발견 상태로 진입해 도감을 바로 확인.

### 5. 테스트
- 발견 감지 단위 테스트 (이미 발견된 건 재-발견 안 됨)
- **저장 round-trip 테스트** — discoveredPayoffIds가 직렬화/복원되고 구버전 세이브가 []로 마이그레이션
- 도감 뷰 layout-contract 모바일 390×844
- 목표 439 → 442+

## 제약 (§5 안전)

- 진행/UI 신호일 뿐 **새 게임 시스템/밸런스 아님.** discoveredPayoffIds 추가·표시 외에 tick/자원 로직 불변.
- **저장 round-trip을 깨지 말 것** — sanitizer + 테스트 필수, 구버전 세이브 하위호환.
- `prefers-reduced-motion` + 모바일 390×844 유지.
- `npm run harness:gate` 통과 (44 files / 442+ tests; 새 테스트 파일 추가 시 파일 수 +).

## 완료 기준

1. `discoveredPayoffIds` 영속 필드 + sanitizer + round-trip 테스트 통과.
2. 첫 발동 시 "신규 발견!" 모먼트, 재발동 시엔 안 뜸.
3. 도감-lite 뷰가 발견/미발견 + 진행도를 보여줌, `?scenario=collection`로 확인.
4. tick/밸런스 불변, 저장 하위호환 유지.
5. `npm run harness:gate` 통과.
6. `reports/qa/v0_62_block2_run.md` — 변경 파일, 신규 필드/마킹 방식, 저장 영향(round-trip 결과), 게이트 출력.

## 세션 종료 시

`git commit` 금지. 마지막 메시지에 변경 파일 + 저장/tick 영향 + 게이트 결과. 계약 파일 편집 금지.
