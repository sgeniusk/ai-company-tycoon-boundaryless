# Codex CLI 인계 — v0.66 #2 아키타입 발견 연출 + 크로스런 도감

작성일: 2026-05-30
작성자: Claude Code (기획/하네스/계약 트랙)
대상: Codex CLI (gpt-5.5, reasoning effort **xhigh** — roguelite 메타에 크로스런 세이브 필드 추가 + 마이그레이션 + 보존, 플레이어 데이터 치명적)
작업 디렉토리: `/Users/taewookkim/dev/ai-company-tycoon`
선행: v0.66 #1(파생 엔진 — getDerivedArchetypes) 커밋 완료. 이번은 #2.

## 한 줄 요약

#1 엔진이 런 태그에서 아키타입을 파생한다. #2는 그걸 **발견 도파민**으로 만든다 — 런이 파생한 아키타입 중 **이전에 한 번도 본 적 없는 것**을 "신규 아키타입 발견!"으로 띄우고, **런을 거듭하며 누적되는 도감**(roguelite 메타)에 모은다. "계속 반복" 동기. v0.62 발견 패턴(getNewPayoffDiscoveryIds + PayoffCelebrationModal + 컬렉션-lite)을 미러링하되, 저장소는 **per-run이 아니라 roguelite 크로스런 메타**.

## 왜 크로스런(roguelite)인가

- 아키타입은 `state.runModifiers.tags`(런 시작 시 고정)에서 파생 → 런 중에 늘지 않는다. 그래서 "런 중 점진 발견"이 아니라 **런 간 컬렉션**이 맞다("이 조합 처음 봤다!" → 새 조합 시도 → 리플레이성).
- v0.62 `discoveredPayoffIds`는 per-run(GameState 최상위, 런마다 `[]` 리셋)이라 컬렉션엔 부적합. 대신 `roguelite`(runNumber/founderInsight/unlockedMetaIds/runHistory처럼 `resetRunWithMetaUnlocks`로 다음 런에 보존)가 올바른 위치.

## 정확한 미러링 대상 (실제 코드)

- `src/game/payoff-activation.ts` `getNewPayoffDiscoveryIds(discovered, activeMoments)` (line 53) + 그걸 state에 커밋하는 함수(line 59-64) — 발견 derive/commit의 형태. **이걸 아키타입용으로 미러**.
- `RogueliteState`(types.ts:1323~) — runNumber, founderInsight, unlockedMetaIds, ..., runHistory. 여기에 `discoveredArchetypeIds: string[]` 추가.
- `meta-progression.ts` `resetRunWithMetaUnlocks` (line ~150-165) — `createInitialRogueliteState({ runNumber: prev+1, founderInsight, unlockedMetaIds, starterDeckId, runHistory })`로 다음 런 roguelite 구성. **여기에 discoveredArchetypeIds를 누적 전달**: `[...prev.discoveredArchetypeIds ?? [], ...thisRunNewlyDiscovered]`.
- `createInitialRogueliteState`(meta-progression.ts) — 새 필드 기본값 `[]` + 인자로 받기.
- roguelite 세이브 하이드레이트/새니타이즈 경로(simulation.ts hydrate에서 roguelite를 sanitize하는 곳, 또는 state-integrity) — 새 필드 `sanitizeStringArray`로, 구버전 세이브 → `[]`.
- v0.62 컬렉션-lite UI(`?scenario=collection` 관련, MenuPanels의 도감 표시) — 아키타입 도감 표시에 재사용/참고.

## 작업 내용

### 1. roguelite 크로스런 필드
`RogueliteState.discoveredArchetypeIds: string[]` 추가. createInitialRogueliteState 기본 `[]` + 인자 수용. **세이브 마이그레이션** — 하이드레이트에서 `sanitizeStringArray(rawRoguelite.discoveredArchetypeIds)`, 구버전 → `[]`. state-integrity 배열 검증.

