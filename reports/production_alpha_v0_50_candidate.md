# 제작 보고서 — v0.50 Alpha Candidate

작성일: 2026-05-20

## 요약

v0.50은 최신 사무실 화면을 알파 후보로 묶는 정리 패스다. v0.49의 사무실 이벤트 리액션을 유지한 상태에서 20인 페르소나 하네스를 다시 돌렸고, 첫 화면이 `사무실 판타지`, `이번 달 목표`, `다음 행동`을 30초 안에 전달하는지 로그 QA로 고정했다.

## 구현 내용

- `runPersonaPlaytestReview()`의 대상 버전을 `v0.50-alpha`로 갱신했다.
- 20인 페르소나 리포트에 `unresolvedP0P1Findings`와 `firstScreenSignals`를 추가했다.
- `persona20` QA 시나리오가 `v0.50`, `P0/P1: 없음`, 첫 30초 화면 신호를 회사 기록 로그에 표시한다.
- v0.21의 우측 보조 패널 압축 우선순위를 현재 알파 후보 블로커에서 제거했다.
- 다음 우선순위를 이벤트 포즈 시트 확장, 최신 화면 재검증 기록 유지, 모바일/데스크톱 스크린샷 재검증으로 정리했다.

## 20인 판정

- 대상: 20명
- 성비 슬롯: 남성 10명 / 여성 10명
- 결과: 76점 / 조건부 통과
- 미해결 P0/P1: 0건
- 남은 이슈: P2/P3 시각 연출 확장과 스크린샷 재검증

## Agent Review

- Executive Producer: Pass. v0.50은 큰 신규 범위보다 알파 후보의 기준선을 잠그는 패스다.
- Game Designer: Pass with follow-up. 첫 화면 판타지는 읽히지만, 캐릭터 포즈 row가 추가되면 이벤트 체감이 더 좋아진다.
- Systems Architect: Pass. 페르소나 QA 결과는 typed report와 QA scenario timeline으로 노출된다.
- QA Agent: Pass. 좁은 테스트, 전체 하네스 게이트, 데이터 검증, 프로덕션 빌드, QA URL 응답이 통과했다.
- UX Agent: Pass. 첫 30초 신호를 명시적으로 추적한다.
- Solo Dev Scope Agent: Pass. v0.51 포즈 시트 확장을 별도 레일로 분리했다.

## 검증

- `npm test -- src/game/persona-playtest.test.ts src/game/qa-scenarios.test.ts`: Passed, 2 files / 36 tests.
- `npm run harness:gate`: Passed, 40 test files / 294 tests, data validation passed, production build passed.
- `curl -I 'http://127.0.0.1:5201/?scenario=persona20'`: Passed, 200 OK.
- `curl -I 'http://127.0.0.1:5201/?scenario=office-visuals'`: Passed, 200 OK.
