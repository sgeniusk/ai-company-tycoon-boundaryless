# v0.64 Block #1 Run Modifier Content Wave QA

작성일: 2026-05-30
작업 브랜치: `v0.64-content-wave`

## 변경 요약

- `data/run_modifiers.json`
  - `world_lore`: 5 -> 12
  - `start_cities`: 6 -> 11
  - `market_conditions`: 4 -> 8
  - `founder_traits`: 5 -> 9
  - 새 월간 효과 태그는 보수적 수치로 `tag_effects`에 정의했다.
  - 식별/시작 전용 태그(`city_*`, `reg_balance`, `ux_bias` 등)는 월간 효과를 만들지 않았다.
- `scripts/harness/validate-data.mjs`
  - 런 모디파이어 축별 기대 개수 검증을 추가했다.
  - default 4종의 `starting_deltas.resources` / `starting_deltas.capabilities`가 빈 객체인지 검증한다.
  - `tag_effects`의 리소스 id 유효성 검증은 기존 `validateResourceMap` 경로로 유지된다.
- `src/game/run-modifiers-content.test.ts`
  - 축별 개수와 id 유니크 검증.
  - default 4종 무보정 회귀 가드.
  - 새 세계관 주요 항목의 deltas/tags 데이터 로딩 검증.
  - seed 결정론 검증.
  - 모든 `tag_effects` 리소스 id가 `resources`에 존재하는지 검증.

## 콘텐츠 수량

- 세계관: 12
- 시작도시: 11
- 시장조건: 8
- 창업자 특성: 9
- 조합 수: `12 * 11 * 8 * 9 = 9,504`
- 기존 조합 수: `5 * 6 * 4 * 5 = 600`

## Default No-Op 확인

다음 default 항목은 모두 시작 보정이 빈 객체로 유지된다.

- `default_city`: `{ resources: {}, capabilities: {} }`
- `standard`: `{ resources: {}, capabilities: {} }`
- `steady_market`: `{ resources: {}, capabilities: {} }`
- `no_founder`: `{ resources: {}, capabilities: {} }`

테스트에서 `selectRunModifierConfig()`의 시작 리소스/역량 보정이 `{}`이고, 기본 상태의 `getRunModifierMonthlyEffects()`도 `{}`임을 확인했다.

## 검증 증거

1. `npm run validate:data`
   - 결과: 통과
   - 출력 요약: `Data validation passed.`

2. `npm test -- --run src/game/run-modifiers-content.test.ts --maxWorkers=1`
   - 결과: 통과
   - 출력 요약: `Test Files 1 passed (1)`, `Tests 5 passed (5)`

3. `npm run harness:gate`
   - 결과: 통과
   - 출력 요약:
     - `Test Files 47 passed (47)`
     - `Tests 469 passed (469)`
     - `Data validation passed.`
     - `vite v6.4.2 building for production...`
     - `116 modules transformed.`
     - `built in 844ms`

## 환경 메모

이 isolated worktree의 `node_modules`가 처음에는 메인 체크아웃의 `node_modules`로 향하는 symlink라서 Vite 기본 config loader가 `.vite-temp`를 쓸 때 sandbox `EPERM`이 났다. worktree 내부에 ignored `node_modules` 디렉터리를 만들고 패키지 항목은 기존 설치본으로 symlink하되 `.vite` / `.vite-temp`만 worktree 안에 두어, 프로젝트 파일 변경 없이 stock `npm run harness:gate`를 통과시켰다.
