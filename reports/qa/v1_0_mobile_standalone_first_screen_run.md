# v1.0 Mobile Standalone First-Screen QA

Date: 2026-06-05

## Summary

사용자가 제공한 standalone 모바일 첫 화면 방향을 실제 앱 모바일 첫 화면에 재반영했다. 이전 pass는 기존 top/resource/command/menu chrome을 압축하는 데 그쳤고, standalone mockup의 핵심 구조인 `오피스 풀스크린 + floating HUD + 목표 리본 + 중앙 다음 행동 FAB + 4개 핵심 메뉴 + 상단 더보기 + 그룹 드로어`가 앱에 들어오지 않았다.

## Changes

- 모바일 `app-shell`을 `stage` 단일 grid area로 전환해 오피스가 viewport 전체를 차지하게 했다.
- 상단 브랜드/자원은 작은 floating HUD로 바꾸고, 핵심 자원은 `cash/users/compute` 3개만 노출했다.
- `다음 달` 명령을 하단 중앙 FAB로 배치하고 `다음 행동` 라벨을 추가했다.
- 하단 dock은 `운영/회사/성장/시장` 4개 텍스트 버튼으로 재배치하고, `더보기`는 상단 우측 floating button으로 이동했다.
- 보조 메뉴는 기존 그룹 구조를 유지하되 하단 sheet drawer로 열리게 했다.
- 모바일 첫 화면에서 중복 안내 strip(`alpha-run-focus-strip`, `turn-goal-strip`, `rival-incident-banner`)은 숨기고, 목표 리본/FAB가 해당 역할을 맡도록 정리했다.
- `launch-screen`은 상단 더보기와 겹치지 않게 작은 사무실 LED 패널로 낮춰 배치했다.

## Browser Evidence

URL: `http://127.0.0.1:5201/`
Viewport: `390x844`

- Office scene: `390x844`, visible fraction `1.000`
- Horizontal overflow: `0`
- Resource HUD: `x=88 y=10 w=248 h=34`
- Top more button: `x=315 y=49 w=66 h=32`
- Launch LED: `x=232 y=138 w=148 h=44`, `moreOverlapsLaunch=false`
- Goal ribbon: `x=10 y=209 w=96 h=48`
- Decor chip: `x=325 y=209 w=55 h=34`
- FAB: `x=167 y=748 w=86 h=86`
- Dock: `x=10 y=766 w=370 h=68`
- Hidden duplicate strips: all `display:none`
- Drawer opened from `더보기`: `width=390`, `height=384`, `y=460`, visible items `제품/덱/에이전트/연구/상점/경쟁/기록`

## Verification

- `npm test -- src/ui/layout-contract.test.ts`: 140/140 passed
- `npm run build`: passed
- `npm run harness:gate`: 54 files / 665 tests passed, data validation passed, beta readiness 15/15, route coverage 40/40, production build passed

## Notes

- The standalone HTML was not opened directly in the browser because local file navigation was blocked by the browser security policy. Its embedded React/CSS source was inspected locally, and the extracted layout direction was applied to the live app.
