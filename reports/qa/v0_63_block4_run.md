# v0.63 Block #4 QA — 세계 뽑기 리빌 UI

작성일: 2026-05-29

## 변경 요약

- `src/game/run-modifiers.ts`: `rollRunModifierSelection(seed)` 순수 헬퍼 추가. 같은 seed는 같은 4축 선택을 반환하고, 기본 무인자 경로는 계속 표준 세계를 사용한다.
- `src/components/GameChrome.tsx`: 런 완료 후 다음 런 버튼 경로에서 UI 레이어의 ephemeral seed를 만들고 `resetRunWithMetaUnlocks(..., selection)`으로 전달.
- `src/components/MenuPanels.tsx`: 다음 런 설계실 quick start, 시작 덱 선택, 메타 해금 새 런 버튼에서 동일하게 seed roll selection 전달.
- `src/components/WorldRevealModal.tsx`: `state.runModifiers` 기반 도시 x 세계관 x 시장 x 창업자 리빌 모달 추가. seed 표시, 순차 공개, 비표준 축 강조, seed별 1회 표시를 React local state로 처리.
- `src/game/qa-scenarios.ts`: `?scenario=world-reveal` 추가. 안정 scenario id 목록 테스트를 깨지 않도록 parser/type에만 등록.
- `src/game/run-modifiers.test.ts`: roll 결정론, no-arg 표준 회귀, `world-reveal` QA 상태 검증 추가.
- `src/App.css`: world reveal modal 스타일, 모바일 1열/2열 대응, reduced-motion 대응 추가.

## 불변 조건 확인

- 첫 온보딩/저장 없음 경로: `App.tsx`의 `createInitialState()` 호출은 무인자 그대로 유지되어 표준 세계.
- 무인자 reset 경로: `resetRunWithMetaUnlocks(current)` 기본값은 변경하지 않았고, 테스트로 표준 세계 유지 확인.
- run-simulator/10년 경로: no-arg `createInitialState()`/`resetRunWithMetaUnlocks()` 기본값을 유지하므로 표준 세계 경로 유지.
- tick/save schema: `src/game/simulation.ts`, `src/game/types.ts`, save/hydrate 로직 미변경. RNG는 UI seed 생성 callsite에만 있음.
- 금지 파일: `data/run_modifiers.json`, `scripts/harness/validate-data.mjs`, `src/game/simulation.ts`, `src/game/types.ts`, `src/game/world-events.ts`, `data/world_events.json` 미수정.

## 검증

```text
npm test -- src/game/run-modifiers.test.ts
Test Files  1 passed (1)
Tests       11 passed (11)
```

```text
npm test -- src/game/run-modifiers.test.ts src/game/qa-scenarios.test.ts
Test Files  2 passed (2)
Tests       66 passed (66)
```

```text
npm run build
tsc && vite build passed
117 modules transformed
production build completed
```

```text
npm run harness:gate
Test Files  46 passed (46)
Tests       466 passed (466)
Data validation passed.
tsc && vite build passed.
117 modules transformed.
Build completed in 780ms.
```

## 브라우저 확인

- Dev server: `npm run dev -- --port 5201` started at `http://localhost:5201/`.
- In-app Browser smoke was attempted for `http://127.0.0.1:5201/?scenario=world-reveal`, but this Codex App session had no available `iab` browser backend.
- Local fallback packages `playwright`, `@playwright/test`, `puppeteer`, and `jsdom` were not installed, so visual smoke is documented as unavailable in this session.