### 2. 발견 derive/commit (tag-derivation.ts 또는 신규 모듈)
- `getNewlyDiscoveredArchetypes(collection: Iterable<string>, runArchetypes: DerivationRuleDefinition[]): string[]` — runArchetypes 중 collection에 없는 id. (payoff-activation 미러, 순수.)
- 커밋 지점 — `resetRunWithMetaUnlocks`가 다음 런을 만들 때, 새 런의 runModifiers로 `getDerivedArchetypes`를 구해 `getNewlyDiscoveredArchetypes(prev.discoveredArchetypeIds, ...)`로 신규를 구하고, 다음 roguelite.discoveredArchetypeIds에 누적. (결정론 — RNG 없음.) **첫 온보딩/무인자 경로는 표준 세계라 파생 0이거나 표준뿐 — 회귀 안전.**
- 신규가 있으면 연출용으로 노출(아래 UI). per-run "이번에 신규로 발견한 id"는 ephemeral하게 계산 가능(다음 런 derived ∩ ¬prevCollection).

### 3. 발견 연출 + 도감 UI
- 신규 아키타입 발견 시 "신규 아키타입 발견!" 모먼트 — v0.62 `PayoffCelebrationModal` 재사용 또는 v0.63 `WorldRevealModal`에 통합(모달 난사 피하려면 리빌에 "신규 발견" 섹션 추가 권장). 아키타입 title/description/yields.summary 표시, 신규는 강조.
- 도감-lite — 발견한 아키타입 목록(전체 대비 N/총)을 메뉴 어딘가에 표시(v0.62 컬렉션 UI 재사용). 미발견은 잠긴 표시.

### 4. QA + 테스트
- `?scenario=archetype-collection`(또는 tag-derivation 확장) — 일부 아키타입이 이미 발견된 roguelite 상태로 진입, 신규 강조 + 도감 표시 확인.
- 테스트 — 신규 발견 derive 정확/결정론, resetRunWithMetaUnlocks가 discoveredArchetypeIds를 **누적**(이전 + 신규, 중복 없음)하고 다른 roguelite 보존 필드를 안 깨뜨림, 세이브 round-trip + 구버전 roguelite → `[]` 마이그레이션, 표준(무인자 reset) 경로 회귀 없음.

## 절대 제약
- 신규 필드는 **roguelite 메타에만**(크로스런). tick(advanceMonth)·월간 경제 **불변** — 발견은 런 전환/리빌 시점의 derive+commit이지 tick이 아니다.
- 결정론(시드/태그 파생, RNG 금지). 표준 10년 완주 불변. 기존 roguelite 보존(founderInsight/unlockedMetaIds/runHistory) 안 깨기.
- 세이브 round-trip + 구버전 마이그레이션 필수(roguelite 새 필드). SAVE_VERSION은 기존 마이그레이션 패턴 따름(필요 없으면 올리지 말 것).
- `git commit` 금지. 계약 파일(`AGENTS.md`/`feature_list.json`/`progress.md`/`CLAUDE.md`/`docs/ROADMAP.md`) 편집 금지.

## 완료 기준
1. `RogueliteState.discoveredArchetypeIds`(세이브 마이그레이션) + createInitialRogueliteState 기본/수용 + resetRunWithMetaUnlocks 누적 전달.
2. `getNewlyDiscoveredArchetypes` 순수 derive + 커밋 지점.
3. 발견 연출(리빌/모달) + 도감-lite UI.
4. 테스트 — 누적/결정론/세이브 round-trip + 구버전 마이그레이션/표준 경로 회귀 없음.
5. `npm run harness:gate` 통과. tick(advanceMonth) diff 없음(발견은 메타/리빌 레이어).
6. `reports/qa/v0_66_block2_run.md` — 변경 파일, roguelite 필드/누적 로직, 세이브 마이그레이션, tick 불변 확인, 게이트.

## 후속(이 블록 아님)
- #3 창발 효과 — yields를 실제 보너스/이벤트/제품으로 연결(additive 훅, §5).
- #4 밸런스.

## 세션 종료 시
`git commit` 금지. 마지막 메시지에 변경 파일 + roguelite 필드/누적·마이그레이션 + tick 불변(빈 advanceMonth diff) + 표준 경로 회귀 없음 + 게이트. 계약 파일 편집 금지.
