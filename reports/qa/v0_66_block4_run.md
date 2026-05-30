# v0.66 #4 밸런스 스윕 QA

작성일: 2026-05-30
대상: `v0.66-alpha-tag-derivation-engine` 최종 블록 #4
범위: `runTenYearCampaignSimulation("productivity_line", selection)` 기준 10년 압축 시뮬레이션

## 결론

- 대표 조합 4종 모두 120개월 도달, `status: success`, 상태 무결성 OK.
- 혼합 아키타입 조합의 난이도 스윕도 `story`, `standard`, `hard`, `brutal` 모두 120개월 완주.
- 생존 여유 프록시 기준으로 `story == standard >= hard >= brutal`이라 난이도 역전 없음.
- 데이터 튜닝 없음. 완주 붕괴나 난이도 역전이 없어 `difficulty_tiers.json`, `derivation_rules.json`, `run_modifiers.json`은 변경하지 않았다.
- tick / save / 타입 / 구조 변경 없음. 변경은 `src/game/run-simulator.test.ts`의 회귀 스윕 추가와 이 QA 리포트뿐이다.

## 대표 조합 스윕

생존 여유 프록시: `cash + users*0.05 + trust*250 + hype*150 + compute*10 + data*5`.

| 조합 | selection 요약 | 파생 아키타입 | 월/상태 | 무결성 | 엔딩 | 최종 지표 | 생존 여유 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 표준/no-arg | 인자 없음 | 없음 | 120 / success | OK | S / 96 | cash 81,981 · users 371,129 · trust 100 · hype 47 · compute 658 · data 5,270 | 165,517 |
| 가혹 세계+시장+하드 | `bitcoin_gpu_squeeze` + `enterprise_winter` + `hard` | 없음 | 120 / success | OK | S / 96 | cash 82,559 · users 324,771 · trust 100 · hype 0 · compute 503 · data 5,151 | 154,583 |
| 아키타입 보유 | `san_francisco` + `engineer_founder` | `frontier_garage` | 120 / success | OK | S / 96 | cash 82,010 · users 369,294 · trust 100 · hype 60 · compute 826 · data 5,149 | 168,480 |
| 혼합 | `san_francisco` + `open_source_heaven` + `ai_boom` + `engineer_founder` + `hard` | `frontier_demo_loop`, `frontier_garage`, `oss_evangelist` | 120 / success | OK | S / 96 | cash 81,605 · users 396,558 · trust 100 · hype 66 · compute 1,041 · data 5,862 | 176,053 |

## 난이도 스윕

공통 selection: `san_francisco` + `open_source_heaven` + `ai_boom` + `engineer_founder`.

| 티어 | 월/상태 | 무결성 | 엔딩 | 최종 지표 | 생존 여유 |
| --- | --- | --- | --- | --- | --- |
| story | 120 / success | OK | S / 96 | cash 81,381 · users 413,867 · trust 100 · hype 100 · compute 1,022 · data 5,862 | 181,604 |
| standard | 120 / success | OK | S / 96 | cash 81,381 · users 413,867 · trust 100 · hype 100 · compute 1,022 · data 5,862 | 181,604 |
| hard | 120 / success | OK | S / 96 | cash 81,605 · users 396,558 · trust 100 · hype 66 · compute 1,041 · data 5,862 | 176,053 |
| brutal | 120 / success | OK | S / 96 | cash 81,525 · users 396,558 · trust 100 · hype 66 · compute 1,041 · data 5,862 | 175,973 |

`story`와 `standard`는 현재 월간 역풍이 둘 다 `{}`라 동일한 생존 여유가 정상이다. `hard`와 `brutal`은 모두 자동 실패가 아니며, 생존 여유는 표준보다 낮고 브루탈이 하드보다 낮다.

## 튜닝

없음.

근거: 가혹 조합, 아키타입 보유 조합, 혼합 조합, 브루탈 난이도까지 모두 10년 완주와 무결성 OK를 만족했다. 완주 붕괴나 난이도 역전이 없으므로 보수적 데이터 조정 조건이 발생하지 않았다.

## 검증

- `npm test -- src/game/run-simulator.test.ts`
  - 1 file passed
  - 13 tests passed
- `npm run harness:gate`
  - 48 files passed
  - 500 tests passed
  - `validate:data`: Data validation passed
  - `build`: 120 modules transformed, production build passed in 2.30s
