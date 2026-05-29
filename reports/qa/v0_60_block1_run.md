# v0.60 블록 #1 실행 증거 — 신규 물리 산업 도메인 기반

작성일: 2026-05-29
담당: Codex CLI 구현 트랙
범위: `v0.60-alpha-boundaryless-industry-expansion` 블록 #1만

## 변경 요약

- `data/domains.json`: 신규 물리 산업 3개 추가
  - `manufacturing` — `robotics` Lv.1 + `optimization` Lv.1
  - `logistics` — `agent` Lv.2 + `optimization` Lv.1
  - `energy` — `optimization` Lv.2 + `enterprise` Lv.1
- `data/products.json`: 신규 제품 6개 추가
  - 제조: `adaptive_factory_control_os`, `digital_twin_production_line`
  - 물류: `autonomous_fulfillment_router`, `cold_chain_control_tower`
  - 에너지: `data_center_load_balancer`, `smart_grid_demand_orchestrator`
- 제품 UI:
  - 도메인 필터는 기존 `getProductDomainFilters` 경로로 신규 도메인을 노출한다.
  - 제품 패널의 확장 맵과 경계 확장 목표 목록에 신규 3개 도메인을 추가했다.
- QA route:
  - `?scenario=physical-industries` 등록.
  - 제품 메뉴로 진입하며 제조/물류/에너지 도메인을 해금한 상태와 관련 능력치를 제공한다.
- i18n:
  - 신규 노출 문자열은 기존 데이터 `name`/`description` 렌더링 경로를 사용한다.
  - 새 UI 컴포넌트나 새 `ui.*` 키가 없어 ko/en locale 추가는 필요하지 않았다.
- `src/game/simulation.ts`: 미수정.

## 게이팅 근거

- 신규 도메인은 모두 `unlocked_by_default: false`.
- 신규 제품은 모두 신규 도메인 소속이며, 시작 상태에는 신규 도메인이 해금되어 있지 않다.
- 신규 제품은 기존 capability만 요구한다. 새 capability, 시너지, 콤보, simulation tick 변경은 추가하지 않았다.
- 시작 시 launchable 제품은 기존 시작 제품 경로가 유지되고, 신규 물리 산업 제품은 launchable이 아니다.

## 테스트 증거

### Red 확인

- `npm test -- src/game/product-filters.test.ts src/game/qa-scenarios.test.ts --maxWorkers=1`
  - 실패 확인: 도메인 수 12 vs 기대 15, `physical-industries` route 없음, 제품 메뉴 진입 아님.
- `npm test -- src/game/boundaryless-expansion.test.ts --maxWorkers=1`
  - 실패 확인: 경계 확장 목표에 `manufacturing` / `logistics` / `energy` 없음.

### Green 확인

- `npm test -- src/game/product-filters.test.ts src/game/qa-scenarios.test.ts src/game/boundaryless-expansion.test.ts --maxWorkers=1`
  - 결과: 3 files / 62 tests passed.

### 데이터 검증

- `npm run validate:data`
  - 결과: `Data validation passed.`

### Route smoke

- dev server: `npm run dev -- --port 5201`
- `curl -s -o /dev/null -w "%{http_code} %{content_type}\n" "http://127.0.0.1:5201/?scenario=physical-industries"`
  - 결과: `200 text/html`
- Playwright 기반 브라우저 smoke는 환경에 `playwright` 모듈이 없어 실행하지 못했다.

## 최종 게이트

명령:

```bash
npm run harness:gate
```

결과:

```text
Rejected 1 returned session file(s).
Test Files  43 passed (43)
Tests       420 passed (420)
Data validation passed.
vite v6.4.2 building for production...
106 modules transformed.
✓ built in 678ms
```

판정: 통과. `Rejected 1 returned session file(s).`는 기존 테스트 fixture 경고성 출력이며 게이트 exit code는 0이었다. 요구 기준인 43 files / 418+ tests를 충족했다.
