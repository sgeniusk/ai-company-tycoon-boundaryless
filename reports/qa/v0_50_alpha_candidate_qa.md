# QA Report — v0.50 Alpha Candidate

작성일: 2026-05-20

## 범위

주요 QA route:

- `http://127.0.0.1:5201/?scenario=persona20`
- `http://127.0.0.1:5201/?scenario=office-visuals`

`persona20`은 20인 페르소나 재검증 결과와 P0/P1 상태를 회사 기록 메뉴에서 확인한다. `office-visuals`는 v0.49 이벤트 리액션과 고밀도 사무실 화면이 그대로 유지되는지 보는 시각 QA 진입점이다.

## 기대 확인

- QA pill says `v0.50 알파 후보 20인 페르소나 QA`.
- Timeline starts with `v0.50 20인 페르소나`.
- Timeline includes `P0/P1: 없음`.
- Timeline includes `첫 30초: 사무실 판타지`, `첫 30초: 이번 달 목표`, `첫 30초: 다음 행동`.
- Timeline does not include the stale active blocker `우측 보조 패널`.
- `office-visuals` still exposes office event reactions from v0.49.

## 검증 Evidence

- `npm test -- src/game/persona-playtest.test.ts src/game/qa-scenarios.test.ts`
  - Result: Passed
  - Coverage: 2 files / 36 tests
- `npm run harness:gate`
  - Result: Passed
  - Coverage: 40 test files / 294 tests, data validation passed, production build passed
- `curl -I 'http://127.0.0.1:5201/?scenario=persona20'`
  - Result: Passed, 200 OK
- `curl -I 'http://127.0.0.1:5201/?scenario=office-visuals'`
  - Result: Passed, 200 OK

## 잔여 리스크

- Browser screenshot capture는 아직 자동화 도구로 재실행하지 않았다.
- 캐릭터 포즈는 여전히 idle/work row를 재사용한다. v0.51에서 cheer/alert/card-use row를 추가하는 것이 자연스러운 다음 작업이다.
