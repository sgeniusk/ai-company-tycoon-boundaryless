# v0.34.7-alpha 제작 보고서 — 직원 장기 성장 전문화

작성일: 2026-05-18

## 목표

v0.34.6에서 직원 성격과 선호 장비가 들어갔지만, 레벨업 이후의 장기 선택은 아직 약했다. 이번 패스는 Lv.3부터 직원이 자신의 성장 방향 중 하나를 전문화로 선택하고, 그 선택이 실제 능력치 보너스로 이어지게 만드는 것이다.

## 이번 구현

- `getAgentSpecializationOptions()`를 추가해 직원별 전문화 후보 2개를 자동 생성한다.
- 전문화 후보는 해당 직원의 기본 능력치 상위 2개를 기준으로 한다.
- Lv.3 미만 직원은 전문화가 잠겨 있고, 카드에 잠긴 버튼으로 표시된다.
- `chooseAgentSpecialization()`을 추가해 전문화 선택을 직원 데이터에 저장한다.
- 전문화를 선택하면 해당 능력치에 집중 보너스가 붙는다.
- 전문화는 한 번 선택하면 바꿀 수 없게 했다.
- 에이전트 카드에 전문화 패널과 선택 버튼을 추가했다.

## 하네스 에이전트 검토

- Executive Producer Agent: P2 해결. 직원 육성이 단순 레벨업에서 장기 선택으로 한 단계 깊어졌다.
- Game Designer Agent: P1 해결. 상위 성장 방향 2개 중 하나를 고르는 방식이라 직원 정체성과 연결된다.
- Systems Architect Agent: P1 해결. 전문화 옵션, 체크, 실행을 `getAgentSpecializationOptions`, `getAgentSpecializationCheck`, `chooseAgentSpecialization`로 분리했다.
- QA Agent: P1 해결. Lv.3 잠금, 전문화 선택, 능력치 보너스, 재선택 방지를 테스트로 고정했다.
- Balance Agent: P2 관찰. 현재 보너스는 기본 +2, Lv.6 이상 +3이다. 장비/레벨 보너스와 합쳐질 때 장기 밸런스를 다시 봐야 한다.
- UX Agent: P2 해결. 카드 안에서 잠금 상태와 선택 버튼이 보인다. 다만 카드가 점점 길어지고 있어 다음 UI 압축 패스가 필요하다.
- Retention / LTV Agent: P2 양호. 특정 직원을 계속 키워 Lv.3을 찍고 전문화를 고르는 목표가 생겼다.
- Solo Dev Scope Agent: P2 양호. 새 대형 데이터 테이블 없이 기존 능력치에서 후보를 생성해 유지 부담을 낮췄다.

## 남은 작업

- 스카우트 제안, 번아웃, 불만 이벤트 같은 직원 드라마.
- 전문화 선택 후 작은 연출이나 타임라인 하이라이트.
- 상점에서 전문화/선호 장비 기준 자동 추천.
- 카드 높이 압축과 20인 페르소나 재검증.

## 최종 검증 기록

- `npm test -- src/game/staff-career.test.ts src/ui/layout-contract.test.ts` 통과, 2 files / 39 tests
- `npm test -- src/game/staff-career.test.ts src/game/simulation.test.ts src/ui/layout-contract.test.ts` 통과, 3 files / 68 tests
- `npm run harness:gate` 통과, 38 files / 253 tests
- 데이터 검증 통과
- 프로덕션 빌드 통과
- Headless Chrome QA: `http://127.0.0.1:5194/?scenario=staffing&menu=agents`에서 전문화 패널 2개, 콘솔 오류 0건, 모바일 가로 오버플로 없음 확인
- 스크린샷: `/tmp/ai-company-v0347-staff-specialization-desktop.png`, `/tmp/ai-company-v0347-staff-specialization-mobile.png`
