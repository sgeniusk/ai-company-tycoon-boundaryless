# Codex CLI 인계 — v1.0 #3 탑바 압축 (시장 패널 → 경쟁 팝업)

작성일: 2026-06-02
작성자: Claude Code (편집장)
대상: Codex CLI — reasoning effort **medium**
작업 디렉토리: `/Users/taewookkim/dev/ai-company-tycoon`
선행: `main` @ `64b5321` (블록 2 오피스 전체 폭). 게이트 53 files / 650 tests.

> **Codex 는 dev server / 브라우저 스모크 금지.** CSS/TSX + 단위 테스트 + build 까지만. 브라우저 검증·officeFraction 측정은 Claude.

---

## 한 줄 요약

오피스가 전체 폭은 됐지만(블록 2) 탑바가 **224px**(측정값)라 오피스가 세로로 짧다. 원인은 탑바가 **시장 패널 2개(점유율 + 라이벌 아키타입)를 full 패널로 상시** 담고 있어서. 사용자 결정 — **시장 패널을 경쟁(competition) 팝업으로 이동**하고 탑바를 압축한다. visual/additive.

**성공 기준(Claude 측정): officeVisibleFraction 데스크톱 ≥ 0.40**(현재 0.29).

## 현황 (코드)

- `GameChrome.tsx` TopBar(425~501) 안 `<aside className="top-market-suite">` (495~498) 에 `<MarketSharePanel/>` + `<RivalArchetypePanel/>`. 이 둘은 GameChrome 에서만 렌더됨(CompetitionPanel 엔 없음).
- `.top-bar` 는 3컬럼 그리드(brand | command-center | market-suite). market-suite 컬럼이 `minmax(340px, 0.92fr)`.
- `CompetitionPanel`(MenuPanels.tsx ~3563)은 시장/라이벌 정보를 보여주는 경쟁 메뉴 — 여기로 시장 패널을 옮긴다.

## 작업 (TDD)

### Task 1 — RED: 계약
`src/ui/layout-contract.test.ts` — 추가.
```ts
  it("v1.0 block3 moves the market suite out of the top bar into competition", () => {
    // 시장 패널이 더 이상 TopBar(top-market-suite)에 없다.
    expect(gameChrome).not.toContain("top-market-suite");
    // 시장/라이벌 패널이 경쟁 메뉴에서 렌더된다.
    expect(menuPanels).toMatch(/MarketSharePanel/);
    expect(menuPanels).toMatch(/RivalArchetypePanel/);
  });
```
(`menuPanels` readFileSync 헬퍼가 test 상단에 이미 있음.)
- [ ] `npm test -- src/ui/layout-contract.test.ts` → **FAIL**.

### Task 2 — GREEN: 시장 패널 이동
- [ ] **2.1** `GameChrome.tsx` TopBar 에서 `<aside className="top-market-suite"> … </aside>` 전체 **제거**.
- [ ] **2.2** `MenuPanels.tsx` 상단에 `import { MarketSharePanel } from "./MarketSharePanel";` + `import { RivalArchetypePanel } from "./RivalArchetypePanel";` 추가. `CompetitionPanel`(~3563) 최상단(패널 그리드 첫 섹션)에 `<MarketSharePanel gameState={gameState} locale={locale} />` + `<RivalArchetypePanel gameState={gameState} locale={locale} />` 렌더. (CompetitionPanel 시그니처가 locale 을 안 받으면 받도록 + 호출부 `renderMenuContent` 에서 locale 전달 확인 — 이미 전달됨.)
- [ ] **2.3** `MarketSharePanel`/`RivalArchetypePanel` 이 GameChrome 에서 더 이상 안 쓰이면 import 정리.

### Task 3 — GREEN: 탑바 압축 CSS
`src/App.css`.
- [ ] **3.1** `.top-bar` 그리드를 **2컬럼**(brand | command-center)으로 — market-suite 컬럼(`minmax(340px,0.92fr)`) 제거. `grid-template-columns: minmax(180px, 0.72fr) minmax(0, 1.12fr)` 정도.
- [ ] **3.2** `.top-bar` `min-height` 를 낮춘다(예 116px → 96px) — 시장 패널이 빠졌으니 내용 높이가 줄어듦. center stack(metrics/progress/status/competitor-hud) 의 gap/padding 도 약간 타이트하게(오버플로 없이).
- [ ] **3.3** 모바일(≤1100/≤700)에서도 top-bar 가 2컬럼/압축되게, market-suite 관련 규칙 정리.

### Task 4 — 검증
- [ ] `npm test -- --maxWorkers=1` 통과(top-market-suite/Market/Rival 참조 테스트 갱신). `npm run build`(tsc) 통과.
- [ ] additive — `git --no-pager diff --stat -- src/game/simulation.ts src/game/types.ts data/` 비어 있음.

## 완료 기준 (Codex)
1. 계약 RED→GREEN.
2. 시장 패널이 TopBar→CompetitionPanel 로 이동, 탑바 2컬럼 압축.
3. `npm test` + build 통과. additive diff 비어 있음.
4. `git commit` 안 함. 보고: 변경 파일, RED→GREEN, 테스트+build, additive diff.

## 편집장 검증 (Claude, 실서버)
- 탑바 높이 측정(224→목표 ≤130) + `check-v096-first-screen` officeVisibleFraction **데스크톱 ≥0.40**.
- 경쟁 팝업에 시장/라이벌 패널 표시 확인(`check-v1_0-menu-popup` competition 케이스).
- 스크린샷 육안 — 탑바 압축 + 오피스 지배.
- 게이트 + additive. 통과 시 Lore 커밋 + push. (목표 미달 시 Claude 가 추가 압축 튜닝.)

## 주의
- 시장 정보가 상시 표시 → 경쟁 팝업으로 이동(on-demand). 사용자 승인됨.
- CompetitionPanel 이 locale prop 을 받는지 확인(MarketShare/Rival 이 locale 필요).
