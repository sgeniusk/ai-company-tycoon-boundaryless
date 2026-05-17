# v0.34.4-alpha 제작 보고서 — 직원 성장과 충성도 경고

작성일: 2026-05-18

## 목표

채용 후보 풀과 계약 방식이 생겼지만, 고용 이후의 사람 관리는 아직 얕았다. 이번 패스는 직원이 월마다 성장하고, 과로와 계약 압박이 이직 위험으로 드러나는 기본 루프를 추가하는 것이다.

## 이번 구현

- 고용 인력에 `경험치`, `충성도`, `근속 개월`을 추가했다.
- 매월 월 넘김 때 고용 인력의 경험치와 충성도가 갱신된다.
- 프로젝트에 배치된 인력은 더 많은 경험치를 얻고 에너지가 더 줄어든다.
- 경험치가 기준치를 넘으면 레벨업하며, 레벨 보너스가 유효 능력치에 반영된다.
- 계약 압박, 현금 부족, 과로가 충성도를 낮추고 이직 위험 경고를 만든다.
- 에이전트 카드에 경험치 바, 충성도, 성장 보너스, 월 유지비/계약 배지를 표시했다.

## 하네스 에이전트 검토

- Executive Producer Agent: P1 해결. 고용 이후에도 플레이어가 인력을 계속 살펴볼 이유가 생겼다.
- Game Designer Agent: P1 해결. 프로젝트 배치가 성장과 에너지 소모를 동시에 만들며 운영 판단을 요구한다.
- Systems Architect Agent: P1 해결. 경력 상태와 이직 경고는 `getAgentCareerStatus`, `getAgentRetentionAlerts`로 분리해 UI가 계산식을 직접 알 필요가 없다.
- Balance Agent: P2 관찰. 레벨업 보너스는 모든 능력치 +1씩 누적되므로 장기 런에서 강력해질 수 있다. 실제 퇴사/휴식 액션을 넣을 때 성장 속도 재검증이 필요하다.
- UX Agent: P1 해결. 카드 안에서 경험치, 충성도, 유지비가 함께 보여 직원 상태를 읽기 쉬워졌다.
- Solo Dev Scope Agent: P2 양호. 실제 퇴사 이벤트는 아직 넣지 않고 경고 레이어까지만 구현해 범위를 조절했다.

## 남은 작업

- 충성도 회복용 연봉 협상/휴식 액션.
- 충성도가 낮을 때 실제 퇴사 또는 계약 재협상 이벤트.
- 직원별 성장 방향 특화와 역할별 레벨업 보너스 차등.
- 20인 페르소나 테스트에서 에이전트 카드 정보량 재검증.

## 검증 결과

- `npm test -- src/game/staff-career.test.ts src/ui/layout-contract.test.ts` 통과, 2 files / 28 tests
- `npm test -- src/game/staff-career.test.ts src/game/simulation.test.ts src/ui/layout-contract.test.ts` 통과, 3 files / 57 tests
- `npm run harness:gate` 통과, 38 files / 242 tests
- 데이터 검증 통과
- 프로덕션 빌드 통과
- Headless Chrome QA: `http://127.0.0.1:5191/`에서 고용 후 경험치 바 1개, 충성도 배지 1개, 콘솔 오류 0건 확인
- 스크린샷: `/tmp/ai-company-v0344-staff-career-desktop.png`, `/tmp/ai-company-v0344-staff-career-mobile.png`
