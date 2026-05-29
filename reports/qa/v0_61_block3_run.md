# v0.61 블록 #3 실행 보고서 — 튜토리얼 정리 + UI 계약 감사

작성일: 2026-05-29
작업 범위: `v0.61-alpha-public-web-alpha` 블록 #3만

## 요약

- 튜토리얼 8단계 흐름을 감사하고, 코어 루프 순서를 `채용 -> 개발 -> 출시 보상 -> 아이디어 조합 -> 다음 런/사무실 -> 경쟁`으로 고정하는 불변식 테스트를 추가했다.
- `product_ideas` 안내가 첫 출시 보상보다 먼저 뜰 수 있던 구조를 보수적으로 정리했다. 이제 첫 개발/출시/보상 흐름을 막지 않고, 첫 출시 이후 제품 메뉴에서 다음 제품 조합 안내로 나타난다.
- `?scenario=physical-industries` 제품 패널과 v0.60 산업 시너지/고위험 조합 표시가 모바일 390px 계약을 지키도록 구조 테스트와 최소 CSS 보강을 추가했다.

## 튜토리얼 감사 결과

- 총 8단계 유지. 새 튜토리얼 시스템이나 추가 단계 없음.
- 모든 `targetMenu`는 실제 메뉴 id(`company/products/deck/agents/research/shop/competition/log`) 중 하나임을 테스트로 고정했다.
- 모든 id가 유니크하고 비어 있는 제목/메시지/액션 라벨이 없음을 테스트로 고정했다.
- 모든 단계가 결정론적 상태 fixture에서 도달 가능함을 테스트했다.
- 발견 사항: `product_ideas` 규칙은 첫 제품 출시 이후에만 보이는 조건인데 배열상 `development_project`/`card_reward`보다 앞에 있어, 미확인 상태에서는 출시 보상 안내보다 먼저 선택될 수 있었다. 규칙 순서를 보상 이후로 옮기고 메시지를 "첫 출시 이후" 맥락으로 명확히 했다.

## 모바일 구조 계약

- `src/ui/layout-contract.test.ts`에 `physical-industries` QA 시나리오가 제품 메뉴로 진입하는지 확인하는 계약을 추가했다.
- 모바일 390px 셸 계약(`width: min(100vw, 390px)`, 내부 `menu-panel` 스크롤)을 v0.60 제품 패널에도 연결했다.
- 520px 이하에서 `domain-filter`, `boundaryless-goal-grid`, `industry-synergy-grid`, `industry-combo-grid`가 단일 컬럼으로 접히는지 테스트한다.
- 산업 시너지/조합 패널, 그리드, 카드가 `min-width: 0` 및 긴 텍스트 줄바꿈으로 가로 오버플로를 만들지 않도록 계약을 추가했다.

## 변경 파일

- `src/game/tutorial-guide.ts`
- `src/game/tutorial-guide.test.ts`
- `src/ui/layout-contract.test.ts`
- `src/App.css`
- `reports/qa/v0_61_block3_run.md`

## 범위 확인

- `src/game/simulation.ts` tick 로직 변경 없음.
- save/load 경로 변경 없음.
- `AGENTS.md`, `feature_list.json`, `progress.md`, `CLAUDE.md`, `docs/ROADMAP.md` 변경 없음.
- Playwright/브라우저 렌더 QA는 환경 제약으로 수행하지 않음. 수동 후속: `npm run qa:office-visuals:screenshots`.
- git commit 수행하지 않음.

## 검증 Evidence

### Red 단계

- `npm test -- src/game/tutorial-guide.test.ts src/ui/layout-contract.test.ts`
- 기대 실패 확인: `tutorialGuideAuditRules` 미존재, v0.60 모바일 단일 컬럼/오버플로 계약 미충족.

### Targeted

- `npm test -- src/game/tutorial-guide.test.ts src/ui/layout-contract.test.ts`
- 결과: 2 files / 73 tests passed.

### Final Gate

- `npm run harness:gate`
- 결과:
  - Test Files: 43 passed (43)
  - Tests: 437 passed (437)
  - `validate:data`: Data validation passed.
  - `build`: Vite production build passed, 110 modules transformed, built in 1.36s.

참고: 첫 `harness:gate` 시도는 테스트 요약 전 code 143으로 비정상 종료되어 증거로 사용하지 않았다. 위 Final Gate는 동일 명령을 재실행해 정상 종료(code 0)한 결과다.
