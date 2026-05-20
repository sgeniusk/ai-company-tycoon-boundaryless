# QA Report — v0.51 Event Pose Sheets

작성일: 2026-05-20

## 범위

주요 QA route:

- `http://127.0.0.1:5201/?scenario=office-visuals`

이번 QA는 사무실 이벤트 리액션이 말풍선뿐 아니라 액터 포즈 row까지 바꾸는지 확인한다.

## 기대 확인

- QA pill says `v0.51 사무실 이벤트 포즈 QA`.
- `asset_manifest.json` has `version: 0.51-alpha`.
- `agents_v051_event_poses` points to `v051-agents-event-poses.png`.
- Priority agent sprites expose `idle`, `work`, `card_use`, `cheer`, and `alert`.
- `office-visuals` scene plan includes a `card_use` reaction from `프롬프트 스프린트`.
- `office-visuals` scene plan includes at least one actor with `reactionPose: card_use`.
- `office-visuals` scene plan includes at least one actor with `reactionPose: alert`.
- Actor focus and direct care controls remain clickable.
- Reduced-motion users keep actor animation disabled.

## 검증 Evidence

- `npm run assets:v051`
  - Result: Passed
  - Output: `v051-agents-event-poses.png`, 576×4800 PNG
- `npm test -- src/game/asset-manifest.test.ts src/game/office-scene.test.ts src/game/qa-scenarios.test.ts src/ui/layout-contract.test.ts`
  - Result: Passed
  - Coverage: 4 files / 78 tests
- `npm run harness:gate`
  - Result: Passed
  - Coverage: 40 test files / 296 tests, data validation passed, production build passed
- `curl -I 'http://127.0.0.1:5201/?scenario=office-visuals'`
  - Result: Passed, 200 OK
- `curl -I 'http://127.0.0.1:5201/assets/sprites/v051-agents-event-poses.png'`
  - Result: Passed, 200 OK

## 잔여 리스크

- 새 포즈 시트는 코드 생성 픽셀 초안이다. 사용자가 원했던 더 고해상도 픽셀아트 감각으로 가려면 실제 이미지 생성 원본 시트 교체가 다음 단계다.
- 출시 `cheer` 포즈는 계약과 매핑이 준비됐지만, 이번 기본 `office-visuals`에서는 카드 사용과 경보 포즈가 주 검수 대상이다.
- Browser screenshot capture는 이번 세션에 노출된 Browser 도구가 없고 Node REPL의 `playwright` 모듈도 없어 재실행하지 못했다.
