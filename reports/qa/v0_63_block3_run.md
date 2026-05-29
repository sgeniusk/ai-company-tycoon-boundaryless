# v0.63 블록 #3 QA 실행 기록 — 연중 세계 이벤트

작성일: 2026-05-29

## 범위

- 블록 #3만 구현했다. `campaign_shocks` 데이터/로직은 수정하지 않았다.
- 신규 병렬 레이어: `data/world_events.json` + `src/game/world-events.ts`
- 신규 저장 필드: `GameState.worldEventHistory`
- 신규 QA 라우트: `?scenario=world-events`

## 구현 요약

- `data/world_events.json`: 12개 세계 이벤트 풀을 추가했다. 각 이벤트는 `id`, `title`, `description`, `trigger`, `year_range`, 보수적 additive `resource_effects`, 선택적 `world_lore_tags`를 가진다.
- `getRunWorldEventSchedule(state)`: `runModifiers.seed + worldLoreId` 기반 FNV-1a 해시로 2-10년차 이벤트를 결정한다. 런 중 RNG를 쓰지 않는다.
- `applyDueWorldEvents(state)`: `applyDueCampaignShocks`와 같은 구조로 due 이벤트를 찾고, `worldEventHistory`로 중복 적용을 막고, `resource_effects`만 additive 적용한다.
- 첫해 12개월차는 기존 연간 심사/챌린저 등장 타임라인 계약을 유지하기 위해 world-event 발동을 2년차부터 시작한다.

## Tick / 저장 영향

- `advanceMonth` 변경점:
  - `const shockedState = applyDueCampaignShocks(reviewedState);`
  - 바로 다음 줄에 `const worldEventState = applyDueWorldEvents(shockedState);` 추가
  - 최종 status/refresh는 `worldEventState`를 사용한다.
- 저장:
  - `createInitialState`: `worldEventHistory: []`
  - `hydrateGameState`: `sanitizeStringArray(rawState.worldEventHistory, worldEvents.map(...))`
  - 구버전 세이브에서 필드가 없으면 `[]`로 마이그레이션된다.

## 검증

- TDD red: `npm test -- src/game/world-events.test.ts`
  - 최초 실패: `Cannot find module './world-events'`
- Targeted green:
  - `npm test -- src/game/world-events.test.ts` → 1 file / 7 tests passed
  - `npm test -- src/game/world-events.test.ts src/game/run-modifiers.test.ts src/game/campaign-shocks.test.ts src/game/save-integrity.test.ts src/game/qa-scenarios.test.ts src/game/run-simulator.test.ts` → 6 files / 92 tests passed
  - `npm run validate:data` → Data validation passed
- Regression fix:
  - 1차 full gate에서 1년차 world-event가 기존 month 12 타임라인을 밀어 annual-review / challenger-entry 테스트 2개가 실패했다.
  - world-event schedule을 2년차부터 시작하게 고정한 뒤 targeted regression 재검증:
    - `npm test -- src/game/world-events.test.ts src/game/annual-review.test.ts src/game/boundaryless-expansion.test.ts` → 3 files / 32 tests passed

## 최종 Gate

명령:

```bash
npm run harness:gate
```

결과:

```text
Test Files  46 passed (46)
Tests  464 passed (464)
Data validation passed.
✓ 116 modules transformed.
✓ built in 827ms
```

10년 완주 가드:

- `src/game/world-events.test.ts`에서 standard `runTenYearCampaignSimulation("productivity_line")`가 month 120 이상, non-failure, integrity ok, world events 8개 이상 기록을 통과했다.
- 기존 `src/game/run-simulator.test.ts`의 모든 growth-path 10년 완주 테스트도 full gate에서 통과했다.

## 변경 파일

- `data/world_events.json`
- `src/game/world-events.ts`
- `src/game/world-events.test.ts`
- `src/game/types.ts`
- `src/game/data.ts`
- `src/game/simulation.ts`
- `src/game/state-integrity.ts`
- `src/game/qa-scenarios.ts`
- `src/game/qa-scenarios.test.ts`
- `scripts/harness/validate-data.mjs`
- `reports/qa/v0_63_block3_run.md`
