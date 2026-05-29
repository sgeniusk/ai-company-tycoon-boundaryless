# v0.64 block #2 QA - world-events content expansion

작성일: 2026-05-30

## 범위

- 블록: `v0.64-alpha-content-depth` #2
- 목표: `data/world_events.json` 이벤트 풀을 12개에서 26개로 확장
- 제약: 데이터/검증/테스트/QA 리포트만 변경. `src/game/world-events.ts`, `simulation.ts`, `types.ts`, save path, `data/run_modifiers.json`, UI 미변경.

## 추가 이벤트

- `agi_overhang` (`research_fast`, `safety_scrutiny`): `agi_takeoff_debate`, `alignment_scramble`
- `data_drought` (`data_scarce`, `synthetic_premium`): `public_data_lockdown`, `synthetic_data_rush`
- `chip_war` (`export_controls`, `compute_regional`): `export_control_tightening`, `regional_chip_consortium`
- `privacy_fortress` (`privacy_strict`, `consent_economy`): `privacy_crackdown`, `consent_data_market`
- `bigtech_monopoly` (`distribution_locked`, `platform_tax`): `platform_fee_hike`, `distribution_blockade`
- `ai_winter_redux` (`funding_drought_world`, `skeptic_market`): `funding_ice_age`, `skeptic_headlines`
- `robotics_boom` (`embodied_demand`, `hardware_capital`): `embodied_demand_spike`, `hardware_capital_inflow`

총 이벤트 수: 26개.

## 검증 메모

- 모든 신규 이벤트는 기존 테스트의 자원 효과 크기 범위 안에 유지했다.
- 모든 신규 이벤트 `year_range`는 2~10년차 스케줄과 겹친다.
- `src/game/world-events.test.ts`의 이벤트 풀 상한을 28로 갱신했다.
- 신규 테스트는 같은 시드에서 `chip_war`가 `standard`보다 칩 전쟁 테마 이벤트를 더 많이 스케줄링하고, `export_control_tightening` + `regional_chip_consortium`이 모두 포함되는지 확인한다.
- 표준 10년 런 완주는 기존 `runTenYearCampaignSimulation("productivity_line")` 테스트로 유지 확인했다.

## 실행 결과

### `npm test -- src/game/world-events.test.ts`

- 결과: 통과
- 요약: 1 files / 8 tests passed

### `npm run validate:data`

- 결과: 통과
- 요약: `Data validation passed.`

### `npm run harness:gate`

- 결과: 통과
- 테스트: 47 files / 472 tests passed
- 데이터 검증: `Data validation passed.`
- 빌드: `tsc && vite build` 통과, Vite production build 완료
- 번들: 117 modules transformed, built in 790ms
