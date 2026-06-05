# v1.0 — Claude Design 모바일 첫 화면 목업 반영 계획

작성일: 2026-06-05
작성자: Claude Code (편집장 / 하네스·기획·검증)
근거: 사용자 확정 Claude Design 핸드오프(`ai tycoon-handoff.tar.gz`, claude.ai/design). 상위 계획 `reports/v1_0_completion_plan.md`, 승인 IA `reports/v1_0_menu_uiux_design_review.md`.
역할 분담(사용자 지시): 하네스 엔지니어링·파생 계약·검증·커밋은 Claude Code, 잡다한 TSX/CSS 구현은 Codex CLI.

## 한 줄 상태

오피스-우선 재설계의 셸은 이미 완료됐고, 오늘(2026-06-05) 모바일 첫 화면을 초미니멀로 하드리셋했다. 확정된 Claude Design 목업은 같은 방향의 **정돈된 상위 버전**이라 이를 정본으로 삼아 수렴시킨다. 모든 블록 visual/additive(simulation.ts·types.ts·data·save 불변).

## 디자인 목업 요약 (확정)

작은 차고 AI 회사의 모바일 첫 화면. 오피스가 주인공, 메뉴는 조용하게.
- **오피스 = 주인공** — HUD·내비는 패널이 아니라 씬 위에 뜨는 칩, 상·하단 그라데이션으로 가독성만.
- **11버튼 → 3단 우선순위** — 코어 4탭(운영·회사·성장·시장) + 상황형 다음 행동 + 더보기 드로어. 보조 7메뉴는 그룹 드로어(관리 / 연구·상점 / 정보·기록), 열려도 오피스 42% 스크림으로 생존.
- **LED 전광판** — `전국 AI 기업 랭킹 #128 / 2,140사 ▲12` + LIVE 점멸 + 흐르는 마퀴. 경쟁 욕구를 자극하는 핵심 훅.
- **자원** — 코어 3개만 상단 고정, 나머지는 `＋` 트레이.
- 기본 내비 변형 B(중앙 FAB·대칭 2|FAB|2), 픽셀 폰트, 다크그린·크림·골드 토큰.

## 하네스 결정 (잠금)

| 항목 | 결정 | 비고 |
|------|------|------|
| 첫 화면 정본 | **디자인 목업** | 오늘의 하드리셋이 숨긴 3대 자원 HUD·목표 리본·꾸미기를 목업의 정돈된 형태로 복원 |
| 전광판 데이터 | **파생 실데이터** | 전국 랭킹·마퀴를 시장점유율·라이벌·가이던스·캘린더에서 파생(derive-only) |
| 내비 범위 | **B안 + 시장 탭** | 변형 B만 구현, 시장을 4번째 코어 탭 복원, 더보기는 우상단 칩. A/C는 구조만 분리 |
| 자원 매핑 | 코어 3 = 자금(cash)·이용자(users)·연산력(compute) | 목업의 '인사이트'는 게임 실경제 3종으로 매핑. 통찰(founderInsight·메타)·data·talent·trust·hype·automation·덱은 `＋` 트레이 |
| 오피스 아트 | **실제 아이소메트릭 스프라이트 유지** | 목업의 CSS 사각형 오피스는 플레이스홀더. 게임은 이미 실아트 보유 → 다운그레이드 금지 |
| 범위 | **모바일 우선** | 이번 패스는 모바일 첫 화면. 데스크톱 확장은 후속 블록 |

## 파생 계약 (편집장 완료 · 스파인)

`src/ui/scoreboard-ranking.ts` + `src/ui/scoreboard-ranking.test.ts` (9 tests green, derive-only, 상태 불변).
- `deriveNationalRanking(state) → { rank, total, delta, marketShare }` — 점유율·로컬 순위를 standing(0–1)으로 합쳐 감마 곡선으로 전국 순위 파생. total은 캠페인 월에 따라 천천히 성장. delta는 `marketShareHistory`에서 전월 대비.
- `buildScoreboardMarquee(state) → string[]` — 라이벌 추월 격차(계단) · 이번 달 목표(guidance) · 다음 행동 예고 · 글로벌 진출 D-day · 전국 점유율.
- 이 모듈이 Codex 시각 구현의 데이터 계약이다. Codex는 import 해 렌더만.

## Codex 블록 큐

각 블록 — Codex 가 TSX/CSS + 단위 테스트 + build, 편집장이 실서버 브라우저 스모크·스크린샷·게이트·커밋. **Codex 에 dev server/브라우저 금지**(샌드박스 행). `phase: starting` 멈춤 시 편집장이 취소·직접.

### CD-1 — LED 전국 랭킹 전광판 (`reports/codex-handoff/v1_0_cd1_led_ranking.md`)
기존 `.office-scoreboard`(제품/지표)를 파생 모듈의 랭킹 보드로 재배치. `#rank / total사 ▲delta` + LIVE 점멸 + 마퀴, 픽셀 도트매트릭스·글로우는 기존 자산 재사용, reduced-motion 가드. 첫 블록(파생 계약 파이프라인 검증).

### CD-2 — 코어 3 자원 HUD + ＋트레이 + 목표 리본 + 꾸미기
모바일 상단에 레벨 크레스트 + 코어 3 자원 칩(아이콘 우선·델타·임계 강조) + `＋` 트레이(보조 자원). 목표 리본(이번 달 목표, guidance) 좌하단, 꾸미기 퀵툴 우상단. 하드리셋이 숨긴 셀렉터를 목업 형태로 복원(스코프 한정).

### CD-3 — 내비 B 확정 + 시장 탭 + 더보기 칩
하단 도크 대칭 2|FAB|2 — 운영·회사 | 다음 행동 FAB | 성장·시장. 시장 코어 탭 복원, 더보기 우상단 칩 이동, FAB는 상황형(기존 nextAction* + 아이콘 맵), 펄스 링. 드로어 그룹은 기존 일치. 픽셀 토큰·reduced-motion.

## 진행 원칙

1. 블록당 게이트 그린 + additive(simulation/types/data/save 빈 diff) + 실서버 스모크 통과 후에만 커밋. 트렁크 기반.
2. Lore 커밋(`Co-Authored-By: OpenAI Codex` + `Co-Authored-By: Claude Opus 4.8 (1M context)`).
3. 블록 닫을 때 `feature_list.json`·`progress.md` 갱신, 스크린샷은 `reports/qa/`.
4. 기존 계약 회귀 — `check-v096-first-screen`(officeFrac·overflow), `check-v1_0-menu-popup`, layout-contract.

## RC 트랙 (USER-GATED, Codex 아님)

프로덕션 승격(`vercel deploy --prod`) · 최종 소스 아트(`npm run qa:asset-handoff`) · 실사용자 블라인드 · 릴리스 태그. 블록 CD-1~3 + 사용자 검토 후.
