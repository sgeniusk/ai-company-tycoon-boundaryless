# v1.0 모바일 첫 화면 hard reset QA

작성일: 2026-06-05

## 배경

사용자 피드백: low-chrome 재작업 후에도 화면이 더 엉망으로 보였다. 원인은 남아 있는 상단 자원 칩, 목표/꾸미기/헬퍼 칩, 작업 비트 라벨, 상단 `메뉴` 버튼이 여전히 첫 화면을 UI 편집 화면처럼 만들었기 때문이다.

## 변경

- 모바일 첫 화면에서 상단 브랜드/자원 strip을 숨겼다.
- 목표 칩, 꾸미기 칩, 헬퍼 튜토리얼을 기본 첫 화면에서 숨겼다.
- 작업 비트 라벨, 오브젝트 라벨, 액터 이름/상태 라벨, task link layer를 숨겼다.
- `더보기`는 상단 고정 버튼이 아니라 하단 독의 오른쪽 `메뉴` 버튼으로 옮겼다.
- 하단 독은 `운영 / 회사 / 성장 / 메뉴`만 남기고, 나머지 정보는 drawer 안으로 접었다.
- 전광판은 250x42 작은 인월드 오브젝트로 유지했다.

## 390x844 렌더 확인

- `documentElement.scrollWidth`: 390
- `office-scoreboard`: x=70, y=34, w=250, h=42
- `mobile-menu-dock`: x=10, y=772, w=370, right=380
- `mobile-top-more-button`: 하단 독 안에서 x=307, w=67, right=373
- `command-row`: x=156, w=78
- visible helper/goal/decor/workbeat/task-link/labels: 0
- dock text: `운영/회사/성장/메뉴`

## 스크린샷

- `reports/qa/screenshots/v1_0_mobile_hard_reset_after_feedback_2.png`

## 검증

- `npm test -- src/ui/layout-contract.test.ts -t "standalone mobile first screen" --maxWorkers=1`: 1 passed / 139 skipped.
- `npm test -- src/ui/layout-contract.test.ts -t "v1.0" --maxWorkers=1`: 15 passed / 125 skipped.
- `npm run build`: passed.
- `npm run harness:gate`: passed, 54 files / 665 tests, data validation passed, beta readiness 15/15, route coverage 40/40, production build passed.
