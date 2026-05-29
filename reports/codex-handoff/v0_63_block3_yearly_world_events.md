# Codex CLI 인계 — v0.63 블록 #3 (연중 세계 이벤트)

작성일: 2026-05-29
작성자: Claude Code (하네스/계약/플래닝 트랙)
대상: Codex CLI (gpt-5.5, reasoning effort **xhigh** — 월간 tick + 신규 저장 필드 + 결정론적 시드, 정확성 치명적)
작업 디렉토리: `/Users/taewookkim/dev/ai-company-tycoon`
현재 feature: `v0.63-alpha-roguelike-run-modifiers` (블록 #1·#2 완료·커밋, 이번은 **블록 #3만**)

## 한 줄 요약

"매년 변수가 계속" 들어오게 — 런이 전개될수록 **세계 이벤트**가 발동하되, **런 시드로 매번 다른 조합**이 뜨게 한다 (리플레이성). 기존 `campaign_shocks` 적용 시스템을 그대로 미러링한 **병렬 world-events 레이어**로 만든다.

## 정확한 미러링 대상 (이미 있는 패턴)

- `src/game/campaign-shocks.ts` — `applyDueCampaignShocks(state)` (line 41)가 `campaignShockHistory`(중복 방지 appliedIds)를 보고 due shock의 `resource_effects`/`rival_momentum_delta`를 적용하고 history를 갱신. **이걸 1:1 미러링**한다.
- `src/game/simulation.ts:2937` — `const shockedState = applyDueCampaignShocks(reviewedState);` 가 advanceMonth에서 호출되는 지점. world-events 적용도 **바로 옆에 동일 패턴**으로 한 줄 추가.
- `GameState.campaignShockHistory` (save-migrated, simulation.ts:3247 `sanitizeStringArray(..., campaignShocks.map(id))`). 신규 `worldEventHistory`도 동일 패턴.
- `data/campaign_shocks.json` (keys: id, month, year, title, description, resource_effects, rival_momentum_delta, ...) — world_events.json은 이보다 가볍게.
- 블록 #1의 `GameState.runModifiers`(`seed`, `worldLoreId`) — **시드 기반 결정론적 선택**의 입력.

## 작업 내용

### 1. 데이터 — `data/world_events.json`
연중 세계 이벤트 풀. 각 이벤트 — `id`, `title`, `description`, 발동 조건(예: `min_year` 또는 `year_range`), **보수적 `resource_effects`**(additive, campaign_shocks보다 작게), 선택적 `world_lore_tags`(특정 세계관에서만/더 자주 등장). 10개 내외.

### 2. 시드 기반 선택 — `src/game/run-modifiers.ts`(또는 신규 모듈)
`runModifiers.seed` + `worldLoreId`로 **결정론적**으로 "이 런에서 어떤 이벤트가 몇 년차에 뜨는지"를 정하는 순수 함수. RNG 금지 — 시드에서 파생. 같은 시드 = 같은 이벤트 시퀀스(하네스 결정론).

### 3. 적용 — `applyDueWorldEvents(state)` (campaign-shocks 미러링)
`worldEventHistory`로 중복 방지, due 이벤트의 resource_effects를 additive 적용, history 갱신. `simulation.ts:2937`의 `applyDueCampaignShocks` 바로 옆에 호출 한 줄 추가. **그 외 tick 로직 불변.**

### 4. 저장 필드
`GameState.worldEventHistory: string[]` 추가 (createInitialState `[]`, hydrate `sanitizeStringArray`). 구버전 세이브 = `[]` 마이그레이션. round-trip 테스트.

### 5. QA 시나리오 + 테스트
- `?scenario=world-events`(또는 run-modifiers 확장) — 특정 시드/세계관에서 이벤트가 발동하는 상태로 진입.
- 테스트 — 시드 기반 선택 결정론(같은 시드=같은 시퀀스), `applyDueWorldEvents` 중복 미발동, 저장 round-trip + 구버전 마이그레이션, **표준/기본 런이 여전히 10년 완주**(기존 run-simulator 완주 게이트 유지), 보수적 효과.
- 목표 457 → 461+.

## 제약 (가장 중요)

- **결정론적** — 시드에서 파생, tick에 RNG 금지 (하네스가 결정론에 의존; run-simulator 10년 완주 게이트 통과 유지).
- **10년 완주 불변** — 세계 이벤트가 기본/표준 런의 완주를 깨면 안 됨. 효과는 보수적·additive. v0.61 #2의 전 전략 완주 테스트가 계속 통과해야 함.
- campaign_shocks를 **건드리지 말고** 병렬 레이어로 (격리). 기존 shock 동작 불변.
- `applyDueCampaignShocks` 옆 한 줄 외 tick 불변. 저장 round-trip 유지.
- `npm run harness:gate` 통과.

## 완료 기준

1. `data/world_events.json` 풀 + 시드 기반 결정론적 선택 + `applyDueWorldEvents`(campaign-shocks 미러) + advanceMonth 한 줄 연결.
2. `GameState.worldEventHistory` 저장 필드 + round-trip + 구버전 마이그레이션 테스트.
3. 시드 결정론 + 중복 미발동 테스트, 표준 런 10년 완주 유지.
4. `?scenario=world-events` 확인.
5. `npm run harness:gate` 통과 (45 files / 461+ tests).
6. `reports/qa/v0_63_block3_run.md` — 변경 파일, 이벤트 풀/선택 방식, tick·저장 영향, 10년 완주 가드 결과, 게이트 출력.

## 세션 종료 시

`git commit` 금지. 마지막 메시지에 변경 파일 + tick/저장 영향 + 10년 완주 유지 확인 + 게이트. 계약 파일 편집 금지.
