# Codex CLI 인계 — v1.0 #2 오피스 최대화 (stage-side 팝업화 + 오버레이 축약 + 운영/꾸미기 분리)

작성일: 2026-06-02
작성자: Claude Code (편집장)
대상: Codex CLI — reasoning effort **high** (GameStage 리팩토링, 리스크 큼)
작업 디렉토리: `/Users/taewookkim/dev/ai-company-tycoon`
선행: `main` @ `deb7c9d` (블록 1 팝업 셸). 게이트 53 files / 649 tests. 설계 `reports/v1_0_menu_uiux_design_review.md`.

> **Codex 는 dev server / 브라우저 스모크 금지**(샌드박스 행). **CSS/TSX + 단위 테스트 + build(tsc)까지만.** 브라우저 검증은 Claude.

---

## 한 줄 요약

블록 1로 메뉴 컬럼은 없앴지만 오피스가 아직 안 큼(fraction ~0.24). 이번 블록이 **오피스를 실제로 지배**하게 만든다 — 게임-스테이지 내부의 `stage-side`(우측 460줄 탭 정보 컬럼)를 **팝업으로** 빼고, 오피스 위 4슬롯+운영패널을 **"다음 행동" 칩 1개**로 축약, **꾸미기**를 오피스 전용 버튼으로 분리. visual/additive — 시뮬·세이브·데이터 불변.

**성공 기준(핵심): `check-v096-first-screen.mjs` 의 officeVisibleFraction 이 데스크톱 ≥ 0.35 로 상승**(현재 0.24). 안 오르면 미완성.

## 작업 (TDD)

### Task 1 — RED: 계약
`src/ui/layout-contract.test.ts` — v1.0 블록 뒤에 추가.
```ts
  it("v1.0 block2 gives the office the full stage and moves the side panel into a popup", () => {
    // game-stage 가 오피스 전용 — stage-side 가 인라인 2단 컬럼이 아니다.
    expect(gameChrome).toMatch(/stage-status|status-popup|stage-side-popup/);
    // "다음 행동" 칩 + 꾸미기 오피스 버튼 마커.
    expect(gameChrome).toMatch(/next-action-chip|다음 행동/);
    expect(gameChrome).toMatch(/office-decor-button|꾸미기/);
    // 오피스 오버레이 4슬롯 그리드는 더 이상 4개 메뉴 슬롯이 아니다(축약).
    // (Codex 가 실제 구현 마커로 구체화)
  });
```
- [ ] `npm test -- src/ui/layout-contract.test.ts` → **FAIL**.

### Task 2 — GREEN: stage-side 를 팝업으로 (오피스 전체 폭)
`src/components/GameChrome.tsx` (GameStage).
- [ ] **2.1** GameStage 에 로컬 상태 `const [statusPopupOpen, setStatusPopupOpen] = useState(false);`.
- [ ] **2.2** 현재 `<div className="stage-side"> … </div>`(약 1102~1565) 를 **팝업 오버레이로 감싼다** — `{statusPopupOpen && (<div className="stage-status-popup-overlay" role="dialog" aria-modal="true"> <닫기 버튼> {기존 stage-side JSX 그대로} </div>)}`. v0.98 디스미스 패턴 재사용(Esc + 초기 포커스 + reduced-motion). **JSX 내용·props·핸들러는 그대로 옮긴다**(추출/이름변경 금지, 위치만 이동).
- [ ] **2.3** `.game-stage` 를 **오피스 전용**으로 — App.css `.game-stage { grid-template-columns: minmax(0, 1.72fr) minmax(230px, 0.48fr) }` → 단일 컬럼(오피스만). office-scene 이 game-stage 전체 폭.
- [ ] **2.4** 상태 팝업 여는 버튼 — "다음 행동" 칩(Task 3) 또는 office-hud 옆 작은 "현황/가이드" 버튼이 `setStatusPopupOpen(true)`.

### Task 3 — GREEN: 오버레이 축약 + 운영/꾸미기 분리
- [ ] **3.1** `OfficeActionSlots`(고용/개발/전략/꾸미기 4슬롯, ~1991) + `OperationCommandPanel`(운영 대기, ~1007) 제거 → **"다음 행동" 칩 1개**(`next-action-chip`, 오피스 좌하단). 칩 내용 = 가이드 최상위 추천 행동(기존 guidance/operationsPlan 에서 1개 derive). 클릭 = 해당 메뉴 팝업(`onOpenMenu`) 또는 상태 팝업.
- [ ] **3.2** **꾸미기 오피스 버튼** — 오피스 우상 모서리 `office-decor-button` 🎨. 클릭 = `onOpenMenu("shop")`(또는 shop 의 사무실 뷰). 운영(칩)과 위치·의미 분리.
- [ ] **3.3** 고용/개발/전략은 하단 런처가 이미 담당(중복 제거됨).

### Task 4 — App.css
- [ ] `.game-stage` 오피스 전용. `.stage-status-popup-overlay/.stage-status-popup-card`(v0.98 톤, 픽셀 토큰, 하드 섀도, reduced-motion). `.next-action-chip`, `.office-decor-button` 스타일. 모바일도 오피스 전체 폭 + 팝업 풀시트. `first-screen-composition` 토큰 유지.

### Task 5 — 검증
- [ ] `npm test -- --maxWorkers=1` 전체 통과(stage-side/OfficeActionSlots/OperationCommandPanel 참조 테스트 갱신). `npm run build`(tsc) 통과.
- [ ] additive — `git --no-pager diff --stat -- src/game/simulation.ts src/game/types.ts data/` 비어 있음.
- [ ] 스모크 `scripts/qa/check-v1_0-menu-popup.mjs` 에 상태 팝업/꾸미기 케이스 추가는 선택(Claude가 첫화면 fraction + 육안으로 검증).

## 완료 기준 (Codex)
1. 계약 RED→GREEN.
2. stage-side 가 인라인 컬럼이 아니라 팝업, game-stage 오피스 전용 폭.
3. 4슬롯+운영패널 → "다음 행동" 칩 1개, 꾸미기 오피스 버튼 분리.
4. `npm test` + build 통과. additive diff 비어 있음.
5. `git commit` 안 함. 보고: 변경 파일, RED→GREEN, 전체 테스트+build, additive diff, **stage-side JSX 를 추출 없이 팝업으로 옮겼는지 확인**.

## 편집장 검증 (Claude, 실서버)
- `check-v096-first-screen.mjs` — **officeVisibleFraction 데스크톱 ≥ 0.35 상승**(핵심 성공 기준) + 오버플로 0 + actors 6.
- `check-v1_0-menu-popup.mjs` — 8 메뉴 팝업 회귀 없음.
- 상태 팝업 열기/닫기(Esc) + 꾸미기 버튼 동작 수동/스크린샷.
- 데스크톱/모바일 스크린샷 육안 — **기본 화면에서 오피스가 지배**, 칩/꾸미기 버튼 distinct.
- 게이트 + additive. 통과 시 Lore 커밋(두 Co-Authored-By) + push.

## 주의/리스크
- stage-side JSX 이동 시 **모든 props/핸들러/로컬 변수 그대로**(GameStage 스코프 내). 추출하지 말 것 — 위치만 팝업으로.
- guidance/onboarding 은 "다음 행동" 칩 + 상태 팝업으로 접근 — 회귀 없게.
- `OfficeActionSlots`/`OperationCommandPanel` 제거 시 관련 import/테스트 정리.
- 블록 3(기록 세부화)·4(폴리시)는 다음. 이번엔 오피스 폭 + 운영/꾸미기.
