# Codex CLI 인계 — v1.0 #1 팝업 셸 + 하단 런처 바 + 오피스 폭 확보

작성일: 2026-06-02
작성자: Claude Code (편집장 / 기획·검증)
대상: Codex CLI — reasoning effort **high** (셸 재구성, 리스크 큼)
작업 디렉토리: `/Users/taewookkim/dev/ai-company-tycoon`
선행: `main` @ `06415a3`. 게이트 53 files / 648 tests. 설계 `reports/v1_0_menu_uiux_design_review.md`(승인됨).

> **Codex 는 dev server / 브라우저 스모크 금지**(샌드박스 행). **CSS/TSX + 단위 테스트(`npm test`)까지만.** 브라우저 검증은 Claude.

---

## 한 줄 요약

우측 상시 메뉴 컬럼(`menu-layout`)을 제거하고, 메뉴를 **하단 런처 바에서 클릭하면 오피스 위 중앙 팝업**으로 연다. 기본 화면은 팝업이 닫혀 있어 **오피스가 전체 폭**. visual/additive — 시뮬·세이브·데이터 불변, 메뉴 내용(renderMenuContent) 재사용.

## 핵심 단순화 (이걸 반드시 따를 것)

다운스트림 61개 `setActiveMenu`/`onOpenMenu` 콜사이트(GameChrome 36, MenuPanels 25)는 **시그니처도 호출도 바꾸지 않는다**. App.tsx 에서 `setActiveMenu` 를 **"메뉴 선택 + 팝업 열기" 래퍼**로 감싸 내려보내면, 기존 모든 콜사이트가 자동으로 팝업을 연다. `activeMenu` 는 계속 non-null(`MenuId`)이라 타입 리플·가이드 null 처리 불필요.

## 작업 (TDD)

### Task 1 — RED: 계약 갱신 + 신규 계약
`src/ui/layout-contract.test.ts`.
- [ ] **1.1** 기존 그리드 assertion을 새 그리드로 갱신. line 26-27 의 `"stage stage menu"` / `"resources commands menu"` 와 v0.96 블록(line ~440)의 동일 정규식을, **메뉴 컬럼 없는 새 단일 컬럼 그리드**에 맞게 수정(아래 Task 3의 실제 CSS 값에 일치).
- [ ] **1.2** 신규 v1.0 계약 블록 추가:
```ts
  it("v1.0 routes menus into a popup launcher instead of a persistent menu column", () => {
    // 상시 메뉴 컬럼 제거 — App.tsx 에 menu-layout 섹션이 없다.
    expect(appSource).not.toContain("menu-layout pixel-menu-cabinet");
    // 하단 런처 바 + 팝업 셸 마커 존재.
    expect(appSource).toMatch(/menu-launcher-bar|MenuLauncherBar/);
    expect(appSource).toMatch(/menu-popup|MenuPopupModal/);
    // 그리드에 menu 영역이 없다(오피스 전체 폭).
    expect(appCss).not.toMatch(/grid-template-areas:[\s\S]*?stage stage menu/s);
  });
```
- [ ] **1.3** `npm test -- src/ui/layout-contract.test.ts` → **FAIL**(아직 menu-layout 존재).

### Task 2 — GREEN: App.tsx 셸 재구성
`src/App.tsx`.
- [ ] **2.1** 팝업 열림 상태 추가: `const [isMenuPopupOpen, setMenuPopupOpen] = useState(false);` (기본 false = 오피스 클리어). `activeMenu`/`setActiveMenu` 는 그대로 두되, **래퍼** 추가:
```tsx
const openMenu = (action: SetStateAction<MenuId>) => { setActiveMenu(action); setMenuPopupOpen(true); };
```
- [ ] **2.2** `GameStage`/`EventPanels`/튜토리얼 버튼 등 **메뉴를 여는 모든 곳에 `setActiveMenu` 대신 `openMenu` 를 전달**(prop 이름은 `setActiveMenu` 유지 → 다운스트림 무변경). 예: `<GameStage ... setActiveMenu={openMenu} />`, `handleTutorialAction` 의 `setActiveMenu(tutorialGuide.targetMenu)` → `openMenu(...)`.
- [ ] **2.3** `menu-layout` 섹션(line 160-163) **삭제**. 대신 두 가지 추가:
  - **하단 런처 바** — `<MenuLauncherBar activeMenu={isMenuPopupOpen ? activeMenu : null} onOpen={openMenu} />` (CommandRow 근처/아래, 항상 표시).
  - **팝업** — `{isMenuPopupOpen && <MenuPopupModal activeMenu={activeMenu} gameState={gameState} setGameState={setGameState} locale={locale} setActiveMenu={openMenu} onDismiss={() => setMenuPopupOpen(false)} />}`.
- [ ] **2.4** `tutorialGuide = getTutorialGuide(gameState, activeMenu)` 그대로(활성값 유지). 팝업 닫힘과 무관하게 가이드 산출 — "다음 행동" 칩은 블록 2에서. 이번 블록은 가이드 동작 회귀만 없으면 됨.

