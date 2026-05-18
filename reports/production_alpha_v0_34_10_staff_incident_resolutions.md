# v0.34.10-alpha 제작 보고서 — 인사 사건 선택형 대응

작성일: 2026-05-18

## 목표

v0.34.9에서 인사 사건은 보였지만 플레이어의 선택지는 아직 단순했다. 이번 목표는 번아웃, 스카우트 제안, 계약 불만을 각각 작은 의사결정으로 바꾸는 것이다. 같은 사건이라도 돈으로 빠르게 해결할지, 비용을 아끼고 약한 효과를 받을지, 프로젝트 배치를 잠시 포기할지 선택하게 만든다.

## 이번 구현

- `getStaffIncidentResolutionOptions()`를 추가해 사건별 대응 선택지 2개를 계산한다.
- `getStaffIncidentResolutionCheck()`로 선택 가능 여부와 부족 자원 이유를 분리했다.
- `resolveStaffIncident()`가 대응 결과를 실제 게임 상태에 반영한다.
- 번아웃 대응은 `회복일 지정`과 `백업 교대`로 나뉜다.
- 스카우트 대응은 `리텐션 보너스`와 `창업 미션 설득`으로 나뉜다.
- 계약 불만 대응은 `조건 재조정`과 `1:1 면담`으로 나뉜다.
- `회복일 지정`은 직원 체력/충성도를 크게 회복시키는 대신 프로젝트 배치를 해제한다.
- `리텐션 보너스`와 `조건 재조정`은 충성도를 회복하지만 장기 연봉 압박을 올린다.
- `창업 미션 설득`과 `1:1 면담`은 비용 없이 약한 충성도 회복과 작은 자원 보상을 준다.
- 에이전트 콘솔의 사건 카드에 2버튼 선택 UI와 효과 문구를 표시했다.

## 하네스 에이전트 검토

- Executive Producer Agent: P2 해결. 직원 사건이 단순 경고에서 선택과 결과가 있는 월간 운영 이벤트로 발전했다.
- Game Designer Agent: P1 해결. 같은 인사 문제도 현금, 일정, 장기 연봉 압박 사이에서 갈등이 생긴다.
- Systems Architect Agent: P2 양호. UI는 선택지를 읽고 실행만 하며, 선택지 계산과 적용은 시뮬레이션 레이어에 있다.
- QA Agent: P1 해결. 선택지 수, 번아웃 회복일, 스카우트 리텐션 보너스 결과를 테스트로 고정했다.
- Balance Agent: P2 관찰. 리텐션 보너스의 장기 유지비 상승은 의미 있지만, 후속 장기 시뮬레이션에서 과도한 급여 스노우볼 여부를 봐야 한다.
- UX Agent: P2 양호. 버튼 안에 효과 요약을 넣어 눌렀을 때 무엇이 바뀌는지 바로 알 수 있게 했다.
- Retention / LTV Agent: P2 양호. 키운 직원에게 사건과 해결 기록이 남아 장기 애착을 만든다.
- Shareability Agent: P3 대기. 아직 전용 사건 팝업은 없어서 스크린샷 순간은 약하다. 다음 버전에서 결과 카드가 필요하다.
- Solo Dev Scope Agent: P2 양호. 새 대형 팝업 시스템 없이 기존 사건 패널에 선택지를 붙여 체감을 먼저 올렸다.

## 남은 작업

- 인사 사건 대응 결과를 짧은 팝업으로 보여주기.
- 스카우트 제안을 특정 경쟁사 이름, 산업, 조건과 연결하기.
- 사건 대응 후 직원 카드에 최근 사건 기록을 남기기.
- 사건 결과를 회사 기록의 공유 가능한 하이라이트 카드로 연결하기.
- 20인 페르소나 테스트에서 인사 사건 선택지가 처음 5분 안에 이해되는지 재검증하기.

## 최종 검증 기록

- `npm test -- src/game/staff-career.test.ts` 통과, 1 file / 20 tests
- `npm test -- src/ui/layout-contract.test.ts` 통과, 1 file / 25 tests
- `npm test -- src/game/staff-career.test.ts src/game/qa-scenarios.test.ts src/ui/layout-contract.test.ts` 통과, 3 files / 75 tests
- `npm run harness:gate` 통과, 38 files / 262 tests
- 데이터 검증 통과
- 프로덕션 빌드 통과
- Browser QA: `http://127.0.0.1:5197/?scenario=staff-incidents&menu=agents`에서 인사 사건 패널 1개, 사건 카드 3개, 선택 버튼 6개, 콘솔 오류 0건 확인
- 데스크톱 QA: 1280px 폭에서 가로 오버플로 없음 확인
- 모바일 QA: 390×844에서 선택 버튼 6개, 하단 탭 표시, 가로 오버플로 없음 확인
- QA 관찰 텍스트: `리텐션 보너스`, `창업 미션 설득`, `회복일 지정`, `백업 교대`, `조건 재조정`, `1:1 면담`
- 스크린샷: `/tmp/ai-company-v03410-staff-incident-resolutions-desktop.png`, `/tmp/ai-company-v03410-staff-incident-resolutions-mobile.png`
