# v1.0 완성 계획 — 오피스-우선 재설계 마무리 + RC

작성일: 2026-06-03
작성자: Claude Code (편집장 / 기획·검증)
현재: `main` @ `dc615eb` (origin 동기화). 게이트 53 files / 652 tests, build 클린, 청크 경고 없음.
설계 근거: `reports/v1_0_menu_uiux_design_review.md`(사용자 승인). 상위 로드맵: `reports/v0_96_plus_commercial_polish_roadmap.md`.

## 한 줄 상태

오피스-우선 재설계는 **첫 화면/셸 구조까지 완료**(팝업 시스템·런처·오피스 지배 0.40+·커맨드 명료화). 미완성은 **팝업 내부 콘텐츠·기록 세부화·꾸미기 분리·모바일·픽셀 폴리시**다. 이 문서가 남은 블록 큐다. 모든 블록 visual/additive(시뮬·세이브·데이터 불변).

## 완료된 것 (이번 세션, 커밋)

| 커밋 | 내용 |
|------|------|
| `deb7c9d` | v1.0 #1 메뉴 컬럼 제거 → 하단 그룹 런처 + 팝업 셸(`MenuPopupModal`, `activePopupMenu`, openMenu 래퍼) |
| `64b5321` | v1.0 #2 stage-side → 현황 팝업, 오피스 전체 폭, OfficeActionSlots+OperationCommandPanel → "다음 행동" 칩, 꾸미기 오피스 버튼 |
| `ecc48ed` | v1.0 #3 시장 패널 → 경쟁 팝업, 탑바 224→147px (officeFrac 0.29→0.376) |
| `8c77563` | v1.0 #4 "다음 달" 라벨 복원(데스크톱) |
| `dc615eb` | v1.0 #5 커맨드 4버튼 라벨 + 전략 손패 → 덱 팝업/배지 (officeFrac→0.403) |

또한 v0.96~v0.99 상용 폴리시 + v1.0-beta 프리뷰/릴리스 리포트(`397ba67`)는 이미 출시. 최신 프리뷰 `ai-company-tycoon-2g7zgvqcu-...vercel.app`.

## 남은 블록 큐 (Codex 핸드오프 작성됨)

각 블록 — Codex 가 CSS/TSX + 단위 테스트 + build, Claude 가 실서버 브라우저 스모크·스크린샷·게이트·커밋. **Codex 에 dev server/브라우저 스모크 금지**(샌드박스 행 — 이번 세션 v0.96·v1.0#1·#5 에서 21~33분 행 확인). Codex 가 `phase: starting` 에서 멈추면 취소하고 편집장이 직접.

### 블록 6 — 꾸미기/상점 분리 (`reports/codex-handoff/v1_0_block6_decor_split.md`)
설계 결정 Q1=(a). 지금 꾸미기 오피스 버튼은 `shop` 메뉴를 통째로 연다. `ShopPanel` 을 **상점(장비/구매) 뷰 + 꾸미기(사무실 물건 배치·구획·zone) 뷰**로 분기. 꾸미기 버튼 → 꾸미기 뷰, 상점 런처 → 상점 뷰. 콘텐츠는 이미 ShopPanel 안에 둘 다 있음(officeItems/placedOfficeItems/zonePlan vs agent items) — 렌더 분기만, 게임 로직 불변.

### 블록 7 — 기록 세부화 (`reports/codex-handoff/v1_0_block7_log_subtabs.md`)
설계 결정 Q2=타임라인/도감/업적 3 서브탭. `기록(log)` 팝업(TimelinePanel)을 **타임라인 / 도감(discoveredArchetypeIds·discoveredPayoffIds) / 업적(unlockedAchievements)** 서브탭으로. 콘텐츠는 기존(collection-lite·achievements) 재배치, 신규 로직 없음.

### 블록 8 — 팝업 내부 명료성 + 모바일 + 픽셀 폴리시 (`reports/codex-handoff/v1_0_block8_popup_polish_mobile.md`)
설계 블록 4 + 사용자가 지적한 "뒷부분". 두 갈래:
1. **명료성 스윕** — 커맨드 행처럼 v0.96 혼잡 가드가 **다른 팝업/패널 내부에서도 라벨을 숨기거나 레이아웃을 찌그러뜨렸는지** 점검(각 메뉴 팝업: 회사/제품/덱/에이전트/연구/상점·꾸미기/경쟁/기록 + 현황 팝업). 데스크톱에서 잘린 라벨/오버플로 복원.
2. **반응형·폴리시** — 모바일(≤700px) 팝업 풀시트 + 닫기/스와이프, 런처 가로 스크롤(그룹 구분 유지), 팝업 픽셀 토큰(`--pixel-radius`/`--pixel-steps`/하드 섀도) 일관, reduced-motion 커버, 데스크톱·모바일 스크린샷. 모바일 메뉴-팝업 스모크 추가.

## RC / 릴리스 트랙 (USER-GATED, Codex 아님)

- **프로덕션 승격** — `vercel deploy --prod` (블록 6~8 완료 + 사용자 검토 후).
- **최종 소스 아트** — AGY/Antigravity, 게이트 `npm run qa:asset-handoff`, 브리프 `docs/ANTIGRAVITY_ART_BRIEF.md`.
- **실사용자 블라인드 플레이테스트** — 캘린더 바운드.
- **릴리스 리포트/태그** — `reports/v1_0_beta_release_report.md` 갱신 + v1.0 태그.

## 보류 (선택)
- v0.97 그라디언트 평탄화(낮음). v0.98 포커스 복원(닫을 때). `reports/qa/v0_98_block2_keyboard_dismiss_run.md` 후속.

## 진행 원칙
1. 블록당 게이트 그린 + visual/additive(simulation.ts/types.ts/data 빈 diff) + 실서버 스모크 통과 후에만 커밋. 트렁크 기반.
2. Lore protocol 커밋(`Co-Authored-By: OpenAI Codex` + `Co-Authored-By: Claude Opus 4.8 (1M context)`).
3. 블록 닫을 때 `feature_list.json`/`progress.md` 갱신.
4. 스모크는 `reports/qa/SMOKE_INDEX.md` 참조(Claude 실행).
