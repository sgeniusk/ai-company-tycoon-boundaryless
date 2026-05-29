# v0.61 블록 #2 QA — 10년 캠페인 완주 게이트

작성일: 2026-05-29
대상: `v0.61-alpha-public-web-alpha` 블록 #2

## 결론

- `growth_paths.json`의 3개 성장 전략 모두 `CAMPAIGN_FINAL_MONTH` 120개월까지 완주했다.
- 모든 전략의 최종 상태는 `success`, `integrity.ok=true`, 엔딩 존재, 연간 스냅샷 10개, 연간 심사 10회다.
- 신규 v0.60 물리 산업 경로는 `code_vision_lab` 10년 캠페인에서 `manufacturing`, `logistics`, `energy` 제품 출시까지 확인했다.
- `AlphaReadinessReport.versionTarget`와 `EndToEndCampaignCoverageReport.versionTarget`는 `v0.61-alpha`로 갱신했다.
- `simulation.ts` tick 로직은 건드리지 않았다. 수정 범위는 `run-simulator.ts` 하네스 정책과 테스트뿐이다.

## 전략별 완주 표

| 전략 | 최종 월 | 상태 | 무결성 | 엔딩 | 점수 | 별점 | 연간 심사 | 연간 스냅샷 | 제품 수 | v0.60 물리 산업 |
|---|---:|---|---|---|---:|---:|---:|---:|---:|---|
| `productivity_line` | 120 | success | OK | S | 96 | 4 | 10 | 10 | 3 | - |
| `trust_enterprise` | 120 | success | OK | S | 100 | 4 | 10 | 10 | 4 | - |
| `code_vision_lab` | 120 | success | OK | S | 100 | 5 | 10 | 10 | 6 | manufacturing, logistics, energy |

## 발견 및 조치

- 소프트락은 발견되지 않았다. 전 전략 120개월 완주 테스트는 첫 red run에서도 통과했다.
- 미검증 공백 1: `code_vision_lab`이 완주하더라도 v0.60 물리 산업으로 자연 확장하지 않았다. `runTenYearCampaignSimulation`의 장기 캠페인 하네스에 결정론적 물리 산업 확장 정책을 추가해 제조/물류/에너지 제품까지 검증하게 했다.
- 미검증 공백 2: `trust_enterprise`는 120개월 완주하지만 기존 엔드투엔드 리포트의 제품 3개 조건을 만족하지 못했다. 장기 캠페인용 포트폴리오 fallback을 추가해 전략별 권장 제품 이후에도 가능한 제품을 하나 더 개발하게 했다.
- 두 조치 모두 하네스 자동 플레이 정책에 한정된다. 게임 tick, 저장/불러오기, 밸런스 데이터는 변경하지 않았다.

## 리포트 게이트

- `evaluateAlphaReadiness()`:
  - `versionTarget`: `v0.61-alpha`
  - `pass`: `true`
  - `score`: 73
  - `ten_year_campaign`: `10년 캠페인 3/3개 성장 경로가 120개월 완주`
  - `integrity`: pass
  - `ending`: `3/3개 성장 경로 D랭크 회피`
- `evaluateEndToEndCampaignCoverage(strategyId)`:
  - 3개 전략 모두 `versionTarget=v0.61-alpha`
  - 3개 전략 모두 `pass=true`

## 검증

```text
npm test -- src/game/run-simulator.test.ts --maxWorkers=1
Test Files  1 passed (1)
Tests  9 passed (9)
```

```text
npm run build
vite v6.4.2 building for production...
110 modules transformed.
✓ built in 1.02s
```

```text
npm run harness:gate
Test Files  43 passed (43)
Tests  433 passed (433)
Data validation passed.
vite v6.4.2 building for production...
110 modules transformed.
✓ built in 1.14s
```
