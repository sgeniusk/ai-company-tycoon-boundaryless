# Codex CLI 인계 — v0.61 블록 #1 (저장/불러오기 마이그레이션 경화)

작성일: 2026-05-29
작성자: Claude Code (하네스/계약/플래닝 트랙)
대상: Codex CLI (gpt-5.5, reasoning effort **xhigh** — 정확성 치명적, fast 모드 아님)
작업 디렉토리: `/Users/taewookkim/dev/ai-company-tycoon`
현재 feature: `v0.61-alpha-public-web-alpha` (이번은 **블록 #1만**)

## 한 줄 요약

공개 알파의 1순위 위험은 **플레이어 데이터 손실**(앱 업데이트 후 세이브가 깨지는 것)이다. 저장/불러오기 시스템은 이미 성숙하므로 **다시 만들지 말고**, v0.58~v0.60에서 추가된 필드까지 포함한 **마이그레이션을 테스트로 증명하고 빈틈을 메운다**.

## 역할 분담

- 블록 #1 구현만. **`git commit` 금지.** Claude Code가 검증·커밋한다.
- **`AGENTS.md`/`feature_list.json`/`progress.md`/`CLAUDE.md`/`docs/ROADMAP.md` 편집 금지.**
- 증거는 `reports/qa/v0_61_block1_run.md`에만.

## 이미 존재하는 것 (재작성 금지, 확장만)

- `src/game/simulation.ts`
  - `SAVE_VERSION = 11` (line ~112)
  - `serializeGameState(state, savedAt)` (line ~3166) — `{version, savedAt, state}` JSON
  - `hydrateGameState(serialized)` (line ~3183) — `...initialState, ...rawState` 머지 후 필드별 `sanitize*`/`hydrate*` 적용. 손상 시 `createRecoveryState`로 안전 복구. **이 initialState-머지 방식이 곧 전방 마이그레이션**이다 (구버전 세이브에 없는 신규 필드는 initialState 기본값으로 채워짐).
  - 신규 필드 sanitizer가 이미 있음 — `sanitizeMarketShareHistory`, `pendingChallengerEntryIds`(sanitizeStringArray), `capabilities`(initialState 머지), `productLevels`(sanitizeProductLevels) 등.
- `src/game/state-integrity.ts` — `validateGameStateIntegrity(state)` → `{ok, issues}`
- `src/game/save-integrity.test.ts` — 기존 테스트(손상 JSON 복구, 자원 sanitize, integrity 검출, 초기 상태 라운드트립). **여기에 추가한다.**
- `src/App.tsx` — `saveKey = "ai-company-tycoon-alpha-save"`, localStorage 자동저장, `calculateOfflineSettlement` 오프라인 정산 (참고만)
- `src/game/offline.test.ts` — 오프라인 정산 테스트

## 작업 내용

### 1. 풀 late-game 세이브 라운드트립 테스트 (가장 중요)
`save-integrity.test.ts`에 추가. v0.58~v0.60 필드를 **전부 채운** 후반부 GameState를 만든다 — 예: `marketShareHistory`에 엔트리 여러 개, `pendingChallengerEntryIds` 비어있지 않게, `capabilities`에 `manufacturing`/`logistics` 레벨 보유, 신규 물리 도메인(manufacturing/logistics/energy) `unlockedDomains`에 포함, 해당 도메인 제품 `activeProducts` + `productLevels` 보유, `competitorStates`, `annualReviewHistory`, `roguelite` 등. 그 상태를 `serializeGameState` → `hydrateGameState` 한 뒤.
- 의미 있는 필드들이 **보존**되는지 단언 (month, resources, capabilities.manufacturing, marketShareHistory 길이, pendingChallengerEntryIds, activeProducts, productLevels 등)
- `validateGameStateIntegrity(hydrated).ok === true`

### 2. 레거시 세이브 마이그레이션 테스트
v0.57-era 세이브를 흉내 낸 JSON(신규 필드 `marketShareHistory`/`pendingChallengerEntryIds`/`manufacturing`·`logistics` 능력이 **없는** state)을 `hydrateGameState`에 넣고.
- 깨끗하게 로드되는지 (`status: "playing"`, 복구 메시지 없음)
- 신규 필드가 안전한 기본값으로 채워지는지 (`marketShareHistory: []`, `pendingChallengerEntryIds: []`, `capabilities.manufacturing === 0`, `capabilities.logistics === 0`)
- `validateGameStateIntegrity` ok

### 3. hydrate 커버리지 감사
`hydrateGameState`가 `GameState`의 **모든** 필드(특히 v0.58~v0.60 추가분)를 sanitize 또는 안전하게 spread 하는지 점검. raw로 그냥 spread되어 손상 위험이 있는 필드가 있으면 `reports/qa/v0_61_block1_run.md`에 적고, 명백히 누락된 sanitizer만 **최소 추가**(기존 sanitize 헬퍼 재사용). 광범위 리팩토링 금지.

### 4. SAVE_VERSION 검토
현재 11. 마이그레이션이 버전 분기가 아니라 initialState-머지 기반이므로 버전은 사실상 정보용이다. v0.58~v0.60 필드를 반영해 **12로 올릴지** 판단하고, 올리든 유지하든 `run.md`에 근거를 적는다. 버전을 올려도 구버전 세이브가 여전히 로드돼야 한다(하위호환 유지).

### 5. 오프라인 정산 안전성
`calculateOfflineSettlement`가 위 풀 late-game hydrated 상태에서 예외 없이 동작하는지 `offline.test.ts`에 케이스 추가(또는 #1 테스트에 포함).

## 제약

- 저장/불러오기 시스템을 **재작성하지 않는다.** 추가 테스트 + 최소 경화만.
- 구버전 세이브 하위호환을 절대 깨지 않는다.
- `simulation.ts`의 tick 로직(월간 시뮬레이션)을 건드리지 않는다. 변경은 save/hydrate 경로와 SAVE_VERSION에 한정.
- `npm run harness:gate` 통과 (43 files / 431+ tests 목표).

## 완료 기준

1. 풀 late-game 라운드트립 테스트 + 레거시 마이그레이션 테스트가 추가되고 통과.
2. hydrate 커버리지 감사 결과가 `run.md`에 정리됨 (빈틈 있으면 최소 수정 + 근거).
3. SAVE_VERSION 결정 + 근거 기록.
4. 오프라인 정산이 late-game 상태에서 안전.
5. `npm run harness:gate` 통과 (43 files / 431+ tests).
6. `reports/qa/v0_61_block1_run.md` — 변경 파일, 추가 테스트 요약, hydrate 감사 결과, SAVE_VERSION 결정, simulation.ts 미변경 확인, 최종 게이트 출력.

## 세션 종료 시

`git commit` 금지. 마지막 메시지에 변경 파일 + simulation.ts 변경 여부(원칙적으로 save 경로 외 변경 없어야 함) + 게이트 결과 요약. 계약 파일 편집 금지.
