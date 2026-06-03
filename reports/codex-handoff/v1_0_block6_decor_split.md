# Codex CLI 인계 — v1.0 #6 꾸미기/상점 분리

작성일: 2026-06-03
작성자: Claude Code (편집장)
대상: Codex CLI — reasoning effort **medium**
작업 디렉토리: `/Users/taewookkim/dev/ai-company-tycoon`
선행: `main` @ `dc615eb`. 게이트 53 files / 652 tests. 설계 `reports/v1_0_menu_uiux_design_review.md`(Q1=a 승인), 마스터 `reports/v1_0_completion_plan.md`.

> **Codex 는 dev server / 브라우저 스모크 금지**(샌드박스 행). CSS/TSX + 단위 테스트 + build 까지만. 브라우저 검증은 Claude. **`phase: starting` 에서 멈추면 그냥 두면 됨 — 편집장이 워처로 감지 후 취소·직접 처리.**

## 한 줄 요약

오피스의 **꾸미기 버튼**(`office-decor-button`, GameChrome)이 지금 `onOpenMenu("shop")` 로 상점 메뉴 전체를 연다. 상점은 **에이전트 장비 + 사무실 물건/구획**을 한 패널에 섞음(`ShopPanel`, MenuPanels ~3178 "아이템 상점"). 꾸미기 버튼은 **사무실 꾸미기(장식/배치/구획) 뷰**를, 상점 런처는 **구매/장비 뷰**를 열게 분리한다. 콘텐츠는 ShopPanel 안에 둘 다 있음(officeItems/placedOfficeItems/storedOfficeItems/officeZonePlan vs agent items) — **렌더 분기만, 게임 로직 불변**. visual/additive.

## 작업 (TDD)

### Task 1 — RED: 계약
`src/ui/layout-contract.test.ts` 추가.
```ts
  it("v1.0 block6 opens the office-decor view distinct from the buy shop", () => {
    // ShopPanel 이 view 분기(상점/꾸미기)를 가진다.
    expect(menuPanels).toMatch(/shop-view|decor-view|ShopView|isDecorView|shopTab/);
    // 꾸미기 버튼이 꾸미기 뷰로 연다(상점 통째가 아님).
    expect(gameChrome).toMatch(/office-decor-button[\s\S]*?(decor|꾸미기)/s);
  });
```
- [ ] `npm test -- src/ui/layout-contract.test.ts` → **FAIL**.

### Task 2 — GREEN: ShopPanel 뷰 분기
- [ ] **2.1** `ShopPanel`(MenuPanels)에 뷰 상태/분기 — 탭 `["상점", "꾸미기"]` 또는 prop `initialView: "shop" | "decor"`. **상점 뷰** = 구매/장비(itemRows, recommendations, agent items). **꾸미기 뷰** = 사무실 물건 배치/보관/구획(officeItems, placedOfficeItems, storedOfficeItems, officeZonePlan, officeExpansion, officeSynergySummary). 기존 계산/핸들러 재사용, 새 로직 금지.
- [ ] **2.2** 꾸미기 뷰가 초기 선택되도록 신호 전달 — App.tsx 에 가벼운 방법(예 `activePopupMenu === "shop"` + 별도 `shopInitialView` state, 꾸미기 버튼이 "decor" 로 세팅; 상점 런처는 "shop"). `MenuPopupModal`/`renderMenuContent` 에 initialView 전달. (또는 ShopPanel 내부 탭만 두고 꾸미기 버튼이 URL/state 로 탭 선택.)
- [ ] **2.3** GameChrome `office-decor-button` 이 꾸미기 뷰를 열도록(`onOpenMenu("shop")` + decor 신호).

### Task 3 — 검증
- [ ] `npm test -- --maxWorkers=1` 통과(ShopPanel 참조 테스트 갱신). `npm run build`(tsc) 통과.
- [ ] additive — `git --no-pager diff --stat -- src/game/simulation.ts src/game/types.ts data/` 비어 있음.

## 완료 기준
1. 계약 RED→GREEN. 2. 꾸미기 버튼=꾸미기 뷰, 상점 런처=구매 뷰. 3. `npm test`+build 통과, additive 비어 있음. 4. `git commit` 안 함. 보고: 변경 파일, RED→GREEN, 테스트+build, additive, 뷰 분기 방식.

## 편집장 검증 (Claude)
꾸미기 버튼 클릭 시 사무실 물건/배치 뷰, 상점 런처 클릭 시 구매 뷰. `check-v1_0-menu-popup` 회귀. 게이트+additive. 통과 시 Lore 커밋+push.
