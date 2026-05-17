# v0.34.5-alpha 제작 보고서 — 직원 케어 액션과 실제 퇴사 리스크

작성일: 2026-05-18

## 목표

v0.34.4에서 직원 성장과 충성도 경고가 들어갔지만, 플레이어가 경고에 대응할 선택지는 부족했다. 이번 패스는 충성도 경고를 실제 운영 선택으로 바꾸고, 방치했을 때 직원이 회사를 떠나는 결과까지 연결하는 것이다.

## 이번 구현

- 직원 카드에 `휴식`과 `연봉 협상` 액션을 추가했다.
- 휴식은 현금을 쓰고 에너지와 충성도를 회복한다.
- 프로젝트에 투입 중인 직원은 휴식을 사용할 수 없어서, 개발 속도와 직원 보호 사이에 선택이 생긴다.
- 연봉 협상은 더 큰 현금을 쓰고 충성도를 크게 회복하지만, 이후 월 유지비와 연봉 배율이 오른다.
- 충성도가 0까지 떨어진 직원은 월 넘김 때 실제로 퇴사한다.
- 퇴사한 직원은 고용 목록에서 제거되고, 인재 자원이 감소하며, 진행 중인 프로젝트 배치에서도 자동 제거된다.
- 월말 제품 개발 로그가 이전 인사 타임라인을 덮어쓰던 문제를 수정해 퇴사/인사 경고가 플레이어에게 보이도록 했다.

## 하네스 에이전트 검토

- Executive Producer Agent: P1 해결. “경고를 봤다”에서 끝나지 않고 플레이어가 바로 대응할 수 있어 다음 행동이 더 명확해졌다.
- Game Designer Agent: P1 해결. 휴식은 개발 지연을, 연봉 협상은 고정비 상승을 만들며 회사 운영의 압박을 강화한다.
- Systems Architect Agent: P1 해결. 케어 체크와 실행을 `getAgentRestCheck`, `restAgent`, `getAgentSalaryNegotiationCheck`, `negotiateAgentSalary`로 분리했다.
- QA Agent: P1 해결. 휴식 가능/불가, 연봉 협상 비용, 충성도 0 퇴사, 프로젝트 배치 정리를 단위 테스트로 고정했다.
- Balance Agent: P2 관찰. 연봉 협상 비용과 유지비 상승폭은 장기 런에서 재검증이 필요하다. 현재는 “응급 처치지만 반복 남용은 부담” 쪽으로 잡았다.
- UX Agent: P1 해결. 에이전트 카드 안에서 상태 확인과 즉시 대응이 같은 위치에 놓였다.
- Retention / LTV Agent: P2 양호. 직원 레벨과 퇴사 리스크가 붙으면서 특정 직원을 오래 키우고 지키는 애착 루프가 생겼다.
- Solo Dev Scope Agent: P2 양호. 별도 이벤트 시스템을 새로 만들지 않고 기존 월 넘김, 카드 UI, 타임라인을 재사용했다.

## 남은 작업

- 직원별 성격, 선호 아이템, 성장 방향을 붙여 장기 애착을 강화한다.
- 충성도 0 즉시 퇴사 외에 “최후 협상 팝업”이나 “경쟁사 스카우트” 사건을 검토한다.
- 휴식/연봉 버튼을 카드 높이를 늘리지 않는 아이콘형 컨트롤로 더 압축한다.
- 20인 페르소나 테스트에서 에이전트 카드 정보량과 버튼 이해도를 재검증한다.

## 현재 검증 기록

- `npm test -- src/game/staff-career.test.ts` 통과, 1 file / 8 tests
- `npm test -- src/ui/layout-contract.test.ts` 통과, 1 file / 25 tests

## 최종 검증 기록

- `npm test -- src/game/staff-career.test.ts src/ui/layout-contract.test.ts` 통과, 2 files / 33 tests
- `npm test -- src/game/staff-career.test.ts src/game/simulation.test.ts src/ui/layout-contract.test.ts` 통과, 3 files / 62 tests
- `npm run harness:gate` 통과, 38 files / 247 tests
- 데이터 검증 통과
- 프로덕션 빌드 통과
- Headless Chrome QA: `http://127.0.0.1:5192/?scenario=staffing&menu=agents`에서 케어 액션 2세트, 경험치 바 2개, 충성도 배지 2개, 콘솔 오류 0건, 모바일 가로 오버플로 없음 확인
- 스크린샷: `/tmp/ai-company-v0345-staff-care-desktop.png`, `/tmp/ai-company-v0345-staff-care-mobile.png`
