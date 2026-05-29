# v0.62 block #2 QA run — discovery moments + collection-lite

작성일: 2026-05-29

## 범위

- 블록 #2만 구현: 조합/시너지가 처음 활성화될 때 `신규 발견!` 셀러브레이션을 띄우고, 제품 패널에 페이오프 도감-lite를 추가했다.
- 저장 필드 추가: `GameState.discoveredPayoffIds: string[]`.
- §5-safe 유지: 발견 마킹은 `discoveredPayoffIds`에 stable id를 추가하는 UI/진행 신호이며 자원, 밸런스, 월간 tick 계산을 바꾸지 않는다.

## 변경 파일

- `src/game/types.ts`
- `src/game/simulation.ts`
- `src/game/state-integrity.ts`
- `src/game/payoff-activation.ts`
- `src/components/PayoffCelebrationModal.tsx`
- `src/components/GameChrome.tsx`
- `src/components/MenuPanels.tsx`
- `src/App.css`
- `src/game/payoff-activation.test.ts`
- `src/game/save-integrity.test.ts`
- `src/game/qa-scenarios.ts`
- `src/game/qa-scenarios.test.ts`
- `src/ui/layout-contract.test.ts`
- `reports/qa/v0_62_block2_run.md`

## 저장 경로 영향

- `createInitialState()`에 `discoveredPayoffIds: []` 추가.
- `hydrateGameState()`에 `discoveredPayoffIds: sanitizeStringArray(rawState.discoveredPayoffIds)` 추가.
- 구버전 세이브에 필드가 없으면 `[]`로 마이그레이션된다.
- `save-integrity.test.ts`에 round-trip + old-save migration 테스트 추가.

## 시뮬레이션 영향

- `simulation.ts` 변경은 초기 상태와 hydrate sanitizer뿐이다.
- `advanceMonth`, `calculateMonthlyEconomy`, `getMonthlyStrategicEffects`, 자원 delta/tick/balance 계산은 변경하지 않았다.

## 검증

```text
npm test -- payoff-activation save-integrity qa-scenarios layout-contract

Test Files  4 passed (4)
Tests  132 passed (132)
```

```text
npm run harness:gate

Test Files  44 passed (44)
Tests  444 passed (444)
Data validation passed.
vite build: 112 modules transformed, built in 661ms.
```

## QA 진입점

- `http://127.0.0.1:5201/?scenario=collection`
- 일부 항목은 발견 상태로 공개되고, 나머지는 `???`로 잠긴 상태를 보여준다.
