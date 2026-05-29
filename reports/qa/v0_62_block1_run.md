# v0.62 블록 #1 QA 실행 보고

작성일: 2026-05-29
대상: `v0.62-alpha-payoff-juice` 블록 #1 — 고위험 산업 조합 / 산업 시너지 신규 활성화 셀러브레이션

## 변경 요약

- `src/game/payoff-activation.ts`: `getIndustryComboSummary` / `getIndustrySynergySummary`의 active 집합에서 셀러브레이션 후보를 derive하고, 이전 active id 집합 대비 신규 활성화 id만 추출.
- `src/components/PayoffCelebrationModal.tsx`: `BigEventModal` 계열의 중앙 모달. 조합/시너지 제목, 리스크 또는 설명, 월간 효과 요약, 순차 dismiss 큐를 표시.
- `src/App.css`: payoff 모달 플레어/글로우/펄스 스타일, 모바일 390px 대응, `prefers-reduced-motion: reduce` 폴백.
- `src/game/qa-scenarios.ts`: `?scenario=payoff-juice` 등록. 제품 패널에서 `풀스택 물리 제국` 조합 셀러브레이션이 즉시 보이는 상태.
- 테스트: `src/game/payoff-activation.test.ts`, `src/game/qa-scenarios.test.ts`, `src/ui/layout-contract.test.ts`.

## 발동 감지 방식

- 저장 상태를 늘리지 않는 derive 방식.
- 컴포넌트 로컬 ref가 직전 렌더의 active combo/synergy id 집합을 보관하고, 현재 active 집합과 비교해 새로 들어온 id만 로컬 큐에 추가한다.
- QA route는 저장 필드 없이 `scenario=payoff-juice`일 때 첫 active payoff 후보를 화면 확인용으로 seed한다.

## §5 / 저장 / 시뮬레이션 영향

- `src/game/simulation.ts`: 변경 없음.
- `src/game/types.ts`: 변경 없음.
- `GameState` UI 신호 필드 추가 없음. 따라서 `hydrateGameState` sanitizer 추가도 불필요하며 save round-trip shape는 유지된다.
- tick/balance 로직 변경 없음. 기존 v0.60 combo/synergy active 순간을 UI에서 증폭만 한다.

## 검증

### Targeted

```text
npm test -- src/game/payoff-activation.test.ts src/game/qa-scenarios.test.ts src/ui/layout-contract.test.ts --maxWorkers=1

Test Files  3 passed (3)
Tests  120 passed (120)
```

### Full Gate

```text
npm run harness:gate

Test Files  44 passed (44)
Tests  439 passed (439)
Data validation passed.
vite v6.4.2 building for production...
112 modules transformed.
built in 768ms
```

Note: Vitest emitted the pre-existing harness line `Rejected 1 returned session file(s).` but exited 0 and the full gate completed successfully.

### Local Route

```text
npm run dev -- --port 5201
curl -I 'http://127.0.0.1:5201/?scenario=payoff-juice'

HTTP/1.1 200 OK
Content-Type: text/html
```

Browser/plugin visual smoke was not available from this Codex App surface; Playwright was also not installed for a Node smoke. The route, behavior contract, mobile CSS contract, TypeScript build, and full harness gate are covered above.
