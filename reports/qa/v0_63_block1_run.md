# v0.63 블록 #1 QA — 런 모디파이어 기반

작성일: 2026-05-29

## 범위

- 블록 #1만 구현: 시작 도시 x 세계관 x 시장 x 창업자 조합을 데이터화하고, 새 런 시작 시 시작 델타만 적용한다.
- 월간 tick, `advanceMonth`, 월간 비용/자원 계산 로직은 변경하지 않았다.
- 기본 조합은 `default_city` + `standard` + `steady_market` + `no_founder`이며 시작 델타가 모두 0이라 기존 신규 게임 수치와 동일하다.

## 변경 파일

- `data/run_modifiers.json`
- `src/game/run-modifiers.ts`
- `src/game/types.ts`
- `src/game/data.ts`
- `src/game/simulation.ts`
- `src/game/meta-progression.ts`
- `src/game/qa-scenarios.ts`
- `src/game/qa-scenarios.test.ts`
- `src/game/run-modifiers.test.ts`
- `scripts/harness/validate-data.mjs`
- `reports/qa/v0_63_block1_run.md`

## 저장 필드

`GameState.runModifiers`를 추가했다.

```ts
{
  seed: string;
  startCityId: string;
  worldLoreId: string;
  marketConditionId: string;
  founderTraitId: string;
  tags: string[];
}
```

- `createInitialState()`는 기본 no-op 조합을 저장한다.
- `createInitialState(selection)`과 `resetRunWithMetaUnlocks(..., selection)`는 선택 조합의 시작 자원/역량 델타를 적용하고 같은 조합을 `runModifiers`에 저장한다.
- `hydrateGameState`는 구버전 세이브의 누락 필드를 기본 no-op 조합으로 마이그레이션한다.
- 저장 round-trip: 비기본 조합(`tokyo` + `bitcoin_gpu_squeeze` + `enterprise_winter` + `researcher_founder`)이 직렬화/복원 후 동일하게 유지됨을 테스트로 확인했다.

## 회귀 가드

- 기본 조합의 `startingResourceDelta`와 `startingCapabilityDelta`는 `{}`.
- 기본 신규 게임 수치가 기존 기준과 동일함을 테스트로 고정:
  - 자금 10000, 이용자 0, 연산력 100, 데이터 50, 인재 3, 신뢰 50, 화제성 10, 자동화 0
  - 역량: language 1, 나머지 시작 역량 0
- `git diff -- src/game/simulation.ts | rg "advanceMonth|calculateMonthlyEconomy|resourceCost|computePressure|totalCost|applyDueCampaignShocks|monthly"` 결과 매칭 없음.

## QA 시나리오

- `?scenario=run-modifiers`
- 비기본 조합: `tokyo` + `bitcoin_gpu_squeeze` + `enterprise_winter` + `researcher_founder`
- 기대 시작 수치:
  - 자금 9500
  - 연산력 70
  - 데이터 95
  - 인재 4
  - 신뢰 54
  - 화제성 12
  - language 2, vision 1, safety 1

## 검증

```bash
npm test -- src/game/run-modifiers.test.ts --maxWorkers=1
```

- 1 files / 6 tests passed

```bash
npm test -- src/game/qa-scenarios.test.ts src/game/save-integrity.test.ts --maxWorkers=1
```

- 2 files / 63 tests passed

```bash
npm run validate:data
```

- Data validation passed

```bash
npm run build
```

- TypeScript + Vite production build passed

```bash
npm run harness:gate
```

- Test Files: 45 passed
- Tests: 454 passed
- Data validation passed
- Production build passed, 114 modules transformed, built in 741ms
