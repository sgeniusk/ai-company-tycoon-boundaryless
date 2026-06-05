# Codex CLI 인계 — v1.0 CD-2 코어 3 자원 HUD + ＋트레이 + 목표 리본 + 꾸미기 복원

작성일: 2026-06-06
작성자: Claude Code (편집장)
대상: Codex CLI — reasoning effort **medium**
작업 디렉토리: `/Users/taewookkim/dev/ai-company-tycoon`
선행: CD-1(LED 전광판) 완료·게이트 그린. 마스터 `reports/v1_0_claude_design_reflection_plan.md`. 디자인 = 사용자 확정 Claude Design 목업.

> **Codex 는 dev server / 브라우저 스모크 금지.** TSX/CSS + 단위 테스트 + `npm run build`(tsc) 까지만. 브라우저 검증·스크린샷·게이트·커밋은 편집장. `phase: starting` 멈춤 시 편집장이 취소·직접.

## 한 줄 요약

오늘 하드리셋이 모바일 첫 화면의 상단 자원·목표 리본·꾸미기·레벨 크레스트를 전부 `display:none` 으로 숨겼다. 사용자 확정 목업은 이걸 **정돈된 떠 있는 HUD** 로 되살린다 — 코어 3 자원 칩 + `＋` 트레이 + 레벨 + 목표 리본 + 꾸미기. 오피스는 여전히 주인공(officeFrac ≥0.40), 칩은 씬 위에 떠서 상·하단 그라데이션으로 가독성만. visual/additive(simulation·types·data·save 빈 diff).

## 현재 상태 (편집장 브라우저 실측, 390×844)

전부 컴포넌트는 항상 렌더되고, 모바일 `first-screen-composition` 의 `display:none` 으로 숨겨짐(컴포넌트 조건 아님).
- `.top-bar` → `display:none` (App.css 16119) → 그 안의 `.mobile-hud-star`·`.top-brand-crest` 도 0×0(숨김)
- `.resource-strip` → `display:none` (16172, 하드리셋 오버라이드). 안의 `.resource-tile.resource-cash/users/compute` 는 `display:grid`(16215)지만 부모가 none 이라 0×0
- `.turn-goal-strip` → `display:none` (mobile 그룹 16470 근처)
- `.office-decor-button` → `display:none` (16319)
- `.office-hud`(3행 상태판) → `display:none` (16251) — **목업에 없음, 계속 숨김 유지**

## 데이터 (전부 존재 · derive-only · import 만)

- 자원 라벨 — `resources[id].name` (`src/game/data`, resources.json). cash→자금, users→이용자, compute→연산력, data→데이터, talent→인재, trust→신뢰, hype→화제성, automation→자동화.
- 자원 아이콘 — `resourceIconIds[id]` (GameChrome.tsx:205) → `<CommercialUiIcon iconId=... />`.
- 값 — `formatResource(id, gameState.resources[id])`. 월 델타 — `getMonthlyResourceDelta(gameState, id)` (GameChrome:424). 임계 — `isResourceCritical(gameState, id)` (GameChrome:438).
- 레벨 — `getCompanyStarRating(gameState)` (이미 `.mobile-hud-star` 에 사용).
- 목표 — `TurnGoalStrip`(GameChrome:2292, guidance.title) 그대로 렌더되는 요소 재사용.
- **코어 3 = cash·users·compute. 보조 트레이 = data·talent·trust·hype·automation.** (`orderedResourceIds` 순서 유지.)

## 목업 비주얼 타깃 (게임 토큰, CDN 폰트 금지)

- 자원 칩 — 아이콘 우선 + 값. 어두운 배경 `rgba(17,30,26,.82)`, 청록 보더, `--pixel-radius`. cash 값은 초록 계열, 나머지 골드. `isResourceCritical` → 빨강 강조. 터치 타깃 넉넉히.
- 레벨 — `N★` 골드 칩 + 작은 크레스트(골드 보더). 자원 칩 좌측.
- `＋` 트레이 버튼 — 작은 정사각, `＋`/`×` 토글. 누르면 보조 5종 팝오버.
- 트레이 팝오버 — 2열 그리드, 라벨+값, 어두운 패널·청록 보더·하드 섀도. 오피스 위에 뜸.
- 목표 리본 — 골드 좌측 보더 6px, 작은 `이번 달 목표` 태그 + 굵은 제목(guidance.title). 조용히, 오피스 좌하단, max-width ~62%.
- 꾸미기 — 우상단, 청록 보더, `🎨 꾸미기`.
- 칩은 오피스 상·하단에 떠서 기존 topfade/botfade 로 가독성. 오피스를 완전히 덮지 않음.

