# Codex 이어가기 프롬프트 — AI Company Tycoon: Boundaryless

작성일: 2026-05-30 · 기준 커밋 `08f76fd` (main, clean) · baseline 48 files / 500 tests
아래 블록 전체를 Codex CLI 세션에 붙여넣으면 현재 상태에서 이어서 개발할 수 있다.

---

You are Codex CLI, the implementation track for **AI Company Tycoon: Boundaryless**, a Vite + React 19 + TypeScript browser game at `/Users/taewookkim/dev/ai-company-tycoon`.

## 먼저 읽기 (상태 로드)
1. `AGENTS.md` — 운영 계약(authoritative).
2. `feature_list.json` — 상태 추적기. 현재 `current_feature_id`는 `v0.67-alpha-multi-ending`(status `planned`). v0.63~v0.66 항목에 블록별 evidence가 있다.
3. `progress.md` — 재시작 로그(최신 검증 증거).
4. `reports/v0_63_plus_content_roadmap.md` — 로그라이크 마스터 플랜.
그리고 `git status --short`로 트렁크가 깨끗한지(`08f76fd`) 확인.

## 현재 상태 (2026-05-30)
main 깨끗, baseline **48 files / 500 tests** (`npm run harness:gate`). 로그라이크 트랙이 v0.63~v0.66에 걸쳐 막 완성됨.
- **v0.63** 런 모디파이어 시스템 — 시작도시 × 세계관 × 시장 × 창업자를 런 시작 시 시드 선택 + 연중 세계 이벤트 + 세계 뽑기 roll/reveal UI.
- **v0.64** 콘텐츠 깊이 — 4축 확장(조합 600→9,504) + 연중 이벤트 12→26(세계관별 테마).
- **v0.65** 난이도 — 플레이어 선택 도전 티어(story/standard/hard/brutal): additive 월간 역풍 + 메타 보상 배수.
- **v0.66** 태그 파생 엔진 — 런 태그 조합이 명명된 아키타입을 파생(프런티어 차고/데이터 연금술사/...) + 크로스런 도감(`roguelite.discoveredArchetypeIds`) + 아키타입 월간 보너스.

## 핵심 아키텍처 (안전하게 확장하는 법)
- **월간 경제는 additive 집계**다. `getMonthlyStrategicEffects`(simulation.ts ~3894)가 순수 `getXMonthlyEffects(state):ResourceMap`들을 push한다. 새 월간 효과 시스템은 **순수 함수 + 2줄 훅**으로 추가한다(growthPath/annualDirective/industrySynergy·combo(v0.60)/runModifier(v0.63#2)/difficulty(v0.65#1)/archetype(v0.66#3)가 전부 이 패턴). 이게 새 효과의 정석이다.
- **런 설정은 데이터 주도**다. `data/run_modifiers.json`(4축 + tag_effects), `data/world_events.json`, `data/difficulty_tiers.json`, `data/derivation_rules.json`. `selectOption`(run-modifiers.ts)이 JSON 새 항목을 시드 선택 풀에 자동 편입한다 → **콘텐츠는 코드 0으로 확장**된다.
- **결정론이 절대 원칙**이다. 전부 `runModifiers.seed`에서 파생. tick·하네스에 `Math.random()` 금지(10년 run-simulator 완주 게이트가 결정론에 의존).
- **세이브** — GameState serialize/hydrate(simulation.ts, SAVE_VERSION 11) + 필드별 sanitizer. 새 영구 필드는 seenTutorials/discoveredPayoffIds 패턴(createInitialState 기본값 + hydrate `sanitizeStringArray` + 구버전 마이그레이션 + state-integrity 검증). **크로스런 메타는 `roguelite`**(RogueliteState, `resetRunWithMetaUnlocks`가 다음 런으로 보존).
- **10년 완주 게이트**(run-simulator.ts `runTenYearCampaignSimulation`, optional `runModifierSelection` 인자)는 항상 통과해야 하고, **표준/무인자 경로는 표준 유지**(회귀 금지).

## 운영 계약
- **§5-안전** — derive-only 또는 additive 우선. tick/밸런스 재작성 금지. default/standard 경로는 no-op(회귀 가드).
- **게이트** — `npm run harness:gate`(`npm test -- --maxWorkers=1 && npm run validate:data && npm run build`)를 돌려 통과 확인 후에만 완료 주장.
- **블록 단위** — 한 번에 한 블록만 구현하고, 게이트 통과시키고, 증거를 `reports/qa/<version>_block<N>_run.md`에 쓴다. **`git commit` 및 계약 파일(`AGENTS.md`/`feature_list.json`/`progress.md`/`CLAUDE.md`/`docs/ROADMAP.md`) 편집은 검증 트랙(Claude/사람)이 담당** — Codex는 손대지 않는다. (단, Codex 단독 운영이면 게이트 통과 후 기존 커밋 스타일로 커밋 가능. 커밋 메시지 끝에 `Co-Authored-By` 라인.)
- 백그라운드 실행 시 stdin 멈춤 방지를 위해 명령 끝에 `< /dev/null`.

## 다음 작업 — v0.67 멀티 엔딩 (결정 B) 블록 #1
(대안 — 베타 준비(결정 C, 실사용자 플레이테스트 + 고해상도 아트). 착수 전 사용자에게 방향 확인.)

**v0.67 #1 = 런이 정의하는 엔딩, DERIVE-ONLY.**
- `data/endings.json` — 각 엔딩 `{ id, title, description/flavor, 조건 }`. 조건은 **최종 캠페인 상태에 대한 결정론적 술어**(예 최종 자원 임계 + 세계관/창업자/성장경로/보유 아키타입 멤버십).
- 순수 선택기 `getCampaignEnding(finalState): EndingDefinition`(결정론, first/best 매치) + `EndingDefinition` 타입.
- finale 시점에 노출(기존 finale/리빌 UI 재사용).
- **DERIVE-ONLY** — 새 GameState 필드 금지, tick 변경 금지, 10년 완주 게이트는 그대로(엔딩은 기존 success/integrity/finale 판정 **위에** 분기). simulation.ts/세이브 diff 비어야 함.
- 테스트 — 각 엔딩 조건이 올바르게 선택 + 결정론 + 표준 런이 합리적 기본 엔딩으로 매핑.
- 이후 #2 — 엔딩별 플레이버/컬렉션 + 엔딩별 메타 넛지.

먼저 `AGENTS.md` + `feature_list.json`(v0.67 항목에 DoD 스케치) 읽고, 방향(멀티 엔딩 vs 베타) 확인 후 v0.67 #1 구현. 끝나면 변경 파일·derive-only(빈 simulation.ts/세이브 diff)·게이트 출력을 요약.

---

## 부록 — 이번 세션 커밋 (참고)
`08f76fd` v0.66 #4 + closeout · `76252c2` v0.66 #3 · `0f01acb` v0.66 #2 · `dc7b579` v0.66 #1 · `3e3d7bf` v0.65 #2 + closeout · `9b2c2ff` v0.65 #1 · `aec4d1d` v0.64 #2 + closeout · `48a4231` v0.64 #1 · `e79c5ba` v0.63 #4 + closeout · `91a3710` v0.63 #3.
