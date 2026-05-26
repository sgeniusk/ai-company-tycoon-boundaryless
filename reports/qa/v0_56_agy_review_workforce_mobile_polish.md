# v0.56 AGY Review Follow-up — Workforce/Mobile Polish

Status: P1 후보 일부 반영 / 실제 사람 블라인드 테스트 아님
작성일: 2026-05-23

## 목적

AGY 에이전트 QA 리뷰(`reports/playtests/v0_56_agy_agent_playtest_review.md`)에서 제안한 P1 후보 중, 실제 5인 세션 전에 코드로 안전하게 잠글 수 있는 인력 조합 패널 가독성을 보강했다.

이 리포트는 실제 사람 블라인드 테스트 결과가 아니며, `reports/playtests/v0_56_blind_playtest_session_01.md`부터 `session_05.md`까지는 계속 `Status: 예정` 상태다.

## 반영 내용

- `getWorkforceMixSummary()`의 각 행에 짧은 `roleBadge`와 `metricLabel`을 추가했다.
- `WorkforceMixPanel`은 사람/AI/로봇을 긴 설명만으로 보여주지 않고, 역할 배지와 핵심 수치를 함께 보여준다.
- 모바일 520px 이하에서는 인력 행을 `역할 배지` 영역과 `상태/수치/효과` 영역으로 나눠 줄바꿈 밀도를 낮췄다.
- 최종 그래픽 에셋 게이트는 변경하지 않았다.

## 검증

- `npm test -- src/game/blind-playtest-records.test.ts src/game/simulation.test.ts src/ui/layout-contract.test.ts`
  - 통과: 3 files / 98 tests
- `npm run qa:blind-readiness`
  - 통과: Ready to send yes, Sessions untouched yes, Real sessions 0/5, Art gate `대기`
- `npm run qa:asset-handoff`
  - 통과: Final art intake `대기`, Send status `AGY 발송 금지`
- `npm run qa:office-visuals:screenshots`
  - 샌드박스 내부 1차 실행은 headless Chrome 캡처 실패
  - 외부 승인 실행 통과: desktop 1366x768, mobile 390x844 캡처 생성
- `npm run harness:gate`
  - 통과: 43 files / 364 tests, data validation, production build

## 남은 관찰 항목

- 실제 5인 세션에서 `인력 조합` 패널을 보고 사람 직원, AI 에이전트, 로봇 인력의 차이를 설명할 수 있는지 확인한다.
- 모바일 실제 터치 흐름에서 하단 버튼과 정보 패널 간 오인 클릭이 있는지 확인한다.
- 원격 테스트 URL은 실제 배포/터널링 채널이 정해진 뒤 요청 패킷과 동기화한다.
