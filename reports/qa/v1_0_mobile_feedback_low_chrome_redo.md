# v1.0 모바일 첫 화면 피드백 재작업 QA

작성일: 2026-06-05

## 배경

사용자 피드백: 이전 모바일 첫 화면은 버튼과 칩이 게임 화면을 덮고, 아이콘/라벨 가시성이 낮으며, 제공된 standalone 화면의 게임스러운 첫 인상이 충분히 살아나지 않았다.

## 변경

- 모바일 첫 화면 전광판을 정보표가 아니라 50px 높이의 인월드 LED 오브젝트로 축소했다.
- 전광판 지표 셀은 모바일 첫 화면에서 숨기고, 한 줄 headline/detail만 남겼다.
- 상단 브랜드/자원/메뉴/꾸미기/목표 칩을 베이지 버튼 질감에서 어두운 HUD 칩으로 통일했다.
- 상단 자원 칩을 3개 고정폭으로 줄여 `메뉴` 버튼 공간을 확보했다.
- 하단 중앙 다음 행동 FAB와 dock 높이를 줄여 사무실 바닥이 더 많이 보이게 했다.
- 헬퍼 튜토리얼은 본문을 숨기고, 작은 초상+제목+기본 액션만 보이도록 축소했다.

## 390x844 렌더 확인

- `documentElement.scrollWidth`: 390
- `mobile-menu-dock`: x=10, width=370, right=380
- `office-scoreboard`: x=56, y=69, width=278, height=50
- `resource-strip`: x=76, width=238, right=314
- `mobile-top-more-button`: x=328, width=52, right=380
- `command-row`: x=156, width=78, right=234
- Visible overflow elements: 0

## 스크린샷

- `reports/qa/screenshots/v1_0_mobile_redo_after_feedback_3.png`

## 검증

- `npm test -- src/ui/layout-contract.test.ts -t "standalone mobile first screen" --maxWorkers=1`: 1 passed / 139 skipped.
- `npm test -- src/ui/layout-contract.test.ts -t "v1.0" --maxWorkers=1`: 15 passed / 125 skipped.
- `npm run build`: passed, Vite production build completed.
- `npm run harness:gate`: passed, 54 files / 665 tests, data validation passed, beta readiness 15/15, route coverage 40/40, production build passed.

## 남은 판단

이번 패스는 화면을 덮는 영구 UI 면적을 낮추는 RC 폴리시다. 사용자가 현재 방향을 승인하면 RC 트랙의 다음 단계는 production promote, final art handoff, real-human playtest다.
