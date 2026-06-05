# v1.0 모바일 게임화면 전광판/말풍선 QA

Date: 2026-06-05

## 요약

사용자 피드백: 모바일 첫 화면에서 standalone mockup의 "게임화면" 느낌이 사라졌고, 메뉴/버튼/패널이 사무실을 덮어 가시성이 떨어짐.

이번 패스에서는 첫 화면을 다음 구조로 고정했다.

- 상단: 인월드 LED 전광판(`office-scoreboard`)
- 하단: 사무실 바닥/캐릭터 플레이필드
- 캐릭터: 클릭 시에만 만화풍 말풍선(`comic-speech-bubble`) 노출
- 모바일 보조 안내: 전체 폭 카드 대신 작은 helper 말풍선으로 축소
- 모바일 중복 HUD: standalone 첫 화면에서는 `launch-screen`, `office-hud` 중복 오버레이 숨김

## 구현 범위

- `src/components/GameChrome.tsx`
  - `office-wall`의 4칸 상태칩을 `office-scoreboard` 전광판으로 교체.
  - 전광판 지표: 시간, 팀, AI, ROBOT, 점유, 신뢰.
  - 기본 직원 포커스 패널 제거. `selectedOfficeActor`가 있을 때만 말풍선 렌더.
  - 액터 클릭은 같은 액터 재클릭 시 말풍선 닫힘.

- `src/App.css`
  - `office-scene`을 상단 전광판 행 + 하단 사무실 행으로 재배치.
  - 모바일 standalone 첫 화면 전용 전광판/사무실 행 높이 지정.
  - `comic-speech-bubble` 꼬리/도트 질감/모바일 위치 계약 추가.
  - helper tutorial을 모바일 first-screen에서 작은 말풍선으로 축소.

- `src/ui/layout-contract.test.ts`
  - 기존 "office-wall 4칸 상태칩" 계약을 "LED scoreboard" 계약으로 갱신.
  - actor click bubble, mobile scoreboard, compact helper 계약 추가.

## 브라우저 확인

In-app browser, 390x844 mobile viewport, `http://127.0.0.1:5201/`.

- 전광판: 370x90, x=10, y=84.
- 사무실 바닥: y=186부터 시작, height=658.
- `launch-screen`: standalone mobile에서 `display: none`.
- `office-hud`: standalone mobile에서 `display: none`.
- 액터 수: 1.
- 액터 좌표 클릭 후:
  - `comic-speech-bubble` 1개.
  - 선택 액터 1개.
  - 말풍선 210x99, x=70, y=523.
  - 말풍선 텍스트: `창업 준비 · 사람 ... 차고 운영 진행 중이에요. 다음 선택을 알려주세요.`

스크린샷:

- `reports/qa/screenshots/v1_0_game_screen_scoreboard_mobile.png`

참고: in-app browser 자체 screenshot API는 `Page.captureScreenshot` 단계에서 2회 타임아웃. 대신 같은 390x844 기본 URL을 headless Chrome으로 캡처했다. DOM/클릭 검증은 in-app browser에서 수행했다.

## 검증

- `npm test -- --run src/ui/layout-contract.test.ts`
  - 1 file passed, 140 tests passed.
- `npm run build`
  - TypeScript + Vite production build passed.
- `npm run qa:office-visuals:screenshots`
  - desktop/mobile PNG 재생성 passed.
- `npm run harness:gate`
  - 54 files / 665 tests passed.
  - data validation passed.
  - beta readiness 15/15, route coverage 40/40.
  - production build passed.

## 남은 판단

사용자 육안 검토 필요:

- 전광판 상단/사무실 하단 구도가 standalone 화면 의도에 충분히 가까운지.
- helper 말풍선이 여전히 방해된다면, 첫 방문에서 자동 표시하지 않고 `도움` 아이콘으로 접는 방향이 다음 개선 후보.
