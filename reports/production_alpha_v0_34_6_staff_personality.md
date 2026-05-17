# v0.34.6-alpha 제작 보고서 — 직원 성격과 선호 장비 보너스

작성일: 2026-05-18

## 목표

v0.34.5에서 직원 케어와 퇴사 리스크가 들어갔지만, 직원별 개성은 아직 설명 데이터에 가까웠다. 이번 패스는 직원의 성격, 성장 방향, 선호 장비를 실제 능력치와 충성도에 연결해 “누구에게 어떤 장비를 줄지”가 의미 있는 운영 선택이 되도록 만드는 것이다.

## 이번 구현

- `getAgentDevelopmentProfile()`을 추가해 직원별 성격 특성, 성장 집중 능력치, 선호 장비, 매칭된 선호 장비를 계산한다.
- 성장 집중 능력치는 해당 직원의 기본 능력치 상위 2개를 기준으로 정한다.
- 선호 장비를 장착하면 성장 집중 능력치 2개에 추가 보너스가 붙는다.
- 선호 장비를 장착한 직원은 월간 충성도도 소폭 더 안정된다.
- 에이전트 카드에 성격 특성, 성장 방향, 선호 장비 목록, 매칭된 장비 표시를 추가했다.

## 하네스 에이전트 검토

- Executive Producer Agent: P2 해결. 직원 관리가 휴식/연봉을 넘어 장비 선택과 장기 애착으로 이어진다.
- Game Designer Agent: P1 해결. “좋은 장비를 아무나 주는 것”보다 “맞는 직원에게 주는 것”이 더 효율적인 선택이 됐다.
- Systems Architect Agent: P1 해결. 프로필 계산을 `getAgentDevelopmentProfile()`에 모아 UI가 성장 규칙을 직접 알 필요가 없다.
- QA Agent: P1 해결. 프로필 표시, 선호 장비 능력치 보너스, 월간 충성도 보너스를 테스트로 고정했다.
- Balance Agent: P2 관찰. 선호 장비 보너스는 현재 장비 1개당 주 능력치 +1, 충성도 +1이다. 장비 풀이 늘어나면 상한 재검토가 필요하다.
- UX Agent: P2 해결. 선호 장비 매칭이 카드 안에서 녹색 배지로 보이므로 어떤 장비를 줘야 하는지 더 빨리 읽힌다.
- Retention / LTV Agent: P2 양호. 특정 직원을 키우고 장비를 맞춰 주는 소유감이 생겼다.
- Solo Dev Scope Agent: P2 양호. 새 데이터 파일을 만들지 않고 기존 `preferred_items`, `stats`, `quirk` 데이터를 재사용했다.

## 남은 작업

- 직원별 장기 성장 분기와 역할 특화 이벤트.
- 선호 장비를 자동 추천하는 상점/인벤토리 정렬.
- 스카우트 제안, 번아웃, 불만 팝업 같은 직원 드라마 이벤트.
- 20인 페르소나 테스트에서 카드 정보량과 이해도를 재검증.

## 최종 검증 기록

- `npm test -- src/game/staff-career.test.ts src/ui/layout-contract.test.ts` 통과, 2 files / 36 tests
- `npm test -- src/game/staff-career.test.ts src/game/simulation.test.ts src/ui/layout-contract.test.ts` 통과, 3 files / 65 tests
- `npm run harness:gate` 통과, 38 files / 250 tests
- 데이터 검증 통과
- 프로덕션 빌드 통과
- Headless Chrome QA: `http://127.0.0.1:5193/?scenario=staffing&menu=agents`에서 성격 패널 2개, 선호 장비 패널 2개, 콘솔 오류 0건, 모바일 가로 오버플로 없음 확인
- 스크린샷: `/tmp/ai-company-v0346-staff-personality-desktop.png`, `/tmp/ai-company-v0346-staff-personality-mobile.png`
