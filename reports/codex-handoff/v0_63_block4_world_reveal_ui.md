# Codex CLI 인계 — v0.63 블록 #4 (세계 뽑기 리빌 UI + 런 굴리기)

작성일: 2026-05-29
작성자: Claude Code (기획/하네스/계약 트랙)
대상: Codex CLI (gpt-5.5, reasoning effort **medium / fast** — UI + 소량 런 시작 배선, tick·세이브 스키마 불변)
작업 디렉토리: `/Users/taewookkim/dev/ai-company-tycoon`
선행: v0.63 블록 #1~#3 커밋 완료. 이번은 **블록 #4 (마지막)**.

## 한 줄 요약

런 모디파이어 시스템의 **페이오프 연출** — 새 런을 시작할 때 시드로 도시×세계관×시장×창업자를 **굴리고(roll)**, 그 결과를 "세계 뽑기" 리빌 모달로 보여준다(도파민). 지금까지 시스템은 데이터·tick·이벤트가 다 작동하지만 **실제 게임은 항상 표준 세계로 시작**한다(런 시작 호출이 선택을 안 넘김). 이 블록이 그 마지막 연결 — 굴려서 보여주면 v0.63이 일반 플레이에서 살아난다.

## 핵심 사실 (확인됨)

- 런 시작점 — `resetRunWithMetaUnlocks(current, ...)` (GameChrome.tsx:573, MenuPanels.tsx:893/1216/1236), `createInitialState()` (App.tsx:43/47 첫 로드).
- 블록 #1이 `createInitialState(runModifierSelection?)` 와 `resetRunWithMetaUnlocks(..., runModifierSelection?)` 에 선택 인자를 이미 추가함 — **지금은 아무도 안 넘겨서 표준**.
- `state.runModifiers` (seed, startCityId, worldLoreId, marketConditionId, founderTraitId, tags) — 리빌이 읽을 소스. 세이브에 이미 포함(블록 #1).
- `run_modifiers.json` 각 항목에 `name`/`description`/`starting_deltas` 있음 — 리빌 카드에 그대로 표시.
- 미러 패턴 — `src/components/PayoffCelebrationModal.tsx` (v0.62 연출 모달), `BigEventModal.tsx`.

## 작업 내용

### 1. 런 굴리기 (run-modifiers.ts에 순수 헬퍼 추가)
`rollRunModifierSelection(seed: string): RunModifierSelectionInput` — 주어진 시드로 4축을 결정론적으로 선택(기존 `selectRunModifierConfig`가 시드로 선택하므로, 사실상 `{ seed }`만 넘기면 됨; 명시적 도시/세계관 지정도 가능하게). 시드 생성은 **UI 레이어에서만** ephemeral하게(예: 시간/카운터 기반 문자열) 만들어 한 번 굴린 뒤 `runModifiers.seed`로 저장 → 이후 전부 결정론적. **tick·하네스에는 RNG 안 들어감**(시드는 저장된 상수).

### 2. 런 시작 시 굴리기 적용 (배선)
- "새 런/다음 런" 경로(`resetRunWithMetaUnlocks(current, ...)`)에서 새 시드를 굴려 selection을 넘긴다 → 비표준 세계로 시작 가능.
- **첫 온보딩 런은 표준 유지** — 최초 진입(`createInitialState()` 저장 없음)은 표준 세계(튜토리얼 친화적). 굴리기는 "한 판 끝내고 다시 시작"하는 로그라이크 루프에서 작동.
- 기존 무인자 호출 경로(테스트/run-simulator)는 **그대로 표준** — 10년 완주 게이트 불변.

### 3. 세계 뽑기 리빌 모달 (신규 컴포넌트, PayoffCelebrationModal 미러)
- `state.runModifiers`에서 4축(도시/세계관/시장/창업자)의 `name`+`description`+주요 `starting_deltas`를 카드로 표시.
- 도파민 — 순차 공개(카드 플립/페이드), 비표준 항목 강조(표준=차분, 비표준=강조 색), "이번 세계" 타이틀, 시드 표시(재현용). 한 번 본 런은 다시 안 띄움(런당 1회 — 간단한 React state 또는 이미 도착한 런인지 판별; 새 GameState 필드 추가 금지, runModifiers.seed로 "이 시드 리빌 봤음"을 ephemeral 추적).
- 표준 세계(첫 런)는 리빌 생략 또는 차분한 "표준 세계" 1장.

### 4. QA 시나리오
`?scenario=world-reveal`(또는 run-modifiers 재사용) — 비표준 세계가 굴려진 상태로 진입해 리빌 모달이 보이는 상태. 기존 `run-modifiers`/`world-events` 시나리오는 건드리지 말 것(블록 #1~#3 소유).

## 파일 소유권 (병렬 안전 — 반드시 지킬 것)
이 블록은 다음만 편집한다. **데이터 트랙(v0.64 콘텐츠 웨이브)과 병렬로 돌 수 있으므로 경계 엄수:**
- 편집 가능 — 신규 `src/components/WorldRevealModal.tsx`(또는 유사), `src/game/run-modifiers.ts`(roll 헬퍼만 추가), `src/game/run-modifiers.test.ts`(roll/리빌 테스트), 런 시작 호출부(`GameChrome.tsx`/`MenuPanels.tsx`/`App.tsx`), `qa-scenarios.ts`(신규 reveal 시나리오만 추가), 필요 시 `App.css`.
- **편집 금지** — `data/run_modifiers.json`, `scripts/harness/validate-data.mjs`, `data/world_events.json`, `world-events.ts`(블록 #3/콘텐츠 웨이브 소유). `simulation.ts` tick 로직, `types.ts`(새 필드 추가 금지 — 리빌은 runModifiers에서 derive). 세이브 스키마. 계약 파일(`AGENTS.md`/`feature_list.json`/`progress.md`/`CLAUDE.md`/`docs/ROADMAP.md`).

## 절대 제약
- **새 GameState 필드 금지** — 리빌은 `state.runModifiers`에서 derive. "런당 1회"는 ephemeral(React)로.
- **tick·세이브 스키마 불변** — RNG는 UI의 시드 생성에만(저장된 시드에서 전부 결정론적 derive). run-simulator 10년 완주 게이트 불변(무인자 경로 = 표준 유지).
- 첫 온보딩 런 표준 유지(튜토리얼 안 깨짐).
- `git commit` 금지.

## 완료 기준
1. `rollRunModifierSelection` 헬퍼 + 새 런 경로에서 굴리기 적용(첫 런 표준 유지, 무인자 경로 표준 유지).
2. `WorldRevealModal` — 4축 카드, 순차 공개, 비표준 강조, 시드 표시, 런당 1회.
3. `?scenario=world-reveal` 진입 시 리빌 보임.
4. 테스트 — roll 결정론(같은 시드=같은 selection), 첫 런/무인자 표준 유지 회귀, 리빌이 runModifiers를 정확히 반영, 표준 런 10년 완주 불변.
5. `npm run harness:gate` 통과.
6. `reports/qa/v0_63_block4_run.md` — 변경 파일, 굴리기 배선 위치, 첫 런 표준 보존, tick/세이브 불변, 게이트 출력.

## 세션 종료 시
`git commit` 금지. 마지막 메시지에 변경 파일 + 굴리기 적용 지점 + 첫 런/무인자 표준 유지 확인 + tick/세이브 불변 + 게이트. 계약 파일 편집 금지.
