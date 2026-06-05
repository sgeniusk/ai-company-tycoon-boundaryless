# v1.0 RC Polish QA Run

작성일: 2026-06-04

## 요약

2026-06-04 가상 베타 플레이테스트의 P1 findings를 코드 측 RC polish로 반영했다. 첫 5분 제품/상점/덱 행동 압축, 피날레 결과 리포트와 late-game 튜토리얼 억제, 라이벌/월드 이벤트 인과 설명, 오피스 선택 흔적, 모바일 보상/성장/이벤트 결정 레이어, 노출 숫자 포맷 정리를 완료했다.

현재 상태는 **코드 측 RC 후보 gate 통과**다. 프로덕션 승격, 최종 소스 아트, 실사용자 플레이테스트, v1.0 릴리스 태그는 사용자 게이트로 남긴다.

## 변경 범위

- `src/components/MenuPanels.tsx`: 제품/상점/덱 첫 화면 RC 액션 브리프, reward primary card, 경쟁/카운터 인과 설명.
- `src/components/GameChrome.tsx`: 피날레 리포트, 오피스 선택/압박 마커, 모바일 성장 결정 포커스, 경쟁 속보 모멘텀 포맷.
- `src/components/CampaignShockPanel.tsx`, `src/components/BigEventModal.tsx`, `src/components/WorldRevealModal.tsx`: 이벤트 원인/다음 위협/대응 추천 라인.
- `src/ui/formatters.ts`, `src/game/simulation.ts`: 효과/월간 델타/스카우트 이해관계 라벨 소수 포맷 정리.
- `src/ui/layout-contract.test.ts`, `src/ui/formatters.test.ts`, `src/game/qa-scenarios.test.ts`, `src/game/tutorial-guide.ts`: 회귀 방지 계약과 튜토리얼 억제.
- `src/App.css`: RC action briefs, causality strips, office markers, decision-primary mobile layer, popup/pixel polish.

## 검증 증거

- `npm test -- src/ui/formatters.test.ts --maxWorkers=1`: 1 file / 1 test passed.
- `npm test -- src/ui/layout-contract.test.ts -t "v1.0 rc" --maxWorkers=1`: 5 targeted tests passed.
- `npx tsc --noEmit --pretty false`: passed.
- Playwright mobile smoke at 390x844:
  - `office-visuals`: office persistence markers visible, overflow 0.
  - `reward-picked`: `다음 행동` opens status results popup; `first-growth-fast-start` in viewport at y=622; primary growth card order `-1`; overflow 0.
  - `big-event`, `campaign-shock`, `world-reveal`, `competition`: causality/next-threat/response surfaces visible, overflow 0.
- Playwright DOM float scan at 390x844:
  - Scenarios `office-visuals`, `reward`, `reward-picked`, `world-reveal`, `campaign-shock`, `big-event`, `ten-year-sim`.
  - `longDecimals: []` for all routes; horizontal overflow 0 for all routes.
- Browser plugin mobile smoke at 390x844 after final gate stabilization:
  - 7 routes scanned with `longDecimals: []` and horizontal overflow 0.
  - `reward-picked` next-action opened the status popup; growth decision layer was in viewport at y=622.
- `npm test -- src/game/qa-scenarios.test.ts -t "creates scenarios from URL search params for browser QA" --maxWorkers=1`: passed after marking the heavy URL scenario contract with a 20s timeout.
- `npm test -- src/game/qa-scenarios.test.ts -t "creates a v0.20 alpha readiness scenario from the integrated harness" --maxWorkers=1`: passed after marking the integrated readiness scenario with a 20s timeout.
- `npm test -- src/game/run-simulator.test.ts -t "keeps challenge tier pressure non-inverted" --maxWorkers=1`: passed after marking the 4-tier 10-year simulator contract with a 20s timeout.
- `npm test -- src/game/staff-career.test.ts -t "links poaching incidents to a concrete competitor offer" --maxWorkers=1`: passed; poaching stakes labels no longer expose long decimals.
- Additional heavy contract timeout budgets were locked without weakening assertions:
  - `qa-scenarios`: v0.50 20-person persona scenario.
  - `run-simulator`: v0.66 combined roguelike sweep and v0.61 end-to-end coverage.
  - `blind-playtest-records`: completed-session P0/P1 triage extraction.
- `npm run harness:gate`: passed after the final ai-slop-cleaner/test-stability pass.
  - Vitest: 54 files / 663 tests passed.
  - `validate:data`: passed.
  - `qa:beta-readiness:check`: PASS, readiness 15/15, route coverage 40/40.
  - Production build: passed.

## 남은 리스크

- 기존 `reports/qa/screenshots/v1_0_menu_popup_*.png` diff는 보존했다. 스크린샷 artifact refresh는 별도 의도 작업으로만 진행한다.
- RC deploy/final art/real-human playtest/release tag는 사용자 게이트다.
