# Codex CLI 인계 — v0.65 #2 난이도 보상 배수 + 티어 선택 UI

작성일: 2026-05-30
작성자: Claude Code (기획/하네스/계약 트랙)
대상: Codex CLI (gpt-5.5, reasoning effort **medium / fast** — 메타 보상 배수 + UI, tick·세이브 스키마 불변)
작업 디렉토리: `/Users/taewookkim/dev/ai-company-tycoon`
선행: v0.65 #1(난이도 기반 — challengeTier + difficulty_tiers.json) 커밋 완료. 이번은 v0.65 **마지막 블록 #2**.

## 한 줄 요약

난이도에 **보상**과 **선택권**을 붙인다. (1) 하드 티어 클리어 시 메타 통화(창업 통찰)가 reward_multiplier만큼 더 들어온다 → "열린 도전"의 동기. (2) 새 런 시작 시 플레이어가 티어를 고른다. (3) 세계 뽑기 리빌에 고른 티어를 표시. standard 티어(reward_multiplier 1.0)는 현재와 동일 — 회귀 0.

## 확인된 사실 (v0.65 #1 + 기존 코드)

- `data/difficulty_tiers.json` 각 티어에 `reward_multiplier`(story 0.75 / standard 1.0 / hard 1.5 / brutal 2.0)와 `monthly_headwind`. `RunModifiersState.challengeTier`는 세이브 필드(블록 #1).
- `src/game/meta-progression.ts` `getRunInsightReward(state): number` (line ~56) — 런에서 얻는 창업 통찰(메타 언락 통화)을 계산. `resetRunWithMetaUnlocks`(line ~120, 127)와 `getNextRunSetupPlan`(line ~90)이 이걸 쓴다.
- 런 시작 경로 — `resetRunWithMetaUnlocks(current, unlockIds?, starterDeckId?, runModifierSelection?)` (GameChrome handleStartNextRun, MenuPanels quick-start/starter-deck). v0.63 #4가 여기서 시드를 굴려 selection을 넘김. `RunModifierSelectionInput`에는 `challengeTierId?`가 이미 있음(블록 #1).
- 리빌 — `src/components/WorldRevealModal.tsx` (v0.63 #4), `state.runModifiers`에서 derive.

## 작업 내용

### 1. 보상 배수 (meta-progression.ts)
`getRunInsightReward(state)`가 반환값에 현재 런의 티어 reward_multiplier를 곱하도록 한다. `difficultyTiers.find(t => t.id === state.runModifiers?.challengeTier)?.reward_multiplier ?? 1`. 결과는 정수로 round. standard(1.0)면 현재와 동일(회귀 가드). 기존 호출부(resetRunWithMetaUnlocks/getNextRunSetupPlan)는 자동으로 반영됨.

### 2. 티어 선택 UI (run setup)
새 런 시작 흐름에서 플레이어가 티어를 고른다. 기존 next-run/quick-start UI(MenuPanels) 또는 GameChrome 새 런 진입에 티어 선택(라디오/세그먼트)을 추가하고, 고른 `challengeTierId`를 `resetRunWithMetaUnlocks(... runModifierSelection)`의 selection에 넣어 넘긴다. 티어별 이름·설명·reward_multiplier·예상 역풍을 보여줘 의사결정 정보 제공. 미선택 기본 = standard(현재 동작).

### 3. 리빌에 티어 표시 (WorldRevealModal)
리빌 모달에 "도전 티어: {이름} (보상 ×{multiplier})"를 한 줄 추가. 비표준 티어는 강조.

### 4. QA + 테스트
- `?scenario=difficulty-reward`(또는 기존 difficulty 시나리오 확장) — 하드 티어로 시작해 보상 배수/리빌 티어가 보이는 상태.
- 테스트 — standard 티어 보상 = 기존값(회귀 가드), hard 티어 보상 = 기존×1.5(round), 티어 선택이 selection으로 전달돼 런에 반영, 리빌이 티어를 표시.

## 파일 소유권 / 절대 제약
- 편집 가능 — `meta-progression.ts`(보상 배수), `MenuPanels.tsx`/`GameChrome.tsx`(티어 선택), `WorldRevealModal.tsx`(티어 표시), `meta-progression.test.ts`(있으면)/관련 테스트, `qa-scenarios.ts`(시나리오), `App.css`. 필요 시 `run-modifiers.ts`에 티어 포함 굴리기 헬퍼 소폭(단 기존 시그니처 깨지 말 것).
- **편집 금지** — `simulation.ts` tick, `types.ts`(새 GameState 필드 금지 — 티어는 이미 runModifiers에 있음), 세이브 스키마, `difficulty_tiers.json`(블록 #1 데이터, 수치 조정 필요하면 최소), `data/run_modifiers.json`, `world_events.json`. 계약 파일(`AGENTS.md`/`feature_list.json`/`progress.md`/`CLAUDE.md`/`docs/ROADMAP.md`).
- standard 티어 = 현재 동작(보상 ×1.0, 회귀 0). 결정론 유지. tick·세이브 스키마 불변. 표준 10년 완주 불변.
- `git commit` 금지.

## 완료 기준
1. 보상 배수가 `getRunInsightReward`에 반영(standard 불변, hard ×1.5).
2. 런 셋업 티어 선택 → selection으로 전달 → 런에 challengeTier 반영.
3. 리빌에 티어 표시.
4. 테스트 — standard 보상 회귀 가드 + hard 보상 배수 + 티어 전달 + 리빌 표시.
5. `npm run harness:gate` 통과(표준 런 완주 유지).
6. `reports/qa/v0_65_block2_run.md` — 변경 파일, 보상 배수 적용 지점, 티어 선택 배선, 리빌, 게이트 출력.

## 세션 종료 시
`git commit` 금지. 마지막 메시지에 변경 파일 + 보상 배수 지점 + standard 불변 확인 + tick/세이브 불변 + 게이트. 계약 파일 편집 금지.
