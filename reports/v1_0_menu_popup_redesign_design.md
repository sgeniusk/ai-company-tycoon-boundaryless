# 설계 — 메뉴 팝업 재설계 (오피스 우선 첫 화면)

작성일: 2026-06-02
작성자: Claude Code (편집장 / 기획·검증)
승인 방식: 접근법 A (팝업 + 하단 런처 바) — 사용자 승인 2026-06-02
구현: Codex (CSS/TSX + 단위 테스트) / 검증·커밋: Claude. visual/additive — 시뮬·틱·세이브·데이터 불변.

## 목표

메인 픽셀아트인 **오피스가 첫 화면을 지배**하게 한다. 메뉴와 보조 패널은 항상 떠 있지 않고, **하단 런처 바에서 클릭하면 오피스 위에 중앙 팝업**으로 뜬다(한 번에 1개, 닫기/Esc). 게임 콘텐츠(메뉴 패널 내부)는 그대로 재사용하고 **배치만** 바꾼다.

## 문제 (코드 확인)

`GameStage`(GameChrome.tsx:571~)와 `app-shell` 그리드가 오피스를 패널로 덮는다.
- 오피스 위 오버레이 — `office-hud`(연/단계·확장·프로젝트 상태), `OfficeActionSlots`(고용/개발/전략/꾸미기, GameChrome:1000), `OperationCommandPanel`(운영 대기, :1007), `RivalIncidentBanner`(:1006).
- 우측 2개 컬럼 — `stage-side`(가이드/비서/목표/런치임팩트 패널, :1101) + `menu-layout`(항상 떠 있는 큰 메뉴 콘텐츠, App.tsx:160).
- 그리드 `app-shell`: `"top top top" / "stage stage menu" / "resources commands menu"` — menu 컬럼이 우측 폭을 상시 점유.

## 기본 화면 (목표)

```
┌──────────────────────────────────────────────┐
│ TopBar (위치·TEAM·AI·ROBOT / 목표·회사·월간·결과)  │  ← 항상
├──────────────────────────────────────────────┤
│                                              │
│   office-scene (거의 전체 폭, 직원 코믹 모션)      │  ← 항상, 지배
│     + office-hud 작은 칩 + "다음 행동" 칩 1개       │
│     + 이벤트 레일(v0.95) / 이벤트·보상 팝업(v0.98)  │
├──────────────────────────────────────────────┤
│ ResourceStrip (자원 HUD, v0.97 데스크톱 타일)      │  ← 항상
├──────────────────────────────────────────────┤
│ CommandRow(턴 콘솔) + 메뉴 런처 바 [회사][제품]…[기록] │  ← 항상
└──────────────────────────────────────────────┘
   메뉴 클릭 → 오피스 위 중앙 팝업 1개 (renderMenuContent), 닫기/Esc
```

## 항상 유지 (always-on)

- `TopBar`, `office-scene`(+ `office-hud` 칩), `ResourceStrip`, `CommandRow`, 이벤트 레일.
- 신규 **메뉴 런처 바** — `menu.ts` 의 8개 메뉴(회사/제품/덱/에이전트/연구/상점/경쟁/기록)를 아이콘+라벨 버튼으로. 클릭 시 해당 팝업.
- **"다음 행동" 칩 1개** — 기존 guidance/tutorial 의 최상위 추천 행동만 작게(온보딩 보존). 클릭 시 해당 팝업.

## 팝업으로 전환

- `menu-layout` 우측 상시 컬럼 → **제거**. 콘텐츠(`renderMenuContent`)는 신규 **MenuPopupModal** 안에서 렌더.
- `stage-side` 패널들(guidance/secretary/launch-impact/debrief/goal) → 팝업으로 이전하거나 해당 메뉴 팝업에 흡수.
- `OfficeActionSlots`(4슬롯) + `OperationCommandPanel` → **"다음 행동" 칩 1개**로 축약(런처 바가 전체 메뉴 접근을 담당하므로 4슬롯 중복 제거).

## 팝업 시스템

