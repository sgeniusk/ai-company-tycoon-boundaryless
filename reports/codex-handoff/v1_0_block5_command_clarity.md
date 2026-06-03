# Codex CLI 인계 — v1.0 #5 커맨드 행 명료화 (전략 손패 이동 + 버튼 전부 라벨)

작성일: 2026-06-03
작성자: Claude Code (편집장)
대상: Codex CLI — reasoning effort **medium**
작업 디렉토리: `/Users/taewookkim/dev/ai-company-tycoon`
선행: `main` @ `8c77563`. 게이트 53 files / 651 tests.

> **Codex 는 dev server / 브라우저 스모크 금지.** CSS/TSX + 단위 테스트 + build 까지만. 브라우저 검증은 Claude.

---

## 한 줄 요약

사용자가 하단 커맨드 콘솔의 아이콘 버튼이 뭔지 모르겠다고 함. 원인 — **전략 카드 손패(`StrategyHand`)가 커맨드 행을 꽉 채워** 새 게임/저장/불러오기 버튼이 찌그러져 라벨이 안 들어감. `StrategyHand` 는 **읽기 전용 표시**(손패 N·덱 N·버림 N + 카드 5장 미리보기, onClick 없음 — 카드 플레이는 덱 메뉴)라 이동해도 게임 로직 무변경. 손패를 커맨드 행에서 빼고 커맨드 버튼 4개를 전부 라벨한다. visual/additive.

## 작업 (TDD)

### Task 1 — RED: 계약
`src/ui/layout-contract.test.ts` — 추가.
```ts
  it("v1.0 block5 takes the strategy hand out of the command row so the controls are labeled", () => {
    // CommandRow 가 더 이상 StrategyHand 를 렌더하지 않는다.
    const commandRowSection = gameChrome.slice(gameChrome.indexOf("function CommandRow"), gameChrome.indexOf("function StrategyHand"));
    expect(commandRowSection).not.toContain("<StrategyHand");
    // 손패 인지: 덱 런처 버튼 또는 덱 팝업에 손패 수 표시.
    expect(gameChrome.includes("hand-count-badge") || menuPanels.includes("StrategyHand") || menuPanels.includes("hand-preview")).toBe(true);
  });
```
- [ ] `npm test -- src/ui/layout-contract.test.ts` → **FAIL**.

### Task 2 — GREEN: 손패 이동
- [ ] **2.1** `GameChrome.tsx` `CommandRow`(2931~)에서 `<StrategyHand gameState={gameState} />`(~2962) **제거**.
- [ ] **2.2** 손패 인지 유지 — 둘 중 하나(또는 둘 다):
  - `MenuPanels.tsx` `DeckPanel`(~874)이 현재 손패를 안 보여주면 `StrategyHand`(또는 동등한 손패 미리보기)를 DeckPanel 상단에 렌더. (이미 보여주면 생략.)
  - `MenuLauncherBar` 의 **덱(deck) 버튼에 "손패 N" 배지**(`hand-count-badge`) — `gameState.roguelite.deck.hand.length`. 한눈에 손패 수 인지.
- [ ] **2.3** `StrategyHand` 컴포넌트가 DeckPanel 로 가면 export/import 정리. 안 쓰면 제거.

### Task 3 — GREEN: 커맨드 행 4버튼 라벨
- [ ] **3.1** 손패가 빠졌으니 커맨드 행 = `다음 달`(primary) + `새 게임` + `저장` + `불러오기`. App.css `.command-row` 레이아웃을 **4버튼이 아이콘+라벨로 다 보이게** 조정. 내가 추가한 stacked/min-width 임시 CSS(8c77563)는 정리하고, 데스크톱에서 4버튼 라벨이 자연스럽게 들어가는 그리드로(예 primary 넓게 + 3 secondary 균등). 모바일(≤1100)은 기존처럼 아이콘 위주 콤팩트 허용.
- [ ] **3.2** `.command-action span` 데스크톱 표시 유지(라벨), 오버플로 안 나게.

### Task 4 — 검증
- [ ] `npm test -- --maxWorkers=1` 통과(StrategyHand/command 참조 테스트 갱신). `npm run build`(tsc) 통과.
- [ ] additive — `git --no-pager diff --stat -- src/game/simulation.ts src/game/types.ts data/` 비어 있음(StrategyHand 는 표시 전용, 로직 무변경).

## 완료 기준 (Codex)
1. 계약 RED→GREEN.
2. 손패가 커맨드 행에서 빠지고 덱(팝업/배지)로 인지 유지.
3. 커맨드 4버튼(다음 달/새 게임/저장/불러오기) 전부 라벨, 오버플로 없음.
4. `npm test` + build 통과. additive diff 비어 있음.
5. `git commit` 안 함. 보고: 변경 파일, RED→GREEN, 테스트+build, additive diff, 손패 이동처(덱 팝업/배지).

## 편집장 검증 (Claude, 실서버)
- 커맨드 버튼 4개 라벨 가시 + `.command-row` overflow 0 측정.
- 덱 팝업/런처 배지에 손패 표시 확인. `check-v1_0-menu-popup` 회귀(8 메뉴).
- 첫화면 스모크(officeFrac ≥0.37 유지, overflow 0) + 스크린샷 육안.
- 게이트 + additive. 통과 시 Lore 커밋(두 Co-Authored-By) + push.

## 주의
- `StrategyHand` 는 onClick 없는 표시 컴포넌트 — 이동은 시각 변경만, 게임 로직/세이브 불변.
- 손패를 완전히 숨기지 말 것(플레이어가 카드 수는 알아야 함) — 덱 팝업 또는 배지로 인지.
