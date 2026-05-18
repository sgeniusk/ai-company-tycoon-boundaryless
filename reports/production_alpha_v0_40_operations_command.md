# v0.40-alpha 제작 보고서 — 회사 운영 완성축 1차

작성일: 2026-05-19

## 목표

0.4의 목표는 “게임 화면은 그럴듯한데 무엇을 해야 할지 모르는 상태”를 줄이는 것이다. 이번 버전은 회사 운영을 제품 출시만큼 중요한 선택지로 만들기 위해 월간 운영 의제를 추가했다.

## 이번 구현

- `getOperationsCommandPlan()`을 추가했다.
- 현금 흐름, 인사 사건, 개발 프로젝트, 다음 사무실 구획, 경쟁사 압박을 우선순위 카드로 계산한다.
- 사무실 플레이필드에 `운영 의제` 패널을 추가했다.
- 각 의제 카드는 관련 메뉴로 바로 이동한다.
- `operations` QA 시나리오를 추가했다.
- 복지 라운지가 켜져 있으면 미해결 인사 후폭풍의 직원 손실과 프로젝트 손실을 완화한다.
- 로봇 고용 베이가 켜져 있으면 경력 채용/헤드헌터 후보 풀에서 로봇 후보가 더 잘 보인다.

## 하네스 에이전트 검토

- Executive Producer Agent: P1 해결. v0.40은 “회사 운영 완성축”이라는 목표에 맞게 실제 플레이 우선순위를 첫 화면에 올렸다.
- Game Designer Agent: P1 해결. 공간 구획이 단순 보너스가 아니라 인사/채용 리스크에 연결됐다.
- Systems Architect Agent: P1 해결. 운영 의제는 `GameState`를 읽는 순수 계산 함수로 분리했고, UI는 결과만 렌더링한다.
- QA Agent: P1 해결. 운영 의제, 복지 완충, 로봇 채용, QA 시나리오, 레이아웃 계약을 테스트로 고정했다.
- Balance Agent: P2 관찰. 복지 라운지는 위험을 지우지 않고 손실만 줄인다. 장기 캠페인에서는 후폭풍 완충률을 더 조정할 수 있다.
- UX Agent: P1 해결. 플레이어가 이번 달 해야 할 일을 사무실 화면에서 바로 읽고 메뉴로 이동할 수 있다.
- Retention / LTV Agent: P2 양호. 다음 구획/다음 고용/다음 제품 완주가 복귀 목표로 남는다.
- Shareability Agent: P2 양호. “긴급 운영 회의”, “로봇 고용 베이”, “복지 라운지 완충”이 스크린샷 문구로 남는다.
- Solo Dev Scope Agent: P1 해결. 별도 복잡한 운영 UI 대신 계산형 의제 패널로 범위를 작게 유지했다.

## 검증 기록

- `npm test -- src/game/operations-command.test.ts src/game/staff-career.test.ts src/game/recruitment.test.ts src/game/qa-scenarios.test.ts src/ui/layout-contract.test.ts` 통과, 5 files / 99 tests
- `npm run harness:gate` 통과, 39 files / 281 tests, 데이터 검증 통과, 프로덕션 빌드 통과
- Browser QA: `http://127.0.0.1:5201/?scenario=operations`에서 운영 의제 패널 1개, 의제 카드 3개, 모바일 폭 510px 기준 표시 카드 2개, 콘솔 오류 0건, 가로 오버플로 없음 확인
- 스크린샷 캡처는 Codex in-app browser의 CDP `Page.captureScreenshot` 타임아웃으로 저장하지 못했다. DOM/레이아웃 메트릭 QA는 통과했다.

## 남은 작업

- 전체 하네스와 브라우저 QA로 v0.40 화면을 최종 확인한다.
- 운영 의제 선택 결과를 짧은 팝업/연출로 보여준다.
- 20인 페르소나 테스트를 다시 돌려 첫 30초 명확성을 재검증한다.
