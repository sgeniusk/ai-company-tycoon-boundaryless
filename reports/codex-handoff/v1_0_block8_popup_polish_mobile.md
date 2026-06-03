# Codex CLI 인계 — v1.0 #8 팝업 내부 명료성 + 모바일 + 픽셀 폴리시

작성일: 2026-06-03
작성자: Claude Code (편집장)
대상: Codex CLI — reasoning effort **medium**
작업 디렉토리: `/Users/taewookkim/dev/ai-company-tycoon`
선행: `main` @ (블록 6·7 이후). 설계 블록 4 + 사용자 지적("뒷부분/팝업 내부 미완성"). 마스터 `reports/v1_0_completion_plan.md`.

> **Codex 는 dev server / 브라우저 스모크 금지.** CSS/TSX + 단위 테스트 + build 까지만. 브라우저 검증·스크린샷은 Claude. `phase: starting` 멈춤 시 편집장이 취소·직접.

## 한 줄 요약

재설계가 첫 화면 셸은 끝냈지만 **팝업 내부 콘텐츠와 모바일·픽셀 일관성**이 미완성. 두 갈래 — (1) **명료성 스윕**: 커맨드 행처럼 v0.96 혼잡 가드가 다른 팝업/패널 내부에서도 라벨을 숨기거나 레이아웃을 찌그러뜨렸는지 점검·복원. (2) **모바일 풀시트 + 픽셀 폴리시 + reduced-motion**. visual/additive.

## 배경 (커맨드 행 선례)

`.app-shell...first-screen-composition` 혼잡 가드가 `display:none`/콤팩션을 여러 selector 에 무조건 걸었고, v0.97·v1.0#4·#5 에서 데스크톱은 ≤1100px 로 스코프해 라벨을 복원했다. **남은 패널/팝업 내부에 같은 잘림이 있는지** 전수 점검 필요(`.command-action span` 처럼 데스크톱에서 숨겨진 라벨, 좁은 grid-template-columns 로 찌그러진 버튼 등).

## 작업 (TDD)

### Task 1 — 명료성 스윕 (점검 + 복원)
- [ ] **1.1** App.css 에서 `first-screen-composition` 스코프의 **무조건 `display: none` / 강한 콤팩션** 규칙을 모두 찾아(grep `display: none`, `grid-template-columns: 24px`, 작은 `font-size` 등), 각각이 **데스크톱에서 의미 있는 라벨/정보를 숨기는지** 판단. 숨기면 `@media (max-width: 1100px)` 로 스코프(데스크톱 복원), 순수 안전가드(min-width:0/overflow)는 유지.
- [ ] **1.2** 메뉴 팝업 8종 + 현황/꾸미기 팝업의 **내부 패널이 팝업 카드 폭(`min(900px,92vw)`)에서 잘리거나 넘치지 않는지** CSS 점검 — 잘리는 라벨/텍스트는 wrap/ellipsis 또는 폭 조정. (계약/스모크로 오버플로 0 보장은 Claude.)
- [ ] **1.3** 계약 추가(예):
```ts
  it("v1.0 block8 keeps popup panel labels visible on desktop (no leftover crowding hides)", () => {
    // 데스크톱 미디어쿼리 밖(무조건)에서 라벨 span 을 숨기는 잔존 규칙이 없다 — 대표 selector 점검.
    // (Codex 가 실제로 남은 selector 에 맞춰 구체화: 예 메뉴 패널/버튼 라벨)
    expect(appCss).not.toMatch(/^\.app-shell\.v034-game-shell\.first-screen-composition [^@}]*\.menu-panel [^{]*span\s*{[^}]*display:\s*none/m);
  });
```

### Task 2 — 모바일 풀시트 + 런처 스크롤
- [ ] **2.1** `.menu-popup-overlay/.menu-popup-card`(+ 현황/꾸미기 팝업) 모바일(≤700px) = **거의 전체화면 시트**(상단 닫기 고정, 내부 스크롤). 데스크톱은 중앙 카드 유지.
- [ ] **2.2** `.menu-launcher-bar` 모바일 = **가로 스크롤**(그룹 구분 유지) 또는 2줄 래핑. 손가락 타깃 충분.
- [ ] **2.3** 모바일에서 오피스가 여전히 지배(officeFrac 유지)하고 팝업이 화면을 덮되 닫기 가능.

### Task 3 — 픽셀 폴리시 + reduced-motion
- [ ] **3.1** 모든 팝업/런처/배지가 `--pixel-radius`/`--pixel-steps`/하드 섀도 토큰 사용(soft shadow·둥근 모서리 잔존 점검). 팝업 등장 모션은 stepped + `@media (prefers-reduced-motion: reduce)` 가드.

### Task 4 — 검증
- [ ] `npm test -- --maxWorkers=1` + `npm run build`(tsc) 통과. additive diff(simulation/types/data) 비어 있음.
- [ ] (선택) `scripts/qa/check-v1_0-menu-popup.mjs` 에 모바일(390×844) viewport 케이스 추가는 Codex 작성 가능(실행은 Claude).

## 완료 기준
1. 데스크톱 팝업 내부 라벨 복원(잘린 정보 없음). 2. 모바일 팝업 풀시트 + 런처 스크롤. 3. 픽셀 토큰/reduced-motion 일관. 4. `npm test`+build, additive 비어 있음. 5. `git commit` 안 함. 보고: 복원한 selector 목록 + 변경 파일.

## 편집장 검증 (Claude)
- 각 메뉴 팝업 데스크톱 열어 **내부 라벨/텍스트 잘림 없음** 육안 + 스크린샷.
- 모바일 390×844: 팝업 풀시트·닫기, 런처 스크롤, officeFrac 유지.
- `check-v096-first-screen`(officeFrac ≥0.40, overflow 0) + `check-v1_0-menu-popup`(8/8) 회귀.
- 게이트+additive. 통과 시 Lore 커밋+push. → 이후 RC 트랙(프로덕션·아트·플레이테스트)은 사용자 게이트.
