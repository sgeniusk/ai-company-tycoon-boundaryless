# v0.34.9-alpha 제작 보고서 — 직원 사건 드라마

작성일: 2026-05-18

## 목표

직원 성장, 케어, 전문화, 채용 브랜드가 들어갔지만 아직 인사 리스크가 “사건”처럼 느껴지는 순간은 약했다. 이번 패스의 목표는 핵심 인재가 지치거나, 경쟁사에게 스카우트될 위험이 생기거나, 계약 불만이 쌓일 때 플레이어가 바로 알아차리고 대응하도록 만드는 것이다.

## 이번 구현

- `getStaffIncidentBriefs()`를 추가했다.
- 직원의 체력, 레벨, 충성도, 채용 방식, 연봉 배율을 바탕으로 사건 후보를 만든다.
- 사건 유형은 `번아웃`, `경쟁사 스카우트 제안`, `계약 불만`이다.
- 사건은 `warning`과 `critical` 심각도를 가진다.
- 각 사건에는 트리거 문구와 권장 액션을 붙였다.
- 에이전트 콘솔 상단에 `인사 사건` 패널을 추가했다.
- 사건 카드에서 가능한 경우 `휴식` 또는 `연봉 협상`을 바로 실행할 수 있다.
- 브라우저 QA용 `staff-incidents` 시나리오를 추가했다.

## 하네스 에이전트 검토

- Executive Producer Agent: P2 해결. 직원 운영이 단순 목록에서 월간 사건 관리로 한 단계 발전했다.
- Game Designer Agent: P1 해결. 핵심 인재를 키울수록 스카우트 리스크가 커져 장기 육성에 긴장이 생긴다.
- Systems Architect Agent: P2 양호. 사건 계산은 `getStaffIncidentBriefs()` 하나로 분리했고 UI는 읽기만 한다.
- QA Agent: P1 해결. 번아웃, 스카우트, 계약 불만을 각각 테스트했고 재현용 QA 시나리오도 추가했다.
- Balance Agent: P2 관찰. 현재 사건은 경고/액션 유도 중심이며, 다음 패스에서 실제 선택 결과와 장기 비용을 조정해야 한다.
- UX Agent: P2 해결. 인사 사건이 에이전트 메뉴 상단에 먼저 떠서 숨은 리스크를 놓칠 가능성이 줄었다.
- Retention / LTV Agent: P2 양호. 직원에게 이름 붙은 문제가 생기면서 장기 애착과 관리 동기가 생긴다.
- Solo Dev Scope Agent: P2 양호. 기존 직원 데이터와 케어 액션을 재사용해 새 대형 시스템 없이 체감만 올렸다.

## 남은 작업

- 인사 사건을 선택형 팝업으로 확장.
- 스카우트 제안에 경쟁사별 성향과 제안 금액을 붙이기.
- 번아웃이 프로젝트 품질/일정에 미치는 단기 페널티 조정.
- 사건 해결 결과를 타임라인과 공유 가능한 순간 카드로 연결.

## 최종 검증 기록

- `npm test -- src/game/staff-career.test.ts` 통과, 1 file / 17 tests
- `npm test -- src/ui/layout-contract.test.ts` 통과, 1 file / 25 tests
- `npm test -- src/game/qa-scenarios.test.ts` 통과, 1 file / 30 tests
- `npm test -- src/game/staff-career.test.ts src/game/qa-scenarios.test.ts src/ui/layout-contract.test.ts` 통과, 3 files / 72 tests
- `npm run harness:gate` 통과, 38 files / 259 tests
- 데이터 검증 통과
- 프로덕션 빌드 통과
- Headless Chrome QA: `http://127.0.0.1:5196/?scenario=staff-incidents&menu=agents`에서 인사 사건 패널 1개, 사건 카드 3개, 콘솔 오류 0건, 모바일 가로 오버플로 없음 확인
- QA 관찰 텍스트: `인사 사건 3건 감지`, `스카우트 제안`, `번아웃 위험`, `계약 불만`
- 스크린샷: `/tmp/ai-company-v0349-staff-incidents-desktop.png`, `/tmp/ai-company-v0349-staff-incidents-mobile.png`
