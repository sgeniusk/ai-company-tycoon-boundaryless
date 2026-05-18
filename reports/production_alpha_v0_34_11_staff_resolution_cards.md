# v0.34.11-alpha 제작 보고서 — 인사 대응 결과 카드

작성일: 2026-05-18

## 목표

v0.34.10에서 인사 사건 선택지는 생겼지만, 선택 후의 결과가 화면에 오래 남는 느낌은 약했다. 이번 목표는 인사 대응을 단순 상태 변경이 아니라 “회사 안에서 일어난 사건”으로 기록하고, 에이전트 콘솔과 회사 기록 양쪽에서 다시 볼 수 있게 만드는 것이다.

## 이번 구현

- `GameState`에 `recentStaffIncidentResolutions`를 추가했다.
- `resolveStaffIncident()`가 대응 결과 기록을 생성해 최신순으로 보관한다.
- `getRecentStaffIncidentResolutionLog()`를 추가해 최근 기록을 3개까지 가져온다.
- 에이전트 콘솔에 `최근 인사 대응` 패널과 `staff-resolution-result-card`를 추가했다.
- 회사 기록의 공유 가능한 순간 카드에 `staff` 타입을 추가했다.
- `staff-resolution` QA 시나리오를 추가해 결과 카드가 떠 있는 상태를 바로 열 수 있게 했다.
- 세이브 버전을 11로 올리고, 저장 데이터 복구에서 대응 기록을 안전하게 정리한다.

## 하네스 에이전트 검토

- Executive Producer Agent: P2 해결. v0.34.10의 선택 결과가 다음 화면에서도 보이므로 작업 단위가 더 완결적으로 느껴진다.
- Game Designer Agent: P2 양호. 인사 대응이 비용/효과뿐 아니라 회사 이야기로 남아 직원 애착을 강화한다.
- Systems Architect Agent: P2 양호. 결과 기록은 GameState에 있고, UI와 공유 순간 카드는 같은 기록을 읽는다.
- QA Agent: P1 해결. 결과 기록 생성, 최신순 제한, QA 시나리오, UI 계약, 공유 순간을 테스트로 고정했다.
- Balance Agent: P3 관찰. 이번 변경은 표시/기록 중심이므로 수치 밸런스 영향은 낮다.
- UX Agent: P2 해결. 선택 직후 결과가 에이전트 메뉴 상단에 남아 플레이어가 방금 한 결정을 놓치지 않는다.
- Retention / LTV Agent: P2 양호. 키운 직원의 사건 대응 기록은 장기 플레이의 작은 서사 자산이 된다.
- Shareability Agent: P2 해결. 회사 기록 하이라이트에 인사 사건이 들어가 “우리 회사에 이런 일이 있었다”는 스크린샷 소재가 늘었다.
- Solo Dev Scope Agent: P2 양호. 별도 모달 시스템 없이 기존 콘솔/기록 구조를 확장해 구현 부담을 낮췄다.

## 남은 작업

- 대응 결과를 짧은 화면 중앙 팝업 또는 토스트로도 보여주기.
- 스카우트 제안을 특정 경쟁사와 연결해 “누가 빼가려 했는지”를 표시하기.
- 직원 카드에 최근 사건 이력을 1줄로 남기기.
- 20인 페르소나 테스트에서 결과 카드가 실제로 읽히는지 확인하기.

## 최종 검증 기록

- `npm test -- src/game/staff-career.test.ts src/game/shareable-moments.test.ts src/game/qa-scenarios.test.ts src/ui/layout-contract.test.ts` 통과, 4 files / 81 tests
- `npm run harness:gate` 통과, 38 files / 266 tests
- 데이터 검증 통과
- 프로덕션 빌드 통과
- Browser QA: `http://127.0.0.1:5198/?scenario=staff-resolution&menu=agents`에서 최근 인사 대응 패널 1개, 결과 카드 1개, 사건 패널 1개, 콘솔 오류 0건 확인
- 회사 기록 QA: `http://127.0.0.1:5198/?scenario=staff-resolution&menu=log`에서 하이라이트 카드 2개와 인사 사건 공유 카드 문구 확인
- 모바일 QA: 390×844에서 결과 카드 1개, 하단 탭 표시, 가로 오버플로 없음 확인
- QA 관찰 텍스트: `최근 인사 대응`, `회복일 지정`, `프로젝트 배치 해제`, `인사 사건`
- 스크린샷: `/tmp/ai-company-v03411-staff-resolution-desktop.png`, `/tmp/ai-company-v03411-staff-resolution-log-desktop.png`, `/tmp/ai-company-v03411-staff-resolution-mobile.png`
