# Codex CLI 인계 — v0.61 블록 #3 (튜토리얼 정리 + UI 깨짐 감사)

작성일: 2026-05-29
작성자: Claude Code (하네스/계약/플래닝 트랙)
대상: Codex CLI (gpt-5.5, reasoning effort medium = fast 모드)
작업 디렉토리: `/Users/taewookkim/dev/ai-company-tycoon`
현재 feature: `v0.61-alpha-public-web-alpha` (블록 #1·#2 완료, 이번은 **블록 #3만**)

## 한 줄 요약

공개 알파 전 두 가지를 다진다 — (1) 8단계 튜토리얼 가이드 흐름의 일관성 정리, (2) v0.60에서 추가된 신규 UI(물리 산업 패널, 산업 시너지/조합 표시)가 모바일 390×844에서 깨지지 않도록 layout-contract 커버리지 확장. **결정론적·테스트로 검증 가능한 부분에 한정**한다.

## 역할 분담

- 블록 #3 구현만. **`git commit` 금지.** Claude Code가 검증·커밋한다.
- **`AGENTS.md`/`feature_list.json`/`progress.md`/`CLAUDE.md`/`docs/ROADMAP.md` 편집 금지.**
- 증거는 `reports/qa/v0_61_block3_run.md`에만.

## 범위 밖 (중요)

- 실제 렌더 픽셀 스크린샷 QA(390×844 육안 확인)는 이 환경에 Playwright가 없어 **이 블록 범위 밖**이다. 그건 Claude/사람의 수동 후속(`npm run qa:office-visuals:screenshots`)으로 남긴다. 이 블록은 **구조적/계약 테스트**만 다룬다.
- 새 튜토리얼 "시스템"을 만들지 않는다 (§5). 기존 8단계 규칙의 정리/명료화만.

## 작업 내용

### 1. 튜토리얼 가이드 일관성 정리 (src/game/tutorial-guide.ts + tutorial-guide.test.ts)
현재 8개 규칙(welcome_garage / agent_hired / product_ideas / development_project / card_reward / next_run_setup / office_growth / competition_pressure). 각 규칙은 `{id, helperName, title, message, targetMenu, actionLabel, visible(state, activeMenu)}`.
- 감사 — 모든 `targetMenu`가 유효 메뉴 id(company/products/deck/agents/research/shop/competition/log)인지, id가 유니크한지, `visible` 술어가 도달 불가능한(영원히 안 보이는) 단계를 만들지 않는지, 순서가 코어 루프(채용→개발→출시→보상→다음런/사무실→경쟁)와 맞는지.
- `tutorial-guide.test.ts`에 위 불변식을 단언하는 테스트 추가/강화.
- 메시지 명료화는 OK(오타·모호한 표현 다듬기). 단계 추가는 명백한 공백이 있을 때만 보수적으로(예: 신규 시스템 안내가 꼭 필요하면 1개), 과한 확장 금지.

### 2. v0.60 신규 UI 모바일 계약 커버리지 (src/ui/layout-contract.test.ts)
layout-contract는 이미 v0.58(시장 점유율), v0.59(자원 가시화, line ~454)까지 모바일 계약을 단언한다. v0.60에서 추가된 UI는 커버가 비어 보인다.
- `?scenario=physical-industries`(제품 패널의 신규 물리 산업), 산업 시너지/조합 표시가 모바일 390×844에서 **가로 오버플로 없이 뷰포트 안에 들어가는지** 단언하는 it-block 추가. 기존 모바일 계약 테스트(예: line ~285 "prevents narrow screens from creating horizontal page overflow", line ~454 자원 가시화)를 미러링.
- 신규 패널이 기존 게임 셸(고정 HUD/스테이지/메뉴 그리드) 계약을 깨지 않는지 확인.

### 3. (선택) 발견된 구조적 UI 깨짐 최소 수정
계약 테스트 작성 중 신규 패널이 모바일에서 오버플로/깨짐을 일으키면 App.css/해당 컴포넌트에서 **최소 수정**(기존 모바일 패턴 따라). 광범위 리디자인 금지.

## 제약

- 결정론적·구조적 테스트만 (브라우저 렌더 의존 금지).
- §5 — 새 대형 시스템/새 튜토리얼 시스템 추가 금지. 정리·명료화·커버리지 확장만.
- `simulation.ts` tick 로직 불변. 저장/불러오기(블록 #1) 불변.
- 모바일 390×844 계약을 깨지 않는다(오히려 강화).
- `npm run harness:gate` 통과 (43 files / 435+ tests 목표).

## 완료 기준

1. 튜토리얼 8단계 일관성 불변식이 `tutorial-guide.test.ts`로 단언된다(유효 targetMenu, 유니크 id, 도달성, 순서).
2. v0.60 신규 UI(물리 산업/시너지/조합)의 모바일 390×844 계약이 `layout-contract.test.ts`에 추가된다.
3. 발견된 구조적 깨짐이 있으면 최소 수정.
4. 테스트 2개+ 추가, `npm run harness:gate` 통과.
5. `reports/qa/v0_61_block3_run.md` — 튜토리얼 감사 결과, 추가한 모바일 계약, 발견·수정한 깨짐, simulation.ts/save 경로 미변경 확인, 수동 스크린샷 QA 후속 메모, 최종 게이트 출력.

## 세션 종료 시

`git commit` 금지. 마지막 메시지에 변경 파일 + 게이트 결과 + simulation/save 경로 미변경 확인. 계약 파일 편집 금지.
