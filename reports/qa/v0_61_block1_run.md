# v0.61 블록 #1 저장/불러오기 마이그레이션 경화 실행 기록

작성일: 2026-05-29
범위: `v0.61-alpha-public-web-alpha` 블록 #1 저장/불러오기 마이그레이션 경화

## 변경 파일

- `src/game/save-integrity.test.ts`
  - v0.58-v0.60 후반부 세이브 라운드트립 테스트 추가.
  - 레거시 세이브 마이그레이션 기본값 테스트 추가.
  - malformed 제조/물류 capability hydrate 회귀 테스트 추가.
- `src/game/simulation.ts`
  - `hydrateGameState`의 `capabilities` 병합을 `sanitizeCapabilityMap`으로 교체.
  - 신규 헬퍼는 현재 capability 데이터의 알려진 id만 대상으로 `sanitizeNumber` + `clamp` + 반올림을 적용한다.

편집 금지 파일(`AGENTS.md`, `feature_list.json`, `progress.md`, `CLAUDE.md`, `docs/ROADMAP.md`)은 수정하지 않았다.

## 추가 테스트 요약

1. 풀 late-game 라운드트립
   - `marketShareHistory` 3개, `pendingChallengerEntryIds`, 제조/물류 capability, 신규 물리 도메인(`manufacturing`, `logistics`, `energy`), 신규 물리 제품 activeProducts/productLevels, `competitorStates`, `annualReviewHistory`, `roguelite`를 채운 `GameState`를 생성.
   - `serializeGameState` -> `hydrateGameState` 후 핵심 필드 보존을 확인.
   - `validateGameStateIntegrity(hydrated)`가 `ok: true`.
   - 같은 hydrated 상태로 `calculateOfflineSettlement` 4일 정산을 실행해 예외 없이 finite delta를 확인.
2. 레거시 세이브 마이그레이션
   - version 8 형태의 저장 JSON에서 `marketShareHistory`, `pendingChallengerEntryIds`, `capabilities.manufacturing`, `capabilities.logistics`를 제거.
   - hydrate 후 `status: "playing"`, 복구 메시지 없음, `marketShareHistory: []`, `pendingChallengerEntryIds: []`, 제조/물류 capability `0`, integrity ok를 확인.
3. capability sanitizer 회귀
   - `manufacturing: "3"`, `logistics: NaN`이 들어온 저장 데이터를 먼저 테스트했다.
   - RED: 기존 구현은 `manufacturing`을 raw string `"3"`으로 hydrate해 실패.
   - GREEN: `sanitizeCapabilityMap` 적용 후 제조/물류가 안전 기본값 `0`으로 복구되고 integrity ok.

## Hydrate 감사 결과

- v0.58 필드
  - `marketShareHistory`: 기존 `sanitizeMarketShareHistory`로 배열/숫자/topRivalId 정리, 24개월 window 유지.
  - `pendingChallengerEntryIds`: 기존 `sanitizeStringArray`로 정리.
- v0.60 물리 산업 필드
  - `unlockedDomains`: current `domains` id allowlist로 정리하므로 `manufacturing`, `logistics`, `energy`를 안전하게 보존.
  - `activeProducts`: 현재 제품 + generatedProducts id allowlist로 정리하므로 신규 물리 제품을 안전하게 보존.
  - `productLevels`: 기존 `sanitizeProductLevels`로 active/generated 제품과 max level 기준 보정.
  - `capabilities`: audit에서 genuine gap 발견. 기존 raw merge는 `manufacturing`/`logistics`에 string/NaN이 들어올 수 있었다. `sanitizeCapabilityMap`으로 최소 보강했다.
- 나머지 기존 저장 필드는 기존 sanitizer/hydrator 경로를 유지했다. 저장 시스템 구조, recovery 경로, auto-save/localStorage 경로는 재작성하지 않았다.

## SAVE_VERSION 결정

`SAVE_VERSION`은 `11`로 유지했다.

근거:
- 이번 변경은 serialized shape 변경이 아니라 hydrate-time sanitizer 보강과 회귀 테스트 추가다.
- 현재 migration은 version branch가 아니라 `initialState` merge + field sanitizer 방식이다.
- version을 12로 올려도 구버전 로드 동작은 달라지지 않고, 이번 호환성 보장은 version 8 legacy-save 테스트로 직접 검증했다.

## simulation.ts tick 로직

월간 tick/advance 로직은 건드리지 않았다. `src/game/simulation.ts` 변경은 type import, `hydrateGameState`의 capability hydrate 라인, `sanitizeCapabilityMap` helper 추가에 한정된다.

## 검증 증거

- `npm test -- src/game/save-integrity.test.ts`
  - 최종 결과: 1 file passed, 7 tests passed.
  - RED 증거: 신규 malformed capability 테스트가 기존 구현에서 `expected '3' to be +0`으로 실패한 뒤 수정했다.
- `npm run harness:gate`
  - `Test Files  43 passed (43)`
  - `Tests  431 passed (431)`
  - `Data validation passed.`
  - `vite build`: 110 modules transformed, built in 1.11s.

## 결론

블록 #1 완료 조건 충족: late-game round-trip, legacy migration, hydrate gap fix, SAVE_VERSION 근거 기록, late-game offline settlement 확인, 최종 gate 43 files / 431 tests 통과.
