# v0.60 블록 #2 실행 증거

작성일: 2026-05-29
범위: `v0.60-alpha-boundaryless-industry-expansion` 블록 #2만 수행. 블록 #3 시너지와 블록 #4 조합은 추가하지 않음.

## 변경 파일

- `data/capabilities.json`
- `data/starting_state.json`
- `data/domains.json`
- `data/products.json`
- `src/game/qa-scenarios.ts`
- `src/game/qa-scenarios.test.ts`
- `src/game/boundaryless-expansion.test.ts`
- `reports/qa/v0_60_block2_run.md`

## 신규 능력 정의

- `manufacturing` / 제조
  - `max_level`: 4
  - `unlocks_domains`: `{"1":"manufacturing","3":"energy"}`
  - `effects_per_level`: `{"automation":3}`
  - 물리 능력 축에 맞춰 모든 업그레이드 비용에 `compute` 포함.
- `logistics` / 물류
  - `max_level`: 4
  - `unlocks_domains`: `{"1":"logistics"}`
  - `effects_per_level`: `{"automation":2,"data":4}`
  - 공급망/배송 최적화 능력으로 `compute` 포함 비용 사용.
- `starting_state.json`
  - `"manufacturing": 0`, `"logistics": 0` 추가.

## 재게이팅 매핑

| 영역 | 도메인 요구 조건 | 제품 요구 조건 변경 |
|---|---|---|
| 제조 | `robotics:1`, `manufacturing:1`, `optimization:1` | `adaptive_factory_control_os`에 `manufacturing:1`, `digital_twin_production_line`에 `manufacturing:2` 추가 |
| 물류 | `logistics:1`, `agent:2`, `optimization:1` | `autonomous_fulfillment_router`에 `logistics:1`, `cold_chain_control_tower`에 `logistics:2` 추가 |
| 에너지 | `manufacturing:3`, `optimization:2`, `enterprise:1` | `data_center_load_balancer`에 `manufacturing:2`, `smart_grid_demand_orchestrator`에 `manufacturing:3` 추가 |

## UI 및 시뮬레이션

- 연구 패널은 `capabilities` 데이터 배열을 `orderedCapabilities.map(...)`으로 렌더하고 `upgradeCapability(...)`를 그대로 호출하므로 신규 2개 능력은 별도 하드코딩 없이 노출된다.
- `?scenario=physical-industries` QA 상태에 `manufacturing:3`, `logistics:2`를 추가해 새 게이트 기준에서도 물리 산업 제품 확인이 가능하게 했다.
- `src/game/simulation.ts`는 수정하지 않았다. 이유: 능력 맵 타입은 `Record<string, number>`이고 도메인 해금은 기존 `capability.unlocks_domains` 데이터 경로로 처리되어 TS union 또는 하드코딩 목록 수정이 필요 없었다.

## 검증 증거

- RED 확인: `npm test -- src/game/boundaryless-expansion.test.ts --maxWorkers=1`
  - 예상대로 실패: `capabilityIds.has("manufacturing")`가 `false`.
- 집중 검증:
  - `npm test -- src/game/boundaryless-expansion.test.ts --maxWorkers=1` → 1 file / 7 tests passed.
  - `npm test -- src/game/qa-scenarios.test.ts --maxWorkers=1` → 1 file / 53 tests passed.
  - `npm test -- src/game/product-filters.test.ts --maxWorkers=1` → 1 file / 3 tests passed.
  - `npm run validate:data` → Data validation passed.
- 최종 게이트: `npm run harness:gate`
  - Vitest: 43 files passed / 421 tests passed.
  - 비치명 출력: `Rejected 1 returned session file(s).` 후 테스트는 정상 통과.
  - Data validation passed.
  - Build: `tsc && vite build`, 106 modules transformed, built in 683ms.

결론: 블록 #2 완료 기준 충족. 최종 게이트는 43 files / 421 tests로 통과.