## ⚠️ 계약 테스트 랜드마인 (reconcile 필수)

`src/ui/layout-contract.test.ts` — 다음을 새 HUD에 맞게 갱신:
- `:894` — `@media(max-width:700px) ... .alpha-run-focus-strip, .turn-goal-strip, .rival-incident-banner { display:none }`. **목표 리본은 이제 보이므로 그룹에서 `.turn-goal-strip` 빼기**(alpha-run-focus-strip·rival-incident-banner 는 의도대로 유지). 목표 리본이 모바일에서 보이고 좌하단 배치임을 단언 추가.
- `:575–589`, `:906–908` — `.resource-strip` 모바일 4열/42px/`nth-child(n+5) display:none`. 새 칩 HUD(코어 3 + 트레이)와 **reconcile**(부모 strip 가시화, 코어 3만 노출, 보조는 트레이). 잔존 규칙이 어긋나면 갱신.
- `:884` — 모바일 코어 3(cash/users/compute) `display:grid` 유지하되, **부모 `.resource-strip` 가 더 이상 none 이 아님**을 보장(16172 오버라이드 제거/대체).
- `:880` `.mobile-hud-star { display:none }`(데스크톱 기본) — 모바일에서 보이도록 more-specific 규칙 유지/추가. 데스크톱 기본 규칙은 유지 가능.
- `.office-decor-button` 모바일 숨김(16319) 제거 → 우상단 노출. (테스트에 모바일 숨김 단언은 없을 수 있음 — 신규 가시성 단언 추가.)
- `:963–967` `.office-hud` — **계속 숨김 유지**(목업에 없음). 건드리지 말 것.
- 신규 `it("v1.0 CD-2 ...")` — 모바일에서 코어 3 자원 칩·`＋` 트레이·목표 리본·꾸미기가 노출됨을 단언(소스/CSS 문자열).

## 작업 (TDD)

- [ ] **1. ＋트레이 TSX** — GameStage(또는 작은 컴포넌트)에 트레이 토글 state + 보조 5 자원 팝오버. 기존 `resources`/`formatResource` 재사용, additive. (resource-strip 가 이미 8타일 렌더 — 트레이는 보조 타일 노출 토글로 구현 가능.)
- [ ] **2. CSS(모바일 first-screen-composition ≤700px)** — 코어 3 떠 있는 칩 행 + 레벨/크레스트 노출 + `＋` 트레이/팝오버 + 목표 리본 좌하단 + 꾸미기 우상단. `.office-hud` 는 숨김 유지. 픽셀 토큰·하드 섀도·reduced-motion(팝오버 모션). 데스크톱 불변.
- [ ] **3. 계약 테스트** — 위 랜드마인 reconcile + CD-2 신규 단언.
- [ ] **4. 검증** — `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1` + `npm run build`. additive 빈 diff(simulation/types/data/save). dev server/브라우저/커밋 안 함.

## 완료 기준

1. 모바일에서 코어 3 자원 칩(아이콘+값, cash 초록/나머지 골드, 임계 빨강) + 레벨 + `＋` 트레이(보조 5) + 목표 리본 + 꾸미기 노출. 2. 오피스 여전히 주인공, 칩이 씬을 완전히 덮지 않음. 3. `.office-hud` 숨김 유지. 4. reconcile된 계약 테스트 + CD-2 단언 + build 그린. 5. additive 빈 diff. 6. 보고 — 변경 파일 + reconcile한 단언 목록 + 추가한 가시성 규칙.

## 편집장 검증 (Claude)

- 실서버 390×844 — 코어 3 칩 가독·`＋` 트레이 동작·목표 리본 조용·꾸미기 우상단, 오피스 지배(officeFrac ≥0.40)·overflow 0·LED(CD-1)·하단 도크 무손상. 스크린샷.
- `check-v096-first-screen` 회귀 + 게이트 + additive. 통과 시 (커밋 보류 — 사용자 지시) → CD-3 진행.
