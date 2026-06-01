# v0.88 Menu Cabinet Visual Polish QA

## Goal

- 우측 경영 메뉴가 웹 대시보드 패널처럼 분리되어 보이지 않도록 픽셀 게임 캐비닛/스크린으로 스킨한다.
- 카이로소프트 계열 경영 게임처럼 사무실 전경의 코믹한 움직임이 유지되는지 함께 검증한다.
- 게임 규칙, 저장 필드, 월간 tick은 변경하지 않는다.

## Changes

- `src/App.tsx`
  - 경영 메뉴 쉘에 `pixel-menu-cabinet` 클래스를 추가했다.
  - 메뉴 콘텐츠 패널에 `pixel-menu-screen` 클래스를 추가했다.
- `src/App.css`
  - 메뉴 캐비닛 상단 상태등, 메뉴 버튼 LED, 스크린 스캔라인을 추가했다.
  - 모바일에서는 캐비닛 상단 레일을 숨겨 하단 메뉴 높이를 보존한다.
- `src/ui/layout-contract.test.ts`
  - v0.88 레이아웃 계약 테스트를 추가해 마크업, 픽셀 렌더링, 상태등, 스크린 오버레이, 모바일 안전장치를 고정했다.

## RED / GREEN

- RED: `npm test -- src/ui/layout-contract.test.ts`
  - Expected failure: `className="menu-layout pixel-menu-cabinet"` not found.
- GREEN: `npm test -- src/ui/layout-contract.test.ts`
  - PASS: 1 file / 112 tests.

## Browser Smoke

Command:

```sh
/Users/taewookkim/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node /private/tmp/check-v088-menu-cabinet.mjs
```

Local URL:

- `http://127.0.0.1:5222/?scenario=office-visuals`

Screenshots:

- `reports/qa/screenshots/v0_88_menu_cabinet_desktop.png`
- `reports/qa/screenshots/v0_88_menu_cabinet_mobile.png`

Key metrics:

- Desktop visible menu buttons: 8
- Mobile visible menu buttons: 5
- Desktop/mobile document width overflow: 0
- Desktop/mobile menu overlap with office playfield: false
- Desktop active menu LED color: `rgb(115, 224, 140)`
- Desktop actor count: 6
- Desktop office object count: 10
- Desktop workbeat count: 8
- Actor animation includes `pixel-actor-work`
- Workbeat animations all include `office-workbeat-pop`

## Full Gate

Command:

```sh
npm run harness:gate < /dev/null
```

Result:

- `npm test -- --maxWorkers=1`: PASS, 53 files / 635 tests
- `npm run validate:data`: PASS
- `npm run qa:beta-readiness:check`: PASS, 15/15 readiness checks
- `npm run build`: PASS

Known warning:

- Vite chunk size warning remains the existing >500 kB production bundle warning.

## Notes

- This is visual/UI-only polish. No new persisted state, no simulation tick changes, no data balance changes.
- The smoke script explicitly checks both pixel menu consistency and office comic motion continuity.
