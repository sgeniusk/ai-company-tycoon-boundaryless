# v0.59 AI 자원 가시화 실행 증거

작성일: 2026-05-29
대상: `v0.59-alpha-resource-visibility`

## 변경 파일

- `src/game/resource-visibility.ts` — derive-only AI 자원 지표 순수 함수 추가
- `src/components/MenuPanels.tsx` — 연구 패널 내부에 자원 가시화 블록 추가
- `src/game/qa-scenarios.ts` — `?scenario=resource-visibility` QA route 추가
- `src/game/qa-scenarios.test.ts` — QA route와 non-zero 지표 검증 추가
- `src/ui/layout-contract.test.ts` — 연구 패널 layout-contract `it` 블록 추가
- `src/App.css` — 연구 패널 자원 지표 스타일 및 모바일 1열 계약 추가
- `data/locales/ko.json`, `data/locales/en.json` — ko/en i18n label/unit keys 추가

## Derive 공식

- 월간 compute 부하: 활성 제품별 `compute_per_1000_users * productLevelComputeMultiplier * (allocatedUsers / 1000)` 합.
- `allocatedUsers`: `GameState.resources.users`를 활성 제품의 월간 사용자 생성 weight(`base_users_per_month * productLevelUserMultiplier`) 비율로 배분했다. 현재 `GameState`에는 제품별 누적 사용자 필드가 없어서 새 state를 만들지 않고 기존 월간 성장 모델의 weight만 사용했다.
- 월간 데이터 생성량: 활성 제품별 `data_generated_per_month * productLevelDataMultiplier` 합. `calculateMonthlyEconomy`가 `generatedData`를 사용자 수로 스케일하지 않고 제품별 월간 데이터 생성량 합으로 계산하므로 기존 시뮬레이션 모델과 맞췄다.
- 다음 출시 필요 compute: 개발 중인 첫 `productProjects[0]` 제품의 `launch_cost.compute`. 개발 중인 제품이 없으면 현재 조건으로 출시 후보가 될 수 있는 미출시 제품의 compute를 표시한다.

`resource-visibility` QA 상태의 기대 지표:

- 월간 compute 부하: `342.6`
- 월간 데이터 생성량: `26`
- 다음 출시 필요 compute: `90` (`프론티어 추론 모델`)

## 검증

```bash
npx vitest run src/ui/layout-contract.test.ts
```

- 통과: 1 file / 61 tests

```bash
npx vitest run src/game/qa-scenarios.test.ts
```

- 통과: 1 file / 52 tests

```bash
npm run harness:gate
```

- 통과: 43 files / 417 tests
- `npm run validate:data`: Data validation passed.
- `npm run build`: Vite production build passed, `✓ built in 964ms`

## 계약 확인

- `src/game/simulation.ts` 변경 없음.
- `src/game/types.ts` 변경 없음.
- 새 `GameState` 필드 없음.
- `AGENTS.md`, `feature_list.json`, `progress.md`, `CLAUDE.md`는 Codex 구현 트랙에서 편집하지 않음. 워킹 트리에 있던 기존 미커밋 변경은 그대로 둠.
