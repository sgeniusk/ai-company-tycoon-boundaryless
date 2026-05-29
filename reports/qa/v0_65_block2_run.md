# v0.65 Block #2 QA — 난이도 보상 배수 + 티어 선택 UI

작성일: 2026-05-30

## 변경 파일

- `src/game/meta-progression.ts`
- `src/components/MenuPanels.tsx`
- `src/components/GameChrome.tsx`
- `src/components/WorldRevealModal.tsx`
- `src/game/qa-scenarios.ts`
- `src/App.css`
- `src/game/meta-progression.test.ts`
- `src/game/run-modifiers.test.ts`
- `src/game/qa-scenarios.test.ts`
- `src/ui/layout-contract.test.ts`

## 구현 요약

- 보상 배수 적용 지점: `getRunInsightReward(state)`에서 기존 base reward를 계산한 뒤 `difficultyTiers.find((tier) => tier.id === state.runModifiers?.challengeTier)?.reward_multiplier ?? 1` 배수를 곱하고 `Math.round`로 정수화.
- standard 티어 no-op: standard fixture의 기존 보상 13이 그대로 유지되는 회귀 테스트 추가.
- hard 티어 보상: 같은 fixture에서 hard reward가 13 x 1.5 = 19.5, 반올림 20이 되는 테스트 추가.
- 티어 선택 UI: 덱 패널의 다음 런 설계실에 도전 티어 선택 버튼을 추가하고, quick-start / starter-deck / meta-unlock 새 런 시작 경로가 `selectedChallengeTierId`를 `runModifierSelection.challengeTierId`로 전달.
- GameChrome의 빠른 새 런 경로는 명시적으로 `challengeTierId: "standard"`를 전달해 기본 동작을 보존.
- 리빌: `WorldRevealModal`에 도전 티어와 보상 배수(`보상 x...`)를 표시하고, hard 같은 비표준 티어만으로도 리빌이 열리도록 standard 판정에 `challengeTier === "standard"`를 포함.
- QA 시나리오: `?scenario=difficulty-reward` 추가. hard 티어, seed `qa-difficulty-reward`, 성공 상태 보상/리빌 확인용.

## 불변 확인

- `simulation.ts` tick 미수정.
- `types.ts` 및 세이브 스키마 미수정.
- `difficulty_tiers.json`, `data/run_modifiers.json`, `data/world_events.json` 미수정.
- 새 `GameState` 필드 없음. 티어는 기존 `runModifiers.challengeTier`만 사용.

## 검증

### RED 확인

초기 focused test 실행에서 누락 동작이 실패함을 확인:

- `npm test -- src/game/meta-progression.test.ts src/game/run-modifiers.test.ts src/game/qa-scenarios.test.ts src/ui/layout-contract.test.ts --maxWorkers=1`
- 실패: hard reward multiplier, `difficulty-reward` scenario, tier-select/reveal layout contract.

### Focused GREEN

- `npm test -- src/game/meta-progression.test.ts src/game/run-modifiers.test.ts src/game/qa-scenarios.test.ts src/ui/layout-contract.test.ts --maxWorkers=1`
- 결과: 4 files / 144 tests passed.

### Full Gate

- `npm run harness:gate`
- 결과:
  - Test Files: 47 passed
  - Tests: 481 passed
  - Data validation passed
  - `tsc && vite build` passed
  - Vite build: 118 modules transformed, built in 863ms

## 다음 단계

Block #2 구현 및 검증 완료. 커밋은 사용자 지시에 따라 실행하지 않음.
