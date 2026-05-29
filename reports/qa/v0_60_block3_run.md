# v0.60 블록 #3 QA 실행 보고서 — 산업 간 시너지

작성일: 2026-05-29
작업 범위: 블록 #3만 구현. 블록 #4 콤보 미포함. `git commit` 미실행.

## 변경 파일

- `data/industry_synergies.json` — 정확히 10개 산업 간 시너지 추가.
- `src/game/industry-synergies.ts` — `getIndustrySynergySummary(state)` 추가.
- `src/game/types.ts` — `IndustrySynergyDefinition/Status/Summary` 타입 추가.
- `src/game/data.ts` — `industrySynergies` 데이터 export 추가.
- `src/game/simulation.ts` — 월간 전략 효과 집계에 산업 시너지 효과 연결.
- `scripts/harness/validate-data.mjs` — `industry_synergies.json` 스키마, 정확히 10개, 도메인/자원/tags 검증 추가.
- `src/components/MenuPanels.tsx` — 제품 패널에 활성 산업 시너지 요약 표시.
- `src/App.css` — `industry-synergy-panel` / `industry-synergy-grid` 스타일 추가.
- `src/game/boundaryless-expansion.test.ts` — 데이터 10개 고정, 활성 조건, 월간 집계 반영 테스트 추가.
- `src/ui/layout-contract.test.ts` — 제품 콘솔 시너지 표시 계약 추가.

참고: `docs/ROADMAP.md`, `progress.md`는 작업 중 별도 변경으로 `git status`에 표시됐지만, 이번 블록 구현에서는 편집하지 않았다.

## 추가된 10개 시너지

1. `robotics_manufacturing_cell` — robotics + manufacturing, 월간 automation +2 / cash +120
2. `factory_energy_loop` — manufacturing + energy, 월간 compute +4 / cash +140
3. `smart_fleet_grid` — logistics + mobility, 월간 users +120 / data +2
4. `chip_model_stack` — foundation_models + semiconductors, 월간 compute +6 / data +2
5. `green_inference_fabric` — energy + semiconductors, 월간 compute +5 / trust +1
6. `warehouse_robot_dispatch` — robotics + logistics, 월간 automation +2 / users +90
7. `industrial_support_mesh` — customer_support + manufacturing, 월간 trust +2 / cash +100
8. `learning_toy_loop` — education + toys, 월간 users +110 / hype +1
9. `creator_factory_pipeline` — creator_tools + manufacturing, 월간 hype +2 / cash +90
10. `enterprise_energy_ops` — enterprise_automation + energy, 월간 trust +2 / automation +1

## `simulation.ts` 변경

- import 추가: `import { getIndustrySynergySummary } from "./industry-synergies";`
- 월간 전략 효과 집계 지점:
  - `const industrySynergyEffects = getIndustrySynergySummary(state).totalMonthlyEffects;`
  - `if (Object.keys(industrySynergyEffects).length > 0) effects.push(industrySynergyEffects);`

새 tick 경로는 만들지 않았고, 기존 `officeSynergyEffects` / `deckSynergyEffects`와 같은 집계 경로만 사용했다.

## 검증 증거

- `npm run validate:data` — Data validation passed.
- `npm test -- src/game/boundaryless-expansion.test.ts src/ui/layout-contract.test.ts` — 2 files / 72 tests passed.
- `npm run build` — 108 modules transformed, build passed.
- `npm run harness:gate` — 43 files / 425 tests passed, Data validation passed, production build passed.

최종 게이트 출력 요약:

```text
Test Files  43 passed (43)
Tests       425 passed (425)
Data validation passed.
✓ 108 modules transformed.
✓ built in 773ms
```