### Task 3 — GREEN: 신규 컴포넌트 + CSS
- [ ] **3.1** `MenuLauncherBar` — `src/components/GameChrome.tsx` 에 신규 export(또는 기존 `MainMenu` 를 가로 런처로 재활용). `menu.ts` 의 8메뉴를 **그룹(core=운영/operations=성장/meta=시장) 구분선·라벨**로 가로 배치, 각 버튼 아이콘(`menuIconIds`)+라벨, 클릭 시 `onOpen(menu.id)`. 현재 열린 메뉴 버튼은 눌림 표시.
- [ ] **3.2** `MenuPopupModal` — `src/components/` 신규. **v0.98 오버레이 패턴 재사용**: `role="dialog"` `aria-modal`, `.menu-popup-overlay` + `.menu-popup-card`, 닫기 버튼 + **Esc-to-dismiss** + **초기 포커스**(닫기 버튼) + hover/active/focus-visible + reduced-motion(`BigEventModal`/`PayoffCelebrationModal` 의 ESC/포커스 패턴 그대로). 본문 = `renderMenuContent(activeMenu, gameState, setGameState, locale, setActiveMenu)`. 사이즈 데스크톱 `min(900px, 92vw)` 중앙, 모바일 풀시트.
- [ ] **3.3** `src/App.css` — `.app-shell` 그리드를 **menu 영역 없는 단일 메인 컬럼**으로(오피스 stage `minmax(0,1fr)` 지배). 예 `grid-template-areas: "top" "stage" "resources" "commands" "launcher";` + 적절한 rows. `.first-screen-composition` 토큰/혼잡가드 유지. `.menu-launcher-bar`(그룹 구분, 픽셀 토큰) + `.menu-popup-overlay/.menu-popup-card` 스타일(v0.98 톤, `--pixel-radius`/`--pixel-steps`, 하드 섀도, reduced-motion). 모바일 ≤1100/≤700 그리드도 menu 제거에 맞게 갱신(이미 단일 컬럼이면 menu 행만 정리).
- [ ] **3.4** `npm test -- src/ui/layout-contract.test.ts` → **PASS**.

### Task 4 — 메뉴 팝업 스모크 (Codex 작성, Claude 실행)
`scripts/qa/check-v1_0-menu-popup.mjs` (신규). v0.98 오버레이 스모크 구조 재사용(fresh browser per check, drain-dismiss, `PW_NODE_MODULES`, dist 폴백). `?scenario=office-visuals` 로드 → **각 런처 버튼(8개)** 클릭 → `.menu-popup-overlay` 출현 + 메뉴 콘텐츠 확인 → 닫기/Esc → 닫힘 확인 → 잔여 오버레이 없음. 데스크톱 1366. 스크린샷 `reports/qa/screenshots/v1_0_menu_popup_<menu>.png` 몇 개. exit nonzero on 미출현/잔존/콘솔 에러. **실행 금지(Claude가 실행).**

### Task 5 — 검증
- [ ] `npm test -- --maxWorkers=1` 전체 통과(스냅샷/계약 회귀 없음 — 특히 menu-layout 참조하던 다른 테스트 있으면 갱신).
- [ ] additive — `git --no-pager diff --stat -- src/game/simulation.ts src/game/types.ts data/` 비어 있음.

## 완료 기준 (Codex)
1. 계약 RED→GREEN(그리드 갱신 + v1.0 팝업 계약).
2. menu-layout 컬럼 제거, 하단 런처 바 + MenuPopupModal, 오피스 전체 폭 그리드, openMenu 래퍼로 기존 콜사이트 라우팅.
3. MenuPopupModal = v0.98 ESC/포커스/어포던스/reduced-motion 재사용.
4. `npm test` 전체 통과. additive diff 비어 있음. 빌드(tsc) 통과.
5. `git commit` 안 함. 보고: 변경 파일, RED→GREEN, 전체 테스트, additive diff, **그리고 모든 기존 setActiveMenu 콜사이트가 openMenu 래퍼로 팝업을 여는지 확인**.

## 편집장 검증 (Claude, 실서버)
- `check-v1_0-menu-popup.mjs` 실행 — 8개 메뉴 팝업 열기/닫기, 잔여 없음.
- `check-v096-first-screen.mjs` — **officeVisibleFraction 상승**(메뉴 컬럼 제거 효과) + 오버플로 0.
- 데스크톱/모바일 스크린샷 육안 — 기본 화면 오피스 지배, 런처 바, 팝업.
- 게이트 + additive diff. 통과 시 Lore 커밋(두 Co-Authored-By) + push.

## 주의/리스크
- 그리드 변경으로 v0.96 계약(그리드 areas)이 깨지므로 **반드시 갱신**(Task 1.1).
- `MainMenu` 를 런처로 재활용 시 기존 `MainMenu` import/사용처(App.tsx) 정리.
- QA 시나리오가 `activeMenu` 를 세팅하던 경우(초기 메뉴) — 팝업 자동 오픈 여부는 자연스러운 동작이면 OK, 아니면 초기 isMenuPopupOpen=false 유지.
- stage-side(오피스 내부 우측 패널)는 이번 블록 **유지**(블록 2에서 정리). 이번엔 menu 컬럼 제거만으로도 오피스가 넓어짐.
