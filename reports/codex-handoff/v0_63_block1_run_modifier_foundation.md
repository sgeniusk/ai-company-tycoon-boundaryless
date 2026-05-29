# Codex CLI 인계 — v0.63 블록 #1 (로그라이크 런 모디파이어 기반)

작성일: 2026-05-29
작성자: Claude Code (하네스/계약/플래닝 트랙)
대상: Codex CLI (gpt-5.5, reasoning effort **xhigh** — 아키텍처 기반 + 신규 영속 필드 + 저장 마이그레이션, 정확성 중요)
작업 디렉토리: `/Users/taewookkim/dev/ai-company-tycoon`
현재 feature: `v0.63-alpha-roguelike-run-modifiers` (이번은 **블록 #1만**)

## 한 줄 요약

런마다 달라지는 로그라이크 변주의 **기반**. 런이 **시작 도시 × 세계관 × 시장 × 창업자**의 조합으로 세팅되도록, 모디파이어 데이터 + 런 시작 시 적용 + GameState 저장을 만든다. **이번 블록은 월간 tick을 바꾸지 않는다** (tick 효과는 블록 #2). 기본 설정은 no-op이라 기존 플레이는 그대로.

## §5 관련 (중요)

ROADMAP §5는 "새 대형 시스템 추가"를 일반적으로 보류하지만, **로그라이크 런 모디파이어는 2026-05-29 사용자 결정으로 명시적 예외**다 (§5에 그 메모가 있다). 이 시스템은 만들어도 된다 — v0.60 산업 슬라이스가 통제된 예외였던 것과 같다.

## 역할 분담

- 블록 #1 구현만. **`git commit` 금지.** Claude Code가 검증·커밋한다.
- **`AGENTS.md`/`feature_list.json`/`progress.md`/`CLAUDE.md`/`docs/ROADMAP.md` 편집 금지.**
- 증거는 `reports/qa/v0_63_block1_run.md`에만.

## 통합 지점 (이미 확인됨)

- **런 시작 경로** — `createInitialState`(신규 게임; `src/App.tsx`에서 호출) + `resetRunWithMetaUnlocks`(다음 런; `src/game/meta-progression.ts:119`). 런-설정을 이 두 경로에서 적용한다.
- **모디파이어 델타 형태** — `data/company_locations.json` (monthly_cost_modifier / human_hire_discount / ai_operation_bonus / cost 등). 단 기존 company_locations는 **한국 중심 사내 거점 사다리**다. 글로벌 시작 도시(서울/도쿄/뉴욕/샌프란시스코/텍사스 등)는 **새 레이어**로, 이 델타 형태를 참고만 한다.
- **저장 필드 패턴** — `GameState.discoveredPayoffIds`/`seenTutorials` (types.ts ~1272) + `hydrateGameState`의 sanitizer(simulation.ts). 신규 런-모디파이어 필드도 이 패턴으로, **구버전 세이브는 표준(no-modifier) 기본값으로 마이그레이션**.
- **검증** — `scripts/harness/validate-data.mjs`에 run_modifiers 규칙 추가.
- (campaign_shocks 연중 이벤트는 블록 #3, tick 효과는 블록 #2 — 이번엔 손대지 않는다.)

## 작업 내용

### 1. 데이터 — `data/run_modifiers.json`
4개 차원, 각 항목은 `id` + 사용자 노출 이름/설명 + **시작 델타**(starting resources/capabilities) + **태그**(블록 #2 tick 효과용 — 이번엔 정의만):
- `start_cities` — 글로벌 도시 5개 내외 (예: seoul/tokyo/new_york/san_francisco/texas). 인재·비용·시장 접근 델타.
- `world_lore` — 5개 내외. **반드시 `standard`(표준, 델타 0) 포함** + 알파고 정체(연구 느림) / 비트코인 GPU 초고가(compute 비쌈) / 오픈소스 천국 / 규제 강국. 시작 델타 + 태그(예: `compute_expensive`, `research_slow`).
- `market_conditions` — 3-4개 (호황/불황/특정 도메인 과열).
- `founder_traits` — 4-5개 (엔지니어/마케터/연구자/자본가 출신 등). 시작 capability/resource 델타.

### 2. 런-설정 적용 + 저장
- 런-config 타입 + 함수 — 조합(기본: 표준/기본도시/창업자없음 = 델타 0)을 선택/시드하고, **시작 델타를 초기 상태에 적용**한 뒤 GameState 신규 필드(예: `runModifiers: { startCityId, worldLoreId, marketId, founderId, tags: string[] }`)에 저장.
- `createInitialState` + `resetRunWithMetaUnlocks`에서 이 적용을 통합.
- `hydrateGameState`에 신규 필드 sanitizer 추가, **구버전 세이브 = 표준 기본 config**로 안전 마이그레이션 (round-trip 테스트 필수).
- **기본 config는 no-op** — 표준 세계/기본 도시/창업자 없음이면 델타 0이라 신규 게임이 현재와 동일하게 시작해야 한다 (회귀 0).

### 3. tick 불변 (이번 블록)
월간 tick(advanceMonth, 자원 계산, 비용)은 **건드리지 않는다**. 태그는 저장만 하고, 실제 tick 효과는 블록 #2에서 배선한다. 이번 블록의 효과는 "런 시작 시점 델타"에 한정.

### 4. QA 시나리오 + 테스트
- `?scenario=run-modifiers` — 비-기본 config(예: 비트코인 GPU 초고가 + 도쿄 + 연구자 창업자)로 진입해 적용을 확인.
- 테스트 — 런-config 적용(시작 델타), **저장 round-trip + 구버전 세이브→표준 마이그레이션**, 기본 config = 현재 초기 상태와 동일(회귀 가드), validate-data. 목표 448 → 451+.

## 제약

- §5 예외로 만드는 시스템이지만, **이번 블록은 tick/밸런스 불변** (시작 델타 + 저장만). 큰 시스템을 한 번에 넣지 말고 기반만.
- 기본 config = 현재 동작(회귀 0). 모디파이어는 시나리오/추후 선택 UI(블록 #4)로 들어온다.
- 저장 하위호환 유지 (구버전 세이브 = 표준).
- 결정론적(시드 고정 가능). `npm run harness:gate` 통과.

## 완료 기준

1. `data/run_modifiers.json` 4차원 + `standard` 포함, validate-data 통과.
2. 런-config가 createInitialState/resetRunWithMetaUnlocks에서 시작 델타 적용 + GameState에 저장.
3. 저장 round-trip + 구버전 세이브→표준 마이그레이션 테스트 통과.
4. 기본 config 신규 게임 = 현재 초기 상태와 동일(회귀 가드 테스트).
5. `?scenario=run-modifiers` 확인 가능, tick 불변.
6. `npm run harness:gate` 통과 (44 files / 451+ tests; 신규 테스트 파일 시 파일 수 +).
7. `reports/qa/v0_63_block1_run.md` — 변경 파일, 신규 필드/적용 방식, 저장 영향(round-trip), tick 불변 + 회귀 0 확인, 게이트 출력.

## 세션 종료 시

`git commit` 금지. 마지막 메시지에 변경 파일 + 저장/tick/회귀 영향 + 게이트 결과. 계약 파일 편집 금지.
