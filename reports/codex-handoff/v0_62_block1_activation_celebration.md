# Codex CLI 인계 — v0.62 블록 #1 (대박 조합·시너지 발동 셀러브레이션)

작성일: 2026-05-29
작성자: Claude Code (하네스/계약/플래닝 트랙)
대상: Codex CLI (gpt-5.5, reasoning effort medium = fast 모드; UI/연출 폴리시)
작업 디렉토리: `/Users/taewookkim/dev/ai-company-tycoon`
현재 feature: `v0.62-alpha-payoff-juice` (이번은 **블록 #1만**)

## 한 줄 요약

도파민의 "페이오프 연출" 레버. 고위험 산업 조합(또는 상위 산업 시너지)이 **새로 활성화될 때** 이름 박힌 셀러브레이션 모먼트(조합 제목 + 플레어/글로우 + 효과 요약)를 띄운다. **기존 v0.60 조합 시스템을 증폭**할 뿐, 새 게임 시스템은 만들지 않는다 (§5 준수).

## 역할 분담

- 블록 #1 구현만. **`git commit` 금지.** Claude Code가 검증·커밋한다.
- **`AGENTS.md`/`feature_list.json`/`progress.md`/`CLAUDE.md`/`docs/ROADMAP.md` 편집 금지.**
- 증거는 `reports/qa/v0_62_block1_run.md`에만.

## 정확한 미러링 대상 (이미 있는 패턴 재사용)

- `src/components/BigEventModal.tsx` — v0.58 #5의 큐 기반 모달 패턴 (도전자 등장 팝업). 이 구조를 셀러브레이션 모먼트의 모델로.
- `src/game/industry-combos.ts` `getIndustryComboSummary(state)` (line ~26) → `.active` 활성 조합 목록 + 각 조합의 `title`/`risk_label`/`monthly_effects`. `src/game/industry-synergies.ts` `getIndustrySynergySummary`도 동일 구조.
- `src/App.css` — 희귀도 글로우/펄스 + `prefers-reduced-motion` 폴백이 **이미 9곳** 확립돼 있음. 그 톤을 재사용.
- `src/components/GameChrome.tsx` / `MenuPanels.tsx` — 모달/오버레이가 마운트되는 지점.

## 작업 내용

### 1. 발동 감지 (최소 상태)
조합/시너지가 "이번에 새로 활성화"됨을 감지한다. v0.58 #5의 `pendingChallengerEntryIds` 큐 패턴을 미러링해, 새로 active가 된 조합 id를 UI 신호 큐(예: `pendingComboCelebrationIds`)에 넣는 방식을 권장. **tick 밸런스 로직은 바꾸지 말 것** — 활성 집합 비교/큐 푸시만. 큐가 과하면, 직전 렌더의 active 집합과 비교하는 derive 방식도 허용.

### 2. 셀러브레이션 모먼트 UI
새 컴포넌트(예: `src/components/ComboCelebration.tsx`)로, BigEventModal 톤의 중앙 배너/모달.
- 조합 **이름**을 크게 (『풀스택 물리 제국』 발동! 식), `risk_label` 한 줄, `monthly_effects`를 +/- 화살표로 요약
- 플레어/글로우 애니메이션 (App.css의 기존 rarity-pulse 패턴 재사용), **`prefers-reduced-motion` 폴백 필수**
- 고위험 조합은 강한 연출, 일반 시너지는 가벼운 토스트로 톤 차등(선택)
- dismiss 가능, 큐에 여러 개면 순차 표시

### 3. QA 시나리오
`?scenario=payoff-juice` (또는 기존 `physical-industries` 시나리오에 조합이 발동된 상태)를 등록해 셀러브레이션을 바로 확인할 수 있게. `resource-visibility`/`big-event` 시나리오 등록 패턴 미러링.

### 4. 테스트
- 활성화 감지 derive 로직 단위 테스트 + layout-contract에 셀러브레이션 UI가 모바일 390×844를 안 깨는지 계약 추가. 목표 437 → 439+.

## 제약 (§5 안전)

- **새 게임 시스템 금지.** 기존 조합/시너지 발동 모먼트를 *연출로 증폭*만 한다.
- `simulation.ts` tick/밸런스 로직 불변. 변경은 UI 신호 큐 + 표시 컴포넌트 + 시나리오/테스트에 한정.
- `prefers-reduced-motion` 폴백 필수, 모바일 390×844 유지.
- 저장/불러오기 — 새 UI 신호 필드를 GameState에 넣으면 `hydrateGameState` sanitizer에 추가(빈 배열 기본)하고 round-trip이 깨지지 않게. (가능하면 derive로 상태 추가를 피한다.)
- `npm run harness:gate` 통과.

## 완료 기준

1. 고위험 조합/상위 시너지가 새로 활성화되면 이름 박힌 셀러브레이션이 뜬다 (reduced-motion 폴백 포함).
2. `?scenario=payoff-juice`로 즉시 확인 가능.
3. tick/밸런스 불변, 저장 round-trip 유지.
4. 테스트 추가, `npm run harness:gate` 통과 (43 files / 439+ tests).
5. `reports/qa/v0_62_block1_run.md` — 변경 파일, 발동 감지 방식, simulation/save 영향 여부, 게이트 출력.

## 세션 종료 시

`git commit` 금지. 마지막 메시지에 변경 파일 + simulation/save 영향 + 게이트 결과. 계약 파일 편집 금지.
