# v0.66 #2 아키타입 발견 + 크로스런 도감 QA

작성일: 2026-05-30

## 변경 요약

- `RogueliteState.discoveredArchetypeIds: string[]`를 추가했다. 이 필드는 런 내부 상태가 아니라 `roguelite` 크로스런 메타에만 저장된다.
- `resetRunWithMetaUnlocks`에서 다음 런의 `runModifiers.tags`로 `getDerivedArchetypes(nextState)`를 계산하고, 이전 컬렉션에 없는 id만 `getNewlyDiscoveredArchetypes`로 뽑아 누적한다.
- 누적식은 중복 제거된 `[...prev.discoveredArchetypeIds, ...newlyDiscoveredThisRun]`이다. 기존 `founderInsight`, `unlockedMetaIds`, `starterDeckId`, `runHistory` 보존 경로는 유지했다.
- `WorldRevealModal`에 신규 발견 섹션을 통합해 모달 난사를 피했고, 제품 패널에 아키타입 도감-lite를 추가했다.
- `?scenario=archetype-collection`은 이전에 `frontier_garage`만 발견한 상태에서 새 런 조합이 `frontier_demo_loop`, `oss_evangelist`를 추가로 발견하는 QA 상태다.

## 변경 파일

- `src/game/types.ts`
- `src/game/deckbuilding.ts`
- `src/game/meta-progression.ts`
- `src/game/tag-derivation.ts`
- `src/game/simulation.ts`
- `src/game/state-integrity.ts`
- `src/game/qa-scenarios.ts`
- `src/components/WorldRevealModal.tsx`
- `src/components/MenuPanels.tsx`
- `src/App.css`
- `src/game/tag-derivation.test.ts`
- `src/game/run-modifiers.test.ts`
- `src/game/save-integrity.test.ts`
- `src/game/qa-scenarios.test.ts`
- `src/ui/layout-contract.test.ts`

## 세이브/마이그레이션

- `createInitialRogueliteState()` 기본값은 `discoveredArchetypeIds: []`.
- `hydrateRogueliteState()`는 `sanitizeStringArray(value.discoveredArchetypeIds, derivationRules.map(rule => rule.id))`로 하이드레이트한다.
- 구버전 roguelite 세이브에서 필드가 없으면 `[]`로 마이그레이션된다.
- `validateGameStateIntegrity()`는 배열 여부, 빈 문자열, 알 수 없는 아키타입 id, 중복 id를 검증한다.
- SAVE_VERSION은 올리지 않았다. 기존 패턴처럼 초기 상태 병합 + sanitizer로 처리 가능한 추가 필드다.

## Tick/표준 경로 불변

- `advanceMonth`는 수정하지 않았다.
- 확인: `git diff -U0 -- src/game/simulation.ts | rg "advanceMonth"` 결과 없음.
- `simulation.ts` diff는 `derivationRules` import와 `hydrateRogueliteState`의 새 배열 sanitizer/return 필드뿐이다.
- 무인자 `resetRunWithMetaUnlocks(...)` 표준 경로는 standard runModifiers를 유지하고 `discoveredArchetypeIds`는 `[]`로 남는 회귀 테스트를 추가했다.

## 검증

- RED 확인: 신규 테스트 추가 직후 targeted run이 의도한 미구현 실패를 냈다.
- Targeted:
  - `npm test -- src/game/tag-derivation.test.ts src/game/run-modifiers.test.ts src/game/save-integrity.test.ts src/game/qa-scenarios.test.ts src/ui/layout-contract.test.ts`
  - 결과: 5 files passed / 160 tests passed.
- Full gate:
  - `npm run harness:gate`
  - 결과: 48 files passed / 493 tests passed, `Data validation passed`, `tsc && vite build` 성공, Vite build 120 modules / 910ms.
- Local route smoke:
  - `npm run dev -- --host 127.0.0.1 --port 5201`
  - `curl -I http://127.0.0.1:5201/?scenario=archetype-collection`
  - 결과: `HTTP/1.1 200 OK`.
  - 이 세션에서는 Browser 도구가 노출되지 않았고 `playwright`/`puppeteer`가 설치되어 있지 않았으며 직접 Chrome headless DOM dump도 exit -1로 종료되어 스크린샷 판독은 주장하지 않는다. UI는 layout-contract 테스트와 route availability로 검증했다.

## 결론

v0.66 #2는 런 전환 시점의 결정론적 derive+commit으로 닫혔다. 발견 상태는 roguelite 크로스런 메타에만 존재하고, 월간 tick/경제 효과/standard 10년 경로는 건드리지 않았다.
