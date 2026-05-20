# 제작 보고서 — v0.51 Alpha Event Pose Sheets

작성일: 2026-05-20

## 요약

v0.51은 사무실 이벤트 반응을 말풍선에서 캐릭터 몸짓까지 확장한 그래픽 패스다. 기존 idle/work 시트만 쓰던 우선순위 에이전트 5종에 `card_use`, `cheer`, `alert` row를 추가했고, 사무실 계획이 이벤트와 케어 경보를 액터 포즈로 연결한다.

## 구현 내용

- `asset_manifest.json` 버전을 `0.51-alpha`로 올렸다.
- `agents_v051_event_poses` sprite sheet 계약을 추가했다.
- 우선순위 에이전트 5종에 `idle`, `work`, `card_use`, `cheer`, `alert` 3프레임 row를 정의했다.
- `public/assets/sprites/v051-agents-event-poses.png`를 생성했다.
- `OfficeSceneActorStatus`에 `reactionPose`와 `reactionPoseSource`를 추가했다.
- 카드 사용은 작업 중 액터의 `card_use` 포즈로, 제품 출시는 `cheer` 포즈로, 케어/경쟁 경보는 `alert` 포즈로 연결된다.
- `GameChrome`이 actor 전체 상태를 보고 이벤트 포즈 row를 선택한다.
- `office-visuals` QA 시나리오를 v0.51 이벤트 포즈 QA로 갱신했다.

## Agent Review

- Executive Producer: Pass. 그래픽 자산 포함 화면의 다음 부족점이었던 몸짓 반응을 좁은 범위로 해결했다.
- Game Designer: Pass. 카드 사용과 케어 경보가 화면 안 액터의 행동으로 읽힌다.
- Systems Architect: Pass. 포즈 선택은 `GameState`에서 파생된 `OfficeScenePlan`에 머물고 저장 상태를 늘리지 않는다.
- QA Agent: Pass. 좁은 테스트, 전체 하네스, 데이터 검증, 프로덕션 빌드, QA URL, PNG asset 응답이 통과했다.
- UX Agent: Pass. 이벤트 포즈는 기존 actor focus/direct care 클릭 경로를 유지한다.
- Solo Dev Scope Agent: Pass. 실제 AI 원본 시트 교체는 다음 그래픽 퀄리티 패스로 분리했다.

## 검증

- `npm run assets:v051`: Passed, generated `v051-agents-event-poses.png` at 576×4800.
- `npm test -- src/game/asset-manifest.test.ts src/game/office-scene.test.ts src/game/qa-scenarios.test.ts src/ui/layout-contract.test.ts`: Passed, 4 files / 78 tests.
- `npm run harness:gate`: Passed, 40 test files / 296 tests, data validation passed, production build passed.
- `curl -I 'http://127.0.0.1:5201/?scenario=office-visuals'`: Passed, 200 OK.
- `curl -I 'http://127.0.0.1:5201/assets/sprites/v051-agents-event-poses.png'`: Passed, 200 OK.

## 다음 작업

- 실제 AI 생성 원본 시트로 교체한다.
- 시트 프리뷰에서 anchor, 발 위치, 실루엣 drift를 확인한다.
- 출시 `cheer` 포즈가 실제 출시 시나리오에서도 더 자주 노출되도록 launch-impact/office-visuals를 확장한다.