- 신규 `MenuPopupModal` — **v0.98 오버레이 인프라 재사용**(`role="dialog"` `aria-modal`, 닫기 버튼, Esc-to-dismiss, 초기 포커스, hover/active/focus-visible 어포던스, reduced-motion). 한 번에 1개.
- 상태 — App.tsx 에 `activePopupMenu: MenuId | null`(기본 null = 오피스 클리어). 런처 바·"다음 행동" 칩·기존 `onOpenMenu`/`setActiveMenu` 콜백이 전부 `setActivePopupMenu(id)` 로 라우팅. 닫기/Esc = null. **새 GameState 필드 없음**(ephemeral React state, v0.63 world-reveal 패턴).
- 통합 주의점 — 현재 `tutorialGuide = getTutorialGuide(gameState, activeMenu)` 가 activeMenu 에 의존. 팝업이 닫혀 있을 때(null)의 기본 가이드 컨텍스트를 정의해야 함(예: "company" 기본값). 모든 기존 `onOpenMenu` 콜사이트가 팝업으로 라우팅되는지 확인.

## 그리드 변경

`app-shell` 을 단일 메인 컬럼으로 — 오피스(stage)가 전체 폭. 예
```
grid-template-areas: "top" "stage" "resources" "commands";
```
menu 영역 제거 → stage 가 넓어짐. 데스크톱/모바일 모두 `first-screen-composition` 계약 + v0.97 토큰 유지.

## 분해 (구현 블록)

1. **블록 1 — 팝업 셸 + 런처 바 + 오피스 폭 확보.** `MenuPopupModal`(v0.98 재사용) + `activePopupMenu` + 하단 런처 바 + `menu-layout` 컬럼 제거 + 그리드 단일 컬럼화 + 콜백 라우팅 + 가이드 기본 컨텍스트. 계약(RED/GREEN) + 메뉴 팝업 스모크(각 메뉴 열기→Esc/닫기). **이것만으로 우측 컬럼이 사라져 오피스가 크게 넓어짐.**
2. **블록 2 — 오피스 오버레이 축약.** `OfficeActionSlots`+`OperationCommandPanel` → "다음 행동" 칩 1개. `stage-side` 패널을 팝업/메뉴로 이전. 첫화면 스모크(officeVisibleFraction 상승 확인).
3. **블록 3 — 팝업 폴리시 + 반응형.** 팝업 픽셀 스타일(`--pixel-radius`/`--pixel-steps`), 모바일(런처 바 스크롤/줄바꿈, 팝업 거의 전체화면), reduced-motion, 데스크톱/모바일 스크린샷. 첫화면 스모크 임계값 상향(예 데스크톱 office fraction ≥ 0.40).

## 범위 밖 (out of scope)

- 시뮬레이션/틱/세이브/데이터/경제 로직 변경 금지. 메뉴 패널 **내용**(renderMenuContent의 각 패널)은 수정 없이 위치만 이동.
- 이벤트/보상/세계뽑기 팝업(v0.98)은 그대로.

## 리스크

- guidance/tutorial 의 activeMenu 의존 → null 컨텍스트 처리.
- 모든 `onOpenMenu`/`setActiveMenu` 콜사이트(런처·슬롯·가이드·연간지시 등)가 팝업으로 라우팅되는지.
- `stage-side` 의 런치임팩트/디브리프 같은 흐름 패널의 이전 위치.
- 모바일 팝업 사이징.

## 검증

블록당 — Codex 계약 RED→GREEN + 단위 테스트, Claude 가 실서버에서 첫화면 스모크 + 신규 메뉴-팝업 스모크 + 스크린샷 + 게이트 + additive diff(simulation/types/data 빈 diff). 통과 시 Lore 커밋 + push.

## 성공 기준

- 기본(팝업 닫힘) 첫 화면에서 오피스가 지배적(officeVisibleFraction 대폭 상승), 우측 상시 메뉴 컬럼 없음.
- 8개 메뉴가 하단 런처에서 팝업으로 열리고 닫기/Esc 로 닫힘(스턱 없음).
- 게이트 그린, visual/additive.
